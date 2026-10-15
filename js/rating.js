/* Normalização do rating em pentágono (UMD, sem DOM).
   Fonte das notas: médias de usuários do Revspin.net, reescaladas com fórmulas fixas e públicas.
   Escalas de fabricante (Butterfly, Tibhar, Yasaka...) NÃO entram no radar: não são comparáveis. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GRRating = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var clamp = function (x) { return Math.max(0, Math.min(10, x)); };
  var r1 = function (x) { return Math.round(x * 10 + 1e-9) / 10; }; // meio para cima
  var lin = function (lo, k) { return function (R) { return r1(clamp((R - lo) * k)); }; };

  var norm = {
    compressed: lin(7, 10 / 3),   // vel/spin/ctrl de borracha; ctrl/cons de lâmina
    bladeSpeed: lin(6, 2.5),
    durability: lin(5, 2)
  };

  /** alta n>=50; média 20-49; baixa 10-19; sem dados <10 ou ausente. */
  function confidence(n) {
    if (n == null || n < 10) return 'sem dados';
    return n >= 50 ? 'alta' : n >= 20 ? 'média' : 'baixa';
  }
  var RANK = { 'sem dados': 0, 'baixa': 1, 'média': 2, 'alta': 3 };
  function minConfidence(list) {
    return list.reduce(function (a, c) { return RANK[c] < RANK[a] ? c : a; }, 'alta');
  }

  /** Pack: velocidade e controle = lâmina 40% + FH 30% + BH 30% (heurística);
      spin, arco e durabilidade vêm só das borrachas (média FH/BH). Retorna null se faltar dado. */
  function combine(blade, fh, bh) {
    var need = [blade && blade.vel, blade && blade.ctrl, fh && fh.vel, fh && fh.ctrl, fh && fh.spin, fh && fh.arco, fh && fh.dur,
      bh && bh.vel, bh && bh.ctrl, bh && bh.spin, bh && bh.arco, bh && bh.dur];
    if (need.some(function (x) { return x == null; })) return null;
    var w = function (a, b, c) { return r1(0.4 * a + 0.3 * b + 0.3 * c); };
    var m = function (a, b) { return r1((a + b) / 2); };
    return { velocidade: w(blade.vel, fh.vel, bh.vel), controle: w(blade.ctrl, fh.ctrl, bh.ctrl),
      spin: m(fh.spin, bh.spin), arco: m(fh.arco, bh.arco), durabilidade: m(fh.dur, bh.dur) };
  }
  return { norm: norm, confidence: confidence, minConfidence: minConfidence, combine: combine };
});
