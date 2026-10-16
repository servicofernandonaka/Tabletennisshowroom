const test = require('node:test');
const assert = require('node:assert');
const P = require('../js/pricing.js');
const G = require('../js/geometry.js');
const PR = require('../js/products.js');

test('parseBRL: faixa, milhar e inválidos', () => {
  assert.deepEqual(P.parseBRL('307–375'), { min: 307, max: 375 });
  assert.deepEqual(P.parseBRL('645'), { min: 645, max: 645 });
  assert.deepEqual(P.parseBRL('1.087'), { min: 1087, max: 1087 });
  assert.deepEqual(P.parseBRL('R$ 1.087,50'), { min: 1087.5, max: 1087.5 });
  assert.deepEqual(P.parseBRL('375-307'), { min: 307, max: 375 });
  assert.equal(P.parseBRL(''), null); assert.equal(P.parseBRL(null), null); assert.equal(P.parseBRL('sem preço'), null);
});
test('faixas: limites exatos (400 entrada, 400,01 intermediário, 900 intermediário, 900,01 pro)', () => {
  assert.equal(P.band(0), 'entrada'); assert.equal(P.band(400), 'entrada'); assert.equal(P.band(400.01), 'intermediario');
  assert.equal(P.band(900), 'intermediario'); assert.equal(P.band(900.01), 'pro'); assert.equal(P.band(null), null); assert.equal(P.band(NaN), null);
  assert.deepEqual(P.BANDS.map((b) => b.label), ['Entrada', 'Intermediário', 'Pro']);
});
test('priceOf: R$ real tem prioridade; US$ vira estimativa; sem dado = null', () => {
  const a = P.priceOf({ usd: 94, brl: '645' }, 6.86); assert.equal(a.mid, 645); assert.equal(a.estimated, false);
  const b = P.priceOf({ usd: 40 }, 7); assert.equal(b.mid, 280); assert.equal(b.estimated, true);
  assert.equal(P.priceOf({ brl: '307–375' }, 7).mid, 341);
  assert.equal(P.priceOf({}, 7), null); assert.equal(P.priceOf({ usd: 40 }, null), null); assert.equal(P.priceOf(null, 7), null);
});
test('fxEstimate: mediana dos itens com R$ e US$ do catálogo real', () => {
  const fx = P.fxEstimate([...PR.blades, ...PR.rubbers, ...PR.pips]);
  assert.ok(fx > 6 && fx < 8, 'fator ' + fx);
  assert.equal(P.fxEstimate([{ usd: 10 }]), null);
  assert.equal(P.median([3, 1, 2]), 2); assert.equal(P.median([1, 2, 3, 4]), 2.5);
});
test('sumPrices e inRange (sem preço depende da opção)', () => {
  const s = P.sumPrices([{ mid: 100, estimated: false }, null, { mid: 50, estimated: true }]);
  assert.equal(s.total, 150); assert.equal(s.known, 2); assert.equal(s.complete, false); assert.equal(s.estimated, true);
  assert.equal(P.sumPrices([{ mid: 10 }]).complete, true);
  assert.equal(P.inRange(300, 0, 400, false), true); assert.equal(P.inRange(401, 0, 400, true), false);
  assert.equal(P.inRange(null, 0, 400, true), true); assert.equal(P.inRange(null, 0, 400, false), false);
  assert.equal(P.fmtBRL(1158.4), 'R$ 1.158'); assert.equal(P.fmtBRL(645), 'R$ 645');
});
test('catálogo ganhou os R$ do guia que estavam só no texto', () => {
  assert.equal(PR.find('butterfly-primorac-carbon').brl, '1087');
  assert.equal(PR.find('butterfly-feint-long-iii').brl, '348'); assert.equal(PR.find('butterfly-super-anti').brl, '283');
  assert.equal(PR.find('butterfly-dignics-09c').brl, '645');
});

test('geometria: hexágono tem +11% na metade superior e a mesma área total do oval', () => {
  const a = G.areas();
  assert.ok(Math.abs(a.upperGainPct - 11) < 0.15, 'ganho superior ' + a.upperGainPct.toFixed(3));
  assert.ok(Math.abs(a.totalRatio - 1) < 0.01, 'razão total ' + a.totalRatio);
  assert.ok(a.lowerGainPct < -5, 'metade inferior aparada: ' + a.lowerGainPct.toFixed(1));
  assert.equal(a.claimPct, 11);
  assert.ok(Math.abs(a.ovalTotal - Math.PI * 88 * 84) < 1e-9);
  assert.equal(G.polyArea([[0, 0], [4, 0], [4, 3], [0, 3]]), 12);       // verificação da área de polígono (shoelace)
});
test('geometria SVG: modos, máscara só no overlay, ids únicos e acessibilidade', () => {
  const o = G.geometrySvg('oval'), c = G.geometrySvg('cyber'), v = G.geometrySvg('overlay'), x = G.geometrySvg('invalido');
  assert.ok(o.includes('<ellipse') && !o.includes('geo-hex') && !o.includes('geo-extra'));
  assert.ok(c.includes('geo-hex') && !c.includes('geo-oval') && !c.includes('geo-extra'));
  assert.ok(v.includes('geo-extra') && v.includes('mask=') && v.includes('+11% área útil'));
  assert.ok(x.includes('geo-extra'), 'modo inválido cai no overlay');
  [o, c, v].forEach((s) => assert.match(s, /role="img" aria-label="[^"]+"/));
  const ids = (o + c + v).match(/ id="[^"]+"/g); assert.equal(new Set(ids).size, ids.length);
  assert.ok(!/(href|src)="https?:/.test(v));
});
