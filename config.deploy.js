// ===== Chiave pubBLICABILE — SICURA per il deploy =====
// Chiave pubblica del backend Supabase. Protetta da RLS lato server.
// Se config.local.js è già caricato, questa NON sovrascrive (dev locale resta attivo).

if (!window.BELLINE_SUPABASE) {
    window.BELLINE_SUPABASE = {
        url: 'https://woakwnvcphruuvbtfcqe.supabase.co',
        anonKey: 'sb_publishable_iOMoXiwk3mNA1vlU1flZCQ_jqc6BD_b'
    };
}