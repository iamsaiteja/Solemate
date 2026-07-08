import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import useIsMobile from "../utils/useIsMobile";
import PageShell from "../components/ui/PageShell";
import Reveal from "../components/ui/Reveal";
import "../styles/cinematic.css";

// chinna i18n — Settings page text different languages lo
const T = {
  en: {
    settings: "Settings", appearance: "Appearance", themeDesc: "Choose how SoleMate looks.",
    light: "Light", dark: "Dark", auto: "Auto", autoSub: "Follows your device",
    language: "Language", langDesc: "Pick your preferred language.",
    account: "Account", logout: "Logout", guest: "You are not logged in.", login: "Login",
  },
  te: {
    settings: "సెట్టింగ్స్", appearance: "రూపం", themeDesc: "SoleMate ఎలా కనిపించాలో ఎంచుకోండి.",
    light: "లైట్", dark: "డార్క్", auto: "ఆటో", autoSub: "మీ డివైస్ ప్రకారం",
    language: "భాష", langDesc: "మీ ఇష్టమైన భాషను ఎంచుకోండి.",
    account: "ఖాతా", logout: "లాగౌట్", guest: "మీరు లాగిన్ అవ్వలేదు.", login: "లాగిన్",
  },
  hi: {
    settings: "सेटिंग्स", appearance: "रूप", themeDesc: "चुनें SoleMate कैसा दिखे।",
    light: "लाइट", dark: "डार्क", auto: "ऑटो", autoSub: "आपके डिवाइस के अनुसार",
    language: "भाषा", langDesc: "अपनी पसंदीदा भाषा चुनें।",
    account: "खाता", logout: "लॉगआउट", guest: "आप लॉग इन नहीं हैं।", login: "लॉगिन",
  },
};

function Settings() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme, setTheme, language, setLanguage } = useTheme();
  const t = T[language] || T.en;

  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");
  const isLoggedIn = !!localStorage.getItem("access");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const card = {
    background: "var(--cin-glass)",
    backdropFilter: "blur(18px) saturate(140%)",
    WebkitBackdropFilter: "blur(18px) saturate(140%)",
    border: "1px solid var(--cin-border)",
    borderRadius: "18px",
    boxShadow: "var(--cin-shadow-soft)",
    padding: isMobile ? "18px" : "24px",
    marginBottom: "16px",
  };
  const sectionLabel = {
    fontFamily: "Space Mono, monospace",
    fontSize: "10px",
    letterSpacing: "2px",
    color: "var(--muted)",
    textTransform: "uppercase",
    marginBottom: "4px",
  };
  const sectionTitle = {
    fontFamily: "Bebas Neue, sans-serif",
    fontSize: "26px",
    letterSpacing: "1px",
    color: "var(--text)",
    margin: "0 0 4px",
  };

  const themeOptions = [
    { key: "light", icon: "☀️", label: t.light, sub: "" },
    { key: "dark", icon: "🌙", label: t.dark, sub: "" },
    { key: "auto", icon: "🌗", label: t.auto, sub: t.autoSub },
  ];
  const langOptions = [
    { key: "en", label: "English", sub: "EN" },
    { key: "te", label: "తెలుగు", sub: "TE" },
    { key: "hi", label: "हिंदी", sub: "HI" },
  ];

  return (
    <PageShell ghost="TUNE" maxWidth={760}>
      <div>

        {/* HEADER */}
        <Reveal style={{ marginBottom: "28px" }}>
          <span className="cin-label">Personalize</span>
          <h1 className="cin-title" style={{ fontSize: isMobile ? "46px" : "64px" }}>
            {t.settings}
          </h1>
        </Reveal>

        {/* APPEARANCE */}
        <div style={card}>
          <span style={sectionLabel}>{t.appearance}</span>
          <h2 style={sectionTitle}>{t.appearance}</h2>
          <p style={{ color: "var(--muted)", fontSize: "13px", margin: "0 0 18px" }}>{t.themeDesc}</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            {themeOptions.map((opt) => {
              const active = theme === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setTheme(opt.key)}
                  style={{
                    background: active ? "var(--accent)" : "var(--bg)",
                    color: active ? "var(--accent-ink)" : "var(--text)",
                    border: active ? "2px solid var(--accent)" : "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: isMobile ? "16px 8px" : "20px 10px",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all .18s",
                  }}
                >
                  <div style={{ fontSize: "26px", marginBottom: "6px" }}>{opt.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>{opt.label}</div>
                  {opt.sub && <div style={{ fontSize: "10px", opacity: 0.7, marginTop: "2px" }}>{opt.sub}</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* LANGUAGE */}
        <div style={card}>
          <span style={sectionLabel}>{t.language}</span>
          <h2 style={sectionTitle}>{t.language}</h2>
          <p style={{ color: "var(--muted)", fontSize: "13px", margin: "0 0 18px" }}>{t.langDesc}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {langOptions.map((opt) => {
              const active = language === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setLanguage(opt.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: active ? "var(--accent)" : "var(--bg)",
                    color: active ? "var(--accent-ink)" : "var(--text)",
                    border: active ? "2px solid var(--accent)" : "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "14px 18px",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: 600,
                    transition: "all .18s",
                  }}
                >
                  <span>{opt.label}</span>
                  <span style={{ fontFamily: "Space Mono, monospace", fontSize: "11px", opacity: 0.7 }}>
                    {active ? "● ACTIVE" : opt.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACCOUNT */}
        <div style={card}>
          <span style={sectionLabel}>{t.account}</span>
          <h2 style={sectionTitle}>{t.account}</h2>
          {isLoggedIn ? (
            <div style={{ marginTop: "10px" }}>
              <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--text)" }}>{username || "User"}</div>
              {email && <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "2px" }}>{email}</div>}
              <button
                onClick={logout}
                className="cin-btn cin-btn-danger"
                style={{ marginTop: "16px" }}
              >
                {t.logout}
              </button>
            </div>
          ) : (
            <div style={{ marginTop: "10px" }}>
              <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "14px" }}>{t.guest}</p>
              <button
                onClick={() => navigate("/login")}
                className="cin-btn cin-btn-primary"
              >
                {t.login}
              </button>
            </div>
          )}
        </div>

      </div>
    </PageShell>
  );
}

export default Settings;