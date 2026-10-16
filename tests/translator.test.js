const test = require('node:test');
const assert = require('node:assert');
const T = require('../js/translator.js');
const O = require('../js/oficina.js');
const { packs } = require('../js/packs.js');

const keys = (s) => T.findTerms(s).map((x) => x.key);

test('regressão: "você" não casa com a sigla VOC (limite de palavra Unicode e siglas só em MAIÚSCULAS)', () => {
  assert.deepEqual(keys('Você segura a raquete e você escolhe.'), []);
  assert.deepEqual(keys('Há quantos meses você usa esta borracha?'), []);
  assert.deepEqual(keys('voc'), []); assert.deepEqual(keys('Voc'), []);
  assert.deepEqual(keys('Use cola sem VOC.'), ['VOC']);
});
test('siglas só em maiúsculas; palavras comuns sem diferenciar maiúsculas', () => {
  assert.deepEqual(keys('dureza ESN e esn'), ['ESN']); assert.deepEqual(keys('ALC e alc e Zlc e ZLC'), ['ALC', 'ZLC']);
  assert.deepEqual(keys('lâmina OFF+ e OFF rápida'), ['OFF+']); assert.deepEqual(keys('RPB e rpb, LARC e larc'), ['RPB', 'LARC']);
  assert.deepEqual(keys('o dwell time alto e o Throw Angle'), ['Dwell Time', 'Throw Angle']);
  assert.deepEqual(keys('um topspin, o Topspin'), ['Topspin', 'Topspin']);
});
test('limites de palavra: não casa dentro de outras palavras (acentuadas ou não)', () => {
  assert.deepEqual(keys('os tensores e o Tensor'), ['Tensor']);
  assert.deepEqual(keys('sem álcool, falcão, calça, Alcântara'), []);
  assert.deepEqual(keys('Topspinner e Tacky-grip'), []);
  assert.deepEqual(keys('bottom-out frequente'), ['bottom-out']);
  assert.deepEqual(keys('Edge Tape de 10 mm'), ['Edge Tape']);
  assert.deepEqual(keys('(sweet spot).'), ['Sweet Spot']);
  assert.equal(T.findTerms('o Tensor e a Tacky').map((x) => x.index).join(','), '2,13');
});
test('mais longo primeiro e índices corretos', () => {
  const r = T.findTerms('Head-Heavy e Head-Light');
  assert.deepEqual(r.map((x) => [x.key, x.index]), [['Head-Heavy', 0], ['Head-Light', 13]]);
  assert.equal(T.lookup('dwell time')[0], 'tempo de abraço da bola'); assert.equal(T.lookup('inexistente'), null);
  assert.ok(T.ACRONYMS.includes('VOC') && T.ACRONYMS.includes('OFF+'));
});
test('varredura: o texto real do site só ativa termos legítimos', () => {
  const corpus = O.all().flatMap((m) => [m.title, m.en, m.why, ...m.tools, ...m.steps.flat(), ...m.mistakes, ...m.safety])
    .concat(packs.flatMap((p) => [p.nome, p.perfil, p.leigo, p.alternativas || '', ...p.verificar]))
    .concat(['Você segura a raquete no estilo Clássica e quer aprender.', 'Para 6 horas semanais de treino, sua borracha Tensor durará aproximadamente 8 a 10 meses.']);
  const found = {};
  for (const t of corpus) for (const h of T.findTerms(t)) {
    found[h.key] = (found[h.key] || 0) + 1;
    if (T.ACRONYMS.includes(h.key)) assert.equal(h.text, h.key, 'sigla em minúsculas: ' + h.text + ' em "' + t.slice(0, 50) + '"');
    assert.ok(/^[A-Za-z]/.test(t.slice(h.index, h.index + 1)), 'início de termo inválido');
  }
  assert.ok(!('VOC' in found) || corpus.some((t) => /\bVOC\b/.test(t)), 'VOC só aparece onde há "VOC" literal');
  assert.ok(found['Topsheet'] > 0 && found['Edge Tape'] > 0, 'termos da oficina são encontrados: ' + Object.keys(found).join(','));
  for (const t of corpus.filter((x) => /voc[êe]/i.test(x))) assert.ok(!keys(t).includes('VOC'), 'você casou com VOC: ' + t);
});
