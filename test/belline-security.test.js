const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'belline-common.js'), 'utf8');
const functionSource = source.match(/function escapeBellineHtml\(value\) \{[\s\S]*?\n\}/)[0];
const escapeBellineHtml = vm.runInNewContext(`(${functionSource})`);

test('escapes dynamic text before it is inserted into HTML templates', () => {
    assert.equal(
        escapeBellineHtml(`<img src=x onerror="alert('xss')">`),
        '&lt;img src=x onerror=&quot;alert(&#39;xss&#39;)&quot;&gt;'
    );
});
