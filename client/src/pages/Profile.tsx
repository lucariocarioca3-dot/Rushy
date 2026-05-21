import React, { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth, ROLE_LABELS, ROLE_COLORS, ROLE_DOT_COLORS } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, Mail, Building2, MapPin, 
  Camera, Save, X, ShieldCheck, 
  Calendar, Info, Edit2, Trash2, AlertTriangle, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    avatar: user?.avatar || ""
  });

  if (!user) return null;

  const handleSave = async () => {
    setLoading(true);
    const success = await updateProfile(formData);
    setLoading(false);
    
    if (success) {
      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
    } else {
      toast.error("Erro ao atualizar perfil. Tente novamente.");
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Por favor, insira sua senha para confirmar.");
      return;
    }

    setIsDeleting(true);
    const result = await deleteAccount(deletePassword);
    setIsDeleting(false);

    if (result.success) {
      toast.success("Sua conta foi excluída com sucesso.");
    } else {
      toast.error(result.message || "Erro ao excluir conta.");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>Meu Perfil</h1>
            <p className="text-slate-400 mt-1 text-sm">Gerencie suas informações pessoais e configurações de conta.</p>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name,
                      bio: user.bio || "",
                      location: user.location || "",
                      avatar: user.avatar || ""
                    });
                  }}
                  className="border-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar Alterações
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Editar Perfil
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/5 bg-[#161B27] p-8 text-center"
            >
              <div className="relative inline-block group">
                <Avatar className={cn(
                  "w-32 h-32 border-4 border-[#0F1117] shadow-2xl transition-all",
                  isEditing && "cursor-pointer"
                )} onClick={handleAvatarClick}>
                  <AvatarImage src={formData.avatar} alt="Avatar do usuário" />
                  <AvatarFallback className="bg-slate-800 text-3xl font-bold text-white">
                    {user.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <Camera className="text-white w-8 h-8" />
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </div>

              <h2 className="text-xl font-bold text-white mt-4">{user.name}</h2>
              <div className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mt-2 uppercase tracking-wider",
                ROLE_COLORS[user.role as any] || ROLE_COLORS.gerente
              )}>
                <div className={cn("w-2 h-2 rounded-full", ROLE_DOT_COLORS[user.role as any] || ROLE_DOT_COLORS.gerente)} />
                {ROLE_LABELS[user.role as any] || "Usuário"}
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm">{user.company}</span>
                </div>
                {user.location && (
                  <div className="flex items-center gap-3 text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{user.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </motion.div>

            <div className="rounded-2xl border border-white/5 bg-[#161B27] p-6 space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Segurança da Conta
              </div>
              <p className="text-xs text-slate-500">
                Sua conta está protegida. Você faz parte da empresa <span className="text-emerald-400 font-medium">{user.company}</span> com nível de acesso <span className="text-emerald-400 font-medium">{ROLE_LABELS[user.role as any] || "Usuário"}</span>.
              </p>
              
              <div className="pt-4 border-t border-white/5">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir minha conta
                </Button>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/5 bg-[#161B27] p-8 space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">Nome Completo</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                    <Input 
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      className="bg-[#0F1117] border-white/10 text-white pl-10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                      placeholder="Seu nome"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-slate-300">Localização</Label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                    <Input 
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      className="bg-[#0F1117] border-white/10 text-white pl-10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                      placeholder="Cidade, Estado"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-slate-300">Biografia</Label>
                <Textarea 
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  className="bg-[#0F1117] border-white/10 text-white min-h-[120px] focus:border-emerald-500/50 focus:ring-emerald-500/20 resize-none"
                  placeholder="Conte um pouco sobre você e seu papel na empresa..."
                />
              </div>

              <div className="pt-6 border-t border-white/5">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <Info className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-emerald-400">Informações da Conta</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Seu e-mail e empresa estão vinculados ao seu cadastro principal e não podem ser alterados diretamente. 
                      Entre em contato com o administrador se precisar atualizar esses dados.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#161B27] border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-red-400 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Excluir Conta</h3>
              </div>
              
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Esta ação é <span className="text-white font-bold">permanente</span> e não pode ser desfeita. Todos os seus dados pessoais serão removidos do sistema.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" **className="text-slate-300 text-xs uppercase tracking-wider"**>
                    Confirme sua senha para continuar
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input 
                      id="confirm-password"
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Sua senha atual"
                      className="bg-[#0F1117] border-white/10 text-white pl-10 focus:border-red-500/50 focus:ring-red-500/20"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword("");
                    }}
                    className="flex-1 border-white/10 text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || !deletePassword}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white gap-2"
                  >
                    {isDeleting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Excluir Conta
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
