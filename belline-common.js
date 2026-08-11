// Oracolo di Belline — LOGICA CONDIVISA tra le tre stese (stesa, narrativa, natale).
// Dipende da belline.js (dati su window.belline*).
// Le singole pagine definiscono hook a finestra (window.belline*):
//   - window.bellineReadCount()        -> numero di carte da estrarre (default 3)
//   - window.bellineIncludeBlue()      -> includere la Carta Blu? (default false)
//   - window.bellinePreflight()        -> stringa di errore se mancano parametri, altrimenti null
//   - window.bellineCustomStatusHint() -> hint personalizzato del proprio setup (opzionale)
//   - window.buildBellineAIPrompt()    -> prompt per l'AI della propria stesa (opzionale)
//   - window.bellineSexValue()         -> sesso selezionato ('male'|'female'|null) su narrativa (opzionale)
//   - window.bellineSexLabel()         -> etichetta leggibile del sesso (opzionale)

// Stato globale della stesa in corso
let bellineDrawn = [];
let bellineDeckCache = [];
let bellineQuestionAmbito = null;
let bellineGeneratedQuestions = [];
let bellineActiveAmbito = null;
// Il messaggio generale si rivela solo a carte scoperte (giro dell'ultima)
let bellineAdviceGate = false;

// Tipo di stesa corrente, impostato dalla singola pagina: 'free' | 'narrative'
let bellineMode = 'free';
// Carta Natale selezionata (pagina natale o narrativa)
let bellineNatalSelected = null;
// Sesso del consultante sulla stesa narrativa: 'male' | 'female' | null
let bellineSex = null;

// Particle system self-contained (p5.js caricato nella pagina)
function initializeBellineParticles() {
    const particleContainer = document.getElementById('particles');
    if (!particleContainer || typeof p5 === 'undefined') return;

    // Rispetta la riduzione del movimento: nessuna animazione
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    new p5(function (p) {
        const particles = [];
        const sparks = [];
        let lastSparkX = -9999;
        let lastSparkY = -9999;

        // Scia di scintille che segue il cursore (o il dito su touch)
        function spawnSpark(x, y) {
            if (sparks.length > 140) sparks.shift();
            for (let i = 0; i < 3; i++) {
                sparks.push({
                    x: x + p.random(-7, 7),
                    y: y + p.random(-7, 7),
                    vx: p.random(-0.6, 0.6),
                    vy: p.random(-1.6, -0.5),
                    life: 1,
                    decay: p.random(0.018, 0.03),
                    size: p.random(2, 5),
                    gold: p.random() < 0.35
                });
            }
        }

        window.addEventListener('mousemove', function (e) {
            const dx = e.clientX - lastSparkX;
            const dy = e.clientY - lastSparkY;
            if (dx * dx + dy * dy < 100) return;
            lastSparkX = e.clientX;
            lastSparkY = e.clientY;
            spawnSpark(e.clientX, e.clientY);
        });
        window.addEventListener('touchmove', function (e) {
            const t = e.touches && e.touches[0];
            if (!t) return;
            const dx = t.clientX - lastSparkX;
            const dy = t.clientY - lastSparkY;
            if (dx * dx + dy * dy < 120) return;
            lastSparkX = t.clientX;
            lastSparkY = t.clientY;
            spawnSpark(t.clientX, t.clientY);
        }, { passive: true });

        p.setup = function () {
            const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
            canvas.parent('particles');
            // Hook condiviso: permette a qualsiasi pagina di sparare scintille (es. titolo)
            window.bellineSpawnSpark = spawnSpark;
            // Polvere d'oro: numerosa, fine e scintillante
            for (let i = 0; i < 90; i++) {
                particles.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    vx: p.random(-0.25, 0.25),
                    vy: p.random(-0.25, 0.25),
                    baseAlpha: p.random(60, 160),
                    alpha: p.random(60, 160),
                    size: p.random(1, 3),
                    phase: p.random(p.TWO_PI)
                });
            }
        };

        p.draw = function () {
            p.clear();
            p.noStroke();
            particles.forEach(function (pt) {
                pt.x += pt.vx;
                pt.y += pt.vy;
                if (pt.x < 0) pt.x = p.width;
                if (pt.x > p.width) pt.x = 0;
                if (pt.y < 0) pt.y = p.height;
                if (pt.y > p.height) pt.y = 0;
                // Scintillio: pulsazione lenta dell'opacità
                pt.phase += 0.04;
                pt.alpha = pt.baseAlpha * (0.55 + 0.45 * p.sin(pt.phase));
                // Oro raffinato
                p.fill(212, 175, 55, pt.alpha);
                p.ellipse(pt.x, pt.y, pt.size);
            });

            // Scintille: con alone luminoso per farle brillare sul video
            for (let i = sparks.length - 1; i >= 0; i--) {
                const s = sparks[i];
                s.vy += 0.03;
                s.x += s.vx;
                s.y += s.vy;
                s.life -= s.decay;
                if (s.life <= 0) { sparks.splice(i, 1); continue; }
                const alpha = 230 * s.life;
                if (s.gold) {
                    p.fill(212, 175, 55, alpha * 0.3);
                    p.ellipse(s.x, s.y, (s.size * 3.2) * s.life + 3);
                    p.fill(212, 175, 55, alpha);
                } else {
                    p.fill(255, 225, 150, alpha * 0.3);
                    p.ellipse(s.x, s.y, (s.size * 3.2) * s.life + 3);
                    p.fill(255, 225, 150, alpha);
                }
                p.ellipse(s.x, s.y, s.size * s.life + 0.6);
            }
        };

        p.windowResized = function () {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        };
    });
}

// Alone luminoso morbido che segue il cursore (solo dispositivi con puntatore preciso)
function initializeMagicCursorHalo() {
    if (typeof document === 'undefined' || !document.body) return;
    // Riduzione del movimento: nessuna animazione
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Solo puntatore preciso (niente alone col dito)
    if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;

    const halo = document.createElement('div');
    halo.className = 'magic-halo';
    halo.style.cssText =
        'position:fixed;left:0;top:0;width:280px;height:280px;border-radius:50%;' +
        'pointer-events:none;z-index:40;opacity:0;will-change:transform,opacity;' +
        'transform:translate(-50%,-50%) translate3d(0,0,0);' +
        'mix-blend-mode:screen;' +
        'background:radial-gradient(circle, rgba(255,220,150,0.28) 0%, rgba(255,200,100,0.10) 45%, transparent 70%);';
    document.body.appendChild(halo);

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: target.x, y: target.y };

    let idleTimer = null;
    let visible = false;

    function show() {
        if (!visible) { halo.style.opacity = '1'; visible = true; }
    }

    window.addEventListener('mousemove', function (e) {
        target.x = e.clientX;
        target.y = e.clientY;
        show();
        clearTimeout(idleTimer);
        idleTimer = setTimeout(function () {
            halo.style.opacity = '0';
            visible = false;
        }, 1600);
    }, { passive: true });

    (function loop() {
        current.x += (target.x - current.x) * 0.12;
        current.y += (target.y - current.y) * 0.12;
        halo.style.transform = 'translate(-50%,-50%) translate3d(' + current.x + 'px,' + current.y + 'px,0)';
        requestAnimationFrame(loop);
    })();
}

// PRNG a 32 bit seedabile (mulberry32): genera la stessa sequenza dallo stesso seed
function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Hash 53 bit (cyrb53): trasforma i campioni di movimento in un seed stabile
function cyrb53(str, seed) {
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

// Costruisce (e mescola) il mazzo di Belline.
// Se viene passato un PRNG, lo usa per mescolare; altrimenti Math.random (fallback).
function getBellineShuffled(prng) {
    const includeBlue = window.bellineIncludeBlue ? window.bellineIncludeBlue() : false;
    const cards = window.getBellineCards(includeBlue);

    const rnd = typeof prng === 'function' ? prng : Math.random;
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
}

// Percorso immagine per una carta di Belline
function bellineImagePath(card) {
    if (card.num === null || card.num === undefined) return 'resources/belline/card_blue.webp';
    return `resources/belline/card_${String(card.num).padStart(2, '0')}.webp`;
}

// Rigira lo stato della stesa (hint sotto il mazzo)
function bellineCountHint() {
    const status = document.getElementById('belline-status');
    if (!status) return;

    // La pagina può fornire un hint completamente personalizzato
    if (window.bellineCustomStatusHint) {
        status.textContent = window.bellineCustomStatusHint() || '';
        return;
    }

    const count = (window.bellineReadCount ? window.bellineReadCount() : 0) || 3;
    const includeBlue = window.bellineIncludeBlue ? window.bellineIncludeBlue() : false;
    status.textContent = includeBlue
        ? `Mescola il mazzo (tieni premuto e muovi il cursore), poi rilascia per estrarre ${count} luci (con la Carta Blu)`
        : `Mescola il mazzo (tieni premuto e muovi il cursore), poi rilascia per estrarre ${count} luci`;
}

// Reset leggero: nasconde i risultati se l'utente cambia i parametri
function flexResetBelline() {
    bellineCountHint();
    if (bellineDrawn.length > 0) {
        bellineDrawn = [];
        stopBellineSpeech();
        setBellineSpeakEnabled(false);
        document.getElementById('belline-results').style.display = 'none';
        const status = document.getElementById('belline-status');
        status.textContent = 'Parametri aggiornati. Clicca di nuovo sul mazzo per estrarre le luci.';
    }
}

// ---- Rituale "Mescola il mazzo": entropia dai gesti dell'utente ----
const BELLINE_SHUFFLE_MIN_SAMPLES = 30;
let bellineShuffleSamples = [];
let bellineShufflePointer = null;
let bellineShuffleLast = null;
let bellineShuffleSeeded = null;

function bellineShuffleProgress() {
    return Math.min(100, Math.round((bellineShuffleSamples.length / BELLINE_SHUFFLE_MIN_SAMPLES) * 100));
}

function bellineShuffleUI(show) {
    const track = document.getElementById('belline-shuffle-track');
    if (track) track.style.display = show ? 'block' : 'none';
}

function bellineShuffleUpdate() {
    const pct = bellineShuffleProgress();
    const fill = document.getElementById('belline-shuffle-fill');
    if (fill) fill.style.width = pct + '%';
    const deck = document.getElementById('belline-deck');
    if (deck) deck.classList.add('shuffling');
    const status = document.getElementById('belline-status');
    if (status) {
        status.textContent = pct >= 100
            ? 'Perfetto, il mazzo è carico della tua energia!'
            : 'Mescola il mazzo… energia raccolta ' + pct + '%';
    }
}

function bellineShuffleStart(e) {
    if (bellineShufflePointer !== null) return;
    bellineShufflePointer = e.pointerId;
    bellineShuffleSamples = [];
    bellineShuffleLast = { x: e.clientX, y: e.clientY, t: performance.now() };
    const deck = document.getElementById('belline-deck');
    if (deck && deck.setPointerCapture) {
        try { deck.setPointerCapture(e.pointerId); } catch (_) {}
    }
    bellineShuffleUI(true);
    bellineShuffleUpdate();
}

function bellineShuffleCollect(e) {
    if (bellineShufflePointer !== e.pointerId || !bellineShuffleLast) return;
    const now = performance.now();
    const dx = e.clientX - bellineShuffleLast.x;
    const dy = e.clientY - bellineShuffleLast.y;
    const dt = now - bellineShuffleLast.t;
    bellineShuffleLast = { x: e.clientX, y: e.clientY, t: now };
    // Ignora il jitter del click: conta solo il movimento reale
    if (Math.abs(dx) + Math.abs(dy) < 2 || dt < 6) return;
    bellineShuffleSamples.push({ dx, dy, dt, t: now });
    bellineShuffleUpdate();
}

function bellineShuffleFinish(e) {
    if (bellineShufflePointer !== e.pointerId) return;
    const deck = document.getElementById('belline-deck');
    if (deck && deck.hasPointerCapture && deck.hasPointerCapture(e.pointerId)) {
        try { deck.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    const samples = bellineShuffleSamples;
    bellineShufflePointer = null;
    bellineShuffleSamples = [];
    bellineShuffleLast = null;

    let seedStr = samples.map(s => s.dx + ',' + s.dy + ',' + s.dt + ',' + s.t).join('|');
    let source;
    if (samples.length >= BELLINE_SHUFFLE_MIN_SAMPLES) {
        source = 'user';
    } else {
        // Fallback progressivo: anche una mescolata parziale pesa, poi tempo+crypto
        let cryptoEntropy = 0;
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            cryptoEntropy = crypto.getRandomValues(new Uint32Array(2))[0];
        }
        seedStr += '|fallback:' + performance.now() + ':' + Math.random() + ':' + cryptoEntropy;
        source = samples.length > 0 ? 'partial' : 'none';
    }
    const seed = cyrb53(seedStr);
    bellineShuffleSeeded = { prng: mulberry32(seed), source };

    const status = document.getElementById('belline-status');
    if (status && source !== 'none') {
        status.textContent = 'Energia raccolta: le luci sono tue.';
    }
    const deck2 = document.getElementById('belline-deck');
    if (deck2) deck2.classList.remove('shuffling');

    window.setTimeout(bellineShuffleUI, 400, false);
}

function bellineShuffleBind() {
    const deck = document.getElementById('belline-deck');
    if (!deck) return;
    deck.addEventListener('pointerdown', bellineShuffleStart);
    deck.addEventListener('pointermove', bellineShuffleCollect);
    deck.addEventListener('pointerup', bellineShuffleFinish);
    deck.addEventListener('pointercancel', bellineShuffleFinish);
    deck.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            startBellineReading();
        }
    });
}

