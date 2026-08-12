// Oracolo di Belline — Sezione Pricing "✦ Scegli il tuo cammino" (Fase B, monetizzazione).
// I piani sono quelli del piano commerciale (docs/PLAN-STESE-COMMERCIALI.md);
// i Pack crediti sono esclusi. Club/Esperto aprono SEMPRE il checkout di Lemon
// Squeezy (config BELLINE_LEMONSQUEEZY), con prefill uid/email se il backend è
// pronto; l'attivazione reale avviene lato server via webhook (belline-ls-webhook).
// Il piano Free è l'unico impostabile localmente (bellineWallet.setPlan('free')).
// Caricare DOPO belline-wallet.js (non è obbligatorio che backend sia pronto).

(function () {
    'use strict';

    // Piani: come da piano commerciale (docs/PLAN-STESE-COMMERCIALI.md).
    var PLAN_CHANGE_EVENT = 'belline:plan-changed';

    // Dati dei piani (fonte: docs/PLAN-STESE-COMMERCIALI.md, §3 Pricing)
    var PLANS = [
        {
            key: 'free',
            title: 'Free',
            price: '0€',
            period: 'per sempre',
            features: [
                '4 crediti ogni giorno',
                'Carta Natale gratis (lead magnet)',
                '5 letture in storico'
            ],
            cta: 'Scegli Free',
            badge: null,
            note: ''
        },
        {
            key: 'club',
            title: 'Club',
            price: '6,90€',
            period: 'al mese',
            features: [
                '120 crediti al mese',
                'Storico illimitato',
                'Carta Blu inclusa',
                '🎧 Ascolta il messaggio (audio AI ElevenLabs)'
            ],
            cta: 'Scegli Club',
            badge: 'Consigliato',
            note: 'Per chi legge ogni giorno.'
        },
        {
            key: 'expert',
            title: 'Lettore Esperto',
            price: '14,90€',
            period: 'al mese',
            features: [
                '300 crediti al mese',
                'Follow-up illimitati',
                '🎧 Ascolta il messaggio (audio AI ElevenLabs)'
            ],
            cta: 'Scegli Esperto',
            badge: null,
            note: 'Il cammino completo per chi non si ferma mai.'
        }
    ];

    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function currentPlan() {
        if (window.bellineWallet && typeof window.bellineWallet.getPlan === 'function') {
            return window.bellineWallet.getPlan();
        }
        return null;
    }

    // Ritorna true se la scelta può davvero attivare il piano (wallet presente).
    function canSelect() {
        return !!(window.bellineWallet && typeof window.bellineWallet.setPlan === 'function');
    }

    function cardHTML(plan) {
        var active = currentPlan() === plan.key;
        var selected = active
            ? '<span class="pricing-status">✓ Piano attivo</span>'
            : '';
        var note = plan.note ? '<p class="pricing-note">' + escapeHtml(plan.note) + '</p>' : '';
        var badge = plan.badge ? '<span class="pricing-badge">' + escapeHtml(plan.badge) + '</span>' : '';
        var disabled = canSelect() ? '' : ' disabled';
        var features = plan.features
            .map(function (f) { return '<li class="pricing-feature">' + escapeHtml(f) + '</li>'; })
            .join('');

        return '<article class="pricing-card' + (active ? ' is-active' : '') + '">' +
            badge +
            '<h3 class="pricing-plan">' + escapeHtml(plan.title) + '</h3>' +
            '<div class="pricing-price">' + escapeHtml(plan.price) +
            '   <span class="pricing-period">' + escapeHtml(plan.period) + '</span>' +
            '</div>' +
            '<ul class="pricing-features">' + features + '</ul>' +
            (note || '') +
            '<button type="button" class="mystical-button pricing-cta" data-plan="' + escapeHtml(plan.key) + '"' + disabled + '>' +
            escapeHtml(plan.cta) + '</button>' +
            selected +
            '</article>';
    }

    function checkoutNoteHTML() {
        return '<p class="pricing-checkout-note">✦ Scegliendo Club o Lettore Esperto si apre il checkout ' +
            'sicuro di Lemon Squeezy (carta, PayPal o Apple Pay): il piano si attiva in pochi secondi ' +
            'e puoi disdirlo quando vuoi. Free è e resta gratuito, senza carta.</p>';
    }

    var CHECKOUT_FLAG = 'belline.checkout.plan';

    // Apre il checkout LMS per il piano: aggiunge ?checkout[email] e
    // ?checkout[custom][uid] se il backend è pronto (prefill, non obbligatorio).
    // Ritorna false solo se il link di checkout non è configurato (nessun grant).
    function startCheckout(planKey) {
        var cfg = window.BELLINE_LEMONSQUEEZY;
        var base = cfg && cfg.checkout ? cfg.checkout[planKey] : null;
        if (!base) return false;

        var params = [];
        var server = window.bellineServer;
        if (server && server.getUserEmail && server.isAvailable && server.isAvailable()) {
            var email = server.getUserEmail();
            if (email) params.push('checkout[email]=' + encodeURIComponent(email));
        }
        if (server && server.getSessionUserId && server.isAvailable && server.isAvailable()) {
            var uid = server.getSessionUserId();
            if (uid) params.push('checkout[custom][uid]=' + encodeURIComponent(uid));
        }

        var url = base;
        if (params.length) {
            url += (base.indexOf('?') >= 0 ? '&' : '?') + params.join('&');
        }

        try { sessionStorage.setItem(CHECKOUT_FLAG, planKey); } catch (e) { /* ignore */ }

        window.location.href = url;
        return true;
    }

    // Tornati dal checkout: poll per ~60s finché il piano server non si attiva.
    function pollCheckoutReturn() {
        var flag = null;
        try { flag = sessionStorage.getItem(CHECKOUT_FLAG); } catch (e) { /* ignore */ }
        if (!flag) return;
        try { sessionStorage.removeItem(CHECKOUT_FLAG); } catch (e) { /* ignore */ }

        var server = window.bellineServer;
        if (!server || !server.ready) return;

        var attempts = 0;
        var timer = setInterval(function () {
            attempts++;
            server.ready().then(function (ok) {
                if (!ok) {
                    if (attempts >= 12) clearInterval(timer);
                    return;
                }
                if (window.bellineWallet && window.bellineWallet.refresh) {
                    window.bellineWallet.refresh();
                }
                var paid = window.bellineWallet && window.bellineWallet.isPaid
                    ? window.bellineWallet.isPaid()
                    : false;
                if (paid || attempts >= 12) clearInterval(timer);
            });
        }, 5000);
    }

    var renderedEl = null;

    function render(container, opts) {
        var el = container;
        if (!el) {
            el = document.getElementById('belline-pricing-root') || (opts && opts.target);
        }
        if (!el) return;
        renderedEl = el;

        var html = '<div class="pricing-grid">';
        for (var i = 0; i < PLANS.length; i++) html += cardHTML(PLANS[i]);
        html += '</div>' + checkoutNoteHTML();
        el.innerHTML = html;

        var buttons = el.querySelectorAll('.pricing-cta');
        for (var b = 0; b < buttons.length; b++) {
            buttons[b].addEventListener('click', function () {
                var key = this.getAttribute('data-plan');
                if (!key) return;

                if (key !== 'free') {
                    // Piani paganti → sempre checkout Lemon Squeezy. Se il link
                    // manca (config assente) non attiviamo nulla in locale.
                    if (startCheckout(key)) return;
                    var status = document.getElementById('belline-status');
                    if (status) status.textContent = '✦ Il checkout per ' + key +
                        ' non è ancora disponibile: riprova a breve.';
                    return;
                }

                if (window.bellineWallet && typeof window.bellineWallet.setPlan === 'function') {
                    window.bellineWallet.setPlan('free');
                }
            });
        }
    }

    // Al cambio piano (wallet) ri-renderizza le card ovunque sia presente il widget.
    function listenToPlanChanges() {
        try {
            window.addEventListener(PLAN_CHANGE_EVENT, function () {
                if (renderedEl) render(renderedEl);
            });
        } catch (e) { /* ambiente senza addEventListener */ }
    }
    listenToPlanChanges();
    pollCheckoutReturn();

    // Export per console / integrazione pagine
    window.bellinePricing = {
        render: render,
        plans: PLANS,
        currentPlan: currentPlan
    };
})();