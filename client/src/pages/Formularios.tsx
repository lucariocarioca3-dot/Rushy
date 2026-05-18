/**
 * Formulários — Rushy Sistema de Gestão
 * Criação, edição e visualização de formulários personalizados
 * Com templates pré-prontos e opção de criar personalizado
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus, Search, Eye, Edit2, X, Save, FileText, Calendar,
  User, Grid3x3, ChevronRight, Trash2, Copy, Bookmark
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData, FormTemplate } from "@/contexts/DataContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Templates pré-prontos
const TEMPLATES = [
  {
    id: "pedido",
    name: "Modelo de Pedido",
    description: "Tabela para registro de pedidos com cliente, produto e valor",
    rows: 4,
    cols: 5,
    data: [
      ["Cliente", "Produto", "Quantidade", "Valor Unitário", "Total"],
      ["", "", "", "", ""],
      ["", "", "", "", ""],
      ["", "", "", "", ""],
    ],
  },
  {
    id: "estoque",
    name: "Modelo de Estoque",
    description: "Tabela para controle de itens em estoque",
    rows: 4,
    cols: 6,
    data: [
      ["SKU", "Produto", "Quantidade", "Mínimo", "Localização", "Última Atualização"],
      ["", "", "", "", "", ""],
      ["", "", "", "", "", ""],
      ["", "", "", "", "", ""],
    ],
  },
  {
    id: "fornecedor",
    name: "Modelo de Fornecedor",
    description: "Tabela para gerenciar fornecedores e contatos",
    rows: 4,
    cols: 5,
    data: [
      ["Empresa", "Contato", "Email", "Telefone", "Categoria"],
      ["", "", "", "", ""],
      ["", "", "", "", ""],
      ["", "", "", "", ""],
    ],
  },
  {
    id: "relatorio",
    name: "Modelo de Relatório",
    description: "Tabela para registro de relatórios e observações",
    rows: 4,
    cols: 4,
    data: [
      ["Data", "Responsável", "Descrição", "Status"],
      ["", "", "", ""],
      ["", "", "", ""],
      ["", "", "", ""],
    ],
  },
];

export default function Formularios() {
  const { user } = useAuth();
  const { forms, addForm, updateForm, deleteForm } = useData();
  const [search, setSearch] = useState("");
  const [viewingForm, setViewingForm] = useState<FormTemplate | null>(null);
  const [editingForm, setEditingForm] = useState<FormTemplate | null>(null);
  const [createMode, setCreateMode] = useState<"choice" | "template" | "custom" | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newRows, setNewRows] = useState(3);
  const [newCols, setNewCols] = useState(3);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  // Edit state
  const [editData, setEditData] = useState<string[][]>([]);
  const [editTitle, setEditTitle] = useState("");
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);

  const canEdit = user?.role === "logistica" || user?.role === "estoque";

  const filtered = useMemo(() =>
    forms.filter((f) =>
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.createdBy.toLowerCase().includes(search.toLowerCase())
    ), [forms, search]);

  const openCreateChoice = () => {
    setCreateMode("choice");
    setNewTitle("");
    setNewRows(3);
    setNewCols(3);
    setSaveAsTemplate(false);
  };

  const handleCreateFromTemplate = (template: typeof TEMPLATES[0]) => {
    setSelectedTemplate(template.id);
    setNewTitle(`${template.name} - ${new Date().toLocaleDateString()}`);
    setNewRows(template.rows);
    setNewCols(template.cols);
    setCreateMode("template");
  };

  const handleCreateCustom = () => {
    setCreateMode("custom");
    setNewTitle("");
    setNewRows(3);
    setNewCols(3);
  };

  const handleCreate = () => {
    if (!newTitle.trim()) { toast.error("Informe o título do formulário"); return; }
    
    let data: string[][];
    if (createMode === "template" && selectedTemplate) {
      const template = TEMPLATES.find(t => t.id === selectedTemplate);
      data = template ? template.data.map(row => [...row]) : 
        Array.from({ length: newRows }, (_, r) =>
          Array.from({ length: newCols }, (_, c) => r === 0 ? `Coluna ${c + 1}` : "")
        );
    } else {
      data = Array.from({ length: newRows }, (_, r) =>
        Array.from({ length: newCols }, (_, c) => r === 0 ? `Coluna ${c + 1}` : "")
      );
    }

    addForm({
      title: newTitle,
      createdBy: user?.name || "",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      rows: data.length,
      columns: data[0]?.length || 0,
      data,
      isTemplate: saveAsTemplate,
    });
    
    toast.success(saveAsTemplate ? "Modelo salvo!" : "Formulário criado!");
    setCreateMode(null);
    setSelectedTemplate(null);
  };

  const openEdit = (form: FormTemplate) => {
    setEditingForm(form);
    setEditTitle(form.title);
    setEditData(form.data.map((row) => [...row]));
  };

  const handleSaveEdit = async () => {
    if (!editingForm) return;
    try {
      await updateForm(editingForm.id, {
        title: editTitle,
        data: editData,
        rows: editData.length,
        columns: editData[0]?.length || 0,
        updatedAt: new Date().toISOString().split("T")[0],
      });
      toast.success("Formulário salvo!");
      setEditingForm(null);
    } catch (error) {
      toast.error("Erro ao salvar alterações");
    }
  };

  const addRow = () => {
    if (!editData.length) return;
    setEditData([...editData, Array(editData[0].length).fill("")]);
  };

  const addColumn = () => {
    setEditData(editData.map((row) => [...row, ""]));
  };

  const removeRow = (rowIndex: number) => {
    if (editData.length <= 1) return;
    setEditData(editData.filter((_, i) => i !== rowIndex));
  };

  const removeColumn = (colIndex: number) => {
    if (!editData.length || editData[0].length <= 1) return;
    setEditData(editData.map((row) => row.filter((_, ci) => ci !== colIndex)));
  };

  const updateCell = (row: number, col: number, value: string) => {
    const newData = editData.map((r, ri) =>
      ri === row ? r.map((c, ci) => (ci === col ? value : c)) : r
    );
    setEditData(newData);
  };

  const handleDeleteForm = async (id: string) => {
    try {
      await deleteForm(id);
      toast.success("Formulário apagado com sucesso!");
      setDeletingFormId(null);
    } catch (error) {
      toast.error("Erro ao apagar formulário");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>
              Formulários
            </h1>
            <p className="text-slate-500 text-sm mt-1">{forms.length} formulários salvos</p>
          </div>
          {canEdit && (
            <Button onClick={openCreateChoice} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-lg shadow-emerald-500/20">
              <Plus className="w-4 h-4" /> Novo Formulário
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/5 max-w-md">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar formulários..."
            className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-full"
          />
        </div>

        {/* Forms grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500 text-sm">
              Nenhum formulário encontrado
            </div>
          ) : filtered.map((form, i) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/5 p-5 group"
              style={{ background: "#1C2333" }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  {form.isTemplate ? (
                    <Bookmark className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <FileText className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{form.title}</p>
                  {form.isTemplate && <p className="text-xs text-emerald-400 mt-0.5">📌 Modelo</p>}
                  <p className="text-xs text-slate-500 mt-0.5">{form.id}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="w-3.5 h-3.5" />
                  <span>{form.createdBy}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Criado em {form.createdAt}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Grid3x3 className="w-3.5 h-3.5" />
                  <span>{form.rows} linhas × {form.columns} colunas</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewingForm(form)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/5 transition-colors"
                >
                  <Eye className="w-3 h-3" /> Visualizar
                </button>
                {canEdit && (
                  <>
                    <button
                      onClick={() => openEdit(form)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-white/5 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" /> Editar
                    </button>
                    <button
                      onClick={() => setDeletingFormId(form.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/5 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Apagar
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create Choice Modal */}
      {createMode === "choice" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-xl border border-white/10 p-6 max-w-md w-full space-y-4"
          >
            <h2 className="text-lg font-bold text-white">Novo Formulário</h2>
            <p className="text-sm text-slate-400">Escolha como deseja criar:</p>

            <div className="space-y-3">
              <button
                onClick={() => setCreateMode("template")}
                className="w-full p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-left transition-colors"
              >
                <p className="font-semibold text-white flex items-center gap-2">
                  <Copy className="w-4 h-4" /> Usar Tabela Pré-Pronta
                </p>
                <p className="text-xs text-slate-400 mt-1">Selecione um modelo pronto para usar</p>
              </button>

              <button
                onClick={handleCreateCustom}
                className="w-full p-4 rounded-lg border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-left transition-colors"
              >
                <p className="font-semibold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Criar Personalizado
                </p>
                <p className="text-xs text-slate-400 mt-1">Crie uma tabela do zero com suas colunas</p>
              </button>
            </div>

            <button
              onClick={() => setCreateMode(null)}
              className="w-full py-2 text-slate-400 hover:text-slate-300 text-sm"
            >
              Cancelar
            </button>
          </motion.div>
        </div>
      )}

      {/* Template Selection Modal */}
      {createMode === "template" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-xl border border-white/10 p-6 max-w-2xl w-full space-y-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Selecione um Modelo</h2>
              <button onClick={() => setCreateMode(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleCreateFromTemplate(template)}
                  className="p-4 rounded-lg border border-white/10 hover:border-emerald-500/50 bg-white/5 hover:bg-emerald-500/10 text-left transition-all"
                >
                  <p className="font-semibold text-white">{template.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{template.description}</p>
                  <p className="text-xs text-slate-500 mt-2">{template.rows}x{template.cols}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(createMode === "custom" || createMode === "template") && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-xl border border-white/10 p-6 max-w-4xl w-full space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {createMode === "custom" ? "Criar Formulário Personalizado" : "Criar do Modelo"}
              </h2>
              <button onClick={() => setCreateMode(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Título</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Nome do formulário"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-600 outline-none focus:border-emerald-500/50"
                />
              </div>

              {createMode === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Linhas</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={newRows}
                      onChange={(e) => setNewRows(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Colunas</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={newCols}
                      onChange={(e) => setNewCols(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAsTemplate}
                  onChange={(e) => setSaveAsTemplate(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-white/5"
                />
                <span className="text-sm text-slate-300">Salvar como modelo para reutilizar</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
              >
                Criar Formulário
              </button>
              <button
                onClick={() => setCreateMode(null)}
                className="flex-1 py-2 rounded-lg border border-white/10 text-slate-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Modal */}
      {viewingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-xl border border-white/10 p-6 max-w-4xl w-full space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{viewingForm.title}</h2>
              <button onClick={() => setViewingForm(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {viewingForm.data.map((row, ri) => (
                    <tr key={ri} className={ri === 0 ? "bg-emerald-500/10" : ""}>
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className={cn(
                            "px-4 py-2 border border-white/5",
                            ri === 0 ? "font-semibold text-emerald-400" : "text-slate-300"
                          )}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setViewingForm(null)}
              className="w-full py-2 rounded-lg border border-white/10 text-slate-300 hover:text-white transition-colors"
            >
              Fechar
            </button>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {editingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-xl border border-white/10 p-6 max-w-5xl w-full space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Título</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-emerald-500/50 w-full max-w-xs"
                />
              </div>
              <button onClick={() => setEditingForm(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {editData[0]?.map((_, ci) => (
                      <th key={ci} className="border border-white/5 p-1 bg-white/5">
                        {editData[0].length > 1 && (
                          <button
                            onClick={() => removeColumn(ci)}
                            className="p-1 text-red-400 hover:bg-red-500/10 rounded w-full"
                            title="Deletar coluna"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </th>
                    ))}
                    <th className="border border-white/5 p-1 bg-white/5"></th>
                  </tr>
                </thead>
                <tbody>
                  {editData.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="border border-white/5 p-1">
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => updateCell(ri, ci, e.target.value)}
                            className="w-full px-2 py-1 bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-emerald-500/50 rounded"
                            placeholder={ri === 0 ? `Coluna ${ci + 1}` : ""}
                          />
                        </td>
                      ))}
                      <td className="border border-white/5 p-1">
                        {editData.length > 1 && (
                          <button
                            onClick={() => removeRow(ri)}
                            className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                            title="Deletar linha"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2">
              <button
                onClick={addRow}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors"
              >
                + Linha
              </button>
              <button
                onClick={addColumn}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors"
              >
                + Coluna
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Salvar
              </button>
              <button
                onClick={() => setEditingForm(null)}
                className="flex-1 py-2 rounded-lg border border-white/10 text-slate-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deletingFormId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-xl border border-white/10 p-6 max-w-sm w-full space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Apagar Formulário?</h2>
                <p className="text-sm text-slate-400 mt-1">Esta ação não pode ser desfeita.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteForm(deletingFormId)}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
              >
                Apagar
              </button>
              <button
                onClick={() => setDeletingFormId(null)}
                className="flex-1 py-2 rounded-lg border border-white/10 text-slate-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
