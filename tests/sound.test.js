const test = require('node:test');
const assert = require('node:assert');
const S = require('../js/sound.js');

test('midiToFreq: A4 = 440 Hz e oitava dobra a frequência', () => {
  assert.equal(S.midiToFreq(69), 440);
  assert.ok(Math.abs(S.midiToFreq(81) - 880) < 1e-9);
});
test('trilha: 4 acordes em Lá menor/F/C/G, kick a cada 4 passos e hat nos ímpares', () => {
  assert.equal(S.CHORDS.length, 4);
  assert.equal(S.step(0).kick, true); assert.equal(S.step(1).kick, false); assert.equal(S.step(4).kick, true);
  assert.equal(S.step(1).hat, true); assert.equal(S.step(2).hat, false);
  assert.equal(S.step(0).root, 33);          // A1
  assert.equal(S.step(8).root, 29);          // F1 (segundo compasso)
  assert.equal(S.step(32).root, 33);         // volta ao início do ciclo
});
