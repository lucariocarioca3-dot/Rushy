import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { useData } from "@/contexts/DataContext";
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
            resumo: {
              total_pedidos: orders?.length || 0,
              total_formularios: forms?.length || 0,
              total_respostas_formularios: formResponses?.length || 0,
              total_itens_estoque: stockItems?.length || 0,
              total_funcionarios: employees?.length || 0,
            },
            // Otimizado: enviamos apenas o essencial para economizar tokens e evitar erro de cota
            pedidos: orders?.slice(0, 5).map(o => ({
              id: o.id,
              cli: o.customer,
              prod: o.product,
              qtd: o.quantity,
              st: o.status,
              dt: o.date
            })),
            estoque: stockItems?.filter(i => i.needsRestock).slice(0, 5).map(i => ({
              n: i.name,
              q: i.quantity,
              u: i.unit
            })),
            funcionarios: employees?.slice(0, 3).map(e => ({
              n: e.name,
              r: e.role
            })),
            formularios: forms?.slice(0, 3).map(f => ({
              t: f.title,
              s: f.status
            }))
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
