import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

export interface Order {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  date: string;
  status: "pendente" | "em_transito" | "entregue" | "cancelado";
  total: string;
  unit: string;
  urgency: "baixa" | "media" | "alta";
  requestedBy: string;
  comments: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  needsRestock: boolean;
  barcode: string;
  location: string;
  description?: string;
  lastUpdated?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  category: string;
  status: "ativo" | "inativo";
  cnpj: string;
  phone: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: "admin" | "gerente" | "logistica" | "estoque";
  department: string;
  joinDate: string;
  status: "ativo" | "inativo";
}

export interface FormTemplate {
  id: string;
  title: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  postedAt?: string;
  rows: number;
  columns: number;
  data: any;
  status?: 'template' | 'draft' | 'posted';
  creatorUserId?: string;
  companyId?: string;
  isEditable?: boolean;
}

export interface FormResponse {
  id: string;
  formId: string;
  formTitle: string;
  responses: { [key: string]: any };
  submittedBy: string;
  submittedAt: string;
  companyId: string;
  status?: 'draft' | 'submitted';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "alerta" | "sucesso";
  createdAt: string;
  read: boolean;
}

interface DataContextType {
  orders: Order[];
  stockItems: StockItem[];
  suppliers: Supplier[];
  employees: Employee[];
  forms: FormTemplate[];
  formResponses: FormResponse[];
  notifications: Notification[];
  loading: boolean;
  addOrder: (order: Omit<Order, "id">) => Promise<void>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  addStockItem: (item: Omit<StockItem, "id">) => Promise<void>;
  updateStockItem: (id: string, updates: Partial<StockItem>) => Promise<void>;
  requestRestock: (id: string) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, "id">) => Promise<void>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
  addEmployee: (employee: Omit<Employee, "id">) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addForm: (form: Omit<FormTemplate, "id">) => Promise<void>;
  updateForm: (id: string, updates: Partial<FormTemplate>) => Promise<void>;
  deleteForm: (id: string) => Promise<void>;
  postForm: (id: string) => Promise<void>;
  saveFormResponse: (response: Omit<FormResponse, "id" | "companyId">) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  createNotification: (title: string, message: string, type?: 'info' | 'alerta' | 'sucesso') => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Função para obter data/hora no fuso de Brasília (GMT-3) em formato ISO para o banco
function getBrasiliaISO(date: Date = new Date()): string {
  // O Supabase e o JS lidam melhor com ISO puro. 
  // Vamos salvar em UTC e converter apenas na exibição para evitar confusão de offsets.
  return date.toISOString();
}

