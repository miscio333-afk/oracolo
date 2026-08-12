// ===== Chiavi API — TEMPLATE =====
// Copia questo file in config.local.js e inserisci le tue chiavi.
// config.local.js NON va committato (vedi .gitignore).
//
// Da Fase B.1 le chiavi AI (Groq) NON vivono più nel client: vivono solo nei
// Secrets delle Edge Functions (belline-ai) in Dashboard → Edge Functions →
// Secrets. Rimuovere BELLINE_SERVER di seguito solo per override di sviluppo.
//
// La sintesi vocale usa Microsoft Edge TTS (server-side, via Edge Function
// 'belline-tts'): voce neurale Azure, nessuna chiave API, gratis per tutti.
//
// Se config.local.js non è presente, il sito funziona comunque:
// perde soltanto il messaggio AI (fallback rule-based) e la voce Edge TTS
// (fallback Web Speech di sistema).

window.BELLINE_SECRETS = {
    groq: {
        apiKey: '' // NON più usato nel client (solo server-side)
    }
};

// Backend Supabase (Fase B) — chiave pubblicabile (anon), protetta dalle RLS.
// Senza questo blocco il sito resta in modalità locale (localStorage).
window.BELLINE_SUPABASE = {
    url: 'https://YOUR_PROJECT_REF.supabase.co',
    anonKey: 'sb_publishable_YOUR_KEY'
};

// Override di sviluppo per il proxy AI e il TTS Edge (opzionale): parametri
// pubblici, nessuna chiave segreta. Default: 'belline-ai' / voce Isabella.
// window.BELLINE_SERVER = {
//     ai: { functionName: 'belline-ai', model: 'llama-3.3-70b-versatile' },
//     edgeTts: { functionName: 'belline-tts', voice: 'it-IT-IsabellaNeural' }
// };

// Lemon Squeezy — payment link pubblici degli abbonamenti (nessun segreto qui).
// URL da LMS: Products → Share → Copia link del checkout.
// Il piano viene attivato lato server dal webhook (Edge Function belline-ls-webhook),
// a cui agganciamo user_id via ?checkout[custom][uid]=... e prefill email.
// Varianti LMS del negozio reale (per il FALLBACK_VARIANT_MAP del webhook):
// 2009314 = Club 6,90 €/mese, 2009347 = Lettore Esperto 14,90 €/mese.
window.BELLINE_LEMONSQUEEZY = {
    checkout: {
        club: 'https://STORE.lemonsqueezy.com/checkout/buy/CLUB_CHECKOUT_ID',
        expert: 'https://STORE.lemonsqueezy.com/checkout/buy/EXPERT_CHECKOUT_ID'
    }
};

// TTS = sintesi vocale neurale (Microsoft Edge TTS) generata server-side
// dall'Edge Function 'belline-tts': nessun modello da scaricare nel browser,
// disponibile per tutti i piani. Voce di default: it-IT-IsabellaNeural.
// Il piano è 'free' di default; i piani paganti arrivano SOLO dal server
// (webhook Lemon Squeezy → profiles.plan), mai da un override locale.