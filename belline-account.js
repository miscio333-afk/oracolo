// Oracolo di Belline — Account (magic link email) e multi-device (Fase B.2).
// Accedi solo su richiesta esplicita: il pulsante compare SOLO quando la sessione
// è anonima. Dopo il login (stesso user_id promosso da anonimo) mostra email+Esci.
// Il logout riporta alla modalità locale (cache-first): i dati server restano.
// Caricare DOPO belline-backend.js e belline-wallet.js.

(function () {
    'use strict';

    var SERVER = function () { return window.bellineServer; };

    var accountState = { stage: 'unknown' }; // 'anon' | 'user' | 'unknown'
    var refreshFns = null; // chiamate alla UI al cambio stato

    function getRefreshFns() {
        if (refreshFns) return refreshFns;
        refreshFns = [];
        if (window.bellineWallet && window.bellineWallet.refresh) refreshFns.push(window.bellineWallet.refresh);
        if (window.bellineHistory && window.bellineHistory.refresh) refreshFns.push(window.bellineHistory.refresh);
        return refreshFns;
    }

    function afterRefresh() {
        getRefreshFns().forEach(function (fn) { try { fn(); } catch (e) { /* ignore */ } });
    }

    // ---- Anchor: inserisce la barra account subito dopo il chip wallet ----

    function ensureHost() {
        var host = document.getElementById('belline-account-host');
        if (host) return host;

        host = document.createElement('div');
        host.id = 'belline-account-host';
        host.className = 'belline-account-host';

        var chip = document.getElementById('belline-wallet-chip');
        if (chip && chip.parentNode) {
            chip.parentNode.insertBefore(host, chip.nextSibling);
        } else {
            var panel = document.querySelector('.setup-panel');
            if (panel) panel.appendChild(host);
            else document.body.appendChild(host);
        }
        return host;
    }

    function escapeHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ---- Stati UI ----

    function renderAnon() {
        var host = ensureHost();
        host.innerHTML =
            '<div class="belline-account-bar">' +
            '  <button type="button" class="belline-account-btn" id="belline-login-open">🔐 Accedi</button>' +
            '  <span class="belline-account-hint">Salva le letture nel cloud su qualunque device</span>' +
            '</div>';
        var btn = document.getElementById('belline-login-open');
        if (btn) btn.addEventListener('click', openLogin);
    }

    function renderUser(email) {
        var host = ensureHost();
        host.innerHTML =
            '<div class="belline-account-bar">' +
            '  <span class="belline-account-email">✉️ ' + escapeHtml(email || 'utente') + '</span>' +
            '  <button type="button" class="belline-account-btn is-secondary" id="belline-logout">Esci</button>' +
            '</div>';
        var out = document.getElementById('belline-logout');
        if (out) out.addEventListener('click', doLogout);
    }

    // ---- Form login ----

    function openLogin() {
        var host = ensureHost();
        host.innerHTML =
            '<div class="belline-account-bar">' +
            '  <form class="belline-account-form" id="belline-login-form" novalidate>' +
            '    <label class="belline-account-label">Email</label>' +
            '    <input type="email" class="belline-account-input" id="belline-login-email" ' +
            '           placeholder="la tua email" autocomplete="email" required>' +
            '    <button type="submit" class="belline-account-btn">Invia link</button>' +
            '    <button type="button" class="belline-account-btn is-secondary" id="belline-login-cancel">Annulla</button>' +
            '  </form>' +
            '</div>';

        var form = document.getElementById('belline-login-form');
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var input = document.getElementById('belline-login-email');
                var email = (input && input.value) ? input.value.trim() : '';
                if (!email) { input.focus(); return; }
                submitEmail(email);
            });
        }
        var cancel = document.getElementById('belline-login-cancel');
        if (cancel) cancel.addEventListener('click', renderCurrent);

        var input = document.getElementById('belline-login-email');
        if (input) input.focus();
    }

    function submitEmail(email) {
        var bs = SERVER();
        if (!bs || !bs.signInWithEmail) { renderAnon(); return; }

        var host = ensureHost();
        host.innerHTML =
            '<div class="belline-account-bar">' +
            '  <span class="belline-account-sending">Inviando il link a ' + escapeHtml(email) + '…</span>' +
            '</div>';

        bs.signInWithEmail(email).then(function (r) {
            var host2 = ensureHost();
            if (r && r.error) {
                var friendly = (r.status === 429 ||
                    (r.errorCode && /rate_limit/i.test(r.errorCode)) ||
                    /rate limit|troppe richieste|riprova tra/i.test(r.error));
                var msg = friendly
                    ? 'Hai già richiesto un link di recente. Controlla la tua email o riprova tra un\'ora.'
                    : r.error;
                host2.innerHTML =
                    '<div class="belline-account-bar">' +
                    '  <span class="belline-account-error">' + escapeHtml(msg) + '</span>' +
                    '  <button type="button" class="belline-account-btn is-secondary" id="belline-login-retry">Riprova</button>' +
                    '</div>';
                var retry = document.getElementById('belline-login-retry');
                if (retry) retry.addEventListener('click', openLogin);
                return;
            }
            host2.innerHTML =
                '<div class="belline-account-bar">' +
                '  <span class="belline-account-sending">📩 Controlla la tua email e clicca il link per entrare.</span>' +
                '  <button type="button" class="belline-account-btn is-secondary" id="belline-login-close">Chiudi</button>' +
                '</div>';
            var close = document.getElementById('belline-login-close');
            if (close) close.addEventListener('click', renderCurrent);
        });
    }

    // ---- Render corrente (anon / utente / nascosto) ----

    function renderCurrent() {
        var bs = SERVER();
        var host = document.getElementById('belline-account-host');
        if (!bs || !bs.ready) { if (host) host.innerHTML = ''; return; }

        bs.ready().then(function (ok) {
            if (!ok) { if (host) host.innerHTML = ''; return; }

            // Dopo il logout la sessione è nulla: mostriamo di nuovo "Accedi"
            // (è l'unico prossimo passo sensato; i dati restano al server).
            if (bs.getUserEmail && bs.getUserEmail()) {
                renderUser(bs.getUserEmail());
            } else {
                renderAnon();
            }
        });
    }

    // ---- Logout ----

    function doLogout() {
        var bs = SERVER();
        if (!bs || !bs.signOut) return;
        bs.signOut().then(function () {
            var host = document.getElementById('belline-account-host');
            if (host) host.innerHTML = '';
            renderCurrent();
        });
    }

    // ---- Init ----

    function init() {
        var bs = SERVER();
        if (!bs || !bs.ready) return; // niente backend: la barra non compare

        setTimeout(renderCurrent, 0);

        // Al cambio stato (anon → email via magic link) aggiorna la UI e ri-sincronizza.
        if (bs.watchAuthState) {
            bs.watchAuthState(function (info) {
                var changed = (info && info.isAnon) ? 'anon' : (info && info.user) ? 'user' : 'anon';
                if (changed === accountState.stage && info.event !== 'TOKEN_REFRESHED') return;
                accountState.stage = changed;
                renderCurrent();
                if (changed === 'user') afterRefresh();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { init(); });
    } else {
        init();
    }

    window.bellineAccount = {
        openLogin: openLogin,
        render: renderCurrent,
        isUser: function () { var bs = SERVER(); return !!(bs && bs.getUserEmail && bs.getUserEmail()); }
    };
})();