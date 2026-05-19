/**
 * Formulários — Rushy Sistema de Gestão
 * Reformulado: Construtor de formulários com categorias e campos dinâmicos
 * Com suporte a duplicação de formulários existentes
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Plus, Search, Eye, Edit2, X, Save, FileText, Calendar,
  User, ChevronRight, Trash2, Layout, Type, List, CheckSquare, 
  Hash, GripVertical, Settings2, FolderPlus, ArrowLeft, Copy, Download
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData, FormTemplate, FormResponse } from "@/contexts/DataContext";
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
  const { forms, addForm, updateForm, deleteForm, saveFormResponse } = useData();
  const [search, setSearch] = useState("");
  const [viewingForm, setViewingForm] = useState<FormTemplate | null>(null);
  const [builderForm, setBuilderForm] = useState<FormTemplate | null>(null);
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
  const [creationMode, setCreationMode] = useState<"choice" | null>(null);
  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});

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
    setCreationMode(null);
  };

  const duplicateForm = (formToDuplicate: FormTemplate) => {
    const loadedSchema = (typeof formToDuplicate.data === 'string' ? JSON.parse(formToDuplicate.data) : formToDuplicate.data) as FormSchema;
    
    // Criar cópia profunda do schema com novos IDs
    const duplicatedSchema: FormSchema = {
      categories: loadedSchema.categories.map(cat => ({
        id: Math.random().toString(36).substr(2, 9),
        title: cat.title,
        fields: cat.fields.map(field => ({
          ...field,
          id: Math.random().toString(36).substr(2, 9)
        }))
      }))
    };

    setFormTitle(`${formToDuplicate.title} (Cópia)`);
    setSchema(duplicatedSchema);
    setBuilderForm({
      id: "new",
      title: `${formToDuplicate.title} (Cópia)`,
      createdBy: user?.name || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rows: 0,
      columns: 0,
      data: duplicatedSchema
    });
    setCreationMode(null);
    toast.success("Formulário duplicado! Agora você pode editar.");
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

  const handleFormSubmit = async () => {
    if (!viewingForm) return;
    
    const schema = (typeof viewingForm.data === 'string' ? JSON.parse(viewingForm.data) : viewingForm.data) as FormSchema;
    
    // Validar campos obrigatórios
    let hasErrors = false;
    schema.categories.forEach(cat => {
      cat.fields.forEach(field => {
        if (field.required && !formValues[field.id]) {
          hasErrors = true;
          toast.error(`Campo "${field.label}" é obrigatório`);
        }
      });
    });
    
    if (hasErrors) return;
    
    try {
      // Salvar resposta no banco de dados
      await saveFormResponse({
        formId: viewingForm.id,
        formTitle: viewingForm.title,
        responses: formValues,
        submittedBy: user?.name || "Usuário",
        submittedAt: new Date().toISOString()
      });
      
      toast.success("Formulário salvo com sucesso!");
      setViewingForm(null);
      setFormValues({});
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      toast.error("Erro ao salvar o formulário");
    }
  };

  const downloadFormAsPDF = async () => {
    if (!viewingForm) return;
    
    try {
      const schema = (typeof viewingForm.data === 'string' ? JSON.parse(viewingForm.data) : viewingForm.data) as FormSchema;
      
      // Criar conteúdo HTML do formulário
      let htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #10b981; margin-bottom: 10px;">${viewingForm.title}</h1>
          <p style="color: #999; margin-bottom: 20px;">Data de preenchimento: ${new Date().toLocaleString('pt-BR')}</p>
          <hr style="border: none; border-top: 2px solid #10b981; margin-bottom: 20px;" />
      `;
      
      schema.categories.forEach(cat => {
        htmlContent += `
          <h2 style="color: #10b981; margin-top: 20px; margin-bottom: 10px; font-size: 16px;">${cat.title}</h2>
          <div style="margin-left: 10px;">
        `;
        
        cat.fields.forEach(field => {
          const value = formValues[field.id] || '(não preenchido)';
          htmlContent += `
            <div style="margin-bottom: 12px;">
              <strong>${field.label}:</strong> ${value}
            </div>
          `;
        });
        
        htmlContent += `</div>`;
      });
      
      htmlContent += `
          <hr style="border: none; border-top: 1px solid #ddd; margin-top: 30px;" />
          <p style="color: #999; font-size: 12px; margin-top: 20px;">Documento gerado automaticamente pelo Rushy</p>
        </div>
      `;
      
      // Criar elemento temporário
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = 'white';
      document.body.appendChild(tempDiv);
      
      // Converter para canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      // Criar PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= 277;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= 277;
      }
      
      // Download
      pdf.save(`${viewingForm.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
      
      // Limpar
      document.body.removeChild(tempDiv);
      
      toast.success("Formulário exportado em PDF!");
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error("Erro ao exportar formulário em PDF");
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
                                      <option value="third">Terço (33%)</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">Placeholder</Label>
                                  <Input 
                                    value={field.placeholder || ""}
                                    onChange={(e) => updateField(category.id, field.id, { placeholder: e.target.value })}
                                    className="h-8 bg-transparent border-white/10 text-sm"
                                    placeholder="Texto de ajuda"
                                  />
                                </div>
                                {field.type === "select" && (
                                  <div>
                                    <Label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">Opções (separadas por vírgula)</Label>
                                    <Input 
                                      value={field.options?.join(", ") || ""}
                                      onChange={(e) => updateField(category.id, field.id, { options: e.target.value.split(",").map(o => o.trim()) })}
                                      className="h-8 bg-transparent border-white/10 text-sm"
                                      placeholder="Opção 1, Opção 2, Opção 3"
                                    />
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => updateField(category.id, field.id, { required: e.target.checked })}
                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-emerald-500"
                                  />
                                  <Label className="text-[10px] uppercase tracking-wider text-slate-500">Obrigatório</Label>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeField(category.id, field.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add Category Button */}
            <Button 
              onClick={addCategory}
              className="w-full border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 py-6 gap-2"
            >
              <FolderPlus className="w-4 h-4" /> Adicionar Categoria
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Formulários</h1>
            <p className="text-slate-400 text-sm mt-1">Crie e gerencie formulários personalizados</p>
          </div>
          {canEdit && (
            <Button 
              onClick={() => setCreationMode("choice")}
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
            >
              <Plus className="w-4 h-4" /> Novo Formulário
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Buscar formulários..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum formulário encontrado</p>
            </div>
          ) : (
            filtered.map((form) => {
              const schema = (typeof form.data === 'string' ? JSON.parse(form.data) : form.data) as FormSchema;
              const fieldCount = schema.categories?.reduce((acc, cat) => acc + (cat.fields?.length || 0), 0) || 0;
              
              return (
                <motion.div
                  key={form.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/5 bg-[#161B27]/40 p-6 hover:border-emerald-500/30 transition-all group overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                        {form.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{form.title}</p>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-slate-500">
                        <User className="w-3.5 h-3.5" />
                        <span>{form.createdBy}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{form.updatedAt}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
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
                            onClick={() => duplicateForm(form)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 border border-white/5 transition-colors"
                            title="Duplicar formulário"
                          >
                            <Copy className="w-3 h-3" />
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
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Creation Mode Choice Modal */}
      {creationMode === "choice" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#161B27] rounded-2xl border border-white/10 p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Novo Formulário</h2>
              <button onClick={() => setCreationMode(null)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-400 text-sm mb-6">Escolha como deseja criar:</p>

            <div className="space-y-3">
              <button
                onClick={startNewForm}
                className="w-full p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-left transition-colors group"
              >
                <p className="font-semibold text-white flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
                  <Plus className="w-4 h-4" /> Criar do Zero
                </p>
                <p className="text-xs text-slate-400 mt-1">Comece com um formulário vazio</p>
              </button>

              <button
                onClick={() => setCreationMode(null)}
                className="w-full p-4 rounded-lg border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-left transition-colors group"
              >
                <p className="font-semibold text-white flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                  <Copy className="w-4 h-4" /> Duplicar Existente
                </p>
                <p className="text-xs text-slate-400 mt-1">Escolha um formulário para duplicar</p>
              </button>
            </div>

            {/* Duplicate Selection */}
            {creationMode === "choice" && forms.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Selecione um formulário:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {forms.map((form) => (
                    <button
                      key={form.id}
                      onClick={() => duplicateForm(form)}
                      className="w-full p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-blue-500/10 hover:border-blue-500/30 text-left transition-all text-xs"
                    >
                      <p className="text-white font-medium truncate">{form.title}</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">{form.id}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setCreationMode(null)}
              className="w-full mt-6 py-2 text-slate-400 hover:text-slate-300 text-sm transition-colors"
            >
              Cancelar
            </button>
          </motion.div>
        </div>
      )}

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
                            value={formValues[field.id] || ""}
                            onChange={(e) => setFormValues({...formValues, [field.id]: e.target.value})}
                          />
                        ) : field.type === "select" ? (
                          <select 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-emerald-500/50"
                            value={formValues[field.id] || ""}
                            onChange={(e) => setFormValues({...formValues, [field.id]: e.target.value})}
                          >
                            <option value="">Selecione...</option>
                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : field.type === "checkbox" ? (
                          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-white/10 bg-white/5 text-emerald-500" 
                              checked={formValues[field.id] || false}
                              onChange={(e) => setFormValues({...formValues, [field.id]: e.target.checked})}
                            />
                            <span className="text-slate-300 text-sm">Confirmar {field.label}</span>
                          </div>
                        ) : (
                          <Input 
                            type={field.type}
                            className="bg-white/5 border-white/10 rounded-xl h-12 text-white"
                            placeholder={field.placeholder}
                            value={formValues[field.id] || ""}
                            onChange={(e) => setFormValues({...formValues, [field.id]: e.target.value})}
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
              <Button 
                onClick={downloadFormAsPDF}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 gap-2"
              >
                <Download className="w-4 h-4" /> Baixar PDF
              </Button>
              <Button 
                onClick={handleFormSubmit}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8"
              >
                Salvar Formulário
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
