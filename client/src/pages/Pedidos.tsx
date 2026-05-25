/**
 * Pedidos — Rushy Sistema de Gestão
 * Gestão de Pedidos: histórico completo com filtros, status e urgência
 * Acesso: Gerente (completo), Logística (completo), Estoque (completo)
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus, Search, Filter, Edit2, Trash2, Eye, X, ChevronDown, Save
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData, Order, OrderStatus, UrgencyLevel } from "@/contexts/DataContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pendente: "Pendente", em_andamento: "Em Andamento",
  concluido: "Concluído", cancelado: "Cancelado",
};
const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  critica: "Crítica", alta: "Alta", media: "Média", baixa: "Baixa",
};
const STATUS_COLORS: Record<OrderStatus, string> = {
  pendente: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-border",
  em_andamento: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-border",
  concluido: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-border",
  cancelado: "text-red-600 dark:text-red-400 bg-red-500/10 border-border",
};
const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  critica: "text-red-600 dark:text-red-400 bg-red-500/10 border-border",
  alta: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-border",
  media: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-border",
  baixa: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-border",
};

const UNITS = ["unidades", "caixas", "rolos", "metros", "kg", "litros", "bobinas", "folhas", "paletes"];

interface OrderFormData {
  product: string; quantity: number; unit: string;
  urgency: UrgencyLevel; status: OrderStatus; comments: string;
}

const emptyForm: OrderFormData = {
  product: "", quantity: 1, unit: "unidades",
  urgency: "media", status: "pendente", comments: "",
};

export default function Pedidos() {
  const { user } = useAuth();
  const { orders, addOrder, updateOrder, deleteOrder, createNotification } = useData();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "todos">("todos");
  const [filterUrgency, setFilterUrgency] = useState<UrgencyLevel | "todos">("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [form, setForm] = useState<OrderFormData>(emptyForm);

  const canEdit = user?.role === "logistica" || user?.role === "estoque" || user?.role === "gerente";
  const canDelete = user?.role === "gerente";
  const canCreate = user?.role === "logistica" || user?.role === "estoque";

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch = o.product.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "todos" || o.status === filterStatus;
      const matchUrgency = filterUrgency === "todos" || o.urgency === filterUrgency;
      return matchSearch && matchStatus && matchUrgency;
    });
  }, [orders, search, filterStatus, filterUrgency]);

  const openCreate = () => {
    setEditingOrder(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (order: Order) => {
    setEditingOrder(order);
    setForm({ product: order.product, quantity: order.quantity, unit: order.unit, urgency: order.urgency, status: order.status, comments: order.comments || "" });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.product.trim()) { toast.error("Informe o produto"); return; }
    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id, { ...form, date: editingOrder.date });
        toast.success("Pedido atualizado!");
        createNotification(
          "Pedido Atualizado",
          `O pedido de ${form.product} foi atualizado para o status ${STATUS_LABELS[form.status]}`,
          "info"
        );
      } else {
        await addOrder({ ...form, date: new Date().toISOString().split("T")[0], requestedBy: user?.name || "" });
        toast.success("Pedido criado!");
        createNotification(
          "Novo Pedido",
          `Pedido criado: ${form.quantity} ${form.unit} de ${form.product} (Urgencia: ${URGENCY_LABELS[form.urgency]})`,
          form.urgency === "critica" || form.urgency === "alta" ? "alerta" : "info"
        );
      }
      setModalOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar pedido");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const order = orders.find(o => o.id === id);
      await deleteOrder(id);
      toast.success("Pedido removido");
      if (order) {
        createNotification(
          "Pedido Cancelado",
          `O pedido de ${order.product} foi removido do sistema`,
          "alerta"
        );
      }
      setDeletingOrderId(null);
    } catch (error) {
      toast.error("Erro ao remover pedido");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Sora, sans-serif" }}>
              Gestão de Pedidos
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{filtered.length} pedidos encontrados</p>
          </div>
          {canCreate && (
            <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-500 text-foreground gap-2 shadow-lg shadow-emerald-500/20">
              <Plus className="w-4 h-4" /> Novo Pedido
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-accent/50 rounded-lg px-3 py-2 border border-border flex-1 min-w-48">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por produto ou ID..."
              className="bg-transparent text-sm text-foreground placeholder-slate-600 outline-none w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none"
          >
            <option value="todos">Todos os Status</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value as any)}
            className="bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none"
          >
            <option value="todos">Todas as Urgências</option>
            {Object.entries(URGENCY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        {/* Table/Cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-border p-12 text-center text-muted-foreground text-sm bg-card shadow-sm">
              Nenhum pedido encontrado
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden md:block rounded-xl border border-border overflow-hidden bg-card shadow-sm"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {["ID", "Data", "Produto", "Qtd / Unidade", "Urgência", "Status", "Solicitante", "Ações"].map((h) => (
                          <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
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
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-border hover:bg-accent/50 transition-colors group"
                        >
                          <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{order.id}</td>
                          <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{order.date}</td>
                          <td className="px-5 py-3.5 text-sm text-foreground font-medium">{order.product}</td>
                          <td className="px-5 py-3.5 text-sm text-foreground">{order.quantity} {order.unit}</td>
                          <td className="px-5 py-3.5">
                            <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", URGENCY_COLORS[order.urgency])}>
                              {URGENCY_LABELS[order.urgency]}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", STATUS_COLORS[order.status])}>
                              {STATUS_LABELS[order.status]}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-muted-foreground">{order.requestedBy}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setViewingOrder(order)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {canEdit && (
                                <button onClick={() => openEdit(order)} className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {canDelete && (
                                <button onClick={() => setDeletingOrderId(order.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Mobile Cards */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {filtered.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="rounded-xl border border-border p-4 bg-card shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{order.product}</p>
                        <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{order.id}</p>
                      </div>
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider", STATUS_COLORS[order.status])}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Quantidade</span>
                        <span className="text-foreground font-medium">{order.quantity} {order.unit}</span>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <span className="text-muted-foreground">Urgência</span>
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full font-medium border", URGENCY_COLORS[order.urgency])}>
                          {URGENCY_LABELS[order.urgency]}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{order.date}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setViewingOrder(order)} className="p-2 rounded-lg bg-accent/50 text-muted-foreground hover:text-foreground">
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <button onClick={() => openEdit(order)} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:text-emerald-300">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => setDeletingOrderId(order.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl"
            style={{ background: "#1C2333" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "Sora, sans-serif" }}>
                {editingOrder ? "Editar Pedido" : "Novo Pedido"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Produto</label>
                <input
                  value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}
                  placeholder="Nome do produto..."
                  className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground placeholder-slate-600 text-sm outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Quantidade</label>
                  <input
                    type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground text-sm outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Unidade</label>
                  <select
                    value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground text-sm outline-none focus:border-emerald-500/50"
                    style={{ background: "#1C2333" }}
                  >
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Urgência</label>
                  <select
                    value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value as UrgencyLevel })}
                    className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground text-sm outline-none focus:border-emerald-500/50"
                    style={{ background: "#1C2333" }}
                  >
                    {Object.entries(URGENCY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Status</label>
                  <select
                    value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as OrderStatus })}
                    className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground text-sm outline-none focus:border-emerald-500/50"
                    style={{ background: "#1C2333" }}
                  >
                    {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Comentários</label>
                <textarea
                  value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })}
                  rows={2} placeholder="Observações..."
                  className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground placeholder-slate-600 text-sm outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1 text-muted-foreground hover:text-foreground border border-border">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-foreground gap-2">
                <Save className="w-4 h-4" /> Salvar
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingOrderId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-2xl border border-border p-6 shadow-2xl"
            style={{ background: "#1C2333" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Apagar Pedido?</h2>
                <p className="text-sm text-muted-foreground mt-1">Esta ação não pode ser desfeita.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => handleDelete(deletingOrderId)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-foreground font-semibold"
              >
                Apagar
              </Button>
              <Button
                variant="ghost"
                onClick={() => setDeletingOrderId(null)}
                className="flex-1 border border-border text-foreground hover:text-foreground"
              >
                Cancelar
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl"
            style={{ background: "#1C2333" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "Sora, sans-serif" }}>
                Detalhes do Pedido
              </h2>
              <button onClick={() => setViewingOrder(null)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                ["ID", viewingOrder.id], ["Data", viewingOrder.date],
                ["Produto", viewingOrder.product],
                ["Quantidade", `${viewingOrder.quantity} ${viewingOrder.unit}`],
                ["Solicitante", viewingOrder.requestedBy],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
                  <span className="text-sm text-foreground">{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Urgência</span>
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", URGENCY_COLORS[viewingOrder.urgency])}>
                  {URGENCY_LABELS[viewingOrder.urgency]}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Status</span>
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", STATUS_COLORS[viewingOrder.status])}>
                  {STATUS_LABELS[viewingOrder.status]}
                </span>
              </div>
              {viewingOrder.comments && (
                <div className="py-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Comentários</span>
                  <p className="text-sm text-foreground">{viewingOrder.comments}</p>
                </div>
              )}
            </div>
            <Button onClick={() => setViewingOrder(null)} className="w-full mt-5 bg-accent/50 hover:bg-accent/5010 text-foreground border border-border">
              Fechar
            </Button>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
