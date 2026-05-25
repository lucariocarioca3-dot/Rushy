/**
 * Blog — Rushy Sistema de Gestão
 * Design: Corporate Precision Dark + Green Accents
 * Mini blog com artigos sobre dicas, segurança e novidades
 */

import { motion } from "framer-motion";
import {
  Package,
  ArrowLeft,
  Calendar,
  User,
  Clock,
  ArrowRight,
  Search
} from "lucide-react";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { BLOG_POSTS } from "@/types/blog";

const CATEGORIES = ["Todos", "Dicas", "Segurança", "Novidades", "Sucesso"];

export default function Blog() {
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [search, setSearch] = useState("");

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => {
      const matchCategory = selectedCategory === "Todos" || post.category === selectedCategory;
      const matchSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, search]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0F1117" }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5" style={{ background: "rgba(15, 17, 23, 0.95)", backdropFilter: "blur(10px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Package className="text-foreground w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-foreground hidden sm:inline" style={{ fontFamily: "Sora, sans-serif" }}>Rushy</span>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground hover:bg-white/5"
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
            <span className="text-sm font-medium text-emerald-400">📝 Blog</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-foreground"
            style={{ fontFamily: "Sora, sans-serif" }}
          >
            Blog Rushy
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            Dicas, novidades e histórias sobre gestão operacional e logística
          </motion.p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="px-4 pb-12">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar artigos..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/10 bg-white/5 text-foreground placeholder-slate-500 outline-none focus:border-emerald-500/50 transition-colors"
            />
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2"
          >
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-emerald-600 text-foreground border border-emerald-500"
                    : "bg-white/5 text-muted-foreground border border-white/10 hover:border-white/20 hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="flex-1 px-4 pb-24">
        <div className="max-w-3xl mx-auto">
          {filteredPosts.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              className="space-y-6"
            >
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={itemVariants}
                  onClick={() => navigate(`/blog/${post.id}`)}
                  className="group cursor-pointer rounded-2xl border border-white/5 bg-[#161B27]/50 hover:border-emerald-500/30 hover:bg-[#1C2333] transition-all overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
                    {/* Image */}
                    <div className="md:col-span-1">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {post.category}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-emerald-400 transition-colors" style={{ fontFamily: "Sora, sans-serif" }}>
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-t border-white/5 pt-4">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{post.readTime} min de leitura</span>
                        </div>
                        <div className="ml-auto">
                          <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground text-lg">Nenhum artigo encontrado com esses critérios.</p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer forceDark />
    </div>
  );
}
