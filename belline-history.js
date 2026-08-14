// Oracolo di Belline — Storico letture (Fase A, locale).
// Salva le ultime letture (data, domanda, carte, testo del messaggio) in localStorage:
// 5 per il piano free (+ teaser account al 6° salvataggio), ~illimitato (500) per i paganti.
// Caricare DOPO belline-wallet.js (wrappa a sua volta startBellineReading).

(function () {
    'use strict';

    var CONFIG = {
        storageKey: 'belline.history.v1',
        teaserKey: 'belline.accountTeaserShown',
        paidMax: 500 // cap di sicurezza ≈ "illimitato" per i paganti (evita overflow localStorage)
    };

    // Storico: 5 letture per i free, ~illimitato (500) per i paganti (Club/Esperto).
    function maxEntries() {
        if (window.bellineWallet && typeof window.bellineWallet.isPaid === 'function' &&
            window.bellineWallet.isPaid()) {
            return CONFIG.paidMax;
        }
        return 5;
    }

    function load() {
        try {
            var raw = localStorage.getItem(CONFIG.storageKey);
            var arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch (e) {
            return [];
        }
    }

    function saveAll(list) {
        try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(list)); } catch (e) { /* ignore */ }
    }

    var pending = null;

    // ---- Cattura della lettura in corso (scatta subito dopo il draw) ----

    // Cattura la lettura appena estratta. Ritorna true solo se le carte sono
    // cambiate rispetto alla lettura già in corso (evita doppioni a pari numero di carte).
    function newEntryId() {
        if (window.bellineServer && window.bellineServer.clientUuid) return window.bellineServer.clientUuid();
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0;
            var v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function capturePending() {
        var cards = [];
        if (typeof bellineDrawn !== 'undefined' && bellineDrawn) {
            cards = bellineDrawn.map(function (c) { return c && c.name; }).filter(Boolean);
        }
        if (!cards.length) return false;

        var sig = cards.join('|');
        if (pending && pending.cards.join('|') === sig) return false;

        var qEl = document.getElementById('belline-question');
        var question = qEl ? (qEl.value || '').trim() : '';
        pending = {
            id: newEntryId(),
            date: new Date().toISOString(),
            question: question || null,
            count: cards.length,
            blue: window.bellineIncludeBlue ? window.bellineIncludeBlue() : false,
            cards: cards,
            advice: '',
            reflection: null,
            ambito: (typeof window.bellineQuestionAmbito !== 'undefined' && window.bellineQuestionAmbito) || null,
            type: stesaType()
        };
        return true;
    }

    function stesaType() {
        var body = document.body;
        if (body && body.dataset && body.dataset.stesaType) return body.dataset.stesaType;
        if (body && body.getAttribute && body.getAttribute('data-stesa-type')) return body.getAttribute('data-stesa-type');
        return null;
    }

    function readAdviceText() {
        var box = document.getElementById('belline-advice');
        if (!box) return '';
        var els = box.querySelectorAll('.advice-paragraph-text');
        if (!els.length) return (box.textContent || '').trim();
        var parts = [];
        els.forEach(function (n) { parts.push(n.textContent); });
        return parts.join(' ').trim();
    }

    // ---- Finalizzazione: il messaggio è completo quando si abilita il TTS ----

    var armed = false;

    function arm() {
        if (armed) return;
        armed = true;

        var box = document.getElementById('belline-advice');
        var btn = document.getElementById('belline-speak-btn');
        if (!box || !btn || typeof MutationObserver === 'undefined') return;

        new MutationObserver(function () {
            if (pending) pending.advice = readAdviceText();
        }).observe(box, { childList: true, subtree: true, characterData: true });

        new MutationObserver(function () {
            if (!pending) return;
            if (btn.disabled === false) {
                finalizeAndSave();
            }
        }).observe(btn, { attributes: true, attributeFilter: ['disabled'] });
    }

    function finalizeAndSave() {
        if (!pending) return;
        var entry = pending;
        pending = null;

        entry.advice = readAdviceText() || entry.advice;
        entry.reflection = (typeof window.bellineReflectionText !== 'undefined' && window.bellineReflectionText) || null;

        var list = load();
        list.unshift(entry);

        if (list.length > maxEntries() && !teaserSeen()) {
            showTeaser();
        }

        saveAll(list.slice(0, maxEntries()));
        render();

        // Database Esperienziale: aggiorna la stesa già registrata a 'complete'.
        if (window.bellineServer && window.bellineServer.updateReading) {
            window.bellineServer.updateReading(entry.id, {
                advice: entry.advice,
                reflection: entry.reflection
            });
        } else if (window.bellineServer && window.bellineServer.addReading) {
            window.bellineServer.addReading(entry);
        }
    }

    // ---- UI ----

    function hasEntries() {
        return load().length > 0;
    }

    function section() {
        var sec = document.getElementById('belline-history-section');
        if (sec) return sec;

        sec = document.createElement('div');
        sec.id = 'belline-history-section';
        sec.className = 'reading-area belline-history-section';
        sec.innerHTML =
            '<h3 class="card-name text-xl mb-4">✦ Le tue ultime letture</h3>' +
            '<div id="belline-history-list" class="belline-history-list"></div>' +
            '<div id="belline-account-teaser"></div>';
        sec.style.display = 'none';

        var followup = document.getElementById('belline-followup');
        if (followup && followup.parentNode) {
            followup.parentNode.insertBefore(sec, followup);
        } else {
            var container = document.querySelector('main .max-w-7xl') || document.body;
            container.appendChild(sec);
        }
        return sec;
    }

    function escapeHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function dateLabel(iso) {
        try {
            return new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return '';
        }
    }

    function render() {
        if (!hasEntries()) return;
        var sec = section();
        sec.style.display = 'block';
        var listEl = document.getElementById('belline-history-list');
        if (!listEl) return;

        var entries = load();
        listEl.innerHTML = entries.map(function (e, i) {
            var blueBadge = e.blue ? ' <span class="belline-history-blue">Carta Blu</span>' : '';
            var q = e.question
                ? '<em class="belline-history-q">«' + escapeHtml(e.question) + '»</em>'
                : '<em class="belline-history-q is-muted">Stesa senza domanda</em>';
            return '<div class="belline-history-item">' +
                '<div class="belline-history-meta">' +
                '  <span class="belline-history-date">' + dateLabel(e.date) + '</span>' +
                '  <span class="belline-history-cards">' + escapeHtml(e.cards.join(' · ')) + '</span>' + blueBadge +
                '</div>' +
                q +
                (e.reflection
                    ? '<p class="belline-history-reflection">✎ «' + escapeHtml(e.reflection) + '»</p>'
                    : '') +
                (e.advice
                    ? '<button type="button" class="belline-history-toggle" data-i="' + i + '">Vedi il messaggio</button>' +
                      '<div class="belline-history-advice" hidden>' + '<p>' + escapeHtml(e.advice) + '</p></div>'
                    : '') +
                '</div>';
        }).join('');

        Array.prototype.forEach.call(listEl.querySelectorAll('.belline-history-toggle'), function (btn) {
            btn.addEventListener('click', function () {
                var a = btn.nextElementSibling;
                var open = !a.hidden;
                a.hidden = open;
                btn.textContent = open ? 'Vedi il messaggio' : 'Nascondi il messaggio';
            });
        });
    }

    function teaserSeen() {
        try { return localStorage.getItem(CONFIG.teaserKey) === '1'; } catch (e) { return true; }
    }

    function markTeaserSeen() {
        try { localStorage.setItem(CONFIG.teaserKey, '1'); } catch (e) { /* ignore */ }
    }

    function showTeaser() {
        var host = document.getElementById('belline-account-teaser');
        if (!host) return;
        if (window.bellineServer && window.bellineServer.isAnon && !window.bellineServer.isAnon()) {
            host.innerHTML = ''; // già loggato: niente teaser
            return;
        }
        markTeaserSeen();
        var hasLogin = !!(window.bellineServer && window.bellineServer.signInWithEmail);
        host.innerHTML =
            '<div class="belline-account-teaser">' +
            '  <p class="belline-account-teaser-title">Conserva la tua storia di letture</p>' +
            '  <p class="belline-account-teaser-text">Creando un account (solo email, nessuna password) ' +
            'salvi le tue consultazioni nel cloud e le ritrovi su qualunque dispositivo.</p>' +
            (hasLogin
                ? '<button type="button" class="mystical-button px-5 py-2 rounded-full mt-3" id="belline-teaser-login">Crea account</button>'
                : '<p class="belline-account-teaser-text is-muted">Iscriviti alla lista d\'attesa.</p>') +
            '</div>';
        var btn = document.getElementById('belline-teaser-login');
        if (btn) {
            btn.addEventListener('click', function () {
                if (window.bellineAccount && window.bellineAccount.openLogin) {
                    window.bellineAccount.openLogin();
                }
            });
        }
    }

    // ---- Gate: cattura la lettura appena estratta ----

    var wrapped = false;

    function wrapStartReading() {
        if (wrapped) return;
        wrapped = true;

        // La lettura viene catturata quando le luci sono effettivamente estratte
        // (l'estrazione ora avviene dopo la pausa di respiro, non subito alla chiamata).
        document.addEventListener('belline:draw', function () {
            if (capturePending()) {
                arm();
                // Database Esperienziale: registra SUBITO la stesa come 'drawn',
                // anche se l'utente non completerà la lettura.
                pushPendingReading();
            }
        });
    }

    // Fire-and-forget verso Supabase: la stesa appena estratta viene registrata
    // come 'drawn'. Verrà aggiornata a 'complete' in finalizeAndSave (stesso id).
    function pushPendingReading() {
        if (!pending || !window.bellineServer || !window.bellineServer.addReading) return;
        window.bellineServer.addReading({
            id: pending.id,
            date: pending.date,
            question: pending.question,
            count: pending.count,
            blue: pending.blue,
            cards: pending.cards,
            advice: '',
            reflection: pending.reflection,
            ambito: pending.ambito,
            type: pending.type
        });
    }

    // ---- Sync iniziale col backend (reconcile cache-first) ----

    function keyOf(e) {
        return (e.date || '') + '|' + (e.count || '') + '|' +
            (Array.isArray(e.cards) ? e.cards.join(',') : '');
    }

    // Merge per data (vero): unisce locale e remoto, dedup per chiave data+carte e
    // "spinge" verso il server le letture presenti solo in locale (es. fatte prima
    // del login, o da un altro device non ancora sincronizzato).
    function refreshFromServer() {
        if (!window.bellineServer || !window.bellineServer.ready) return;
        window.bellineServer.ready().then(function (ok) {
            if (!ok) return;
            var fetchN = maxEntries() * 2;
            window.bellineServer.fetchReadings(fetchN).then(function (remote) {
                var local = load();
                var byKey = {};

                local.forEach(function (e) { byKey[keyOf(e)] = e; });

                var toPush = [];
                (remote || []).forEach(function (e) {
                    var k = keyOf(e);
                    if (!byKey[k]) {
                        byKey[k] = e;
                    } else {
                        // il remoto è fonte di verità per il messaggio/domanda
                        if (e.advice) byKey[k].advice = e.advice;
                        if (e.question) byKey[k].question = e.question;
                    }
                });

                // push delle letture locali assenti sul server
                local.forEach(function (e) {
                    var k = keyOf(e);
                    if (!(remote || []).some(function (r) { return keyOf(r) === k; })) {
                        toPush.push(e);
                    }
                });

                var merged = Object.keys(byKey).map(function (k) { return byKey[k]; });
                merged.sort(function (a, b) {
                    return String(b.date || '').localeCompare(String(a.date || ''));
                });
                var trimmed = merged.slice(0, maxEntries());

                saveAll(trimmed);
                render();

                toPush.forEach(function (e) {
                    if (window.bellineServer && window.bellineServer.addReading) {
                        window.bellineServer.addReading(e);
                    }
                });
            });
        });
    }

    function init() {
        wrapStartReading();
        render();
        setTimeout(refreshFromServer, 0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { init(); });
    } else {
        init();
    }

    // Export per console / test
    window.bellineHistory = {
        list: load,
        save: finalizeAndSave,
        clear: function () { saveAll([]); render(); },
        refresh: refreshFromServer,
        render: render
    };
})();