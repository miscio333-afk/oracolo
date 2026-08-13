// Oracolo di Belline — Stesa Narrativa (Passato · Presente · Futuro, in luce della Carta Natale).
// Dipende da: belline.js (dati), belline-common.js (logica condivisa).
// Definisce gli hook specifici: data di nascita obbligatoria + sesso per la concordanza in italiano.

bellineMode = 'narrative';

// ---- Hook consumati da belline-common.js ----

// La stesa narrativa usa sempre tre luci fisse
window.bellineReadCount = function () { return 3; };

// La Carta Blu non fa parte della stesa narrativa
window.bellineIncludeBlue = function () { return false; };

// Sesso selezionato: 'male' | 'female' | null
window.bellineSexValue = function () { return bellineSex; };

// Etichetta leggibile del sesso
window.bellineSexLabel = function () {
    if (bellineSex === 'male') return 'Maschile';
    if (bellineSex === 'female') return 'Femminile';
    return '';
};

// Prerequisiti: data di nascita valida e sesso selezionato
window.bellinePreflight = function () {
    if (!bellineNatalCardFromInputs()) {
        return 'Per la Stesa Narrativa inserisci prima giorno, mese e anno di nascita validi.';
    }
    if (!bellineSex) {
        return 'Seleziona il tuo sesso (Maschile o Femminile) per la Stesa Narrativa.';
    }
    return null;
};

// Prompt AI specifico della stesa narrativa
window.buildBellineAIPrompt = buildBellineNarrativeAIPrompt;

// Testo di stato iniziale sotto il mazzo (hint specifico della narrativa)
window.bellineCustomStatusHint = function () {
    return 'Tieni premuto e muovi il cursore sul mazzo per svelare la tua stesa Passato · Presente · Futuro in luce della Carta Natale.';
};

// ---- Setup consultante: data di nascita + sesso ----

// Aggiorna la preview (banner) con Carta Natale e sesso
function renderNarrativePreview() {
    const preview = document.getElementById('natal-top-preview');
    if (!preview) return;
    const natal = bellineNatalSelected || bellineNatalCardFromInputs();
    const sexLabel = window.bellineSexLabel();
    if (!natal) {
        preview.innerHTML = '<p class="text-yellow-100 text-sm italic">Inserisci una data di nascita valida per rivelare la tua Luce.</p>';
        return;
    }
    const serie = window.bellineSeriesName(natal.series);
    const safeSexPart = sexLabel
        ? ` · Sesso: <strong class="text-amber-300">${escapeBellineHtml(sexLabel)}</strong>`
        : '<span class="text-yellow-200/70 text-sm"> · seleziona il sesso</span>';
    preview.innerHTML = `<p class="text-yellow-100">La tua Luce di nascita è <strong class="text-amber-300">${escapeBellineHtml(natal.name)}</strong> · <span class="text-yellow-200/80">${escapeBellineHtml(serie)}</span>${safeSexPart}</p>`;
}

// Cambio sesso: aggiorna stato, stile delle pillole e preview
function onSexChange(event) {
    bellineSex = event.target.value === 'female' ? 'female' : event.target.value === 'male' ? 'male' : null;
    document.querySelectorAll('input[name="belline-sex"]').forEach(r => {
        const wrap = r.closest('.mode-pill');
        if (wrap) wrap.classList.toggle('is-active', r.checked);
    });
    renderNarrativePreview();
    flexResetBelline();
}

// Inizializza la pagina "Stesa Narrativa"
function initNarrativaPage() {
    document.querySelectorAll('input[name="belline-sex"]').forEach(r => r.addEventListener('change', onSexChange));

    ['natal-day', 'natal-month', 'natal-year'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', () => {
            bellineNatalSelected = null;
            bellineNatalSelected = bellineNatalCardFromInputs();
            renderNarrativePreview();
            flexResetBelline();
        });
    });

    renderNarrativePreview();
    bellineCountHint();
    bellineShuffleBind();
}