function bellineResetShuffle() {
    bellineShufflePointer = null;
    bellineShuffleSamples = [];
    bellineShuffleLast = null;
    bellineShuffleSeeded = null;
    bellineShuffleUI(false);
}

// Avvia la lettura di Belline: preflight della pagina, poi estrazione
function startBellineReading() {
    const deckEl = document.getElementById('belline-deck');
    if (!deckEl) return;

    // Validazione della pagina (es. narrativa: data + sesso obbligatori)
    const preflight = (window.bellinePreflight && window.bellinePreflight()) || null;
    if (preflight) {
        const st = document.getElementById('belline-status');
        if (st) st.textContent = preflight;
        return;
    }

    // Usa il PRNG "caricato" dal rituale, se completato
    const prng = bellineShuffleSeeded ? bellineShuffleSeeded.prng : null;
    bellineResetShuffle();

    // Anima il mazzo
    if (typeof anime !== 'undefined') {
        anime({
            targets: '#belline-deck',
            rotate: [0, 360],
            scale: [1, 1.12, 1],
            duration: 900,
            easing: 'easeInOutQuart'
        });
    }

    const count = (window.bellineReadCount ? window.bellineReadCount() : 0) || 3;
    if (bellineMode === 'narrative') {
        const natal = bellineNatalSelected || bellineNatalCardFromInputs();
        if (natal) bellineNatalSelected = natal;
    }

    const queue = getBellineShuffled(prng);

    // Evita duplicati: pesca dal mazzo mescolato
    bellineDrawn = [];
    for (let i = 0; i < count && i < queue.length; i++) {
        bellineDrawn.push(queue[i]);
    }

    const status = document.getElementById('belline-status');
    if (status) status.textContent = 'Le luci si stanno rivelando...';

    setTimeout(renderBellineResults, 600);
}

// ---- Stesa con posizioni narrative (schema "Classico ferradura") ----
const BELLINE_POSITIONS = {
    1: [{ key: 'voce', title: 'La Tua Voce' }],
    3: [
        { key: 'passato', title: 'Passato' },
        { key: 'presente', title: 'Presente' },
        { key: 'futuro', title: 'Futuro' }
    ],
    7: [
        { key: 'passato', title: 'Passato' },
        { key: 'presente', title: 'Presente' },
        { key: 'nascosto', title: 'Nascosto' },
        { key: 'ostacolo', title: 'Ostacolo' },
        { key: 'influenze', title: 'Influenze' },
        { key: 'consiglio', title: 'Consiglio' },
        { key: 'esito', title: 'Esito' }
    ]
};

// Stesa libera: posizioni atemporali, per non ancorare la lettura
// a un passato/presente/futuro che nella Stesa Libera non esistono.
const BELLINE_FREE_POSITIONS = {
    1: [{ key: 'voce', title: 'La Tua Voce' }],
    3: [
        { key: 'prima', title: 'Prima Luce' },
        { key: 'seconda', title: 'Seconda Luce' },
        { key: 'terza', title: 'Terza Luce' }
    ],
    7: [
        { key: 'radice', title: 'Radice' },
        { key: 'cuore', title: 'Cuore' },
        { key: 'nascosto', title: 'Nascosto' },
        { key: 'ostacolo', title: 'Ostacolo' },
        { key: 'influenze', title: 'Influenze' },
        { key: 'consiglio', title: 'Consiglio' },
        { key: 'esito', title: 'Esito' }
    ]
};

function bellinePositionsFor(count) {
    const table = bellineMode === 'narrative' ? BELLINE_POSITIONS : BELLINE_FREE_POSITIONS;
    if (table[count]) return table[count];
    return table[count <= 3 ? 3 : 7] || [];
}

function bellinePositionTone(pol) {
    return {
        good: 'la forza è dalla tua parte',
        bad: 'l\'invito è alla prudenza',
        neutral: 'la scelta resta nelle tue mani'
    }[pol] || 'l\'equilibrio è la chiave';
}

// Un paragrafo narrativo per posizione: riusa meaning/advice/polarità della carta presente
function bellinePositionParagraph(pos, card) {
    if (card.num === null || card.num === undefined) {
        return `Alla posizione «${pos.title}» cade la Carta Blu: dissolve le ombre e protegge questo settore dalle difficoltà.`;
    }
    const first = (card.meaning || '').split('.')[0].trim();
    const sec = first ? first.charAt(0).toLowerCase() + first.slice(1) : 'il suo simbolo parla chiaro';
    const polPhrase = bellinePositionTone(window.bellinePolarityOf(card));
    const adv = window.bellineAdvice(card).trim();

    const frames = {
        voce: () => `${card.name} è la tua voce in questa lettura: ${sec}. ${polPhrase}, ${adv}`,
        passato: () => `Dal passato arriva ${card.name}: ${sec}. In quell'eco, ${polPhrase}.`,
        presente: () => `${card.name} governa il presente: ${sec}. Qui ${polPhrase}.`,
        futuro: () => `${card.name} apre la strada del futuro: ${sec}.`,
        prima: () => `${card.name} è la prima luce che si accende: ${sec}. ${polPhrase}, ${adv}`,
        seconda: () => `${card.name} guida la seconda luce: ${sec}. ${polPhrase}, ${adv}`,
        terza: () => `${card.name} compone la terza luce: ${sec}. ${polPhrase}.`,
        radice: () => `Alla radice della domanda sta ${card.name}: ${sec}. ${polPhrase}.`,
        cuore: () => `Nel cuore della stesa si muove ${card.name}: ${sec}. ${polPhrase}.`,
        nascosto: () => `Nel nascosto si muove ${card.name}: ${sec}. È una parte di te che chiede di essere ascoltata.`,
        ostacolo: () => `${card.name} segna l'ostacolo lungo il cammino: ${sec}. ${polPhrase}.`,
        influenze: () => `Le influenze attorno a te ruotano su ${card.name}: ${sec}.`,
        consiglio: () => `Il consiglio arriva da ${card.name}: ${sec}. ${adv}`,
        esito: () => `${card.name} compone l'esito: ${sec}. Resta aperto agli avvenimenti.`
    };
    const frame = frames[pos.key] || (() => `${pos.title}: ${card.name}. ${sec}.`);
    const out = frame();
    return out.endsWith('.') ? out : out + '.';
}

// Narrativa deterministica per posizione, nell'ordine delle carte estratte
function buildBellinePositionNarrative() {
    const positions = bellinePositionsFor(bellineDrawn.length);
    if (!positions.length) return [];
    return bellineDrawn.map((card, i) => {
        const pos = positions[i] || { key: 'settore', title: `Settore ${i + 1}` };
        return bellinePositionParagraph(pos, card);
    });
}

// Applica il titolo magico (shimmer + glow + scintille ✦ ai lati) a un heading.
// Preserva classi esistenti e aggiunge title-magic; testo in maiuscolo.
function applyBellineMagicHeading(heading, text) {
    if (!heading) return;
    heading.classList.add('title-magic');
    heading.innerHTML = '<span class="title-spark" aria-hidden="true">✦</span> ' +
        String(text).toUpperCase() +
        ' <span class="title-spark" aria-hidden="true">✦</span>';
}

// Il messaggio generale si svela solo quando TUTTE le carte della stesa
// sono state girate: prima di allora il box resta vuoto.
function bellineAllCardsRevealed() {
    const cards = document.querySelectorAll('#belline-grid .belline-card');
    return cards.length > 0
        && cards.length === bellineDrawn.length
        && Array.from(cards).every(c => c.dataset.revealed === '1');
}

function bellineTryRenderAdvice() {
    if (bellineAdviceGate || !bellineAllCardsRevealed()) return;
    bellineAdviceGate = true;
    renderBellineAdvice();
}

