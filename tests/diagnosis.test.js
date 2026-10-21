const test = require('node:test'), assert = require('node:assert/strict');
const D = require('../js/diagnosis.js'), F = require('../js/funnel.js');
const fake = (init) => { const m = { ...(init || {}) }; return { m, getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: (k) => { delete m[k]; } }; };
const A = { mode: 'parts', grip: 'shakehand', goal: 'learn_control', touch: 'soft', body: 'standard_athletic', freq: 'regular' };

test('salvar e ler devolve respostas e data; grava tudo numa única chave', () => {
  const s = fake(), now = new Date('2026-10-21T12:00:00Z');
  assert.equal(D.save(s, A, now), true);
  assert.deepEqual(Object.keys(s.m), ['mw-diagnosis']);
  const d = D.read(s); assert.deepEqual(d.answers, A); assert.equal(d.savedAt, '2026-10-21T12:00:00.000Z');
});
test('sem dado, JSON corrompido, versão errada ou data inválida: null (volta ao início do funil)', () => {
  assert.equal(D.read(fake()), null);
  for (const raw of ['{', 'null', '[]', '{"v":2,"savedAt":"2026-01-01","answers":{}}', '{"v":1,"savedAt":"xx","answers":{}}', '{"v":1,"savedAt":"2026-01-01T00:00:00Z"}'])
    assert.equal(D.read(fake({ 'mw-diagnosis': raw })), null, raw);
});
test('load valida as respostas e apaga o que é inválido; dado válido permanece', () => {
  const ok = fake(); D.save(ok, A); assert.ok(D.load(ok, (a) => a.mode === 'parts')); assert.ok('mw-diagnosis' in ok.m);
  const bad = fake(); D.save(bad, { ...A, grip: 'inventado' });
  assert.equal(D.load(bad, (a) => a.grip === 'shakehand'), null); assert.ok(!('mw-diagnosis' in bad.m), 'inválido é removido');
  const junk = fake({ 'mw-diagnosis': '{' }); assert.equal(D.load(junk), null); assert.ok(!('mw-diagnosis' in junk.m));
});
test('sanitização: só strings curtas com chaves simples (nada de objetos ou HTML aninhado)', () => {
  const s = fake(); D.save(s, { grip: 'shakehand', evil: { a: 1 }, 'x-y': 'a', big: 'x'.repeat(100), n: 5 });
  assert.deepEqual(D.read(s).answers, { grip: 'shakehand' });
});
test('clear remove o diagnóstico e as chaves ligadas, e preserva preferências (som, tradutor, modo)', () => {
  const s = fake({ 'mw-diagnosis': 'x', 'mw-unlocked': '1', 'mw-handle': '{}', 'mw-grip': 'shakehand', 'mw-tw': 'on', 'mw-mode': 'pro', 'mw-desgaste': '{}' });
  D.clear(s); assert.deepEqual(Object.keys(s.m).sort(), ['mw-desgaste', 'mw-mode', 'mw-tw']);
});
test('armazenamento que lança erro (modo privado) não quebra nada', () => {
  const boom = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); }, removeItem() { throw new Error('x'); } };
  assert.equal(D.save(boom, A), false); assert.equal(D.read(boom), null); assert.equal(D.load(boom), null); D.clear(boom); D.remove(boom);
  assert.equal(D.read(null), null);
});
test('estágio inicial do funil com e sem diagnóstico salvo', () => {
  const st = (o) => F.initialStage({ hash: '', search: '', hasDiagnosis: false, ...o });
  assert.equal(st({}), 'landing', 'visitante novo começa no início do funil');
  assert.equal(st({ hash: '#topo' }), 'landing');
  assert.equal(st({ hash: '#wizard' }), 'quiz');
  assert.equal(st({ hash: '#oficina' }), 'landing', 'âncora de seção não fura o funil para quem não fez o diagnóstico');
  assert.equal(st({ hasDiagnosis: true }), 'result', 'com laudo salvo mostra o laudo');
  assert.equal(st({ hasDiagnosis: true, hash: '#wizard' }), 'result');
  assert.equal(st({ search: '?full=1' }), 'explore', '?full=1 continua abrindo o site completo (QA)');
  assert.equal(st({ search: '?a=1&full=1' }), 'explore'); assert.equal(st({ search: '?full=10' }), 'landing');
});
