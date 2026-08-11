// Oracolo di Belline — Sezione Pricing "✦ Scegli il tuo cammino" (Fase A, demo).
// I piani sono quelli del piano commerciale (docs/PLAN-STESE-COMMERCIALI.md);
// i Pack crediti sono esclusi. La scelta attiva il piano locale simulato
// (belline.plan.v1) tramite bellineWallet.setPlan(): nulla viene addebitato.
// Caricare DOPO belline-wallet.js (non è obbligatorio che backend sia pronto).

(function () {
    'use strict';

    // Piani: come da piano commerciale (docs/PLAN-STESE-COMMERCIALI.md);
    // in Fase A i paganti NON pagano: differenze demo = più crediti/giorno,
    // storico illimitato, TTS ElevenLabs e Carta Blu inclusa per il Club.
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

    function demoNoteHTML() {
        return '<p class="pricing-demo-note">✦ Versione demo senza pagamenti: scegliere Club o Esperto sblocca ' +
            'subito più crediti al giorno, lo storico illimitato e l\'audio AI. ' +
            'Torna a Free quando vuoi; i pagamenti reali arriveranno a breve.</p>';
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
        html += '</div>' + demoNoteHTML();
        el.innerHTML = html;

        var buttons = el.querySelectorAll('.pricing-cta');
        for (var b = 0; b < buttons.length; b++) {
            buttons[b].addEventListener('click', function () {
                if (!window.bellineWallet || typeof window.bellineWallet.setPlan !== 'function') return;
                var key = this.getAttribute('data-plan');
                if (!key) return;
                window.bellineWallet.setPlan(key);
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

    // Export per console / integrazione pagine
    window.bellinePricing = {
        render: render,
        plans: PLANS,
        currentPlan: currentPlan
    };
})();