// Renderizza le carte estratte
function renderBellineResults() {
    const results = document.getElementById('belline-results');
    const grid = document.getElementById('belline-grid');
    if (!results || !grid) return;
    bellineAdviceGate = false;
    grid.innerHTML = '';
    // Azzera il pannello di follow-up: viene ricostruito a lettura completata
    const followup = document.getElementById('belline-followup');
    if (followup) {
        followup.innerHTML = '';
        followup.style.display = 'none';
    }

    // Heading e banner distintivi per la Stesa Narrativa
    const heading = results.querySelector('h2');
    const oldBanner = document.getElementById('belline-natal-banner');
    if (oldBanner) oldBanner.remove();
    if (bellineMode === 'narrative') {
        if (heading) applyBellineMagicHeading(heading, 'La Stesa Narrativa — Passato · Presente · Futuro');
        const natal = bellineNatalSelected || bellineNatalCardFromInputs();
        if (natal) {
            const banner = document.createElement('div');
            banner.id = 'belline-natal-banner';
            banner.className = 'natal-banner text-center mb-6';
            const serie = window.bellineSeriesName(natal.series);
            const sexLabel = window.bellineSexLabel ? window.bellineSexLabel() : '';
            const suffix = sexLabel ? ` · Sesso: ${sexLabel}` : '';
            banner.innerHTML = `La tua Luce di nascita: <strong>${natal.name}</strong><span class="text-sm"> (${serie})${suffix}</span>`;
            if (heading && heading.parentNode) {
                heading.parentNode.insertBefore(banner, heading.nextSibling);
            } else {
                results.insertBefore(banner, grid);
            }
        }
    } else if (heading) {
        applyBellineMagicHeading(heading, 'Le Luci Estratte');
    }

    const minimalCards = bellineMode === 'free';
    grid.className = minimalCards
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10'
        : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10';

    bellineDrawn.forEach((card, index) => {
        const positionName = (bellinePositionsFor(bellineDrawn.length)[index] || {}).title || `Carta ${index + 1}`;

        const wrap = document.createElement('div');
        wrap.className = minimalCards ? 'belline-grid-item min' : 'belline-grid-item';

        if (!minimalCards) {
            const badge = document.createElement('div');
            badge.className = 'position-badge';
            badge.textContent = positionName;
            wrap.appendChild(badge);
        }

        const cardEl = document.createElement('div');
        cardEl.className = 'belline-card flip-ready';
        cardEl.dataset.idx = index;
        // Suspense: il primo tocco scopre la carta, nessuna apertura della scheda
        cardEl.onclick = () => flipBellineCardOnClick(cardEl, card);

        // Flip 3D retro/fronte presente nel DOM fin dall'inizio: la carta entra
        // coperta (dorso) e il tocco la gira sul fronte. Nessuno swap di src.
        const size = minimalCards
            ? 'w-full h-64 sm:h-80 lg:h-96 object-cover'
            : 'w-full h-56 sm:h-64 lg:h-72 object-cover';

        const flip = document.createElement('div');
        flip.className = 'card-flip';

        const cardBack = document.createElement('img');
        cardBack.src = 'resources/belline/card_dorso.webp';
        cardBack.alt = 'Retro carta';
        cardBack.className = 'card-back ' + size;

        const cardFront = document.createElement('img');
        cardFront.src = window.bellineImagePath(card);
        cardFront.alt = card.name;
        cardFront.className = 'card-front ' + size;

        flip.appendChild(cardBack);
        flip.appendChild(cardFront);
        cardEl.appendChild(flip);

        if (!minimalCards) {
            const label = document.createElement('div');
            label.className = 'p-3 text-center card-label';
            label.innerHTML = `<span class="font-bold text-amber-200">Carta ${index + 1}</span>`;
            cardEl.appendChild(label);
        }

        const host = document.createElement('div');
        host.className = 'card-magic';
        host.appendChild(cardEl);
        wrap.appendChild(host);
        grid.appendChild(wrap);

        // Anima l'ingresso dopo un breve ritardo: la carta entra con un giro
        // completo e si posa coperta (sul dorso), per creare suspense.
        if (typeof anime !== 'undefined') {
            anime({
                targets: cardEl,
                opacity: [0, 1],
                translateY: [40, 0],
                delay: index * 160,
                duration: 500,
                easing: 'easeOutQuart'
            });
            anime({
                targets: flip,
                rotateY: 360,
                delay: index * 160,
                duration: 1100,
                easing: 'easeInOutQuart'
            });
        } else {
            flip.style.transform = 'rotateY(360deg)';
        }
    });

    results.style.display = 'block';
    results.scrollIntoView({ behavior: 'smooth' });

    attachBellineRowSweep(grid);
    if (bellineMode === 'free') {
        bellineDrawn.forEach((card, index) => {
            const wrap = grid.children[index];
            const cardEl = wrap ? wrap.querySelector('.belline-card') : null;
            attachBellineCardReflection(grid, card, cardEl);
        });
    }

    // Rete di sicurezza: il consiglio generale si rivela appena, e solo se,
    // la lettura ha tutte le carte scoperte (vedi bellineTryRenderAdvice)
    setTimeout(() => {
        bellineTryRenderAdvice();
    }, 700 + bellineDrawn.length * 160);
}

// Suspense: il primo tocco sulla carta coperta la gira e rivela il fronte.
// Un secondo tocco su una carta già scoperta apre la scheda di dettaglio.
function flipBellineCardOnClick(cardEl, card) {
    if (cardEl.dataset.revealed) {
        displayBellineCard(card);
        return;
    }
    if (!cardEl.querySelector('.card-flip')) {
        revealBellineCardFace(cardEl, card);
        bellineTryRenderAdvice();
        return;
    }
    const flip = cardEl.querySelector('.card-flip');
    if (flip && typeof anime !== 'undefined') {
        anime({
            targets: flip,
            rotateY: 180,
            duration: 600,
            easing: 'easeInOutQuart'
        });
    } else if (flip) {
        flip.style.transform = 'rotateY(180deg)';
    }
    revealBellineCardFace(cardEl, card);
    // Se quella appena girata è l'ultima coperta, il messaggio generale parte subito
    bellineTryRenderAdvice();
}

// Rivela il fronte della carta: etichetta, scintille, alone sul fronte e hint.
function revealBellineCardFace(container, card) {
    const label = container.querySelector('.card-label');

    const polarity = window.bellinePolarityOf(card);
    const polarityLabel = window.bellinePolarityLabel(polarity);
    const serieLabel = window.bellineSeriesName(card.series);

    if (label) {
        label.innerHTML = `
            <div class="text-sm font-bold card-name">${card.name}</div>
            <div class="text-xs mt-1 flex items-center justify-center gap-1">
                <span class="serie-chip polarity-${polarity}">${polarityLabel}</span>
            </div>
            <div class="text-[11px] text-gray-300 mt-1">${serieLabel}</div>
        `;
    }

    // L'alone riflesso passa dal dorso (carta coperta) al fronte della carta
    const host = container.closest('.card-magic');
    if (host) {
        const refImg = host.querySelector('.belline-card-reflection img');
        if (refImg) refImg.src = window.bellineImagePath(card);
    }

    attachBellineCardMagic(container);
    container.dataset.revealed = '1';
    container.classList.add('revealed');
    updateBellineCoverHint();
}

function updateBellineCoverHint() {
    const hint = document.getElementById('belline-cover-hint');
    if (!hint) return;
    const anyCovered = Array.from(document.querySelectorAll('#belline-grid .belline-card'))
        .some(c => !c.dataset.revealed);
    hint.style.display = anyCovered ? '' : 'none';
}

// Scintille magiche sulle carte estratte
function attachBellineCardMagic(cardEl) {
    const host = cardEl.closest('.card-magic');
    if (!host || host.querySelector('.card-sparkle')) return;

    const spots = [
        { x: 0.06, y: 0.06 }, { x: 0.50, y: 0.02 }, { x: 0.94, y: 0.08 },
        { x: 0.03, y: 0.45 }, { x: 0.97, y: 0.52 },
        { x: 0.08, y: 0.94 }, { x: 0.50, y: 0.98 }, { x: 0.92, y: 0.92 },
        { x: 0.20, y: 0.04 }, { x: 0.80, y: 0.04 },
        { x: 0.16, y: 0.96 }, { x: 0.84, y: 0.96 }
    ];
    spots.forEach((s, i) => {
        const sp = document.createElement('span');
        sp.className = 'card-sparkle';
        sp.setAttribute('aria-hidden', 'true');
        sp.style.left = `${(s.x + (Math.random() - 0.5) * 0.05) * 100}%`;
        sp.style.top = `${(s.y + (Math.random() - 0.5) * 0.05) * 100}%`;
        sp.style.animationDelay = `${((i * 0.21) % 2.2).toFixed(2)}s`;
        host.appendChild(sp);
    });
}

// Scia luminosa unica sotto le carte estratte (occupa l'intera riga della griglia)
function attachBellineRowSweep(grid) {
    if (!grid) return;
    const sweep = document.createElement('div');
    sweep.className = 'belline-row-sweep';
    sweep.setAttribute('aria-hidden', 'true');
    grid.appendChild(sweep);
}

// Riflesso della carta dietro di essa (alone dorato). Mentre la carta è
// coperta il riflesso usa il dorso, così il fronte non "filtra" per errore.
function attachBellineCardReflection(grid, card, cardEl) {
    if (!grid || !cardEl) return;
    const host = cardEl.closest('.card-magic');
    if (!host) return;
    const reflection = document.createElement('div');
    reflection.className = 'belline-card-reflection';
    reflection.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.src = 'resources/belline/card_dorso.webp';
    img.alt = '';
    img.className = 'belline-card-reflection-img';
    reflection.appendChild(img);
    host.insertBefore(reflection, cardEl);
    sizeBellineReflection(reflection, cardEl);
    enableBellineReflectionRecalibration();
    scheduleBellineReflectionRecalibration();
    img.addEventListener('load', scheduleBellineReflectionRecalibration);
    const faceImg = cardEl.querySelector('img');
    if (faceImg && !faceImg.complete) {
        faceImg.addEventListener('load', scheduleBellineReflectionRecalibration);
    }
}

function sizeBellineReflection(reflection, cardEl) {
    const host = cardEl.closest('.card-magic');
    if (!host) return;
    const w = cardEl.offsetWidth;
    const h = cardEl.offsetHeight;
    if (w < 1 || h < 1) return;
    reflection.style.left = cardEl.offsetLeft + 'px';
    reflection.style.top = cardEl.offsetTop + 'px';
    reflection.style.width = w + 'px';
    reflection.style.height = h + 'px';
}

