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
  rows: number;
  columns: number;
  data: any;
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
  markNotificationAsRead: (id: string) => Promise<void>;
  createNotification: (title: string, message: string, type?: 'info' | 'alerta' | 'sucesso') => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [forms, setForms] = useState<FormTemplate[]>([]);
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
          { data: formsData }
        ] = await Promise.all([
          supabase.from('orders').select('*').eq('company_id', companyId),
          supabase.from('stock_items').select('*').eq('company_id', companyId),
          supabase.from('suppliers').select('*').eq('company_id', companyId),
          supabase.from('employees').select('*').eq('company_id', companyId),
          supabase.from('forms').select('*').eq('company_id', companyId)
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
          needsRestock: item.needs_restock
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
          rows: form.rows,
          columns: form.columns,
          data: form.data
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
    const { error } = await supabase.from('stock_items').insert([{
      id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      min_quantity: item.minQuantity,
      unit: item.unit,
      needs_restock: item.needsRestock,
      company_id: user?.companyId
    }]);
    if (!error) setStockItems((prev) => [{ ...item, id }, ...prev]);
  };

  const updateStockItem = async (id: string, updates: Partial<StockItem>) => {
    const dbUpdates: any = { ...updates };
    if (updates.minQuantity !== undefined) dbUpdates.min_quantity = updates.minQuantity;
    if (updates.needsRestock !== undefined) dbUpdates.needs_restock = updates.needsRestock;
    const { error } = await supabase.from('stock_items').update(dbUpdates).eq('id', id);
    if (!error) setStockItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
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
    const { error } = await supabase.from('forms').insert([{
      id,
      title: form.title,
      created_by: form.createdBy,
      created_at: form.createdAt,
      updated_at: form.updatedAt,
      rows: form.rows,
      columns: form.columns,
      data: form.data,
      company_id: user?.companyId
    }]);
    if (!error) setForms((prev) => [{ ...form, id }, ...prev]);
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
    
    const { error } = await supabase.from('forms').update(dbUpdates).eq('id', id);
    
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
        orders, stockItems, suppliers, employees, forms, notifications, loading,
        addOrder, updateOrder, deleteOrder,
        addStockItem, updateStockItem, requestRestock,
        addSupplier, updateSupplier,
        addEmployee,
    updateEmployee,
    deleteEmployee,       addForm, updateForm, deleteForm,
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
