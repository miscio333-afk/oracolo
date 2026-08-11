// Oracolo di Belline — Pagina Natale (Calcolo della propria Luce di nascita).
// Dipende da: belline.js (dati), belline-common.js (logica condivisa: calcolo, dettaglio, serie).
// La pagina natale non estrae carte: espone solo il calendario e il riferimento delle serie.

bellineMode = 'free';

// ---- Hook consumati da belline-common.js (nessuna estrazione su questa pagina) ----

window.bellineReadCount = function () { return 1; };
window.bellineIncludeBlue = function () { return false; };
window.bellinePreflight = function () {
    if (!bellineNatalCardFromInputs()) {
        return 'Inserisci giorno, mese e anno di nascita validi per calcolare la tua Luce.';
    }
    return null;
};

// Il prompt AI non viene usato sulla pagina natale
window.buildBellineAIPrompt = function () { return ''; };

// Inizializza la pagina Natale
function initNatalePage() {
    // Il calcolo è in comune (calculateNatalCard → renderNatalDetail)
    const day = document.getElementById('natal-day');
    const month = document.getElementById('natal-month');
    const year = document.getElementById('natal-year');
    [day, month, year].forEach(el => {
        if (el && el.type === 'number') {
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    window.calculateNatalCard();
                }
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', initNatalePage);

window.initNatalePage = initNatalePage;