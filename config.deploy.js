// ===== Chiave pubBLICABILE — SICURA per il deploy =====
// Chiave pubblica del backend Supabase. Protetta da RLS lato server.
// Se config.local.js è già caricato, questa NON sovrascrive (dev locale resta attivo).

if (!window.BELLINE_SUPABASE) {
    window.BELLINE_SUPABASE = {
        url: 'https://woakwnvcphruuvbtfcqe.supabase.co',
        anonKey: 'sb_publishable_iOMoXiwk3mNA1vlU1flZCQ_jqc6BD_b'
    };
}

// Payment link pubblici Lemon Squeezy (nessun segreto). Se config.local.js è
// già caricato, NON sovrascrive: il dev locale può puntare a link di prova.
// Mappaggio verificato: 881f... = Club 6,90€, 59c0... = Lettore Esperto 14,90€.
// Varianti LMS (per il webhook belline-ls-webhook): 2009314 = club, 2009347 = expert.
if (!window.BELLINE_LEMONSQUEEZY) {
    window.BELLINE_LEMONSQUEEZY = {
        checkout: {
            club: 'https://oracolo-belline.lemonsqueezy.com/checkout/buy/881f5295-aadb-4ab8-8ccb-bf400233ea2a',
            expert: 'https://oracolo-belline.lemonsqueezy.com/checkout/buy/59c07398-36ce-46ea-a3c7-69e777a37669'
        }
    };
}