import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { useData } from "@/contexts/DataContext";
import { trpc } from "@/lib/trpc";
import { Sparkles, Bot, MessageSquare, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function AIChat() {
  const { orders, forms, formResponses, stockItems, employees } = useData();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Olá! Eu sou o assistente inteligente da Rushy. Como posso ajudar você hoje? Posso responder sobre seus pedidos, formulários, estoque e muito mais." 
    }
  ]);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response || "Desculpe, não consegui processar sua solicitação.",
        },
      ]);
    },
    onError: (error) => {
      console.error("Erro no chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Ocorreu um erro ao tentar falar com a IA. Por favor, tente novamente mais tarde.",
        },
      ]);
    },
  });

  const handleSendMessage = (content: string) => {
    const newUserMessage: Message = { role: "user", content };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    // Enviar para o backend com o contexto atual
    chatMutation.mutate({
      messages: updatedMessages,
      context: {
        orders,
        forms,
        formResponses,
        stockItems,
        employees,
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
        {/* Header da Página */}
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

            <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground bg-accent/30 p-3 rounded-xl border border-border">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Conectado aos seus dados em tempo real</span>
              </div>
            </div>
          </div>
        </div>

        {/* Área do Chat */}
        <div className="flex-1 overflow-hidden p-4 md:p-6 max-w-5xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full"
          >
            <AIChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={chatMutation.isPending}
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

        {/* Dicas Pro */}
        <div className="px-6 py-3 border-t border-border bg-card/30 text-[11px] text-muted-foreground flex items-center justify-center gap-4">
          <span className="flex items-center gap-1.5">
            <Info className="w-3 h-3" />
            Dica: Você pode pedir para a IA comparar o estoque atual com o mês passado.
          </span>
          <span className="hidden sm:inline opacity-30">|</span>
          <span className="hidden sm:flex items-center gap-1.5">
            <MessageSquare className="w-3 h-3" />
            A IA entende contexto: "E quais deles são urgentes?" após perguntar de pedidos.
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}
