/* Texto do laudo e link de compartilhamento no WhatsApp (UMD, sem DOM). Nada é enviado: o usuário abre o link e decide. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MasterWangShare = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var MAX_ENCODED = 1900;   // links wa.me longos podem ser recusados; mantém margem

  function packLines(tag, p) {
    var out = ['*' + tag + ': ' + p.name + '* (compatibilidade ' + p.match + '%)',
      'Lâmina: ' + p.blade, 'Forehand: ' + p.fh, 'Backhand: ' + p.bh,
      'Peso total estimado: ' + p.weight + ' g · ' + p.balance, 'Saúde articular: ' + p.seal];
    if (p.price) out.push('Investimento estimado: ' + p.price);
    if (p.alerts && p.alerts.length) out.push('Alertas: ' + p.alerts.join('; '));
    return out;
  }
  /** d: {summary, primary, alternative|null, url}. Retorna o texto (formato WhatsApp: *negrito*, _itálico_). */
  function laudoText(d) {
    var lines = ['*LAUDO BIOMECÂNICO · Mestre Wang*', '_Guia da Raquete_', '', d.summary, ''];
    lines = lines.concat(packLines('Pack principal', d.primary));
    if (d.alternative) lines = lines.concat([''], packLines('Pack alternativo', d.alternative));
    lines = lines.concat(['', 'Pesos são estimativas: pese a sua raquete. Confirme as borrachas no LARC vigente e use cola à base d\'água (sem VOC).']);
    if (d.url) lines.push(d.url);
    return lines.join('\n');
  }
  /** Se o texto codificado passar do limite, descarta o pack alternativo e, em último caso, corta o final com reticências. */
  function fit(d) {
    var t = laudoText(d);
    if (encodeURIComponent(t).length <= MAX_ENCODED) return t;
    t = laudoText({ summary: d.summary, primary: d.primary, alternative: null, url: d.url });
    while (encodeURIComponent(t).length > MAX_ENCODED && t.length > 40) t = t.slice(0, Math.floor(t.length * 0.9)).replace(/\s+\S*$/, '') + '…';
    return t;
  }
  function buildWhatsAppUrl(text) { return 'https://wa.me/?text=' + encodeURIComponent(text); }
  return { laudoText: laudoText, fit: fit, buildWhatsAppUrl: buildWhatsAppUrl, MAX_ENCODED: MAX_ENCODED };
});
