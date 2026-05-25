/**
 * Relatórios — Rushy Sistema de Gestão
 * Ver pedidos, editar status (em andamento/concluído/cancelado) e adicionar comentários
 * Acesso: Gerente (completo), Logística (ver + editar + status)
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Search, Edit2, X, Save, MessageSquare,
  TrendingUp, CheckCircle2, XCircle, Clock
} from "lucide-react";
import { useData, Order, OrderStatus } from "@/contexts/DataContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pendente: "Pendente", em_andamento: "Em Andamento",
  concluido: "Concluído", cancelado: "Cancelado",
};
const STATUS_COLORS: Record<OrderStatus, string> = {
  pendente: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-border",
  em_andamento: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-border",
  concluido: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-border",
  cancelado: "text-red-600 dark:text-red-400 bg-red-500/10 border-border",
};
const CHART_COLORS = ["#F59E0B", "#3B82F6", "#22C55E", "#EF4444"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-emerald-500/30 p-3 text-xs" style={{ background: "rgba(28, 35, 51, 0.95)", backdropFilter: "blur(8px)" }}>
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Relatorios() {
  const { orders, updateOrder } = useData();
  const [search, setSearch] = useState("");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState<OrderStatus>("pendente");
  const [editComment, setEditComment] = useState("");

  const filtered = useMemo(() =>
    orders.filter((o) =>
      o.product.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase())
    ), [orders, search]);

  const stats = useMemo(() => {
    const byStatus = Object.entries(STATUS_LABELS).map(([status, label]) => ({
      name: label,
      value: orders.filter((o) => o.status === status).length,
    }));
    const byUrgency = [
      { name: "Crítica", value: orders.filter((o) => o.urgency === "critica").length },
      { name: "Alta", value: orders.filter((o) => o.urgency === "alta").length },
      { name: "Média", value: orders.filter((o) => o.urgency === "media").length },
      { name: "Baixa", value: orders.filter((o) => o.urgency === "baixa").length },
    ];
    return { byStatus, byUrgency };
  }, [orders]);

  const openEdit = (order: Order) => {
    setEditingOrder(order);
    setEditStatus(order.status);
    setEditComment(order.comments || "");
  };

  const handleSave = () => {
    if (!editingOrder) return;
    updateOrder(editingOrder.id, { status: editStatus, comments: editComment });
    toast.success("Pedido atualizado!");
    setEditingOrder(null);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Sora, sans-serif" }}>
            Relatórios
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Acompanhe e gerencie o status dos pedidos</p>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border p-5 bg-card shadow-sm"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4" style={{ fontFamily: "Sora, sans-serif" }}>
              Pedidos por Status
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.byStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(34, 197, 94, 0.05)" }} />
                <Bar dataKey="value" name="Pedidos" radius={[4, 4, 0, 0]}>
                  {stats.byStatus.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border p-5 bg-card shadow-sm"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4" style={{ fontFamily: "Sora, sans-serif" }}>
              Pedidos por Urgência
            </h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={stats.byUrgency} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {stats.byUrgency.map((_, i) => <Cell key={i} fill={["#EF4444", "#F97316", "#F59E0B", "#22C55E"][i]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {stats.byUrgency.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ background: ["#EF4444", "#F97316", "#F59E0B", "#22C55E"][i] }} />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="text-foreground font-medium ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total", value: orders.length, icon: BarChart3, color: "text-foreground", bg: "bg-accent/50" },
            { label: "Pendentes", value: orders.filter((o) => o.status === "pendente").length, icon: Clock, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "Concluídos", value: orders.filter((o) => o.status === "concluido").length, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Cancelados", value: orders.filter((o) => o.status === "cancelado").length, icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="rounded-xl border border-border p-4 bg-card shadow-sm"
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", s.bg)}>
                <s.icon className={cn("w-4.5 h-4.5", s.color)} />
              </div>
              <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "Sora, sans-serif" }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Orders list with edit */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border overflow-hidden bg-card shadow-sm"
        >
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "Sora, sans-serif" }}>
              Todos os Pedidos
            </h3>
            <div className="flex items-center gap-2 bg-accent/50 rounded-lg px-3 py-1.5 border border-border">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="bg-transparent text-xs text-foreground placeholder-slate-600 outline-none w-32"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["ID", "Produto", "Data", "Status", "Comentário", "Ações"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 + i * 0.03 }}
                    className="border-b border-border hover:bg-accent/50 transition-colors group"
                  >
                    <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{order.id}</td>
                    <td className="px-5 py-3 text-sm text-foreground">{order.product}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{order.date}</td>
                    <td className="px-5 py-3">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", STATUS_COLORS[order.status])}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground max-w-xs truncate">
                      {order.comments || <span className="text-slate-700 italic">Sem comentário</span>}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => openEdit(order)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Edit Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl"
            className="bg-card shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "Sora, sans-serif" }}>
                Editar Pedido
              </h2>
              <button onClick={() => setEditingOrder(null)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg bg-white/3 p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Produto</p>
                <p className="text-sm font-medium text-foreground">{editingOrder.product}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(STATUS_LABELS) as [OrderStatus, string][]).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setEditStatus(value)}
                      className={cn(
                        "py-2 px-3 rounded-lg text-sm font-medium border transition-all",
                        editStatus === value
                          ? STATUS_COLORS[value]
                          : "text-muted-foreground border-border hover:border-border"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  <MessageSquare className="w-3 h-3 inline mr-1" />
                  Comentários
                </label>
                <textarea
                  value={editComment} onChange={(e) => setEditComment(e.target.value)}
                  rows={3} placeholder="Adicione um comentário..."
                  className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground placeholder-slate-600 text-sm outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="ghost" onClick={() => setEditingOrder(null)} className="flex-1 text-muted-foreground hover:text-foreground border border-border">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-foreground gap-2">
                <Save className="w-4 h-4" /> Salvar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
