// Oracolo di Belline — Backend Supabase (Fase B).
// Persistenza cloud di wallet, piano e storico con auth anonima (nessun login).
// Cache-first: la UI continua a leggere/scrivere localStorage in modo sincrono,
// poi questo modulo sincronizza in background verso Supabase.
// Se Supabase non è configurato o non raggiungibile: il sito resta 100% locale.
// Caricare DOPO config.local.js e PRIMA di belline-wallet.js / belline-history.js.

(function () {
    'use strict';

    // ---- Config ----

    var cfg = (typeof window !== 'undefined' && window.BELLINE_SUPABASE) || null;
    var client = null;
    var sessionUser = null;
    var readyPromise = null;
    var lastError = null;

    function isAvailable() {
        return !!(cfg && client && sessionUser);
    }

    // ---- Init ----

    function initClient() {
        if (!cfg || !cfg.url || !cfg.anonKey) return null;
        if (typeof window.supabase === 'undefined') return null;
        try {
            return window.supabase.createClient(cfg.url, cfg.anonKey, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });
        } catch (e) {
            lastError = e;
            return null;
        }
    }

    function ensureSession() {
        if (!client) return Promise.resolve(null);
        return client.auth.getSession()
            .then(function (res) {
                if (res && res.data && res.data.session) {
                    sessionUser = res.data.session.user;
                    return sessionUser;
                }
                if (client.auth.signInAnonymously) {
                    return client.auth.signInAnonymously()
                        .then(function (r) {
                            sessionUser = (r && r.data && r.data.user) ? r.data.user : null;
                            return sessionUser;
                        });
                }
                return null;
            })
            .catch(function (err) {
                lastError = err;
                sessionUser = null;
                return null;
            });
    }

    function ready() {
        if (readyPromise) return readyPromise;
        // Probe rapida: se la config manca o la lib non è caricata, fallback locale immediato.
        if (!cfg || !cfg.url || !cfg.anonKey || typeof window.supabase === 'undefined') {
            readyPromise = Promise.resolve(false);
            return readyPromise;
        }
        client = initClient();
        if (!client) {
            readyPromise = Promise.resolve(false);
            return readyPromise;
        }
        readyPromise = ensureSession().then(function (u) {
            return !!u;
        });
        return readyPromise;
    }

    function onReady(cb) {
        ready().then(function (ok) {
            if (ok && typeof cb === 'function') cb(sessionUser);
        });
    }

    // ---- Account (magic link email) ----

    // Vero solo quando la sessione è ancora anonima (mai autenticata con email).
    function isAnon() {
        return !!(sessionUser && sessionUser.is_anonymous);
    }

    function getUserEmail() {
        if (!sessionUser) return null;
        return sessionUser.email || null;
    }

    function getSessionUserId() {
        return sessionUser ? sessionUser.id : null;
    }

    // Richiede il magic link; deve essere chiamato DOPO ready() così la sessione
    // anonima corrente viene promossa (stesso user_id) all'identità email.
    function signInWithEmail(email) {
        if (!client || !email) return Promise.resolve({ error: 'backend non disponibile' });
        var redirect = null;
        if (typeof window !== 'undefined' && window.location) {
            redirect = window.location.origin + window.location.pathname;
        }
        return client.auth.signInWithOtp({
            email: email,
            options: {
                shouldCreateUser: true,
                emailRedirectTo: redirect
            }
        }).then(function (r) {
            var err = (r && r.error) ? r.error : null;
            return {
                error: (err && err.message) ? err.message : null,
                status: (err && err.status) ? err.status : null,
                errorCode: (err && err.code) ? String(err.code) : null
            };
        }).catch(function (e) {
            lastError = e;
            return { error: String(e && e.message), status: null, errorCode: null };
        });
    }

    function refreshSession() {
        if (!client) return Promise.resolve(null);
        return client.auth.getSession()
            .then(function (res) {
                sessionUser = (res && res.data && res.data.session && res.data.session.user) ? res.data.session.user : null;
                return sessionUser;
            })
            .catch(function () { return null; });
    }

    // Scollega l'account email: il sito torna in modalità locale (cache-first).
    // I dati server NON vengono cancellati; al prossimo login ri-sincronizza.
    function signOut() {
        if (!client) return Promise.resolve(false);
        return client.auth.signOut()
            .then(function () {
                sessionUser = null;
                readyPromise = null;
                return true;
            })
            .catch(function (e) {
                lastError = e;
                return false;
            });
    }

    // Cambio stato auth (anon → email, logout). Invoca cb({ user, isAnon, email }).
    var authStateCallback = null;

    function watchAuthState(cb) {
        if (!client) return null;
        authStateCallback = cb;
        var sub = client.auth.onAuthStateChange(function (event, session) {
            var u = (session && session.user) ? session.user : null;
            sessionUser = u;
            if (authStateCallback) authStateCallback({
                event: event,
                user: u,
                isAnon: !!(u && u.is_anonymous),
                email: (u && u.email) ? u.email : null
            });
        });
        return sub;
    }

    // ---- Wallet / profilo ----

    // Sincronizza il wallet corrente verso il server (upsert). Non blocca la UI.
    function syncWallet(st) {
        if (!isAvailable()) return Promise.resolve(false);
        var payload = {
            user_id: sessionUser.id,
            date: st.date,
            remaining: st.remaining,
            updated_at: new Date().toISOString()
        };
        return client.from('wallets')
            .upsert(payload, { onConflict: 'user_id' })
            .then(function (r) {
                return !(r && r.error);
            })
            .catch(function (e) { lastError = e; return false; });
    }

    // Legge il wallet dal server (oggi). Ritorna null se assente.
    function fetchWallet() {
        if (!isAvailable()) return Promise.resolve(null);
        return client.from('wallets')
            .select('date, remaining')
            .eq('user_id', sessionUser.id)
            .maybeSingle()
            .then(function (r) {
                if (r && r.error) throw r.error;
                return (r && r.data) ? r.data : null;
            })
            .catch(function (e) { lastError = e; return null; });
    }

    // Piano utente: delega al server (fallback flag locale gestito dal chiamante).
    function fetchPlan() {
        if (!isAvailable()) return Promise.resolve(null);
        return client.from('profiles')
            .select('plan')
            .eq('user_id', sessionUser.id)
            .maybeSingle()
            .then(function (r) {
                if (r && r.error) throw r.error;
                return (r && r.data && r.data.plan) ? r.data.plan : null;
            })
            .catch(function (e) { lastError = e; return null; });
    }

    function setPlan(plan) {
        if (!isAvailable()) return Promise.resolve(false);
        if (plan !== 'free' && plan !== 'club' && plan !== 'expert') return Promise.resolve(false);
        var payload = {
            user_id: sessionUser.id,
            plan: plan,
            created_at: new Date().toISOString()
        };
        return client.from('profiles')
            .upsert(payload, { onConflict: 'user_id' })
            .then(function (r) { return !(r && r.error); })
            .catch(function (e) { lastError = e; return false; });
    }

    // ---- Storico letture ----

    function addReading(entry) {
        if (!isAvailable()) return Promise.resolve(false);
        var payload = {
            user_id: sessionUser.id,
            created_at: entry.date,
            question: entry.question || null,
            count: entry.count,
            blue: !!entry.blue,
            cards: Array.isArray(entry.cards) ? entry.cards : [],
            advice: entry.advice || ''
        };
        if (entry.id) payload.id = entry.id;
        return client.from('readings')
            .insert(payload)
            .then(function (r) { return !(r && r.error); })
            .catch(function (e) { lastError = e; return false; });
    }

    // Ultime N letture dal server (per reconcile all'avvio).
    function fetchReadings(limit) {
        if (!isAvailable()) return Promise.resolve([]);
        var n = (limit && limit > 0) ? limit : 10;
        return client.from('readings')
            .select('id, created_at, question, count, blue, cards, advice')
            .eq('user_id', sessionUser.id)
            .order('created_at', { ascending: false })
            .limit(n)
            .then(function (r) {
                if (r && r.error) throw r.error;
                var rows = (r && r.data) ? r.data : [];
                return rows.map(function (row) {
                    return {
                        id: row.id,
                        date: row.created_at,
                        question: row.question,
                        count: row.count,
                        blue: row.blue,
                        cards: row.cards || [],
                        advice: row.advice || ''
                    };
                });
            })
            .catch(function (e) { lastError = e; return []; });
    }

    function deleteReading(id) {
        if (!isAvailable() || !id) return Promise.resolve(false);
        return client.from('readings')
            .delete()
            .eq('id', id)
            .then(function (r) { return !(r && r.error); })
            .catch(function (e) { lastError = e; return false; });
    }

    // ---- Edge Functions (proxy AI/TTS) ----

    // Invoca una Edge Function con il JWT iniettato automaticamente.
    // Ritorna la risposta completa { data, error, status }.
    function callFunction(name, opts) {
        if (!isAvailable() || !client.functions) return Promise.resolve({ data: null, error: 'backend non disponibile', status: 0 });
        var o = opts || {};
        return client.functions.invoke(name, {
            body: o.body || {},
            responseType: o.responseType || 'json'
        }).then(function (res) {
            return { data: res && res.data, error: res && res.error, status: res && res.status };
        }).catch(function (e) {
            lastError = e;
            var status = 0;
            if (e && typeof e.status === 'number') status = e.status;
            else if (e && e.message) {
                var m = /status code:\s*(\d+)/i.exec(String(e.message));
                if (m) status = parseInt(m[1], 10);
            }
            return { data: null, error: String(e && e.message), status: status };
        });
    }

    // ---- Export ----

    window.bellineServer = {
        isAvailable: isAvailable,
        ready: ready,
        onReady: onReady,
        syncWallet: syncWallet,
        fetchWallet: fetchWallet,
        fetchPlan: fetchPlan,
        setPlan: setPlan,
        addReading: addReading,
        fetchReadings: fetchReadings,
        deleteReading: deleteReading,
        callFunction: callFunction,
        isAnon: isAnon,
        getUserEmail: getUserEmail,
        getSessionUserId: getSessionUserId,
        signInWithEmail: signInWithEmail,
        signOut: signOut,
        watchAuthState: watchAuthState,
        refreshSession: refreshSession,
        getLastError: function () { return lastError; }
    };
})();