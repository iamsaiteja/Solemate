import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API, { getImage } from "../utils/api";
import useIsMobile from "../utils/useIsMobile";

const injectPdStyles = () => {
  if (document.getElementById("sm-pd-style")) return;
  const s = document.createElement("style");
  s.id = "sm-pd-style";
  s.innerHTML = `
    .sm-sugg-card { background:#fff; border:1px solid #eee; border-radius:14px; overflow:hidden; cursor:pointer; transition:transform .28s, box-shadow .28s; }
    .sm-sugg-card:hover { transform:translateY(-5px); box-shadow:0 14px 34px rgba(0,0,0,.1); }
    .sm-sugg-card:hover img { transform:scale(1.08); }
    .sm-sugg-img { width:100%; height:170px; object-fit:contain; padding:14px; background:#f8f8f8; transition:transform .5s ease; }
    .sm-pd-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); background:#1a1a1a; color:#fff; padding:14px 24px; border-radius:12px; font-size:14px; font-weight:600; z-index:5000; box-shadow:0 8px 30px rgba(0,0,0,.3); animation:smPdUp .3s ease; max-width:90vw; }
    .sm-pd-toast b { color:#e8ff3b; }
    @keyframes smPdUp { from{ opacity:0; transform:translate(-50%,16px); } }
    .sm-star-btn { background:none; border:none; cursor:pointer; font-size:30px; line-height:1; padding:0 2px; color:#f5a623; transition:transform .1s; }
    .sm-star-btn:hover { transform:scale(1.2); }
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
      <div style={{ background: "transparent", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#888", fontSize: "15px" }}>Loading product...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ background: "transparent", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#dc2626" }}>{error}</p>
      </div>
    );
  }

  const lowStock = product?.stock != null && product.stock <= 10;
  const avg = product?.avg_rating || 0;
  const reviewCount = product?.review_count || 0;
  const reviews = product?.reviews || [];

  return (
    <div style={{ background: "transparent", minHeight: "100vh", padding: isMobile ? "90px 16px 40px" : "100px 40px 60px" }}>
      <button
        onClick={() => navigate(-1)}
        style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px", marginBottom: "32px" }}
      >
        ← Back
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "24px" : "48px",
          maxWidth: "1000px",
          margin: "0 auto",
          background: "transparent",
          borderRadius: "20px",
          padding: isMobile ? "24px" : "48px",
          border: "1px solid #eee",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* IMAGE + heart */}
        <div style={{ position: "relative", background: "#f8f8f8", borderRadius: "16px", padding: isMobile ? "20px" : "40px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #eee" }}>
          <button
            onClick={toggleWishlist}
            aria-label="Wishlist"
            style={{ position: "absolute", top: "14px", right: "14px", width: "42px", height: "42px", borderRadius: "50%", background: "rgba(255,255,255,0.95)", border: "1px solid #eee", color: liked ? "#e63946" : "#ccc", fontSize: "21px", lineHeight: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
          >
            {liked ? "♥" : "♡"}
          </button>
          <img
            src={product?.image ? getImage(product.image) : "https://placehold.co/300x300?text=No+Image"}
            alt={product?.name || "Product"}
            style={{ width: "100%", maxHeight: "400px", objectFit: "contain" }}
            onError={(e) => { e.target.src = "https://placehold.co/300x300?text=No+Image"; }}
          />
        </div>

        {/* DETAILS */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "inline-block", background: "#111", color: "#fff", padding: "6px 12px", borderRadius: "999px", fontSize: "12px", marginBottom: "12px", alignSelf: "flex-start" }}>
            BEST SELLER
          </div>
          <h1 style={{ color: "#1a1a1a", fontSize: isMobile ? "24px" : "28px", fontWeight: "800", marginBottom: "8px" }}>
            {product?.name}
          </h1>

          {/* avg rating */}
          {reviewCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <Stars value={avg} size={16} />
              <span style={{ fontSize: "13px", color: "#666", fontWeight: 600 }}>{avg} ({reviewCount})</span>
            </div>
          )}

          <p style={{ color: "#1a1a1a", fontSize: isMobile ? "24px" : "28px", fontWeight: "700", marginBottom: "10px" }}>
            ₹{parseFloat(product?.price || 0).toLocaleString("en-IN")}
          </p>

          <p style={{ fontSize: "13px", fontWeight: "600", color: lowStock ? "#dc2626" : "#15803d", marginBottom: "16px" }}>
            {lowStock ? `🔥 Only ${product.stock} left in stock!` : "✓ In Stock"}
          </p>

          <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.7", marginBottom: "24px" }}>
            {product?.description || "No description available"}
          </p>

          {/* SIZE */}
          <div style={{ marginBottom: "20px" }}>
            <p style={{ color: "#1a1a1a", fontWeight: "600", fontSize: "14px", marginBottom: "12px" }}>
              Select Size {selectedSize && `— ${selectedSize}`}
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    width: "48px", height: "48px",
                    border: selectedSize === size ? "2px solid #1a1a1a" : "1px solid #e0e0e0",
                    background: selectedSize === size ? "#1a1a1a" : "#fff",
                    color: selectedSize === size ? "#e8ff3b" : "#1a1a1a",
                    cursor: "pointer", borderRadius: "8px", fontWeight: "600", fontSize: "14px", transition: "all 0.2s",
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* QUANTITY */}
          <div style={{ marginBottom: "24px" }}>
            <p style={{ color: "#1a1a1a", fontWeight: "600", fontSize: "14px", marginBottom: "12px" }}>Quantity</p>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: "40px", height: "40px", borderRadius: "8px", border: "1px solid #e0e0e0", background: "#fff", fontSize: "20px", cursor: "pointer" }}>−</button>
              <span style={{ fontSize: "17px", fontWeight: "700", minWidth: "24px", textAlign: "center" }}>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} style={{ width: "40px", height: "40px", borderRadius: "8px", border: "1px solid #e0e0e0", background: "#fff", fontSize: "20px", cursor: "pointer" }}>+</button>
            </div>
          </div>

          {/* ADD TO CART */}
          <button
            onClick={addToCart}
            style={{
              padding: "16px", width: "100%",
              background: selectedSize ? "#1a1a1a" : "#e0e0e0",
              color: selectedSize ? "#e8ff3b" : "#999",
              border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "15px", letterSpacing: "0.5px",
              cursor: selectedSize ? "pointer" : "not-allowed", transition: "all 0.2s",
            }}
          >
            {selectedSize ? "Add to Cart" : "Select Size First"}
          </button>

          <div style={{ marginTop: "16px", background: "#f8f8f8", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", color: "#555" }}>
            📦 Delivery by <strong style={{ color: "#1a1a1a" }}>{deliveryDate}</strong>
          </div>

          <div style={{ marginTop: "16px", background: "#f8f8f8", padding: "18px", borderRadius: "12px" }}>
            <p style={{ margin: "4px 0" }}>🚚 Free Delivery</p>
            <p style={{ margin: "4px 0" }}>🔄 Easy Returns</p>
            <p style={{ margin: "4px 0" }}>🔒 Secure Checkout</p>
          </div>
        </div>
      </div>

      {/* ===== RATINGS & REVIEWS ===== */}
      <div style={{ maxWidth: "1000px", margin: "48px auto 0", background: "#fff", borderRadius: "20px", padding: isMobile ? "24px" : "40px", border: "1px solid #eee" }}>
        <h2 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "#1a1a1a", marginBottom: "4px" }}>
          Ratings & Reviews
        </h2>
        {reviewCount > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <span style={{ fontSize: "40px", fontWeight: "800", color: "#1a1a1a" }}>{avg}</span>
            <div>
              <Stars value={avg} size={18} />
              <div style={{ fontSize: "13px", color: "#888" }}>{reviewCount} review{reviewCount > 1 ? "s" : ""}</div>
            </div>
          </div>
        ) : (
          <p style={{ color: "#888", fontSize: "14px", marginBottom: "24px" }}>No reviews yet. Be the first!</p>
        )}

        {/* WRITE A REVIEW */}
        <div style={{ background: "#f8f8f8", borderRadius: "14px", padding: "20px", marginBottom: "28px" }}>
          <p style={{ fontWeight: "700", fontSize: "15px", color: "#1a1a1a", marginBottom: "10px" }}>Write a review</p>
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
            style={{ width: "100%", border: "1px solid #e0e0e0", borderRadius: "10px", padding: "12px 14px", fontSize: "14px", fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "12px" }}
          />
          <button
            onClick={submitReview}
            disabled={submitting}
            style={{ background: "#1a1a1a", color: "#e8ff3b", border: "none", padding: "12px 26px", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>

        {/* REVIEWS LIST */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {reviews.map((r, i) => (
            <div key={i} style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#1a1a1a", color: "#e8ff3b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px" }}>
                  {(r.user || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>{r.user}</div>
                  <Stars value={r.rating} size={13} />
                </div>
              </div>
              <p style={{ color: "#555", fontSize: "14px", lineHeight: "1.6", margin: "6px 0 0" }}>{r.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== SUGGESTIONS ===== */}
      {suggestions.length > 0 && (
        <div style={{ margin: "70px auto 0", maxWidth: "1100px" }}>
          <h2 style={{ marginBottom: "26px", textAlign: "center", fontSize: isMobile ? "24px" : "30px", fontWeight: "800", color: "#1a1a1a" }}>
            You May Also Like
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? "12px" : "20px" }}>
            {suggestions.map((s) => (
              <div key={s.id} className="sm-sugg-card" onClick={() => navigate(`/products/${s.id}`)}>
                <img className="sm-sugg-img" src={getImage(s.image)} alt={s.name}
                  onError={(e) => { e.target.src = "https://placehold.co/300x300?text=No+Image"; }} />
                <div style={{ padding: "12px 14px 14px", borderTop: "1px solid #f0f0f0" }}>
                  <p style={{ margin: 0, fontWeight: "700", fontSize: "14px", color: "#1a1a1a", lineHeight: 1.2, minHeight: "34px" }}>{s.name}</p>
                  <p style={{ margin: "6px 0 0", fontWeight: "700", fontSize: "14px", color: "#1a1a1a" }}>
                    ₹{parseFloat(s.price || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
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
    </div>
  );
}

export default ProductDetails;