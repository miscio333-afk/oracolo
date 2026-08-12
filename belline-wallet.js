// Oracolo di Belline — Wallet crediti.
// Crediti giornalieri per piano (free 4 / club 8 / expert 12), costo stesa =
// numero di carte (+1 se Carta Blu, tranne per il Club dove è inclusa).
// Piano (free/club/expert): fonte di verità SUPABASE server (riga profiles) con
// cache locale; riserva lo storico illimitato ai paganti.
// Il piano pagante si attiva SOLO dal server (webhook Lemon Squeezy → profiles.plan):
// qui è possibile impostare localmente solo il piano Free.
// Stato persistito in localStorage.
// Caricare DOPO belline-common.js (o belline-page.js): wrappa startBellineReading.

(function () {
    'use strict';

    var CONFIG = {
        freeDaily: 4, // = 1 lettura completa (3 carte + Carta Blu) oppure 3 carte + 1 carta singola
        defaultValue: 3, // costo "prossima stesa" quando gli hook pagina non sono ancora definiti
        storageKey: 'belline.wallet.v1',
        planStorageKey: 'belline.plan.v1'
    };

    // Crediti giornalieri per piano (i 120/300 mensili dei paganti reali
    // arriveranno quando il wallet gestirà il conteggio mensile).
    var DAILY_ALLOWANCE = { free: 4, club: 8, expert: 12 };
    var PLAN_CHANGE_EVENT = 'belline:plan-changed';

    // ---- Piano utente ----
    // Fonte di verità: riga profiles lato Supabase (garantita dal trigger per ogni
    // utenza, anonima ed email). Cache server in memoria + flag persistito in
    // localStorage come fallback offline.

    var serverPlan = null; // piano letto dal server (fonte di verità)

    function normalizePlan(p) {
        return (p === 'free' || p === 'club' || p === 'expert') ? p : null;
    }

    function getPlan() {
        if (serverPlan) return serverPlan;
        try {
            var raw = localStorage.getItem(CONFIG.planStorageKey);
            var p = normalizePlan(raw);
            if (p) return p;
        } catch (e) { /* storage non disponibile: free */ }
        return 'free';
    }

    function setPlan(plan) {
        // Solo il piano Free è impostabile localmente; Club/Esperto arrivano dal
        // server (webhook Lemon Squeezy → profiles.plan) e si aggiornano in
        // refreshFromServer.
        if (plan !== 'free') return false;
        try { localStorage.setItem(CONFIG.planStorageKey, 'free'); } catch (e) { /* ignore */ }
        serverPlan = null; // ricarica dal server appena pronto (o rimane local se offline)
        topUpToAllowance();
        if (window.bellineServer && window.bellineServer.ready) {
            window.bellineServer.ready().then(function (ok) {
                if (ok) {
                    if (window.bellineServer.setPlan) window.bellineServer.setPlan('free');
                }
            });
        }
        render();
        try { window.dispatchEvent(new Event(PLAN_CHANGE_EVENT)); } catch (e) { /* ignore */ }
        return true;
    }

    // Se la dotazione del piano attivo è maggiore di quella oggi disponibile,
    // alza i crediti odierni al nuovo tetto (mai sotto quanto già speso).
    function topUpToAllowance() {
        var st = getState();
        var allow = dailyAllowance();
        if (st.remaining < allow) {
            st.remaining = allow;
            save(st);
            if (window.bellineServer && window.bellineServer.syncWallet) {
                window.bellineServer.syncWallet(st);
            }
        }
    }

    function isPaid() {
        return getPlan() !== 'free';
    }

    // Crediti giornalieri per il piano corrente.
    function dailyAllowance() {
        return DAILY_ALLOWANCE[getPlan()] || CONFIG.freeDaily;
    }

    function todayKey() {
        var d = new Date();
        return d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0');
    }

    function load() {
        try {
            var raw = localStorage.getItem(CONFIG.storageKey);
            var st = raw ? JSON.parse(raw) : null;
            if (st && st.date === todayKey()) return st;
        } catch (e) { /* storage non disponibile: wallet "in memoria" */ }
        return { date: todayKey(), remaining: dailyAllowance() };
    }

    function save(st) {
        try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(st)); } catch (e) { /* ignore */ }
    }

    function getState() {
        return load();
    }

    // Costo della stesa correntemente selezionata (1/3/7 carte, +1 se Carta Blu)
    function cost() {
        var n = 3;
        if (window.bellineReadCount) {
            var v = parseInt(window.bellineReadCount(), 10);
            if (!isNaN(v) && v >= 1) n = v;
        }
        var blue = (window.bellineIncludeBlue ? window.bellineIncludeBlue() : false);
        // Club: la Carta Blu è inclusa (costo = n carte, non n+1).
        return (blue && getPlan() !== 'club') ? n + 1 : n;
    }

    function canSpend(c) {
        return getState().remaining >= (c === undefined ? cost() : c);
    }

    function spend(c) {
        var need = c === undefined ? cost() : c;
        var st = getState();
        if (st.remaining < need) return false;
        st.remaining -= need;
        save(st);
        render();
        if (window.bellineServer && window.bellineServer.syncWallet) {
            window.bellineServer.syncWallet(st);
        }
        return true;
    }

    // ---- UI ----

    function ensureAnchor() {
        if (document.getElementById('belline-wallet-chip')) return document.getElementById('belline-wallet-chip');

        var chip = document.createElement('div');
        chip.id = 'belline-wallet-chip';
        chip.className = 'belline-wallet-chip';
        chip.setAttribute('aria-live', 'polite');

        // Nella navbar, come primo elemento delle azioni (chip + account).
        var nav = document.getElementById('belline-nav-actions');
        if (nav) {
            nav.insertBefore(chip, nav.firstChild);
            return chip;
        }

        var panel = document.querySelector('.setup-panel');
        if (panel) {
            panel.insertBefore(chip, panel.firstChild);
        } else {
            var status = document.getElementById('belline-status');
            if (status && status.parentNode) {
                status.parentNode.insertBefore(chip, status);
            } else {
                document.body.appendChild(chip);
            }
        }
        return chip;
    }

    function render() {
        var chip = ensureAnchor();
        var st = getState();
        var total = dailyAllowance();
        chip.innerHTML =
            '<span class="belline-wallet-coin" aria-hidden="true">🪙</span> ' +
            '<strong>' + st.remaining + '</strong>/' + total + ' crediti oggi';

        if (st.remaining <= 0) chip.classList.add('is-empty');
        else chip.classList.remove('is-empty');
    }

    function showBlocked(need) {
        // Crediti finiti → l'utente sceglie come proseguire (upgrade o ricarica).
        window.location.href = 'pricing.html?reason=credits';
    }

    function hookCountChanges() {
        var count = document.getElementById('belline-count');
        var blue = document.getElementById('belline-blue');
        var re = function () { render(); };
        if (count) count.addEventListener('change', re);
        if (blue) blue.addEventListener('change', re);
    }

    // ---- Gate: addebito a inizio lettura (dopo la preflight della pagina) ----

    var wrapped = false;

    function wrapStartReading() {
        if (wrapped || typeof window.startBellineReading !== 'function') return;
        wrapped = true;

        var orig = window.startBellineReading;

        window.startBellineReading = function () {
            // Preflight identico a quello interno (es. narrativa: data/sesso obbligatori)
            var pre = (window.bellinePreflight && window.bellinePreflight()) || null;
            if (pre) {
                var st = document.getElementById('belline-status');
                if (st) st.textContent = pre;
                return;
            }

            var need = cost();
            if (!canSpend(need)) {
                showBlocked(need);
                return;
            }
            spend(need);
            return orig.apply(this, arguments);
        };
    }

    // ---- Sync iniziale col backend (reconcile cache-first) ----

    function refreshFromServer() {
        if (!window.bellineServer || !window.bellineServer.ready) return;
        window.bellineServer.ready().then(function (ok) {
            if (!ok) return;

            var done = 0;
            var finish = function () { if (++done === 2) render(); };

            window.bellineServer.fetchWallet().then(function (sw) {
                if (sw && sw.date && sw.date === todayKey() &&
                    typeof sw.remaining === 'number') {
                    save({ date: sw.date, remaining: sw.remaining });
                }
                finish();
            });

            window.bellineServer.fetchPlan().then(function (plan) {
                var p = normalizePlan(plan);
                if (p) {
                    serverPlan = p;
                    try { localStorage.setItem(CONFIG.planStorageKey, p); } catch (e) { /* ignore */ }
                    render(); // il chip riflette subito la dotazione del piano server
                }
                finish();
            });
        });
    }

    function init() {
        wrapStartReading();
        hookCountChanges();
        setTimeout(render, 0);
        setTimeout(refreshFromServer, 0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { init(); });
    } else {
        init();
    }

    // Il TTS (Edge TTS, server-side, voce neurale) è gratuito per tutti: l'hook
    // resta per compatibilità e ritorna sempre true. Consumato in belline-common.js.
    window.bellineCanListen = function () { return true; };

    // Export per console / test
    window.bellineWallet = {
        get: getState,
        cost: cost,
        canSpend: canSpend,
        spend: spend,
        render: render,
        reset: function () { save({ date: todayKey(), remaining: dailyAllowance() }); render(); },
        getPlan: getPlan,
        setPlan: setPlan,
        isPaid: isPaid,
        dailyAllowance: dailyAllowance,
        refresh: refreshFromServer
    };
})();