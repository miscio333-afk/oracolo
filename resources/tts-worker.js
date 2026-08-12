// Oracolo di Belline — TTS Web Worker (Piper via @diffusionstudio/vits-web).
// Esegue il TTS fuori dal main thread così la pagina non si congela mai
// durante il download del modello, la creazione della sessione ONNX e
// l'inferenza. Il modello viene cacheato nell'Origin Private File System.
// Caricato come module worker da belline-common.js.

// Onnxruntime-web usa i thread WASM (SharedArrayBuffer) quando
// navigator.hardwareConcurrency > 1. In alcuni browser (es. Safari) e in un
// worker questi thread crashano con errori emscripten numerici. Forziamo
// numThreads=1: l'audio è breve e la qualità non cambia, ma funziona ovunque.
(function () {
    try {
        const proto = Object.getPrototypeOf(navigator);
        const d = Object.getOwnPropertyDescriptor(proto, 'hardwareConcurrency');
        if (d && d.configurable) {
            Object.defineProperty(proto, 'hardwareConcurrency', { get: function () { return 1; } });
        }
    } catch (e) { /* se l'override fallisce si usa il valore di default */ }
})();

// Modello ospitato sul NOSTRO dominio (Vercel, same-origin): il download è
// veloce e non dipende da huggingface.co. Il worker lo copia in OPFS con i
// nomi esatti che vits-web cerca (ultimo segmento dell'URL HF), così
// predict() trova tutto in cache e non effettua alcuna fetch esterna.
var MODEL_URL = function () {
    return new URL('models/it_IT-riccardo-x_low.onnx', self.location.href).href;
};
var MODEL_JSON_URL = function () {
    return new URL('models/it_IT-riccardo-x_low.onnx.json', self.location.href).href;
};

// Nome chiave OPFS = ultimo segmento dell'URL HF che vits-web userà.
var OPFS_MODEL_NAME = 'it_IT-riccardo-x_low.onnx';
var OPFS_MODEL_JSON_NAME = 'it_IT-riccardo-x_low.onnx.json';
var OPFS_DIR = 'piper';

function report(percent) {
    self.postMessage({ type: 'progress', loaded: percent, total: 100, percent: percent });
}

async function writeOpfs(name, blob) {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle(OPFS_DIR, { create: true });
    const file = await dir.getFileHandle(name, { create: true });
    const writable = await file.createWritable();
    await writable.write(blob);
    await writable.close();
}

async function readOpfs(name) {
    try {
        const root = await navigator.storage.getDirectory();
        const dir = await root.getDirectoryHandle(OPFS_DIR);
        const file = await dir.getFileHandle(name);
        return await file.getFile();
    } catch (e) {
        return null;
    }
}

// Scarica modello+config dal nostro dominio in OPFS se assenti.
// Ritorna true se il modello è disponibile localmente.
async function ensureModelLocal() {
    const model = await readOpfs(OPFS_MODEL_NAME);
    const cfg = await readOpfs(OPFS_MODEL_JSON_NAME);
    if (model && cfg) return true;

    report(0);

    if (!cfg) {
        const resp = await fetch(MODEL_JSON_URL());
        if (!resp.ok) throw new Error('config modello non disponibile (' + resp.status + ')');
        const blob = await resp.blob();
        await writeOpfs(OPFS_MODEL_JSON_NAME, blob);
        report(15);
    }

    if (!model) {
        const resp = await fetch(MODEL_URL());
        if (!resp.ok) throw new Error('modello non disponibile (' + resp.status + ')');
        const contentLength = Number(resp.headers.get('Content-Length') || 0);
        const reader = resp.body && resp.body.getReader();
        if (!reader) {
            const blob = await resp.blob();
            await writeOpfs(OPFS_MODEL_NAME, blob);
            report(100);
        } else {
            const chunks = [];
            let received = 0;
            for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                received += value.length;
                if (contentLength > 0) {
                    report(Math.min(90, Math.round(15 + (received / contentLength) * 75)));
                }
            }
            const blob = new Blob(chunks, { type: 'application/octet-stream' });
            await writeOpfs(OPFS_MODEL_NAME, blob);
            report(100);
        }
    }

    return true;
}