let bellineReflectionBound = false;
let bellineReflectionRaf = null;
let bellineReflectionResize = null;
let bellineReflectionSettled = null;
function enableBellineReflectionRecalibration() {
    if (bellineReflectionBound) return;
    bellineReflectionBound = true;
    window.addEventListener('resize', scheduleBellineReflectionRecalibration);
    window.addEventListener('load', scheduleBellineReflectionRecalibration);
    bellineReflectionResize = new ResizeObserver(() => scheduleBellineReflectionRecalibration());
    const grid = document.getElementById('belline-grid');
    if (grid) bellineReflectionResize.observe(grid);
    scheduleBellineReflectionRecalibration();
    // Dopo la fine del reveal (anime, ~500ms + delay per carta) ricalcola una
    // volta per agganciare il box finale senza interferenze dalle trasformazioni.
    bellineReflectionSettled = setTimeout(scheduleBellineReflectionRecalibration, 1400);
}

function scheduleBellineReflectionRecalibration() {
    if (bellineReflectionRaf) return;
    bellineReflectionRaf = requestAnimationFrame(() => {
        bellineReflectionRaf = null;
        recalibrateBellineReflections();
    });
}

function recalibrateBellineReflections() {
    const grid = document.getElementById('belline-grid');
    if (!grid) return;
    const cards = grid.querySelectorAll('.belline-grid-item.min .belline-card');
    const refs = grid.querySelectorAll('.belline-card-reflection');
    refs.forEach((r, i) => {
        if (cards[i]) sizeBellineReflection(r, cards[i]);
    });
    const sweep = grid.querySelector('.belline-row-sweep');
    if (!sweep || cards.length < 2) return;
    const c0Top = cards[0].getBoundingClientRect().top;
    const cNTop = cards[cards.length - 1].getBoundingClientRect().top;
    const sameRow = Math.abs(c0Top - cNTop) < 8;
    if (!sameRow) {
        // Su vista imballata la scia resta a larghezza piena (100%)
        sweep.style.width = '';
        sweep.style.marginLeft = '';
        sweep.style.marginRight = '';
        return;
    }
    const gap = parseFloat(getComputedStyle(grid).columnGap) || 12;
    let total = 0;
    cards.forEach((c, i) => {
        const w = c.getBoundingClientRect().width;
        if (w > 1) {
            total += w;
            if (i > 0) total += gap;
        }
    });
    if (total > 1) {
        sweep.style.width = total + 'px';
        sweep.style.marginLeft = 'auto';
        sweep.style.marginRight = 'auto';
    }
}

// Scheda dettaglio di una singola carta
function displayBellineCard(card) {
    const polarity = window.bellinePolarityOf(card);
    const polarityLabel = window.bellinePolarityLabel(polarity);
    const serieName = window.bellineSeriesName(card.series);
    const serieBullet = window.getBellineSeriesBullet(card.series);
    const adviceText = window.bellineAdvice(card);
    const waytext = window.bellinePolarityNote(polarity);

    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[1000] bg-black bg-opacity-80 flex items-center justify-center p-4';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    const associationHtml = card.association
        ? `<p class="text-xs text-gray-600 mb-2">Associazione: <strong>${card.association}</strong></p>`
        : '';

    const cardMedia = `<img src="${bellineImagePath(card)}" alt="${card.name}" class="w-44 sm:w-56 mx-auto rounded-xl border-2 border-yellow-600">`;

    const keywordsHtml = card.keywords && card.keywords.length
        ? `<div class="bg-yellow-50 rounded-xl p-4 mb-3">
            <strong class="block mb-1">Parole chiave</strong>
            <div class="flex flex-wrap gap-2">
                ${card.keywords.map((k) => `<span class="keyword-tag">${k}</span>`).join('')}
            </div>
        </div>`
        : '';

    // Sezioni estese dal dataset di dettaglio (iconografia, psicologia, ritratto, direzione, esito)
    const detail = card.detail || {};
    const detailSections = [
        { title: 'Iconografia e Simboli', key: 'icon' },
        { title: 'Psicologia Profonda', key: 'psych' },
        { title: 'Chi è / Stato', key: 'portrait' },
        { title: 'Direzione · Evoluzione', key: 'direction' },
        { title: 'Riuscita · Esito', key: 'outcome' }
    ].map((s) => detail[s.key]
        ? `<div class="bg-yellow-50 rounded-xl p-4 mb-3">
            <strong class="block mb-1">${s.title}</strong>
            <p class="text-sm">${detail[s.key]}</p>
        </div>`
        : '').join('');

    const detailConsiglioHtml = detail.advice
        ? `<div class="bg-yellow-50 rounded-xl p-4 mb-3">
            <strong class="block mb-1">Consiglio</strong>
            <p class="text-sm">${detail.advice}</p>
        </div>`
        : `<div class="bg-yellow-50 rounded-xl p-4">
            <strong class="block mb-1">Consiglio</strong>
            <p class="text-sm">${adviceText}</p>
        </div>`;

    overlay.innerHTML = `
        <div class="bg-cream text-purple-900 max-w-3xl w-full rounded-3xl border-4 border-yellow-600 p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <button class="absolute top-3 right-5 text-3xl text-purple-900 font-bold hover:text-yellow-600" onclick="this.closest('.fixed').remove()">&times;</button>
            <div class="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-6 items-start">
                ${cardMedia}
                <div>
                    <h3 class="card-name text-3xl mb-1">${card.name}</h3>
                    <p class="text-sm text-gray-600 mb-2">${serieName} · Polarità: <span class="serie-chip polarity-${polarity}">${polarityLabel}</span></p>
                    ${associationHtml}
                    <p class="text-gray-800 mb-4">${card.meaning}</p>
                    ${keywordsHtml}
                    ${detailSections}
                    <div class="bg-yellow-50 rounded-xl p-4 mb-3">
                        <strong class="block mb-1">La Luce di questa serie</strong>
                        <p class="text-sm">${serieBullet}</p>
                    </div>
                    <div class="bg-yellow-50 rounded-xl p-4 mb-3">
                        <strong class="block mb-1">Per la tua lettura</strong>
                        <p class="text-sm">${waytext}</p>
                    </div>
                    ${detailConsiglioHtml}
                    ${renderCardPairs(card)}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    if (typeof anime !== 'undefined') {
        anime({
            targets: overlay.querySelector('.rounded-3xl'),
            scale: [0.85, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });
    }
}

// Elenca gli abbinamenti noti di una carta chiave
function renderCardPairs(card) {
    if (!card.pairs || card.pairs.length === 0) return '<div class="mt-2 text-xs text-gray-500">Nessun abbinamento particolare segnalato.</div>';
    const out = ['<div class="mt-4"><strong class="block mb-2">Abinamenti</strong><div class="space-y-1 text-sm">'];
    card.pairs.forEach((pair) => {
        const other = window.getBellineCardById(pair.with);
        const otherName = other ? other.name : `la carta ${pair.with}`;
        out.push(`<div>• Con ${otherName}: ${pair.note}</div>`);
    });
    out.push('</div></div>');
    return out.join('');
}

// Trova gli abbinamenti tra tutte le coppie di carte della stesa (tutte le combinazioni).
// Tenore della coppia derivato dalla polarità delle due carte coinvolte.
function findAllBellinePairings() {
    const found = [];
    for (let i = 0; i < bellineDrawn.length - 1; i++) {
        const a = bellineDrawn[i];
        for (let j = i + 1; j < bellineDrawn.length; j++) {
            const b = bellineDrawn[j];
            const ai = (a.num !== null && a.num !== undefined) ? a.num : 'blue';
            const bi = (b.num !== null && b.num !== undefined) ? b.num : 'blue';

            const pairFromA = (a.pairs || []).find(p => p.with === bi);
            const pairFromB = (b.pairs || []).find(p => p.with === ai);
            const pair = (pairFromA && pairFromA.note) ? pairFromA : (pairFromB && pairFromB.note) ? pairFromB : null;

            const pa = window.bellinePolarityOf(a);
            const pb = window.bellinePolarityOf(b);
            let tone = 'neutral';
            if (pa === 'good' && pb === 'good') tone = 'good';
            else if (pa === 'bad' && pb === 'bad') tone = 'bad';
            else if ((pa === 'good' && pb === 'bad') || (pa === 'bad' && pb === 'good')) tone = 'soft';

            if (pair) found.push({ a, b, note: pair.note, tone });
        }
    }
    return found;
}

// Sintesi per nome delle carte estratte: cita le carte effettive, mai boilerplate
function buildBellineCardSynopsis() {
    if (bellineDrawn.length === 0) return '';

    const cardsFori = bellineDrawn.filter(c => window.bellinePolarityOf(c) === 'good');
    const cardsAvverse = bellineDrawn.filter(c => window.bellinePolarityOf(c) === 'bad');
    const cardsPassaggio = bellineDrawn.filter(c => window.bellinePolarityOf(c) === 'neutral');

    const named = cards => cards.map(c => {
        const first = (c.meaning || '').split('.')[0].trim();
        return first ? `${c.name} (${first})` : c.name;
    });

    const joinList = items => {
        if (items.length === 0) return '';
        if (items.length === 1) return items[0];
        return items.slice(0, -1).join(', ') + ' e ' + items[items.length - 1];
    };

    const fav = named(cardsFori);
    const avv = named(cardsAvverse);
    const tra = named(cardsPassaggio);

    const pieces = [];
    if (fav.length) pieces.push(joinList(fav) + (fav.length > 1 ? ' portano slancio e occasioni positive' : ' porta slancio e occasioni positive'));
    if (tra.length) pieces.push(joinList(tra) + (tra.length > 1 ? ' segnano un passaggio da osservare' : ' segna un passaggio da osservare'));
    if (avv.length) pieces.push(joinList(avv) + (avv.length > 1 ? ' chiedono prudenza e lucidità' : ' chiede prudenza e lucidità'));

    let lead;
    if (cardsAvverse.length === 0 && cardsFori.length > 0) {
        lead = 'Le tue Luci sono in prevalenza favorevoli:';
    } else if (cardsAvverse.length === 0) {
        lead = 'Le tue Luci sono di puro passaggio:';
    } else if (cardsAvverse.length > cardsFori.length) {
        lead = 'Le tue Luci sono in prevalenza avverse:';
    } else {
        lead = 'Le tue Luci sono in equilibrio:';
    }

    return lead + ' ' + pieces.join('; ') + '.';
}

// Sintesi approfondita: quadro coeso per gruppi di polarità + rilettura fluida di ogni Luce
function buildBellineDeepSynopsis() {
    if (bellineDrawn.length === 0) return [];
    const p1 = buildBellineCardSynopsis();

    const detail = bellineDrawn.map(c => {
        const polLabel = window.bellinePolarityLabel(window.bellinePolarityOf(c));
        const serieName = window.bellineSeriesName(c.series);
        const firstSent = (c.meaning || '').split('.')[0].trim();
        const stance = window.bellinePolarityOf(c) === 'good' ? 'esta a tuo favore'
            : window.bellinePolarityOf(c) === 'bad' ? 'chiede cautela e attenzione'
            : 'resta in equilibrio';
        const focus = firstSent ? `, ${firstSent.toLowerCase()}` : '';
        return `${c.name} (${polLabel}, serie ${serieName}) ${stance}${focus}`;
    });

    const context = bellineQuestionAmbito && BELLINE_QUESTION_TEMPLATES[bellineQuestionAmbito]
        ? `Seguono il filo della tua domanda sull'${BELLINE_QUESTION_TEMPLATES[bellineQuestionAmbito].label.toLowerCase()}.`
        : 'Seguono il filo che la tua vita ti chiede di osservare in questo momento.';
    const p2 = 'Nel dettaglio: ' + detail.join(' ') + ' ' + context;

    return [p1, p2];
}

