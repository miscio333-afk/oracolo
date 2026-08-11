// Genera le placeholder SVG Art Nouveau per l'Oracolo di Belline.
// Giochino: node tools/generate-belline.js
// Output: resources/belline/card_01.svg ... card_52.svg + card_blue.svg

const fs = require('fs');
const path = require('path');
const models = require('../belline.js');

const OUT_DIR = path.join(__dirname, '..', 'resources', 'belline');
const W = 348;
const H = 522;
const CX = W / 2;
const CY = H / 2;

function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Glifo astratto Art-Nouveau per ogni serie (forme geometriche semplici, senza testo)
function glyph(series, accent) {
    const sw = 4.5;
    const o = { stroke: accent, fill: 'null', strokeWidth: sw };
    const p = [];
    switch (series) {
        case 'prime': // chiave stilizzata
            p.push(`<circle cx="${CX}" cy="${CY - 8}" r="30" stroke="${o.stroke}" stroke-width="${o.stroke}" fill="none"/>`);
            p.push(`<path d="M ${CX} ${CY} l 0 46 M ${CX - 16} ${CY + 52} l 0 10 M ${CX + 16} ${CY + 52} l 0 10" stroke="${o.stroke}" stroke-width="${o.stroke}" fill="none"/>`);
            break;
        case 'sole': // raggi solari
            for (let i = 0; i < 12; i++) {
                const a = (i * Math.PI) / 6;
                const x1 = CX + Math.cos(a) * 48, y1 = CY + Math.sin(a) * 48;
                const x2 = CX + Math.cos(a) * 64, y2 = CY + Math.sin(a) * 64;
                p.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${o.stroke}" stroke-width="${o.stroke}"/>`);
            }
            p.push(`<circle cx="${CX}" cy="${CY}" r="36" stroke="${o.stroke}" stroke-width="${o.stroke}" fill="none"/>`);
            break;
        case 'luna': // falce di luna
            p.push(`<path d="M ${CX} ${CY - 44} a 44 42 0 1 0 6 84 a 36 28 0 1 1 -6 -84 Z" stroke="${o.stroke}" stroke-width="${o.stroke}" fill="rgba(201,169,232,0.22)"/>`);
            break;
        case 'mercurio': // caduceo
            p.push(`<line x1="${CX}" y1="${CY - 46}" x2="${CX}" y2="${CY + 46}" stroke="${o.stroke}" stroke-width="${o.stroke}"/>`);
            p.push(`<path d="M ${CX} ${CY - 12} q -44 -8 -38 -30 q 38 8 38 30 Z M ${CX} ${CY - 12} q 44 -8 38 -30 q -38 8 -38 30 Z" stroke="${o.stroke}" stroke-width="3" fill="none"/>`);
            p.push(`<circle cx="${CX}" cy="${CY - 50}" r="7" fill="${o.stroke}" stroke="none"/>`);
            break;
        case 'venere': // cuore
            p.push(`<path d="M ${CX} ${CY + 8} c -34 -26 -56 -50 -56 -14 c 0 32 56 62 56 90 M ${CX} ${CY + 8} c 34 -26 56 -6 56 -14 c 0 32 -56 62 -56 90" stroke="${o.stroke}" stroke-width="3.5" fill="rgba(247,200,216,0.3)"/>`);
            break;
        case 'marte': // spada
            p.push(`<path d="M ${CX} ${CY - 48} v 80 M ${CX} ${CY + 8} l -14 26 h 28 Z" stroke="${o.stroke}" stroke-width="3.5" fill="none"/>`);
            break;
        case 'giove': // corona
            p.push(`<path d="M ${CX - 40} ${CY + 34} l 12 -38 18 30 10 -20 10 20 18 -30 12 38 Z" stroke="${o.stroke}" stroke-width="3.5" fill="rgba(255,224,138,0.3)"/>`);
            break;
        case 'saturno': // clessidra/planeta saturnio
            p.push(`<path d="M ${CX - 30} ${CY - 40} h 60 v 18 l -44 26 v 12 h 44 M ${CX + 30} ${CY + 40} h -60 v -18 l 44 -26 v -12" stroke="${o.stroke}" stroke-width="3.5" fill="none"/>`);
            break;
        case 'azzurra': // stella protettiva
            p.push(`<path d="M ${CX} ${CY - 48} l 12 32 34 2 -26 22 8 32 -28 -18 -28 18 8 -32 -26 -22 34 -2 Z" stroke="${o.stroke}" stroke-width="2.5" fill="rgba(120,180,255,0.35)"/>`);
            break;
        default:
            p.push(`<circle cx="${CX}" cy="${CY}" r="40" stroke="${o.stroke}" stroke-width="3" fill="none"/>`);
            break;
    }
    return p.join('\n  ');
}

