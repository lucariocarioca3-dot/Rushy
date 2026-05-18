# Rushy — Ideias de Design

## Resposta 1
<response>
<probability>0.07</probability>
<text>
<idea>
**Design Movement:** Industrial Brutalism Funcional
**Core Principles:**
- Hierarquia visual agressiva com tipografia pesada e contrastes extremos
- Dados como protagonistas: tabelas e métricas ocupam 80% do espaço
- Cor como sinalização de status, não decoração

**Color Philosophy:** Fundo quase preto (#0D0D0D), verde operacional (#00C853) para ações positivas, laranja de alerta (#FF6D00) para urgência, cinza frio (#1E1E1E) para painéis. A identidade verde remete ao terminal e à operação industrial.

**Layout Paradigm:** Sidebar fixa de 64px com ícones, conteúdo em grid assimétrico 3-coluna. Sem bordas arredondadas — apenas cantos retos. Cada módulo é um "bloco" independente com cabeçalho em negrito.

**Signature Elements:**
- Linhas divisórias horizontais grossas (2px) em verde
- Tags de status com fundo sólido e texto em caps-lock
- Números de métricas em fonte monospace gigante

**Interaction Philosophy:** Hover revela detalhes adicionais sem animações suaves — transições instantâneas ou 50ms máximo. Clique produz feedback visual imediato.

**Animation:** Sem animações decorativas. Apenas fade-in de 100ms para modais. Dados atualizam com flash de cor.

**Typography System:** JetBrains Mono para dados e números; Space Grotesk Bold para títulos; Inter Regular para corpo de texto.
</idea>
</text>
</response>

## Resposta 2
<response>
<probability>0.08</probability>
<text>
<idea>
**Design Movement:** Neomorphism Operacional Verde
**Core Principles:**
- Superfícies com profundidade sutil via sombras internas/externas
- Verde como cor primária de identidade (alinhado ao branding Rushy)
- Sidebar expansível com transições fluidas e micro-animações

**Color Philosophy:** Fundo branco-gelo (#F5F7FA), verde Rushy (#22C55E) como primário, verde escuro (#15803D) para hover/ativo, cinza neutro (#64748B) para textos secundários. Cartões com sombras suaves duplas para efeito de profundidade.

**Layout Paradigm:** Sidebar lateral de 240px com logo, navegação por role e avatar do usuário. Área principal com header fixo mostrando breadcrumb e notificações. Grid de cards para KPIs no dashboard.

**Signature Elements:**
- Cards com sombra neomórfica (sombra clara acima, escura abaixo)
- Badges de role coloridos (verde escuro=Gerente, azul=Logística, amarelo=Estoque)
- Gráficos com gradiente verde

**Interaction Philosophy:** Hover eleva cards com sombra mais pronunciada. Transições de 200ms com ease-out. Sidebar colapsa para 64px em telas menores.

**Animation:** Entrada de página com slide-in de 300ms. Cards aparecem em cascata com stagger de 50ms. Tabelas carregam linha por linha.

**Typography System:** Plus Jakarta Sans para títulos e UI; Geist Mono para dados numéricos; tamanhos: 32px h1, 24px h2, 16px body, 13px caption.
</idea>
</text>
</response>

## Resposta 3 ✅ ESCOLHIDA
<response>
<probability>0.09</probability>
<text>
<idea>
**Design Movement:** Corporate Precision — Clean Dark com Acentos Verdes
**Core Principles:**
- Fundo escuro profissional com acentos verdes vibrantes (identidade Rushy)
- Densidade de informação alta sem sacrificar legibilidade
- Hierarquia clara: sidebar → header → conteúdo → detalhes

**Color Philosophy:** Background #0F1117 (quase preto azulado), sidebar #161B27, cards #1C2333. Verde primário #16A34A, verde brilhante #22C55E para CTAs e status ativos. Texto principal #F1F5F9, secundário #94A3B8. Vermelho #EF4444 para alertas, amarelo #F59E0B para urgência.

**Layout Paradigm:** Sidebar fixa 256px com logo Rushy, seções de navegação agrupadas por módulo, e indicador de role do usuário na base. Header de 64px com título da página, busca e avatar. Conteúdo principal com padding generoso e grid responsivo.

**Signature Elements:**
- Borda esquerda colorida em cards de status (verde=ok, amarelo=atenção, vermelho=urgente)
- Role badge no header com cor específica por perfil
- Tabelas com linhas alternadas em tons de cinza escuro

**Interaction Philosophy:** Hover em linhas de tabela revela ações inline. Modais com backdrop blur. Dropdowns com animação suave. Feedback de ação com toast no canto inferior direito.

**Animation:** Framer Motion para transições de página (200ms slide). Sidebar items com hover de 150ms. Skeleton loading para tabelas e cards.

**Typography System:** Sora para títulos e logo (peso 700/800); DM Sans para corpo e UI (peso 400/500/600); DM Mono para dados numéricos e códigos.
</idea>
</text>
</response>
