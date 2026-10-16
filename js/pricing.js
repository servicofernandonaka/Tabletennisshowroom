/* Preços e faixas de investimento (UMD, sem DOM).
   Preço em R$ vem do campo `brl` quando existe (lojas brasileiras citadas no guia). Sem `brl`, converte o US$ de referência do Revspin
   por um fator ESTIMADO e editável (padrão: mediana dos itens que têm preço nos dois formatos). Nada aqui é preço oficial. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MasterWangPricing = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var BANDS = [
    { id: 'entrada', icon: '🟢', label: 'Entrada', range: 'Até R$ 400', min: 0, max: 400 },
    { id: 'intermediario', icon: '🔵', label: 'Intermediário', range: 'R$ 400 - R$ 900', min: 400, max: 900 },
    { id: 'pro', icon: '🟣', label: 'Pro', range: 'Acima de R$ 900', min: 900, max: Infinity }
  ];

  /** '307–375' → {min:307,max:375}; '1.087' → 1087; vazio/inválido → null. */
  function parseBRL(v) {
    if (v == null || v === '') return null;
    var s = String(v).replace(/R\$\s*/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(/,/g, '.');
    var m = s.match(/(\d+(?:\.\d+)?)(?:\s*[–-]\s*(\d+(?:\.\d+)?))?/); if (!m) return null;
    var a = parseFloat(m[1]), b = m[2] != null ? parseFloat(m[2]) : a;
    return a <= b ? { min: a, max: b } : { min: b, max: a };
  }
  function median(xs) { var a = xs.slice().sort(function (x, y) { return x - y; }), n = a.length; if (!n) return null; return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2; }
  /** Mediana de (R$ médio ÷ US$) dos itens que têm os dois preços. */
  function fxEstimate(items) {
    var r = [];
    items.forEach(function (it) { var b = parseBRL(it.brl); if (b && it.usd > 0) r.push(((b.min + b.max) / 2) / it.usd); });
    var m = median(r); return m == null ? null : Math.round(m * 100) / 100;
  }
  /** Preço de um item do catálogo: {min,max,mid,estimated,source} ou null. */
  function priceOf(item, fx) {
    if (!item) return null;
    var b = parseBRL(item.brl);
    if (b) return { min: b.min, max: b.max, mid: (b.min + b.max) / 2, estimated: false, source: 'brl' };
    if (item.usd > 0 && fx > 0) { var v = item.usd * fx; return { min: v, max: v, mid: v, estimated: true, source: 'usd×fx' }; }
    return null;
  }
  /** Soma componentes: {total (soma do que tem preço), complete, known, count, estimated}. */
  function sumPrices(list) {
    var known = list.filter(Boolean), t = known.reduce(function (s, p) { return s + p.mid; }, 0);
    return { total: Math.round(t), known: known.length, count: list.length, complete: known.length === list.length,
      estimated: known.some(function (p) { return p.estimated; }) };
  }
  /** Faixa de investimento: ≤ 400 entrada; ≤ 900 intermediário; acima pro. */
  function band(value) {
    if (value == null || isNaN(value)) return null;
    return (value <= 400 ? BANDS[0] : value <= 900 ? BANDS[1] : BANDS[2]).id;
  }
  function bandInfo(id) { return BANDS.filter(function (b) { return b.id === id; })[0] || null; }
  /** Passa no filtro? Sem preço: depende de includeUnknown. */
  function inRange(value, lo, hi, includeUnknown) {
    if (value == null) return !!includeUnknown;
    return value >= lo && value <= hi;
  }
  function fmtBRL(n) { return 'R$ ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

  return { BANDS: BANDS, parseBRL: parseBRL, fxEstimate: fxEstimate, priceOf: priceOf, sumPrices: sumPrices, band: band, bandInfo: bandInfo, inRange: inRange, fmtBRL: fmtBRL, median: median };
});
