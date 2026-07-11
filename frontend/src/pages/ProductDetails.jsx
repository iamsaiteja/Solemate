import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API, { getImage } from "../utils/api";
import useIsMobile from "../utils/useIsMobile";
import PageShell from "../components/ui/PageShell";
import Reveal from "../components/ui/Reveal";
import Tilt from "../components/ui/Tilt";
import Footer from "../components/ui/Footer";
import "../styles/cinematic.css";

const injectPdStyles = () => {
  if (document.getElementById("sm-pd-style")) return;
  const s = document.createElement("style");
  s.id = "sm-pd-style";
  s.innerHTML = `
    .sm-sugg-card { background:var(--cin-glass); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border:1px solid var(--cin-border); border-radius:16px; overflow:hidden; cursor:pointer; transition:transform .28s, box-shadow .28s, border-color .28s; }
    .sm-sugg-card:hover { transform:translateY(-5px); box-shadow:var(--cin-shadow); border-color:var(--cin-border-strong); }
    .sm-sugg-card:hover img { transform:scale(1.08); }
    .sm-sugg-img { width:100%; height:170px; object-fit:contain; padding:14px; background:var(--cin-img-bg); transition:transform .5s ease; filter:drop-shadow(0 10px 14px rgba(0,0,0,.3)); }
    .sm-pd-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); background:var(--cin-glass-strong); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); border:1px solid var(--cin-border-strong); color:var(--cin-text); padding:14px 24px; border-radius:14px; font-size:14px; font-weight:600; z-index:5000; box-shadow:var(--cin-shadow); animation:smPdUp .3s ease; max-width:90vw; }
    .sm-pd-toast b { color:var(--cin-accent); }
    @keyframes smPdUp { from{ opacity:0; transform:translate(-50%,16px); } }
    .sm-star-btn { background:none; border:none; cursor:pointer; font-size:30px; line-height:1; padding:0 2px; color:#f5a623; transition:transform .1s; }
    .sm-star-btn:hover { transform:scale(1.2); }
    .sm-size-btn { width:48px; height:48px; border:1px solid var(--cin-border); background:var(--cin-input-bg); color:var(--cin-text); cursor:pointer; border-radius:10px; font-weight:600; font-size:14px; transition:all 0.2s; }
    .sm-size-btn:hover { border-color:var(--cin-accent); }
    .sm-size-btn.sel { background:var(--cin-accent); color:var(--cin-accent-ink); border:2px solid var(--cin-accent); box-shadow:0 6px 18px rgba(250,84,0,.25); }
    .sm-qty-btn { width:40px; height:40px; border-radius:10px; border:1px solid var(--cin-border); background:var(--cin-input-bg); color:var(--cin-text); font-size:20px; cursor:pointer; transition:all .15s; }
    .sm-qty-btn:hover { border-color:var(--cin-accent); color:var(--cin-accent); }
  `;
  document.head.appendChild(s);
};

