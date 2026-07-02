import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API, { getImage } from "../utils/api";
import useIsMobile from "../utils/useIsMobile";

const injectStyles = () => {
  if (document.getElementById("solemate-products-style")) return;
  const style = document.createElement("style");
  style.id = "solemate-products-style";
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@700&display=swap');

    .sm-products-root { min-height:100vh; background:transparent; font-family:'DM Sans',sans-serif; color:#1a1a1a; position:relative; overflow-x:hidden; }
    .sm-products-root::before { content:''; position:fixed; inset:0; background-image:linear-gradient(rgba(0,0,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.03) 1px,transparent 1px); background-size:60px 60px; pointer-events:none; z-index:0; }
    .sm-inner { position:relative; z-index:1; max-width:1280px; margin:0 auto; padding:0 28px 80px; }

    .sm-header { padding:56px 0 28px; position:relative; overflow:hidden; }
    .sm-header-ghost { position:absolute; top:-20px; left:-8px; font-family:'Bebas Neue',sans-serif; font-size:180px; color:rgba(0,0,0,0.04); letter-spacing:-8px; pointer-events:none; white-space:nowrap; line-height:1; }
    .sm-header-label { font-family:'Space Mono',monospace; font-size:10px; letter-spacing:4px; color:#1a1a1a; text-transform:uppercase; margin-bottom:10px; }
    .sm-header-title { font-family:'Bebas Neue',sans-serif; font-size:80px; letter-spacing:2px; line-height:0.88; margin-bottom:10px; color:#1a1a1a; }
    .sm-header-title span { color:#c99a52; }
    .sm-header-sub { color:rgba(0,0,0,0.4); font-size:13px; letter-spacing:1px; }

    .sm-search-wrap { margin-bottom:16px; }
    .sm-search-box { display:flex; align-items:center; background:#fff; border:1.5px solid #e0e0e0; border-radius:8px; overflow:hidden; transition:border-color 0.2s; }
    .sm-search-box:focus-within { border-color:#1a1a1a; }
    .sm-search-badge { font-family:'Space Mono',monospace; font-size:9px; letter-spacing:2px; color:#fff; background:#1a1a1a; padding:5px 10px; white-space:nowrap; flex-shrink:0; }
    .sm-search-input { flex:1; background:transparent; border:none; outline:none; color:#1a1a1a; font-family:'DM Sans',sans-serif; font-size:14px; padding:15px 16px; caret-color:#1a1a1a; min-width:0; }
    .sm-search-input::placeholder { color:rgba(0,0,0,0.3); font-style:italic; }
    .sm-search-btn { background:#1a1a1a; color:#e8ff3b; border:none; padding:12px 28px; font-family:'Space Mono',monospace; font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; cursor:pointer; transition:background 0.15s; flex-shrink:0; }
    .sm-search-btn:hover { background:#333; }
    .sm-search-btn:disabled { opacity:0.5; cursor:not-allowed; }
    .sm-ai-result { margin-top:12px; background:#f8f8f8; border:1px solid #e0e0e0; border-left:3px solid #1a1a1a; padding:16px 20px; font-size:14px; line-height:1.7; color:#444; white-space:pre-wrap; border-radius:0 8px 8px 0; }

    .sm-marquee { border-top:1px solid rgba(0,0,0,0.08); border-bottom:1px solid rgba(0,0,0,0.08); padding:13px 0; overflow:hidden; background:rgba(0,0,0,0.02); margin-bottom:22px; }
    .sm-marquee-track { display:flex; white-space:nowrap; animation:smMarquee 22s linear infinite; }
    .sm-marquee-item { font-family:'Bebas Neue',sans-serif; font-size:13px; letter-spacing:4px; color:rgba(0,0,0,0.3); text-transform:uppercase; padding-right:40px; }
    .sm-marquee-item em { color:#1a1a1a; font-style:normal; margin-right:40px; }
    @keyframes smMarquee { 0%{ transform:translateX(0); } 100%{ transform:translateX(-50%); } }

    /* ===== FILTER BAR ===== */
    .sm-filterbar { display:flex; flex-wrap:wrap; gap:10px; align-items:center; background:#fff; border:1px solid #e8e8e8; border-radius:12px; padding:14px 16px; margin-bottom:22px; }
    .sm-filter-group { display:flex; flex-direction:column; gap:4px; }
    .sm-filter-lbl { font-family:'Space Mono',monospace; font-size:8px; letter-spacing:1.5px; color:#999; text-transform:uppercase; }
    .sm-filter-select, .sm-filter-price { border:1px solid #e0e0e0; border-radius:8px; padding:9px 12px; font-family:'DM Sans',sans-serif; font-size:13px; color:#1a1a1a; background:#fafafa; outline:none; cursor:pointer; }
    .sm-filter-price { width:88px; cursor:text; }
    .sm-filter-clear { margin-left:auto; background:none; border:1px solid #e0e0e0; border-radius:8px; padding:9px 16px; font-family:'Space Mono',monospace; font-size:10px; letter-spacing:1px; color:#666; cursor:pointer; text-transform:uppercase; transition:all .15s; }
    .sm-filter-clear:hover { border-color:#1a1a1a; color:#1a1a1a; }

    .sm-chips { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:18px; }
    .sm-chip { display:inline-flex; align-items:center; gap:6px; background:#1a1a1a; color:#e8ff3b; font-family:'Space Mono',monospace; font-size:10px; letter-spacing:1px; padding:6px 12px; border-radius:99px; text-transform:uppercase; }
    .sm-chip button { background:none; border:none; color:#e8ff3b; cursor:pointer; font-size:14px; line-height:1; padding:0; }

    .sm-countbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; padding-bottom:14px; border-bottom:1px solid #e0e0e0; }
    .sm-count-text { font-family:'Space Mono',monospace; font-size:10px; letter-spacing:2px; color:rgba(0,0,0,0.4); text-transform:uppercase; }
    .sm-count-text b { color:#1a1a1a; font-weight:700; }

    .sm-grid { display:grid; gap:16px; }

    .sm-card { background:#fff; cursor:pointer; position:relative; border-radius:12px; border:1px solid #eee; overflow:hidden; transition:transform 0.3s, box-shadow 0.3s; }
    .sm-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(0,0,0,0.1); }

    .sm-card-img-wrap { position:relative; overflow:hidden; background:#f8f8f8; }
    .sm-card-img { width:100%; height:100%; object-fit:contain; padding:16px; transition:transform 0.55s cubic-bezier(.25,.46,.45,.94); }
    .sm-card:hover .sm-card-img { transform:scale(1.07); }

    .sm-card-heart { position:absolute; top:12px; left:12px; width:38px; height:38px; border-radius:50%; background:rgba(255,255,255,0.92); border:1px solid #eee; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:19px; line-height:1; z-index:5; padding:0; transition:transform 0.15s, color 0.2s; }
    .sm-card-heart:hover { transform:scale(1.15); background:#fff; }
    .sm-card-heart.liked { color:#e63946; }
    .sm-card-heart.not-liked { color:#ccc; }

    .sm-card-num { position:absolute; top:12px; right:14px; font-family:'Bebas Neue',sans-serif; font-size:52px; color:rgba(0,0,0,0.05); line-height:1; pointer-events:none; }

    .sm-card-info { padding:16px; border-top:1px solid #f0f0f0; }
    .sm-card-brand { font-family:'Space Mono',monospace; font-size:9px; letter-spacing:3px; color:rgba(0,0,0,0.3); text-transform:uppercase; margin-bottom:4px; }
    .sm-card-name { font-family:'Bebas Neue',sans-serif; font-size:26px; letter-spacing:1px; line-height:1; margin-bottom:10px; color:#1a1a1a; }
    .sm-card-footer { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
    .sm-card-price { font-family:'Space Mono',monospace; font-size:14px; font-weight:700; color:#1a1a1a; }
    .sm-card-tag { font-family:'Space Mono',monospace; font-size:8px; letter-spacing:2px; color:#15803d; background:#dcfce7; padding:3px 8px; border-radius:4px; text-transform:uppercase; }

    .sm-addcart { width:100%; background:#1a1a1a; color:#e8ff3b; border:none; padding:11px; border-radius:8px; font-family:'Space Mono',monospace; font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; cursor:pointer; transition:background .15s, transform .1s; }
    .sm-addcart:hover { background:#000; }
    .sm-addcart:active { transform:scale(.97); }
    .sm-addcart:disabled { opacity:.6; cursor:default; }

    .sm-empty { text-align:center; padding:80px 20px; color:rgba(0,0,0,0.2); grid-column:1/-1; }
    .sm-empty-title { font-family:'Bebas Neue',sans-serif; font-size:48px; letter-spacing:2px; margin-bottom:8px; color:rgba(0,0,0,0.1); }

    .sm-skeleton-img { background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:400% 100%; animation:smShimmer 1.4s ease infinite; }
    .sm-skeleton-line { height:10px; border-radius:2px; background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:400% 100%; animation:smShimmer 1.4s ease infinite; margin-bottom:10px; }
    @keyframes smShimmer { 0%{ background-position:100% 0; } 100%{ background-position:-100% 0; } }

    /* ===== TOAST ===== */
    .sm-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); background:#1a1a1a; color:#fff; padding:14px 24px; border-radius:12px; font-size:14px; font-weight:600; z-index:5000; box-shadow:0 8px 30px rgba(0,0,0,.3); display:flex; align-items:center; gap:10px; animation:smToastUp .3s ease; max-width:90vw; }
    .sm-toast b { color:#e8ff3b; }
    @keyframes smToastUp { from{ opacity:0; transform:translate(-50%,16px); } }
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
  if (n.includes("converse")) return "Converse";
  if (n.includes("under armour")) return "Under Armour";
  if (n.includes("vans")) return "Vans";
  if (n.includes("asics")) return "Asics";
  if (n.includes("skechers")) return "Skechers";
  if (n.includes("jordan")) return "Jordan";
  return "Solemate";
};

// gender description nundi ("Designed for women") — women mundu check (men substring kabatti)
const getGender = (desc = "") => {
  const d = desc.toLowerCase();
  if (d.includes("for women")) return "Women";
  if (d.includes("for men")) return "Men";
  return "Unisex";
};

const MARQUEE_ITEMS = ["New Drop", "Premium Kicks", "Free Shipping", "Authentic Brands", "Heat Certified", "Zero Fake"];
const MARQUEE_DOUBLED = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

function Products() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category"); // men / women / running / jordan ...

  const [products, setProducts] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [query, setQuery] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  // FILTERS
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  // ADD TO CART
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    injectStyles();
    API.get("/products/")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("access")) return;
    API.get("/wishlist/ids/")
      .then((res) => setLikedIds(new Set(res.data.product_ids)))
      .catch((err) => console.error(err));
  }, []);

  const toggleLike = async (e, productId) => {
    e.stopPropagation();
    if (!localStorage.getItem("access")) { navigate("/login"); return; }
    setLikedIds((prev) => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
    try {
      await API.post("/wishlist/toggle/", { product_id: productId });
    } catch (err) {
      console.error(err);
      setLikedIds((prev) => {
        const next = new Set(prev);
        next.has(productId) ? next.delete(productId) : next.add(productId);
        return next;
      });
    }
  };

  // card mida direct add to cart
  const addToCart = async (e, product) => {
    e.stopPropagation();
    if (!localStorage.getItem("access")) { navigate("/login"); return; }
    setAddingId(product.id);
    try {
      await API.post("/cart/add/", { product_id: product.id, quantity: 1 });
      setToast(product.name);
      setTimeout(() => setToast(""), 2200);
    } catch (err) {
      console.error(err);
      setToast("__error__");
      setTimeout(() => setToast(""), 2200);
    } finally {
      setAddingId(null);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setAiLoading(true);
    setAiResult("");
    try {
      const res = await API.post("/products/ai-search/", { query });
      setAiResult(res.data.result);
    } catch (err) {
      setAiResult("Something went wrong. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // URL category match (mega menu links pani cheyyadaniki)
  const matchesUrlCategory = (p) => {
    if (!urlCategory) return true;
    const term = urlCategory.toLowerCase();
    if (term === "men") return getGender(p.description) === "Men";
    if (term === "women") return getGender(p.description) === "Women";
    if (term === "kids") return getGender(p.description) === "Unisex";
    const hay = `${p.name} ${p.category || ""} ${p.description || ""}`.toLowerCase();
    return hay.includes(term);
  };

  // unique brands list (filter dropdown kosam)
  const brands = ["All", ...Array.from(new Set(products.map((p) => getBrand(p.name)))).sort()];

  // motham filter + sort pipeline
  let filtered = products
    .filter(matchesUrlCategory)
    .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    .filter((p) => {
      const pr = parseFloat(p.price);
      const min = priceMin === "" ? 0 : parseFloat(priceMin);
      const max = priceMax === "" ? Infinity : parseFloat(priceMax);
      return pr >= min && pr <= max;
    })
    .filter((p) => brandFilter === "All" || getBrand(p.name) === brandFilter)
    .filter((p) => genderFilter === "All" || getGender(p.description) === genderFilter);

  if (sortBy === "low") filtered = [...filtered].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  if (sortBy === "high") filtered = [...filtered].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

  const clearFilters = () => {
    setPriceMin(""); setPriceMax(""); setBrandFilter("All"); setGenderFilter("All"); setSortBy("default");
    setSearchParams({});
  };

  const hasActiveFilter = urlCategory || priceMin || priceMax || brandFilter !== "All" || genderFilter !== "All" || sortBy !== "default";
  const headerTitle = urlCategory ? urlCategory.toUpperCase() : "ALL";

  const gridCols = isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(260px, 1fr))";
  const imgH = isMobile ? "150px" : "240px";

  return (
    <div className="sm-products-root">
      <div className="sm-inner" style={{ padding: isMobile ? "0 14px 60px" : "0 28px 80px" }}>

        <div className="sm-header" style={{ padding: isMobile ? "80px 0 20px" : "56px 0 28px" }}>
          <div className="sm-header-label">— Collection 2026</div>
          <div className="sm-header-title" style={{ fontSize: isMobile ? "56px" : "80px" }}>
            {headerTitle} <span>KICKS</span>
          </div>
          <div className="sm-header-sub">Premium footwear, zero compromises.</div>
        </div>

        {/* MARQUEE */}
        <div className="sm-marquee">
          <div className="sm-marquee-track">
            {MARQUEE_DOUBLED.map((item, i) => (
              <span className="sm-marquee-item" key={i}><em>✦</em>{item}</span>
            ))}
          </div>
        </div>

        {/* AI SEARCH */}
        <div className="sm-search-wrap">
          <div className="sm-search-box">
            <span className="sm-search-badge">AI SEARCH</span>
            <input className="sm-search-input" placeholder="e.g. white sneakers..." value={query}
              onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
            <button className="sm-search-btn" onClick={handleSearch} disabled={aiLoading}>{aiLoading ? "..." : "SEARCH"}</button>
          </div>
          {aiResult && <div className="sm-ai-result">{aiResult}</div>}
        </div>

        {/* FILTER BAR */}
        <div className="sm-filterbar">
          <div className="sm-filter-group">
            <span className="sm-filter-lbl">Min ₹</span>
            <input className="sm-filter-price" type="number" placeholder="1000" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
          </div>
          <div className="sm-filter-group">
            <span className="sm-filter-lbl">Max ₹</span>
            <input className="sm-filter-price" type="number" placeholder="10000" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
          </div>
          <div className="sm-filter-group">
            <span className="sm-filter-lbl">Brand</span>
            <select className="sm-filter-select" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="sm-filter-group">
            <span className="sm-filter-lbl">Gender</span>
            <select className="sm-filter-select" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
            </select>
          </div>
          <div className="sm-filter-group">
            <span className="sm-filter-lbl">Sort</span>
            <select className="sm-filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">Featured</option>
              <option value="low">Price: Low → High</option>
              <option value="high">Price: High → Low</option>
            </select>
          </div>
          {hasActiveFilter && (
            <button className="sm-filter-clear" onClick={clearFilters}>✕ Clear</button>
          )}
        </div>

        {/* ACTIVE CATEGORY CHIP */}
        {urlCategory && (
          <div className="sm-chips">
            <span className="sm-chip">
              {urlCategory}
              <button onClick={() => setSearchParams({})}>✕</button>
            </span>
          </div>
        )}

        <div className="sm-countbar">
          <span className="sm-count-text"><b>{filtered.length}</b> products found</span>
        </div>

        {loading ? (
          <div className="sm-grid" style={{ gridTemplateColumns: gridCols }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" }}>
                <div className="sm-skeleton-img" style={{ height: imgH }} />
                <div style={{ padding: "16px" }}>
                  <div className="sm-skeleton-line" style={{ width: "40%" }} />
                  <div className="sm-skeleton-line" style={{ width: "70%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="sm-empty">
            <div className="sm-empty-title">NO KICKS</div>
            <div>No products match your filters.</div>
          </div>
        ) : (
          <div className="sm-grid" style={{ gridTemplateColumns: gridCols }}>
            {filtered.map((product, i) => (
              <div className="sm-card" key={product.id} onClick={() => navigate(`/products/${product.id}`)}>
                <div className="sm-card-img-wrap" style={{ height: imgH }}>
                  <img className="sm-card-img" src={getImage(product.image)} alt={product.name} />
                  <button
                    className={`sm-card-heart ${likedIds.has(product.id) ? "liked" : "not-liked"}`}
                    onClick={(e) => toggleLike(e, product.id)} aria-label="Wishlist">
                    {likedIds.has(product.id) ? "♥" : "♡"}
                  </button>
                  {!isMobile && <span className="sm-card-num">{String(i + 1).padStart(2, "0")}</span>}
                </div>
                <div className="sm-card-info">
                  <div className="sm-card-brand">{getBrand(product.name)}</div>
                  <div className="sm-card-name" style={{ fontSize: isMobile ? "20px" : "26px" }}>{product.name}</div>
                  <div className="sm-card-footer">
                    <span className="sm-card-price">₹{parseFloat(product.price || 0).toLocaleString("en-IN")}</span>
                    <span className="sm-card-tag">IN STOCK</span>
                  </div>
                  <button className="sm-addcart" onClick={(e) => addToCart(e, product)} disabled={addingId === product.id}>
                    {addingId === product.id ? "ADDING..." : "＋ ADD TO CART"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TOAST */}
      {toast && (
        <div className="sm-toast">
          {toast === "__error__" ? "⚠ Something went wrong" : <>✓ <b>{toast}</b> added to cart</>}
        </div>
      )}
    </div>
  );
}

export default Products;