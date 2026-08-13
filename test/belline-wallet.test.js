const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadWallet(initialPlan) {
    const storage = new Map(initialPlan ? [['belline.plan.v1', initialPlan]] : []);
    const window = {};
    const document = {
        readyState: 'complete',
        createElement: () => ({
            className: '',
            setAttribute: () => {},
            classList: { add: () => {}, remove: () => {} }
        }),
        getElementById: () => null,
        querySelector: () => null,
        addEventListener: () => {},
        body: { appendChild: () => {} }
    };
    const sandbox = {
        window,
        document,
        localStorage: {
            getItem: key => storage.get(key) || null,
            setItem: (key, value) => storage.set(key, String(value))
        },
        setTimeout,
        clearTimeout,
        Event,
        console
    };
    window.document = document;
    window.addEventListener = () => {};
    window.dispatchEvent = () => {};
    vm.runInNewContext(
        fs.readFileSync(path.join(__dirname, '..', 'belline-wallet.js'), 'utf8'),
        sandbox,
        { filename: 'belline-wallet.js' }
    );
    return window.bellineWallet;
}

test('does not trust a cached paid plan without server confirmation', () => {
    const wallet = loadWallet('expert');

    assert.equal(wallet.getPlan(), 'free');
    assert.equal(wallet.dailyAllowance(), 4);
});

test('keeps the local free plan available offline', () => {
    const wallet = loadWallet('free');

    assert.equal(wallet.getPlan(), 'free');
    assert.equal(wallet.dailyAllowance(), 4);
});
