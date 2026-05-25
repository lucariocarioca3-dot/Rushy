/**
 * Privacy — Rushy Sistema de Gestão
 * Design: Corporate Precision Dark + Green Accents
 * Política de Privacidade e Proteção de Dados
 */

import { motion } from "framer-motion";
import {
  Shield,
  Package,
  ArrowLeft,
  Lock,
  Eye,
  Users,
  Database,
  AlertCircle,
  CheckCircle2,
  Mail
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

export default function Privacy() {
  const [, navigate] = useLocation();

  const sections = [
    {
      title: "1. Introdução",
      icon: Shield,
      content: "A Rushy está comprometida em proteger sua privacidade e garantir que você tenha uma experiência positiva em nossa plataforma. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e salvaguardamos suas informações."
    },
    {
      title: "2. Informações que Coletamos",
      icon: Database,
      content: "Coletamos informações que você nos fornece diretamente, como nome, email, telefone e dados da empresa. Também coletamos informações automaticamente sobre seu uso da plataforma, incluindo endereço IP, tipo de navegador e páginas visitadas."
    },
    {
      title: "3. Como Usamos Suas Informações",
      icon: Eye,
      content: "Usamos suas informações para fornecer, manter e melhorar nossos serviços, processar transações, enviar comunicações, personalizar sua experiência e cumprir obrigações legais."
    },
    {
      title: "4. Compartilhamento de Informações",
      icon: Users,
      content: "Não vendemos suas informações pessoais. Podemos compartilhá-las com fornecedores de serviços que nos ajudam a operar a plataforma, sempre sob acordos de confidencialidade rigorosos."
    },
    {
      title: "5. Segurança de Dados",
      icon: Lock,
      content: "Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. Utilizamos criptografia SSL/TLS e autenticação de múltiplos fatores."
    },
    {
      title: "6. Retenção de Dados",
      icon: AlertCircle,
      content: "Retemos suas informações pessoais pelo tempo necessário para fornecer nossos serviços e cumprir obrigações legais. Você pode solicitar a exclusão de seus dados a qualquer momento."
    },
    {
      title: "7. Seus Direitos",
      icon: CheckCircle2,
      content: "Você tem direito a acessar, corrigir, atualizar ou excluir suas informações pessoais. Você também pode se opor ao processamento de seus dados e solicitar a portabilidade de dados."
    },
    {
      title: "8. Cookies e Rastreamento",
      icon: Eye,
      content: "Usamos cookies para melhorar sua experiência. Você pode controlar as configurações de cookies em seu navegador. Alguns cookies são essenciais para a funcionalidade da plataforma."
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
              <Package className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-white hidden sm:inline" style={{ fontFamily: "Sora, sans-serif" }}>Rushy</span>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-slate-400 hover:text-white hover:bg-white/5"
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
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Segurança e Privacidade</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-white"
            style={{ fontFamily: "Sora, sans-serif" }}
          >
            Política de Privacidade
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg"
          >
            Entenda como protegemos seus dados e respeitamos sua privacidade.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-slate-500 text-sm"
          >
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </motion.p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="flex-1 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {sections.map((section, idx) => {
              const Icon = section.icon;
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
                      <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: "Sora, sans-serif" }}>
                        {section.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5"
          >
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Dúvidas sobre Privacidade?</h3>
                <p className="text-slate-400 mb-4">
                  Se você tiver perguntas sobre esta Política de Privacidade ou sobre como tratamos seus dados, entre em contato conosco.
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

          {/* LGPD Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5"
          >
            <h4 className="text-white font-semibold mb-2">Conformidade com LGPD</h4>
            <p className="text-slate-400 text-sm">
              O Rushy está em conformidade com a Lei Geral de Proteção de Dados (LGPD) brasileira. Seus dados são processados com base em consentimento e são protegidos conforme exigido pela lei.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
