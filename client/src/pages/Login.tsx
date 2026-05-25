/**
 * Login — Rushy Sistema de Gestão
 * Design: Corporate Precision Dark + Green Accents
 * Tela de login com validações de segurança
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Footer from "@/components/Footer";

export default function Login() {
  const { login, loginLoading } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Validação de e-mail
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validação de senha (mínimo 6 caracteres)
  const isValidPassword = (password: string) => {
    return password.length >= 6;
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!isValidEmail(email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória";
    } else if (!isValidPassword(password)) {
      newErrors.password = "Senha deve ter no mínimo 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      toast.success(`Bem-vindo ao Rushy!`);
      navigate("/dashboard");
    } else {
      // Usamos a mensagem exata retornada pelo contexto de autenticação
      toast.error(result.message);
    }
  };

  const isFormValid = email && password && isValidEmail(email) && isValidPassword(password);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{ background: "#0F1117" }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663633041925/U6yyCt5eDPDdeXjBJ8PtVE/rushy-login-bg-cEsnLBbDTWq8MCSUkKtvLJ.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F1117]/80 via-[#0F1117]/60 to-emerald-950/30 pointer-events-none" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Content wrapper - flexible layout */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
        {/* Card */}
        <div
          className="rounded-2xl border border-white/8 p-8 shadow-2xl"
          style={{ background: "rgba(22, 27, 39, 0.95)", backdropFilter: "blur(20px)" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-bold text-lg" style={{ fontFamily: "Sora, sans-serif" }}>R</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-2xl leading-none" style={{ fontFamily: "Sora, sans-serif" }}>
                Rushy
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">Sistema de Gestão</p>
            </div>
          </div>

          <h2 className="text-white font-semibold text-xl mb-1" style={{ fontFamily: "Sora, sans-serif" }}>
            Entrar na plataforma
          </h2>
          <p className="text-slate-500 text-sm mb-6">Acesse sua conta com segurança</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                E-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.email;
                      return newErrors;
                    });
                  }}
                  placeholder="seu@email.com"
                  className={`w-full px-3 py-2.5 rounded-lg bg-white/5 border text-white placeholder-slate-600 text-sm outline-none transition-colors ${
                    errors.email
                      ? "border-red-500/50 focus:border-red-500/70"
                      : "border-white/10 focus:border-emerald-500/50"
                  }`}
                />
                {email && isValidEmail(email) && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                )}
              </div>
              {errors.email && (
                <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.password;
                      return newErrors;
                    });
                  }}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2.5 pr-10 rounded-lg bg-white/5 border text-white placeholder-slate-600 text-sm outline-none transition-colors ${
                    errors.password
                      ? "border-red-500/50 focus:border-red-500/70"
                      : "border-white/10 focus:border-emerald-500/50"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </div>
              )}

            </div>

            {/* Security info */}
            <div className="rounded-lg bg-blue-500/8 border border-blue-500/15 p-3">
              <p className="text-xs text-blue-400/80">
                <span className="font-semibold">🔒 Segurança:</span> Sua senha deve ter no mínimo 6 caracteres.
              </p>
            </div>

            {/* Demo hint */}
            <div className="rounded-lg bg-emerald-500/8 border border-emerald-500/15 p-3">
              <p className="text-xs text-emerald-400/80">
                <span className="font-semibold">Demo:</span> gerente@rushy.com / 123456
              </p>
            </div>

            <Button
              type="submit"
              disabled={loginLoading || !isFormValid}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-500/20"
            >
              {loginLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Entrar
                </span>
              )}
            </Button>
          </form>
        </div>

        <div className="text-center mt-6 space-y-3">
          <button
            onClick={() => navigate("/register")}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            Criar Nova Conta
          </button>
          <p className="text-slate-500 text-xs">Rushy © 2026 — Sistema de Gestão Empresarial</p>
        </div>
      </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-20 w-full">
        <Footer />
      </div>
    </div>
  );
}
