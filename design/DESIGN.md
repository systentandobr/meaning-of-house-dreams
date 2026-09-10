# Casa dos Sonhos — Design System

## Identidade

Aplicativo de planejamento de construção residencial sustentável. A estética busca aconchego, leveza e conexão com materiais naturais brasileiros, inspirado em cozinhas com tijolinho branco, marcenaria verde-sálvia, bancadas de madeira e pendentes de vime/rattan.

## Paleta de cores (Stitch — Modernist Biophilic Natural)

| Token | Valor | Uso |
|-------|-------|-----|
| `background` | `#fff8f1` | fundo geral |
| `surface` | `#fff8f1` | superfícies principais |
| `surface-container` | `#f4ede3` | cards, módulos |
| `surface-container-low` | `#faf2e9` | fundo de visualizador, áreas secundárias |
| `surface-container-high` | `#efe7dd` | hover de superfícies |
| `outline` | `#767870` | bordas, ícones |
| `outline-variant` | `#c6c7be` | divisores sutis |
| `on-surface` | `#1e1b15` | texto principal |
| `on-surface-variant` | `#454840` | texto secundário |
| `primary` | `#585e4d` | ações principais (verde musgo) |
| `on-primary` | `#ffffff` | texto sobre primary |
| `primary-container` | `#707765` | fundo de badges/botões |
| `secondary` | `#7c572d` | acentos madeira |
| `secondary-container` | `#fecb97` | destaques quentes |
| `tertiary` | `#575f4e` | verde complementar |
| `error` | `#ba1a1a` | estados de erro |

## Tipografia

- **Fonte:** Manrope (Google Fonts) ou fallback sans-serif arredondada.
- **Display:** 3rem / peso 700 / line-height 3.5rem.
- **Headline:** 2.25rem / peso 600.
- **Body:** 1rem / peso 400 / line-height 1.45.
- **Label/Caption:** 0.875rem / peso 500.

## Componentes

### Cards
- Fundo `surface-container` (`#f4ede3`).
- Borda `1px solid outline-variant` (`#c6c7be`).
- Raio `16px` (rounded-lg).
- Sombra suave: `0 12px 32px -4px rgba(74, 70, 63, 0.08)`.

### Botões
- **Primário:** fundo `primary` (`#585e4d`), texto branco, raio `12px`.
- **Secundário:** fundo `surface-container`, borda `secondary` (`#7c572d`), texto `#4a463f`.

### Inputs
- Fundo `background` (`#fff8f1`) ou `surface-container-low`.
- Borda `1.5px solid #e7e1d4`.
- Foco: borda `primary` (`#585e4d`) com glow `rgba(125, 132, 113, 0.2)`.

### Badges sustentabilidade
- Eco: fundo `rgba(125, 132, 113, 0.12)`, texto `#58604f`, arredondado.
- Wood: fundo `rgba(212, 165, 116, 0.18)`, texto `#4a463f`.

## Layout

- Container máximo: `84rem` (1344px).
- Grid desktop: 12 colunas, gutter `2rem`, padding externo `3rem`.
- Espaçamento baseado em escala de 8px (4px micro, 72px entre seções).
- Mobile: 4 colunas, padding `1.25rem`.

## Inspiração visual

- Tijolinho branco aparente (`#faf2e9` como base, textura sutil).
- Madeira clara (`#d4a574` para acentos e badges).
- Verde-sálvia (`#7d8471` para ações primárias).
- Off-white e bege quente para fundos.
- Sombras difusas sem pretos puros, usando tonalidades de umber (`rgba(74, 70, 63, 0.08)`).

## Notas de implementação

- O design foi extraído do design system gerado no Stitch (`projectId: 11304404747716091179`, `designSystem: Modernist Biophilic Natural`).
- O HTML visual gerado pelo Stitch ainda precisa ser convertido em componentes React; o protótipo atual usa a paleta acima como referência para as classes do Tailwind/CSS.
