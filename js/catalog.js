/* Catálogo por ARQUÉTIPOS (UMD). Sem produtos reais: nenhum nome comercial, dureza ESN/DHS
   ou peso de fabricante foi inserido sem fonte. Valores 0-10 e pesos são ESTIMATIVAS por
   categoria (verified:false). Para produtos reais, preencher `products` com dados oficiais. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GRCatalog = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var LEVELS = ['beginner', 'intermediate', 'advanced', 'pro'];

  var blades = [
    { id: 'all-wood', name: 'Lâmina Allround madeira', cls: 'ALL', layers: '5 camadas de madeira',
      stiffness: 'soft', speed: 4, control: 9, weight: [70, 85], balance: 'neutral',
      minLevel: 'beginner', grips: ['shakehand', 'penholder'] },
    { id: 'allplus-comp', name: 'Lâmina ALL+ composta', cls: 'ALL+', layers: '5 camadas de madeira + 2 de fibra (arylate/carbono)',
      stiffness: 'medium', speed: 6, control: 7, weight: [80, 90], balance: 'neutral',
      minLevel: 'intermediate', grips: ['shakehand', 'penholder'] },
    { id: 'off-carbon-out', name: 'Lâmina OFF carbono externo', cls: 'OFF', layers: '5 camadas de madeira + 2 de carbono externo',
      stiffness: 'stiff', speed: 8, control: 5, weight: [85, 95], balance: 'heavy',
      minLevel: 'advanced', grips: ['shakehand', 'penholder'] },
    { id: 'offplus-carbon', name: 'Lâmina OFF+ carbono ultra-rígida', cls: 'OFF+', layers: 'madeira + camadas de carbono (ultra-rígida)',
      stiffness: 'stiff', speed: 10, control: 3, weight: [88, 98], balance: 'heavy',
      minLevel: 'advanced', grips: ['shakehand', 'penholder'] },
    { id: 'def-wood', name: 'Lâmina Defensiva flexível', cls: 'DEF', layers: '5 camadas de madeira finas e flexíveis',
      stiffness: 'soft', speed: 3, control: 10, weight: [70, 85], balance: 'light',
      minLevel: 'beginner', grips: ['shakehand'] }
  ];

  function th(list) { return list; }
  var T_STD = th([{ id: '1.5', label: '1.5 mm', bucket: 'thin' }, { id: '1.8', label: '1.8 mm', bucket: 'std' },
    { id: '2.0', label: '2.0 mm', bucket: 'std' }, { id: 'max', label: 'Max', bucket: 'max' }]);
  var T_PIPS = th([{ id: 'ox', label: 'OX (sem esponja)', bucket: 'ox' }, { id: '1.0', label: '1.0 mm', bucket: 'thin' },
    { id: '1.5', label: '1.5 mm', bucket: 'std' }]);
  var W_SPONGE = { thin: [28, 36], std: [34, 44], max: [40, 52] };
  var W_PIPS = { ox: [15, 20], thin: [20, 28], std: [26, 34] };

  var rubbers = [
    { id: 'inv-classic', name: 'Invertida clássica (esponja média)', type: 'inverted', sponge: 'medium',
      thicknesses: T_STD, weight: W_SPONGE, minLevel: 'beginner',
      m: { speed: 5, spin: 6, control: 8, throwAngle: 5, dwell: 6 } },
    { id: 'tensor-soft', name: 'Tensor europeu (esponja macia)', type: 'tensor', sponge: 'soft',
      thicknesses: T_STD, weight: W_SPONGE, minLevel: 'intermediate',
      m: { speed: 7, spin: 9, control: 6, throwAngle: 8, dwell: 8 } },
    { id: 'tensor-medium', name: 'Tensor europeu (esponja média)', type: 'tensor', sponge: 'medium',
      thicknesses: T_STD, weight: W_SPONGE, minLevel: 'intermediate',
      m: { speed: 8, spin: 9, control: 5, throwAngle: 6, dwell: 6 } },
    { id: 'tensor-hard', name: 'Tensor (esponja dura)', type: 'tensor', sponge: 'hard',
      thicknesses: T_STD, weight: W_SPONGE, minLevel: 'advanced',
      m: { speed: 9, spin: 9, control: 4, throwAngle: 4, dwell: 4 } },
    { id: 'tacky-hard', name: 'Chinesa tacky (esponja dura)', type: 'tacky', sponge: 'hard',
      thicknesses: T_STD, weight: W_SPONGE, minLevel: 'advanced',
      m: { speed: 6, spin: 10, control: 4, throwAngle: 3, dwell: 4 } },
    { id: 'short-pips', name: 'Pino curto (esponja média)', type: 'short-pips', sponge: 'medium',
      thicknesses: T_PIPS, weight: W_PIPS, minLevel: 'intermediate',
      m: { speed: 7, spin: 3, control: 7, throwAngle: 3, dwell: 3 } },
    { id: 'long-pips', name: 'Pino longo (efeito invertido)', type: 'long-pips', sponge: 'soft',
      thicknesses: T_PIPS, weight: W_PIPS, minLevel: 'intermediate',
      m: { speed: 2, spin: 2, control: 8, throwAngle: 3, dwell: 3 } },
    { id: 'anti', name: 'Anti-spin', type: 'anti', sponge: 'soft',
      thicknesses: T_PIPS, weight: W_PIPS, minLevel: 'intermediate',
      m: { speed: 2, spin: 1, control: 9, throwAngle: 3, dwell: 3 } }
  ];

  blades.forEach(function (b) { b.verified = false; });
  rubbers.forEach(function (r) { r.verified = false; });

  return { LEVELS: LEVELS, blades: blades, rubbers: rubbers, products: [],
    note: 'Arquétipos estimados; produtos reais exigem fonte oficial do fabricante.' };
});
