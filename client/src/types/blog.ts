/**
 * Blog Types — Rushy Sistema de Gestão
 * Definições de tipos para o mini blog
 */

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image: string;
  readTime: number;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "Conheça o Rushy: Sua Plataforma Completa de Gestão Operacional",
    excerpt: "Descubra como o Rushy integra estoque, pedidos e logística em uma única interface moderna e eficiente.",
    content: `O Rushy nasceu com uma missão clara: simplificar a complexidade da gestão operacional para empresas que buscam agilidade e precisão. Nossa plataforma não é apenas uma ferramenta, mas um ecossistema completo desenhado para otimizar cada etapa do seu fluxo de trabalho.

## O Que é o Rushy?

O Rushy é um sistema de gestão (ERP) especializado em logística e operações. Ele centraliza informações que antes ficavam espalhadas em planilhas ou sistemas desconectados, permitindo que gestores e funcionários trabalhem em perfeita sincronia.

## Principais Módulos

### 1. Dashboard Inteligente
A primeira tela que você vê ao entrar é o seu centro de comando. Com gráficos em tempo real e KPIs (indicadores-chave) atualizados, você tem uma visão panorâmica da saúde da sua operação em segundos.

### 2. Gestão de Pedidos (Relatórios)
Acompanhe cada pedido desde a solicitação até a entrega final. Nosso sistema de status permite que todos saibam exatamente em que fase uma entrega se encontra, eliminando gargalos de comunicação.

### 3. Controle de Estoque
Nunca mais seja pego de surpresa por falta de materiais. O Rushy monitora níveis de estoque, alerta sobre itens baixos e facilita a reposição através da integração com fornecedores.

### 4. Gestão de Equipe e Fornecedores
Centralize o cadastro de seus colaboradores e parceiros logísticos. Atribua funções específicas (Gerente, Logística, Funcionário) para garantir que cada pessoa veja apenas o que é relevante para sua função.

## Por Que Escolher o Rushy?

- **Interface Moderna:** Design focado na experiência do usuário, com tema dark e alta legibilidade.
- **Segurança Robusta:** Proteção de dados com criptografia e conformidade com a LGPD.
- **Acesso em Qualquer Lugar:** Plataforma web responsiva que funciona perfeitamente em desktops e dispositivos móveis.
- **Transparência Total:** Histórico completo de ações para auditoria e melhoria contínua.

## Comece Agora

O Rushy foi feito para crescer com você. Seja você uma pequena operação local ou uma grande distribuidora, nossas ferramentas se adaptam às suas necessidades.

Explore as funcionalidades, crie seu primeiro pedido e sinta a diferença de ter o controle total da sua operação na palma da sua mão.`,
    author: "Equipe Rushy",
    date: "2024-05-24",
    category: "Novidades",
    image: "https://uploads.onecompiler.io/43tk45a7t/44hyh447z/imagem_2026-05-25_205345561.png",
    readTime: 6
  }
];
