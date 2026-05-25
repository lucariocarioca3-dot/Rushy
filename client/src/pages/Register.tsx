/**
 * Register — Rushy Sistema de Gestão
 * Duas opções de cadastro: Empresa (gerente automático) ou Funcionário (aprovação necessária)
 * Com validações de segurança robustas
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Building2, Users, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Footer from "@/components/Footer";

type RegisterMode = "choice" | "company" | "employee";

export default function Register() {
  const [, navigate] = useLocation();
  const { registerCompany, registerEmployee, companies } = useAuth();
  const [mode, setMode] = useState<RegisterMode>("choice");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Company form
  const [companyName, setCompanyName] = useState("");
  const [companyCnpj, setCompanyCnpj] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPassword, setCompanyPassword] = useState("");
  const [companyUserName, setCompanyUserName] = useState("");

  // Employee form
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeePassword, setEmployeePassword] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState<"logistica" | "estoque">("logistica");
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "duplicate" | "pending" | "available">("idle");
  const [companyNameStatus, setCompanyNameStatus] = useState<"idle" | "checking" | "duplicate" | "available">("idle");
  const [cnpjStatus, setCnpjStatus] = useState<"idle" | "checking" | "duplicate" | "available">("idle");

  // Validação de e-mail
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validação de senha (mínimo 6 caracteres)
  const isValidPassword = (password: string) => {
    return password.length >= 6;
  };

  // Formatação automática de CNPJ (XX.XXX.XXX/0001-XX)
  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
    if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
  };

  // Validação de CNPJ (verifica se tem 14 dígitos após limpeza)
  const isValidCNPJ = (cnpj: string) => {
    const cleaned = cnpj.replace(/\D/g, "");
    return cleaned.length === 14;
  };

  const validateCompanyForm = () => {
    const newErrors: Record<string, string> = {};

    if (!companyName.trim()) newErrors.companyName = "Nome da empresa é obrigatório";
    if (!companyCnpj.trim()) newErrors.companyCnpj = "CNPJ é obrigatório";
    else if (!isValidCNPJ(companyCnpj)) newErrors.companyCnpj = "CNPJ inválido";

    if (!companyUserName.trim()) newErrors.companyUserName = "Seu nome é obrigatório";
    if (!companyEmail.trim()) newErrors.companyEmail = "E-mail é obrigatório";
    else if (!isValidEmail(companyEmail)) newErrors.companyEmail = "E-mail inválido";

    if (!companyPassword) newErrors.companyPassword = "Senha é obrigatória";
    else if (!isValidPassword(companyPassword)) newErrors.companyPassword = "Senha deve ter no mínimo 6 caracteres";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmployeeForm = () => {
    const newErrors: Record<string, string> = {};

    if (!employeeName.trim()) newErrors.employeeName = "Seu nome é obrigatório";
    if (!employeeEmail.trim()) newErrors.employeeEmail = "E-mail é obrigatório";
    else if (!isValidEmail(employeeEmail)) newErrors.employeeEmail = "E-mail inválido";

    if (!employeePassword) newErrors.employeePassword = "Senha é obrigatória";
    else if (!isValidPassword(employeePassword)) newErrors.employeePassword = "Senha deve ter no mínimo 6 caracteres";

    if (!selectedCompany) newErrors.selectedCompany = "Selecione uma empresa";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkCompanyNameAvailability = async (name: string) => {
    if (name.trim().length < 3) {
      setCompanyNameStatus("idle");
      return;
    }

    setCompanyNameStatus("checking");
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data } = await supabase
        .from('companies')
        .select('id')
        .ilike('name', name.trim())
        .maybeSingle();

      setCompanyNameStatus(data ? "duplicate" : "available");
    } catch (error) {
      console.error("Erro ao verificar nome da empresa:", error);
      setCompanyNameStatus("idle");
    }
  };

  const handleRegisterCompany = async () => {
    if (!validateCompanyForm()) return;
    if (companyNameStatus === "duplicate") {
      toast.error("Este nome de empresa já está em uso");
      return;
    }
    if (cnpjStatus === "duplicate") {
      toast.error("Este CNPJ já está cadastrado");
      return;
    }
    if (emailStatus === "duplicate" || emailStatus === "pending") {
      toast.error("Este e-mail já está em uso ou possui solicitação pendente");
      return;
    }

    setLoading(true);
    try {
      const success = await registerCompany(companyName, companyCnpj, companyEmail, companyPassword, companyUserName);
      if (success) {
        toast.success("Empresa criada! Você é agora o gerente.");
        navigate("/dashboard");
      } else {
        toast.error("Erro ao criar empresa. Tente novamente.");
      }
    } catch (error: any) {
      if (error.message === "NOME_DUPLICADO") {
        toast.error("Este nome de empresa já está em uso");
        setCompanyNameStatus("duplicate");
      } else {
        toast.error("Erro ao criar empresa");
      }
    } finally {
      setLoading(false);
    }
  };

  const checkEmailAvailability = async (email: string) => {
    if (!isValidEmail(email)) {
      setEmailStatus("idle");
      return;
    }

    setEmailStatus("checking");
    try {
      const { supabase } = await import("@/lib/supabase");
      const normalizedEmail = email.trim().toLowerCase();

      // 1. Verificar na tabela de usuários (contas ativas em qualquer empresa)
      const { data: userAccount } = await supabase
        .from('users')
        .select('id')
        .ilike('email', normalizedEmail)
        .maybeSingle();

      if (userAccount) {
        setEmailStatus("duplicate");
        return;
      }

      // 2. Verificar se tem solicitação pendente (em qualquer empresa)
      const { data: request } = await supabase
        .from('pending_requests')
        .select('id')
        .ilike('email', normalizedEmail)
        .maybeSingle();

      if (request) {
        setEmailStatus("pending");
        return;
      }

      setEmailStatus("available");
    } catch (error) {
      console.error("Erro ao verificar e-mail:", error);
      setEmailStatus("idle");
    }
  };

  const checkCnpjAvailability = async (cnpj: string) => {
    const cleaned = cnpj.replace(/\D/g, "");
    if (cleaned.length < 14) {
      setCnpjStatus("idle");
      return;
    }

    setCnpjStatus("checking");
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data } = await supabase
        .from('companies')
        .select('id')
        .eq('cnpj', cnpj)
        .maybeSingle();

      setCnpjStatus(data ? "duplicate" : "available");
    } catch (error) {
      console.error("Erro ao verificar CNPJ:", error);
      setCnpjStatus("idle");
    }
  };

  const handleRegisterEmployee = async () => {
    if (!validateEmployeeForm()) return;
    if (emailStatus === "duplicate" || emailStatus === "pending") {
      toast.error(emailStatus === "duplicate" ? "E-mail já cadastrado" : "Solicitação já pendente");
      return;
    }

    setLoading(true);
    const success = await registerEmployee(employeeEmail, employeePassword, employeeName, selectedCompany, selectedRole);
    setLoading(false);

    if (success) {
      toast.success("Solicitação enviada! Aguarde aprovação do gerente.");
      navigate("/login");
    } else {
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden" style={{ background: "#0F1117" }}>
      {/* Content wrapper - flexible layout */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-foreground font-bold text-lg" style={{ fontFamily: "Sora, sans-serif" }}>R</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "Sora, sans-serif" }}>
              Rushy
            </h1>
            <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Choice Screen */}
          {mode === "choice" && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "Sora, sans-serif" }}>
                  Como deseja começar?
                </h2>
                <p className="text-muted-foreground text-sm">Escolha a opção que melhor se encaixa na sua situação</p>
              </div>

              {/* Company Option */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setMode("company");
                  setErrors({});
                }}
                className="w-full p-5 rounded-xl border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
                style={{ background: "#1C2333" }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                    <Building2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-foreground text-sm mb-1">Criar Empresa</p>
                    <p className="text-xs text-muted-foreground">Você será the gerente e terá acesso total ao sistema</p>
                  </div>
                </div>
              </motion.button>

              {/* Employee Option */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setMode("employee");
                  setErrors({});
                }}
                className="w-full p-5 rounded-xl border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                style={{ background: "#1C2333" }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-foreground text-sm mb-1">Cadastrar como Funcionário</p>
                    <p className="text-xs text-muted-foreground">Solicite acesso a uma empresa existente (aprovação necessária)</p>
                  </div>
                </div>
              </motion.button>

              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-muted-foreground text-center mb-3">Já tem conta?</p>
                <Button
                  onClick={() => navigate("/login")}
                  variant="ghost"
                  className="w-full text-foreground hover:text-foreground border border-white/10"
                >
                  Voltar ao Login
                </Button>
              </div>
            </motion.div>
          )}

          {/* Company Register */}
          {mode === "company" && (
            <motion.div
              key="company"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <button
                onClick={() => setMode("choice")}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: "Sora, sans-serif" }}>
                  Criar Empresa
                </h2>
                <p className="text-muted-foreground text-sm">Você será o gerente da empresa</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Nome da Empresa
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCompanyName(val);
                        checkCompanyNameAvailability(val);
                        if (errors.companyName) setErrors({ ...errors, companyName: "" });
                      }}
                      placeholder="Ex: Rushy Logística"
                      className={`w-full px-3 py-2.5 rounded-lg bg-white/5 border text-foreground placeholder-slate-600 text-sm outline-none transition-colors ${
                        errors.companyName || companyNameStatus === "duplicate"
                          ? "border-red-500/50 focus:border-red-500/70"
                          : companyNameStatus === "available"
                          ? "border-emerald-500/50 focus:border-emerald-500/70"
                          : "border-white/10 focus:border-emerald-500/50"
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                      {companyNameStatus === "checking" && (
                        <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                      )}
                      {companyNameStatus === "available" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      {companyNameStatus === "duplicate" && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  {errors.companyName && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {errors.companyName}
                    </div>
                  )}
                  {companyNameStatus === "duplicate" && !errors.companyName && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      Este nome de empresa já está em uso
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                    CNPJ
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={companyCnpj}
                      onChange={(e) => {
                        const val = formatCNPJ(e.target.value);
                        setCompanyCnpj(val);
                        if (errors.companyCnpj) setErrors({ ...errors, companyCnpj: "" });
                        checkCnpjAvailability(val);
                      }}
                      placeholder="00.000.000/0001-00"
                      maxLength={18}
                      className={`w-full px-3 py-2.5 rounded-lg bg-white/5 border text-foreground placeholder-slate-600 text-sm outline-none transition-colors ${
                        errors.companyCnpj || cnpjStatus === "duplicate"
                          ? "border-red-500/50 focus:border-red-500/70"
                          : cnpjStatus === "available"
                          ? "border-emerald-500/50 focus:border-emerald-500/70"
                          : "border-white/10 focus:border-emerald-500/50"
                      }`}
                    />
                    {cnpjStatus === "checking" && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  {errors.companyCnpj && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {errors.companyCnpj}
                    </div>
                  )}
                  {cnpjStatus === "duplicate" && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      Este CNPJ já está cadastrado no sistema.
                    </div>
                  )}
                  {cnpjStatus === "available" && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-emerald-400 text-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      CNPJ disponível.
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-white/5 mt-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Dados do Gerente</p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                        Seu Nome
                      </label>
                      <input
                        type="text"
                        value={companyUserName}
                        onChange={(e) => {
                          setCompanyUserName(e.target.value);
                          if (errors.companyUserName) setErrors({ ...errors, companyUserName: "" });
                        }}
                        placeholder="Seu nome completo"
                        className={`w-full px-3 py-2.5 rounded-lg bg-white/5 border text-foreground placeholder-slate-600 text-sm outline-none transition-colors ${
                          errors.companyUserName
                            ? "border-red-500/50 focus:border-red-500/70"
                            : "border-white/10 focus:border-emerald-500/50"
                        }`}
                      />
                      {errors.companyUserName && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          {errors.companyUserName}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                        E-mail
                      </label>
                      <div className="relative">
                      <input
                        type="email"
                        value={companyEmail}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCompanyEmail(val);
                          if (errors.companyEmail) setErrors({ ...errors, companyEmail: "" });
                          checkEmailAvailability(val);
                        }}
                        placeholder="seu@email.com"
                        className={`w-full px-3 py-2.5 rounded-lg bg-white/5 border text-foreground placeholder-slate-600 text-sm outline-none transition-colors ${
                          errors.companyEmail || emailStatus === "duplicate" || emailStatus === "pending"
                            ? "border-red-500/50 focus:border-red-500/70"
                            : emailStatus === "available"
                            ? "border-emerald-500/50 focus:border-emerald-500/70"
                            : "border-white/10 focus:border-emerald-500/50"
                        }`}
                      />
                      {emailStatus === "checking" && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    {emailStatus === "duplicate" && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        Este e-mail já está cadastrado no sistema.
                      </div>
                    )}
                    {emailStatus === "pending" && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-yellow-400 text-xs">
                        <Clock className="w-3 h-3" />
                        Este e-mail possui uma solicitação pendente.
                      </div>
                    )}
                      {errors.companyEmail && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          {errors.companyEmail}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                        Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={companyPassword}
                          onChange={(e) => {
                            setCompanyPassword(e.target.value);
                            if (errors.companyPassword) setErrors({ ...errors, companyPassword: "" });
                          }}
                          placeholder="••••••••"
                          className={`w-full px-3 py-2.5 rounded-lg bg-white/5 border text-foreground placeholder-slate-600 text-sm outline-none transition-colors pr-10 ${
                            errors.companyPassword
                              ? "border-red-500/50 focus:border-red-500/70"
                              : "border-white/10 focus:border-emerald-500/50"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.companyPassword && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          {errors.companyPassword}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleRegisterCompany}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-foreground font-semibold py-2.5 rounded-lg transition-all mt-4"
              >
                {loading ? "Criando..." : "Criar Empresa e Conta"}
              </Button>
            </motion.div>
          )}

          {/* Employee Register */}
          {mode === "employee" && (
            <motion.div
              key="employee"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <button
                onClick={() => setMode("choice")}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: "Sora, sans-serif" }}>
                  Cadastro de Funcionário
                </h2>
                <p className="text-muted-foreground text-sm">Solicite acesso a uma empresa</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Seu Nome
                  </label>
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => {
                      setEmployeeName(e.target.value);
                      if (errors.employeeName) setErrors({ ...errors, employeeName: "" });
                    }}
                    placeholder="Seu nome completo"
                    className={`w-full px-3 py-2.5 rounded-lg bg-white/5 border text-foreground placeholder-slate-600 text-sm outline-none transition-colors ${
                      errors.employeeName
                        ? "border-red-500/50 focus:border-red-500/70"
                        : "border-white/10 focus:border-emerald-500/50"
                    }`}
                  />
                  {errors.employeeName && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {errors.employeeName}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                    E-mail
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={employeeEmail}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEmployeeEmail(val);
                        if (errors.employeeEmail) setErrors({ ...errors, employeeEmail: "" });
                        checkEmailAvailability(val);
                      }}
                      placeholder="seu@email.com"
                      className={`w-full px-3 py-2.5 rounded-lg bg-white/5 border text-foreground placeholder-slate-600 text-sm outline-none transition-colors ${
                        errors.employeeEmail || emailStatus === "duplicate" || emailStatus === "pending"
                          ? "border-red-500/50 focus:border-red-500/70"
                          : emailStatus === "available"
                          ? "border-emerald-500/50 focus:border-emerald-500/70"
                          : "border-white/10 focus:border-emerald-500/50"
                      }`}
                    />
                    {emailStatus === "checking" && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  {errors.employeeEmail && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {errors.employeeEmail}
                    </div>
                  )}
                  {emailStatus === "duplicate" && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      Este e-mail já está cadastrado nesta empresa.
                    </div>
                  )}
                  {emailStatus === "pending" && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-yellow-400 text-xs">
                      <Clock className="w-3 h-3" />
                      Você já possui uma solicitação pendente para esta empresa.
                    </div>
                  )}
                  {emailStatus === "available" && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-emerald-400 text-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      E-mail disponível para solicitação.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={employeePassword}
                      onChange={(e) => {
                        setEmployeePassword(e.target.value);
                        if (errors.employeePassword) setErrors({ ...errors, employeePassword: "" });
                      }}
                      placeholder="••••••••"
                      className={`w-full px-3 py-2.5 rounded-lg bg-white/5 border text-foreground placeholder-slate-600 text-sm outline-none transition-colors pr-10 ${
                        errors.employeePassword
                          ? "border-red-500/50 focus:border-red-500/70"
                          : "border-white/10 focus:border-emerald-500/50"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.employeePassword && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {errors.employeePassword}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Selecionar Empresa
                  </label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedCompany(val);
                      if (errors.selectedCompany) setErrors({ ...errors, selectedCompany: "" });
                    }}
                    className={`w-full px-3 py-2.5 rounded-lg bg-white/5 border text-foreground text-sm outline-none transition-colors ${
                      errors.selectedCompany
                        ? "border-red-500/50 focus:border-red-500/70"
                        : "border-white/10 focus:border-emerald-500/50"
                    }`}
                  >
                    <option value="">Escolha uma empresa...</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id} className="bg-slate-900">
                        {company.name}
                      </option>
                    ))}
                  </select>
                  {errors.selectedCompany && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {errors.selectedCompany}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Cargo
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as "logistica" | "estoque")}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:border-emerald-500/50 transition-colors"
                  >
                    <option value="logistica" className="bg-slate-900">
                      Logística
                    </option>
                    <option value="estoque" className="bg-slate-900">
                      Estoque
                    </option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleRegisterEmployee}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-foreground font-semibold py-2.5 rounded-lg transition-all mt-4"
              >
                {loading ? "Enviando..." : "Enviar Solicitação"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
