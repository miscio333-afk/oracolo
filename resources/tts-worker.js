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

// Dimensione attesa dei file locali: se un file OPFS ha una dimensione diversa
// è corrotto (es. scrittura interrotta da un vecchio timeout) e va riscaricato.
var EXPECTED_SIZES = {};
EXPECTED_SIZES[OPFS_MODEL_NAME] = 28130791;
EXPECTED_SIZES[OPFS_MODEL_JSON_NAME] = 4161;

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

async function removeOpfs(name) {
    try {
        const root = await navigator.storage.getDirectory();
        const dir = await root.getDirectoryHandle(OPFS_DIR);
        const file = await dir.getFileHandle(name);
        await file.remove();
    } catch (e) { /* file assente: ok */ }
}

// Cancella tutte le voci modello/config da OPFS (per auto-riparazione).
async function clearModelOpfs() {
    await removeOpfs(OPFS_MODEL_NAME);
    await removeOpfs(OPFS_MODEL_JSON_NAME);
}

// Un file OPFS è valido solo se esiste E ha la dimensione attesa.
async function readValidOpfs(name) {
    const f = await readOpfs(name);
    if (!f) return null;
    const expected = EXPECTED_SIZES[name];
    if (expected && f.size !== expected) {
        console.warn('[tts-worker] file OPFS corrotto, rimuovo:', name, f.size, 'atteso', expected);
        await removeOpfs(name);
        return null;
    }
    return f;
}

// Scarica modello+config dal nostro dominio in OPFS se assenti o corrotti.
// Ritorna true se il modello è disponibile localmente.
async function ensureModelLocal() {
    const model = await readValidOpfs(OPFS_MODEL_NAME);
    const cfg = await readValidOpfs(OPFS_MODEL_JSON_NAME);
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

    // Warm-up: pre-scarica il modello in OPFS e pre-carica il modulo vits-web
    // (che include piper_phonemize.data ~18MB e onnxruntime) così il primo
    // click sul bottone audio trova tutto già pronto.
    if (data.type === 'warmup') {
        console.log('[tts-worker] warmup start');
        try {
            const ok = await ensureModelLocal();
            const tts = await import('https://cdn.jsdelivr.net/npm/@diffusionstudio/vits-web@1.0.3/+esm');
            console.log('[tts-worker] warmup done ok=' + ok + ' module=' + (tts && typeof tts.predict === 'function'));
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

    // Heartbeat: il main thread resetta lo stall timeout su ogni heartbeat,
    // così un primo click lento (caricamento piper/onnxruntime + inferenza)
    // non viene scambiato per un blocco. Inviamo un tick ogni 5s.
    const heartbeat = setInterval(function () {
        self.postMessage({ type: 'heartbeat' });
    }, 5000);

    // Prova a generare l'audio. `attempt` permette di ritentare una volta dopo
    // l'auto-riparazione dell'OPFS (modello corrotto → crash numerico WASM).
    async function runPredict(attempt) {
        // Garantisce modello+config locali in OPFS PRIMA di chiamare predict.
        await ensureModelLocal();

        const tts = await import('https://cdn.jsdelivr.net/npm/@diffusionstudio/vits-web@1.0.3/+esm');
        if (!tts || typeof tts.predict !== 'function') {
            throw new Error('modulo vits-web non disponibile');
        }

        // PATH_MAP non serve più: modello+config sono già in OPFS con i nomi
        // che predict() cerca (chiave = ultimo segmento dell'URL HF).
        return await tts.predict(
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
    }

    // Un errore emscripten/WASM arriva spesso come valore numerico (un
    // indirizzo/puntatore): è il segnale che il modello in OPFS è corrotto.
    function isNumericError(err) {
        return (typeof err === 'number') ||
            (typeof err === 'string' && /^\d+$/.test(err.trim())) ||
            (err && typeof err.message === 'string' && /^\d+$/.test(err.message.trim())) ||
            (err && typeof err.message === 'number');
    }

    try {
        let blob;
        try {
            blob = await runPredict(1);
        } catch (err) {
            // Primo errore: se sembra un crash numerico (modello corrotto),
            // cancella OPFS e ritenta una volta con un download pulito.
            if (isNumericError(err)) {
                console.warn('[tts-worker] crash numerico, auto-riparazione OPFS:', err);
                await clearModelOpfs();
                blob = await runPredict(2);
            } else {
                throw err;
            }
        }

        clearInterval(heartbeat);

        if (!(blob instanceof Blob) || blob.size === 0) {
            throw new Error('audio vuoto');
        }

        // Trasferisci l'audio come ArrayBuffer: il main thread ricostruisce il
        // Blob, evitando problemi di `instanceof Blob` cross-realm (worker→main).
        const buffer = await blob.arrayBuffer();
        self.postMessage(
            { type: 'result', buffer: buffer, mime: blob.type || 'audio/wav' },
            [buffer]
        );
    } catch (err) {
        clearInterval(heartbeat);
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
