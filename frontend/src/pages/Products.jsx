import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API, { getImage } from "../utils/api";
import useIsMobile from "../utils/useIsMobile";
import PageShell from "../components/ui/PageShell";
import Reveal from "../components/ui/Reveal";
import Tilt from "../components/ui/Tilt";
import Footer from "../components/ui/Footer";
import "../styles/cinematic.css";

const injectStyles = () => {
  if (document.getElementById("solemate-products-style")) return;
  const style = document.createElement("style");
  style.id = "solemate-products-style";
  style.innerHTML = `
    .sm-header { padding:26px 0 28px; position:relative; overflow:hidden; }
    .sm-header-title { font-family:var(--font-display); font-size:80px; letter-spacing:2px; line-height:0.88; margin:10px 0; color:var(--cin-text); }
    .sm-header-title span { color:var(--cin-accent); }

    .sm-search-wrap { margin-bottom:16px; }
    .sm-search-box { display:flex; align-items:center; background:var(--cin-glass); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); border:1px solid var(--cin-border); border-radius:14px; overflow:hidden; transition:border-color .2s, box-shadow .2s; }
    .sm-search-box:focus-within { border-color:var(--cin-accent); box-shadow:0 0 0 3px var(--cin-glow); }
    .sm-search-badge { font-family:'Space Mono',monospace; font-size:9px; letter-spacing:2px; color:var(--cin-accent-ink); background:var(--cin-accent); padding:6px 10px; margin-left:10px; border-radius:6px; white-space:nowrap; flex-shrink:0; }
    .sm-search-input { flex:1; background:transparent; border:none; outline:none; color:var(--cin-text); font-family:var(--font-body); font-size:14px; padding:16px; caret-color:var(--cin-accent); min-width:0; }
    .sm-search-input::placeholder { color:var(--cin-faint); font-style:italic; }
    .sm-search-btn { background:var(--cin-accent); color:var(--cin-accent-ink); border:none; padding:13px 28px; margin-right:6px; border-radius:10px; font-family:'Space Mono',monospace; font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; cursor:pointer; transition:transform .15s, box-shadow .2s; flex-shrink:0; }
    .sm-search-btn:hover { transform:translateY(-1px); box-shadow:0 8px 22px rgba(232,255,59,.3); }
    .sm-search-btn:disabled { opacity:0.5; cursor:not-allowed; }
    .sm-ai-result { margin-top:12px; background:var(--cin-surface); border:1px solid var(--cin-border); border-left:3px solid var(--cin-accent); padding:16px 20px; font-size:14px; line-height:1.7; color:var(--cin-muted); white-space:pre-wrap; border-radius:0 12px 12px 0; }
    .sm-ai-note { margin-top:12px; display:flex; gap:14px; align-items:flex-start; background:var(--cin-glass); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); border:1px solid var(--cin-border); border-radius:14px; padding:16px 20px; animation:smNoteUp .35s ease; }
    .sm-ai-note-icon { width:38px; height:38px; flex-shrink:0; border-radius:12px; background:var(--cin-accent); color:var(--cin-accent-ink); display:flex; align-items:center; justify-content:center; font-size:19px; }
    .sm-ai-note-title { font-family:var(--font-display); font-size:18px; letter-spacing:1px; color:var(--cin-text); margin:0 0 3px; }
    .sm-ai-note-body { font-size:13px; line-height:1.7; color:var(--cin-muted); margin:0; }
    @keyframes smNoteUp { from{ opacity:0; transform:translateY(8px); } }

    .sm-filterbar { display:flex; flex-wrap:wrap; gap:10px; align-items:center; background:var(--cin-glass); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); border:1px solid var(--cin-border); border-radius:14px; padding:14px 16px; margin-bottom:22px; }
    .sm-filter-group { display:flex; flex-direction:column; gap:4px; }
    .sm-filter-lbl { font-family:'Space Mono',monospace; font-size:8px; letter-spacing:1.5px; color:var(--cin-faint); text-transform:uppercase; }
    .sm-filter-select, .sm-filter-price { border:1px solid var(--cin-border); border-radius:10px; padding:9px 12px; font-family:var(--font-body); font-size:13px; color:var(--cin-text); background:var(--cin-input-bg); outline:none; cursor:pointer; transition:border-color .2s; }
    .sm-filter-select option { background:var(--cin-bg-1); color:var(--cin-text); }
    .sm-filter-select:focus, .sm-filter-price:focus { border-color:var(--cin-accent); }
    .sm-filter-price { width:88px; cursor:text; }
    .sm-filter-clear { margin-left:auto; background:none; border:1px solid var(--cin-border); border-radius:10px; padding:9px 16px; font-family:'Space Mono',monospace; font-size:10px; letter-spacing:1px; color:var(--cin-muted); cursor:pointer; text-transform:uppercase; transition:all .15s; }
    .sm-filter-clear:hover { border-color:var(--cin-accent); color:var(--cin-accent); }

    .sm-chips { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:18px; }

    .sm-countbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; padding-bottom:14px; border-bottom:1px solid var(--cin-border); }
    .sm-count-text { font-family:'Space Mono',monospace; font-size:10px; letter-spacing:2px; color:var(--cin-faint); text-transform:uppercase; }
    .sm-count-text b { color:var(--cin-accent); font-weight:700; }

    .sm-grid { display:grid; gap:18px; }

    .sm-card { background:var(--cin-glass); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); cursor:pointer; position:relative; border-radius:18px; border:1px solid var(--cin-border); overflow:hidden; }

    .sm-card-img-wrap { position:relative; overflow:hidden; background:var(--cin-img-bg); }
    .sm-card-img { width:100%; height:100%; object-fit:contain; padding:16px; filter:drop-shadow(0 16px 18px rgba(0,0,0,.35)); transition:transform 0.55s cubic-bezier(.25,.46,.45,.94); }
    .sm-card:hover .sm-card-img { transform:scale(1.07) rotate(-2deg); }

    .sm-card-heart { position:absolute; top:12px; left:12px; width:38px; height:38px; border-radius:50%; background:var(--cin-glass-strong); border:1px solid var(--cin-border); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:19px; line-height:1; z-index:5; padding:0; transition:transform 0.15s, color 0.2s; }
    .sm-card-heart:hover { transform:scale(1.15); }
    .sm-card-heart.liked { color:#ff5a7a; }
    .sm-card-heart.not-liked { color:var(--cin-faint); }

    .sm-card-num { position:absolute; top:12px; right:14px; font-family:var(--font-display); font-size:52px; color:var(--cin-ghost); line-height:1; pointer-events:none; }

    .sm-card-info { padding:16px; border-top:1px solid var(--cin-border); }
    .sm-card-brand { font-family:'Space Mono',monospace; font-size:9px; letter-spacing:3px; color:var(--cin-faint); text-transform:uppercase; margin-bottom:4px; }
    .sm-card-name { font-family:var(--font-display); font-size:26px; letter-spacing:1px; line-height:1; margin-bottom:10px; color:var(--cin-text); }
    .sm-card-footer { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
    .sm-card-price { font-family:'Space Mono',monospace; font-size:14px; font-weight:700; color:var(--cin-accent); }

    .sm-addcart { width:100%; background:var(--cin-accent); color:var(--cin-accent-ink); border:none; padding:12px; border-radius:10px; font-family:'Space Mono',monospace; font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; cursor:pointer; transition:transform .12s, box-shadow .2s; }
    .sm-addcart:hover { transform:translateY(-1px); box-shadow:0 8px 22px rgba(232,255,59,.25); }
    .sm-addcart:active { transform:scale(.97); }
    .sm-addcart:disabled { opacity:.6; cursor:default; }

    .sm-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); background:var(--cin-glass-strong); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); border:1px solid var(--cin-border-strong); color:var(--cin-text); padding:14px 24px; border-radius:14px; font-size:14px; font-weight:600; z-index:5000; box-shadow:var(--cin-shadow); display:flex; align-items:center; gap:10px; animation:smToastUp .3s ease; max-width:90vw; }
    .sm-toast b { color:var(--cin-accent); }
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
  const [aiUnavailable, setAiUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);
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

  const loadProducts = () => {
    setLoading(true);
    setFetchFailed(false);
    API.get("/products/")
      .then((res) => { setProducts(res.data); setFetchFailed(false); })
      .catch((err) => { console.error(err); setFetchFailed(true); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    injectStyles();
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setAiUnavailable(false);
    try {
      const res = await API.post("/products/ai-search/", { query });
      setAiResult(res.data.result);
    } catch (err) {
      // AI temporarily down — the grid below still live-filters by the query,
      // so tell the customer that instead of showing a raw error
      setAiUnavailable(true);
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
    <PageShell ghost="KICKS" maxWidth={1280}>
      <div style={{ paddingTop: isMobile ? 0 : "4px" }}>

        <Reveal className="sm-header">
          <span className="cin-label">Collection 2026</span>
          <div className="sm-header-title" style={{ fontSize: isMobile ? "56px" : "80px" }}>
            {headerTitle} <span>KICKS</span>
          </div>
          <div className="cin-sub">Premium footwear, zero compromises.</div>
        </Reveal>

        {/* MARQUEE */}
        <Reveal className="cin-marquee" style={{ marginBottom: "22px", borderRadius: "12px" }}>
          <div className="cin-marquee-track">
            {MARQUEE_DOUBLED.map((item, i) => (
              <span className="cin-marquee-item" key={i}><em>✦</em>{item}</span>
            ))}
          </div>
        </Reveal>

        {/* AI SEARCH */}
        <Reveal className="sm-search-wrap" delay={80}>
          <div className="sm-search-box">
            <span className="sm-search-badge">AI SEARCH</span>
            <input className="sm-search-input" placeholder="e.g. white sneakers..." value={query}
              onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
            <button className="sm-search-btn" onClick={handleSearch} disabled={aiLoading}>{aiLoading ? "..." : "SEARCH"}</button>
          </div>
          {aiResult && <div className="sm-ai-result">{aiResult}</div>}
          {aiUnavailable && (
            <div className="sm-ai-note">
              <div className="sm-ai-note-icon">✨</div>
              <div>
                <p className="sm-ai-note-title">OUR AI STYLIST IS TAKING A QUICK BREAK</p>
                <p className="sm-ai-note-body">
                  No worries — your search still works! The collection below is already filtered
                  for “{query}”. Try the AI stylist again in a few minutes.
                </p>
              </div>
            </div>
          )}
        </Reveal>

        {/* FILTER BAR */}
        <Reveal className="sm-filterbar" delay={140}>
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
        </Reveal>

        {/* ACTIVE CATEGORY CHIP */}
        {urlCategory && (
          <div className="sm-chips">
            <span className="cin-chip">
              {urlCategory}
              <button onClick={() => setSearchParams({})} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: 0 }}>✕</button>
            </span>
          </div>
        )}

        <div className="sm-countbar">
          <span className="sm-count-text"><b>{filtered.length}</b> products found</span>
        </div>

        {loading ? (
          <div className="sm-grid" style={{ gridTemplateColumns: gridCols }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="cin-panel" style={{ overflow: "hidden" }}>
                <div className="cin-skeleton" style={{ height: imgH, borderRadius: 0 }} />
                <div style={{ padding: "16px" }}>
                  <div className="cin-skeleton" style={{ width: "40%", height: "10px", marginBottom: "10px" }} />
                  <div className="cin-skeleton" style={{ width: "70%", height: "10px" }} />
                </div>
              </div>
            ))}
          </div>
        ) : fetchFailed && products.length === 0 ? (
          <div className="cin-glass cin-empty" style={{ maxWidth: "560px", margin: "0 auto" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>👟</div>
            <div className="cin-empty-title" style={{ fontSize: "40px" }}>RESTOCKING THE SHELVES</div>
            <div className="cin-sub" style={{ margin: "10px 0 24px", lineHeight: 1.7 }}>
              Fresh kicks are on their way — we couldn't reach the store right now.
              <br />Give it a moment and try again.
            </div>
            <button className="cin-btn cin-btn-primary" onClick={loadProducts}>
              ↻ Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="cin-empty">
            <div className="cin-empty-title">NO KICKS</div>
            <div className="cin-sub">No products match your filters.</div>
          </div>
        ) : (
          <div className="sm-grid" style={{ gridTemplateColumns: gridCols }}>
            {filtered.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 70}>
                <Tilt className="sm-card" onClick={() => navigate(`/products/${product.id}`)}>
                  <div className="sm-card-img-wrap" style={{ height: imgH }}>
                    <img className="sm-card-img" src={getImage(product.image)} alt={product.name} loading="lazy" />
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
                      <span className="cin-tag ok">IN STOCK</span>
                    </div>
                    <button className="sm-addcart" onClick={(e) => addToCart(e, product)} disabled={addingId === product.id}>
                      {addingId === product.id ? "ADDING..." : "＋ ADD TO CART"}
                    </button>
                  </div>
                </Tilt>
              </Reveal>
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

      <div style={{ margin: "70px -28px -90px" }}>
        <Footer />
      </div>
    </PageShell>
  );
}

export default Products;