// Prompt dedicato alla Stesa Narrativa: Passato/Presente/Futuro in luce della Carta Natale
function buildBellineNarrativeAIPrompt() {
    const natal = bellineNatalSelected || bellineNatalCardFromInputs();
    const lines = [];
    lines.push('Sei una cartomante esperto dell\'oracolo di Belline (54 carte tradizionali italiane). Il tuo mazzo NON è il tarot di Marsiglia: le carte hanno nomi propri come "La Tavola", "Il Dispotismo", "L\'Intelligenza".');

    if (natal) {
        const serie = window.bellineSeriesName(natal.series);
        const pol = window.bellinePolarityLabel(window.bellinePolarityOf(natal));
        const first = (natal.meaning || '').split('.')[0].trim();
        lines.push(`Il consultante ha calcolato la sua Luce di nascita: "${natal.name}" (${pol}, serie ${serie}${first ? '; ' + first : ''}). Usala come filtro emotivo e di sfondo per l'intera lettura.`);
    } else {
        lines.push('Il consultante non ha indicato la data di nascita: procedi senza la Luce di nascita.');
    }

    if (bellineSex === 'male') {
        lines.push('Il consultante è di sesso maschile: scrivi in italiano concordando al maschile (es. "è nato", "vedrà").');
    } else if (bellineSex === 'female') {
        lines.push('La consultante è di sesso femminile: scrivi in italiano concordando al femminile (es. "è nata", "vedrà").');
    } else {
        lines.push('Sesso non indicato: usa una forma neutra e inclusiva.');
    }

    lines.push('');
    lines.push('Tre carte estratte in posizioni fisse (usa ESCLUSIVAMENTE questi nomi, non inventarne altri):');
    const posNames = ['Passato', 'Presente', 'Futuro'];
    bellineDrawn.forEach((c, i) => {
        const pos = posNames[i] || `Posizione ${i + 1}`;
        const polLabel = window.bellinePolarityLabel(window.bellinePolarityOf(c));
        const serieName = window.bellineSeriesName(c.series);
        const advice = window.bellineAdvice(c);
        const icon = (c.detail && c.detail.icon) ? ` Iconografia: ${c.detail.icon}.` : '';
        lines.push(`${i + 1} (${pos}). "${c.name}" — ${polLabel}, serie ${serieName}.${icon} ${c.meaning || ''} Consiglio: ${advice}`);
    });

    lines.push('');
    lines.push('Il campo "Iconografia" di ogni carta descrive esattamente cosa raffigura l\'immagine (simboli, figure, scene): usalo PER PRIMA COSA, prima del significato.');
    lines.push('Scrivi una lettura IN ITALIANO, tono mistico ma concreto, strutturata in 4 paragrafi separati da riga vuota:');
    lines.push('1) Passato — da dove vieni: APRI descrivendo brevemente cosa raffigurano le immagini delle tre carte estratte, poi analizza la carta del passato e come ha plasmato la situazione attuale;');
    lines.push('2) Presente — dove sei: PARTI dall\'iconografia della carta del presente (cosa raffigura), poi spiega cosa stai vivendo adesso e come si aggancia al passato;');
    lines.push('3) Futuro — dove vai: PARTI dall\'iconografia della carta del futuro (cosa raffigura), poi la tendenza che si sta preparando;');
    lines.push('4) Esito — l\'insieme delle tre tappe in luce della Carta Natale del consultante, con un consiglio pratico finale.');
    lines.push('Per ogni carta del passato, presente e futuro, la spiegazione dell\'immagine (iconografia) viene SEMPRE prima del significato.');
    lines.push('Cita per nome ogni carta, in italiano, senza introdurre arcani o figure inventate. Ogni paragrafo è un blocco di 2-3 frasi scorrevoli senza elenchi puntati.');

    return lines.join('\n');
}

document.addEventListener('DOMContentLoaded', initNarrativaPage);

// Export utili per la console
window.buildBellineNarrativeAIPrompt = buildBellineNarrativeAIPrompt;
window.renderNarrativePreview = renderNarrativePreview;
window.onSexChange = onSexChange;
