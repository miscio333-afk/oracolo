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

// TTS ElevenLabs = feature dei piani a pagamento (Club/Esperto): l'audio AI
// viene generato solo se il piano (verificato lato server) è pagante.
// I free usano le voci di sistema del browser (gratuite).
// Il piano è 'free' di default.
//
// Per lo sviluppo locale puoi forzare un piano dall'override qui sotto:
// window.BELLINE_PLAN_OVERRIDE = 'club'; // 'free' | 'club' | 'expert'