// Função para formatar data ISO para exibição em PT-BR
export function formatToBrasiliaDisplay(isoString: string): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  } catch (e) {
    return isoString;
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .eq('company_id', user.companyId)
        .order('created_at', { ascending: false });

      if (notifData) {
        setNotifications(notifData.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          createdAt: n.created_at,
          read: n.read
        })));
      }
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadData() {
      setLoading(true);
      try {
        const companyId = user?.companyId;
        const [
          { data: ordersData },
          { data: stockData },
          { data: suppliersData },
          { data: employeesData },
          { data: formsData },
          { data: responsesData }
        ] = await Promise.all([
          supabase.from('orders').select('*').eq('company_id', companyId),
          supabase.from('stock_items').select('*').eq('company_id', companyId),
          supabase.from('suppliers').select('*').eq('company_id', companyId),
          supabase.from('employees').select('*').eq('company_id', companyId),
          supabase.from('forms').select('*').eq('company_id', companyId),
          supabase.from('form_responses').select('*').eq('company_id', companyId)
        ]);

        if (ordersData) setOrders(ordersData.map(o => ({
          ...o,
          unit: o.unit || 'un',
          urgency: o.urgency || 'media',
          requestedBy: o.requested_by || 'Sistema',
          comments: o.comments || ''
        })));
        
        if (stockData) setStockItems(stockData.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          minQuantity: item.min_quantity,
          unit: item.unit,
          needsRestock: item.needs_restock,
          barcode: item.barcode || '',
          location: item.location || '',
          description: item.description || ''
        })));

        if (suppliersData) setSuppliers(suppliersData.map(s => ({
          ...s,
          cnpj: s.cnpj || '',
          phone: s.phone || ''
        })));

        if (employeesData) setEmployees(employeesData.map(emp => ({ ...emp, joinDate: emp.join_date })));
        
        if (formsData) setForms(formsData.map(form => ({
          id: form.id,
          title: form.title,
          createdBy: form.created_by,
          createdAt: form.created_at,
          updatedAt: form.updated_at,
          postedAt: form.posted_at,
          rows: form.rows,
          columns: form.columns,
          data: form.data,
          status: form.status || 'draft',
          creatorUserId: form.creator_user_id,
          companyId: form.company_id,
          isEditable: form.is_editable !== false
        })));

        if (responsesData) setFormResponses(responsesData.map(resp => ({
          id: resp.id,
          formId: resp.form_id,
          formTitle: resp.form_title,
          responses: resp.responses,
          submittedBy: resp.submitted_by,
          submittedAt: resp.submitted_at,
          companyId: resp.company_id
        })));

        await loadNotifications();

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Polling para notificações a cada 15 segundos
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const addOrder = async (order: Omit<Order, "id">) => {
    const id = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const { error } = await supabase.from('orders').insert([{
      id,
      customer: order.customer,
      product: order.product,
      quantity: order.quantity,
      unit: order.unit,
      date: order.date,
      status: order.status,
      total: order.total,
      urgency: order.urgency,
      requested_by: order.requestedBy,
      comments: order.comments,
      company_id: user?.companyId
    }]);
    if (!error) setOrders((prev) => [{ ...order, id }, ...prev]);
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    const dbUpdates: any = { ...updates };
    if (updates.requestedBy) dbUpdates.requested_by = updates.requestedBy;
    const { error } = await supabase.from('orders').update(dbUpdates).eq('id', id);
    if (!error) setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  };

  const deleteOrder = async (id: string) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (!error) setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const addStockItem = async (item: Omit<StockItem, "id">) => {
    const id = `STK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const dbItem: any = {
      id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      min_quantity: item.minQuantity,
      unit: item.unit,
      needs_restock: item.needsRestock,
      description: item.description || '',
      company_id: user?.companyId
    };

    // Adicionar barcode e location apenas se tiverem valores não-vazios
    if (item.barcode && item.barcode.trim()) {
      dbItem.barcode = item.barcode;
    }
    if (item.location && item.location.trim()) {
      dbItem.location = item.location;
    }

    const { error } = await supabase.from('stock_items').insert([dbItem]);
    
    if (!error) {
      setStockItems((prev) => [{ ...item, id }, ...prev]);
    } else {
      console.error("Erro ao adicionar item de estoque:", error);
      throw error;
    }
  };

  const updateStockItem = async (id: string, updates: Partial<StockItem>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.minQuantity !== undefined) dbUpdates.min_quantity = updates.minQuantity;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
    if (updates.needsRestock !== undefined) dbUpdates.needs_restock = updates.needsRestock;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    
    // Adicionar barcode e location apenas se tiverem valores não-vazios
    if (updates.barcode !== undefined && updates.barcode?.trim()) {
      dbUpdates.barcode = updates.barcode;
    }
    if (updates.location !== undefined && updates.location?.trim()) {
      dbUpdates.location = updates.location;
    }

    const { error } = await supabase.from('stock_items').update(dbUpdates).eq('id', id);
    if (!error) {
      setStockItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    } else {
      console.error("Erro ao atualizar item de estoque:", error);
      throw error;
    }
  };

  const requestRestock = async (id: string) => {
    await updateStockItem(id, { needsRestock: true });
  };

  const addSupplier = async (supplier: Omit<Supplier, "id">) => {
    const id = `SUP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const { error } = await supabase.from('suppliers').insert([{
      ...supplier,
      id,
      company_id: user?.companyId
    }]);
    if (!error) setSuppliers((prev) => [{ ...supplier, id }, ...prev]);
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    const { error } = await supabase.from('suppliers').update(updates).eq('id', id);
    if (!error) setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const addEmployee = async (employee: Omit<Employee, "id">) => {
    const id = `EMP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const { error } = await supabase.from('employees').insert([{
      id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      join_date: employee.joinDate,
      status: employee.status,
      company_id: user?.companyId
    }]);
    if (!error) setEmployees((prev) => [{ ...employee, id }, ...prev]);
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    const dbUpdates: any = { ...updates };
    if (updates.joinDate) dbUpdates.join_date = updates.joinDate;
    const { error } = await supabase.from('employees').update(dbUpdates).eq('id', id);
    if (!error) setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteEmployee = async (id: string) => {
    // 1. Buscar o e-mail do funcionário antes de deletar para remover o acesso
    const employeeToDelete = employees.find(e => e.id === id);
    
    if (employeeToDelete) {
      // 2. Remover da tabela de usuários (revogar acesso)
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('email', employeeToDelete.email)
        .eq('company_id', user?.companyId);
        
      if (userError) {
        console.error("Erro ao remover acesso do usuário:", userError);
      }
    }

    // 3. Remover da tabela de funcionários (gestão)
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (!error) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    } else {
      console.error("Erro ao deletar funcionário:", error);
      throw error;
    }
  };

  const addForm = async (form: Omit<FormTemplate, "id">) => {
    const id = `FORM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const nowISO = getBrasiliaISO();
    
    // Tenta salvar com todas as colunas
    const fullData = {
      id,
      title: form.title,
      created_by: form.createdBy,
      created_at: nowISO,
      updated_at: nowISO,
      rows: form.rows,
      columns: form.columns,
      data: form.data,
      company_id: user?.companyId,
      status: form.status || 'draft',
      creator_user_id: user?.id,
      is_editable: true
    };

    let result = await supabase.from('forms').insert([fullData]);
    
    // Se der erro de coluna inexistente, tenta salvar APENAS o que está no setup_supabase.sql original
    if (result.error && result.error.message?.includes('column') && result.error.message?.includes('does not exist')) {
      console.warn("Colunas novas não encontradas, salvando com o mínimo absoluto");
      const basicData = {
        id,
        title: form.title,
        created_by: form.createdBy,
        created_at: nowISO,
        updated_at: nowISO,
        rows: form.rows,
        columns: form.columns,
        data: form.data
      };
      result = await supabase.from('forms').insert([basicData]);
    }
    
    if (result.error) {
      console.error("Erro final ao adicionar formulário:", result.error);
      throw new Error(result.error.message || "Erro desconhecido no banco de dados");
    }
    
    setForms((prev) => [{ ...form, id, createdAt: nowISO, updatedAt: nowISO, status: form.status || 'draft', creatorUserId: user?.id, companyId: user?.companyId, isEditable: true }, ...prev]);
  };

  const updateForm = async (id: string, updates: Partial<FormTemplate>) => {
    const dbUpdates: any = {};
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.data !== undefined) dbUpdates.data = updates.data;
    if (updates.rows !== undefined) dbUpdates.rows = updates.rows;
    if (updates.columns !== undefined) dbUpdates.columns = updates.columns;
    if (updates.createdBy !== undefined) dbUpdates.created_by = updates.createdBy;
    if (updates.createdAt !== undefined) dbUpdates.created_at = updates.createdAt;
    if (updates.updatedAt !== undefined) dbUpdates.updated_at = updates.updatedAt;
    
    let { error } = await supabase.from('forms').update(dbUpdates).eq('id', id);
    
    // Se der erro de coluna inexistente, tenta salvar apenas o básico
    if (error && error.message?.includes('column') && error.message?.includes('does not exist')) {
      console.warn("Colunas novas não encontradas no update, tentando salvar apenas o básico");
      const basicUpdates = {
        title: dbUpdates.title,
        data: dbUpdates.data,
        rows: dbUpdates.rows,
        columns: dbUpdates.columns,
        updated_at: dbUpdates.updated_at
      };
      const retry = await supabase.from('forms').update(basicUpdates).eq('id', id);
      error = retry.error;
    }

    if (!error) {
      setForms((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    } else {
      console.error("Erro ao atualizar formulário no Supabase:", error);
      throw error;
    }
  };

  const deleteForm = async (id: string) => {
    const { error } = await supabase.from('forms').delete().eq('id', id);
    if (!error) setForms((prev) => prev.filter((f) => f.id !== id));
  };

  const postForm = async (id: string) => {
    const nowISO = getBrasiliaISO();
    const { error } = await supabase.from('forms').update({
      status: 'posted',
      is_editable: false,
      posted_at: nowISO
    }).eq('id', id);
    
    if (!error) {
      setForms((prev) => prev.map((f) => 
        f.id === id ? { ...f, status: 'posted', isEditable: false, postedAt: nowISO } : f
      ));
    } else {
      console.error("Erro ao postar formulário:", error);
      throw error;
    }
  };

  const saveFormResponse = async (response: Omit<FormResponse, "id" | "companyId">) => {
    const id = `RESP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const status = response.status || 'submitted';
    
    const { error } = await supabase.from('form_responses').insert([{
      id,
      form_id: response.formId,
      form_title: response.formTitle,
      responses: response.responses,
      submitted_by: response.submittedBy,
      submitted_at: response.submittedAt,
      company_id: user?.companyId,
      status: status
    }]);
    
    if (error) {
      console.warn("Erro na primeira tentativa de salvar resposta, tentando o mínimo absoluto:", error.message);
      
      // Fallback 1: Tenta salvar sem as colunas novas (status e company_id)
      const { error: retryError } = await supabase.from('form_responses').insert([{
        id,
        form_id: response.formId,
        form_title: response.formTitle,
        responses: response.responses,
        submitted_by: response.submittedBy,
        submitted_at: response.submittedAt
      }]);
      
      if (!retryError) {
        setFormResponses((prev) => [{ ...response, id, companyId: user?.companyId || '', status: status }, ...prev]);
        return;
      }
      
      // Fallback 2: Tenta salvar apenas o mínimo absoluto (removendo até o form_title)
      const { error: ultraRetryError } = await supabase.from('form_responses').insert([{
        id,
        form_id: response.formId,
        responses: response.responses,
        submitted_by: response.submittedBy,
        submitted_at: response.submittedAt
      }]);
      
      if (!ultraRetryError) {
        setFormResponses((prev) => [{ ...response, id, companyId: user?.companyId || '', status: status }, ...prev]);
        return;
      }

      // Se tudo falhar, tenta salvar como um objeto JSON genérico se a tabela permitir (raro, mas possível)
      console.error("Todas as tentativas de salvamento falharam:", ultraRetryError.message);
      throw error;
    }

    if (!error) {
      setFormResponses((prev) => [{ ...response, id, companyId: user?.companyId || '', status: status }, ...prev]);
    } else {
      console.error("Erro ao salvar resposta do formulário:", error);
      throw error;
    }
  };

  const markNotificationAsRead = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (!error) setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const createNotification = async (title: string, message: string, type: 'info' | 'alerta' | 'sucesso' = 'info') => {
    const id = `NOTIF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const { error } = await supabase.from('notifications').insert([{
      id,
      title,
      message,
      type,
      created_at: new Date().toISOString(),
      read: false,
      company_id: user?.companyId
    }]);
    if (!error) {
      const newNotif: Notification = { id, title, message, type, createdAt: new Date().toISOString(), read: false };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  return (
    <DataContext.Provider
      value={{
        orders, stockItems, suppliers, employees, forms, formResponses, notifications, loading,
        addOrder, updateOrder, deleteOrder,
        addStockItem, updateStockItem, requestRestock,
        addSupplier, updateSupplier,
        addEmployee, updateEmployee, deleteEmployee,
        addForm, updateForm, deleteForm, postForm, saveFormResponse,
        markNotificationAsRead,
        createNotification
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
