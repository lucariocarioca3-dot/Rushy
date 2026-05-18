/**
 * Formulários — Rushy Sistema de Gestão
 * Reformulado: Construtor de formulários com categorias e campos dinâmicos
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Eye, Edit2, X, Save, FileText, Calendar,
  User, ChevronRight, Trash2, Layout, Type, List, CheckSquare, 
  Hash, GripVertical, Settings2, FolderPlus, ArrowLeft
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData, FormTemplate } from "@/contexts/DataContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FieldType = "text" | "number" | "select" | "checkbox" | "textarea";

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  options?: string[]; // Para selects
  width: "full" | "half" | "third";
}

interface FormCategory {
  id: string;
  title: string;
  fields: FormField[];
}

interface FormSchema {
  categories: FormCategory[];
}

export default function Formularios() {
  const { user } = useAuth();
  const { forms, addForm, updateForm, deleteForm } = useData();
  const [search, setSearch] = useState("");
  const [viewingForm, setViewingForm] = useState<FormTemplate | null>(null);
  const [builderForm, setBuilderForm] = useState<FormTemplate | null>(null);
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);

  // Builder State
  const [formTitle, setFormTitle] = useState("");
  const [schema, setSchema] = useState<FormSchema>({
    categories: [
      {
        id: "cat-1",
        title: "Informações Gerais",
        fields: []
      }
    ]
  });

  const canEdit = user?.role === "gerente" || user?.role === "logistica" || user?.role === "estoque";

  const filtered = useMemo(() =>
    forms.filter((f) =>
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.createdBy.toLowerCase().includes(search.toLowerCase())
    ), [forms, search]);

  const startNewForm = () => {
    setFormTitle("Novo Formulário");
    setSchema({
      categories: [{ id: Math.random().toString(36).substr(2, 9), title: "Informações Gerais", fields: [] }]
    });
    setBuilderForm({
      id: "new",
      title: "Novo Formulário",
      createdBy: user?.name || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rows: 0,
      columns: 0,
      data: { categories: [] }
    });
  };

  const openEdit = (form: FormTemplate) => {
    setBuilderForm(form);
    setFormTitle(form.title);
    // Garantir que o schema esteja no formato correto
    const loadedSchema = (typeof form.data === 'string' ? JSON.parse(form.data) : form.data) as FormSchema;
    setSchema(loadedSchema.categories ? loadedSchema : { categories: [] });
  };

  const addCategory = () => {
    setSchema({
      ...schema,
      categories: [
        ...schema.categories,
        { id: Math.random().toString(36).substr(2, 9), title: "Nova Categoria", fields: [] }
      ]
    });
  };

  const removeCategory = (catId: string) => {
    if (schema.categories.length <= 1) {
      toast.error("Você precisa ter pelo menos uma categoria");
      return;
    }
    setSchema({
      ...schema,
      categories: schema.categories.filter(c => c.id !== catId)
    });
  };

  const updateCategoryTitle = (catId: string, title: string) => {
    setSchema({
      ...schema,
      categories: schema.categories.map(c => c.id === catId ? { ...c, title } : c)
    });
  };

  const addField = (catId: string) => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      label: "Novo Campo",
      type: "text",
      placeholder: "",
      required: false,
      width: "full"
    };
    setSchema({
      ...schema,
      categories: schema.categories.map(c => 
        c.id === catId ? { ...c, fields: [...c.fields, newField] } : c
      )
    });
  };

  const updateField = (catId: string, fieldId: string, updates: Partial<FormField>) => {
    setSchema({
      ...schema,
      categories: schema.categories.map(c => 
        c.id === catId ? {
          ...c,
          fields: c.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
        } : c
      )
    });
  };

  const removeField = (catId: string, fieldId: string) => {
    setSchema({
      ...schema,
      categories: schema.categories.map(c => 
        c.id === catId ? { ...c, fields: c.fields.filter(f => f.id !== fieldId) } : c
      )
    });
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      toast.error("O formulário precisa de um título");
      return;
    }

    const formData = {
      title: formTitle,
      data: schema,
      updatedAt: new Date().toISOString().split("T")[0],
      rows: schema.categories.length,
      columns: schema.categories.reduce((acc, cat) => acc + cat.fields.length, 0),
    };

    try {
      if (builderForm?.id === "new") {
        await addForm({
          ...formData,
          createdBy: user?.name || "",
          createdAt: new Date().toISOString().split("T")[0],
        });
        toast.success("Formulário criado com sucesso!");
      } else if (builderForm) {
        await updateForm(builderForm.id, formData);
        toast.success("Formulário atualizado com sucesso!");
      }
      setBuilderForm(null);
    } catch (error) {
      toast.error("Erro ao salvar formulário");
    }
  };

  const handleDeleteForm = async (id: string) => {
    try {
      await deleteForm(id);
      toast.success("Formulário removido");
      setDeletingFormId(null);
    } catch (error) {
      toast.error("Erro ao remover");
    }
  };

  if (builderForm) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
          {/* Builder Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setBuilderForm(null)}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <input 
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="bg-transparent text-2xl font-bold text-white outline-none border-b border-transparent focus:border-emerald-500/50 px-1"
                  placeholder="Título do Formulário"
                />
                <p className="text-slate-500 text-xs mt-1">Modo de Edição • Rushy Builder</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setBuilderForm(null)} className="border-white/10 text-slate-300">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
                <Save className="w-4 h-4" /> Salvar Formulário
              </Button>
            </div>
          </div>

          <Separator className="bg-white/5" />

          {/* Builder Body */}
          <div className="space-y-8 pb-20">
            <AnimatePresence>
              {schema.categories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl border border-white/5 bg-[#161B27]/40 overflow-hidden"
                >
                  {/* Category Header */}
                  <div className="p-4 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Layout className="w-4 h-4 text-emerald-500" />
                      <input 
                        type="text"
                        value={category.title}
                        onChange={(e) => updateCategoryTitle(category.id, e.target.value)}
                        className="bg-transparent font-semibold text-white outline-none border-b border-transparent focus:border-emerald-500/50 w-full max-w-md"
                        placeholder="Nome da Categoria"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => addField(category.id)}
                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar Campo
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeCategory(category.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Category Fields */}
                  <div className="p-6">
                    {category.fields.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-xl">
                        <p className="text-slate-500 text-sm">Nenhum campo nesta categoria</p>
                        <Button 
                          variant="link" 
                          onClick={() => addField(category.id)}
                          className="text-emerald-500 text-xs mt-2"
                        >
                          Clique para adicionar o primeiro campo
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-6 gap-6">
                        {category.fields.map((field) => (
                          <div 
                            key={field.id}
                            className={cn(
                              "relative group p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-emerald-500/30 transition-all",
                              field.width === "full" ? "col-span-6" : field.width === "half" ? "col-span-3" : "col-span-2"
                            )}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 space-y-3">
                                <div>
                                  <Label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">Label do Campo</Label>
                                  <Input 
                                    value={field.label}
                                    onChange={(e) => updateField(category.id, field.id, { label: e.target.value })}
                                    className="h-8 bg-transparent border-white/10 text-sm"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">Tipo</Label>
                                    <select 
                                      value={field.type}
                                      onChange={(e) => updateField(category.id, field.id, { type: e.target.value as FieldType })}
                                      className="w-full h-8 bg-slate-900 border border-white/10 rounded-md text-xs text-white outline-none px-2"
                                    >
                                      <option value="text">Texto</option>
                                      <option value="number">Número</option>
                                      <option value="textarea">Área de Texto</option>
                                      <option value="select">Seleção (Dropdown)</option>
                                      <option value="checkbox">Checkmark</option>
                                    </select>
                                  </div>
                                  <div>
                                    <Label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">Largura</Label>
                                    <select 
                                      value={field.width}
                                      onChange={(e) => updateField(category.id, field.id, { width: e.target.value as any })}
                                      className="w-full h-8 bg-slate-900 border border-white/10 rounded-md text-xs text-white outline-none px-2"
                                    >
                                      <option value="full">Inteira (100%)</option>
                                      <option value="half">Metade (50%)</option>
                                      <option value="third">Um Terço (33%)</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">Placeholder</Label>
                                    <Input 
                                      value={field.placeholder || ""}
                                      onChange={(e) => updateField(category.id, field.id, { placeholder: e.target.value })}
                                      className="h-8 bg-transparent border-white/10 text-sm"
                                      placeholder="Ex: Digite aqui..."
                                    />
                                  </div>
                                  <div className="flex items-end">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input 
                                        type="checkbox"
                                        checked={field.required}
                                        onChange={(e) => updateField(category.id, field.id, { required: e.target.checked })}
                                        className="w-4 h-4 rounded border-white/10 bg-white/5 text-emerald-500"
                                      />
                                      <span className="text-xs text-slate-400">Obrigatório</span>
                                    </label>
                                  </div>
                                </div>
                                {field.type === "select" && (
                                  <div>
                                    <Label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">Opções (separadas por vírgula)</Label>
                                    <Input 
                                      value={field.options?.join(", ") || ""}
                                      onChange={(e) => updateField(category.id, field.id, { options: e.target.value.split(",").map(o => o.trim()).filter(o => o) })}
                                      className="h-8 bg-transparent border-white/10 text-sm"
                                      placeholder="Opção 1, Opção 2, Opção 3"
                                    />
                                  </div>
                                )}
                              </div>
                              <button 
                                onClick={() => removeField(category.id, field.id)}
                                className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Button 
              onClick={addCategory}
              className="w-full py-8 border-2 border-dashed border-white/5 bg-transparent hover:bg-white/5 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 transition-all gap-2"
            >
              <FolderPlus className="w-5 h-5" /> Adicionar Nova Categoria
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>
              Formulários
            </h1>
            <p className="text-slate-500 text-sm mt-1">{forms.length} formulários personalizados</p>
          </div>
          {canEdit && (
            <Button onClick={startNewForm} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-lg shadow-emerald-500/20">
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
          ) : filtered.map((form, i) => {
            const schema = (typeof form.data === 'string' ? JSON.parse(form.data) : form.data) as FormSchema;
            const fieldCount = schema.categories?.reduce((acc, c) => acc + (c.fields?.length || 0), 0) || 0;

            return (
              <motion.div
                key={form.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-white/5 p-5 group hover:border-emerald-500/30 transition-all"
                style={{ background: "#1C2333" }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{form.title}</p>
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
                    <span>{form.updatedAt}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Layout className="w-3.5 h-3.5" />
                    <span>{schema.categories?.length || 0} Categorias • {fieldCount} Campos</span>
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
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* View Modal */}
      {viewingForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#161B27] rounded-2xl border border-white/10 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">{viewingForm.title}</h2>
                <p className="text-slate-500 text-sm mt-1">Preencha as informações abaixo</p>
              </div>
              <button onClick={() => setViewingForm(null)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-10">
              {((typeof viewingForm.data === 'string' ? JSON.parse(viewingForm.data) : viewingForm.data) as FormSchema).categories?.map((cat) => (
                <div key={cat.id} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-emerald-400">{cat.title}</h3>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  <div className="grid grid-cols-6 gap-6">
                    {cat.fields?.map((field) => (
                      <div 
                        key={field.id}
                        className={cn(
                          field.width === "full" ? "col-span-6" : field.width === "half" ? "col-span-3" : "col-span-2"
                        )}
                      >
                        <Label className="text-xs font-medium text-slate-400 mb-2 block uppercase tracking-wider">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        {field.type === "textarea" ? (
                          <textarea 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-emerald-500/50 min-h-[100px]"
                            placeholder={field.placeholder}
                          />
                        ) : field.type === "select" ? (
                          <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-emerald-500/50">
                            <option value="">Selecione...</option>
                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : field.type === "checkbox" ? (
                          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                            <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 text-emerald-500" />
                            <span className="text-slate-300 text-sm">Confirmar {field.label}</span>
                          </div>
                        ) : (
                          <Input 
                            type={field.type}
                            className="bg-white/5 border-white/10 rounded-xl h-12 text-white"
                            placeholder={field.placeholder}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setViewingForm(null)} className="border-white/10 text-slate-300 px-8">
                Fechar
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8">
                Enviar Formulário
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingFormId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#161B27] rounded-2xl border border-white/10 p-6 max-w-sm w-full shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Remover?</h2>
                <p className="text-slate-500 text-sm">Esta ação é permanente.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeletingFormId(null)} className="flex-1 border-white/10 text-slate-300">
                Cancelar
              </Button>
              <Button onClick={() => handleDeleteForm(deletingFormId)} className="flex-1 bg-red-600 hover:bg-red-500 text-white">
                Remover
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
