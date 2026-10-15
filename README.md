# Guia da Raquete (projeto separado do CalcMed)

Site estático (HTML/CSS/JS puro, abre direto por `guia-raquete/index.html`).

- `js/catalog.js`: catálogo por **arquétipos** (estimativas, `verified:false`). Sem produtos reais até haver fonte oficial.
- `js/engine.js`: motor determinístico (UMD, sem DOM): filtro por perfil, recomendação, validação de sinergia (bottom-out, pino longo + lâmina rígida, cores ITTF, empunhadura), peso, balance point, radar 0–10.
- `js/app.js` + `index.html`: Quiz, ficha técnica com radar, "Monte o Seu Pack" e guias.
- Testes: `node --test guia-raquete/tests/*.test.js`

Pendente: preencher `products` com dados oficiais (ESN/DHS, camadas, pesos) e ITTF/LARC.
