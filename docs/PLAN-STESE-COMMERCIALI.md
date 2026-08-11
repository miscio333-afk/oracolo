# Piano Commerciale per L'Oracolo di Belline

**Status:** MVP (Fase A) — modello crediti, economia e strategia account validate sui competitor.
**Data:** 2026-08-11
**Decisioni prese:** modello **crediti (pack + abbonamento)**, accesso **ibrido (anonimo → email magic link → Google)**.

---

## 1. Quadro competitivo

Ricerche effettuate sulle app di tarot/oracoli AI (TarotGuide AI, TarotVibes, Nostra Tarot, Tarotia, Tarotop, Tarot AI, TAROT AI).

| App | Modello | Prezzi | Free tier |
|---|---|---|---|
| TarotGuide AI | Crediti + abbonamento + minimo free | Lite 9,90€/100 cr · Pro 19,90€/250 · Max 29,90€/500 | 20 cr all'iscrizione (30gg) |
| TarotVibes | Crediti giornalieri + premium | — | 3 crediti/giorno, senza carta |
| Nostra Tarot | Acquisto crediti | fasce di crediti | limitato |
| Tarotia / Tarotop | Freemium | — | gratis, senza registrazione |
| TarotAI / TAROT AI | Premium | — | chat/lettura gratis quotidiana |

### Regole di mercato ricavate
- **Tasso di cambio standard:** `1 carta = 1 credito`. La stesa costa quanti più crediti quante più carte contiene.
- **Free tier tipico: 1-3 letture/giorno.** I multi-carta, le interpretazioni profonde e lo storico sono il paywall.
- **"Nessuna registrazione è un claim di marketing forte."** I competitor "senza account" attivano l'account solo al salvataggio della cronologia.
- **Il credito serve a gestire i costi tecnici** (LLM + TTS), non è solo una metrica UX.
- Tutti usano il disclaimer "solo a scopo di intrattenimento" + consenso GDPR.

---

## 2. Economia dei crediti L'Oracolo di Belline

| Stesa | Costo (crediti) |
|---|---|
| Carta del Giorno (1 carta) | 1 |
| Stesa libera (1 / 3 / 7 carte) | 1 / 3 / 7 |
| Stesa Narrativa Passato·Presente·Futuro | 4 |
| Qualsiasi stesa **con Carta Blu** | +1 (upsell "modo approfondito") |
| Carta di Nascita | **gratis** (lead magnet) |

La **Carta Blu** e le **domande di follow-up** sono i *margin-killer*: costano quasi nulla di API ma giustificano l'upgrade.

---

## 3. Pricing

| Piano | Prezzo | Contenuto |
|---|---|---|
| **Free** | 0€ | **4 crediti/giorno** (= 1 lettura completa con Carta Blu, oppure una da 3 + una da 1) + Carta Natale gratis + 5 letture in storico |
| **Club** (abbonamento mensile) | 6,90€/mese | 120 crediti/mese + storico illimitato + Carta Blu inclusa + **Ascolta il messaggio (audio AI ElevenLabs)** |
| **Pack crediti** (non scadono) | 3,90€ = 50 · 6,90€ = 100 · 12,90€ = 250 | per chi non vuole abbonarsi |
| **Lettore Esperto** | 14,90€/mese | 300 crediti + follow-up illimitati + **Ascolta il messaggio (audio AI ElevenLabs)** |

Ancoraggio ai competitor EU ma aggressivo (6,90€ vs 9,90€) per il lancio.

**Regola monetizzazione TTS:** *Ascolta il messaggio* usa ElevenLabs (API a pagamento) ed è
riservato a **Club** ed **Esperto**; il piano Free ascolta solo con le voci di sistema del
browser (gratuite, zero chiamate API). Gate `bellineCanListen()` in `belline-wallet.js`.

---

## 4. Strategia account ibrido

1. **Anonimo da subito:** si legge senza account (stato sul device, `localStorage`).
2. **Al momento critico** (superare le 5 letture di storico) → prompt non-invasivo: "Crea un account per salvare tutte le tue letture".
3. **Email magic link** (niente password) → **Google Sign-In** come opzione (Fase B).

L'iscrizione obbligatoria è un drop-off nel B2C italiano: il pattern vincente è *guest → email → Google*.

---

## 5. Architettura

