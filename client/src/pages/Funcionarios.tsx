/**
 * Funcionários — Rushy Sistema de Gestão
 * Gerenciamento de equipe: cadastro, roles e status
 * Acesso: Gerente (acesso completo)
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, X, Save, Users, Crown, Truck, Boxes, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { useData, Employee } from "@/contexts/DataContext";
import { ROLE_LABELS, ROLE_COLORS, Role } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ROLE_ICONS: Record<Role, React.ComponentType<{ className?: string }>> = {
  gerente: Crown, logistica: Truck, estoque: Boxes,
};

interface EmployeeForm {
  name: string; email: string; role: Role;
  department: string; joinDate: string; status: "ativo" | "inativo";
}

const emptyForm: EmployeeForm = {
  name: "", email: "", role: "estoque",
  department: "Estoque", joinDate: new Date().toISOString().split("T")[0], status: "ativo",
};

export default function Funcionarios() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, createNotification } = useData();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<Role | "todos">("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);

  const filtered = useMemo(() =>
    employees.filter((e) => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = filterRole === "todos" || e.role === filterRole;
      return matchSearch && matchRole;
    }), [employees, search, filterRole]);

  const openCreate = () => {
    setEditingEmployee(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setForm({ name: employee.name, email: employee.email, role: employee.role, department: employee.department, joinDate: employee.joinDate, status: employee.status });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Informe o nome"); return; }
    if (!form.email.trim()) { toast.error("Informe o e-mail"); return; }

    // Verificar duplicidade de e-mail
    const isDuplicate = employees.some(
      (emp) => emp.email.toLowerCase() === form.email.toLowerCase() && emp.id !== editingEmployee?.id
    );
    if (isDuplicate) {
      toast.error("Este e-mail já está cadastrado para outro funcionário");
      return;
    }

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, form);
      toast.success("Funcionário atualizado!");
      createNotification(
        "Funcionário Atualizado",
        `Os dados de ${form.name} foram atualizados no sistema`,
        "info"
      );
    } else {
      addEmployee(form);
      toast.success("Funcionário cadastrado!");
      createNotification(
        "Novo Funcionário",
        `${form.name} foi adicionado como ${ROLE_LABELS[form.role as keyof typeof ROLE_LABELS]}`,
        "sucesso"
      );
    }
    setModalOpen(false);
  };

  const handleDelete = (emp: Employee) => {
    if (confirm(`Tem certeza que deseja demitir ${emp.name}? Esta ação não pode ser desfeita.`)) {
      deleteEmployee(emp.id);
      toast.success(`${emp.name} foi removido do sistema`);
      createNotification(
        "Funcionário Removido",
        `${emp.name} foi removido do sistema`,
        "alerta"
      );
    }
  };

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter((e) => e.status === "ativo").length,
    gerentes: employees.filter((e) => e.role === "gerente").length,
    logistica: employees.filter((e) => e.role === "logistica").length,
    estoque: employees.filter((e) => e.role === "estoque").length,
  }), [employees]);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Sora, sans-serif" }}>
              Funcionários
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {stats.active} ativos de {stats.total} cadastrados
            </p>
          </div>
          <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-500 text-foreground gap-2 shadow-lg shadow-emerald-500/20">
            <Plus className="w-4 h-4" /> Novo Funcionário
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, icon: Users, color: "text-foreground", bg: "bg-white/5" },
            { label: "Gerentes", value: stats.gerentes, icon: Crown, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Logística", value: stats.logistica, icon: Truck, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Estoque", value: stats.estoque, icon: Boxes, color: "text-yellow-400", bg: "bg-yellow-500/10" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/5 p-4"
              style={{ background: "#1C2333" }}
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", s.bg)}>
                <s.icon className={cn("w-4.5 h-4.5", s.color)} />
              </div>
              <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "Sora, sans-serif" }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/5 flex-1 min-w-48">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="bg-transparent text-sm text-foreground placeholder-slate-600 outline-none w-full"
            />
          </div>
          <div className="flex gap-2">
            {(["todos", "gerente", "logistica", "estoque"] as const).map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-medium border transition-all",
                  filterRole === role
                    ? role === "todos" ? "bg-white/10 text-foreground border-white/20" : cn(ROLE_COLORS[role as Role])
                    : "text-muted-foreground border-white/5 hover:border-white/10"
                )}
              >
                {role === "todos" ? "Todos" : ROLE_LABELS[role as Role]}
              </button>
            ))}
          </div>
        </div>

        {/* Employees table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-white/5 overflow-hidden"
          style={{ background: "#1C2333" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Funcionário", "Cargo", "Departamento", "Ingresso", "Status", "Ações"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground text-sm">
                      Nenhum funcionário encontrado
                    </td>
                  </tr>
                ) : filtered.map((emp, i) => {
                  const RoleIcon = ROLE_ICONS[emp.role as keyof typeof ROLE_ICONS] || Crown;
                  return (
                    <motion.tr
                      key={emp.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 + i * 0.04 }}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center border border-white/10 flex-shrink-0">
                            <span className="text-foreground text-xs font-semibold">
                              {emp.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{emp.name}</p>
                            <p className="text-xs text-muted-foreground">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border", ROLE_COLORS[emp.role as keyof typeof ROLE_COLORS] || ROLE_COLORS.gerente)}>
                          <RoleIcon className="w-3 h-3" />
                          {ROLE_LABELS[emp.role as keyof typeof ROLE_LABELS] || "Administrador"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{emp.department}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{emp.joinDate}</td>
                      <td className="px-5 py-3.5">
                        {emp.status === "ativo" ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full w-fit">
                            <CheckCircle2 className="w-3 h-3" /> Ativo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full w-fit">
                            <XCircle className="w-3 h-3" /> Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(emp)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl"
            style={{ background: "#1C2333" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "Sora, sans-serif" }}>
                {editingEmployee ? "Editar Funcionário" : "Novo Funcionário"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Nome Completo", key: "name", placeholder: "Nome do funcionário" },
                { label: "E-mail", key: "email", placeholder: "email@rushy.com" },
                { label: "Departamento", key: "department", placeholder: "Ex: Logística" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
                  <input
                    value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder-slate-600 text-sm outline-none focus:border-emerald-500/50"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Cargo</label>
                  <select
                    value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:border-emerald-500/50"
                    style={{ background: "#1C2333" }}
                  >
                    <option value="gerente">Gerente</option>
                    <option value="logistica">Logística</option>
                    <option value="estoque">Estoque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Status</label>
                  <select
                    value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:border-emerald-500/50"
                    style={{ background: "#1C2333" }}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Data de Ingresso</label>
                <input
                  type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1 text-muted-foreground hover:text-foreground border border-white/10">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-foreground gap-2">
                <Save className="w-4 h-4" /> Salvar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
