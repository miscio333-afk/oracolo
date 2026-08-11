// Script usa-e-getta: legge docs/table-*.csv, normalizza le 6 colonne di dettaglio
// e stampa CARD_DETAILS pronto da incollare in belline.js
const fs = require('fs');
const path = require('path');

const SRC = process.argv[2] || path.join(__dirname, '..', 'docs', 'table-285dca4a-9452-4e9a-b9c3-9de69cdb3340.csv');

function parseCSV(text) {
    const rows = [];
    let row = [], field = '', inQ = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (inQ) {
            if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
            else if (ch === '"') { inQ = false; }
            else field += ch;
        } else {
            if (ch === '"') { inQ = true; }
            else if (ch === ',') { row.push(field); field = ''; }
            else if (ch === '\n') { row.push(field); field = ''; rows.push(row); row = []; }
            else if (ch === '\r') { /* skip */ }
            else field += ch;
        }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows;
}

const NOMI = {
    'Il Destino': '1', 'Stella dell\'Uomo': '2', 'Stella della Donna': '3',
    'Natività': '4', 'Riuscita': '5', 'Elevazione': '6', 'Onori': '7',
    'Pensiero Amicizia': '8', 'Campagna Salute': '9', 'Doni': '10',
    'Tradimento': '11', 'Partenza': '12', 'Incostanza': '13', 'Scoperta': '14',
    'L\'Acqua': '15', 'I Penati': '16', 'Malattia': '17',
    'Cambiamento': '18', 'Denaro': '19', 'Intelligenza': '20', 'Furto e Perdita': '21',
    'Imprese': '22', 'Traffico': '23', 'Notizia': '24',
    'Piaceri': '25', 'La Pace': '26', 'Unione': '27', 'Famiglia': '28',
    'Amore': '29', 'La Tavola': '30', 'Passioni': '31',
    'Cattiveria': '32', 'Processo': '33', 'Dispotismo': '34', 'Nemici': '35',
    'Trattative': '36', 'Fuoco': '37', 'Incidente': '38',
    'Appoggio': '39', 'Bellezza': '40', 'Eredità': '41', 'Saggezza': '42',
    'La Fama': '43', 'Il Caso': '44', 'Felicità': '45',
    'Avversità': '46', 'Sterilità': '47', 'Fatalità': '48', 'La Grazia': '49',
    'Rovina': '50', 'Ritardo': '51', 'Chiostro': '52', 'Carta Blu': '53'
};

const FR = {
    'carrefour': 'bivio',
    'recul': 'distanza critica e prospettiva',
    'remise en question': 'rimessa in discussione',
    'tranchare': 'tranciare',
    'bouillonnante': 'fervente',
    'hache de guerre enterrée': 'ascia di guerra sepolta',
    'maîtresse': 'amante',
    'al-zahr': '',
    'graine': 'seme',
    'L\'abondance': 'l\'abbondanza',
};

function lc(s) { return s.toLowerCase(); }

// Rimuove etichette "Tipo:" e normalizza spazi/punteggiatura
function clean(field) {
    let s = field.replace(/<br\s*\/?>/gi, ' ').trim();
    // rimuove etichette di blocco (Visiva:, Simbologia:, Mito:, ...)
    s = s.replace(/(Visiva|Simbologia|Mito|Storia|Psicologia|Sfumatura|Archetipo|Etimologia|Dualità)\s*:\s*/g, '');
    // galli -> sl/+ refusi tipografici
    s = s.replace(/\s+/g, ' ').trim();
    s = s.replace(/\.+/g, '.').replace(/\s*\.(\s|$)/g, '. ');
    // francesismi
    for (const k of Object.keys(FR)) {
        s = s.replace(new RegExp(k, 'gi'), FR[k]);
    }
    s = s.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
    return s.trim();
}

const raw = fs.readFileSync(SRC, 'utf8');
const rows = parseCSV(raw).filter(r => r.length >= 8 && /^\d+$/.test((r[0] || '').trim()));

const out = {};
for (const r of rows) {
    const cardName = (r[1] || '').replace(/<br\s*\/?>/gi, '').trim();
    const numKey = NOMI[cardName] ? cardName : null;
    // fallback: match by n. numerico della riga (identico all'ordine CSV)
    const n = (r[0] || '').trim();
    const key = numKey ? NOMI[cardName] : n;
    out[key] = {
        icon: clean(r[2] || ''),
        psych: clean(r[3] || ''),
        portrait: clean(r[4] || ''),
        advice: clean(r[5] || ''),
        direction: clean(r[6] || ''),
        outcome: clean(r[7] || ''),
    };
}

console.log(JSON.stringify(out, null, 2));