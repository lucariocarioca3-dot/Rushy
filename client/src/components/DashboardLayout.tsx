import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Users, Package, ShoppingCart, 
  Truck, ClipboardList, FileBarChart, LogOut, 
  Menu, X, Bell, Search, ChevronLeft, ChevronRight,
  UserPlus, AlertTriangle, Info, CheckCircle
} from "lucide-react";
import { useAuth, ROLE_LABELS, ROLE_COLORS, ROLE_DOT_COLORS } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Footer from "./Footer";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { notifications, markNotificationAsRead } = useData();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  if (!user) return null;

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", roles: ["admin", "gerente", "logistica", "estoque"] },
    { icon: ShoppingCart, label: "Pedidos", path: "/pedidos", roles: ["admin", "gerente", "logistica"] },
    { icon: Package, label: "Estoque", path: "/estoque", roles: ["admin", "gerente", "estoque"] },
    { icon: Truck, label: "Fornecedores", path: "/fornecedores", roles: ["admin", "gerente"] },
    { icon: Users, label: "Funcionários", path: "/funcionarios", roles: ["admin", "gerente"] },
    { icon: UserPlus, label: "Solicitações", path: "/solicitacoes", roles: ["admin", "gerente"] },
    { icon: ClipboardList, label: "Formulários", path: "/formularios", roles: ["admin", "gerente", "logistica", "estoque"] },
    { icon: FileBarChart, label: "Relatórios", path: "/relatorios", roles: ["admin", "gerente"] },
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(user.role));
  const unreadCount = notifications.filter(n => !n.read).length;

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6">
      <div 
        className={cn("px-6 mb-8 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity", collapsed && "px-4 justify-center")}
        onClick={() => window.location.href = "/"}
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <Package className="text-white w-5 h-5" />
        </div>
        {!collapsed && <span className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>Rushy</span>}
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {allowedItems.map((item) => {
          const active = location === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                active 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <item.icon className={cn("w-5 h-5", active ? "text-emerald-400" : "group-hover:text-white")} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              {active && !collapsed && (
                <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-5 bg-emerald-500 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 mt-auto pt-6 border-t border-white/5">
        <Link to="/perfil" className={cn("flex items-center gap-3 px-3 py-4 rounded-xl bg-white/5 border border-white/5 mb-4 hover:bg-white/10 transition-colors cursor-pointer", collapsed && "px-2 justify-center")}>
          <Avatar className="w-8 h-8 border border-white/10 flex-shrink-0">
            {user.avatar && <AvatarImage src={user.avatar} alt="Avatar" />}
            <AvatarFallback className="bg-slate-700 text-white text-xs font-bold">
              {user.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border mt-0.5", ROLE_COLORS[user.role as any] || ROLE_COLORS.gerente)}>
                <div className={cn("w-1.5 h-1.5 rounded-full", ROLE_DOT_COLORS[user.role as any] || ROLE_DOT_COLORS.gerente)} />
                {ROLE_LABELS[user.role as any] || "Administrador"}
              </div>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className={cn(
            "w-full mt-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors",
            collapsed ? "px-2 justify-center" : "justify-start gap-2"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="text-xs">Sair</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0F1117" }}>
      <motion.aside
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden lg:flex flex-col flex-shrink-0 border-r border-white/5 relative"
        style={{ background: "#161B27" }}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden flex flex-col border-r border-white/5"
              style={{ background: "#161B27" }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-white/5 flex-shrink-0" style={{ background: "#0F1117" }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/5 w-64">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className={cn(
                  "relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors",
                  showNotifs && "text-white bg-white/5"
                )}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full" />
                )}
              </button>

              <AnimatePresence>
                {showNotifs && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
                      style={{ background: "#1C2333" }}
                    >
                      <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Notificações</h3>
                        {unreadCount > 0 && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {unreadCount} novas
                          </span>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="w-8 h-8 text-slate-600 mx-auto mb-3 opacity-20" />
                            <p className="text-sm text-slate-500">Nenhuma notificação</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => markNotificationAsRead(n.id)}
                              className={cn(
                                "p-4 border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer relative group",
                                !n.read && "bg-emerald-500/[0.02]"
                              )}
                            >
                              <div className="flex gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                  n.type === 'alerta' ? "bg-red-500/10 text-red-400" : 
                                  n.type === 'sucesso' ? "bg-emerald-500/10 text-emerald-400" : 
                                  "bg-blue-500/10 text-blue-400"
                                )}>
                                  {n.type === 'alerta' ? <AlertTriangle className="w-4 h-4" /> : 
                                   n.type === 'sucesso' ? <CheckCircle className="w-4 h-4" /> : 
                                   <Info className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={cn("text-sm font-medium mb-0.5", n.read ? "text-slate-300" : "text-white")}>
                                    {n.title}
                                  </p>
                                  <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                                  <p className="text-[10px] text-slate-600 mt-2 uppercase tracking-tight">
                                    {new Date(n.createdAt).toLocaleString('pt-BR')}
                                  </p>
                                </div>
                                {!n.read && (
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5" />
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-3 border-t border-white/5 text-center">
                        <button className="text-xs text-slate-500 hover:text-white transition-colors">
                          Ver todas as notificações
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <Link to="/perfil">
              <Avatar className="w-8 h-8 border border-white/10 hover:ring-2 hover:ring-emerald-500/50 transition-all cursor-pointer">
                {user.avatar && <AvatarImage src={user.avatar} alt="Avatar" />}
                <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white text-xs font-semibold">
                  {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto flex flex-col">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1"
          >
            {children}
          </motion.div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
