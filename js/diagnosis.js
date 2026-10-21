/* Persistência do diagnóstico concluído (UMD, sem DOM). Uma única chave JSON gravada de uma vez: nunca fica meio gravada.
   `storage` é qualquer objeto com getItem/setItem/removeItem (localStorage no navegador, falso no teste). Tudo é tolerante a falhas:
   armazenamento bloqueado ou JSON corrompido equivale a "sem diagnóstico" (o site volta ao início do funil). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MasterWangDiagnosis = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var KEY = 'mw-diagnosis', VERSION = 1;
  // chaves ligadas ao diagnóstico (limpas no reset). Preferências de som, tradutor e modo NÃO entram.
  var RELATED = [KEY, 'mw-unlocked', 'mw-handle', 'mw-grip'];

  function getRaw(storage) { try { return storage ? storage.getItem(KEY) : null; } catch (e) { return null; } }
  function sanitize(a) {
    var out = {}; if (!a || typeof a !== 'object') return out;
    Object.keys(a).forEach(function (k) { if (typeof a[k] === 'string' && a[k].length <= 40 && /^[a-z_]+$/i.test(k)) out[k] = a[k]; });
    return out;
  }
  /** Lê sem validar regras de negócio: {answers, savedAt} ou null (ausente, versão errada ou corrompido). */
  function read(storage) {
    var raw = getRaw(storage); if (!raw) return null;
    try {
      var d = JSON.parse(raw);
      if (!d || d.v !== VERSION || !d.answers || typeof d.answers !== 'object' || isNaN(Date.parse(d.savedAt))) return null;
      return { answers: sanitize(d.answers), savedAt: d.savedAt };
    } catch (e) { return null; }
  }
  function save(storage, answers, now) {
    try { storage.setItem(KEY, JSON.stringify({ v: VERSION, savedAt: (now || new Date()).toISOString(), answers: sanitize(answers) })); return true; } catch (e) { return false; }
  }
  /** Lê e valida com `isValid(answers)`. Dado inválido ou corrompido é apagado para não travar o usuário. */
  function load(storage, isValid) {
    var d = read(storage);
    if (d && (!isValid || isValid(d.answers))) return d;
    if (getRaw(storage) != null) remove(storage);
    return null;
  }
  function remove(storage) { try { if (storage) storage.removeItem(KEY); } catch (e) { /* ignora */ } }
  function clear(storage) { RELATED.forEach(function (k) { try { if (storage) storage.removeItem(k); } catch (e) { /* ignora */ } }); }
  return { KEY: KEY, VERSION: VERSION, RELATED: RELATED, read: read, save: save, load: load, remove: remove, clear: clear };
});
