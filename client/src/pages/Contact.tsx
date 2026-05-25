/**
 * Contato — Rushy Sistema de Gestão
 * Página de contato com informações e formulário de mensagem
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Footer from "@/components/Footer";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Assunto é obrigatório";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Mensagem é obrigatória";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Mensagem deve ter no mínimo 10 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simular envio de email (em produção, isso seria uma chamada à API)
      const emailBody = `
Nome: ${formData.name}
Email: ${formData.email}
Assunto: ${formData.subject}

Mensagem:
${formData.message}
      `.trim();

      // Criar link mailto com os dados
      const mailtoLink = `mailto:rushylogistica@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(emailBody)}`;

      // Abrir cliente de email padrão
      window.location.href = mailtoLink;

      // Mostrar mensagem de sucesso
      toast.success("Mensagem preparada! Seu cliente de email será aberto.");
      setSubmitted(true);

      // Limpar formulário
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      // Resetar estado após 3 segundos
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpar erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{ background: "#0F1117" }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663633041925/U6yyCt5eDPDdeXjBJ8PtVE/rushy-login-bg-cEsnLBbDTWq8MCSUkKtvLJ.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F1117]/90 via-[#0F1117]/70 to-emerald-950/20 pointer-events-none" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Content */}
      <div className="flex-1 relative z-10">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-12 lg:py-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1
              className="text-4xl lg:text-5xl font-bold text-foreground mb-4"
              style={{ fontFamily: "Sora, sans-serif" }}
            >
              Entre em Contato
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tem dúvidas ou sugestões? Estamos aqui para ajudar. Entre em contato conosco e responderemos o mais breve possível.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Contact Info Cards */}
            {[
              {
                icon: Mail,
                title: "Email",
                content: "rushylogistica@gmail.com",
                href: "mailto:rushylogistica@gmail.com",
              },
              {
                icon: Phone,
                title: "Telefone",
                content: "+55 (34) 9 9900-8037",
                href: "tel:+5534999008037",
              },
              {
                icon: MapPin,
                title: "Localização",
                content: "Uberaba, MG - Brasil",
                href: "#",
              },
            ].map((item, idx) => (
              <motion.a
                key={idx}
                href={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="rounded-2xl border border-white/5 p-8 hover:border-emerald-500/30 transition-all group"
                style={{ background: "rgba(22, 27, 39, 0.6)", backdropFilter: "blur(20px)" }}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <item.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-foreground font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm group-hover:text-emerald-400 transition-colors">
                  {item.content}
                </p>
              </motion.a>
            ))}
          </div>

          {/* Horário de funcionamento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl border border-white/5 p-8 mb-16"
            style={{ background: "rgba(22, 27, 39, 0.6)", backdropFilter: "blur(20px)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-emerald-400" />
              <h3 className="text-foreground font-semibold text-lg">Horário de Funcionamento</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Segunda a Sexta: <span className="text-emerald-400 font-semibold">07:00 às 19:00</span>
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              Responderemos suas mensagens dentro do horário comercial.
            </p>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-2xl border border-white/5 p-8 lg:p-12"
            style={{ background: "rgba(22, 27, 39, 0.6)", backdropFilter: "blur(20px)" }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-8" style={{ fontFamily: "Sora, sans-serif" }}>
              Envie uma Mensagem
            </h2>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Mensagem Preparada!</h3>
                <p className="text-muted-foreground">
                  Seu cliente de email foi aberto com os dados da mensagem. Clique em enviar para completar.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome */}
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">
                      Nome *
                    </Label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Seu nome completo"
                      className={`bg-white/5 border-white/10 rounded-xl h-12 text-foreground placeholder-slate-600 ${
                        errors.name ? "border-red-500/50" : ""
                      }`}
                    />
                    {errors.name && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        {errors.name}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">
                      Email *
                    </Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="seu@email.com"
                      className={`bg-white/5 border-white/10 rounded-xl h-12 text-foreground placeholder-slate-600 ${
                        errors.email ? "border-red-500/50" : ""
                      }`}
                    />
                    {errors.email && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Assunto */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">
                    Assunto *
                  </Label>
                  <Input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Qual é o assunto da sua mensagem?"
                    className={`bg-white/5 border-white/10 rounded-xl h-12 text-foreground placeholder-slate-600 ${
                      errors.subject ? "border-red-500/50" : ""
                    }`}
                  />
                  {errors.subject && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {errors.subject}
                    </div>
                  )}
                </div>

                {/* Mensagem */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">
                    Mensagem *
                  </Label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Descreva sua mensagem aqui..."
                    rows={6}
                    className={`w-full bg-white/5 border border-white/10 rounded-xl p-4 text-foreground placeholder-slate-600 text-sm outline-none focus:border-emerald-500/50 transition-colors resize-none ${
                      errors.message ? "border-red-500/50" : ""
                    }`}
                  />
                  {errors.message && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {errors.message}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-foreground font-semibold py-3 rounded-lg transition-all shadow-lg shadow-emerald-500/20 gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Enviar Mensagem
                    </span>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  * Campos obrigatórios. Responderemos em breve.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-20 w-full">
        <Footer />
      </div>
    </div>
  );
}