self.onmessage = async function (e) {
    const data = e.data || {};

    // Warm-up: pre-scarica il modello in OPFS senza generare audio.
    if (data.type === 'warmup') {
        console.log('[tts-worker] warmup start');
        try {
            const ok = await ensureModelLocal();
            console.log('[tts-worker] warmup done ok=' + ok);
            self.postMessage({ type: 'warmup-ready' });
        } catch (err) {
            console.warn('[tts-worker] warmup error', err);
            self.postMessage({
                type: 'error',
                name: (err && err.name) || 'Error',
                message: String((err && err.message) || err),
                stack: (err && err.stack) ? String(err.stack) : ''
            });
        }
        return;
    }

    const text = String(data.text || '').trim();
    const voiceId = String(data.voiceId || 'it_IT-riccardo-x_low');
    if (!text) {
        self.postMessage({ type: 'error', name: 'Error', message: 'testo mancante' });
        return;
    }

    try {
        // Garantisce modello+config locali in OPFS PRIMA di chiamare predict.
        await ensureModelLocal();

        const tts = await import('https://cdn.jsdelivr.net/npm/@diffusionstudio/vits-web@1.0.3/+esm');
        if (!tts || typeof tts.predict !== 'function') {
            self.postMessage({ type: 'error', name: 'Error', message: 'modulo vits-web non disponibile' });
            return;
        }

        // PATH_MAP non serve più: modello+config sono già in OPFS con i nomi
        // che predict() cerca (chiave = ultimo segmento dell'URL HF).
        const blob = await tts.predict(
            { text: text, voiceId: voiceId },
            function (p) {
                if (p && typeof p.loaded === 'number' && typeof p.total === 'number' && p.total > 0) {
                    self.postMessage({
                        type: 'progress',
                        loaded: p.loaded,
                        total: p.total,
                        percent: Math.min(100, Math.round((p.loaded / p.total) * 100))
                    });
                }
            }
        );

        if (!(blob instanceof Blob) || blob.size === 0) {
            self.postMessage({ type: 'error', name: 'Error', message: 'audio vuoto' });
            return;
        }

        // Trasferisci l'audio come ArrayBuffer: il main thread ricostruisce il
        // Blob, evitando problemi di `instanceof Blob` cross-realm (worker→main).
        const buffer = await blob.arrayBuffer();
        self.postMessage(
            { type: 'result', buffer: buffer, mime: blob.type || 'audio/wav' },
            [buffer]
        );
    } catch (err) {
        self.postMessage({
            type: 'error',
            name: (err && err.name) || 'Error',
            message: String((err && err.message) || err),
            stack: (err && err.stack) ? String(err.stack) : ''
        });
    }
};

// Cattura gli errori emscripten/WebAssembly che possono lanciare valori numerici
// (es. crash di allocazione memoria) e li inoltra con il massimo dettaglio.
self.addEventListener('unhandledrejection', function (ev) {
    const r = ev && ev.reason;
    self.postMessage({
        type: 'error',
        name: (r && r.name) || 'UnhandledRejection',
        message: String((r && r.message) || r),
        stack: (r && r.stack) ? String(r.stack) : '',
        reasonType: typeof r
    });
    ev.preventDefault();
});

self.addEventListener('error', function (ev) {
    self.postMessage({
        type: 'error',
        name: 'WorkerError',
        message: String((ev && ev.message) || 'errore worker'),
        filename: ev && ev.filename,
        lineno: ev && ev.lineno,
        colno: ev && ev.colno,
        stack: ''
    });
    ev.preventDefault();
});
