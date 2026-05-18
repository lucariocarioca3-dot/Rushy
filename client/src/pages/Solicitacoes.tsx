/**
 * Solicitações — Rushy Sistema de Gestão
 * Gerenciamento de solicitações de novos funcionários (somente Gerente)
 * Aceitar, recusar ou alterar role antes de aprovar
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Check, X, AlertCircle, Clock, CheckCircle2, XCircle,
  Filter, Search, Edit2, Save, ChevronDown
} from "lucide-react";
import { useAuth, ROLE_LABELS, ROLE_COLORS } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FilterStatus = "all" | "pendente" | "aceito" | "recusado";

export default function Solicitacoes() {
  const { user, pendingRequests, approvePendingUser, rejectPendingUser } = useAuth();
  const { addEmployee } = useData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("pendente");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<"logistica" | "estoque">("logistica");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Only gerente can access this page
  if (user?.role !== "gerente") {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-400">Apenas gerentes podem acessar esta página</p>
        </div>
      </DashboardLayout>
    );
  }

  const filtered = useMemo(() => {
    let result = pendingRequests.filter((r) => r.companyId === user.companyId);

    if (filter !== "all") {
      result = result.filter((r) => r.status === filter);
    }

    if (search) {
      result = result.filter(
        (r) =>
          r.userName.toLowerCase().includes(search.toLowerCase()) ||
          r.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    return result;
  }, [pendingRequests, user.companyId, filter, search]);

  const { employees } = useData();

  const handleApprove = (requestId: string, role: "logistica" | "estoque") => {
    const request = pendingRequests.find((r) => r.id === requestId);
    if (request) {
      // Verificar se o e-mail já existe na tabela de funcionários ativos
      const isDuplicate = employees.some(
        (emp) => emp.email.toLowerCase() === request.email.toLowerCase()
      );

      if (isDuplicate) {
        toast.error("Este e-mail já está cadastrado como funcionário ativo.");
        return;
      }

      const departmentMap: Record<"logistica" | "estoque", string> = {
        logistica: "Logística",
        estoque: "Estoque",
      };
      addEmployee({
        name: request.userName,
        email: request.email,
        role,
        department: departmentMap[role],
        joinDate: new Date().toISOString().split("T")[0],
        status: "ativo",
      });
    }
    approvePendingUser(requestId, role);
    toast.success("Funcionário aprovado!");
    setEditingId(null);
  };

  const handleReject = (requestId: string) => {
    if (!rejectReason.trim()) {
      toast.error("Informe o motivo da recusa");
      return;
    }
    rejectPendingUser(requestId, rejectReason);
    toast.success("Solicitação recusada");
    setRejectingId(null);
    setRejectReason("");
  };

  const pendingCount = pendingRequests.filter((r) => r.companyId === user.companyId && r.status === "pendente").length;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>
              Solicitações de Funcionários
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {pendingCount} solicitações pendentes
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <span className="text-red-400 font-bold text-lg">{pendingCount}</span>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/5 flex-1">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-full"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {(["all", "pendente", "aceito", "recusado"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border",
                  filter === status
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                    : "bg-white/5 border-white/5 text-slate-400 hover:text-slate-200"
                )}
              >
                <Filter className="w-3 h-3 inline mr-1" />
                {status === "all" ? "Todas" : status === "pendente" ? "Pendentes" : status === "aceito" ? "Aceitas" : "Recusadas"}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm rounded-xl border border-white/5 p-8" style={{ background: "#1C2333" }}>
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              {filter === "all"
                ? "Nenhuma solicitação encontrada"
                : filter === "pendente"
                ? "Nenhuma solicitação pendente"
                : filter === "aceito"
                ? "Nenhuma solicitação aceita"
                : "Nenhuma solicitação recusada"}
            </div>
          ) : (
            filtered.map((request, i) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-white/5 p-5"
                style={{ background: "#1C2333" }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-semibold text-white truncate">{request.userName}</p>
                      <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", 
                        request.status === "pendente" ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-300" :
                        request.status === "aceito" ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" :
                        "bg-red-500/20 border-red-500/30 text-red-300"
                      )}>
                        {request.status === "pendente" && <Clock className="w-3 h-3" />}
                        {request.status === "aceito" && <CheckCircle2 className="w-3 h-3" />}
                        {request.status === "recusado" && <XCircle className="w-3 h-3" />}
                        {request.status === "pendente" ? "Pendente" : request.status === "aceito" ? "Aceito" : "Recusado"}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{request.email}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Função solicitada: <span className="text-slate-300 font-medium">{ROLE_LABELS[request.requestedRole]}</span></span>
                      <span>•</span>
                      <span>Solicitado em {request.createdAt}</span>
                    </div>
                  </div>

                  {request.status === "pendente" && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setEditingId(request.id);
                          // Se a função solicitada for válida para edição (logistica ou estoque), pré-seleciona ela
                          if (request.requestedRole === "logistica" || request.requestedRole === "estoque") {
                            setEditRole(request.requestedRole as "logistica" | "estoque");
                          }
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setRejectingId(request.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Rejection reason */}
                {request.status === "recusado" && request.rejectionReason && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-300 mb-4">
                    <p className="font-medium mb-1">Motivo da recusa:</p>
                    <p>{request.rejectionReason}</p>
                  </div>
                )}

                {/* Edit/Approve Modal */}
                {editingId === request.id && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                        Confirmar função
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["logistica", "estoque"] as const).map((role) => (
                          <button
                            key={role}
                            onClick={() => setEditRole(role)}
                            className={cn(
                              "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                              editRole === role
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                                : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200"
                            )}
                          >
                            {ROLE_LABELS[role]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingId(null)}
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-slate-400 hover:text-white border border-white/10"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => handleApprove(request.id, editRole)}
                        size="sm"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Aprovar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reject Modal */}
                {rejectingId === request.id && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                        Motivo da recusa
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Ex: Função não disponível no momento..."
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm outline-none focus:border-red-500/50 resize-none"
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setRejectingId(null)}
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-slate-400 hover:text-white border border-white/10"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => handleReject(request.id)}
                        size="sm"
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white gap-2"
                      >
                        <X className="w-4 h-4" />
                        Recusar
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
