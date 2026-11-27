# Pesquisas & Formulários / Vue 3

[Read in English](./README.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE) ![Grátis](https://img.shields.io/badge/pre%C3%A7o-gr%C3%A1tis-brightgreen)

Um construtor de formulários com os dois lados, feito em Vue 3.5, TypeScript, Vite 6 e Tailwind CSS v4: o formulário público que a pessoa responde de verdade e a área onde ele é montado e lido. Quem responde recebe uma pergunta por vez, barra de progresso, validação embaixo do campo e lógica condicional que realmente decide qual é a próxima pergunta e quais nunca aparecem. Quem monta tem construtor com arrastar para reordenar cobrindo dez tipos de pergunta, abas de lógica, aparência e compartilhar, um resumo que escolhe o gráfico certo para cada tipo — incluindo medidor de NPS e matriz de calor —, respostas individuais em drawer e exportação CSV feita no navegador. NPS, taxa de conclusão e tempo médio são calculados, nunca gravados. Seis formulários e cento e vinte e seis respostas vêm como dados de exemplo, gerados por um PRNG determinístico que percorre o mesmo motor de lógica do formulário público, persistidos em `localStorage`, sem backend nenhum.

## Telas incluídas

14 telas, cobrindo o site público e a área autenticada:

- Home: hero, os tipos de pergunta em cartões, como funciona em três passos, modelos prontos, depoimentos, planos e FAQ
- Modelos: galeria por objetivo (NPS, satisfação, inscrição em evento, pesquisa de mercado, feedback interno) com prévia das perguntas
- Responder: o formulário público de verdade — uma pergunta por vez, barra de progresso, validação e lógica condicional, com voltar e avançar
- Agradecimento: a mensagem final configurada mais o resumo do que foi respondido
- Contato: formulário de contato validado
- Login e Registro: telas de autenticação em layout próprio
- Visão geral: respostas no mês, taxa de conclusão, tempo médio, NPS, gráfico de respostas por dia, formulários mais respondidos e últimas respostas
- Formulários: tabela com busca e filtro por status, mais duplicar, encerrar e copiar o link público
- Construtor: abas Perguntas (arrastar para reordenar, painel lateral editando a pergunta selecionada e prévia ao vivo), Lógica, Aparência e Compartilhar
- Respostas: Resumo com um gráfico por tipo de pergunta e Individuais com tabela e drawer da resposta completa, mais exportar CSV
- Biblioteca de modelos: começar um formulário a partir de um modelo
- Contatos: quem respondeu, com origem, tags e nota
- Configurações: perfil, organização, notificação a cada resposta, tema e idioma
- Não encontrado: página 404

## Stack

- Vue 3.5 em SFC com `<script setup lang="ts">` e TypeScript 5.7
- Tailwind CSS v4 configurado em CSS (`@tailwindcss/vite`)
- Vite 6 com `vite-plugin-pwa` (PWA instalável, cache offline)
- Vue Router 4 com guard de navegação nas rotas da área logada
- Pinia 3 com `pinia-plugin-persistedstate`
- vue-i18n 11 (en, es, pt-BR)
- ApexCharts 5 via vue3-apexcharts
- Validação de formulário com VeeValidate 4 + Yup

## Requisitos

- Node.js 18 ou mais novo
- npm

## Como rodar

```bash
npm install
npm run dev
```

O Vite sobe um servidor de desenvolvimento com hot reload. A autenticação é simulada no store de auth (Pinia), então não há backend. Credenciais de demonstração:

- `pesquisa@sondagem.com` / `demo123`

Qualquer e-mail e senha não vazios entram; o par acima é a conta sugerida na tela de login e a dona dos dados de exemplo.

## Build de produção

```bash
npm run build
```

Roda o `vue-tsc` e escreve o bundle de produção em `dist/`. Para ver localmente: `npm run preview`.

## Estrutura do projeto

```
src/
├── components/{app,layout,sv,ui}/
├── data/              types.ts, mock.ts, query.ts
├── i18n/locales/      en.json, es.json, pt-BR.json
├── pages/{public,app}/
├── router/
└── stores/            auth.ts, ui.ts, survey.ts, filling.ts (Pinia + persistedstate)
```

## Tema e customização

O Tailwind CSS v4 é configurado em CSS, não em arquivo de configuração JavaScript. A folha de estilo importa o Tailwind, declara a variante dark e define os tokens dentro de `@theme`: a fonte Outfit, breakpoints extras e a rampa de cor da marca (`--color-brand-25` até `--color-brand-950`). Os tokens semânticos de superfície usam o prefixo `--tx-`. O dark mode é uma classe no elemento raiz, alternada em runtime e persistida. A cor e a capa de cada formulário são dados, então mudar a cara de uma pesquisa é mudança de dado, não de template.

## Internacionalização

O template vem com três idiomas: inglês, espanhol e português do Brasil. O idioma do navegador é detectado no primeiro acesso e o seletor do cabeçalho guarda a escolha. Datas, números e durações são formatados por idioma.

## O mesmo sistema em outras tecnologias

O mesmo sistema existe em cinco tecnologias, com as mesmas telas e a mesma identidade visual, e todas são gratuitas:

- React 19: https://github.com/danilo62x/survey-react
- Angular 19: https://github.com/danilo62x/survey-angular
- Laravel 11 + Blade: https://github.com/danilo62x/survey-laravel
- HTML estático: https://github.com/danilo62x/survey-html

Mais templates gratuitos (painéis admin, sistemas por segmento e apps Flutter): https://github.com/danilo62x?tab=repositories

## Licença

[MIT](./LICENSE), copyright 2026 Danilo Quinelato.
