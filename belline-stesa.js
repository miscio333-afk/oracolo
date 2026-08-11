// Oracolo di Belline — Stesa libera con domanda.
// Dipende da: belline.js (dati), belline-common.js (logica condivisa).
// Definisce gli hook specifici della stesa libera (domanda + Carta Blu + demo video).

bellineMode = 'free';

// ---- Hook consumati da belline-common.js ----

// Numero di carte scelto dal consultante (select #belline-count)
window.bellineReadCount = function () {
    const el = document.getElementById('belline-count');
    const n = parseInt((el || {}).value, 10);
    return n >= 1 ? n : 3;
};

// La Carta Blu è inclusa solo se la checkbox è spuntata
window.bellineIncludeBlue = function () {
    const el = document.getElementById('belline-blue');
    return !!(el && el.checked);
};

// Nessun prerequisito per la stesa libera
window.bellinePreflight = function () { return null; };

// Prompt AI specifico della stesa libera
window.buildBellineAIPrompt = buildBellineAIPrompt;

// ---- Mescolamento Fisher-Yates (nuovo array, non muta l'originale) ----
function shuffleBellineArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Genera n domande dinamiche per un ambito, combinando template e contesti {B}
function generateBellineQuestions(key, n) {
    n = n || 8;
    const cat = BELLINE_QUESTION_TEMPLATES[key];
    if (!cat) return [];
    const tmpls = shuffleBellineArray(cat.templates);
    const tails = shuffleBellineArray(cat.tails);
    const out = [];
    const seen = new Set();
    let guard = 0;
    while (out.length < n && guard < 300) {
        guard++;
        const t = tmpls[guard % tmpls.length];
        const b = tails[(Math.floor(Math.random() * tails.length) + guard * 7) % tails.length];
        const text = t.split('{B}').join(b).replace(/\s+/g, ' ').trim();
        if (!seen.has(text)) {
            seen.add(text);
            out.push({ text, key, label: cat.label });
        }
    }
    return out;
}

// Rigenera la striscia orizzontale delle domande per l'ambito indicato
function regenerateBellineQuestions(key) {
    const strip = document.querySelector('#belline-question-examples .question-scroll');
    if (!strip) return;
    bellineGeneratedQuestions = generateBellineQuestions(key || bellineActiveAmbito, 8);
    strip.innerHTML = '';
    bellineGeneratedQuestions.forEach((item) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'question-chip';
        btn.textContent = item.text;
        btn.dataset.key = item.key;
        btn.addEventListener('click', () => {
            const input = document.getElementById('belline-question');
            if (input) input.value = item.text;
            bellineQuestionAmbito = item.key;
        });
        strip.appendChild(btn);
    });
}

// Imposta l'ambito attivo e ne rigenera le domande
function setBellineQuestionTab(key) {
    bellineActiveAmbito = key;
    const tabs = document.querySelectorAll('#belline-question-examples .question-tab');
    tabs.forEach((b) => {
        const active = b.dataset.key === key;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    regenerateBellineQuestions(key);
}

// Costruisce la barra tab (ambiti) + striscia orizzontale + bottone rigenera
function buildBellineQuestionExamples() {
    const container = document.getElementById('belline-question-examples');
    if (!container) return;

    const keys = Object.keys(BELLINE_QUESTION_TEMPLATES);

    const tabBar = document.createElement('div');
    tabBar.className = 'question-tabs';
    keys.forEach((key) => {
        const cat = BELLINE_QUESTION_TEMPLATES[key];
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.key = key;
        btn.className = 'question-tab';
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', 'false');
        btn.innerHTML = `<span class="question-tab-icon" aria-hidden="true">${cat.icon}</span><span>${cat.label}</span>`;
        btn.addEventListener('click', () => setBellineQuestionTab(key));
        tabBar.appendChild(btn);
    });

    const refresh = document.createElement('button');
    refresh.type = 'button';
    refresh.className = 'question-refresh';
    refresh.title = 'Rigenera le domande suggerite';
    refresh.setAttribute('aria-label', 'Rigenera le domande suggerite');
    refresh.textContent = '⟳';
    refresh.addEventListener('click', () => {
        if (bellineActiveAmbito) regenerateBellineQuestions(bellineActiveAmbito);
    });
    tabBar.appendChild(refresh);

    const strip = document.createElement('div');
    strip.className = 'question-scroll';
    strip.setAttribute('role', 'tabpanel');

    container.appendChild(tabBar);
    container.appendChild(strip);

    const input = document.getElementById('belline-question');
    if (input) input.addEventListener('input', updateBellineQuestionAmbito);

    setBellineQuestionTab(keys[0]);
}

// Determina l'ambito della domanda digitata confrontandola con le chip correnti
function updateBellineQuestionAmbito() {
    const input = document.getElementById('belline-question');
    if (!input) return;
    const value = input.value.trim();
    bellineQuestionAmbito = null;
    for (const item of bellineGeneratedQuestions) {
        if (item.text === value) {
            bellineQuestionAmbito = item.key;
            break;
        }
    }
}

// Mostra/nasconde la guida "Come formulare una buona domanda?"
function initBellineQuestionGuide() {
    const toggle = document.getElementById('belline-guide-toggle');
    const panel = document.getElementById('belline-guide');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', () => {
        const open = panel.classList.toggle('open');
        toggle.classList.toggle('open', open);
    });
}

