/**
 * Formulários — Rushy Sistema de Gestão
 * Reformulado: Construtor de formulários com categorias e campos dinâmicos
 * Fluxo: Modelos → Rascunhos → Postados
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Plus, Search, Eye, Edit2, X, Save, FileText, Calendar,
  User, ChevronRight, Trash2, Layout, Type, List, CheckSquare, 
  Hash, GripVertical, Settings2, FolderPlus, ArrowLeft, Copy, Download, Send
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
  options?: string[];
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
  const { forms, formResponses, addForm, updateForm, deleteForm, postForm, saveFormResponse } = useData();
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

  // Separar formulários por status
  const templates = useMemo(() => forms.filter(f => f.status === 'template'), [forms]);
  const drafts = useMemo(() => forms.filter(f => f.status === 'draft' && f.creatorUserId === user?.id), [forms, user?.id]);
  const posted = useMemo(() => forms.filter(f => f.status === 'posted'), [forms]);

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
      data: { categories: [] },
      status: 'draft',
      creatorUserId: user?.id,
      isEditable: true
    });
    setCreationMode(null);
  };

  const duplicateForm = (formToDuplicate: FormTemplate) => {
    const loadedSchema = (typeof formToDuplicate.data === 'string' ? JSON.parse(formToDuplicate.data) : formToDuplicate.data) as FormSchema;
    
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
      data: duplicatedSchema,
      status: 'draft',
      creatorUserId: user?.id,
      isEditable: true
    });
    setCreationMode(null);
    toast.success("Formulário duplicado! Agora você pode editar.");
  };

  const openEdit = (form: FormTemplate) => {
    if (!form.isEditable && form.status === 'posted') {
      toast.error("Formulários postados não podem ser editados");
      return;
    }
    setBuilderForm(form);
    setFormTitle(form.title);
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
      status: 'draft' as const,
      creatorUserId: user?.id,
      isEditable: true
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

  const handlePostForm = async (id: string) => {
    try {
      await postForm(id);
      toast.success("Formulário postado com sucesso!");
    } catch (error) {
      toast.error("Erro ao postar formulário");
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
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;
      const lineHeight = 6;
      
      pdf.setFontSize(18);
      pdf.setTextColor(16, 185, 129);
      pdf.text(viewingForm.title, margin, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor(153, 153, 153);
      pdf.text(`Data: ${new Date().toLocaleString('pt-BR')}`, margin, yPosition);
      yPosition += 8;
      
      pdf.setDrawColor(16, 185, 129);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      
      schema.categories.forEach(cat => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.setFontSize(13);
        pdf.setTextColor(16, 185, 129);
        pdf.text(cat.title, margin, yPosition);
        yPosition += 7;
        
        cat.fields.forEach(field => {
          if (yPosition > pageHeight - 15) {
            pdf.addPage();
            yPosition = margin;
          }
          
          const value = formValues[field.id];
          let displayValue = '';
          
          if (Array.isArray(value)) {
            displayValue = value.join(', ');
          } else if (value !== undefined && value !== null && value !== '') {
            displayValue = String(value);
          } else {
            displayValue = '(não preenchido)';
          }
          
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          pdf.setFont(undefined, 'bold');
          pdf.text(`${field.label}:`, margin + 3, yPosition);
          
          pdf.setFont(undefined, 'normal');
          pdf.setTextColor(80, 80, 80);
          pdf.setFontSize(9);
          
          const wrappedText = pdf.splitTextToSize(displayValue, contentWidth - 6);
          pdf.text(wrappedText, margin + 3, yPosition + lineHeight);
          
          yPosition += (wrappedText.length * lineHeight) + 4;
        });
        
        yPosition += 2;
      });
      
      if (yPosition > pageHeight - 15) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 4;
      
      pdf.setFontSize(8);
      pdf.setTextColor(153, 153, 153);
      pdf.text('Documento gerado automaticamente pelo Rushy', margin, yPosition);
      
      const fileName = `${viewingForm.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
      
      toast.success("Formulário exportado em PDF!");
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error("Erro ao exportar formulário em PDF");
    }
  };

  // Renderizar seção de formulários
  const FormSection = ({ title, items, type }: { title: string; items: FormTemplate[]; type: 'template' | 'draft' | 'posted' }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-sm text-slate-400 bg-white/5 px-3 py-1 rounded-full">{items.length}</span>
      </div>
      
      {items.length === 0 ? (
        <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
          <FileText className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">Nenhum formulário {type === 'template' ? 'modelo' : type === 'draft' ? 'rascunho' : 'postado'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((form) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">{form.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">Por {form.createdBy}</p>
                </div>
                {type === 'draft' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(form)}
                      className="p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingFormId(form.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1"><Layout className="w-3 h-3" /> {form.rows} seções</span>
                <span className="flex items-center gap-1"><Type className="w-3 h-3" /> {form.columns} campos</span>
              </div>

              <div className="flex gap-2 pt-4 border-t border-white/5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewingForm(form)}
                  className="flex-1 border-white/10 text-slate-300 hover:text-white"
                >
                  <Eye className="w-3 h-3 mr-1" /> Visualizar
                </Button>
                {type === 'template' && (
                  <Button
                    size="sm"
                    onClick={() => duplicateForm(form)}
                    className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400"
                  >
                    <Copy className="w-3 h-3 mr-1" /> Usar
                  </Button>
                )}
                {type === 'draft' && (
                  <Button
                    size="sm"
                    onClick={() => handlePostForm(form.id)}
                    className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400"
                  >
                    <Send className="w-3 h-3 mr-1" /> Postar
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  if (builderForm) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
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

          <div className="space-y-8 pb-20">
            <AnimatePresence>
              {schema.categories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={category.title}
                      onChange={(e) => updateCategoryTitle(category.id, e.target.value)}
                      className="bg-transparent text-lg font-semibold text-white outline-none border-b border-transparent focus:border-emerald-500/50 px-1"
                    />
                    {schema.categories.length > 1 && (
                      <button
                        onClick={() => removeCategory(category.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {category.fields.map((field) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateField(category.id, field.id, { label: e.target.value })}
                            className="flex-1 bg-transparent text-white outline-none border-b border-transparent focus:border-emerald-500/50 px-1"
                            placeholder="Rótulo do campo"
                          />
                          <button
                            onClick={() => removeField(category.id, field.id)}
                            className="p-1 rounded hover:bg-red-500/10 text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs text-slate-400">Tipo</Label>
                            <select
                              value={field.type}
                              onChange={(e) => updateField(category.id, field.id, { type: e.target.value as FieldType })}
                              className="w-full mt-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white"
                            >
                              <option value="text">Texto</option>
                              <option value="number">Número</option>
                              <option value="select">Seleção</option>
                              <option value="checkbox">Caixa</option>
                              <option value="textarea">Área de Texto</option>
                            </select>
                          </div>

                          <div>
                            <Label className="text-xs text-slate-400">Largura</Label>
                            <select
                              value={field.width}
                              onChange={(e) => updateField(category.id, field.id, { width: e.target.value as any })}
                              className="w-full mt-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white"
                            >
                              <option value="full">Completa</option>
                              <option value="half">Metade</option>
                              <option value="third">Terço</option>
                            </select>
                          </div>

                          <div className="flex items-end">
                            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateField(category.id, field.id, { required: e.target.checked })}
                                className="w-4 h-4"
                              />
                              Obrigatório
                            </label>
                          </div>
                        </div>

                        {field.type === 'select' && (
                          <div>
                            <Label className="text-xs text-slate-400">Opções (separadas por vírgula)</Label>
                            <input
                              type="text"
                              value={field.options?.join(', ') || ''}
                              onChange={(e) => updateField(category.id, field.id, { options: e.target.value.split(',').map(o => o.trim()) })}
                              className="w-full mt-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white"
                              placeholder="Opção 1, Opção 2, Opção 3"
                            />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => addField(category.id)}
                    className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 gap-2"
                  >
                    <Plus className="w-4 h-4" /> Adicionar Campo
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>

            <Button
              onClick={addCategory}
              className="w-full bg-white/10 hover:bg-white/20 text-white gap-2"
            >
              <Plus className="w-4 h-4" /> Adicionar Categoria
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (viewingForm) {
    const schema = (typeof viewingForm.data === 'string' ? JSON.parse(viewingForm.data) : viewingForm.data) as FormSchema;
    
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{viewingForm.title}</h1>
              <p className="text-slate-400 mt-1">Criado por {viewingForm.createdBy}</p>
            </div>
            <button
              onClick={() => setViewingForm(null)}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <Separator className="bg-white/5" />

          <div className="space-y-6">
            {schema.categories.map((category) => (
              <div key={category.id} className="space-y-4">
                <h3 className="text-lg font-semibold text-white">{category.title}</h3>
                
                <div className="space-y-4">
                  {category.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label className="block text-sm font-medium text-white">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>

                      {field.type === 'text' && (
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          value={formValues[field.id] || ''}
                          onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-slate-500"
                        />
                      )}

                      {field.type === 'number' && (
                        <input
                          type="number"
                          placeholder={field.placeholder}
                          value={formValues[field.id] || ''}
                          onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-slate-500"
                        />
                      )}

                      {field.type === 'select' && (
                        <select
                          value={formValues[field.id] || ''}
                          onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                        >
                          <option value="">Selecione uma opção</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}

                      {field.type === 'textarea' && (
                        <textarea
                          placeholder={field.placeholder}
                          value={formValues[field.id] || ''}
                          onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-slate-500 min-h-24"
                        />
                      )}

                      {field.type === 'checkbox' && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formValues[field.id] || false}
                            onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className="text-white">{field.label}</span>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Separator className="bg-white/5" />

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setViewingForm(null)}
              className="border-white/10 text-slate-300"
            >
              Fechar
            </Button>
            <Button
              onClick={downloadFormAsPDF}
              className="bg-slate-600 hover:bg-slate-500 text-white gap-2"
            >
              <Download className="w-4 h-4" /> Exportar PDF
            </Button>
            {viewingForm.status === 'posted' && (
              <Button
                onClick={handleFormSubmit}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
              >
                <Save className="w-4 h-4" /> Enviar Resposta
              </Button>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Formulários</h1>
            <p className="text-slate-400 mt-1">Gerencie modelos, rascunhos e formulários postados</p>
          </div>
          <Button
            onClick={startNewForm}
            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
          >
            <Plus className="w-4 h-4" /> Novo Formulário
          </Button>
        </div>

        <Separator className="bg-white/5" />

        {/* Seção de Modelos */}
        <FormSection title="Modelos" items={templates} type="template" />

        <Separator className="bg-white/5" />

        {/* Seção de Rascunhos */}
        <FormSection title="Rascunhos" items={drafts} type="draft" />

        <Separator className="bg-white/5" />

        {/* Seção de Postados */}
        <FormSection title="Postados" items={posted} type="posted" />

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deletingFormId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setDeletingFormId(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-white mb-4">Remover Formulário?</h3>
                <p className="text-slate-400 mb-6">Esta ação não pode ser desfeita.</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeletingFormId(null)}
                    className="flex-1 border-white/10 text-slate-300"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => handleDeleteForm(deletingFormId)}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white"
                  >
                    Remover
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
