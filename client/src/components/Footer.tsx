import React from "react";
import { motion } from "framer-motion";
import { 
  Package, Github, Linkedin, Twitter, 
  Facebook, ArrowRight, Heart
} from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const contactInfo = [
    { label: "Email", value: "rushylogistica@gmail.com", href: "mailto:rushylogistica@gmail.com" },
    { label: "Telefone", value: "+55 (34) 9 9900-8037", href: "tel:+5534999008037" },
    { label: "Localização", value: "Uberaba, MG - Brasil", href: "#" },
    { label: "Horário", value: "07:00 às 19:00", href: "#" },
  ];

  const footerSections = [
    {
      title: "Produto",
      links: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Pedidos", href: "/pedidos" },
        { label: "Estoque", href: "/estoque" },
        { label: "Relatórios", href: "/relatorios" },
      ],
    },
    {
      title: "Empresa",
      links: [
        { label: "Sobre", href: "/" },
        { label: "Blog", href: "/blog" },
        { label: "FAQ", href: "/faq" },
        { label: "Contato", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacidade", href: "/privacy" },
        { label: "Termos", href: "#" },
        { label: "Cookies", href: "/cookies" },
        { label: "Segurança", href: "/security" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Facebook, href: "#", label: "Facebook" },
  ];

  return (
    <footer className="border-t border-white/5 mt-auto" style={{ background: "#0F1117" }}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Package className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>
                Rushy
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Sistema de gestão empresarial completo para otimizar suas operações e aumentar produtividade.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all"
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerSections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-emerald-400 text-sm transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500 transition-all" />
                      {link.label}
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Contato
            </h3>
            <ul className="space-y-3">
              {contactInfo.map((info) => (
                <li key={info.label}>
                  <a
                    href={info.href}
                    className="text-slate-400 hover:text-emerald-400 text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500 transition-all" />
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 font-medium">{info.label}</span>
                      <span className="text-sm">{info.value}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-1 text-slate-500 text-sm">
            <span>© {currentYear} Rushy. Feito com</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500 mx-1" />
            </motion.div>
            <span>por uma equipe apaixonada.</span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Sistema Operacional</span>
          </div>

          <div className="text-slate-500 text-sm">
            v1.0.0 • Todos os direitos reservados
          </div>
        </motion.div>
      </div>

      {/* Decorative Background */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-50 pointer-events-none" />
    </footer>
  );
}
