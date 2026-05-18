import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export type Role = "admin" | "gerente" | "logistica" | "estoque";
export type UserStatus = "ativo" | "pendente" | "recusado";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  company: string;
  companyId: string;
  avatar?: string;
  bio?: string;
  location?: string;
  status: UserStatus;
  createdAt: string;
}

export interface PendingRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  requestedRole: Role;
  companyId: string;
  createdAt: string;
  status: "pendente" | "aceito" | "recusado";
  rejectionReason?: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  createdAt: string;
  createdBy: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  registerCompany: (name: string, cnpj: string, email: string, password: string, userName: string) => Promise<boolean>;
  registerEmployee: (email: string, password: string, userName: string, companyId: string, requestedRole: Role) => Promise<boolean>;
  updateProfile: (data: Partial<Pick<User, "name" | "bio" | "location" | "avatar">>) => Promise<boolean>;
  companies: Company[];
  pendingRequests: PendingRequest[];
  approvePendingUser: (requestId: string, approvedRole: Role) => void;
  rejectPendingUser: (requestId: string, reason: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  logistica: "Logística",
  estoque: "Estoque",
};

export const ROLE_COLORS: Record<Role, string> = {
  admin: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  gerente: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  logistica: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  estoque: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export const ROLE_DOT_COLORS: Record<Role, string> = {
  admin: "bg-purple-500",
  gerente: "bg-emerald-500",
  logistica: "bg-blue-500",
  estoque: "bg-orange-500",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  const loadInitialData = async () => {
    try {
      const { data: comps } = await supabase.from('companies').select('*');
      if (comps) {
        setCompanies(comps.map(c => ({
          id: c.id,
          name: c.name,
          cnpj: c.cnpj,
          createdAt: c.created_at,
          createdBy: c.created_by
        })));
      }

      const { data: requests } = await supabase.from('pending_requests').select('*');
      if (requests) {
        setPendingRequests(requests.map(r => ({
          id: r.id,
          userId: r.id,
          userName: r.name,
          email: r.email,
          requestedRole: r.role,
          companyId: r.company_id,
          createdAt: r.created_at,
          status: r.status
        })));
      }
    } catch (e) {
      console.error("Erro ao carregar dados de auth:", e);
    }
  };

  useEffect(() => {
    async function initAuth() {
      const stored = localStorage.getItem("rushy_user");
      if (stored) {
        try {
          const parsedUser = JSON.parse(stored);
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', parsedUser.id)
            .single();
          
          if (data && !error && data.status === "ativo") {
            setUser({
              id: data.id,
              name: data.name,
              email: data.email,
              role: data.role,
              company: data.company,
              companyId: data.company_id,
              avatar: data.avatar,
              bio: data.bio,
              location: data.location,
              status: data.status,
              createdAt: data.created_at
            });
          } else {
            localStorage.removeItem("rushy_user");
          }
        } catch {
          localStorage.removeItem("rushy_user");
        }
      }

      await loadInitialData();
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (data && !error) {
        const authUser: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          company: data.company,
          companyId: data.company_id,
          avatar: data.avatar,
          bio: data.bio,
          location: data.location,
          status: data.status,
          createdAt: data.created_at
        };
        setUser(authUser);
        localStorage.setItem("rushy_user", JSON.stringify(authUser));
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("rushy_user");
    window.location.href = "/login";
  };

  const registerCompany = async (name: string, cnpj: string, email: string, password: string, userName: string): Promise<boolean> => {
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .ilike('name', name.trim())
      .maybeSingle();

    if (existingCompany) {
      throw new Error("NOME_DUPLICADO");
    }

    const companyId = `COMP-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const userId = `USR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const { error: compError } = await supabase.from('companies').insert([{
      id: companyId,
      name: name.trim(),
      cnpj,
      created_at: new Date().toISOString(),
      created_by: userId
    }]);
    if (compError) return false;

    const { error: userError } = await supabase.from('users').insert([{
      id: userId,
      name: userName,
      email,
      password,
      role: "gerente",
      company: name,
      company_id: companyId,
      status: "ativo",
      created_at: new Date().toISOString()
    }]);

    if (!userError) {
      await loadInitialData();
      return login(email, password);
    }
    return false;
  };

  const registerEmployee = async (email: string, password: string, userName: string, companyId: string, requestedRole: Role): Promise<boolean> => {
    try {
      const id = `REQ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const { error: requestError } = await supabase.from('pending_requests').insert([{
        id,
        name: userName,
        email: email.trim().toLowerCase(),
        password,
        role: requestedRole,
        company_id: companyId,
        status: "pendente",
        created_at: new Date().toISOString()
      }]);

      if (requestError) return false;

      try {
        await supabase.from('notifications').insert([{
          id: `NOTIF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          title: "Nova Solicitação de Entrada",
          message: `${userName} solicitou entrada como ${ROLE_LABELS[requestedRole]}`,
          type: "info",
          company_id: companyId,
          created_at: new Date().toISOString(),
          read: false
        }]);
      } catch (nError) {
        console.error("Erro silencioso ao criar notificação:", nError);
      }

      await loadInitialData();
      return true;
    } catch (error) {
      return false;
    }
  };

  const approvePendingUser = async (requestId: string, approvedRole: Role) => {
    const { data: req } = await supabase.from('pending_requests').select('*').eq('id', requestId).single();
    if (req) {
      const userId = `USR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const { data: comp } = await supabase.from('companies').select('name').eq('id', req.company_id).single();

      await supabase.from('users').insert([{
        id: userId,
        name: req.name,
        email: req.email,
        password: req.password,
        role: approvedRole,
        company: comp?.name || "Empresa",
        company_id: req.company_id,
        status: "ativo",
        created_at: new Date().toISOString()
      }]);

      await supabase.from('notifications').insert([{
        id: `NOTIF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        title: "Funcionário Aceito",
        message: `${req.name} agora faz parte da equipe como ${ROLE_LABELS[approvedRole]}`,
        type: "sucesso",
        company_id: req.company_id,
        created_at: new Date().toISOString(),
        read: false
      }]);

      await supabase.from('pending_requests').delete().eq('id', requestId);
      setPendingRequests(prev => prev.filter(p => p.id !== requestId));
    }
  };

  const rejectPendingUser = async (requestId: string, _reason: string) => {
    await supabase.from('pending_requests').delete().eq('id', requestId);
    setPendingRequests(prev => prev.filter(p => p.id !== requestId));
  };

  const updateProfile = async (data: Partial<Pick<User, "name" | "bio" | "location" | "avatar">>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("rushy_user", JSON.stringify(updatedUser));
      return true;
    } catch (e: any) {
      console.error("Erro ao atualizar perfil:", e);
      if (e.message?.includes("column") && e.message?.includes("does not exist")) {
        alert("Erro: Algumas colunas (bio, location ou avatar) não existem no seu banco de dados Supabase. Por favor, execute o script SQL de atualização.");
      }
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
        registerCompany,
        registerEmployee,
        updateProfile,
        companies,
        pendingRequests,
        approvePendingUser,
        rejectPendingUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