### Fase A — Locale (MVP, nessun server) — implementata
- Stato e storico in `localStorage`; wallet crediti locale con reset giornaliero.
- Chiavi API spostate fuori dal codice pubblico in `config.local.js` (gitignored).
- Nessun pagamento reale: crediti "demo" per misurare la conversione potenziale.
- Piano utente simulato: `belline.plan.v1` in localStorage (`free`|`club`|`expert`, default `free`); override dev `BELLINE_PLAN_OVERRIDE` in `config.local.js`. Per testare un pagante: `bellineWallet.setPlan('club')` da console. In Fase B questa flag viene sostituita dal piano verificato lato server.

### Fase B — Monetizzazione
- **Backend:** Supabase (Auth anon → email → Google, Postgres per wallet/storico, Edge Functions come proxy API). Alternativa: Cloudflare Workers + D1.
- **Proxy API:** le chiavi Groq/ElevenLabs passano solo server-side → rate limiting + limiti per utente.
- **Pagamenti:** **Lemon Squeezy** (merchant of record: gestisce IVA OSS e fatture EU) con fallback Stripe. Se app mobile: IAP Apple/Google (obbligatorio per gli store).

---

## 6. Costi mensili stimati e margine

Per 1.000 utenti, ~20 letture/giorno:

| Voce | Costo/mese |
|---|---|
| Groq (LLM) | 0€ (modelli free tier, quota settimanale) |
| ElevenLabs (solo audio per paganti) | 15-25€ |
| Supabase Free/Optimized | 0-25€ |
| Lemon Squeezy | 5% + 0,50€/transazione (incluso nel prezzo) |
| **Margine lordo** | **~85-90%** |

---

## 7. Legal / Compliance (Italia + UE)

- Disclaimer "**solo a scopo di intrattenimento**" (obbligatorio, come i competitor).
- **GDPR:** consenso cookie, privacy policy, diritto di oblio. Le letture sono dati personali (questioni ± dati anagrafici in narrativa).
- Vendita digitale: diritto di recesso su contenuto digitale → crediti come contenuto consumabile "distribuito immediatamente" (esclusione 14gg) o gestione conferma-consenso.
- Termini che vietano decisioni mediche, legali o finanziarie fondate sui risultati; verifica età 18+.

---

## 8. Crescita (in ordine di impatto)

1. **SEO — Carta di Nascita come lead magnet** (già gratis): pagine per ogni Luce ("Significato di La Stella", "Serie delle Luci") + schema `FAQ`/`HowTo`.
2. **Programma benvenuto:** 20 crediti alla registrazione + 3 crediti per amico invitato (referral).
3. **Streak giornaliero** (Carta del Giorno consecutiva → badge), come TarotVibes.
4. **Follow-up a pagamento** ("Perché hai ricevuto La Luna?"), leva di ripetibilità.
5. **Notifiche push** (Fase B) per il ritorno giornaliero.

---

## 9. Roadmap esecutiva

- **Fase A (verifica reale):** wallet crediti demo (4/giorno), storico di 5 letture, banner teaser account al 6° salvataggio, chiavi rimosse dal codice pubblico. Metrica: **quanti utenti superano le 5 letture/anominano lo storico → tasso di conversione potenziale**.
- **Fase B:** Supabase auth + wallet server-side + proxy + Lemon Squeezy.
- **Beta 10-20 utenti reali:** test del prezzo Club 6,90€/mese e pack 3,90€ prima del lancio pubblico.

---

## 10. Sicurezza

- File con chiavi non committati (`.gitignore`): `config.local.js`, `shots/`, `.DS_Store`.
- **Rotazione consigliata** delle chiavi Groq ed ElevenLabs (erano hardcoded nel client): eseguire prima di qualsiasi deploy pubblico.
- La protezione definitiva arriva in Fase B (le chiavi vivono solo server-side).

---

## Criteri di accettazione Fase A

- [x] Chip wallet "🪙 X/4 crediti oggi" sulle pagine di lettura (stesa, narrativa). L'index è solo una landing (nessuna estrazione → nessun wallet).
- [x] Costo progressivo per lettura (1/3/7 ± Carta Blu).
- [x] Dopo la lettura completa (4 crediti, o in generale quando il portafoglio è insufficiente): blocco dolce "crediti demo esauriti (si ricaricano domani)", reset al giorno successivo.
- [x] Storico delle ultime 5 letture (data, domanda, carte, testo) persistito e navigabile.
- [x] Teaser account al 6° salvataggio.
- [x] Con `config.local.js` assente: il sito continua a funzionare senza AI/TTS (fallback già esistente).
- [x] Chiavi API rimosse dai file JS pubblici.
- [x] Nessuna regressione del flusso esistente.