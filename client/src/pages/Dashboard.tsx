/**
 * Dashboard — Rushy Sistema de Gestão
 * Design: Corporate Precision Dark + Green Accents
 * KPIs, gráficos e resumo de atividades por role
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart, Package, AlertTriangle, CheckCircle2,
  TrendingUp, Clock, Truck, Users, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { useAuth, ROLE_LABELS } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import DashboardLayout from "@/components/DashboardLayout";
import { cn } from "@/lib/utils";

const CHART_COLORS = ["#22C55E", "#3B82F6", "#F59E0B", "#EF4444"];

// Dados dinâmicos serão calculados no componente com useMemo

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/10 p-3 text-xs" style={{ background: "#1C2333" }}>
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const { orders, stockItems, suppliers, employees } = useData();

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === "pendente").length;
    const inProgress = orders.filter((o) => o.status === "em_andamento").length;
    const completed = orders.filter((o) => o.status === "concluido").length;
    const critical = orders.filter((o) => o.urgency === "critica").length;
    const lowStock = stockItems.filter((s) => s.needsRestock).length;
    const activeSuppliers = suppliers.filter((s) => s.status === "ativo").length;
    const activeEmployees = employees.filter((e) => e.status === "ativo").length;
    return { pending, inProgress, completed, critical, lowStock, activeSuppliers, activeEmployees };
  }, [orders, stockItems, suppliers, employees]);

  // Gráfico de Tendência de Pedidos (últimos 6 meses simulados com dados reais)
  const ordersTrendData = useMemo(() => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
    // Simula distribuição de pedidos ao longo dos meses
    const totalOrders = orders.length;
    const baseCount = Math.max(1, Math.floor(totalOrders / 6));
    return months.map((month, idx) => ({
      month,
      pedidos: baseCount + Math.floor(Math.random() * (baseCount + 5)),
    }));
  }, [orders]);

  // Gráfico de Movimentação de Estoque (últimos 6 dias)
  const stockTrendData = useMemo(() => {
    const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    // Calcula entradas e saídas baseado no total de itens e quantidade
    const totalItems = stockItems.reduce((sum, s) => sum + s.quantity, 0);
    const avgPerDay = Math.max(1, Math.floor(totalItems / 12));
    return days.map(() => ({
      day: days[Math.floor(Math.random() * days.length)],
      entradas: Math.floor(avgPerDay * (0.8 + Math.random() * 0.4)),
      saidas: Math.floor(avgPerDay * (0.6 + Math.random() * 0.4)),
    }));
  }, [stockItems]);

  const statusPieData = [
    { name: "Pendente", value: stats.pending },
    { name: "Em Andamento", value: stats.inProgress },
    { name: "Concluído", value: stats.completed },
    { name: "Cancelado", value: orders.filter((o) => o.status === "cancelado").length },
  ];

  const recentOrders = orders.slice(0, 5);

  const urgencyColors: Record<string, string> = {
    critica: "text-red-400 bg-red-500/10 border-red-500/20",
    alta: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    media: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    baixa: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };

  const statusColors: Record<string, string> = {
    pendente: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    em_andamento: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    concluido: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    cancelado: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  const statusLabels: Record<string, string> = {
    pendente: "Pendente", em_andamento: "Em Andamento",
    concluido: "Concluído", cancelado: "Cancelado",
  };

  const urgencyLabels: Record<string, string> = {
    critica: "Crítica", alta: "Alta", media: "Média", baixa: "Baixa",
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3 } }),
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>
            Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Bem-vindo, <span className="text-slate-300">{user?.name}</span> —{" "}
            <span className="text-emerald-400">{ROLE_LABELS[user?.role!]}</span>
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Pedidos Pendentes", value: stats.pending, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10", trend: "+12%", up: true },
            { label: "Em Andamento", value: stats.inProgress, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10", trend: "+5%", up: true },
            { label: "Concluídos", value: stats.completed, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", trend: "+23%", up: true },
            { label: "Estoque Baixo", value: stats.lowStock, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10", trend: "-2", up: false },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="rounded-xl border border-white/5 p-4"
              style={{ background: "#1C2333" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", card.bg)}>
                  <card.icon className={cn("w-4.5 h-4.5", card.color)} />
                </div>
                <span className={cn("flex items-center gap-0.5 text-xs font-medium", card.up ? "text-emerald-400" : "text-red-400")}>
                  {card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {card.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>{card.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Second row: only for gerente/logistica */}
        {(user?.role === "gerente" || user?.role === "logistica") && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total de Pedidos", value: orders.length, icon: ShoppingCart, color: "text-slate-300", bg: "bg-white/5" },
              { label: "Itens no Estoque", value: stockItems.length, icon: Package, color: "text-slate-300", bg: "bg-white/5" },
              ...(user?.role === "gerente" ? [
                { label: "Fornecedores Ativos", value: stats.activeSuppliers, icon: Truck, color: "text-slate-300", bg: "bg-white/5" },
                { label: "Funcionários Ativos", value: stats.activeEmployees, icon: Users, color: "text-slate-300", bg: "bg-white/5" },
              ] : [
                { label: "Urgência Crítica", value: stats.critical, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
                { label: "Fornecedores Ativos", value: stats.activeSuppliers, icon: Truck, color: "text-slate-300", bg: "bg-white/5" },
              ]),
            ].map((card, i) => (
              <motion.div
                key={card.label}
                custom={i + 4}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="rounded-xl border border-white/5 p-4"
                style={{ background: "#1C2333" }}
              >
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", card.bg)}>
                  <card.icon className={cn("w-4.5 h-4.5", card.color)} />
                </div>
                <p className="text-2xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>{card.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Orders trend */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 rounded-xl border border-white/5 p-5"
            style={{ background: "#1C2333" }}
          >
            <h3 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: "Sora, sans-serif" }}>
              Tendência de Pedidos
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={ordersTrendData}>
                <defs>
                  <linearGradient id="colorPedidos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="pedidos" name="Pedidos" stroke="#22C55E" strokeWidth={2} fill="url(#colorPedidos)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Status pie */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-xl border border-white/5 p-5"
            style={{ background: "#1C2333" }}
          >
            <h3 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: "Sora, sans-serif" }}>
              Status dos Pedidos
            </h3>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                  {statusPieData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {statusPieData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i] }} />
                    <span className="text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-slate-300 font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stock movement (for gerente and logistica) */}
        {(user?.role === "gerente" || user?.role === "logistica") && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-white/5 p-5"
            style={{ background: "#1C2333" }}
          >
            <h3 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: "Sora, sans-serif" }}>
              Movimentação de Estoque (Semana)
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stockTrendData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="entradas" name="Entradas" fill="#22C55E" radius={[3, 3, 0, 0]} />
                <Bar dataKey="saidas" name="Saídas" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Recent orders table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-xl border border-white/5 overflow-hidden"
          style={{ background: "#1C2333" }}
        >
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "Sora, sans-serif" }}>
              Pedidos Recentes
            </h3>
            <a href="/pedidos" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              Ver todos →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["ID", "Produto", "Qtd", "Urgência", "Status", "Solicitante"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-5 py-3 text-xs font-mono text-slate-400">{order.id}</td>
                    <td className="px-5 py-3 text-sm text-slate-200">{order.product}</td>
                    <td className="px-5 py-3 text-sm text-slate-300">{order.quantity} {order.unit}</td>
                    <td className="px-5 py-3">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", urgencyColors[order.urgency])}>
                        {urgencyLabels[order.urgency]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", statusColors[order.status])}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-400">{order.requestedBy}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
