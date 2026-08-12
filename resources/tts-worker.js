// Oracolo di Belline — TTS Web Worker (Piper via @diffusionstudio/vits-web).
// Esegue il TTS fuori dal main thread così la pagina non si congela mai
// durante il download del modello, la creazione della sessione ONNX e
// l'inferenza. Il modello viene cacheato nell'Origin Private File System.
// Caricato come module worker da belline-common.js.

self.onmessage = async function (e) {
    const data = e.data || {};
    const text = String(data.text || '').trim();
    const voiceId = String(data.voiceId || 'it_IT-riccardo-x_low');
    if (!text) {
        self.postMessage({ type: 'error', message: 'testo mancante' });
        return;
    }

    try {
        const tts = await import('https://cdn.jsdelivr.net/npm/@diffusionstudio/vits-web@1.0.3/+esm');
        if (!tts || typeof tts.predict !== 'function') {
            self.postMessage({ type: 'error', message: 'modulo vits-web non disponibile' });
            return;
        }

        const path = data.modelPath;
        if (tts.PATH_MAP && path && !tts.PATH_MAP[voiceId]) {
            tts.PATH_MAP[voiceId] = path;
        }

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
            self.postMessage({ type: 'error', message: 'audio vuoto' });
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
