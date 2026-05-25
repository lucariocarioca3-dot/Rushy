/**
 * Cookies — Rushy Sistema de Gestão
 * Design: Corporate Precision Dark + Green Accents
 * Política de Cookies e Rastreamento
 */

import { motion } from "framer-motion";
import {
  Cookie,
  Package,
  ArrowLeft,
  Settings,
  Eye,
  BarChart3,
  Lock,
  AlertCircle,
  CheckCircle2,
  Mail,
  Zap
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

export default function Cookies() {
  const [, navigate] = useLocation();

  const cookieTypes = [
    {
      title: "Cookies Essenciais",
      icon: Lock,
      description: "Necessários para o funcionamento básico da plataforma",
      details: [
        "Autenticação e sessão do usuário",
        "Preferências de segurança",
        "Funcionalidades de navegação"
      ],
      essential: true
    },
    {
      title: "Cookies de Performance",
      icon: BarChart3,
      description: "Ajudam a melhorar a experiência do usuário",
      details: [
        "Análise de uso da plataforma",
        "Identificação de erros técnicos",
        "Medição de velocidade de carregamento"
      ],
      essential: false
    },
    {
      title: "Cookies de Funcionalidade",
      icon: Settings,
      description: "Armazenam suas preferências e configurações",
      details: [
        "Tema preferido (claro/escuro)",
        "Idioma selecionado",
        "Filtros e visualizações personalizadas"
      ],
      essential: false
    },
    {
      title: "Cookies de Rastreamento",
      icon: Eye,
      description: "Usados para entender como você interage com o sistema",
      details: [
        "Comportamento de navegação",
        "Recursos mais utilizados",
        "Padrões de uso e preferências"
      ],
      essential: false
    }
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
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0F1117" }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5" style={{ background: "rgba(15, 17, 23, 0.95)", backdropFilter: "blur(10px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Package className="text-foreground w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-foreground hidden sm:inline" style={{ fontFamily: "Sora, sans-serif" }}>Rushy</span>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10"
          >
            <Cookie className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Transparência Digital</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-foreground"
            style={{ fontFamily: "Sora, sans-serif" }}
          >
            Política de Cookies
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            Saiba como usamos cookies e tecnologias similares para melhorar sua experiência.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-sm"
          >
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </motion.p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="flex-1 pb-24 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border border-white/5 bg-[#161B27]/50"
          >
            <h2 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: "Sora, sans-serif" }}>
              O que são Cookies?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies são pequenos arquivos de texto armazenados no seu navegador que nos ajudam a reconhecê-lo quando você retorna ao Rushy. Eles melhoram sua experiência, mantêm você conectado e permitem que personalizemos o conteúdo que você vê.
            </p>
          </motion.div>

          {/* Cookie Types */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6" style={{ fontFamily: "Sora, sans-serif" }}>
              Tipos de Cookies que Usamos
            </h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              className="grid gap-4"
            >
              {cookieTypes.map((cookie, idx) => {
                const Icon = cookie.icon;
                return (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className="p-6 rounded-2xl border border-white/5 bg-[#161B27]/50 hover:border-emerald-500/30 hover:bg-[#1C2333] transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
                        <Icon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "Sora, sans-serif" }}>
                            {cookie.title}
                          </h3>
                          {cookie.essential && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                              Essencial
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">{cookie.description}</p>
                        <ul className="space-y-2">
                          {cookie.details.map((detail, dIdx) => (
                            <li key={dIdx} className="flex items-center gap-2 text-muted-foreground text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* How We Use Cookies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border border-white/5 bg-[#161B27]/50"
          >
            <div className="flex items-start gap-4">
              <Zap className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3" style={{ fontFamily: "Sora, sans-serif" }}>
                  Como Usamos Cookies
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Manter você autenticado e seguro na plataforma</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Lembrar suas preferências e configurações</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Analisar como você usa o Rushy para melhorias</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Personalizar sua experiência e conteúdo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Detectar e prevenir atividades fraudulentas</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Cookie Control */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5"
          >
            <div className="flex items-start gap-4">
              <Settings className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3" style={{ fontFamily: "Sora, sans-serif" }}>
                  Controle de Cookies
                </h3>
                <p className="text-muted-foreground mb-3">
                  Você tem controle total sobre os cookies. A maioria dos navegadores permite que você recuse cookies ou o alerte quando um cookie está sendo enviado. Você pode controlar cookies através das configurações do seu navegador:
                </p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• <strong>Chrome:</strong> Configurações → Privacidade e segurança → Cookies e dados de sites</li>
                  <li>• <strong>Firefox:</strong> Preferências → Privacidade e segurança → Cookies e dados de sites</li>
                  <li>• <strong>Safari:</strong> Preferências → Privacidade → Gerenciar dados do site</li>
                  <li>• <strong>Edge:</strong> Configurações → Privacidade e segurança → Cookies e outros dados de sites</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5"
          >
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">Aviso Importante</h3>
                <p className="text-muted-foreground">
                  Se você desabilitar cookies essenciais, algumas funcionalidades do Rushy podem não funcionar corretamente. Recomendamos manter os cookies essenciais habilitados para uma experiência ótima.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Third Party Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border border-white/5 bg-[#161B27]/50"
          >
            <h3 className="text-lg font-bold text-foreground mb-3" style={{ fontFamily: "Sora, sans-serif" }}>
              Serviços de Terceiros
            </h3>
            <p className="text-muted-foreground mb-3">
              O Rushy pode usar serviços de terceiros que também podem colocar cookies no seu navegador. Esses incluem:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span><strong>Google Analytics:</strong> Para análise de uso da plataforma</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span><strong>Supabase:</strong> Para autenticação e armazenamento de dados</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span><strong>Sentry:</strong> Para monitoramento de erros e performance</span>
              </li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5"
          >
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Dúvidas sobre Cookies?</h3>
                <p className="text-muted-foreground mb-4">
                  Se você tiver perguntas sobre nossa Política de Cookies, entre em contato conosco.
                </p>
                <a
                  href="mailto:rushylogistica@gmail.com"
                  className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  rushylogistica@gmail.com
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer forceDark />
    </div>
  );
}
