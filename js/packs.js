/* Packs prontos ("Start Packs"): dados vindos da especificação do dono do site.
   Cada componente traz `verificado` e `catalogId` (quando existe em js/products.js). Itens fora do catálogo ficam marcados
   `noCatalogo:true`. Pesos de lâmina e de folha de borracha são ESTIMATIVAS (pese a sua raquete).
   Métricas 0–100 são EDITORIAIS (perfil do Mestre Wang), não derivadas do Revspin. Confirmar LARC vigente de cada borracha. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./userdata.js'));
  else root.MasterWangPacks = factory(root.MasterWangUserData);
})(typeof self !== 'undefined' ? self : this, function (UD) {
  // Folha crua estimada = peso cortado publicado / 0,685; sem publicação: 70 g (≈ 48 g cortados, faixa 44–52 g do guia).
  var RAW_DEFAULT = 70;
  var raw = function (cut) { return Math.round(cut / 0.685); };
  var THROW = { 'Baixo': 25, 'Médio': 50, 'Médio-Alto': 70, 'Alto': 90 };   // mapeamento editorial categoria → barra

  function rub(id, nome, esp, extra) {
    var r = { id: id, nome: nome, espessura: esp, rawSheetWeight: RAW_DEFAULT, rawEstimado: true, hardnessESN: null, verificado: false };
    for (var k in extra) r[k] = extra[k];
    return r;
  }

  var packs = [
    { id: 'pack-allround-intro', use: 'light', num: 1, seal: ['🏆', 'Mais Vendido para Iniciantes'], nome: 'Start Fundamentos & Controle Supremo', handle: 'shakehand', touch: 'soft',
      perfil: 'Iniciante absoluto / transição de raquete recreativa para profissional.',
      goals: { learn_control: 1, spin_attacker: 0.4, close_blocker: 0.6, competitive_step: 0.2 },
      blade: { id: 'stiga-allround-classic', catalogId: 'stiga-allround-classic', nome: 'Stiga Allround Classic', weight: 80, classe: 'ALL', construcao: '5 camadas All-Wood', rigidez: 'soft', verificado: false },
      fh: rub('xiom-vega-intro', 'Xiom Vega Intro', '2.0 mm', { hardnessESN: 47.5, noCatalogo: true, tipo: 'inverted' }),
      bh: rub('xiom-vega-intro', 'Xiom Vega Intro', '1.8 mm', { hardnessESN: 47.5, noCatalogo: true, tipo: 'inverted', corticaNota: 'Em caneta clássica (1 lado), substitui por folha de cortiça.' }),
      metrics: { speed: 68, spin: 82, control: 98, throwAngle: 'Médio-Alto', dwell: 94 },
      leigo: 'Não pula sozinha. Ela espera você fazer o movimento completo do braço e perdoa batidas fora do centro da raquete.',
      verificar: ['Xiom Vega Intro não está no catálogo com dados de jogadores; dureza 47,5° ESN vem da especificação.'] },
    { id: 'pack-spin-learner', use: 'light', num: 2, seal: ['⚡', 'Inovação em Spin'], nome: 'Escola de Topspin & Arco Alto', handle: 'shakehand', touch: 'soft',
      perfil: 'Iniciante avançado / atacante em formação que erra bolas na rede ou para fora.',
      goals: { learn_control: 0.5, spin_attacker: 1, close_blocker: 0.4, competitive_step: 0.5 },
      blade: { id: 'tibhar-stratus-power-wood', catalogId: 'tibhar-stratus-power-wood', nome: 'Tibhar Stratus Power Wood', weight: 84, classe: 'OFF-', construcao: '5 camadas All-Wood (Limba-Ayous)', rigidez: 'medium', verificado: false },
      fh: rub('yasaka-rakza-7-soft', 'Yasaka Rakza 7 Soft', '2.0 mm', { catalogId: 'yasaka-rakza-7-soft', hardnessESN: 40, tipo: 'tensor' }),
      bh: rub('donic-acuda-s3', 'Donic Acuda S3', '2.0 mm', { hardnessESN: 40, noCatalogo: true, tipo: 'tensor' }),
      metrics: { speed: 78, spin: 92, control: 90, throwAngle: 'Alto', dwell: 91 },
      leigo: "A borracha macia 'abraça' a bola e a joga em uma curva alta que passa com folga sobre a rede e mergulha no fundo da mesa.",
      verificar: ['Stratus Power Wood: a especificação indica OFF-; o catálogo traz "OFF (verificar)".', 'Donic Acuda S3 não está no catálogo; 40° ESN vem da especificação.', 'Rakza 7 Soft: 40° ESN vem da especificação (o catálogo só a marca como "macia" pelo nome).'] },
    { id: 'pack-korbel-pro', use: 'regular', num: 3, seal: ['🔥', 'Escolha do Treinador'], nome: 'Formação Competitiva Clássica', handle: 'shakehand', touch: 'balanced',
      perfil: 'Aluno de clube/escolinha (2x a 3x por semana) rumo aos primeiros torneios.',
      goals: { learn_control: 0.4, spin_attacker: 0.6, close_blocker: 0.7, competitive_step: 1 },
      blade: { id: 'butterfly-petr-korbel', catalogId: 'butterfly-petr-korbel', nome: 'Butterfly Petr Korbel', weight: 85, classe: 'OFF-', construcao: '5 camadas All-Wood (Limba-Limba-Ayous)', rigidez: 'medium', verificado: false },
      fh: rub('butterfly-rozena', 'Butterfly Rozena', '2.1 mm', { catalogId: 'butterfly-rozena', hardnessESN: 45, hardnessNota: '35° Butterfly / ~45° ESN (conversão aproximada da especificação)', tipo: 'tensor' }),
      bh: rub('xiom-vega-europe', 'Xiom Vega Europe', '2.0 mm', { catalogId: 'xiom-vega-europe', hardnessESN: 42.5, tipo: 'inverted' }),
      metrics: { speed: 84, spin: 89, control: 86, throwAngle: 'Médio-Alto', dwell: 87 },
      leigo: 'O padrão-ouro das academias de tênis de mesa. Uma madeira que dura 5 anos e acompanha sua evolução do nível básico ao avançado.',
      verificar: ['Rozena: ESN ~45 é conversão aproximada (escalas de fabricante não são convertíveis).'] },
    { id: 'pack-inner-carbon', use: 'heavy', num: 4, nome: 'Transição Fibra Interna / Inner-Carbon', handle: 'shakehand', touch: 'balanced',
      perfil: 'Intermediário consolidado que busca potência de carbono sem perder o toque de madeira.',
      goals: { learn_control: 0.1, spin_attacker: 0.7, close_blocker: 0.5, competitive_step: 0.8 },
      blade: { id: 'butterfly-innerforce-layer-alc-s', nome: 'Butterfly Innerforce Layer ALC.S', weight: 85, classe: 'OFF', construcao: '5 camadas + 2 Arylate-Carbon internos (inner carbon)', rigidez: 'medium', noCatalogo: true, verificado: false },
      fh: rub('yasaka-rakza-7', 'Yasaka Rakza 7', '2.0 mm', { catalogId: 'yasaka-rakza-7', hardnessESN: 47, rawSheetWeight: raw(50), rawEstimado: false, tipo: 'tensor' }),
      bh: rub('yasaka-rakza-7-soft', 'Yasaka Rakza 7 Soft', '2.0 mm', { catalogId: 'yasaka-rakza-7-soft', hardnessESN: 40, tipo: 'tensor' }),
      metrics: { speed: 88, spin: 93, control: 85, throwAngle: 'Alto', dwell: 86 },
      leigo: 'Diferente das raquetes de carbono comuns, duras e difíceis de controlar, aqui a fibra fica escondida no miolo: macia no saque, explosiva no ataque.',
      verificar: ['Innerforce Layer ALC.S não está no catálogo (o catálogo tem "Innerforce Layer ALC", modelo diferente).', 'Rakza 7: o catálogo registra 45–50° ESN com conflito entre fontes; a especificação usa 47°.'] },
    { id: 'pack-penhold-rpb', use: 'regular', num: 5, nome: 'Especialista Caneta Moderna Leve / RPB', handle: 'penhold', touch: 'balanced',
      perfil: 'Caneteiro que deseja usar os dois lados (RPB) ou atacar rápido sem lesionar o punho.',
      goals: { learn_control: 0.3, spin_attacker: 0.7, close_blocker: 0.8, competitive_step: 0.7 },
      blade: { id: 'yasaka-ma-lin-extra-offensive', catalogId: 'yasaka-ma-lin-extra-offensive', nome: 'Yasaka Ma Lin Extra Offensive (YEO)', weight: 81, classe: 'OFF-', construcao: '5 camadas All-Wood (peso selecionado)', rigidez: 'medium', verificado: false },
      fh: rub('dhs-neo-hurricane-3', 'DHS Hurricane 3 Neo (39° Comercial)', '2.0 mm', { catalogId: 'dhs-neo-hurricane-3', hardnessESN: null, hardnessNota: '39° na escala DHS (sem conversão para ESN)', rawSheetWeight: raw(53), rawEstimado: false, tipo: 'tacky' }),
      bh: rub('butterfly-rozena', 'Butterfly Rozena', '1.9 mm', { catalogId: 'butterfly-rozena', hardnessESN: 45, hardnessNota: '35° Butterfly / ~45° ESN (aproximado)', tipo: 'tensor' }),
      metrics: { speed: 85, spin: 94, control: 86, throwAngle: 'Médio-Alto', dwell: 88 },
      alternativas: 'Lâmina alternativa: Stiga Offensive Classic Penhold (CS). FH alternativo: Xiom Vega Pro. BH alternativo: Xiom Vega Europe 1.8 mm (esponja mais fina e leve).',
      leigo: 'Calibrado especificamente para quem segura como caneta: leve na ponta para não entortar ou cansar o punho ao virar a raquete.',
      verificar: ['Peso 81 g é "selecionado" (lâmina escolhida na balança); a lâmina pode variar.', 'Confirmar a versão de cabo caneta (CS) da lâmina antes de comprar.', 'Hurricane 3 Neo: dureza em escala DHS; a regra de bottom-out não é avaliada para ela.'] },
    { id: 'pack-tactical-block', use: 'regular', num: 6, nome: 'Bloqueio Tático & Contra-Ataque de Mesa', estilo: 'Allround+ / Pips Option', selo: 'Controle de Ritmo & Bloqueio Ativo',
      handle: 'shakehand', touch: 'balanced',
      perfil: 'Quem joga colado na mesa, bloqueia e varia o ritmo do ponto.',
      goals: { learn_control: 0.6, spin_attacker: 0.3, close_blocker: 1, competitive_step: 0.6 },
      blade: { id: 'yasaka-sweden-extra', catalogId: 'yasaka-sweden-extra', nome: 'Yasaka Sweden Extra', weight: 83, classe: 'ALL+', construcao: '5 camadas All-Wood', rigidez: 'soft', verificado: false },
      fh: rub('xiom-vega-pro', 'Xiom Vega Pro', '2.0 mm', { catalogId: 'xiom-vega-pro', hardnessESN: 47.5, tipo: 'tensor' }),
      bh: null,
      bhOptions: [
        { id: 'smooth', label: 'BH liso: Xiom Vega Intro 1.8 mm',
          bh: rub('xiom-vega-intro', 'Xiom Vega Intro', '1.8 mm', { hardnessESN: 47.5, noCatalogo: true, tipo: 'inverted' }) },
        { id: 'pips', label: 'BH tático: Victas Spectol S1 (pino curto) 1.8 mm',
          bh: rub('victas-spectol-s1-ex-tsp-spectol', 'Victas Spectol S1 (pino curto)', '1.8 mm', { catalogId: 'victas-spectol-s1-ex-tsp-spectol', tipo: 'short-pips',
            rawSheetWeight: 47, hardnessNota: 'pino curto: sem escala ESN',
            nota: 'Folha crua de 47 g derivada do peso total de ~166 g indicado na especificação (BH cortado ≈ 32 g).' }) }],
      metrics: { speed: 82, spin: 85, control: 92, throwAngle: 'Médio', dwell: 84 },
      alternativas: 'Lâmina alternativa: Nittaku Acoustic (5 camadas All-Wood). Opção tática: pino curto no BH para bloquear quebrando o efeito do adversário (ultra-rápido na transição). As métricas descrevem a configuração lisa/lisa; o pino curto muda o toque do backhand.',
      leigo: 'Ideal para quem não gosta de ficar longe da mesa e prefere devolver a bola rápido, abafando o ataque do adversário.',
      verificar: ['Peso 83 g vem da especificação; o catálogo registra 85 g para a Sweden Extra (varia por exemplar: pese a sua).', 'Xiom Vega Intro não está no catálogo; 47,5° ESN vem da especificação.', 'Victas Spectol S1: o catálogo lista espessuras 1,6 / 2,0 / Max; 1.8 mm vem da especificação, confirme antes de comprar.', 'Xiom Vega Pro: 47,5° ESN vem da especificação (sem dureza no catálogo).', 'Nittaku Acoustic (alternativa) não tem peso nem classe no catálogo.'] }
  ];
  packs.forEach(function (p) { if (p.bhOptions) p.bh = p.bhOptions[0].bh; });
  // Divergências com os dados do usuário entram só como aviso em `verificar` (não alteram pesos nem notas).
  if (UD) packs.forEach(function (p) { p.verificar = p.verificar.concat(UD.notesForPack(p)); });
  packs.forEach(function (p) { p.metrics.throwAngleBar = THROW[p.metrics.throwAngle]; });
  return { packs: packs, THROW: THROW, RAW_DEFAULT: RAW_DEFAULT };
});
