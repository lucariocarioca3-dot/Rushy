import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth, ROLE_LABELS } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";
import { 
  User, Mail, Lock, Building2, FileText, 
  Calendar, Moon, Sun, ShieldCheck,
  Building
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";

export default function Configuracoes() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [companyCnpj, setCompanyCnpj] = useState<string>("");

  useEffect(() => {
    async function fetchCompanyData() {
      if (user?.companyId && (user.role === "gerente" || user.role === "admin")) {
        const { data } = await supabase
          .from('companies')
          .select('cnpj')
          .eq('id', user.companyId)
          .single();
        if (data) setCompanyCnpj(data.cnpj);
      }
    }
    fetchCompanyData();
  }, [user]);

  if (!user) return null;

  const isManagerOrAdmin = user.role === "gerente" || user.role === "admin";
  const isStaff = user.role === "logistica" || user.role === "estoque";

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
        <header>
          <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas preferências e informações de conta</p>
        </header>

        <div className="grid gap-8">
          {/* Aparência */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Sun className="w-5 h-5 text-emerald-400" />
                Aparência
              </CardTitle>
              <CardDescription>Personalize o tema da sua interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground">Tema</Label>
                  <p className="text-xs text-muted-foreground">Alternar entre tema claro e escuro</p>
                </div>
                <div className="flex items-center gap-3 bg-muted p-1 rounded-lg">
                  <Button 
                    variant={theme === "light" ? "secondary" : "ghost"} 
                    size="sm" 
                    onClick={() => theme === "dark" && toggleTheme?.()}
                    className="gap-2"
                  >
                    <Sun className="w-4 h-4" /> Claro
                  </Button>
                  <Button 
                    variant={theme === "dark" ? "secondary" : "ghost"} 
                    size="sm" 
                    onClick={() => theme === "light" && toggleTheme?.()}
                    className="gap-2"
                  >
                    <Moon className="w-4 h-4" /> Escuro
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Pessoais */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Nome de Usuário</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input value={user.name} readOnly className="pl-10 bg-background border-border text-foreground cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input value={user.email} readOnly className="pl-10 bg-background border-border text-foreground cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="password" value="********" readOnly className="pl-10 bg-background border-border text-foreground cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Função</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input value={ROLE_LABELS[user.role] || user.role} readOnly className="pl-10 bg-background border-border text-foreground cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Data de Criação</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input value={new Date(user.createdAt).toLocaleDateString('pt-BR')} readOnly className="pl-10 bg-background border-border text-foreground cursor-not-allowed" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Empresa (Condicional) */}
          {(isManagerOrAdmin || isStaff) && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                      {isManagerOrAdmin ? "Nome da Empresa" : "Empresa Atual"}
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input value={user.company} readOnly className="pl-10 bg-background border-border text-foreground cursor-not-allowed" />
                    </div>
                  </div>
                  {isManagerOrAdmin && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">CNPJ</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input value={companyCnpj || "---"} readOnly className="pl-10 bg-background border-border text-foreground cursor-not-allowed" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
