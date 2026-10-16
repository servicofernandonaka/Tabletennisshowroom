/* Geometria da cabeça da lâmina (UMD, sem DOM): oval clássico × hexágono estilo Cybershape.
   O hexágono é construído para ter +11% de área na metade superior (valor INFORMADO, não verificado em fonte oficial)
   e a mesma área total do oval (metade inferior aparada). Desenho esquemático. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MasterWangGeometry = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var C = { cx: 200, cy: 120, rx: 88, ry: 84 };
  var H = { tw: 72, th: 85, mw: 80, bw: 51, by: 78 };           // semi-larguras/alturas do hexágono (calibrado numericamente)
  var CLAIM = 0.11;                                             // +11% informado

  function hexPoints() {
    return [[C.cx - H.tw, C.cy - H.th], [C.cx + H.tw, C.cy - H.th], [C.cx + H.mw, C.cy + 4], [C.cx + H.bw, C.cy + H.by], [C.cx - H.bw, C.cy + H.by], [C.cx - H.mw, C.cy + 4]];
  }
  function polyArea(p) { var s = 0; for (var i = 0; i < p.length; i++) { var a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s) / 2; }
  function clip(p, upper) {       // recorta pelo plano y = cy (Sutherland–Hodgman)
    var out = [];
    for (var i = 0; i < p.length; i++) {
      var a = p[i], b = p[(i + 1) % p.length], ain = upper ? a[1] <= C.cy : a[1] >= C.cy, bin = upper ? b[1] <= C.cy : b[1] >= C.cy;
      if (ain) out.push(a);
      if (ain !== bin) { var t = (C.cy - a[1]) / (b[1] - a[1]); out.push([a[0] + t * (b[0] - a[0]), C.cy]); }
    }
    return out;
  }
  /** Áreas (unidades do desenho) e razões hexágono/oval por região. */
  function areas() {
    var hp = hexPoints(), ovalTotal = Math.PI * C.rx * C.ry, ovalHalf = ovalTotal / 2;
    var hexUp = polyArea(clip(hp, true)), hexLow = polyArea(clip(hp, false)), hexTotal = polyArea(hp);
    return { ovalTotal: ovalTotal, ovalHalf: ovalHalf, hexUpper: hexUp, hexLower: hexLow, hexTotal: hexTotal,
      upperRatio: hexUp / ovalHalf, lowerRatio: hexLow / ovalHalf, totalRatio: hexTotal / ovalTotal,
      upperGainPct: (hexUp / ovalHalf - 1) * 100, lowerGainPct: (hexLow / ovalHalf - 1) * 100, claimPct: CLAIM * 100 };
  }

  var uid = 0;
  var f1 = function (x) { return Math.round(x * 10) / 10; };
  /** mode: 'oval' | 'cyber' | 'overlay'. */
  function geometrySvg(mode) {
    var m = mode === 'oval' || mode === 'cyber' ? mode : 'overlay', id = 'geo' + (++uid), hp = hexPoints().map(function (p) { return p[0] + ',' + p[1]; }).join(' ');
    var a = areas(), showOval = m !== 'cyber', showHex = m !== 'oval';
    var aria = m === 'oval' ? 'Cabeça de lâmina com formato oval clássico' : m === 'cyber' ? 'Cabeça de lâmina hexagonal estilo Cybershape, com a metade superior ampliada' :
      'Comparação: oval clássico e hexágono estilo Cybershape sobrepostos; a área extra do hexágono na metade superior está destacada (+' + f1(a.upperGainPct) + '%)';
    var ell = '<ellipse cx="' + C.cx + '" cy="' + C.cy + '" rx="' + C.rx + '" ry="' + C.ry + '"';
    return '<svg class="geo-svg" viewBox="0 0 400 300" role="img" aria-label="' + aria + '" xmlns="http://www.w3.org/2000/svg"><title>' + aria + '</title>' +
      '<defs><clipPath id="' + id + 'u"><rect x="0" y="0" width="400" height="' + C.cy + '"/></clipPath>' +
      '<mask id="' + id + 'm"><rect width="400" height="300" fill="#000"/><polygon points="' + hp + '" fill="#fff" clip-path="url(#' + id + 'u)"/>' + ell + ' fill="#000" clip-path="url(#' + id + 'u)"/></mask></defs>' +
      // cabo
      '<rect x="182" y="' + (C.cy + C.ry - 6) + '" width="36" height="78" rx="8" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.3)"/>' +
      // zona de impacto típica do bloqueio (parte alta)
      '<rect class="geo-zone" x="' + (C.cx - 54) + '" y="' + (C.cy - 66) + '" width="108" height="46" rx="10" fill="none" stroke="#FFB020" stroke-width="1.5" stroke-dasharray="4 4"/>' +
      (showHex ? '<polygon class="geo-hex" points="' + hp + '" fill="rgba(0,255,136,.16)" stroke="#00FF88" stroke-width="3" stroke-linejoin="round"/>' : '') +
      (showOval ? ell + ' class="geo-oval" fill="rgba(0,229,255,.14)" stroke="#00E5FF" stroke-width="3"/>' : '') +
      (m === 'overlay' ? '<rect class="geo-extra" width="400" height="300" fill="#FF2A5F" fill-opacity="0.75" mask="url(#' + id + 'm)"/>' : '') +
      '<line x1="40" y1="' + C.cy + '" x2="360" y2="' + C.cy + '" stroke="rgba(255,255,255,.25)" stroke-dasharray="2 5"/>' +
      '<text class="viz-t viz-s" x="6" y="' + (C.cy - 6) + '" fill="#9AA8C2">metade superior</text><text class="viz-t viz-s" x="6" y="' + (C.cy + 14) + '" fill="#9AA8C2">metade inferior</text>' +
      '<text class="viz-t viz-s" x="200" y="' + (C.cy - 8) + '" text-anchor="middle" fill="#FFB020">zona do bloqueio</text>' +
      (m === 'overlay' ? '<text class="viz-t" x="332" y="46" text-anchor="middle" fill="#FF6B8F">+' + f1(a.upperGainPct) + '% área útil</text><line x1="318" y1="52" x2="278" y2="62" stroke="#FF2A5F" stroke-width="2"/>' : '') +
      (m === 'oval' ? '<text class="viz-t" x="200" y="286" text-anchor="middle" fill="#00E5FF">Oval clássico</text>' : m === 'cyber' ? '<text class="viz-t" x="200" y="286" text-anchor="middle" fill="#00FF88">Hexagonal (estilo Cybershape)</text>' :
        '<text class="viz-t" x="200" y="286" text-anchor="middle"><tspan fill="#00E5FF">● Oval</tspan><tspan fill="#00FF88" dx="14">● Hexágono</tspan><tspan fill="#FF6B8F" dx="14">● Área extra</tspan></text>') +
      '</svg>';
  }
  return { C: C, H: H, CLAIM: CLAIM, hexPoints: hexPoints, areas: areas, geometrySvg: geometrySvg, polyArea: polyArea };
});
