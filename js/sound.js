/* Sound design em WebAudio (sem arquivos). Tudo começa DESLIGADO e só ativa após clique do usuário
   (política de autoplay). Respeita prefers-reduced-motion para a trilha. UMD: partes puras testáveis no Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(null);
  else root.GRSound = factory(root);
})(typeof self !== 'undefined' ? self : this, function (win) {
  var midiToFreq = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
  // Progressão em Lá menor (Am–F–C–G), arpejo de colcheias: 16 passos por compasso.
  var CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
  var ROOTS = [33, 29, 36, 31];
  function step(i) {            // i: índice global do passo de 1/8
    var bar = Math.floor(i / 8) % CHORDS.length, k = i % 8, c = CHORDS[bar];
    return { root: ROOTS[bar], lead: c[[0, 1, 2, 1, 0, 2, 1, 2][k]] + 12, kick: k % 4 === 0, hat: k % 2 === 1 };
  }
  var api = { midiToFreq: midiToFreq, step: step, CHORDS: CHORDS };
  if (!win) return api;

  var ctx = null, master = null, fxOn = false, musicOn = false, timer = null, next = 0, idx = 0, BPM = 112;
  function ensure() {
    if (!ctx) {
      var AC = win.AudioContext || win.webkitAudioContext; if (!AC) return false;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.35; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }
  function tone(freq, t, dur, type, vol, slideTo, filter) {
    var o = ctx.createOscillator(), g = ctx.createGain(), out = g;
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    if (filter) { var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filter; o.connect(f); f.connect(g); } else o.connect(g);
    out.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(t, dur, vol, hp) {
    var n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    s.buffer = b; f.type = 'highpass'; f.frequency.value = hp; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }
  var fx = {
    tick: function () { var t = ctx.currentTime; tone(1400, t, 0.05, 'square', 0.12, 900); },
    hit: function () { var t = ctx.currentTime; noise(t, 0.06, 0.35, 2500); tone(220, t, 0.12, 'triangle', 0.35, 90); },   // "toc" de bola na raquete
    ok: function () { var t = ctx.currentTime; tone(660, t, 0.12, 'sine', 0.2); tone(990, t + 0.09, 0.18, 'sine', 0.2); },
    warn: function () { var t = ctx.currentTime; tone(330, t, 0.16, 'sawtooth', 0.14, 260, 1200); },
    crit: function () { var t = ctx.currentTime; tone(150, t, 0.28, 'sawtooth', 0.28, 70, 700); tone(155, t + 0.14, 0.28, 'sawtooth', 0.22, 70, 700); }
  };
  api.play = function (name) { if (fxOn && ensure() && fx[name]) fx[name](); };
  api.fxEnabled = function () { return fxOn; };
  api.musicEnabled = function () { return musicOn; };
  api.setFx = function (on) { fxOn = !!on; if (on && ensure()) fx.ok(); return fxOn; };

  function schedule() {
    var spb = 60 / BPM / 2;
    while (next < ctx.currentTime + 0.3) {
      var s = step(idx++), t = next;
      tone(win.GRSound.midiToFreq(s.lead), t, spb * 0.9, 'sawtooth', 0.05, null, 1800);
      tone(win.GRSound.midiToFreq(s.root), t, spb * 0.95, 'square', 0.07, null, 400);
      if (s.kick) tone(130, t, 0.14, 'sine', 0.4, 45);
      if (s.hat) noise(t, 0.04, 0.05, 7000);
      next += spb;
    }
  }
  api.setMusic = function (on) {
    var reduce = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    on = !!on && !reduce;
    if (on && !musicOn) { if (!ensure()) return false; next = ctx.currentTime + 0.05; idx = 0; timer = win.setInterval(schedule, 100); musicOn = true; }
    else if (!on && musicOn) { win.clearInterval(timer); musicOn = false; }
    return musicOn;
  };
  return api;
});
