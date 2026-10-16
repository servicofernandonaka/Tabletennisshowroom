const test = require('node:test');
const assert = require('node:assert');
const O = require('../js/oficina.js');
const T = require('../js/translator.js');

const text = (m) => [m.title, m.en, m.why, ...m.tools, ...m.steps.flat(), ...m.mistakes, ...m.safety].join(' \n ');
const by = (id) => O.all().find((m) => m.id === id);

test('estrutura: 3 manuais obrigatórios na ordem do briefing + guia bônus', () => {
  assert.deepEqual(O.MANUALS.map((m) => m.id), ['selagem', 'cola', 'corte']);
  assert.equal(O.BONUS.id, 'manutencao'); assert.equal(O.all().length, 4);
  assert.deepEqual(O.MANUALS.map((m) => m.en), ['Blade Sealing', 'VOC-Free Assembly', 'Precision Edge Cutting']);
  for (const m of O.all()) {
    assert.ok(m.why.length > 30, m.id + ' sem "por que"'); assert.ok(m.tools.length >= 3, m.id + ' sem materiais');
    assert.ok(m.steps.length >= 3 && m.steps.every((s) => s.length === 2 && s[0] && s[1].length > 20), m.id + ' passos incompletos');
    assert.ok(m.mistakes.length >= 3 && m.safety.length >= 2, m.id + ' sem erros/segurança');
  }
  assert.ok(O.MANUALS.every((m) => m.steps.length >= 6), 'manuais com pelo menos 6 passos');
});
test('Passo 1 (selagem): lixa 400/600 levíssima, verniz acrílico base d\'água, demão ultrafina, secagem e repetição', () => {
  const t = text(by('selagem'));
  for (const k of [/lixa d'água 400 e 600/i, /400.*600/, /levíssimo/i, /verniz acrílico à base d'água/i, /selador específico/i, /ultrafina/i, /Limba ou Ayous/, /umidade e lascamentos/i, /secar/i, /Repita só se precisar/i]) assert.match(t, k, String(k));
});
test('Passo 2 (cola): esponja aplicadora, camada translúcida nas duas faces, leitosa → incolor, a partir do cabo, rolinho', () => {
  const t = text(by('cola'));
  for (const k of [/esponja aplicadora/i, /uniforme e translúcida/i, /leitosa a incolor/i, /a partir do cabo/i, /rolinho de borracha ou madeira/i, /exigência regulamentar da ITTF/i, /elasticidade da esponja/i, /nunca no topsheet/i, /ar/i]) assert.match(t, k, String(k));
  assert.match(t, /bula da cola/i, 'não inventa tempo de secagem: remete à bula');
  assert.doesNotMatch(t, /\b\d+\s*(min|minutos|horas|h)\b/i, 'sem tempos de secagem inventados');
});
test('Passo 3 (corte): base firme, estilete com lâmina nova ou tesoura curva, bisel para fora, lixa fina na quina', () => {
  const t = text(by('corte'));
  for (const k of [/base firme/i, /lâmina nova/i, /tesoura curva de precisão/i, /Incline levemente a lâmina do estilete para fora/i, /bisel/i, /contorno exato da borda/i, /lixa fina/i, /rebarbas/i, /mastigar a esponja/i, /deformar o topsheet/i]) assert.match(t, k, String(k));
  assert.match(t, /sem ultrapassar o limite/i); assert.match(t, /confira o texto vigente/i, 'regra ITTF citada com ressalva');
  assert.match(t, /para longe do corpo/i, 'segurança com o estilete');
});
test('Bônus: limpeza sem álcool com microfibra, película protetora (oxidação), edge tape 10/12 mm', () => {
  const t = text(by('manutencao'));
  for (const k of [/água pura/i, /sem álcool/i, /microfibra/i, /película protetora/i, /protection sheet/i, /oxidação pelo oxigênio do ar/i, /10 mm ou 12 mm/i, /absorver batidas acidentais na mesa/i]) assert.match(t, k, String(k));
  assert.equal(O.BONUS.steps.length, 3);
});
test('ilustrações SVG: puras, acessíveis, ids únicos, texto com cor explícita e sem recursos externos', () => {
  const all = O.all().map((m) => m.svg());
  all.forEach((s, i) => {
    assert.match(s, /^<svg [^>]*role="img"[^>]*aria-label="[^"]{20,}"/, 'a11y ' + i); assert.match(s, /<title>[^<]{20,}<\/title>/);
    assert.ok(!/(href|src)="https?:/.test(s), 'sem recurso externo'); assert.ok(!/<script|onclick|<image/i.test(s));
    (s.match(/<text [^>]*>/g) || []).forEach((t) => assert.match(t, /fill="/, 'texto SVG sem fill: ' + t));
  });
  const ids = all.join('').match(/ id="[^"]+"/g) || []; assert.equal(new Set(ids).size, ids.length, 'ids duplicados entre os SVGs');
  // todo marker/pattern referenciado existe
  const joined = all.join(''); (joined.match(/url\(#([^)]+)\)/g) || []).forEach((u) => assert.ok(joined.includes('id="' + u.slice(5, -1) + '"'), 'referência quebrada ' + u));
  assert.equal(O.illustrations.cola(), by('cola').svg()); assert.equal(O.all().length, all.length);
});
test('tradutor: termos novos da oficina (Topsheet, VOC, Edge Tape) estão no glossário', () => {
  for (const k of ['Topsheet', 'VOC', 'Edge Tape']) assert.ok(T.lookup(k), k);
  const re = T.buildPattern(); const hits = (O.all().map(text).join(' ').match(re) || []).map((x) => x.toLowerCase());
  assert.ok(hits.includes('topsheet') && hits.includes('edge tape'), 'o conteúdo usa termos traduzíveis: ' + hits.slice(0, 5));
});
