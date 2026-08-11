import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { useData } from "@/contexts/DataContext";
import { Sparkles, Bot, MessageSquare, Info, Wrench } from "lucide-react";
import { motion } from "framer-motion";

export default function AIChat() {
  const { orders, forms, formResponses, stockItems, employees, suppliers } = useData();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Olá! Eu sou o assistente inteligente da Rushy. Como posso ajudar você hoje? Posso responder sobre seus pedidos, formulários, estoque e muito mais." 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    const newUserMessage: Message = { role: "user", content };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Chamada direta para o novo endpoint de API (contornando o tRPC e erro 405)
      const response = await fetch("/api/chat-ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          context: {
            // Contexto completo (somente leitura) com campos comprimidos
            // para caber no limite de 12.000 TPM do Groq free tier
            p: orders?.map(o => [o.customer, o.product, o.quantity, o.unit, o.status, o.date, o.total, o.urgency, o.requestedBy, o.comments]) || [],
            e: stockItems?.map(i => [i.name, i.category, i.quantity, i.minQuantity, i.unit, i.needsRestock, i.location]) || [],
            f: employees?.map(e => [e.name, e.role, e.department, e.joinDate, e.status]) || [],
            s: suppliers?.map(s => [s.name, s.contact, s.category, s.status]) || [],
            fm: forms?.map(f => [f.title, f.status, f.createdBy, f.postedAt]) || []
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.text || "Desculpe, não consegui processar sua solicitação.",
          },
        ]);
      } else {
        throw new Error(data.error || "Erro desconhecido na API");
      }
    } catch (error: any) {
      console.error("Erro no chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Erro: ${error.message}. Por favor, tente novamente.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
        <div className="px-6 py-6 border-b border-border bg-card/30 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Bot className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                  Chat Inteligente
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-emerald-500/20">
                    IA Beta
                  </span>
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Consulte dados, peça resumos e tire dúvidas sobre sua operação.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Banner de Manutenção */}
        <div className="mx-4 mt-4 md:mx-6 md:mt-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                Recurso em manutenção
              </p>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">
                O assistente inteligente está temporariamente indisponível. Estamos trabalhando para melhorá-lo. Volte em breve!
              </p>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 overflow-hidden p-4 md:p-6 max-w-5xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full"
          >
            <AIChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              height="100%"
              placeholder="Pergunte algo como 'Quantos pedidos pendentes eu tenho?'"
              emptyStateMessage="Como posso ajudar com sua logística hoje?"
              suggestedPrompts={[
                "Quantos pedidos pendentes eu tenho?",
                "Quantos formulários tem?",
                "Resuma os formulários postados",
                "Como está a situação do meu estoque?",
                "Quais funcionários estão ativos?"
              ]}
              className="border-border shadow-xl bg-card/50 backdrop-blur-md overflow-hidden rounded-2xl"
            />
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
