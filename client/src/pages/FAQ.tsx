/**
 * FAQ — Rushy Sistema de Gestão
 * Design: Corporate Precision Dark + Green Accents
 * Perguntas frequentes sobre funcionalidades e interface
 */

import { motion } from "framer-motion";
import { 
  HelpCircle, 
  Package, 
  ShieldCheck, 
  Users, 
  Zap, 
  ArrowLeft,
  MessageCircle,
  Search
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Footer from "@/components/Footer";
import { useState } from "react";

export default function FAQ() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Geral",
      icon: HelpCircle,
      questions: [
        {
          q: "O que é o Rushy?",
          a: "O Rushy é um sistema de gestão operacional completo, focado em otimizar a cadeia de suprimentos, controle de estoque e gestão de equipes em tempo real."
        },
        {
          q: "Como faço para começar?",
          a: "Você pode se cadastrar como uma nova Empresa (tornando-se Gerente) ou solicitar acesso a uma empresa já existente como Funcionário."
        }
      ]
    },
    {
      category: "Acesso e Segurança",
      icon: ShieldCheck,
      questions: [
        {
          q: "Como funciona a aprovação de novos usuários?",
          a: "Ao se cadastrar como funcionário, sua solicitação fica pendente até que o Gerente da empresa a aprove no painel de 'Solicitações'."
        },
        {
          q: "Quais são os níveis de acesso (Roles)?",
          a: "Existem três níveis: Gerente (acesso total), Logística (gestão de pedidos e fornecedores) e Estoque (controle de entrada/saída e inventário)."
        }
      ]
    },
    {
      category: "Funcionalidades",
      icon: Zap,
      questions: [
        {
          q: "Como funciona o alerta de reposição de estoque?",
          a: "O sistema monitora a quantidade mínima definida para cada item. Quando o estoque atinge esse limite, um alerta visual é gerado e a equipe de logística é notificada."
        },
        {
          q: "Posso criar formulários personalizados?",
          a: "Sim, na seção 'Formulários' você pode criar tabelas customizadas ou usar modelos prontos para pedidos, relatórios e inventários."
        },
        {
          q: "O sistema possui leitor de código de barras?",
          a: "Sim, a interface de estoque inclui suporte para leitura de códigos de barras, facilitando a identificação e movimentação de itens."
        }
      ]
    },
    {
      category: "Interface",
      icon: Package,
      questions: [
        {
          q: "Onde visualizo as notificações do sistema?",
          a: "As notificações aparecem no ícone de sino no cabeçalho do Dashboard, informando sobre novos pedidos, aprovações e alertas de estoque."
        },
        {
          q: "A interface é adaptável para dispositivos móveis?",
          a: "Sim, o Rushy possui uma interface responsiva com uma barra lateral retrátil e menus otimizados para tablets e smartphones."
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0F1117" }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5" style={{ background: "rgba(15, 17, 23, 0.95)", backdropFilter: "blur(10px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Package className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-white hidden sm:inline" style={{ fontFamily: "Sora, sans-serif" }}>Rushy</span>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-slate-400 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Central de Ajuda</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-white" 
            style={{ fontFamily: "Sora, sans-serif" }}
          >
            Perguntas Frequentes
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg"
          >
            Tudo o que você precisa saber sobre as funcionalidades e a interface do Rushy.
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-xl mx-auto mt-8"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Busque por uma dúvida..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1C2333] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="flex-1 pb-24 px-4">
        <div className="max-w-3xl mx-auto space-y-12">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((category, idx) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <category.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>
                    {category.category}
                  </h2>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-3">
                  {category.questions.map((item, qIdx) => (
                    <AccordionItem 
                      key={qIdx} 
                      value={`${idx}-${qIdx}`}
                      className="border border-white/5 bg-[#161B27]/50 rounded-xl px-4 overflow-hidden data-[state=open]:border-emerald-500/30 data-[state=open]:bg-[#1C2333] transition-all"
                    >
                      <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline py-4 text-base font-semibold">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-400 text-sm leading-relaxed pb-4">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">Nenhuma pergunta encontrada para sua busca.</p>
            </div>
          )}

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-16 p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-4"
          >
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Ainda tem dúvidas?</h3>
            <p className="text-slate-400">Nossa equipe de suporte está pronta para ajudar você.</p>
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white mt-2">
              Falar com Suporte
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
