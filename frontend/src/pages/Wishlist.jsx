import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getImage } from "../utils/api";
import useIsMobile from "../utils/useIsMobile";
import PageShell from "../components/ui/PageShell";
import Reveal from "../components/ui/Reveal";
import Tilt from "../components/ui/Tilt";
import "../styles/cinematic.css";

function Wishlist() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = () => {
    API.get("/wishlist/")
      .then((res) => setItems(res.data.items))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  // heart nokkithe wishlist nundi teesey
  const removeItem = async (e, productId) => {
    e.stopPropagation(); // card click (detail ki vellatam) aapali

    // mundu screen meeda vent테 teesey (fast anipinchadaniki)
    setItems((prev) => prev.filter((it) => it.product.id !== productId));

    try {
      await API.post("/wishlist/toggle/", { product_id: productId });
    } catch (err) {
      console.error(err);
      loadWishlist(); // error aithe malli load chesi venక్kి techuko
    }
  };

  return (
    <PageShell ghost="LOVED" maxWidth={1140}>
      {/* HEADER */}
      <Reveal style={{ marginBottom: "28px" }}>
        <span className="cin-label">
          {items.length} {items.length === 1 ? "Item" : "Items"}
        </span>
        <h1 className="cin-title" style={{ fontSize: isMobile ? "44px" : "64px" }}>
          MY WISHLIST
        </h1>
      </Reveal>

      {/* LOADING */}
      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <div className="cin-spin" style={{ marginBottom: "14px" }} />
          <p className="cin-sub">Loading wishlist...</p>
        </div>
      ) : items.length === 0 ? (
        /* EMPTY */
        <Reveal className="cin-glass" style={{ textAlign: "center", padding: "70px 20px" }}>
          <div style={{ fontSize: "44px", marginBottom: "12px", color: "var(--cin-accent)" }}>♡</div>
          <h2 className="cin-title" style={{ fontSize: "36px", marginBottom: "8px" }}>
            NO LIKES YET
          </h2>
          <p className="cin-sub" style={{ marginBottom: "24px" }}>
            Tap the ♡ on any product to save it here.
          </p>
          <button className="cin-btn cin-btn-primary" onClick={() => navigate("/products")}>
            Browse Products
          </button>
        </Reveal>
      ) : (
        /* GRID */
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(220px, 1fr))", gap: isMobile ? "12px" : "18px" }}>
          {items.map((item, i) => (
            <Reveal key={item.id} delay={(i % 4) * 70}>
              <Tilt
                className="cin-glass"
                onClick={() => navigate(`/products/${item.product.id}`)}
                style={{ overflow: "hidden", cursor: "pointer" }}
              >
                {/* IMAGE */}
                <div style={{ position: "relative", height: isMobile ? "150px" : "200px", background: "var(--cin-img-bg)" }}>
                  <img
                    src={getImage(item.product.image)}
                    alt={item.product.name}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "contain", padding: "14px", filter: "drop-shadow(0 12px 14px rgba(0,0,0,.3))" }}
                  />
                  {/* REMOVE HEART */}
                  <button
                    onClick={(e) => removeItem(e, item.product.id)}
                    aria-label="Remove from wishlist"
                    style={{
                      position: "absolute",
                      top: "10px", right: "10px",
                      width: "34px", height: "34px",
                      borderRadius: "50%",
                      background: "var(--cin-glass-strong)",
                      border: "1px solid var(--cin-border)",
                      color: "#ff5a7a",
                      fontSize: "17px",
                      lineHeight: 1,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      zIndex: 2,
                    }}
                  >
                    ♥
                  </button>
                </div>

                {/* INFO */}
                <div style={{ padding: "12px 14px 14px", borderTop: "1px solid var(--cin-border)" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "20px", letterSpacing: "0.5px", color: "var(--cin-text)", margin: "0 0 6px", lineHeight: 1.1 }}>
                    {item.product.name}
                  </p>
                  <p className="cin-mono" style={{ fontSize: "13px", color: "var(--cin-accent)", margin: 0 }}>
                    ₹{parseFloat(item.product.price || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      )}
    </PageShell>
  );
}

export default Wishlist;