// stars chupinchadaniki (value = rating)
const Stars = ({ value, size = 16 }) => {
  const full = Math.round(value);
  return (
    <span style={{ color: "#f5a623", fontSize: size, letterSpacing: "1px" }}>
      {"★".repeat(full)}{"☆".repeat(5 - full)}
    </span>
  );
};

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // REVIEWS
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const SIZES = [6, 7, 8, 9, 10, 11, 12];

  useEffect(() => { injectPdStyles(); }, []);

  const loadProduct = () => {
    return API.get(`/products/${id}/`)
      .then((res) => { setProduct(res.data); setError(""); })
      .catch((err) => { console.error(err); setError("Failed to load product"); });
  };

  useEffect(() => {
    setLoading(true);
    setSelectedSize(null);
    setQty(1);
    window.scrollTo(0, 0);
    loadProduct().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    API.get("/products/")
      .then((res) => setAllProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("access")) return;
    API.get("/wishlist/ids/")
      .then((res) => setLiked(res.data.product_ids.includes(parseInt(id))))
      .catch((err) => console.error(err));
  }, [id]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  function addToCart() {
    if (!localStorage.getItem("access")) { navigate("/login"); return; }
    if (!selectedSize) { showToast("__size__"); return; }
    API.post("/cart/add/", { product_id: product.id, quantity: qty, size: selectedSize })
      .then(() => showToast(product.name))
      .catch((error) => { console.log(error.response); showToast("__error__"); });
  }

  const toggleWishlist = async () => {
    if (!localStorage.getItem("access")) { navigate("/login"); return; }
    setLiked((prev) => !prev);
    try {
      await API.post("/wishlist/toggle/", { product_id: product.id });
    } catch (err) { console.error(err); setLiked((prev) => !prev); }
  };

  const submitReview = async () => {
    if (!localStorage.getItem("access")) { navigate("/login"); return; }
    if (reviewRating < 1) { showToast("__rating__"); return; }
    if (!reviewComment.trim()) { showToast("__comment__"); return; }
    setSubmitting(true);
    try {
      await API.post(`/products/${id}/review/`, { rating: reviewRating, comment: reviewComment });
      setReviewRating(0);
      setReviewComment("");
      showToast("__review__");
      loadProduct(); // reviews refresh
    } catch (err) {
      console.error(err);
      showToast("__error__");
    } finally {
      setSubmitting(false);
    }
  };

  const suggestions = (() => {
    if (!product || allProducts.length === 0) return [];
    const others = allProducts.filter((p) => p.id !== product.id);
    const sameCat = others.filter((p) => p.category && product.category && p.category === product.category);
    let pool = sameCat.length >= 4 ? sameCat : [...sameCat, ...others.filter((p) => !sameCat.some((s) => s.id === p.id))];
    pool = [...pool].sort(() => Math.random() - 0.5);
    return pool.slice(0, 4);
  })();

  const deliveryDate = new Date(Date.now() + 4 * 86400000)
    .toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

  if (loading) {
    return (
      <PageShell ghost="DETAIL">
        <div style={{ height: "50vh", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", justifyContent: "center" }}>
          <div className="cin-spin" />
          <p className="cin-sub">Loading product...</p>
        </div>
      </PageShell>
    );
  }
  if (error) {
    return (
      <PageShell ghost="DETAIL">
        <div style={{ height: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--cin-danger)" }}>{error}</p>
        </div>
      </PageShell>
    );
  }

  const lowStock = product?.stock != null && product.stock <= 10;
  const avg = product?.avg_rating || 0;
  const reviewCount = product?.review_count || 0;
  const reviews = product?.reviews || [];

  return (
    <PageShell ghost="DETAIL" maxWidth={1060}>
      <button
        onClick={() => navigate(-1)}
        style={{ background: "none", border: "none", color: "var(--cin-muted)", cursor: "pointer", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px", marginBottom: "28px", letterSpacing: "1px" }}
      >
        ← BACK
      </button>

      <Reveal>
        <div
          className="cin-glass"
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "24px" : "48px",
            padding: isMobile ? "20px" : "44px",
          }}
        >
          {/* IMAGE + heart */}
          <Tilt max={4} style={{ position: "relative", background: "var(--cin-img-bg)", borderRadius: "16px", padding: isMobile ? "20px" : "40px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--cin-border)", overflow: "hidden" }}>
            <button
              onClick={toggleWishlist}
              aria-label="Wishlist"
              style={{ position: "absolute", top: "14px", right: "14px", width: "42px", height: "42px", borderRadius: "50%", background: "var(--cin-glass-strong)", border: "1px solid var(--cin-border)", color: liked ? "#ff5a7a" : "var(--cin-faint)", fontSize: "21px", lineHeight: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
            >
              {liked ? "♥" : "♡"}
            </button>
            <img
              src={product?.image ? getImage(product.image) : "https://placehold.co/300x300?text=No+Image"}
              alt={product?.name || "Product"}
              style={{ width: "100%", maxHeight: "400px", objectFit: "contain", filter: "drop-shadow(0 26px 30px rgba(0,0,0,.45))" }}
              onError={(e) => { e.target.src = "https://placehold.co/300x300?text=No+Image"; }}
            />
          </Tilt>

          {/* DETAILS */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span className="cin-chip" style={{ alignSelf: "flex-start", marginBottom: "14px" }}>
              Best Seller
            </span>
            <h1 className="cin-title" style={{ fontSize: isMobile ? "40px" : "54px", margin: "0 0 8px" }}>
              {product?.name}
            </h1>

            {/* avg rating */}
            {reviewCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <Stars value={avg} size={16} />
                <span style={{ fontSize: "13px", color: "var(--cin-muted)", fontWeight: 600 }}>{avg} ({reviewCount})</span>
              </div>
            )}

            <p className="cin-mono" style={{ color: "var(--cin-accent)", fontSize: isMobile ? "24px" : "28px", margin: "0 0 10px" }}>
              ₹{parseFloat(product?.price || 0).toLocaleString("en-IN")}
            </p>

            <span className={`cin-tag ${lowStock ? "warn" : "ok"}`} style={{ alignSelf: "flex-start", marginBottom: "16px" }}>
              {lowStock ? `🔥 Only ${product.stock} left in stock!` : "✓ In Stock"}
            </span>

            <p style={{ color: "var(--cin-muted)", fontSize: "14px", lineHeight: "1.8", marginBottom: "24px" }}>
              {product?.description || "No description available"}
            </p>

            {/* SIZE */}
            <div style={{ marginBottom: "20px" }}>
              <p className="cin-label no-line" style={{ marginBottom: "12px" }}>
                Select Size {selectedSize && `— ${selectedSize}`}
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`sm-size-btn ${selectedSize === size ? "sel" : ""}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* QUANTITY */}
            <div style={{ marginBottom: "24px" }}>
              <p className="cin-label no-line" style={{ marginBottom: "12px" }}>Quantity</p>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <button className="sm-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span className="cin-mono" style={{ fontSize: "17px", minWidth: "24px", textAlign: "center", color: "var(--cin-text)" }}>{qty}</span>
                <button className="sm-qty-btn" onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
            </div>

            {/* ADD TO CART */}
            <button
              onClick={addToCart}
              className={`cin-btn ${selectedSize ? "cin-btn-primary" : "cin-btn-ghost"}`}
              style={{ width: "100%", padding: "17px", fontSize: "14px", opacity: selectedSize ? 1 : 0.6, cursor: selectedSize ? "pointer" : "not-allowed" }}
            >
              {selectedSize ? "Add to Cart" : "Select Size First"}
            </button>

            <div className="cin-panel" style={{ marginTop: "16px", padding: "12px 16px", fontSize: "13px", color: "var(--cin-muted)" }}>
              📦 Delivery by <strong style={{ color: "var(--cin-text)" }}>{deliveryDate}</strong>
            </div>

            <div className="cin-panel" style={{ marginTop: "16px", padding: "18px", color: "var(--cin-muted)", fontSize: "14px" }}>
              <p style={{ margin: "4px 0" }}>🚚 Free Delivery</p>
              <p style={{ margin: "4px 0" }}>🔄 Easy Returns</p>
              <p style={{ margin: "4px 0" }}>🔒 Secure Checkout</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ===== RATINGS & REVIEWS ===== */}
      <Reveal>
        <div className="cin-glass" style={{ margin: "48px auto 0", padding: isMobile ? "24px" : "40px" }}>
          <span className="cin-label">Community</span>
          <h2 className="cin-title" style={{ fontSize: isMobile ? "34px" : "44px", marginBottom: "10px" }}>
            RATINGS & REVIEWS
          </h2>
          {reviewCount > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "48px", color: "var(--cin-accent)" }}>{avg}</span>
              <div>
                <Stars value={avg} size={18} />
                <div style={{ fontSize: "13px", color: "var(--cin-muted)" }}>{reviewCount} review{reviewCount > 1 ? "s" : ""}</div>
              </div>
            </div>
          ) : (
            <p className="cin-sub" style={{ marginBottom: "24px" }}>No reviews yet. Be the first!</p>
          )}

          {/* WRITE A REVIEW */}
          <div className="cin-panel" style={{ padding: "20px", marginBottom: "28px" }}>
            <p style={{ fontWeight: "700", fontSize: "15px", color: "var(--cin-text)", marginBottom: "10px" }}>Write a review</p>
            <div style={{ marginBottom: "12px" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className="sm-star-btn" onClick={() => setReviewRating(n)} aria-label={`${n} stars`}>
                  {n <= reviewRating ? "★" : "☆"}
                </button>
              ))}
            </div>
            <textarea
              placeholder="Share your experience with this product..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              className="cin-input"
              style={{ resize: "vertical", marginBottom: "12px", boxSizing: "border-box" }}
            />
            <button
              onClick={submitReview}
              disabled={submitting}
              className="cin-btn cin-btn-primary"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>

          {/* REVIEWS LIST */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {reviews.map((r, i) => (
              <div key={i} style={{ borderBottom: "1px solid var(--cin-border)", paddingBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--cin-accent)", color: "var(--cin-accent-ink)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px" }}>
                    {(r.user || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--cin-text)" }}>{r.user}</div>
                    <Stars value={r.rating} size={13} />
                  </div>
                </div>
                <p style={{ color: "var(--cin-muted)", fontSize: "14px", lineHeight: "1.6", margin: "6px 0 0" }}>{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ===== SUGGESTIONS ===== */}
      {suggestions.length > 0 && (
        <Reveal style={{ margin: "70px auto 0" }}>
          <div style={{ textAlign: "center", marginBottom: "26px" }}>
            <span className="cin-label no-line">Keep Exploring</span>
            <h2 className="cin-title" style={{ fontSize: isMobile ? "34px" : "44px" }}>
              YOU MAY ALSO LIKE
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? "12px" : "20px" }}>
            {suggestions.map((s) => (
              <div key={s.id} className="sm-sugg-card" onClick={() => navigate(`/products/${s.id}`)}>
                <img className="sm-sugg-img" src={getImage(s.image)} alt={s.name}
                  onError={(e) => { e.target.src = "https://placehold.co/300x300?text=No+Image"; }} />
                <div style={{ padding: "12px 14px 14px", borderTop: "1px solid var(--cin-border)" }}>
                  <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "18px", letterSpacing: ".5px", color: "var(--cin-text)", lineHeight: 1.15, minHeight: "34px" }}>{s.name}</p>
                  <p className="cin-mono" style={{ margin: "6px 0 0", fontSize: "14px", color: "var(--cin-accent)" }}>
                    ₹{parseFloat(s.price || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {/* TOAST */}
      {toast && (
        <div className="sm-pd-toast">
          {toast === "__size__" ? "👟 Please select a size first"
            : toast === "__rating__" ? "⭐ Please select a star rating"
            : toast === "__comment__" ? "✍ Please write a comment"
            : toast === "__review__" ? <>✓ <b>Review</b> submitted!</>
            : toast === "__error__" ? "⚠ Something went wrong"
            : <>✓ <b>{toast}</b> added to cart</>}
        </div>
      )}

      <div style={{ margin: "70px -28px -90px" }}>
        <Footer />
      </div>
    </PageShell>
  );
}

export default ProductDetails;
