/**
 * Fornecedores — Rushy Sistema de Gestão
 * Cadastro e gestão de fornecedores
 * Acesso: Gerente (completo), Logística (adicionar + editar)
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, X, Save, Truck, CheckCircle2, XCircle, Phone, Mail, Building2 } from "lucide-react";
import { useData, Supplier } from "@/contexts/DataContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Embalagens", "Estruturas", "Segurança", "Identificação", "Organização", "Transporte", "Outros"];

// Funções de formatação
const formatCNPJ = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
  if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
  if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
};

const formatPhone = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 2) return cleaned.length > 0 ? `(${cleaned}` : cleaned;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

interface SupplierForm {
  name: string; cnpj: string; email: string;
  phone: string; category: string; status: "ativo" | "inativo";
}

const emptyForm: SupplierForm = {
  name: "", cnpj: "", email: "", phone: "",
  category: "Embalagens", status: "ativo",
};

export default function Fornecedores() {
  const { suppliers, addSupplier, updateSupplier } = useData();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierForm>(emptyForm);

  const filtered = useMemo(() =>
    suppliers.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.cnpj.includes(search)
    ), [suppliers, search]);

  const openCreate = () => {
    setEditingSupplier(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setForm({ name: supplier.name, cnpj: supplier.cnpj, email: supplier.email, phone: supplier.phone, category: supplier.category, status: supplier.status });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Informe o nome do fornecedor"); return; }

    // Verificar duplicidade de Nome ou CNPJ
    const isDuplicateName = suppliers.some(
      (s) => s.name.toLowerCase() === form.name.toLowerCase() && s.id !== editingSupplier?.id
    );
    const isDuplicateCnpj = suppliers.some(
      (s) => s.cnpj.replace(/\D/g, "") === form.cnpj.replace(/\D/g, "") && s.id !== editingSupplier?.id && form.cnpj.trim() !== ""
    );

    if (isDuplicateName) {
      toast.error("Já existe um fornecedor cadastrado com este nome");
      return;
    }
    if (isDuplicateCnpj) {
      toast.error("Já existe um fornecedor cadastrado com este CNPJ");
      return;
    }

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, form);
      toast.success("Fornecedor atualizado!");
    } else {
      addSupplier(form);
      toast.success("Fornecedor cadastrado!");
    }
    setModalOpen(false);
  };

  const activeCount = suppliers.filter((s) => s.status === "ativo").length;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Sora, sans-serif" }}>
              Fornecedores
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {activeCount} ativos de {suppliers.length} cadastrados
            </p>
          </div>
          <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-500 text-foreground gap-2 shadow-lg shadow-emerald-500/20">
            <Plus className="w-4 h-4" /> Novo Fornecedor
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-accent/50 rounded-lg px-3 py-2 border border-border max-w-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, categoria ou CNPJ..."
            className="bg-transparent text-sm text-foreground placeholder-slate-600 outline-none w-full"
          />
        </div>

        {/* Suppliers grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
              Nenhum fornecedor encontrado
            </div>
          ) : filtered.map((supplier, i) => (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border p-5 group bg-card shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{supplier.name}</p>
                    <span className="text-xs text-muted-foreground bg-accent/50 px-2 py-0.5 rounded-full mt-0.5 inline-block">
                      {supplier.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {supplier.status === "ativo" ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-border px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Ativo
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-border px-2 py-0.5 rounded-full">
                      <XCircle className="w-3 h-3" /> Inativo
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-mono">{supplier.cnpj}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{supplier.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{supplier.phone}</span>
                </div>
              </div>

              <button
                onClick={() => openEdit(supplier)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-muted-foreground hover:text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border border-border transition-colors"
              >
                <Edit2 className="w-3 h-3" /> Editar
              </button>
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
            className="w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl"
            className="bg-card shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "Sora, sans-serif" }}>
                {editingSupplier ? "Editar Fornecedor" : "Novo Fornecedor"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Nome</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nome do fornecedor"
                  className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground placeholder-slate-600 text-sm outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">CNPJ</label>
                <input
                  value={form.cnpj}
                  onChange={(e) => setForm({ ...form, cnpj: formatCNPJ(e.target.value) })}
                  placeholder="00.000.000/0001-00"
                  maxLength={18}
                  className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground placeholder-slate-600 text-sm outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">E-mail</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contato@fornecedor.com"
                  className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground placeholder-slate-600 text-sm outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Telefone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground placeholder-slate-600 text-sm outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Categoria</label>
                  <select
                    value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground text-sm outline-none focus:border-emerald-500/50"
                    className="bg-card shadow-sm"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Status</label>
                  <select
                    value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-lg bg-accent/50 border border-border text-foreground text-sm outline-none focus:border-emerald-500/50"
                    className="bg-card shadow-sm"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
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
