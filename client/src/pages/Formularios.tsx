/**
 * Formulários — Rushy Sistema de Gestão
 * Reformulado: Construtor de formulários com categorias e campos dinâmicos
 * Fluxo: Modelos → Rascunhos → Postados
 */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Plus, Search, Eye, Edit2, X, Save, FileText, Calendar,
  User, ChevronRight, Trash2, Layout, Type, List, CheckSquare, 
  Hash, GripVertical, Settings2, FolderPlus, ArrowLeft, Copy, Download, Send
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData, FormTemplate, FormResponse, formatToBrasiliaDisplay } from "@/contexts/DataContext";
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
  const [expandedSection, setExpandedSection] = useState<"templates" | "drafts" | "posted" | null>(null);
  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});

  // Carregar a resposta salva quando abrir um formulário.
  // Para postados, prioriza a resposta enviada; para rascunhos, prioriza o rascunho.
  // Também considera respostas antigas sem status para manter compatibilidade com registros já existentes.
  useEffect(() => {
    if (!viewingForm) return;

    const formSavedResponses = formResponses
      .filter((response) => response.formId === viewingForm.id)
      .sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());

    const savedResponse = viewingForm.status === 'posted'
      ? formSavedResponses.find((response) => response.status === 'submitted') || formSavedResponses[0]
      : formSavedResponses.find((response) => response.status === 'draft') || formSavedResponses[0];

    setFormValues(savedResponse?.responses || {});
  }, [viewingForm, formResponses]);

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

  const startNewForm = (status: 'draft' | 'template' = 'draft') => {
    setFormTitle(status === 'template' ? "Novo Modelo" : "Novo Rascunho");
    setSchema({
      categories: [{ id: Math.random().toString(36).substr(2, 9), title: "Informações Gerais", fields: [] }]
    });
    setBuilderForm({
      id: "new",
      title: status === 'template' ? "Novo Modelo" : "Novo Rascunho",
      createdBy: user?.name || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rows: 0,
      columns: 0,
      data: { categories: [] },
      status: status,
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

  const widthClass = (width: FormField["width"]) => {
    // Usando min-w para garantir que o flex-wrap funcione corretamente
    if (width === "half") return "flex-[1_1_calc(50%-0.75rem)] min-w-[200px]";
    if (width === "third") return "flex-[1_1_calc(33.333%-0.75rem)] min-w-[150px]";
    return "w-full flex-[1_1_100%]";
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

    // Validar se já existe um formulário com o mesmo nome (exceto o próprio que está sendo editado)
    const duplicateName = forms.find(f => 
      f.title.toLowerCase().trim() === formTitle.toLowerCase().trim() && 
      f.id !== builderForm?.id
    );

    if (duplicateName) {
      toast.error(`Já existe um formulário com o nome "${formTitle}". Por favor, escolha um nome diferente.`);
      return;
    }

    const formData = {
      title: formTitle,
      data: schema,
      updatedAt: new Date().toISOString().split("T")[0],
      rows: schema.categories.length,
      columns: schema.categories.reduce((acc, cat) => acc + cat.fields.length, 0),
      status: builderForm?.status || 'draft',
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
    } catch (error: any) {
      console.error("Erro detalhado ao salvar:", error);
      toast.error(`Erro ao salvar: ${error.message || "Erro desconhecido"}`);
    }
  };

  const handlePostForm = async (id: string) => {
    try {
      const formToPost = forms.find((form) => form.id === id);
      const savedDraftResponse = formResponses.find(
        (response) => response.formId === id && response.status === 'draft'
      );

      if (formToPost && savedDraftResponse) {
        await saveFormResponse({
          formId: savedDraftResponse.formId,
          formTitle: savedDraftResponse.formTitle || formToPost.title,
          responses: savedDraftResponse.responses || {},
          submittedBy: savedDraftResponse.submittedBy || user?.name || "Usuário",
          submittedAt: new Date().toISOString(),
          status: 'submitted'
        });
      }

      await postForm(id);
      toast.success("Formulário postado com sucesso!");
    } catch (error) {
      console.error("Erro ao postar formulário:", error);
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

  const handleSaveDraftResponse = async () => {
    if (!viewingForm) return;
    
    try {
      await saveFormResponse({
        formId: viewingForm.id,
        formTitle: viewingForm.title,
        responses: formValues,
        submittedBy: user?.name || "Usuário",
        submittedAt: new Date().toISOString(),
        status: 'draft'
      });
      
      toast.success("Rascunho salvo com sucesso!");
      setViewingForm(null);
      setFormValues({});
    } catch (error: any) {
      console.error('Erro ao salvar rascunho:', error);
      toast.error(`Erro ao salvar o rascunho: ${error.message || "Erro desconhecido"}`);
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
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      });
      
      toast.success("Formulário enviado com sucesso!");
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
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${field.label}:`, margin + 3, yPosition);
          
          pdf.setFont('helvetica', 'normal');
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
  const FormSection = ({ title, items, type, sectionKey }: { title: string; items: FormTemplate[]; type: 'template' | 'draft' | 'posted', sectionKey: "templates" | "drafts" | "posted" }) => {
    const isExpanded = expandedSection === sectionKey;
    const displayItems = isExpanded ? items : items.slice(0, 3);

    return (
      <div className={cn(
        "space-y-4 transition-all duration-500",
        isExpanded ? "fixed inset-0 z-[100] bg-[#020617] p-6 lg:p-12 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500" : "relative"
      )}>
        {isExpanded && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#10b98115,transparent_50%)] pointer-events-none" />
        )}
        
        <div className={cn("flex items-center justify-between mb-10 relative z-10", isExpanded && "max-w-7xl mx-auto w-full")}>
          <div className="flex items-center gap-6">
            {isExpanded && (
              <button 
                onClick={() => setExpandedSection(null)}
                className="group p-3 rounded-2xl bg-accent/50 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-300 border border-border hover:border-emerald-500/20"
              >
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              </button>
            )}
            <div>
              <h3 className={cn("font-bold text-foreground tracking-tight", isExpanded ? "text-4xl" : "text-xl")}>{title}</h3>
              {isExpanded && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-muted-foreground text-sm font-medium">Gerenciando {items.length} formulários</p>
                </div>
              )}
            </div>
            {!isExpanded && (
              <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">{items.length}</span>
              </div>
            )}
          </div>
          
          {!isExpanded && items.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedSection(sectionKey)}
              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-2 rounded-2xl px-5 py-5 border border-transparent hover:border-emerald-500/20 transition-all duration-300"
            >
              <Plus className="w-4 h-4" /> 
              <span className="font-semibold">Ver todos</span>
            </Button>
          )}
          
          {isExpanded && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpandedSection(null)}
              className="w-12 h-12 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-2xl border border-border transition-all"
            >
              <X className="w-6 h-6" />
            </Button>
          )}
        </div>
        
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10",
          isExpanded && "lg:grid-cols-4 max-w-7xl mx-auto w-full pb-32"
        )}>
          {type === 'template' && !isExpanded && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => startNewForm('template')}
              className="group p-6 rounded-2xl border-2 border-dashed border-border hover:border-emerald-500/50 bg-white/[0.02] hover:bg-emerald-500/[0.02] transition-all duration-300 flex items-center justify-center min-h-[200px]"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30 flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-emerald-400 group-hover:text-emerald-300">Criar Modelo</span>
              </div>
            </motion.button>
          )}

          {displayItems.length === 0 && type !== 'template' ? (
            <div className="col-span-full p-12 rounded-2xl border border-border bg-white/[0.02] text-center">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum formulário {type === 'draft' ? 'rascunho' : 'postado'} encontrado</p>
            </div>
          ) : (
            displayItems.map((form) => (
              <motion.div
                key={form.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group p-6 rounded-2xl border border-border bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground group-hover:text-emerald-400 transition-colors truncate">{form.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">Por {form.createdBy}</p>
                    {(type === 'draft' || (type === 'template' && form.status === 'template')) && form.createdAt && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>Criado em {formatToBrasiliaDisplay(form.createdAt)}</span>
                      </div>
                    )}
                    {type === 'posted' && form.postedAt && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400/70 mt-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>Postado em {formatToBrasiliaDisplay(form.postedAt)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    {(type === 'draft' || type === 'template') && (
                      <button
                        onClick={() => openEdit(form)}
                        className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm(`Tem certeza que deseja apagar este formulário ${type === 'posted' ? 'postado' : type === 'template' ? 'modelo' : 'rascunho'}? Esta ação não pode ser desfeita.`)) {
                          handleDeleteForm(form.id);
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
                  <span className="flex items-center gap-1"><Layout className="w-3 h-3" /> {form.rows} seções</span>
                  <span className="flex items-center gap-1"><Type className="w-3 h-3" /> {form.columns} campos</span>
                </div>

                <div className="flex gap-2 pt-4 border-t border-border mt-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (isExpanded) setExpandedSection(null);
                      setViewingForm(form);
                    }}
                    className="flex-1 border-border text-foreground hover:text-foreground"
                  >
                    {type === 'draft' ? <Edit2 className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />} 
                    {type === 'draft' ? 'Preencher' : 'Visualizar'}
                  </Button>
                  {type === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => handlePostForm(form.id)}
                      className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400"
                    >
                      <Send className="w-3 h-3 mr-1" /> Postar
                    </Button>
                  )}
                  {type === 'template' && (
                    <Button
                      size="sm"
                      onClick={() => duplicateForm(form)}
                      className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400"
                    >
                      <Copy className="w-3 h-3 mr-1" /> Usar
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  };

  if (builderForm) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setBuilderForm(null)}
                className="p-2 rounded-lg hover:bg-accent/50 text-muted-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <input 
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="bg-transparent text-2xl font-bold text-foreground outline-none border-b border-transparent focus:border-emerald-500/50 px-1"
                  placeholder="Título do Formulário"
                />
                <p className="text-muted-foreground text-xs mt-1">Modo de Edição • Rushy Builder</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setBuilderForm(null)} className="border-border text-foreground">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-foreground gap-2">
                <Save className="w-4 h-4" /> Salvar Formulário
              </Button>
            </div>
          </div>

          <Separator className="bg-accent/50" />

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
                      className="bg-transparent text-lg font-semibold text-foreground outline-none border-b border-transparent focus:border-emerald-500/50 px-1"
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

                  <div className="flex flex-wrap gap-3">
                    {category.fields.map((field) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-lg bg-accent/50 border border-border space-y-3 ${widthClass(field.width)}`}
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateField(category.id, field.id, { label: e.target.value })}
                            className="flex-1 bg-transparent text-foreground outline-none border-b border-transparent focus:border-emerald-500/50 px-1"
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
                            <Label className="text-xs text-muted-foreground">Tipo</Label>
                            <select
                              value={field.type}
                              onChange={(e) => updateField(category.id, field.id, { type: e.target.value as FieldType })}
                              className="w-full mt-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-foreground"
                            >
                              <option value="text">Texto</option>
                              <option value="number">Número</option>
                              <option value="select">Seleção</option>
                              <option value="checkbox">Caixa</option>
                              <option value="textarea">Área de Texto</option>
                            </select>
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground">Largura</Label>
                            <select
                              value={field.width}
                              onChange={(e) => updateField(category.id, field.id, { width: e.target.value as any })}
                              className="w-full mt-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-foreground"
                            >
                              <option value="full">Completa</option>
                              <option value="half">Metade</option>
                              <option value="third">Terço</option>
                            </select>
                          </div>

                          <div className="flex items-end">
                            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
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
                            <Label className="text-xs text-muted-foreground">Opções (separadas por vírgula)</Label>
                            <input
                              type="text"
                              value={field.options?.join(', ') || ''}
                              onChange={(e) => updateField(category.id, field.id, { options: e.target.value.split(',').map(o => o.trim()) })}
                              className="w-full mt-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-foreground"
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
              className="w-full bg-white/10 hover:bg-white/20 text-foreground gap-2"
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
              <h1 className="text-3xl font-bold text-foreground">{viewingForm.title}</h1>
              <p className="text-muted-foreground mt-1">Criado por {viewingForm.createdBy}</p>
            </div>
            <button
              onClick={() => setViewingForm(null)}
              className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <Separator className="bg-accent/50" />

          <div className="space-y-6">
            {schema.categories.map((category) => (
              <div key={category.id} className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
                
                <div className="flex flex-wrap gap-4">
                  {category.fields.map((field) => (
                    <div key={field.id} className={`space-y-2 ${widthClass(field.width)}`}>
                      <label className="block text-sm font-medium text-foreground">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>

                      {field.type === 'text' && (
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          value={formValues[field.id] || ''}
                          onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                          disabled={viewingForm.status !== 'draft'}
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-foreground placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      )}

                      {field.type === 'number' && (
                        <input
                          type="number"
                          placeholder={field.placeholder}
                          value={formValues[field.id] || ''}
                          onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                          disabled={viewingForm.status !== 'draft'}
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-foreground placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      )}

                      {field.type === 'select' && (
                        <select
                          value={formValues[field.id] || ''}
                          onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                          disabled={viewingForm.status !== 'draft'}
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
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
                          disabled={viewingForm.status !== 'draft'}
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-foreground placeholder-slate-500 min-h-24 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      )}

                      {field.type === 'checkbox' && (
                        <label className={cn("flex items-center gap-2 cursor-pointer", viewingForm.status !== 'draft' && "cursor-not-allowed opacity-50")}>
                          <input
                            type="checkbox"
                            checked={formValues[field.id] || false}
                            onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.checked })}
                            disabled={viewingForm.status !== 'draft'}
                            className="w-4 h-4"
                          />
                          <span className="text-foreground">{field.label}</span>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Separator className="bg-accent/50" />

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setViewingForm(null)}
              className="border-border text-foreground"
            >
              Fechar
            </Button>
            <Button
              onClick={downloadFormAsPDF}
              className="bg-slate-600 hover:bg-slate-500 text-foreground gap-2"
            >
              <Download className="w-4 h-4" /> Exportar PDF
            </Button>
            {viewingForm.status === 'draft' && (
              <Button
                onClick={handleSaveDraftResponse}
                className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 gap-2 border-emerald-500/20"
              >
                <Save className="w-4 h-4" /> Salvar Rascunho
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
            <h1 className="text-3xl font-bold text-foreground">Formulários</h1>
            <p className="text-muted-foreground mt-1">Gerencie modelos, rascunhos e formulários postados</p>
          </div>
          <Button
            onClick={() => startNewForm('draft')}
            className="bg-emerald-600 hover:bg-emerald-500 text-foreground gap-2"
          >
            <Plus className="w-4 h-4" /> Novo Formulário
          </Button>
        </div>

        <Separator className="bg-accent/50" />

        {/* Seção de Modelos */}
        <FormSection title="Modelos" items={templates} type="template" sectionKey="templates" />

        <Separator className="bg-accent/50" />

        {/* Seção de Rascunhos */}
        <FormSection title="Rascunhos" items={drafts} type="draft" sectionKey="drafts" />

        <Separator className="bg-accent/50" />

        {/* Seção de Postados */}
        <FormSection title="Postados" items={posted} type="posted" sectionKey="posted" />

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
                className="bg-slate-900 border border-border rounded-2xl p-6 max-w-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Remover Formulário?</h3>
                <p className="text-muted-foreground mb-6">Esta ação não pode ser desfeita.</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeletingFormId(null)}
                    className="flex-1 border-border text-foreground"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => handleDeleteForm(deletingFormId)}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-foreground"
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