// Prompt per l'AI stesa libera: contesto completo della stesa + domanda dell'utente
function buildBellineAIPrompt() {
    const questionInput = document.getElementById('belline-question');
    const question = questionInput ? questionInput.value.trim() : '';

    const lines = [];
    lines.push('Sei una cartomante esperto dell\'oracolo di Belline (54 carte tradizionali italiane). Il tuo mazzo NON è il tarot di Marsiglia: le carte hanno nomi propri come "La Tavola", "Il Dispotismo", "L\'Intelligenza".');
    if (question) {
        lines.push(`Il consultante ha posto questa domanda: «${question}».`);
        if (bellineQuestionAmbito) {
            const labels = { amore: 'amore', lavoro: 'lavoro', benessere: 'benessere', finanze: 'finanze' };
            lines.push(`Ambito della domanda: ${labels[bellineQuestionAmbito] || bellineQuestionAmbito}.`);
        }
    } else {
        lines.push('Il consultante non ha posto una domanda specifica: dai una sintesi generale della stesa.');
    }

    lines.push('');
    lines.push('Carte estratte (usa ESCLUSIVAMENTE questi nomi, non inventarne altri); la posizione in parentesi indica il ruolo nella stesa):');
    const positions = bellinePositionsFor(bellineDrawn.length);
    bellineDrawn.forEach((c, i) => {
        const polLabel = window.bellinePolarityLabel(window.bellinePolarityOf(c));
        const serieName = window.bellineSeriesName(c.series);
        const advice = window.bellineAdvice(c);
        const title = (positions[i] || {}).title || '';
        const tag = title ? ` (${title})` : '';
        const icon = (c.detail && c.detail.icon) ? ` Iconografia: ${c.detail.icon}.` : '';
        lines.push(`${i + 1}${tag}. "${c.name}" — ${polLabel}, serie ${serieName}.${icon} ${c.meaning || ''} Consiglio: ${advice}`);
    });

    const pairings = findAllBellinePairings();
    if (pairings.length) {
        lines.push('');
        lines.push('Abinamenti rilevati tra le carte:');
        pairings.forEach(p => {
            lines.push(`- ${p.a.name} e ${p.b.name}: ${p.note}`);
        });
    }

    const drawnCount = bellineDrawn.length;
    lines.push('');
    lines.push(`La stesa contiene esattamente ${drawnCount} carta(e). NON esistono altre carte, posizioni o luci in questa stesa.`);
    lines.push('Il campo "Iconografia" di ogni carta descrive esattamente cosa raffigura l\'immagine (simboli, figure, scene): usalo PER PRIMA COSA, prima del significato.');
    lines.push('Scrivi una lettura approfondita IN ITALIANO, con tono mistico ma concreto, strutturata in 6-8 paragrafi separati da riga vuota (ogni paragrafo corrisponde a una card):');
    lines.push('1) Esordio: PARTI SEMPRE dalla spiegazione visiva delle carte estratte — descrivi cosa mostrano le loro immagini (iconografia e simboli), poi rispondi direttamente alla domanda (o traccia il quadro generale della stesa se non c\'è domanda);');
    lines.push('2) Panorama complessivo: polarità dominante e tono generale della stesa;');
    if (drawnCount === 1) {
        lines.push('3) Analisi della carta estratta: descrivi PER PRIMO l\'iconografia (cosa raffigura l\'immagine), poi il significato, il legame con la domanda e cosa suggerisce di fare. Tutto il messaggio ruota SOLO attorno a questa carta: NON citare, spiegare o alludere a carte assenti, posizioni vuote o luci aggiuntive;');
    } else {
        lines.push(`3,4,5..) Procedi per ciascuna delle ${drawnCount} carte estratte, nell\'ordine: per ciascuna, PARTI dall\'iconografia (cosa raffigura l\'immagine), poi spiega il significato, come si lega alla domanda e cosa suggerisce di fare;`);
    }
    lines.push('Ultimo paragrafo) Consiglio pratico finale, concreto e orientato all\'azione.');
    lines.push(`Cita per nome OGNI carta della lista precedente con il suo significato. La stesa conta esattamente ${drawnCount} carta(e): NON creare e NON nominare nessuna carta, seme o figura che non sia nella lista (vietati: arcani, papesse, cavalieri, spade, denari, coppe, bastoni) e NON parlare di posizioni, luci o carte in più di quelle estratte.`);
    lines.push('Non usare elenchi puntati: ogni paragrafo è un blocco di 2-3 frasi scorrevoli, separato dagli altri da una riga vuota.');
    lines.push('Rilassa la creatività narrativa a favore della precisione: meglio un testo meno poetico ma fedele alle carte indicate, citando ogni carta esattamente una volta.');

    return lines.join('\n');
}

// Inizializza la pagina "Stesa di Belline"
function initStesaPage() {
    const count = document.getElementById('belline-count');
    const blue = document.getElementById('belline-blue');
    if (count) count.addEventListener('change', flexResetBelline);
    if (blue) blue.addEventListener('change', flexResetBelline);

    buildBellineQuestionExamples();
    initBellineQuestionGuide();
    bellineShuffleBind();
}

document.addEventListener('DOMContentLoaded', initStesaPage);

// Export utili per la console
window.generateBellineQuestions = generateBellineQuestions;
window.regenerateBellineQuestions = regenerateBellineQuestions;
window.setBellineQuestionTab = setBellineQuestionTab;