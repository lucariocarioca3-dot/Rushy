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
    title: "Como Otimizar sua Cadeia de Suprimentos com Rushy",
    excerpt: "Descubra as melhores práticas para maximizar a eficiência da sua operação logística usando o Rushy.",
    content: `A otimização da cadeia de suprimentos é fundamental para o sucesso de qualquer negócio. Com o Rushy, você pode gerenciar todos os aspectos da sua operação de forma integrada e eficiente.

## Principais Benefícios

Ao utilizar o Rushy, sua empresa pode esperar:

- **Redução de Custos:** Automação de processos reduz desperdícios e custos operacionais
- **Aumento de Produtividade:** Equipe mais focada em tarefas estratégicas
- **Visibilidade Total:** Dados em tempo real para melhor tomada de decisão
- **Escalabilidade:** Sistema preparado para crescer com seu negócio

## Implementação

A implementação do Rushy é simples e rápida. Nossa equipe oferece suporte completo durante todo o processo de integração com seus sistemas existentes.

Comece hoje mesmo e veja a diferença que uma plataforma moderna pode fazer na sua operação!`,
    author: "Equipe Rushy",
    date: "2024-05-20",
    category: "Dicas",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663649657028/jiHVYxryWTMS2NhH29b7ZQ/rushy-hero-dashboard-mFCyZtZ86HitfpH798sPSf.webp",
    readTime: 5
  },
  {
    id: "2",
    title: "Segurança de Dados: O Que Você Precisa Saber",
    excerpt: "Entenda como o Rushy protege seus dados com criptografia de ponta e conformidade com padrões internacionais.",
    content: `A segurança de dados é uma preocupação crescente para empresas de todos os tamanhos. No Rushy, levamos a segurança muito a sério.

## Camadas de Proteção

Implementamos múltiplas camadas de segurança:

- **Criptografia SSL/TLS:** Todas as comunicações são criptografadas
- **Autenticação Segura:** Senhas com hash bcrypt e MFA disponível
- **Backup Automático:** Seus dados são sempre protegidos
- **Conformidade LGPD:** Estamos em conformidade com a lei brasileira

## Boas Práticas

Recomendamos que você também siga algumas práticas de segurança:

1. Use senhas fortes e únicas
2. Ative a autenticação de múltiplos fatores
3. Mantenha seu navegador atualizado
4. Nunca compartilhe suas credenciais

Sua segurança é nossa responsabilidade!`,
    author: "Equipe de Segurança",
    date: "2024-05-18",
    category: "Segurança",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663649657028/jiHVYxryWTMS2NhH29b7ZQ/rushy-hero-dashboard-mFCyZtZ86HitfpH798sPSf.webp",
    readTime: 4
  },
  {
    id: "3",
    title: "Novos Recursos: Dashboard Aprimorado",
    excerpt: "Confira as novas funcionalidades do dashboard que vão revolucionar sua forma de trabalhar.",
    content: `Estamos muito felizes em anunciar a chegada de novos recursos para o dashboard do Rushy!

## O Que Há de Novo

### Gráficos Interativos Aprimorados
Os gráficos agora oferecem mais interatividade e informações em tempo real, permitindo análises mais profundas.

### Customização Avançada
Você pode agora personalizar completamente o layout do seu dashboard de acordo com suas necessidades.

### Relatórios Automáticos
Gere relatórios automáticos que são enviados diretamente para seu email em intervalos configuráveis.

### Integração com APIs Externas
Conecte suas ferramentas favoritas e centralize todas as informações em um único lugar.

## Como Usar

Acesse o dashboard e explore as novas opções de configuração. Nossa documentação completa está disponível no centro de ajuda.

Esperamos que você aproveite esses novos recursos!`,
    author: "Equipe de Produto",
    date: "2024-05-15",
    category: "Novidades",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663649657028/jiHVYxryWTMS2NhH29b7ZQ/rushy-hero-dashboard-mFCyZtZ86HitfpH798sPSf.webp",
    readTime: 6
  },
  {
    id: "4",
    title: "Histórias de Sucesso: Empresas Transformadas pelo Rushy",
    excerpt: "Veja como empresas reais estão usando o Rushy para revolucionar suas operações.",
    content: `Conhecer as histórias de sucesso de nossos clientes é inspirador. Veja como empresas de diferentes tamanhos estão transformando suas operações com o Rushy.

## Caso 1: Logística Express

Uma empresa de logística aumentou sua produtividade em 45% após implementar o Rushy. O sistema permitiu melhor rastreamento de pedidos e otimização de rotas.

## Caso 2: Distribuição de Alimentos

Uma distribuidora de alimentos reduziu perdas em 30% com melhor controle de estoque e validade de produtos usando o Rushy.

## Caso 3: Varejo Especializado

Uma rede de varejo conseguiu expandir para 5 novas unidades sem aumentar significativamente a equipe administrativa, graças à automação do Rushy.

## Seu Sucesso é Nosso Sucesso

Se você tem uma história de sucesso com o Rushy, adoraríamos ouvir! Entre em contato conosco e compartilhe sua experiência.`,
    author: "Equipe Rushy",
    date: "2024-05-10",
    category: "Sucesso",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663649657028/jiHVYxryWTMS2NhH29b7ZQ/rushy-hero-dashboard-mFCyZtZ86HitfpH798sPSf.webp",
    readTime: 5
  }
];