// Consiglio pratico: azione suggerita in base alla polarità dominante + voce delle carte chiave
function buildBellinePracticalAdvice(hasQuestion) {
    const goods = bellineDrawn.filter(c => window.bellinePolarityOf(c) === 'good').length;
    const bads = bellineDrawn.filter(c => window.bellinePolarityOf(c) === 'bad').length;
    const neutrals = bellineDrawn.length - goods - bads;
    const polarityState = (bads === 0 && goods > neutrals) ? 'good'
        : (bads > goods && bads > neutrals) ? 'bad' : 'balance';

    const stance = {
        good: "Muoviti con fiducia e cogli le occasioni che le Luci ti indicano: l'energia è propizia e premia chi agisce in modo deciso e coerente.",
        bad: 'Procedi con prudenza e lucidità: le Luci invitano a non forzare, a verificare ogni scelta e a rimandare le decisioni impulsive.',
        balance: 'Valuta con calma le opzioni: le Luci non impongono una direzione, ma premiano chi decide con equilibrio e coerenza.'
    }[polarityState];

    const counsels = bellineDrawn.map(c => ({
        c,
        st: window.bellinePolarityOf(c),
        adv: window.bellineAdvice(c)
    })).filter(o => o.adv);

    const priority = ['good', 'bad', 'neutral'];
    const guide = priority.map(p => counsels.find(o => o.st === p)).find(Boolean);

    const bits = [stance];
    if (guide) bits.push(`In particolare, ${guide.c.name} suggerisce: ${guide.adv}`);
    const blue = bellineDrawn.find(c => c.num === null || c.num === undefined);
    if (blue) bits.push('La Carta Blu ti avvolge con la sua protezione: hai il sostegno necessario per procedere senza timori.');
    if (!hasQuestion) bits.push('Per un consiglio più mirato, formula una domanda precisa su ciò che ti sta più a cuore.');

    return bits.join(' ');
}

// Configurazione per il messaggio generale generato da AI (via Edge Function
// belline-ai di Supabase). La chiave Groq NON vive più nel client: il proxy
// lato server la usa (Deno.env GROQ_API_KEY). Senza backend l'AI viene saltata
// e si usa il fallback rule-based.
const BELLINE_AI_CONFIG = Object.assign({
    enabled: true,
    functionName: 'belline-ai',
    model: 'llama-3.3-70b-versatile',
    timeoutMs: 25000
}, (window.BELLINE_SERVER && window.BELLINE_SERVER.ai) || {});

// La sintesi vocale (via Edge Function belline-tts) è riservata ai piani
// paganti; il gate piano è già applicato lato server. In caso di errore,
// quota o piano free si ripiega sulle voci di sistema (Web Speech).
const BELLINE_ELEVENLABS_CONFIG = Object.assign({
    functionName: 'belline-tts',
    voiceId: 'JBFqnCBsd6RMkjVDRZzb',
    modelId: 'eleven_multilingual_v2',
    timeoutMs: 25000,
    voiceSettings: { stability: 0.5, similarity_boost: 0.75 }
}, (window.BELLINE_SERVER && window.BELLINE_SERVER.elevenlabs) || {});

// Chiamata all'AI (via Edge Function belline-ai) per il messaggio della stesa corrente
async function generateBellineAIGeneralMessage() {
    const cfg = BELLINE_AI_CONFIG;
    if (!cfg || !cfg.enabled) return null;
    if (!window.bellineServer || !window.bellineServer.callFunction) return null;

    const prompt = window.buildBellineAIPrompt ? window.buildBellineAIPrompt() : '';
    if (!prompt) return null;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.timeoutMs || 25000);

    try {
        const res = await window.bellineServer.callFunction(cfg.functionName, {
            body: {
                prompt,
                model: cfg.model,
                temperature: 0.8,
                max_tokens: 1800
            }
        });

        if (!res || res.status < 200 || res.status >= 300 || !res.data) {
            if (res && res.status === 429) {
                console.warn('[Belline AI] Limite giornaliero raggiunto, fallback rule-based');
            } else if (res && res.error) {
                console.warn('[Belline AI] Proxy', res.status, res.error);
            }
            return null;
        }

        const content = (res.data && res.data.text) ? String(res.data.text) : '';
        return (content && content.trim()) ? content.trim() : null;
    } catch (err) {
        console.warn('[Belline AI]', err);
        return null;
    } finally {
        clearTimeout(timer);
    }
}

// Divide un testo in paragrafi (riga vuota -> riga singola -> frasi)
function splitBellineMessageToParagraphs(text) {
    let chunks = String(text || '').split(/\n\s*\n+/).map(s => s.trim()).filter(Boolean);
    if (chunks.length <= 1) {
        chunks = String(text || '').split(/\n/).map(s => s.trim()).filter(Boolean);
    }
    if (chunks.length <= 1) {
        const sentences = String(text || '').match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g);
        chunks = (sentences || [String(text || '')]).map(s => s.trim()).filter(Boolean);
    }
    return chunks.length ? chunks : [String(text || '').trim()];
}

