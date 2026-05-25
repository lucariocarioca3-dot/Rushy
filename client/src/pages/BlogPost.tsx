/**
 * BlogPost — Rushy Sistema de Gestão
 * Design: Corporate Precision Dark + Green Accents
 * Página de visualização de um artigo do blog
 */

import { motion } from "framer-motion";
import {
  Package,
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Share2
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { BLOG_POSTS } from "@/types/blog";

export default function BlogPost() {
  const [location, navigate] = useLocation();
  
  // Extract post ID from URL
  const postId = location.split("/").pop();
  const post = BLOG_POSTS.find(p => p.id === postId);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#0F1117" }}>
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Artigo não encontrado</h1>
          <p className="text-slate-400">O artigo que você está procurando não existe.</p>
          <Button
            onClick={() => navigate("/blog")}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            Voltar ao Blog
          </Button>
        </div>
      </div>
    );
  }

  // Find related posts
  const relatedPosts = BLOG_POSTS.filter(
    p => p.id !== post.id && p.category === post.category
  ).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0F1117" }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5" style={{ background: "rgba(15, 17, 23, 0.95)", backdropFilter: "blur(10px)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Package className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-white hidden sm:inline" style={{ fontFamily: "Sora, sans-serif" }}>Rushy</span>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/blog")}
            className="text-slate-400 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Blog
          </Button>
        </div>
      </nav>

      {/* Hero Section with Image */}
      <section className="relative pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden border border-white/5"
          >
            <div className="relative w-full aspect-video">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1117] via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="flex-1 px-4 pb-24">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-8 space-y-4"
          >
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {post.category}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 border-b border-white/5 pb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime} min de leitura</span>
              </div>
              <button className="ml-auto p-2 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="prose prose-invert max-w-none"
          >
            <div className="space-y-6 text-slate-300 leading-relaxed">
              {post.content.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('##')) {
                  return (
                    <h2
                      key={idx}
                      className="text-2xl font-bold text-white mt-8 mb-4"
                      style={{ fontFamily: "Sora, sans-serif" }}
                    >
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }
                if (paragraph.startsWith('-')) {
                  return (
                    <ul key={idx} className="space-y-2 ml-4">
                      {paragraph.split('\n').map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-emerald-400 mt-1">•</span>
                          <span>{item.replace('- ', '')}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (paragraph.match(/^\d+\./)) {
                  return (
                    <ol key={idx} className="space-y-2 ml-4 list-decimal">
                      {paragraph.split('\n').map((item, i) => (
                        <li key={i} className="text-slate-300">
                          {item.replace(/^\d+\. /, '')}
                        </li>
                      ))}
                    </ol>
                  );
                }
                return (
                  <p key={idx} className="text-slate-300">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </motion.div>

          {/* Author Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-12 p-6 rounded-2xl border border-white/5 bg-[#161B27]/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{post.author}</h3>
                <p className="text-slate-400 text-sm">Equipe Rushy</p>
              </div>
            </div>
          </motion.div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mt-12 space-y-6"
            >
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "Sora, sans-serif" }}>
                Artigos Relacionados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedPosts.map((relatedPost) => (
                  <div
                    key={relatedPost.id}
                    onClick={() => navigate(`/blog/${relatedPost.id}`)}
                    className="group cursor-pointer rounded-xl border border-white/5 bg-[#161B27]/50 hover:border-emerald-500/30 hover:bg-[#1C2333] transition-all overflow-hidden"
                  >
                    <div className="relative w-full aspect-video overflow-hidden">
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white text-sm mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-xs text-slate-500">{relatedPost.readTime} min de leitura</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-12 p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Sora, sans-serif" }}>
              Pronto para otimizar sua operação?
            </h3>
            <p className="text-slate-400 mb-6">
              Comece a usar o Rushy hoje mesmo e veja a diferença na sua gestão.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Começar Agora
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
