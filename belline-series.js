// Oracolo di Belline — Riferimento delle sette serie astrali (landing page).
// Dipende solo da belline.js (window.bellineSeriesMeta, window.getBellineSeriesBullet):
// è volutamente leggero e pensato per la pagina introduttiva, senza il motore di lettura.

// Mostra le sette luci astrali nel contenitore #belline-series-ref
function renderBellineSeries() {
    const ref = document.getElementById('belline-series-ref');
    if (!ref) return;
    ref.innerHTML = '';

    const order = ['prime', 'sole', 'luna', 'mercurio', 'venere', 'marte', 'giove', 'saturno'];
    const colors = { prime: '#FFBF00', sole: '#FFBF00', luna: '#C9A9E8', mercurio: '#A8D8EA', venere: '#F7C8D8', marte: '#E8836A', giove: '#FFE08A', saturno: '#B8B8C8' };

    order.forEach((key) => {
        const meta = window.bellineSeriesMeta[key];
        if (!meta) return;
        const bullet = window.getBellineSeriesBullet(key);

        const div = document.createElement('div');
        div.className = 'bg-purple-900 bg-opacity-60 rounded-2xl border-2 p-5';
        div.style.borderColor = colors[key] || '#B8860B';
        div.style.boxShadow = '0 16px 36px -12px rgba(0, 0, 0, 0.75)';
        div.innerHTML = `
            <div class="flex items-center gap-3 mb-3">
                <span class="w-4 h-4 rounded-full inline-block" style="background:${colors[key] || '#B8860B'}"></span>
                <h4 class="card-name text-xl">${meta.label}</h4>
            </div>
            <p class="text-sm text-gray-200">${bullet}</p>
            <p class="text-xs text-gray-400 mt-3">Pianeta: ${meta.planet} · Elemento: ${meta.element}</p>
        `;
        ref.appendChild(div);
    });
}

// Export per il browser (chiamata dall'inline di index.html)
window.renderBellineSeries = renderBellineSeries;