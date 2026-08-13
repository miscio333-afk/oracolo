# L'Oracolo di Belline - Project Outline

## File Structure

```
/
├── index.html              # Single page: Oracolo di Belline (home + app)
├── styles.css              # Design system condiviso
├── belline.js              # Dati del mazzo di Belline (52 Luci + Carta Blu)
├── belline-common.js       # Logica condivisa, advice, TTS e particelle
├── belline-stesa.js        # Stesa libera
├── belline-narrativa.js    # Passato, Presente, Futuro
├── belline-natale.js       # Carta Natale
├── belline-backend.js      # Supabase Auth, wallet e storico
├── belline-wallet.js       # Crediti e gating client-side
├── tools/                  # Script di generazione delle carte
└── resources/
    ├── belline/            # 53 carte Belline in SVG
    └── backgrounds/        # Retro carta (mystical_bg.png)
```

## Page Organization

### index.html - L'Oracolo di Belline
**Purpose:** App unica — lettura dell'Oracolo di Belline
**Sections:**
1. **Header** — Titolo "L'Oracolo di Belline" con aurora e particelle d'oro
2. **Stesa** — Guida alla domanda, input, esempi di domande, conteggio carte, mazzo
3. **Le Luci Estratte** — Griglia delle carte con reveal animato
4. **Abbinamenti** — Combinazioni tra le carte estratte
5. **Messaggio Generale** — Advice testuale, lettura TTS, dettaglio delle Luci
6. **Carta Natale** — Calcolo della carta personale
7. **Le Sette Luci Astrali** — Riferimento delle serie

## Interactive Components

- **Stesa:** click sul mazzo → estrazione → reveal animato (Anime.js)
- **Advice:** generazione del messaggio generale con dettaglio per carta e polarità (favorevole/avversa/neutra)
- **TTS:** Edge TTS server-side tramite Edge Function, con fallback Web Speech
- **Particelle:** polvere d'oro con Canvas 2D nativo (disattivata con `prefers-reduced-motion`)
- **Sfondi:** aurora animata + vignettatura/grana via CSS

## Libraries
- **Anime.js:** animazioni di reveal e micro-interazioni
- **Canvas 2D:** particelle di sfondo
- **Tailwind CSS:** utility classes
- **Fonts:** Cinzel, Quattrocento Sans, MedievalSharp

## Data Structure
- **bellineDeck:** 52 Luci (4 serie × 13) + Carta Blu
- **Polarità:** ogni carta ha polarità good/neutral/bad e nota esplicativa
- **Abbinamenti:** coppie di carte con significato combinato
