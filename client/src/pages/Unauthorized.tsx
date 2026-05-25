/**
 * Unauthorized — Rushy Sistema de Gestão
 * Página exibida quando o usuário não tem permissão para acessar um módulo
 */

import { motion } from "framer-motion";
import { ShieldX, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";

export default function Unauthorized() {
  const [, navigate] = useLocation();

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-full p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "Sora, sans-serif" }}>
            Acesso Negado
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            Você não tem permissão para acessar este módulo com o seu perfil atual.
            Entre em contato com o gerente para solicitar acesso.
          </p>
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-emerald-600 hover:bg-emerald-500 text-foreground gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
