import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getImage } from "../utils/api";

const injectStyles = () => {
  if (document.getElementById("solemate-products-style")) return;
  const style = document.createElement("style");
  style.id = "solemate-products-style";
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@700&display=swap');

    .sm-products-root {
      min-height: 100vh;
      background: #f5f5f5;
      font-family: 'DM Sans', sans-serif;
      color: #1a1a1a;
      padding: 0;
      position: relative;
      overflow-x: hidden;
    }

    .sm-products-root::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
      background-size: 60px 60px;
      pointer-events: none;
      z-index: 0;
    }

    .sm-inner { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; padding: 0 28px 80px; }

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
      color: rgba(0,0,0,0.04);
      letter-spacing: -8px;
      pointer-events: none;
      white-space: nowrap;
      line-height: 1;
    }
    .sm-header-label {
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      letter-spacing: 4px;
      color: #1a1a1a;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .sm-header-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 80px;
      letter-spacing: 2px;
      line-height: 0.88;
      margin-bottom: 10px;
      color: #1a1a1a;
    }
    .sm-header-title span {
      -webkit-text-stroke: 1px rgba(0,0,0,0.2);
      color: transparent;
    }
    .sm-header-sub {
      color: rgba(0,0,0,0.4);
      font-size: 13px;
      letter-spacing: 1px;
    }

    .sm-marquee {
      border-top: 1px solid rgba(0,0,0,0.08);
      border-bottom: 1px solid rgba(0,0,0,0.08);
      padding: 13px 0;
      overflow: hidden;
      background: rgba(0,0,0,0.02);
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
      color: rgba(0,0,0,0.3);
      text-transform: uppercase;
      padding-right: 40px;
    }
    .sm-marquee-item em { color: #1a1a1a; font-style: normal; margin-right: 40px; }
    @keyframes smMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

    .sm-search-wrap { margin-bottom: 32px; }
    .sm-search-box {
      display: flex;
      align-items: center;
      background: #fff;
      border: 1.5px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .sm-search-box:focus-within { border-color: #1a1a1a; }
    .sm-search-badge {
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      letter-spacing: 2px;
      color: #fff;
      background: #1a1a1a;
      padding: 5px 10px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .sm-search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #1a1a1a;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      padding: 15px 16px;
      caret-color: #1a1a1a;
    }
    .sm-search-input::placeholder { color: rgba(0,0,0,0.3); font-style: italic; }
    .sm-search-btn {
      background: #1a1a1a;
      color: #e8ff3b;
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
    .sm-search-btn:hover { background: #333; }
    .sm-search-btn:active { transform: scale(0.97); }
    .sm-search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .sm-ai-result {
      margin-top: 12px;
      background: #f8f8f8;
      border: 1px solid #e0e0e0;
      border-left: 3px solid #1a1a1a;
      padding: 16px 20px;
      font-size: 14px;
      line-height: 1.7;
      color: #444;
      white-space: pre-wrap;
      animation: smFadeIn 0.3s ease;
      border-radius: 0 8px 8px 0;
    }
    @keyframes smFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .sm-countbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 28px;
      padding-bottom: 14px;
      border-bottom: 1px solid #e0e0e0;
    }
    .sm-count-text {
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      letter-spacing: 2px;
      color: rgba(0,0,0,0.4);
      text-transform: uppercase;
    }
    .sm-count-text b { color: #1a1a1a; font-weight: 700; }

    .sm-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }

    .sm-card {
      background: #fff;
      cursor: pointer;
      position: relative;
      border-radius: 12px;
      border: 1px solid #eee;
      overflow: hidden;
      animation: smCardUp 0.5s ease both;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .sm-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.1);
    }
    .sm-card::after { display: none; }

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
      height: 260px;
      overflow: hidden;
      background: #f8f8f8;
    }
    .sm-card-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 16px;
      transition: transform 0.55s cubic-bezier(.25,.46,.45,.94);
    }
    .sm-card:hover .sm-card-img { transform: scale(1.07); }

    .sm-card-num {
      position: absolute;
      top: 12px; right: 14px;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 52px;
      color: rgba(0,0,0,0.05);
      line-height: 1;
      pointer-events: none;
    }

    .sm-card-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.06) 0%, transparent 55%);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .sm-card:hover .sm-card-overlay { opacity: 1; }

    .sm-card-cta {
      position: absolute;
      bottom: 14px;
      left: 50%;
      transform: translateX(-50%) translateY(16px);
      background: #1a1a1a;
      color: #e8ff3b;
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
      border-radius: 6px;
      transition: opacity 0.25s, transform 0.25s;
    }
    .sm-card:hover .sm-card-cta {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    .sm-card-info {
      padding: 18px 16px 16px;
      border-top: 1px solid #f0f0f0;
    }
    .sm-card-brand {
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      letter-spacing: 3px;
      color: rgba(0,0,0,0.3);
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .sm-card-name {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 28px;
      letter-spacing: 1px;
      line-height: 1;
      margin-bottom: 10px;
      color: #1a1a1a;
      transition: color 0.2s;
    }
    .sm-card:hover .sm-card-name { color: #444; }
    .sm-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .sm-card-price {
      font-family: 'Space Mono', monospace;
      font-size: 13px;
      font-weight: 700;
      color: #1a1a1a;
    }
    .sm-card-tag {
      font-family: 'Space Mono', monospace;
      font-size: 8px;
      letter-spacing: 2px;
      color: #15803d;
      background: #dcfce7;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .sm-empty {
      text-align: center;
      padding: 80px 20px;
      color: rgba(0,0,0,0.2);
    }
    .sm-empty-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 48px;
      letter-spacing: 2px;
      margin-bottom: 8px;
      color: rgba(0,0,0,0.1);
    }

    .sm-skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }
    .sm-skeleton-card { background: #fff; border-radius: 12px; border: 1px solid #eee; overflow: hidden; }
    .sm-skeleton-img {
      height: 260px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
      background-size: 400% 100%;
      animation: smShimmer 1.4s ease infinite;
    }
    .sm-skeleton-info { padding: 18px 16px; }
    .sm-skeleton-line {
      height: 10px;
      border-radius: 2px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
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

const getBrand = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("nike")) return "Nike";
  if (n.includes("adidas")) return "Adidas";
  if (n.includes("puma")) return "Puma";
  if (n.includes("reebok")) return "Reebok";
  if (n.includes("new balance")) return "New Balance";
  return "Solemate";
};

const MARQUEE_ITEMS = [
  "New Drop", "Premium Kicks", "Free Shipping ₹999+",
  "Authentic Brands", "Heat Certified", "Zero Fake",
];
const MARQUEE_DOUBLED = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    injectStyles();
    API.get("/products/")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async () => {
    console.log("SEARCH CLICKED");

    if (!query.trim()) return;

    setAiLoading(true);
    setAiResult("");

    try {
        console.log("API CALL START");

        const res = await API.post("/ai-search/", { query });

        console.log("API RESPONSE", res);

        setAiResult(res.data.result);
    } catch (err) {
        console.log("FULL ERROR", err);
        console.log("ERROR RESPONSE", err.response);

        setAiResult("Something went wrong. Please try again.");
    } finally {
        setAiLoading(false);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="sm-products-root">
      <div className="sm-inner">
        <div className="sm-header">
          <div className="sm-header-ghost">SOLEMATE</div>
          <div className="sm-header-label">— Collection 2025</div>
          <div className="sm-header-title">ALL <span>KICKS</span></div>
          <div className="sm-header-sub">Premium footwear, zero compromises.</div>
        </div>

        <div className="sm-marquee">
          <div className="sm-marquee-track">
            {MARQUEE_DOUBLED.map((item, i) => (
              <span className="sm-marquee-item" key={i}><em>✦</em>{item}</span>
            ))}
          </div>
        </div>

        <div className="sm-search-wrap">
          <div className="sm-search-box">
            <span className="sm-search-badge">AI SEARCH</span>
            <input
              className="sm-search-input"
              placeholder="e.g. white sneakers under ₹3000..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              className="sm-search-btn"
              onClick={handleSearch}
              disabled={aiLoading}
            >
              {aiLoading ? "..." : "SEARCH"}
            </button>
          </div>
          {aiResult && <div className="sm-ai-result">{aiResult}</div>}
        </div>

        <div className="sm-countbar">
          <span className="sm-count-text">
            <b>{filtered.length}</b> products found
          </span>
        </div>

        {loading ? (
          <div className="sm-skeleton-grid">
            {[...Array(6)].map((_, i) => (
              <div className="sm-skeleton-card" key={i}>
                <div className="sm-skeleton-img" />
                <div className="sm-skeleton-info">
                  <div className="sm-skeleton-line" style={{ width: "40%" }} />
                  <div className="sm-skeleton-line" style={{ width: "70%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="sm-empty">
            <div className="sm-empty-title">NO KICKS</div>
            <div>No products match your search.</div>
          </div>
        ) : (
          <div className="sm-grid">
            {filtered.map((product, i) => (
              <div
                className="sm-card"
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="sm-card-img-wrap">
                  <img
                    className="sm-card-img"
                    src={getImage(product.image)}
                    alt={product.name}
                  />
                  <span className="sm-card-num">0{i + 1}</span>
                  <div className="sm-card-overlay" />
                  <button className="sm-card-cta">VIEW DETAILS</button>
                </div>
                <div className="sm-card-info">
                  <div className="sm-card-brand">{getBrand(product.name)}</div>
                  <div className="sm-card-name">{product.name}</div>
                  <div className="sm-card-footer">
                    <span className="sm-card-price">₹{product.price}</span>
                    <span className="sm-card-tag">IN STOCK</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
