"use client";
import { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext(undefined);

// Dark mode is locked for the beta version.
export function ThemeProvider({ children }) {
  useEffect(() => {
    // Always force dark mode — lock it and clear any old stored preference
    window.document.documentElement.classList.add("dark");
    localStorage.setItem("acm-theme", "dark");
  }, []);

  // toggleTheme is a no-op in beta (dark mode only)
  const toggleTheme = () => { };
  const setTheme = () => { };

  return (
    <ThemeContext.Provider value={{ theme: "dark", toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
