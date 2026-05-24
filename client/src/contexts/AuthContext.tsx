import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { comparePassword, hashPassword } from "../lib/passwordUtils";

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
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  deleteAccount: (password: string) => Promise<{ success: boolean; message?: string }>;
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

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*, login_attempts, lockout_until')
        .eq('email', email)
        .single();

      if (error || !data) {
        return { success: false, message: "Credenciais inválidas" };
      }

      // Verificar se a conta está bloqueada
      if (data.lockout_until && new Date(data.lockout_until) > new Date()) {
        const remainingTime = Math.ceil((new Date(data.lockout_until).getTime() - new Date().getTime()) / 60000);
        return { success: false, message: `Conta bloqueada. Tente novamente em ${remainingTime} minutos.` };
      }

      // Verificar senha (suporta texto puro para usuários antigos e hash para novos)
      let isPasswordCorrect = false;
      let needsMigration = false;

      try {
        // Usar o utilitário de comparação segura
        isPasswordCorrect = await comparePassword(password, data.password);
        
        // Se não é hash bcrypt, marcar para migração
        if (isPasswordCorrect && data.password && !data.password.startsWith('$2')) {
          needsMigration = true;
        }
      } catch (e) {
        console.error('Erro ao comparar senha no login:', e);
        // Fallback: comparação direta
        isPasswordCorrect = data.password === password;
        if (isPasswordCorrect && data.password && !data.password.startsWith('$2')) {
          needsMigration = true;
        }
      }

      if (isPasswordCorrect) {
        // Se a senha estava em texto puro, migra para hash agora
        if (needsMigration) {
          try {
            const newHash = await hashPassword(password);
            await supabase
              .from('users')
              .update({ password: newHash })
              .eq('id', data.id);
            console.log("Senha migrada para hash com sucesso.");
          } catch (e) {
            console.error("Erro ao migrar senha para hash:", e);
          }
        }
        // Resetar tentativas em caso de sucesso (tenta atualizar, mas não bloqueia o login se falhar)
        try {
          await supabase
            .from('users')
            .update({ login_attempts: 0, lockout_until: null })
            .eq('id', data.id);
        } catch (e) {
          console.warn("Aviso: Não foi possível resetar tentativas de login. Verifique se as colunas existem.", e);
        }

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
        return { success: true };
      } else {
        // Incrementar tentativas em caso de falha
        const newAttempts = (data.login_attempts || 0) + 1;
        const updateData: any = { login_attempts: newAttempts };
        
        if (newAttempts >= 5) {
          const lockoutTime = new Date();
          lockoutTime.setMinutes(lockoutTime.getMinutes() + 15);
          updateData.lockout_until = lockoutTime.toISOString();
          updateData.login_attempts = 0; // Resetar após bloquear
        }

        try {
          const { error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', data.id);
          
          if (updateError) {
            console.error("Erro do Supabase ao atualizar tentativas:", updateError);
            // Se o erro for que a coluna não existe, ainda queremos mostrar a tentativa para o usuário
            // mesmo que não consigamos persistir no banco agora
            if (updateError.code === '42703') {
              console.warn("Colunas de segurança (login_attempts/lockout_until) não encontradas no banco.");
            }
          }
        } catch (e) {
          console.error("Erro ao atualizar tentativas de login:", e);
        }

        if (newAttempts >= 5) {
          return { success: false, message: "Muitas tentativas. Sua conta foi bloqueada por 15 minutos por segurança." };
        }
        
        const remaining = 5 - newAttempts;
        return { 
          success: false, 
          message: `Senha incorreta. Você tem mais ${remaining} ${remaining === 1 ? 'tentativa' : 'tentativas'} antes do bloqueio.` 
        };
      }
    } catch (e) {
      console.error("Erro no login:", e);
      return { success: false, message: "Erro ao realizar login" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("rushy_user");
    window.location.href = "/login";
  };

  const deleteAccount = async (password: string): Promise<{ success: boolean; message?: string }> => {
    if (!user) return { success: false, message: "Usuário não autenticado" };

    try {
      // 1. Verificar senha
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('password, company_id')
        .eq('id', user.id)
        .single();

      if (userError || !userData) return { success: false, message: "Erro ao verificar usuário" };

      let isPasswordCorrect = false;
      try {
        // Usar o utilitário de comparação segura
        isPasswordCorrect = await comparePassword(password, userData.password);
      } catch (e) {
        console.error('Erro ao comparar senha na exclusão:', e);
        // Fallback: comparação direta
        isPasswordCorrect = userData.password === password;
      }

      if (!isPasswordCorrect) {
        return { success: false, message: "Senha incorreta" };
      }

      // 2. Verificar se o usuário é criador de uma empresa
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('created_by', user.id)
        .single();

      if (companyData) {
        // Se o usuário criou uma empresa, apagar TUDO da empresa
        const companyId = companyData.id;
        
        try {
          // Apagar todos os dados da empresa em cascata
          // 1. Apagar respostas de formulários (se a tabela existir)
          try {
            await supabase.from('form_responses').delete().eq('company_id', companyId);
          } catch (e) {
            console.warn('Tabela form_responses pode não existir, continuando...', e);
          }
          
          // 2. Apagar formulários
          await supabase.from('forms').delete().eq('company_id', companyId);
          
          // 3. Apagar pedidos
          await supabase.from('orders').delete().eq('company_id', companyId);
          
          // 4. Apagar itens de estoque
          await supabase.from('stock_items').delete().eq('company_id', companyId);
          
          // 5. Apagar fornecedores
          await supabase.from('suppliers').delete().eq('company_id', companyId);
          
          // 6. Apagar funcionários
          await supabase.from('employees').delete().eq('company_id', companyId);
          
          // 7. Apagar solicitações pendentes
          await supabase.from('pending_requests').delete().eq('company_id', companyId);
          
          // 8. Apagar notificações da empresa
          await supabase.from('notifications').delete().eq('company_id', companyId);
          
          // 9. Apagar todos os usuários da empresa
          await supabase.from('users').delete().eq('company_id', companyId);
          
          // 10. Apagar a empresa
          await supabase.from('companies').delete().eq('id', companyId);
          
          console.log("Empresa e todos os dados associados foram apagados com sucesso.");
        } catch (e) {
          console.error("Erro ao apagar dados da empresa:", e);
          return { success: false, message: "Erro ao apagar dados da empresa. Tente novamente." };
        }
      } else {
        // Se o usuário é apenas um membro da empresa, apagar notificações pessoais e registro na tabela de funcionários
        // Os dados operacionais (formulários, pedidos, estoque) permanecem na empresa
        try {
          // 1. Apagar notificações do usuário
          await supabase.from('notifications').delete().eq('user_id', user.id);
          
          // 2. Apagar registro na tabela de funcionários (para que não apareça mais na aba de funcionários)
          await supabase.from('employees').delete().eq('email', user.email).eq('company_id', user.companyId);
          
          console.log("Perfil do usuário e registro de funcionário foram removidos.");
        } catch (e) {
          console.warn("Aviso: Erro ao apagar dados vinculados, mas prosseguindo com a exclusão da conta.", e);
        }
      }

      // 3. Excluir o usuário
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (deleteError) {
        console.error("Erro detalhado na exclusão:", deleteError);
        // Retornar a mensagem de erro detalhada do banco para diagnóstico
        return { 
          success: false, 
          message: `Erro do Banco: ${deleteError.message} (Detalhe: ${deleteError.details || 'Nenhum'})`
        };
      }

      logout();
      return { success: true };
    } catch (e: any) {
      console.error("Erro ao excluir conta:", e);
      return { success: false, message: e.message || "Erro inesperado ao excluir conta" };
    }
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

    const hashedPassword = await hashPassword(password);
    const { error: userError } = await supabase.from('users').insert([{
      id: userId,
      name: userName,
      email,
      password: hashedPassword,
      role: "gerente",
      company: name,
      company_id: companyId,
      status: "ativo",
      created_at: new Date().toISOString()
      // Removido login_attempts: 0 para evitar erro se a coluna não existir
    }]);

    if (userError) {
      console.error("Erro ao criar usuário:", userError);
      throw userError;
    }

    if (!userError) {
      await loadInitialData();
      return login(email, password);
    }
    return false;
  };

  const registerEmployee = async (email: string, password: string, userName: string, companyId: string, requestedRole: Role): Promise<boolean> => {
    try {
      const id = `REQ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const hashedPassword = await hashPassword(password);
      const { error: requestError } = await supabase.from('pending_requests').insert([{
        id,
        name: userName,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
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

      const { error: insertError } = await supabase.from('users').insert([{
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

      if (insertError) {
        console.error("Erro ao aprovar usuário:", insertError);
        return;
      }

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
        deleteAccount,
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
