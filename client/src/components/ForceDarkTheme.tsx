import { useEffect } from "react";

/**
 * ForceDarkTheme component
 * When mounted, it forces the 'dark' class on the document element
 * and removes it when unmounted if the global theme is light.
 */
export default function ForceDarkTheme() {
  useEffect(() => {
    const root = document.documentElement;
    const originalClass = root.className;
    
    // Force dark mode
    root.classList.add("dark");
    
    // We don't want to revert if the user actually wants dark mode globally,
    // but the ThemeProvider already handles the global state.
    // This component ensures that even if ThemeProvider removes 'dark', 
    // we put it back for these specific pages.
    
    // To be safe and clean, we can just ensure 'dark' is there.
    // The issue is that ThemeProvider's useEffect might run after this.
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          if (!root.classList.contains("dark")) {
            root.classList.add("dark");
          }
        }
      });
    });

    observer.observe(root, { attributes: true });

    return () => {
      observer.disconnect();
      // Re-evaluate theme based on localStorage/global state
      const storedTheme = localStorage.getItem("theme") || "dark";
      if (storedTheme === "light") {
        root.classList.remove("dark");
      }
    };
  }, []);

  return null;
}
