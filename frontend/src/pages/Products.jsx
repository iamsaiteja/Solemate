import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getImage } from "../utils/api";

/* ─── Inject fonts + global styles once ─────────────────────────────── */
const injectStyles = () => {
  if (document.getElementById("solemate-products-style")) return;
  const style = document.createElement("style");
  style.id = "solemate-products-style";
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@700&display=swap');

    .sm-products-root {
      min-height: 100vh;
      background: #080808;
      font-family: 'DM Sans', sans-serif;
      color: #fff;
      padding: 0;
      position: relative;
      overflow-x: hidden;
    }

    /* subtle grid bg */
    .sm-products-root::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,0,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,0,0.025) 1px, transparent 1px);
      background-size: 60px 60px;
      pointer-events: none;
      z-index: 0;
    }

    .sm-inner { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; padding: 0 28px 80px; }

    /* ── PAGE HEADER ── */
    .sm-header {
      padding: 56px 0 36px;
      position: relative;
      overflow: hidden;
    }
    .sm-header-ghost {
      position: absolute;
      top: -20px; left: -8px;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 180px;
      color: rgba(255,255,0,0.04);
      letter-spacing: -8px;
      pointer-events: none;
      white-space: nowrap;
      line-height: 1;
    }
    .sm-header-label {
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      letter-spacing: 4px;
      color: #FFFF00;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .sm-header-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 80px;
      letter-spacing: 2px;
      line-height: 0.88;
      margin-bottom: 10px;
    }
    .sm-header-title span {
      -webkit-text-stroke: 1px rgba(255,255,255,0.25);
      color: transparent;
    }
    .sm-header-sub {
      color: rgba(255,255,255,0.35);
      font-size: 13px;
      letter-spacing: 1px;
    }

    /* ── MARQUEE ── */
    .sm-marquee {
      border-top: 1px solid rgba(255,255,0,0.12);
      border-bottom: 1px solid rgba(255,255,0,0.12);
      padding: 13px 0;
      overflow: hidden;
      background: rgba(255,255,0,0.025);
      margin-bottom: 40px;
    }
    .sm-marquee-track {
      display: flex;
      gap: 0;
      white-space: nowrap;
      animation: smMarquee 22s linear infinite;
    }
    .sm-marquee-item {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 13px;
      letter-spacing: 4px;
      color: rgba(255,255,255,0.25);
      text-transform: uppercase;
      padding-right: 40px;
    }
    .sm-marquee-item em { color: #FFFF00; font-style: normal; margin-right: 40px; }
    @keyframes smMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

    /* ── AI SEARCH ── */
    .sm-search-wrap { margin-bottom: 32px; }
    .sm-search-box {
      display: flex;
      align-items: center;
      background: rgba(255,255,255,0.035);
      border: 1px solid rgba(255,255,0,0.18);
      transition: border-color 0.2s, background 0.2s;
    }
    .sm-search-box:focus-within {
      border-color: #FFFF00;
      background: rgba(255,255,0,0.05);
    }
    .sm-search-badge {
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      letter-spacing: 2px;
      color: #000;
      background: #FFFF00;
      padding: 5px 10px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .sm-search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #fff;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      padding: 15px 16px;
      caret-color: #FFFF00;
    }
    .sm-search-input::placeholder { color: rgba(255,255,255,0.2); font-style: italic; }
    .sm-search-btn {
      background: #FFFF00;
      color: #000;
      border: none;
      padding: 12px 28px;
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      flex-shrink: 0;
    }
    .sm-search-btn:hover { background: #e6e600; }
    .sm-search-btn:active { transform: scale(0.97); }
    .sm-search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .sm-ai-result {
      margin-top: 12px;
      background: rgba(255,255,0,0.06);
      border: 1px solid rgba(255,255,0,0.2);
      border-left: 3px solid #FFFF00;
      padding: 16px 20px;
      font-size: 14px;
      line-height: 1.7;
      color: rgba(255,255,255,0.85);
      white-space: pre-wrap;
      animation: smFadeIn 0.3s ease;
    }
    @keyframes smFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    /* ── COUNT BAR ── */
    .sm-countbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 28px;
      padding-bottom: 14px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .sm-count-text {
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      letter-spacing: 2px;
      color: rgba(255,255,255,0.3);
      text-transform: uppercase;
    }
    .sm-count-text b { color: #FFFF00; font-weight: 700; }

    /* ── GRID ── */
    .sm-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 2px;
    }

    /* ── CARD ── */
    .sm-card {
      background: #111;
      cursor: pointer;
      position: relative;
      animation: smCardUp 0.5s ease both;
      transition: transform 0.3s;
    }
    .sm-card:hover { z-index: 2; }
    .sm-card::after {
      content: '';
      position: absolute;
      inset: 0;
      border: 1px solid transparent;
      pointer-events: none;
      transition: border-color 0.25s;
    }
    .sm-card:hover::after { border-color: rgba(255,255,0,0.45); }

    @keyframes smCardUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .sm-card:nth-child(1) { animation-delay: 0.04s; }
    .sm-card:nth-child(2) { animation-delay: 0.09s; }
    .sm-card:nth-child(3) { animation-delay: 0.14s; }
    .sm-card:nth-child(4) { animation-delay: 0.19s; }
    .sm-card:nth-child(5) { animation-delay: 0.24s; }
    .sm-card:nth-child(6) { animation-delay: 0.29s; }

    .sm-card-img-wrap {
      position: relative;
      height: 280px;
      overflow: hidden;
      background: #161616;
    }
    .sm-card-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 16px;
      transition: transform 0.55s cubic-bezier(.25,.46,.45,.94), filter 0.3s;
      filter: grayscale(15%);
    }
    .sm-card:hover .sm-card-img {
      transform: scale(1.07);
      filter: grayscale(0%);
    }

    .sm-card-num {
      position: absolute;
      top: 12px;
      right: 14px;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 52px;
      color: rgba(255,255,255,0.05);
      line-height: 1;
      pointer-events: none;
    }

    .sm-card-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .sm-card:hover .sm-card-overlay { opacity: 1; }

    .sm-card-cta {
      position: absolute;
      bottom: 14px;
      left: 50%;
      transform: translateX(-50%) translateY(16px);
      background: #FFFF00;
      color: #000;
      border: none;
      padding: 10px 26px;
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      cursor: pointer;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.25s, transform 0.25s;
    }
    .sm-card:hover .sm-card-cta {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    .sm-card-cta:hover { background: #e6e600; }

    .sm-card-info {
      padding: 18px 16px 16px;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .sm-card-brand {
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      letter-spacing: 3px;
      color: rgba(255,255,255,0.28);
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .sm-card-name {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 28px;
      letter-spacing: 1px;
      line-height: 1;
      margin-bottom: 10px;
      transition: color 0.2s;
    }
    .sm-card:hover .sm-card-name { color: #FFFF00; }
    .sm-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .sm-card-price {
      font-family: 'Space Mono', monospace;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
    }
    .sm-card-tag {
      font-family: 'Space Mono', monospace;
      font-size: 8px;
      letter-spacing: 2px;
      color: rgba(255,255,255,0.2);
      text-transform: uppercase;
    }

    /* ── EMPTY STATE ── */
    .sm-empty {
      text-align: center;
      padding: 80px 20px;
      color: rgba(255,255,255,0.2);
    }
    .sm-empty-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 48px;
      letter-spacing: 2px;
      margin-bottom: 8px;
      color: rgba(255,255,255,0.12);
    }

    /* ── LOADING SKELETON ── */
    .sm-skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 2px;
    }
    .sm-skeleton-card { background: #111; }
    .sm-skeleton-img {
      height: 280px;
      background: linear-gradient(90deg, #161616 25%, #1f1f1f 50%, #161616 75%);
      background-size: 400% 100%;
      animation: smShimmer 1.4s ease infinite;
    }
    .sm-skeleton-info { padding: 18px 16px; }
    .sm-skeleton-line {
      height: 10px;
      border-radius: 2px;
      background: linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%);
      background-size: 400% 100%;
      animation: smShimmer 1.4s ease infinite;
      margin-bottom: 10px;
    }
    @keyframes smShimmer {
      0%   { background-position: 100% 0; }
      100% { background-position: -100% 0; }
    }
  `;
  document.head.appendChild(style);
};

/* ── Helper: guess brand from name ──────────────────────────────────── */
const getBrand = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("nike")) return "Nike";
  if (n.includes("adidas")) return "Adidas";
  if (n.includes("puma")) return "Puma";
  if (n.includes("reebok")) return "Reebok";
  if (n.includes("new balance")) return "New Balance";
  return "Solemate";
};

/* ── Marquee content ─────────────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  "New Drop", "Premium Kicks", "Free Shipping ₹999+",
  "Authentic Brands", "Heat Certified", "Zero Fake",
];
const MARQUEE_DOUBLED = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

/* ════════════════════════════════════════════════════════════════════ */
function Products() {
  const navigate = useNavigate();
  const [products, setProducts]   = useState([]);
  const [query, setQuery]         = useState("");
  const [aiResult, setAiResult]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);

  useEffect(() => {
    injectStyles();
    API.get("/products/")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error:", err))
      .finally(() => setFetching(false));
  }, []);

  const handleAiSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAiResult("");
    try {
      const res = await API.post("/products/ai-search/", { query });
      setAiResult(res.data.suggestion);
    } catch (err) {
      setAiResult("Error: " + (err.response?.data?.error || "Something went wrong"));
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAiSearch();
  };

  /* ── RENDER ─────────────────────────────────────────────────────── */
  return (
    <div className="sm-products-root">
      <div className="sm-inner">

        {/* ── PAGE HEADER ── */}
        <div className="sm-header">
          <div className="sm-header-ghost">KICKS</div>
          <div className="sm-header-label">— SS 2025 Collection</div>
          <h1 className="sm-header-title">
            ALL <span>DROPS</span>
          </h1>
          <p className="sm-header-sub">Handpicked. Heat certified. Zero fake.</p>
        </div>

        {/* ── MARQUEE ── */}
        <div className="sm-marquee">
          <div className="sm-marquee-track">
            {MARQUEE_DOUBLED.map((item, i) => (
              <span className="sm-marquee-item" key={i}>
                {item}<em>✦</em>
              </span>
            ))}
          </div>
        </div>

        {/* ── AI SEARCH ── */}
        <div className="sm-search-wrap">
          <div className="sm-search-box">
            <span className="sm-search-badge">⚡ AI SEARCH</span>
            <input
              className="sm-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. comfortable running shoes under ₹5000, red Nike, latest drop..."
            />
            <button
              className="sm-search-btn"
              onClick={handleAiSearch}
              disabled={loading}
            >
              {loading ? "..." : "Ask AI →"}
            </button>
          </div>
          {aiResult && (
            <div className="sm-ai-result">{aiResult}</div>
          )}
        </div>

        {/* ── COUNT BAR ── */}
        <div className="sm-countbar">
          <span className="sm-count-text">
            <b>{fetching ? "—" : products.length.toString().padStart(2, "0")}</b> Products Found
          </span>
        </div>

        {/* ── SKELETON ── */}
        {fetching && (
          <div className="sm-skeleton-grid">
            {[1, 2, 3].map((n) => (
              <div className="sm-skeleton-card" key={n}>
                <div className="sm-skeleton-img" />
                <div className="sm-skeleton-info">
                  <div className="sm-skeleton-line" style={{ width: "40%" }} />
                  <div className="sm-skeleton-line" style={{ width: "70%" }} />
                  <div className="sm-skeleton-line" style={{ width: "30%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PRODUCTS GRID ── */}
        {!fetching && products.length > 0 && (
          <div className="sm-grid">
            {products.map((p, idx) => (
              <div
                className="sm-card"
                key={p.id}
                onClick={() => navigate(`/products/${p.id}`)}
              >
                <div className="sm-card-img-wrap">
                  <img
                    className="sm-card-img"
                    src={getImage(p.image)}
                    alt={p.name}
                  />
                  <div className="sm-card-num">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className="sm-card-overlay" />
                  <button
                    className="sm-card-cta"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/products/${p.id}`);
                    }}
                  >
                    View Details →
                  </button>
                </div>

                <div className="sm-card-info">
                  <div className="sm-card-brand">{getBrand(p.name)}</div>
                  <div className="sm-card-name">{p.name}</div>
                  <div className="sm-card-footer">
                    <span className="sm-card-price">₹{p.price}</span>
                    <span className="sm-card-tag">In Stock</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!fetching && products.length === 0 && (
          <div className="sm-empty">
            <div className="sm-empty-title">No Drops Yet</div>
            <p>Products will appear here once added from the admin panel.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Products;