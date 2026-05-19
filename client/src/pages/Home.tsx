/**
 * Home — Landing Page do Rushy Sistema de Gestão
 * Design: Corporate Precision Dark + Green Accents
 * Página de apresentação pública do sistema
 */

import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, BarChart3, Users, Lock, Zap as ZapIcon, ArrowUpRight, Package, CheckCircle2, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

// Injetar estilos CSS para o efeito de glitch RGB Split
const injectGlitchStyles = () => {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes glitch-red {
      0% { clip-path: polygon(0 0, 100% 0, 100% 2%, 0 2%, 0 5%, 100% 5%, 100% 20%, 0 20%, 0 25%, 100% 25%, 100% 45%, 0 45%, 0 50%, 100% 50%, 100% 57%, 0 57%, 0 100%, 100% 100%); transform: translate(4px, 0); }
      20% { clip-path: polygon(0 0, 100% 0, 100% 3%, 0 3%, 0 8%, 100% 8%, 100% 22%, 0 22%, 0 26%, 100% 26%, 100% 48%, 0 48%, 0 52%, 100% 52%, 100% 60%, 0 60%, 0 100%, 100% 100%); transform: translate(3px, 0); }
      40% { clip-path: polygon(0 0, 100% 0, 100% 1%, 0 1%, 0 6%, 100% 6%, 100% 18%, 0 18%, 0 24%, 100% 24%, 100% 46%, 0 46%, 0 51%, 100% 51%, 100% 58%, 0 58%, 0 100%, 100% 100%); transform: translate(5px, 0); }
      60% { clip-path: polygon(0 0, 100% 0, 100% 4%, 0 4%, 0 7%, 100% 7%, 100% 21%, 0 21%, 0 27%, 100% 27%, 100% 49%, 0 49%, 0 53%, 100% 53%, 100% 61%, 0 61%, 0 100%, 100% 100%); transform: translate(2px, 0); }
      80% { clip-path: polygon(0 0, 100% 0, 100% 2%, 0 2%, 0 5%, 100% 5%, 100% 19%, 0 19%, 0 25%, 100% 25%, 100% 47%, 0 47%, 0 52%, 100% 52%, 100% 59%, 0 59%, 0 100%, 100% 100%); transform: translate(4px, 0); }
      100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); transform: translate(0, 0); }
    }
    
    @keyframes glitch-cyan {
      0% { clip-path: polygon(0 0, 100% 0, 100% 2%, 0 2%, 0 5%, 100% 5%, 100% 20%, 0 20%, 0 25%, 100% 25%, 100% 45%, 0 45%, 0 50%, 100% 50%, 100% 57%, 0 57%, 0 100%, 100% 100%); transform: translate(-4px, 0); }
      20% { clip-path: polygon(0 0, 100% 0, 100% 3%, 0 3%, 0 8%, 100% 8%, 100% 22%, 0 22%, 0 26%, 100% 26%, 100% 48%, 0 48%, 0 52%, 100% 52%, 100% 60%, 0 60%, 0 100%, 100% 100%); transform: translate(-3px, 0); }
      40% { clip-path: polygon(0 0, 100% 0, 100% 1%, 0 1%, 0 6%, 100% 6%, 100% 18%, 0 18%, 0 24%, 100% 24%, 100% 46%, 0 46%, 0 51%, 100% 51%, 100% 58%, 0 58%, 0 100%, 100% 100%); transform: translate(-5px, 0); }
      60% { clip-path: polygon(0 0, 100% 0, 100% 4%, 0 4%, 0 7%, 100% 7%, 100% 21%, 0 21%, 0 27%, 100% 27%, 100% 49%, 0 49%, 0 53%, 100% 53%, 100% 61%, 0 61%, 0 100%, 100% 100%); transform: translate(-2px, 0); }
      80% { clip-path: polygon(0 0, 100% 0, 100% 2%, 0 2%, 0 5%, 100% 5%, 100% 19%, 0 19%, 0 25%, 100% 25%, 100% 47%, 0 47%, 0 52%, 100% 52%, 100% 59%, 0 59%, 0 100%, 100% 100%); transform: translate(-4px, 0); }
      100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); transform: translate(0, 0); }
    }
    
    .glitch-card {
      position: relative;
      overflow: hidden;
    }
    
    .glitch-card:hover {
      z-index: 10;
    }
    
    .glitch-card:hover::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: inherit;
      border: inherit;
      border-radius: inherit;
      box-shadow: -2px 0 #00ffff, 2px 0 #ef4444;
      animation: glitch-cyan 0.15s infinite;
      opacity: 1;
      z-index: -1;
      pointer-events: none;
    }
    
    .glitch-card:hover::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: inherit;
      border: inherit;
      border-radius: inherit;
      box-shadow: 2px 0 #ef4444, -2px 0 #00ffff;
      animation: glitch-red 0.15s infinite;
      opacity: 1;
      z-index: -2;
      pointer-events: none;
    }
    
    .glitch-text {
      position: relative;
      z-index: 1;
    }
    
    .glitch-text:hover {
      animation: glitch-red 0.15s infinite;
      color: #ef4444;
      text-shadow: -2px 0 #00ffff, 2px 0 #ef4444;
    }
    
    .glitch-icon {
      position: relative;
      z-index: 1;
    }
    
    .glitch-icon:hover {
      animation: glitch-red 0.15s infinite;
      filter: drop-shadow(-2px 0 #00ffff) drop-shadow(2px 0 #ef4444);
    }
  `;
  document.head.appendChild(style);
};

export default function Home() {
  const [, navigate] = useLocation();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  
  useEffect(() => {
    injectGlitchStyles();
  }, []);

  const handleGetStarted = () => {
    navigate("/login");
  };

  const features = [
    {
      icon: BarChart3,
      title: "Gestão Completa",
      description: "Controle estoque, pedidos, fornecedores e equipe em um único lugar com precisão total",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: Users,
      title: "Colaboração em Tempo Real",
      description: "Trabalhe em equipe com permissões granulares e rastreamento completo de operações",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Lock,
      title: "Segurança Empresarial",
      description: "Dados criptografados e conformidade com padrões internacionais de proteção",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: ZapIcon,
      title: "Automação Inteligente",
      description: "Reduza tarefas manuais e aumente a produtividade da sua equipe significativamente",
      color: "from-orange-500 to-orange-600",
    },
  ];

  const stats = [
    { number: "Interface Moderna", label: "Experiência limpa e intuitiva", icon: "✨" },
    { number: "Alta Performance", label: "Sistema otimizado", icon: "⚡" },
    { number: "Suporte Contínuo", label: "Melhorias frequentes", icon: "🔄" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: "#0F1117" }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5" style={{ background: "rgba(15, 17, 23, 0.95)", backdropFilter: "blur(10px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Package className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-white hidden sm:inline" style={{ fontFamily: "Sora, sans-serif" }}>Rushy</span>
          </div>
<div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/faq")}
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors hidden sm:block"
            >
              FAQ
            </button>
            <Button
              onClick={() => navigate("/login")}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20"
            >
              Entrar
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-blue-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 w-fit">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Gestão Operacional Inteligente</span>
              </div>

              {/* Main heading */}
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-white" style={{ fontFamily: "Sora, sans-serif" }}>
                  Gerencie sua operação
                </h1>
                <p className="text-2xl sm:text-3xl font-semibold text-emerald-400">
                  com precisão e velocidade
                </p>
              </div>

              {/* Description */}
              <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
                Rushy oferece uma plataforma completa para gerenciar estoque, pedidos, fornecedores e equipe em tempo real. Tome decisões melhores com dados precisos e automação inteligente.
              </p>

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold group shadow-lg shadow-emerald-500/20"
                >
                  Começar Agora
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/5">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="text-2xl font-bold text-emerald-400 font-mono">{stat.number}</div>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right side - Visual showcase */}
            <motion.div
              className="relative h-full min-h-96 lg:min-h-screen flex items-center justify-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663649657028/jiHVYxryWTMS2NhH29b7ZQ/rushy-hero-dashboard-mFCyZtZ86HitfpH798sPSf.webp"
                  alt="Rushy Dashboard"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1117] via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            className="text-center mb-16 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>
              Recursos Poderosos
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar sua operação com eficiência e precisão
            </p>
          </motion.div>

          {/* Features grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  onClick={() => navigate("/login")}
                  className="group relative p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Background gradient on hover */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${feature.color}`}
                  />

                  <div className="relative z-10 space-y-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-semibold">Saiba mais</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>
              Por que escolher Rushy?
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Benefícios que transformam sua operação
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: TrendingUp, title: "Aumento de Produtividade", desc: "Até 40% mais eficiência operacional" },
              { icon: CheckCircle2, title: "Redução de Erros", desc: "Automação elimina erros manuais" },
              { icon: Zap, title: "Decisões Rápidas", desc: "Dados em tempo real para melhor análise" },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all"
                >
                  <Icon className="w-8 h-8 text-emerald-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-slate-400">{benefit.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Developers Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>
              Desenvolvedores
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              A equipe por trás do Rushy Sistema de Gestão
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { name: "Luiz Carlos", role: "Desenvolvedor", desc: "Líder de Projeto" },
              { name: "Gabriel dos Santos", role: "Desenvolvedor", desc: "Especialista em Backend" },
              { name: "Arthur Miguel", role: "Desenvolvedor", desc: "Especialista em Frontend" },
              { name: "Gabrielly Silvia", role: "Desenvolvedora", desc: "UI/UX Designer" },
              { name: "Gabriel Furtado", role: "Desenvolvedor", desc: "Analista de Sistemas" },
              { name: "Pedro Lucas", role: "Desenvolvedor", desc: "In Memoriam", tribute: "Descanse em paz", isPedro: true },
            ].map((dev, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={dev.isPedro ? "group p-8 rounded-2xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-all duration-300 text-center glitch-card" : "group p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 text-center"}
              >
                <div className={dev.isPedro ? "w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center mx-auto mb-6 border border-red-500/30 group-hover:scale-110 transition-transform duration-300 glitch-icon" : "w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 group-hover:scale-110 transition-transform duration-300"}>
                  <Users className={dev.isPedro ? "w-10 h-10 text-red-400" : "w-10 h-10 text-emerald-400"} />
                </div>
                <h3 className={dev.isPedro ? "text-xl font-bold text-white mb-1 group-hover:text-red-400 transition-colors glitch-text" : "text-xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors"}>{dev.name}</h3>
                <p className={dev.isPedro ? "text-red-500 text-sm font-medium mb-3 uppercase tracking-wider" : "text-emerald-500 text-sm font-medium mb-3 uppercase tracking-wider"}>{dev.role}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{dev.desc}</p>
                {dev.tribute && (
                  <p className={dev.isPedro ? "mt-4 text-xs text-red-400 italic font-medium border-t border-red-500/30 pt-4" : "mt-4 text-xs text-slate-500 italic font-medium border-t border-white/5 pt-4"}>
                    {dev.tribute}
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-500/2 p-12 sm:p-16 text-center overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>
                  Pronto para transformar sua operação?
                </h2>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                  Junte-se a centenas de empresas que já estão usando Rushy para otimizar sua cadeia de suprimentos
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20"
                >
                  Começar Agora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
