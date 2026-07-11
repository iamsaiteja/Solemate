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
  ta: {
    settings: "அமைப்புகள்", appearance: "தோற்றம்", themeDesc: "SoleMate எப்படி தோன்ற வேண்டும் எனத் தேர்வு செய்யவும்.",
    light: "லைட்", dark: "டார்க்", auto: "ஆட்டோ", autoSub: "உங்கள் சாதனத்தின்படி",
    language: "மொழி", langDesc: "உங்களுக்கு விருப்பமான மொழியைத் தேர்வு செய்யவும்.",
    account: "கணக்கு", logout: "வெளியேறு", guest: "நீங்கள் உள்நுழையவில்லை.", login: "உள்நுழைய",
  },
  kn: {
    settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", appearance: "ನೋಟ", themeDesc: "SoleMate ಹೇಗೆ ಕಾಣಬೇಕು ಎಂಬುದನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    light: "ಲೈಟ್", dark: "ಡಾರ್ಕ್", auto: "ಆಟೋ", autoSub: "ನಿಮ್ಮ ಸಾಧನದ ಪ್ರಕಾರ",
    language: "ಭಾಷೆ", langDesc: "ನಿಮ್ಮ ನೆಚ್ಚಿನ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    account: "ಖಾತೆ", logout: "ಲಾಗ್ ಔಟ್", guest: "ನೀವು ಲಾಗಿನ್ ಆಗಿಲ್ಲ.", login: "ಲಾಗಿನ್",
  },
  ml: {
    settings: "ക്രമീകരണങ്ങൾ", appearance: "രൂപം", themeDesc: "SoleMate എങ്ങനെ കാണണമെന്ന് തിരഞ്ഞെടുക്കുക.",
    light: "ലൈറ്റ്", dark: "ഡാർക്ക്", auto: "ഓട്ടോ", autoSub: "നിങ്ങളുടെ ഉപകരണം അനുസരിച്ച്",
    language: "ഭാഷ", langDesc: "നിങ്ങളുടെ ഇഷ്ട ഭാഷ തിരഞ്ഞെടുക്കുക.",
    account: "അക്കൗണ്ട്", logout: "ലോഗൗട്ട്", guest: "നിങ്ങൾ ലോഗിൻ ചെയ്തിട്ടില്ല.", login: "ലോഗിൻ",
  },
  mr: {
    settings: "सेटिंग्ज", appearance: "स्वरूप", themeDesc: "SoleMate कसे दिसावे ते निवडा.",
    light: "लाइट", dark: "डार्क", auto: "ऑटो", autoSub: "तुमच्या डिव्हाइसनुसार",
    language: "भाषा", langDesc: "तुमची आवडती भाषा निवडा.",
    account: "खाते", logout: "लॉगआउट", guest: "तुम्ही लॉगिन केलेले नाही.", login: "लॉगिन",
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
    padding: isMobile ? "20px" : "26px",
    height: "100%",
  };
  const sectionIcon = {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "var(--cin-accent)",
    color: "var(--cin-accent-ink)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    flexShrink: 0,
  };
  const sectionTitle = {
    fontFamily: "var(--font-display)",
    fontSize: "26px",
    letterSpacing: "1px",
    color: "var(--cin-text)",
    margin: 0,
    lineHeight: 1,
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
    { key: "ta", label: "தமிழ்", sub: "TA" },
    { key: "kn", label: "ಕನ್ನಡ", sub: "KN" },
    { key: "ml", label: "മലയാളം", sub: "ML" },
    { key: "mr", label: "मराठी", sub: "MR" },
  ];

  const sectionHeader = (icon, title, desc) => (
    <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "6px" }}>
      <div style={sectionIcon}>{icon}</div>
      <div>
        <h2 style={sectionTitle}>{title}</h2>
        <p style={{ color: "var(--cin-muted)", fontSize: "13px", margin: "4px 0 0" }}>{desc}</p>
      </div>
    </div>
  );

  return (
    <PageShell ghost="TUNE" maxWidth={980}>
      {/* HEADER */}
      <Reveal style={{ marginBottom: "30px" }}>
        <span className="cin-label">Personalize</span>
        <h1 className="cin-title" style={{ fontSize: isMobile ? "46px" : "64px" }}>
          {t.settings}
        </h1>
      </Reveal>

      {/* APPEARANCE + LANGUAGE side by side on desktop */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
          alignItems: "stretch",
          marginBottom: "16px",
        }}
      >
        <Reveal delay={60}>
          <div style={card}>
            {sectionHeader("🎨", t.appearance, t.themeDesc)}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginTop: "18px" }}>
              {themeOptions.map((opt) => {
                const active = theme === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setTheme(opt.key)}
                    style={{
                      background: active ? "var(--cin-accent)" : "var(--cin-input-bg)",
                      color: active ? "var(--cin-accent-ink)" : "var(--cin-text)",
                      border: active ? "2px solid var(--cin-accent)" : "1px solid var(--cin-border)",
                      borderRadius: "14px",
                      padding: isMobile ? "16px 8px" : "20px 10px",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all .18s",
                      boxShadow: active ? "0 8px 22px rgba(250, 84, 0, .3)" : "none",
                    }}
                  >
                    <div style={{ fontSize: "26px", marginBottom: "6px" }}>{opt.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: "14px" }}>{opt.label}</div>
                    {opt.sub && <div style={{ fontSize: "10px", opacity: 0.75, marginTop: "2px" }}>{opt.sub}</div>}
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div style={card}>
            {sectionHeader("🌐", t.language, t.langDesc)}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "18px" }}>
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
                      background: active ? "var(--cin-accent)" : "var(--cin-input-bg)",
                      color: active ? "var(--cin-accent-ink)" : "var(--cin-text)",
                      border: active ? "2px solid var(--cin-accent)" : "1px solid var(--cin-border)",
                      borderRadius: "12px",
                      padding: "13px 16px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 600,
                      transition: "all .18s",
                      boxShadow: active ? "0 8px 22px rgba(250, 84, 0, .3)" : "none",
                    }}
                  >
                    <span>{opt.label}</span>
                    <span className="cin-mono" style={{ fontSize: "10px", opacity: 0.75 }}>
                      {active ? "●" : opt.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>

      {/* ACCOUNT */}
      <Reveal delay={180}>
        <div style={{ ...card, height: "auto" }}>
          {sectionHeader("👤", t.account, isLoggedIn ? "" : t.guest)}
          {isLoggedIn ? (
            <div
              style={{
                marginTop: "18px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "50%",
                  background: "var(--cin-accent)",
                  color: "var(--cin-accent-ink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  fontSize: "26px",
                  flexShrink: 0,
                }}
              >
                {(username || "U").charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: "160px" }}>
                <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--cin-text)" }}>{username || "User"}</div>
                {email && <div style={{ fontSize: "13px", color: "var(--cin-muted)", marginTop: "2px" }}>{email}</div>}
              </div>
              <button onClick={logout} className="cin-btn cin-btn-danger">
                {t.logout}
              </button>
            </div>
          ) : (
            <div style={{ marginTop: "16px" }}>
              <button onClick={() => navigate("/login")} className="cin-btn cin-btn-primary">
                {t.login}
              </button>
            </div>
          )}
        </div>
      </Reveal>
    </PageShell>
  );
}

export default Settings;
