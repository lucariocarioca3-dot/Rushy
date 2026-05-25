/**
 * Estoque — Rushy Sistema de Gestão
 * Controle de estoque com código de barras, categorias e solicitação de reposição
 * Acesso: Estoque (completo), Logística/Gerente (somente visualização)
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search, Plus, Edit2, X, Save, AlertTriangle, CheckCircle2,
  Package, Barcode, RefreshCw, Filter
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData, StockItem } from "@/contexts/DataContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Embalagens", "Materiais de Fixação", "Estruturas", "Identificação", "Segurança", "Organização", "Outros"];

interface StockFormData {
  barcode: string; name: string; category: string;
  quantity: number; minQuantity: number; unit: string; location: string;
}

const emptyForm: StockFormData = {
  barcode: "", name: "", category: "Embalagens",
  quantity: 0, minQuantity: 10, unit: "unidades", location: "",
};

export default function Estoque() {
  const { user } = useAuth();
  const { stockItems, addStockItem, updateStockItem, requestRestock } = useData();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("todos");
  const [filterRestock, setFilterRestock] = useState<"todos" | "reposicao" | "ok">("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [form, setForm] = useState<StockFormData>(emptyForm);
  const [barcodeInput, setBarcodeInput] = useState("");

  const canEdit = user?.role === "estoque";

  const filtered = useMemo(() => {
    return stockItems
      .filter((s) => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.barcode.includes(search) || s.category.toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCategory === "todos" || s.category === filterCategory;
        const matchRestock = filterRestock === "todos" ||
          (filterRestock === "reposicao" && s.needsRestock) ||
          (filterRestock === "ok" && !s.needsRestock);
        return matchSearch && matchCat && matchRestock;
      })
      .sort((a, b) => (b.needsRestock ? 1 : 0) - (a.needsRestock ? 1 : 0));
  }, [stockItems, search, filterCategory, filterRestock]);

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: StockItem) => {
    setEditingItem(item);
    setForm({ barcode: item.barcode, name: item.name, category: item.category, quantity: item.quantity, minQuantity: item.minQuantity, unit: item.unit, location: item.location });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Informe o nome do produto"); return; }
    if (!form.barcode.trim()) { toast.error("Informe o código de barras"); return; }
    
    const needsRestock = form.quantity <= form.minQuantity;
    const itemData = { 
      ...form, 
      needsRestock, 
      lastUpdated: new Date().toISOString().split("T")[0] 
    };

    try {
      if (editingItem) {
        await updateStockItem(editingItem.id, itemData);
        toast.success("Item atualizado!");
      } else {
        await addStockItem(itemData);
        toast.success("Item adicionado ao estoque!");
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar item:", error);
      toast.error("Erro ao salvar o item no estoque. Verifique o banco de dados.");
    }
  };

  const handleBarcodeSearch = () => {
    if (!barcodeInput.trim()) return;
    const found = stockItems.find((s) => s.barcode === barcodeInput.trim());
    if (found) {
      setSearch(found.name);
      toast.success(`Produto encontrado: ${found.name}`);
    } else {
      toast.error("Código de barras não encontrado");
    }
    setBarcodeInput("");
  };

  const handleRequestRestock = (id: string, name: string) => {
    requestRestock(id);
    toast.success(`Reposição solicitada para: ${name}`, { description: "Logística foi notificada" });
  };

  const stockStats = useMemo(() => ({
    total: stockItems.length,
    needsRestock: stockItems.filter((s) => s.needsRestock).length,
    ok: stockItems.filter((s) => !s.needsRestock).length,
    categories: Array.from(new Set(stockItems.map((s) => s.category))).length,
  }), [stockItems]);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Sora, sans-serif" }}>
              Estoque
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {filtered.length} itens • {stockStats.needsRestock} precisam de reposição
            </p>
          </div>
          {canEdit && (
            <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-500 text-foreground gap-2 shadow-lg shadow-emerald-500/20">
              <Plus className="w-4 h-4" /> Novo Item
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total de Itens", value: stockStats.total, icon: Package, color: "text-foreground", bg: "bg-accent/50" },
            { label: "Estoque Normal", value: stockStats.ok, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Precisam Reposição", value: stockStats.needsRestock, icon: AlertTriangle, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
            { label: "Categorias", value: stockStats.categories, icon: Filter, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
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

        {/* Barcode scanner (only for estoque) */}
        {canEdit && (
          <div className="rounded-xl border border-border p-4 flex items-center gap-3 bg-card shadow-sm">
            <Barcode className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <input
              type="text" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBarcodeSearch()}
              placeholder="Escaneie ou digite o código de barras e pressione Enter..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder-slate-600 outline-none"
            />
            <Button onClick={handleBarcodeSearch} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-foreground">
              Buscar
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-accent/50 rounded-lg px-3 py-2 border border-border flex-1 min-w-48">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto, código ou categoria..."
              className="bg-transparent text-sm text-foreground placeholder-slate-600 outline-none w-full"
            />
          </div>
          <select
            value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none"
          >
            <option value="todos">Todas as Categorias</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterRestock} onChange={(e) => setFilterRestock(e.target.value as any)}
            className="bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none"
          >
            <option value="todos">Todos</option>
            <option value="reposicao">Precisam Reposição</option>
            <option value="ok">Estoque Normal</option>
          </select>
        </div>

        {/* Stock grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
              Nenhum item encontrado
            </div>
          ) : filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "rounded-xl border p-4 relative bg-card shadow-sm",
                item.needsRestock ? "border-red-500/20" : "border-border"
              )}
            >
              {item.needsRestock && (
                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-border px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3" /> Reposição
                  </span>
                </div>
              )}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0 pr-16">
                  <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-lg bg-white/3 p-2">
                  <p className="text-xs text-muted-foreground">Quantidade</p>
                  <p className={cn("text-lg font-bold", item.needsRestock ? "text-red-600 dark:text-red-400" : "text-foreground")} style={{ fontFamily: "Sora, sans-serif" }}>
                    {item.quantity}
                  </p>
                  <p className="text-xs text-slate-600">{item.unit}</p>
                </div>
                <div className="rounded-lg bg-white/3 p-2">
                  <p className="text-xs text-muted-foreground">Mínimo</p>
                  <p className="text-lg font-bold text-foreground" style={{ fontFamily: "Sora, sans-serif" }}>{item.minQuantity}</p>
                  <p className="text-xs text-slate-600">{item.unit}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="h-1.5 bg-accent/50 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", item.needsRestock ? "bg-red-500" : "bg-emerald-500")}
                    style={{ width: `${Math.min(100, (item.quantity / Math.max(item.minQuantity * 2, 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
                <span className="font-mono">{item.barcode}</span>
                <span>{item.location}</span>
              </div>

              <div className="flex gap-2">
                {canEdit && (
                  <button onClick={() => openEdit(item)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border border-border transition-colors">
                    <Edit2 className="w-3 h-3" /> Editar
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={() => handleRequestRestock(item.id, item.name)}
                    disabled={item.needsRestock}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs border transition-colors",
                      item.needsRestock
                        ? "text-red-600 dark:text-red-400/50 border-red-500/10 cursor-not-allowed"
                        : "text-muted-foreground hover:text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10 border-border"
                    )}
                  >
                    <RefreshCw className="w-3 h-3" />
                    {item.needsRestock ? "Solicitado" : "Solicitar"}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl bg-card"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "Sora, sans-serif" }}>
                {editingItem ? "Editar Item" : "Novo Item no Estoque"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Código de Barras</label>
                <input
                  value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  placeholder="7891234567890"
                  maxLength={30}
                  className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground placeholder-slate-600 text-sm outline-none focus:border-emerald-500/50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Nome do Produto</label>
                <input
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nome do produto..."
                  className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground placeholder-slate-600 text-sm outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Categoria</label>
                  <select
                    value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground text-sm outline-none focus:border-emerald-500/50 bg-card shadow-sm"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Unidade</label>
                  <input
                    value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="unidades"
                    className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground placeholder-slate-600 text-sm outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Quantidade Atual</label>
                  <input
                    type="number" min={0} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground text-sm outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Qtd Mínima</label>
                  <input
                    type="number" min={0} value={form.minQuantity} onChange={(e) => setForm({ ...form, minQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground text-sm outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Localização</label>
                <input
                  value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Ex: Prateleira A1"
                  className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground placeholder-slate-600 text-sm outline-none focus:border-emerald-500/50"
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
    </DashboardLayout>
  );
}
