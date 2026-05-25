import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

const TIMEOUT_DURATION = 20 * 60 * 1000; // 20 minutos em milissegundos

export function InactivityTimeout() {
  const { isAuthenticated, logout } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (isAuthenticated) {
      timerRef.current = setTimeout(() => {
        console.log("Sessão expirada por inatividade.");
        logout();
      }, TIMEOUT_DURATION);
    }
  }, [isAuthenticated, logout]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return;
    }

    // Eventos que reiniciam o timer
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click"
    ];

    // Iniciar o timer na montagem
    resetTimer();

    // Adicionar listeners para cada evento
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Limpeza
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, resetTimer]);

  return null; // Este componente não renderiza nada visualmente
}