// Titolo-riassunto per ogni card del messaggio: ricavato dal testo del
// paragrafo (prime parole dell'AI) o dall'etichetta dei paragrafi tematici.
function bellineTitleFromParagraph(text) {
    const raw = String(text || '').trim().replace(/^[-*\d.\s]+/, ' ');
    if (!raw) return '';
    const mask = raw.toLowerCase();
    const labels = [
        'luci che si rafforzano',
        'pesi che si alleggeriscono',
        'abinamenti tra le luci',
        'consiglio pratico',
        'avvertenze'
    ];
    for (const label of labels) {
        if (mask.startsWith(label)) {
            return label.charAt(0).toUpperCase() + label.slice(1);
        }
    }
    const STOP = /^(?:di|del|della|delle|dei|e|il|lo|la|i|gli|le|un|una|uno|per|che|con|in|al|sul|nel|dai)$/i;
    const words = raw.replace(/[.!?;:,»«"“”]+$/g, '').split(/\s+/);
    const kept = [];
    let len = 0;
    for (const w of words) {
        const nextLen = len + w.length + (kept.length ? 1 : 0);
        if (nextLen > 34) break;
        kept.push(w);
        len = nextLen;
    }
    while (kept.length > 1 && STOP.test(kept[kept.length - 1])) kept.pop();
    let title = kept.join(' ').replace(/^["'«]+|["'»]+$/g, '').trim();
    if (!title) return '';
    return title.charAt(0).toUpperCase() + title.slice(1);
}

// Due scintille sospese in ogni pannello: ornamento puro aria-hidden, colore
// ereditato dalla tinta della card (token --accent-light), posizioni e ritmi
// deterministici dal seed così rimangono stabili tra i render.
function bellineAddMagicMotes(card, seed) {
    if (!card) return;
    for (let v = 0; v < 2; v++) {
        const mote = document.createElement('span');
        mote.className = 'advice-mote' + (v === 0 ? ' a' : ' b');
        mote.setAttribute('aria-hidden', 'true');
        const s = ((seed || 0) * 53 + v * 97) % 100;
        mote.style.left = (14 + (s * 0.66) % 74) + '%';
        mote.style.bottom = (8 + (s % 34)) + '%';
        mote.style.animationDelay = ((s % 4) + v * 1.7).toFixed(2) + 's';
        mote.style.animationDuration = (5.5 + (s % 30) / 10).toFixed(2) + 's';
        card.appendChild(mote);
    }
}

// Cortina di luce singola che attraversa la griglia nel momento in cui il
// messaggio prende forma. Elemento assoluto fuori dal flusso grid.
function bellineLitSweep(box) {
    if (!box) return;
    const old = box.querySelector('.advice-light-sweep');
    if (old) old.remove();
    const sweep = document.createElement('div');
    sweep.className = 'advice-light-sweep';
    sweep.setAttribute('aria-hidden', 'true');
    box.appendChild(sweep);
}

// During the consulta, un solo segno "oracolo all'opera" al posto dello skeleton
function renderBellineConsultingCard() {
    const box = document.getElementById('belline-advice');
    if (!box) return;
    box.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'advice-paragraph-card advice-consulting';
    const seal = document.createElement('p');
    seal.className = 'advice-consulting-seal';
    seal.setAttribute('aria-hidden', 'true');
    seal.textContent = '✦';
    card.appendChild(seal);

    for (let i = 0; i < 3; i++) {
        const bar = document.createElement('span');
        bar.className = 'advice-consulting-bar' + (i === 0 ? ' wide' : i === 1 ? ' mid' : '');
        card.appendChild(bar);
    }

    const label = document.createElement('p');
    label.className = 'advice-consulting-label';
    label.textContent = 'Le Luci si stanno consultando';
    card.appendChild(label);
    bellineAddMagicMotes(card, 0);
    box.appendChild(card);
}

// Renderizza il messaggio generale come card, una per paragrafo.
// Gli ornamenti vengono applicati solo via CSS o span aria-hidden, così il
// textContent resta il testo puro e la sintesi vocale non legge simboli.
function renderBellineGeneralCards(paragraphs, isLoading) {
    if (isLoading) {
        renderBellineConsultingCard();
        return;
    }
    const box = document.getElementById('belline-advice');
    if (!box) return;
    box.innerHTML = '';
    let items = Array.isArray(paragraphs) && paragraphs.length ? paragraphs : [paragraphs];
    if (!items.length || !String(items[0] || '').trim()) {
        items = ['Le Luci hanno preparato il tuo messaggio.'];
    }
    items.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'advice-paragraph-card advice-reveal'
            + (i === 0 ? ' lede' : '')
            + (i === items.length - 1 ? ' final' : '')
            + ' advice-tint-' + (i % 6);
        card.style.animationDelay = Math.min(i * 90, 720) + 'ms';

        const title = document.createElement('div');
        title.className = 'advice-para-title';
        title.setAttribute('aria-hidden', 'true');
        title.textContent = bellineTitleFromParagraph(p);
        card.appendChild(title);

        const pEl = document.createElement('p');
        pEl.className = 'advice-paragraph-text';
        pEl.textContent = p;
        card.appendChild(pEl);
        bellineAddMagicMotes(card, i);
        box.appendChild(card);
        if (i < items.length - 1) box.appendChild(document.createTextNode('\n'));
    });
    bellineLitSweep(box);
}

// ---- Card derivate: analisi rapida e interazioni deterministiche ----
function bellineGuideCard() {
    const numbered = bellineDrawn.filter(c => c.num !== null && c.num !== undefined);
    const pool = numbered.length ? numbered : bellineDrawn;
    if (!pool.length) return null;
    const priority = ['good', 'neutral', 'bad'];
    return priority.map(p => pool.find(c => window.bellinePolarityOf(c) === p)).find(Boolean) || pool[0];
}

function bellineNatalCardFromInputs() {
    const get = id => parseInt((document.getElementById(id) || {}).value, 10);
    const day = get('natal-day');
    const month = get('natal-month');
    const year = get('natal-year');
    if (!day || !month || !year || day < 1 || day > 31 || month < 1 || month > 12) return null;
    const n = window.bellineNatalCard(day, month, year);
    return window.getBellineCardById(n);
}

function computeBellineDerivedData() {
    const data = { gauge: null, keywords: [], territorio: null, natal: null, nextQuestions: [], guide: null };
    if (!bellineDrawn.length) return data;

    // La Carta Blu è un jolly protettivo: va esclusa dai bucket di polarità
    // e conteggiata come bonus separato per non conterla due volte.
    const normal = bellineDrawn.filter(c => c.num !== null && c.num !== undefined);
    const goods = normal.filter(c => window.bellinePolarityOf(c) === 'good').length;
    const bads = normal.filter(c => window.bellinePolarityOf(c) === 'bad').length;
    const neutrals = normal.length - goods - bads;
    const hasBlue = bellineDrawn.length > normal.length;
    const total = normal.length ? normal.length : bellineDrawn.length;

    let score = Math.round(((goods + neutrals * 0.5 + (hasBlue ? 0.75 : 0)) / total) * 5);
    score = Math.max(1, Math.min(5, score));
    data.gauge = {
        goods, neutrals, bads, hasBlue,
        pct: p => total ? Math.round((p / total) * 100) : 0,
        score
    };

    const freq = {};
    bellineDrawn.forEach(c => (c.keywords || []).forEach(k => { freq[k] = (freq[k] || 0) + 1; }));
    data.keywords = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([k]) => k);

    const bySeries = {};
    bellineDrawn.forEach(c => { if (c.series) bySeries[c.series] = (bySeries[c.series] || 0) + 1; });
    const topSeries = Object.entries(bySeries).sort((a, b) => b[1] - a[1])[0];
    if (topSeries) {
        data.territorio = {
            label: window.bellineSeriesName(topSeries[0]),
            count: topSeries[1],
            bullet: window.getBellineSeriesBullet(topSeries[0]) || ''
        };
    }

    data.natal = bellineNatalCardFromInputs();
    data.guide = bellineGuideCard();

    // Le domande di follow-up sono tipiche della stesa libera (narrativa esclusa)
    if (bellineMode !== 'narrative') {
        const ambito = bellineQuestionAmbito || bellineActiveAmbito || 'amore';
        const current = (document.getElementById('belline-question') || {}).value || '';
        data.nextQuestions = (window.generateBellineQuestions ? window.generateBellineQuestions(ambito, 4) : [])
            .filter(q => q.text !== current.trim())
            .slice(0, 2);
    }
    return data;
}

function bellineDerivedCardStart(label, tintClass) {
    const card = document.createElement('div');
    card.className = 'advice-paragraph-card derived advice-reveal' + (tintClass ? ' ' + tintClass : '');
    card.style.animationDelay = '120ms';
    const lab = document.createElement('p');
    lab.className = 'advice-card-label';
    lab.textContent = label;
    card.appendChild(lab);
    bellineAddMagicMotes(card, 5);
    return card;
}

// Corpo delle card derivate, aggiunte al messaggio generale (AI e fallback)
function renderBellineDerivedCards() {
    const box = document.getElementById('belline-advice');
    if (!box || !bellineDrawn.length) return;
    const data = computeBellineDerivedData();

    if (data.guide) {
        const card = bellineDerivedCardStart('La Luce guida', 'advice-tint-guide');
        const first = (data.guide.meaning || '').split('.')[0].trim();
        const reason = first ? first.toLowerCase() : 'la carta centrale di questa stesa';
        const p = document.createElement('p');
        p.className = 'advice-paragraph-text';
        p.textContent = `${data.guide.name} è il punto focale di questa stesa: ${reason}. ${window.bellineAdvice(data.guide)}`;
        card.appendChild(p);
        box.appendChild(card);
    }

    if (data.gauge) {
        const card = bellineDerivedCardStart('Indice di propiziazione', 'advice-tint-gauge');
        const score = document.createElement('p');
        score.className = 'advice-paragraph-text advice-gauge-score';
        score.textContent = `Propiziazione ${data.gauge.score} su 5 luci.`;
        card.appendChild(score);
        const bars = [
            ['Favorevoli', data.gauge.goods, 'good'],
            ['Neutrali', data.gauge.neutrals, 'neutral'],
            ['Avverse', data.gauge.bads, 'bad']
        ];
        bars.forEach(([label, val, key]) => {
            const item = document.createElement('div');
            item.className = 'advice-gauge-item';
            item.innerHTML =
                '<span class="advice-gauge-label">' + label + '</span>' +
                '<span class="advice-gauge-track"><span class="advice-gauge-fill ' + key + '" style="width:' + data.gauge.pct(val) + '%"></span></span>' +
                '<span class="advice-gauge-num">' + val + '</span>';
            card.appendChild(item);
        });
        if (data.gauge.hasBlue) {
            const blue = document.createElement('p');
            blue.className = 'advice-paragraph-text';
            blue.textContent = 'La Carta Blu alza la tua protezione.';
            card.appendChild(blue);
        }
        box.appendChild(card);
    }

    if (data.keywords.length) {
        const card = bellineDerivedCardStart('Parole chiave della stesa', 'advice-tint-2');
        const row = document.createElement('div');
        row.className = 'flex flex-wrap gap-2';
        data.keywords.forEach(k => {
            const chip = document.createElement('span');
            chip.className = 'keyword-tag';
            chip.textContent = k;
            row.appendChild(chip);
        });
        card.appendChild(row);
        box.appendChild(card);
    }

    if (data.territorio && data.territorio.label) {
        const card = bellineDerivedCardStart('Territorio dominante', 'advice-tint-1');
        const p = document.createElement('p');
        p.className = 'advice-paragraph-text';
        p.textContent = `La lettura è attraversata dalla serie ${data.territorio.label} (${data.territorio.count} carte).${data.territorio.bullet ? ' ' + data.territorio.bullet : ''}`;
        card.appendChild(p);
        box.appendChild(card);
    }

    if (data.natal) {
        const card = bellineDerivedCardStart('La Carta che ti accompagna', 'advice-tint-0');
        const p = document.createElement('p');
        p.className = 'advice-paragraph-text';
        const inStesa = bellineDrawn.some(c => c.name === data.natal.name);
        p.textContent = `La tua Luce di nascita è ${data.natal.name}${inStesa ? ': oggi entra nella tua stesa.' : ': accompagna questa lettura dallo sfondo.'}`;
        card.appendChild(p);
        box.appendChild(card);
    }

    }

// ---- Pannello "Vuoi approfondire?": domande per una nuova consultazione ----
// Separato dal messaggio generale (#belline-followup), riservato alla stesa libera.
// Un click su una domanda compila il campo principale, azzera la stesa e riporta
// l'utente in alto perché possa estrarre una nuova lettura.

// Applica la domanda scelta: entra nel campo principale, azzera la stesa, torna in alto
function applyBellineFollowUp(question, ambito) {
    const input = document.getElementById('belline-question');
    if (input) input.value = question;
    if (ambito) bellineQuestionAmbito = ambito;

    // Reset della stesa: nasconde i risultati e azzera le carte estratte
    const hadStessa = bellineDrawn.length > 0;
    flexResetBelline();
    if (hadStessa) {
        const status = document.getElementById('belline-status');
        if (status) status.textContent = 'Domanda impostata. Clicca sul mazzo per una nuova lettura.';
    }

    // Ritorno in alto, sul setup della domanda
    const target = input || document.body;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () {
        if (input && input.focus) input.focus({ preventScroll: true });
    }, 450);
}

// Renderizza il pannello dedicato con suggerimenti contestuali e campo libero
function renderBellineFollowUp() {
    const panel = document.getElementById('belline-followup');
    if (!panel) return;
    panel.innerHTML = '';

    if (bellineMode === 'narrative' || !bellineDrawn.length) {
        panel.style.display = 'none';
        return;
    }

    const data = computeBellineDerivedData();
    const questions = data.nextQuestions || [];
    panel.style.display = 'block';

    const title = document.createElement('h3');
    title.className = 'followup-title';
    title.textContent = 'Vuoi approfondire?';

    const sub = document.createElement('p');
    sub.className = 'followup-sub';
    sub.textContent = 'Hai letto il messaggio. Se desideri consultare le Luci su un altro punto, scegli una domanda o scrivine una tua: tornerai in alto per una nuova stesa.';

    panel.appendChild(title);
    panel.appendChild(sub);

    if (questions.length) {
        const chips = document.createElement('div');
        chips.className = 'followup-chips';
        questions.forEach(function (q) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'question-chip followup-chip';
            btn.textContent = q.text;
            btn.addEventListener('click', function () { applyBellineFollowUp(q.text, q.key); });
            chips.appendChild(btn);
        });
        panel.appendChild(chips);
    }

    // Campo libero per una domanda propria
    const own = document.createElement('div');
    own.className = 'followup-own';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'natal-input followup-input';
    input.placeholder = 'Scrivi qui la tua domanda…';
    input.setAttribute('aria-label', 'Altra domanda per la stesa');

    const go = document.createElement('button');
    go.type = 'button';
    go.className = 'mystical-button followup-go';
    go.textContent = 'Poni la domanda';
    go.addEventListener('click', function () {
        const v = input.value.trim();
        if (v) applyBellineFollowUp(v, null);
    });
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            go.click();
        }
    });

    own.appendChild(input);
    own.appendChild(go);
    panel.appendChild(own);
}