function buildSvg(card) {
    const meta = models.bellineSeriesMeta[card.series] || { label: 'Carta', accent: '#B8860B' };
    const accent = meta.accent;
    const isBlue = card.num == null;
    const name = esc(card.name);
    const sr = esc(card.series === 'azzurra' ? 'PROTEZIONE' : card.series.toUpperCase());

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Georgia, 'Times New Roman', serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3A1C5C"/>
      <stop offset="0.58" stop-color="#7A1E2E"/>
      <stop offset="1" stop-color="#1B0F30"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#E7C677"/>
      <stop offset="0.5" stop-color="#B8860B"/>
      <stop offset="1" stop-color="#8A6D0A"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14" fill="none" stroke="url(#gold)" stroke-width="3"/>
  <rect x="22" y="22" width="${W - 44}" height="${H - 44}" rx="10" fill="none" stroke="url(#gold)" stroke-width="1"/>

  <path d="M ${CX} 24 l -9 12 M ${CX} 24 l 9 12" stroke="url(#gold)" stroke-width="2" fill="none"/>
  <path d="M 30 30 q 0 -18 18 -18 M ${W - 30} 30 q 0 -18 -18 -18" stroke="url(#gold)" stroke-width="2" fill="none"/>
  <path d="M 30 ${H - 30} q 0 18 18 18 M ${W - 30} ${H - 30} q 0 18 -18 18" stroke="url(#gold)" stroke-width="2" fill="none"/>

  <text x="${CX}" y="66" text-anchor="middle" font-size="20" fill="#F0D98A" font-weight="bold" letter-spacing="4">${isBlue ? 'BLU' : models.toRoman(card.num)}</text>

  <circle cx="${CX}" cy="${CY + 90}" r="66" fill="rgba(0,0,0,0.3)" stroke="url(#gold)" stroke-width="2.5"/>
  <circle cx="${CX}" cy="${CY + 90}" r="72" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.55"/>
  <g transform="translate(0, 90)">${glyph(card.series, accent)}</g>

  <text x="${CX}" y="${CY + 186}" text-anchor="middle" font-size="13" fill="${accent}" letter-spacing="3">${sr}</text>

  <text x="${CX}" y="${H - 46}" text-anchor="middle" font-size="17" fill="#FFF6E0" font-weight="bold">${name}</text>
  <text x="${CX}" y="${H - 26}" text-anchor="middle" font-size="11" fill="#DFC17A" letter-spacing="1">${isBlue ? 'JOLLY · PROTEZIONE' : esc(meta.label)}</text>
</svg>`;
}

function main() {
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    let written = 0;
    models.bellineDeck.forEach((card) => {
        fs.writeFileSync(path.join(OUT_DIR, `card_${card.num.toString().padStart(2, '0')}.svg`), buildSvg(card));
        written++;
    });
    fs.writeFileSync(path.join(OUT_DIR, 'card_blue.svg'), buildSvg(models.bellineBlueCard));
    written++;

    console.log(`Generati ${written} SVG in ${OUT_DIR}`);
}

main();