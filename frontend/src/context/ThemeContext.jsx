import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext(null);

const getSystemTheme = () =>
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem("theme") || "auto");
  const [language, setLanguageState] = useState(() => localStorage.getItem("language") || "en");

  const [resolvedTheme, setResolvedTheme] = useState(() =>
    (localStorage.getItem("theme") || "auto") === "auto" ? getSystemTheme() : (localStorage.getItem("theme") || "light")
  );

  // global CSS variables + SEASIDE gradient background (all pages)
  useEffect(() => {
    if (document.getElementById("sm-theme-vars")) return;
    const s = document.createElement("style");
    s.id = "sm-theme-vars";
    s.innerHTML = `
      :root, [data-theme="light"] {
        --bg:transparent; --surface:#ffffff; --text:#1a1a1a; --muted:#777;
        --border:#e7e2d8; --accent:#e8ff3b; --accent-ink:#1a1a1a;
        --page-gradient: linear-gradient(165deg, #d9edf6 0%, #e8f3ee 30%, #f6f1e6 66%, #f1e6d3 100%);
      }
      [data-theme="dark"] {
        --bg:transparent; --surface:#161b24; --text:#f2f4f7; --muted:#9aa4b2;
        --border:#252d3a; --accent:#e8ff3b; --accent-ink:#1a1a1a;
        --page-gradient: linear-gradient(165deg, #0a1622 0%, #0e1c2b 46%, #14273b 100%);
      }
      body {
        background: var(--page-gradient);
        background-attachment: fixed;
        transition: background .4s ease, color .3s ease;
      }
    `;
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    const apply = () => {
      const r = theme === "auto" ? getSystemTheme() : theme;
      setResolvedTheme(r);
      document.documentElement.setAttribute("data-theme", r);
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => { if (theme === "auto") apply(); };
    if (mq.addEventListener) mq.addEventListener("change", listener);
    else mq.addListener(listener);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", listener);
      else mq.removeListener(listener);
    };
  }, [theme]);

  const setTheme = useCallback((t) => { setThemeState(t); localStorage.setItem("theme", t); }, []);
  const setLanguage = useCallback((l) => { setLanguageState(l); localStorage.setItem("language", l); }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, language, setLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);