// Consiglio generale: sintesi di polarità e abbinamenti tra tutte le carte estratte
async function renderBellineAdvice() {
    const goods = bellineDrawn.filter(c => window.bellinePolarityOf(c) === 'good').length;
    const bads = bellineDrawn.filter(c => window.bellinePolarityOf(c) === 'bad').length;
    const neutrals = bellineDrawn.filter(c => window.bellinePolarityOf(c) === 'neutral').length;

    const questionInput = document.getElementById('belline-question');
    const question = questionInput ? questionInput.value.trim() : '';

    // Svuota il box del dettaglio per carta in attesa della nuova lettura
    const cardsBox = document.getElementById('belline-advice-cards');
    if (cardsBox) cardsBox.innerHTML = '';

    // Tenta l'AI; se fallisce, ripiega sulla sintesi rule-based
    renderBellineGeneralCards(
        question
            ? `Le Luci riflettono sulla tua domanda «${question}»…`
            : 'Le Luci si stanno consultando sull\'intera stesa…',
        true
    );

    const aiText = await generateBellineAIGeneralMessage();
    if (aiText) {
        renderBellineGeneralCards(splitBellineMessageToParagraphs(aiText));
        renderBellineDerivedCards();
        renderBellineFollowUp();
        renderBellineAdviceCards();
        setBellineSpeakEnabled(true);
        return;
    }

    // Fallback rule-based: paragrafi tematici, una card per paragrafo
    const paragraphs = [];
    if (bellineMode === 'narrative') {
        const natal = bellineNatalSelected || bellineNatalCardFromInputs();
        if (natal) {
            paragraphs.push(`La tua Luce di nascita è "${natal.name}". Le tre luci raccontano il tuo cammino, dal passato al futuro.`);
        }
    } else if (question) {
        paragraphs.push(`Hai domandato: «${question}».`);
    }

    // Narrativa per posizione: le carte raccontano il Ferradura, poi sintesi e coppie
    buildBellinePositionNarrative().forEach(p => paragraphs.push(p));

    const polarityState = (bads === 0 && goods > neutrals) ? 'good'
        : (bads > goods && bads > neutrals) ? 'bad' : 'balance';
    const tones = bellineQuestionAmbito ? BELLINE_QUESTION_TONES[bellineQuestionAmbito] : null;
    if (tones && tones[polarityState]) {
        paragraphs.push(tones[polarityState]);
    }

    const deep = buildBellineDeepSynopsis();
    deep.forEach(p => paragraphs.push(p));

    const pairings = findAllBellinePairings();
    const goodPairs = pairings.filter(p => p.tone === 'good');
    const badPairs = pairings.filter(p => p.tone === 'bad');
    const softPairs = pairings.filter(p => p.tone === 'soft');
    const neutralPairs = pairings.filter(p => p.tone === 'neutral');

    // Le coppie vengono raggruppate per tenore in al massimo 3 card
    let pairingAdded = -1;
    if (goodPairs.length) {
        paragraphs.push('Luci che si rafforzano: ' + goodPairs.map(p =>
            `${p.a.name} e ${p.b.name} si rafforzano a vicenda: ${p.note}`
        ).join(' '));
        pairingAdded = paragraphs.length - 1;
    }
    if (softPairs.length) {
        paragraphs.push('Pesi che si alleggeriscono: ' + softPairs.map(p => {
            const goodCard = window.bellinePolarityOf(p.a) === 'good' ? p.a : p.b;
            const badCard = window.bellinePolarityOf(p.a) === 'bad' ? p.a : p.b;
            return `${goodCard.name} allevia il peso di ${badCard.name}: ${p.note}`;
        }).join(' '));
        pairingAdded = paragraphs.length - 1;
    }
    if (badPairs.length) {
        paragraphs.push('Avvertenze: ' + badPairs.map(p =>
            `Attenzione all'accostamento ${p.a.name} e ${p.b.name}: ${p.note}`
        ).join(' '));
        pairingAdded = paragraphs.length - 1;
    }
    if (neutralPairs.length) {
        const neutralText = neutralPairs.map(p => `${p.a.name} e ${p.b.name}: ${p.note}`).join(' ');
        if (pairingAdded >= 0) {
            paragraphs[pairingAdded] += ' ' + neutralText;
        } else {
            paragraphs.push('Abinamenti tra le Luci: ' + neutralText);
        }
    }

    paragraphs.push('Consiglio pratico: ' + buildBellinePracticalAdvice(!!question));

    renderBellineGeneralCards(paragraphs);
    renderBellineDerivedCards();
    renderBellineFollowUp();
    renderBellineAdviceCards();
    setBellineSpeakEnabled(true);
}

// Dettaglio per carta in un box distinto dal messaggio generale
function renderBellineAdviceCards() {
    const box = document.getElementById('belline-advice-cards');
    if (!box) return;
    if (bellineDrawn.length === 0) {
        box.innerHTML = '';
        return;
    }
    box.innerHTML = bellineDrawn.map((c, i) => {
        const polLabel = window.bellinePolarityLabel(window.bellinePolarityOf(c));
        const serieName = window.bellineSeriesName(c.series);
        const meaning = (c.meaning || c.meaning === '') ? c.meaning : '';
        const advice = window.bellineAdvice(c);
        const posTitle = (bellinePositionsFor(bellineDrawn.length)[i] || {}).title || '';
        const head = posTitle ? `${posTitle} · ${i + 1}` : String(i + 1);
        return `<div class="advice-card-item">
            <div class="mb-1">
                <span class="font-bold text-amber-300">${head}. ${c.name}</span>
                <span class="text-amber-200/80 text-sm"> (${polLabel} · ${serieName})</span>
            </div>
            <p class="text-yellow-100/90 text-base">${meaning} <span class="text-amber-200 font-semibold">Consiglio: ${advice}</span></p>
        </div>`;
    }).join('');
}

// Abilita/disabilita il bottone di sintesi vocale
function setBellineSpeakEnabled(enabled) {
    const btn = document.getElementById('belline-speak-btn');
    if (!btn) return;
    btn.disabled = !enabled;
    if (!enabled) {
        btn.classList.remove('playing');
        btn.textContent = '🔊 Ascolta il messaggio';
    }
}

let bellineSpeaking = false;
let bellineAudio = null;
let bellineAudioUrl = null;

// Riscalda l'elenco voci: alcune piattaforme (Chrome) le caricano in modo asincrono
if (typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

// Elenco voci installate (Web Speech)
function bellineInstalledVoices() {
    if (!('speechSynthesis' in window) || !window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices() || [];
}

// Voce di lettura del piano free: preferiamo "Alice", altrimenti la prima italiana
function getBellineItalianVoice() {
    const it = bellineInstalledVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith('it'));
    return it.find(v => v.name === 'Alice') || it[0] || null;
}

// Diagnostica da console: elenco voci installate (index · lang · name · local)
window.bellineListVoices = function () {
    return bellineInstalledVoices().map((v, i) => ({ i, lang: v.lang, name: v.name, local: !!v.localService }));
};

// Spezza il testo in brevi frasi (max ~200 caratteri) per una lettura più naturale
function bellineSplitForSpeech(text) {
    const clean = String(text).replace(/\s+/g, ' ').trim();
    if (!clean) return [];
    const maxLen = 200;
    const chunks = [];
    let remaining = clean;
    while (remaining.length > maxLen) {
        const slice = remaining.slice(0, maxLen);
        const cut = Math.max(
            slice.lastIndexOf('. '), slice.lastIndexOf('! '),
            slice.lastIndexOf('? '), slice.lastIndexOf('; '), slice.lastIndexOf(': ')
        );
        const take = cut > 50 ? cut + 1 : slice.lastIndexOf(' ');
        const piece = take > 50 ? slice.slice(0, take) : slice;
        chunks.push(piece.trim());
        remaining = remaining.slice(piece.length).trim();
    }
    if (remaining) chunks.push(remaining.trim());
    return chunks;
}

// Ripiega sulle voci di sistema (Web Speech) quando ElevenLabs non è disponibile.
// Voce "Alice" (o prima italiana) resa più calda: più lenta e con tono morbido.
function speakBellineAdviceSystem(text) {
    if (!('speechSynthesis' in window)) {
        stopBellineSpeech();
        return;
    }
    const synth = window.speechSynthesis;
    const chunks = bellineSplitForSpeech(text);
    if (!chunks.length) {
        stopBellineSpeech();
        return;
    }
    synth.cancel();
    bellineSpeaking = true;
    const btn = document.getElementById('belline-speak-btn');
    if (btn) {
        btn.classList.add('playing');
        btn.textContent = '⏹ Interrompi';
    }
    const voice = getBellineItalianVoice();
    chunks.forEach((chunk, i) => {
        const utter = new SpeechSynthesisUtterance(chunk);
        utter.lang = 'it-IT';
        if (voice) utter.voice = voice;
        utter.rate = 0.9;
        utter.pitch = 0.95;
        utter.volume = 1;
        if (i === chunks.length - 1) {
            utter.onend = () => stopBellineSpeech();
            utter.onerror = () => stopBellineSpeech();
        } else {
            utter.onerror = () => {};
        }
        synth.speak(utter);
    });
}

// Sintesi vocale con ElevenLabs; il dettaglio delle luci non viene letto
async function speakBellineAdvice() {
    const btn = document.getElementById('belline-speak-btn');
    if (!btn || btn.disabled) return;

    if (bellineSpeaking) {
        stopBellineSpeech();
        return;
    }

    const main = [...document.querySelectorAll('#belline-advice .advice-paragraph-text')]
        .map(n => n.textContent)
        .join('\n') || (document.getElementById('belline-advice') || {}).textContent || '';
    const text = main.trim();
    if (!text) return;

    const cfg = BELLINE_ELEVENLABS_CONFIG;

    // ElevenLabs è una feature dei piani a pagamento (API a pagamento):
    // i free ascoltano con le voci di sistema del browser, gratis.
    const paidTts = !window.bellineCanListen || window.bellineCanListen();

    // Fallback diretto se il piano è free, se il proxy non è pronto o se non c'è audio supportato
    if (!paidTts || !window.bellineServer || !window.bellineServer.callFunction ||
        typeof Audio === 'undefined') {
        speakBellineAdviceSystem(text);
        return;
    }

    bellineSpeaking = true;
    btn.classList.add('playing');
    btn.textContent = '⏳ Preparazione…';

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);

    try {
        const res = await window.bellineServer.callFunction(cfg.functionName, {
            body: {
                text,
                voiceId: cfg.voiceId,
                modelId: cfg.modelId,
                voiceSettings: cfg.voiceSettings || {}
            },
            responseType: 'blob'
        });

        // Fallback Web Speech in caso di errore del proxy (quota, 403, rete ecc.)
        if (!res || res.status < 200 || res.status >= 300 || !(res.data instanceof Blob)) {
            console.warn('[Belline TTS] Proxy status', res && res.status, res && res.error);
            speakBellineAdviceSystem(text);
            return;
        }

        const blob = res.data;
        if (blob.size === 0) {
            console.warn('[Belline TTS] Risposta audio vuota');
            speakBellineAdviceSystem(text);
            return;
        }

        if (bellineAudioUrl) URL.revokeObjectURL(bellineAudioUrl);
        bellineAudioUrl = URL.createObjectURL(blob);
        bellineAudio = new Audio();
        bellineAudio.src = bellineAudioUrl;
        bellineAudio.onended = () => stopBellineSpeech();
        bellineAudio.onerror = () => stopBellineSpeech();
        btn.textContent = '⏹ Interrompi';
        await bellineAudio.play();
    } catch (err) {
        console.warn('[Belline TTS]', err);
        speakBellineAdviceSystem(text);
    } finally {
        clearTimeout(timer);
    }
}

