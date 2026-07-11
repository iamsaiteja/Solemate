import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext(null);

const getSystemTheme = () =>
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

// One-time migration: themes saved before the cinematic redesign ("auto"/"light")
// would render the new pages washed-out; reset once to the new dark default.
// Users can still pick light/auto again in Settings afterwards.
if (typeof window !== "undefined" && !localStorage.getItem("sm_theme_v2")) {
  localStorage.setItem("sm_theme_v2", "1");
  localStorage.setItem("theme", "dark");
}

export function ThemeProvider({ children }) {
  // Cinematic dark is the brand default; "auto"/"light" remain selectable in Settings.
  const [theme, setThemeState] = useState(() => localStorage.getItem("theme") || "dark");
  const [language, setLanguageState] = useState(() => localStorage.getItem("language") || "en");

  const [resolvedTheme, setResolvedTheme] = useState(() =>
    (localStorage.getItem("theme") || "dark") === "auto" ? getSystemTheme() : (localStorage.getItem("theme") || "dark")
  );

  // global CSS variables + SEASIDE gradient background (all pages)
  useEffect(() => {
    if (document.getElementById("sm-theme-vars")) return;
    const s = document.createElement("style");
    s.id = "sm-theme-vars";
    s.innerHTML = `
      :root, [data-theme="dark"] {
        --bg:transparent; --surface:#14141d; --text:#f4f4f7; --muted:#9aa0ad;
        --border:#23232e; --accent:#fa5400; --accent-ink:#ffffff;
        --page-gradient: linear-gradient(165deg, #0a0a0e 0%, #101018 55%, #14141d 100%);
      }
      [data-theme="light"] {
        --bg:transparent; --surface:#ffffff; --text:#17171b; --muted:#777;
        --border:#e2ded2; --accent:#fa5400; --accent-ink:#ffffff;
        --page-gradient: linear-gradient(165deg, #f6f4ee 0%, #efece3 55%, #e7e4da 100%);
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