// ===== Chiavi API — TEMPLATE =====
// Copia questo file in config.local.js e inserisci le tue chiavi.
// config.local.js NON va committato (vedi .gitignore).
//
// Da Fase B.1 le chiavi AI (Groq, ElevenLabs) NON vivono più nel client:
// vivono solo nei Secrets delle Edge Functions (belline-ai, belline-tts)
// in Dashboard → Edge Functions → Secrets. Rimuovere BELLINE_SERVER di
// seguito solo per override di sviluppo locale se necessario.
//
// Se config.local.js non è presente, il sito funziona comunque:
// perde soltanto il messaggio AI e la voce ElevenLabs (fallback Web Speech).

window.BELLINE_SECRETS = {
    groq: {
        apiKey: '' // NON più usato nel client (solo server-side)
    },
    elevenlabs: {
        apiKey: '' // NON più usato nel client (solo server-side)
    }
};

// Backend Supabase (Fase B) — chiave pubblicabile (anon), protetta dalle RLS.
// Senza questo blocco il sito resta in modalità locale (localStorage).
window.BELLINE_SUPABASE = {
    url: 'https://YOUR_PROJECT_REF.supabase.co',
    anonKey: 'sb_publishable_YOUR_KEY'
};

// Override di sviluppo per il proxy AI/TTS (opzionale): parametri pubblici,
// nessuna chiave segreta. Default: 'belline-ai' / 'belline-tts'.
// window.BELLINE_SERVER = {
//     ai: { functionName: 'belline-ai', model: 'llama-3.3-70b-versatile' },
//     elevenlabs: { functionName: 'belline-tts', voiceId: 'JBFqnCBsd6RMkjVDRZzb' }
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

// TTS ElevenLabs = feature dei piani a pagamento (Club/Esperto): l'audio AI
// viene generato solo se il piano (verificato lato server) è pagante.
// I free usano le voci di sistema del browser (gratuite).
// Il piano è 'free' di default; i piani paganti arrivano SOLO dal server
// (webhook Lemon Squeezy → profiles.plan), mai da un override locale.