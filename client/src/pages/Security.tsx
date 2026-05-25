/**
 * Security — Rushy Sistema de Gestão
 * Design: Corporate Precision Dark + Green Accents
 * Segurança e Proteção de Dados
 */

import { motion } from "framer-motion";
import {
  Shield,
  Package,
  ArrowLeft,
  Lock,
  Server,
  Key,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Zap,
  Eye,
  Users,
  Database,
  Smartphone
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

export default function Security() {
  const [, navigate] = useLocation();

  const securityMeasures = [
    {
      title: "Criptografia SSL/TLS",
      icon: Lock,
      description: "Todas as comunicações entre seu navegador e nossos servidores são criptografadas",
      details: [
        "Certificado SSL de 256 bits",
        "Protocolo HTTPS em toda a plataforma",
        "Renovação automática de certificados"
      ]
    },
    {
      title: "Autenticação Segura",
      icon: Key,
      description: "Múltiplas camadas de autenticação para proteger sua conta",
      details: [
        "Hashing de senhas com bcrypt",
        "Autenticação de múltiplos fatores (MFA)",
        "Sessões com expiração automática",
        "Detecção de atividades suspeitas"
      ]
    },
    {
      title: "Infraestrutura em Nuvem",
      icon: Server,
      description: "Hospedagem em servidores seguros e escaláveis",
      details: [
        "Servidores distribuídos globalmente",
        "Redundância e backup automático",
        "Isolamento de dados por empresa",
        "Monitoramento 24/7"
      ]
    },
    {
      title: "Banco de Dados Protegido",
      icon: Database,
      description: "Dados armazenados com máxima segurança",
      details: [
        "Criptografia de dados em repouso",
        "Backups automáticos diários",
        "Replicação de dados em múltiplas regiões",
        "Acesso restrito e auditado"
      ]
    },
    {
      title: "Controle de Acesso",
      icon: Users,
      description: "Permissões granulares baseadas em funções",
      details: [
        "Sistema de roles (Gerente, Logística, Estoque)",
        "Permissões específicas por módulo",
        "Auditoria de ações de usuários",
        "Remoção imediata de acessos"
      ]
    },
    {
      title: "Monitoramento Contínuo",
      icon: Eye,
      description: "Vigilância constante de ameaças e anomalias",
      details: [
        "Detecção de tentativas de acesso não autorizado",
        "Alertas em tempo real de atividades suspeitas",
        "Análise de logs de segurança",
        "Resposta rápida a incidentes"
      ]
    }
  ];

  const bestPractices = [
    {
      title: "Use Senhas Fortes",
      description: "Crie senhas com pelo menos 12 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos."
    },
    {
      title: "Ative Autenticação de Múltiplos Fatores",
      description: "Adicione uma camada extra de segurança usando seu smartphone ou aplicativo de autenticação."
    },
    {
      title: "Nunca Compartilhe Suas Credenciais",
      description: "Nunca forneça sua senha ou código de autenticação a ninguém, nem mesmo a funcionários do Rushy."
    },
    {
      title: "Mantenha Seu Navegador Atualizado",
      description: "Use a versão mais recente do seu navegador para receber as últimas correções de segurança."
    },
    {
      title: "Desconecte em Computadores Compartilhados",
      description: "Sempre faça logout ao usar computadores públicos ou compartilhados."
    },
    {
      title: "Reporte Atividades Suspeitas",
      description: "Se notar algo estranho em sua conta, entre em contato conosco imediatamente."
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
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Proteção de Dados</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-foreground"
            style={{ fontFamily: "Sora, sans-serif" }}
          >
            Segurança e Proteção
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            Conheça as medidas que implementamos para proteger seus dados e manter sua plataforma segura.
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
              Nosso Compromisso com Segurança
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              A segurança dos seus dados é nossa prioridade máxima. Implementamos medidas de proteção em múltiplas camadas, desde criptografia de dados até monitoramento contínuo de ameaças. Estamos em conformidade com as melhores práticas internacionais de segurança da informação.
            </p>
          </motion.div>

          {/* Security Measures */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6" style={{ fontFamily: "Sora, sans-serif" }}>
              Medidas de Segurança
            </h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              className="grid gap-4"
            >
              {securityMeasures.map((measure, idx) => {
                const Icon = measure.icon;
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
                        <h3 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: "Sora, sans-serif" }}>
                          {measure.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3">{measure.description}</p>
                        <ul className="space-y-2">
                          {measure.details.map((detail, dIdx) => (
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

          {/* Best Practices */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6" style={{ fontFamily: "Sora, sans-serif" }}>
              Boas Práticas de Segurança
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {bestPractices.map((practice, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-6 rounded-2xl border border-white/5 bg-[#161B27]/50 hover:border-emerald-500/30 hover:bg-[#1C2333] transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <h3 className="font-bold text-foreground" style={{ fontFamily: "Sora, sans-serif" }}>
                      {practice.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {practice.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Incident Response */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5"
          >
            <div className="flex items-start gap-4">
              <Zap className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3" style={{ fontFamily: "Sora, sans-serif" }}>
                  Resposta a Incidentes
                </h3>
                <p className="text-muted-foreground mb-3">
                  Possuímos um plano de resposta a incidentes de segurança bem definido:
                </p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">1.</span>
                    <span><strong>Detecção:</strong> Monitoramento contínuo identifica ameaças</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">2.</span>
                    <span><strong>Contenção:</strong> Ação imediata para limitar o dano</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">3.</span>
                    <span><strong>Investigação:</strong> Análise completa do incidente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">4.</span>
                    <span><strong>Comunicação:</strong> Notificação transparente aos usuários</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">5.</span>
                    <span><strong>Recuperação:</strong> Restauração de serviços e dados</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Compliance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border border-white/5 bg-[#161B27]/50"
          >
            <h3 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: "Sora, sans-serif" }}>
              Conformidade e Certificações
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm">LGPD</p>
                  <p className="text-muted-foreground text-xs">Lei Geral de Proteção de Dados</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm">GDPR Ready</p>
                  <p className="text-muted-foreground text-xs">Regulamento Geral de Proteção de Dados</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm">ISO 27001</p>
                  <p className="text-muted-foreground text-xs">Gestão de Segurança da Informação</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm">SOC 2</p>
                  <p className="text-muted-foreground text-xs">Controles de Segurança Organizacional</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Report Vulnerability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl border border-amber-500/20 bg-amber-500/5"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Reportar uma Vulnerabilidade</h3>
                <p className="text-muted-foreground mb-4">
                  Se você descobrir uma vulnerabilidade de segurança, por favor nos avise de forma responsável. Não publique a vulnerabilidade publicamente até que tenhamos tido tempo de corrigi-la.
                </p>
                <a
                  href="mailto:security@rushylogistica.com"
                  className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  security@rushylogistica.com
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5"
          >
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Dúvidas sobre Segurança?</h3>
                <p className="text-muted-foreground mb-4">
                  Se você tiver perguntas sobre segurança ou preocupações com sua conta, nossa equipe está pronta para ajudar.
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

      <Footer />
    </div>
  );
}