// Interrompe la lettura (sia ElevenLabs sia il fallback Web Speech)
function stopBellineSpeech() {
    bellineSpeaking = false;
    const btn = document.getElementById('belline-speak-btn');
    if (btn) {
        btn.classList.remove('playing');
        btn.textContent = '🔊 Ascolta il messaggio';
    }
    if (bellineAudio) {
        try { bellineAudio.pause(); } catch (e) { /* noop */ }
        bellineAudio.onended = null;
        bellineAudio.onerror = null;
        bellineAudio.src = '';
        bellineAudio = null;
    }
    if (bellineAudioUrl) {
        URL.revokeObjectURL(bellineAudioUrl);
        bellineAudioUrl = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

// Apre il dettaglio della carta dal risultato natale
function openNatalCardDetail(card) {
    if (card) displayBellineCard(card);
}

// Nuova lettura: nasconde i risultati, rigenera il mazzo
function newBellineReading() {
    bellineDrawn = [];
    stopBellineSpeech();
    setBellineSpeakEnabled(false);
    const followup = document.getElementById('belline-followup');
    if (followup) {
        followup.innerHTML = '';
        followup.style.display = 'none';
    }
    const results = document.getElementById('belline-results');
    const status = document.getElementById('belline-status');
    if (results) results.style.display = 'none';
    if (status) {
        if (bellineMode === 'narrative') {
            status.textContent =
                'Tieni premuto e muovi il cursore sul mazzo per rigenerare la tua stesa Passato · Presente · Futuro con la Carta Natale';
        } else {
            const includeBlue = window.bellineIncludeBlue ? window.bellineIncludeBlue() : false;
            status.textContent = includeBlue
                ? 'Tieni premuto e muovi il cursore sul mazzo per rigenerare le luci (con la Carta Blu)'
                : 'Tieni premuto e muovi il cursore sul mazzo per rigenerare le luci';
        }
    }
    const deck = document.getElementById('belline-deck');
    if (deck) deck.scrollIntoView({ behavior: 'smooth' });
}

// ---- Domande dinamiche generate da template (ambito + contesti temporali) ----
// Ogni ambito combina scheletri di frase con contesti {B}: possibili quasi infinite.
const BELLINE_QUESTION_TEMPLATES = {
    amore: {
        label: 'Amore e Relazioni',
        icon: '♡',
        tails: [
            'nei prossimi mesi',
            'nel prossimo periodo',
            'se dovessi aprirmi di più con sincerità',
            'se seguissi ciò che sento davvero',
            'se decidessi di lasciar andare le paure',
            'a partire dal momento presente'
        ],
        templates: [
            'Come si evolverà la mia relazione sentimentale {B}?',
            'Cosa posso aspettarmi dal legame con il mio partner {B}?',
            'Quali sono le energie che influenzeranno il nostro rapporto {B}?',
            'In che modo migliorerà la comunicazione nella mia coppia {B}?',
            'Che cosa mi consigliano le Luci riguardo ai miei sentimenti {B}?',
            'Come si comporterà la persona che amo nei miei confronti {B}?'
        ]
    },
    lavoro: {
        label: 'Lavoro e Carriera',
        icon: '✦',
        tails: [
            'se accettassi questa nuova proposta',
            'se proseguissi nella direzione attuale',
            'nei prossimi sei mesi',
            'se mantenessi la mia costanza',
            'nell\'ambiente professionale di oggi',
            'se cambiassi strategia'
        ],
        templates: [
            'Come si evolverà la mia posizione professionale {B}?',
            'In che modo si sviluppa il mio percorso di carriera {B}?',
            'Quali sono le prospettive di crescita del mio progetto {B}?',
            'Come verranno accolte le mie idee in ambito lavorativo {B}?',
            'Qual è l\'andamento della mia ricerca di una nuova occupazione {B}?',
            'In che modo posso far avanzare le mie ambizioni {B}?'
        ]
    },
    benessere: {
        label: 'Benessere e Crescita Personale',
        icon: '☾',
        tails: [
            'in questo periodo di stress',
            'se mi dedicassi a una nuova attività',
            'quest\'anno',
            'se imparassi a chiedere aiuto',
            'se rallentassi il ritmo quotidiano',
            'se ascoltassi di più i miei bisogni'
        ],
        templates: [
            'In che modo posso ritrovare il mio equilibrio interiore {B}?',
            'Cosa devo comprendere della situazione che mi fa sentire bloccato {B}?',
            'Come si evolverà il mio stato di benessere generale {B}?',
            'Quali sono le energie principali che influenzeranno la mia crescita personale {B}?',
            'In che modo posso migliorare il rapporto con me stesso {B}?',
            'Che cosa devo lasciare andare {B} per stare meglio?'
        ]
    },
    finanze: {
        label: 'Progetti e Finanze',
        icon: '❖',
        tails: [
            'in seguito alla decisione che sto per prendere',
            'se investissi con prudenza',
            'entro i prossimi mesi',
            'se rivedessi le mie priorità',
            'nei prossimi dodici mesi',
            'se gestissi con attenzione le mie risorse'
        ],
        templates: [
            'Come si svilupperanno le mie finanze {B}?',
            'Quali sono le prospettive di successo del mio progetto {B}?',
            'In che modo si evolverà la trattativa che sto conducendo {B}?',
            'Cosa indicano le Luci riguardo alla riuscita della mia iniziativa {B}?',
            'Qual è la direzione migliore per la mia situazione economica {B}?',
            'In che modo posso gestire meglio il mio patrimonio {B}?'
        ]
    }
};

// Frasi di apertura adattate all'ambito della domanda (good / bad / balance)
const BELLINE_QUESTION_TONES = {
    amore: {
        good: 'Le Luci sono favorevoli ai tuoi sentimenti: l\'energia attorno alla relazione è positiva. Accogli con apertura ciò che viene verso di te.',
        bad: 'Le Luci portano un avviso sul fronte dei sentimenti: non forzare, fai della prudenza la tua guida e osserva con lucidità la dinamica in corso.',
        balance: 'La lettura dei tuoi sentimenti è in equilibrio: nulla è scritto. L\'esito della relazione dipende dalle tue scelte e da come le carte si accompagnano.'
    },
    lavoro: {
        good: 'Le Luci sono favorevoli al tuo percorso professionale: l\'energia intorno alla tua posizione è positiva. Cogli le occasioni con apertura e slancio.',
        bad: 'Le Luci segnalano difficoltà nel tuo ambito lavorativo: non è il momento di forzare. Procedi con prudenza, lucidità e pazienza.',
        balance: 'La lettura della tua carriera è in equilibrio: nulla è completamente scritto. Il percorso dipende dalle tue scelte e da come le carte si legano tra loro.'
    },
    benessere: {
        good: 'Le Luci sono favorevoli al tuo benessere e alla tua crescita: l\'energia intorno a te è positiva. Nutri ciò che ti fa stare bene con costanza.',
        bad: 'Le Luci segnalano un momento delicato per il tuo equilibrio: fermati e ascoltati. La prudenza e la cura di te saranno la tua guida.',
        balance: 'La lettura del tuo benessere è in equilibrio: nulla è scritto. La tua serenità dipende dalle scelte che farai e da come le carte si accompagnano.'
    },
    finanze: {
        good: 'Le Luci sono favorevoli ai tuoi progetti e alle tue finanze: l\'energia è propizia. Valuta con attenzione le opportunità e muoviti con fiducia.',
        bad: 'Le Luci mettono in guardia su progetti e finanze: non forzare le decisioni. Prudenza, verifica e pazienza saranno la tua guida.',
        balance: 'La lettura dei tuoi progetti è in equilibrio: nulla è scritto. L\'andamento dipende dalle tue scelte e da come le carte si legano tra loro.'
    }
};

// Render del dettaglio Carta Natale (condiviso tra natale e narrativa)
function renderNatalDetail(card, n) {
    const result = document.getElementById('natal-result');
    if (!result) return;
    result.classList.remove('hidden');
    result.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-6 items-center max-w-3xl mx-auto bg-cream rounded-3xl border-2 border-yellow-600 p-6">
            <img src="resources/belline/card_${String(n).padStart(2, '0')}.webp" alt="${card.name}" class="w-40 mx-auto rounded-xl border-2 border-yellow-600">
            <div>
                <h3 class="card-name text-3xl mb-1">La tua carta natale: ${card.name}</h3>
                <p class="text-sm text-gray-600 mb-3">Numero ${n} · ${window.bellineSeriesName(card.series)}</p>
                <p class="text-gray-800">${card.meaning}</p>
                <button class="mystical-button px-6 py-2 rounded-full mt-4" onclick="openNatalCardDetail(window.getBellineCardById(${n}))">Scopri di più</button>
            </div>
        </div>
    `;
}

// Calcola e mostra la Carta Natale (banner della stesa e pagina natale)
function calculateNatalCard() {
    const day = parseInt(document.getElementById('natal-day').value, 10);
    const month = parseInt(document.getElementById('natal-month').value, 10);
    const year = parseInt(document.getElementById('natal-year').value, 10);

    const result = document.getElementById('natal-result');
    if (!day || !month || !year || day < 1 || day > 31 || month < 1 || month > 12) {
        result.classList.remove('hidden');
        result.innerHTML = '<p class="text-yellow-300 text-lg text-center">Inserisci giorno, mese e anno validi.</p>';
        return;
    }

    const n = window.bellineNatalCard(day, month, year);
    const card = window.getBellineCardById(n);
    bellineNatalSelected = card;

    const preview = document.getElementById('natal-top-preview');
    if (preview) {
        preview.innerHTML = `<p class="text-yellow-100">La tua Luce di nascita è <strong class="text-amber-300">${card.name}</strong> · <span class="text-yellow-200/80">${window.bellineSeriesName(card.series)}</span></p>`;
    }

    result.classList.remove('hidden');
    result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    renderNatalDetail(card, n);
}

// Export per il browser (chiamate dalle onclick/onchange)
// NB: setBellineMode e calculateNatalCard sono esportati dalle pagine che li definiscono (natale/narrativa).
window.startBellineReading = startBellineReading;
window.initializeBellineParticles = initializeBellineParticles;
window.initializeMagicCursorHalo = initializeMagicCursorHalo;
window.flexResetBelline = flexResetBelline;
window.openNatalCardDetail = openNatalCardDetail;
window.calculateNatalCard = calculateNatalCard;
window.displayBellineCard = displayBellineCard;
window.speakBellineAdvice = speakBellineAdvice;
window.stopBellineSpeech = stopBellineSpeech;
window.newBellineReading = newBellineReading;