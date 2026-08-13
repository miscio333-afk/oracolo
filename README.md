# L'Oracolo di Belline

Sito statico multipagina per consultare il mazzo Belline, con stese libere,
stesa narrativa, Carta Natale, storico locale/cloud e checkout Lemon Squeezy.

## Sviluppo locale

Serve un web server statico: i file non devono essere aperti direttamente con
`file://`, perché auth, moduli Edge e alcune API browser richiedono un origin.

```bash
npx serve .
```

Configurazione opzionale:

1. Copiare `config.example.js` in `config.local.js`.
2. Inserire URL e chiave pubblicabile Supabase.
3. Non committare `config.local.js`: è già escluso da `.gitignore`.

Senza configurazione Supabase il sito resta utilizzabile in modalità locale,
con fallback rule-based per il messaggio e Web Speech per la voce.

## Verifica

```bash
npm test
npm run check
```

I test automatici coprono la regola secondo cui un piano pagante memorizzato in
`localStorage` non concede accesso senza conferma del profilo server.

## Confine di sicurezza

Il client gestisce solo cache e interfaccia. Non è una fonte affidabile per
assegnare piani paganti, validare pagamenti, proteggere crediti o autorizzare
accesso a dati cloud.

Queste garanzie devono essere implementate nelle Edge Functions e nelle policy
RLS Supabase. Il webhook Lemon Squeezy deve validare la firma del webhook e
aggiornare il piano solo per l'utente corretto.

## Deploy

Il deploy è compatibile con Vercel. Prima della pubblicazione verificare:

- Edge Functions AI/TTS/webhook attive;
- policy RLS su `profiles`, `wallets` e `readings`;
- limiti server-side per AI e TTS;
- compatibilità degli header COOP/COEP con Supabase, CDN e checkout;
- checkout di test completato e piano aggiornato dal webhook.
