/**
 * App.tsx — Rushy Sistema de Gestão
 * Design: Corporate Precision Dark + Green Accents
 * Roteamento com proteção por roles: gerente | logistica | estoque
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ForceDarkTheme from "./components/ForceDarkTheme";
import { InactivityTimeout } from "./components/InactivityTimeout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth, Role } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Pedidos from "./pages/Pedidos";
import Formularios from "./pages/Formularios";
import Estoque from "./pages/Estoque";
import Relatorios from "./pages/Relatorios";
import Fornecedores from "./pages/Fornecedores";
import Funcionarios from "./pages/Funcionarios";
import Solicitacoes from "./pages/Solicitacoes";
import Profile from "./pages/Profile";
import Configuracoes from "./pages/Configuracoes";
import Unauthorized from "./pages/Unauthorized";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import Security from "./pages/Security";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AIChat from "./pages/AIChat";

// Route guard component
function ProtectedRoute({
  component: Component,
  allowedRoles,
}: {
  component: React.ComponentType;
  allowedRoles: Role[];
}) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0F1117" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Unauthorized />;
  }

  return <Component />;
}

function AuthRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0F1117" }}>
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/">
        <ForceDarkTheme />
        <Home />
      </Route>
      <Route path="/faq">
        <ForceDarkTheme />
        <FAQ />
      </Route>
      <Route path="/contact">
        <ForceDarkTheme />
        <Contact />
      </Route>
      <Route path="/privacy">
        <ForceDarkTheme />
        <Privacy />
      </Route>
      <Route path="/cookies">
        <ForceDarkTheme />
        <Cookies />
      </Route>
      <Route path="/security">
        <ForceDarkTheme />
        <Security />
      </Route>
      <Route path="/blog">
        <ForceDarkTheme />
        <Blog />
      </Route>
      <Route path="/blog/:id">
        <ForceDarkTheme />
        <BlogPost />
      </Route>
      <Route path="/login">
        <ForceDarkTheme />
        <AuthRoute component={Login} />
      </Route>
      <Route path="/register">
        <ForceDarkTheme />
        <AuthRoute component={Register} />
      </Route>

      {/* All roles */}
      <Route path="/dashboard" component={() => (
        <ProtectedRoute component={Dashboard} allowedRoles={["gerente", "logistica", "estoque"]} />
      )} />
      <Route path="/pedidos" component={() => (
        <ProtectedRoute component={Pedidos} allowedRoles={["gerente", "logistica", "estoque"]} />
      )} />
      <Route path="/formularios" component={() => (
        <ProtectedRoute component={Formularios} allowedRoles={["gerente", "logistica", "estoque"]} />
      )} />
      <Route path="/estoque" component={() => (
        <ProtectedRoute component={Estoque} allowedRoles={["gerente", "logistica", "estoque"]} />
      )} />

      {/* Gerente + Logística only */}
      <Route path="/relatorios" component={() => (
        <ProtectedRoute component={Relatorios} allowedRoles={["gerente", "logistica"]} />
      )} />
      <Route path="/fornecedores" component={() => (
        <ProtectedRoute component={Fornecedores} allowedRoles={["gerente", "logistica"]} />
      )} />

      {/* Gerente only */}
      <Route path="/funcionarios" component={() => (
        <ProtectedRoute component={Funcionarios} allowedRoles={["gerente"]} />
      )} />
      <Route path="/solicitacoes" component={() => (
        <ProtectedRoute component={Solicitacoes} allowedRoles={["gerente"]} />
      )} />
      <Route path="/perfil" component={() => (
        <ProtectedRoute component={Profile} allowedRoles={["gerente", "logistica", "estoque"]} />
      )} />
      <Route path="/configuracoes" component={() => (
        <ProtectedRoute component={Configuracoes} allowedRoles={["gerente", "logistica", "estoque"]} />
      )} />
      <Route path="/chat" component={() => (
        <ProtectedRoute component={AIChat} allowedRoles={["gerente", "logistica", "estoque"]} />
      )} />

      {/* Fallback */}
      <Route component={() => <Redirect to="/dashboard" />} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable={true}>
        <AuthProvider>
          <DataProvider>
            <TooltipProvider>
              <Toaster position="bottom-right" theme="dark" />
              <InactivityTimeout />
              <Router />
            </TooltipProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
