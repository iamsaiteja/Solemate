import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getImage } from "../utils/api";
import useIsMobile from "../utils/useIsMobile";

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

    // mundu screen meeda venタне teesey (fast anipinchadaniki)
    setItems((prev) => prev.filter((it) => it.product.id !== productId));

    try {
      await API.post("/wishlist/toggle/", { product_id: productId });
    } catch (err) {
      console.error(err);
      loadWishlist(); // error aithe malli load chesi venక్kి techuko
    }
  };

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", padding: isMobile ? "90px 16px 40px" : "100px 40px 60px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontFamily: "monospace", fontSize: "11px", letterSpacing: "2px", color: "#888", textTransform: "uppercase", marginBottom: "6px" }}>
            {items.length} {items.length === 1 ? "ITEM" : "ITEMS"}
          </p>
          <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: isMobile ? "44px" : "64px", letterSpacing: "1px", color: "#1a1a1a", margin: 0 }}>
            MY WISHLIST
          </h1>
        </div>

        {/* LOADING */}
        {loading ? (
          <p style={{ color: "#888", fontSize: "15px", padding: "40px 0" }}>Loading wishlist...</p>
        ) : items.length === 0 ? (
          /* EMPTY */
          <div style={{ textAlign: "center", padding: "70px 20px", background: "#fff", borderRadius: "16px", border: "1px solid #eee" }}>
            <div style={{ fontSize: "44px", marginBottom: "12px" }}>♡</div>
            <h2 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "32px", color: "#1a1a1a", marginBottom: "8px" }}>
              NO LIKES YET
            </h2>
            <p style={{ color: "#888", fontSize: "14px", marginBottom: "24px" }}>
              Tap the ♡ on any product to save it here.
            </p>
            <button
              onClick={() => navigate("/products")}
              style={{ background: "#1a1a1a", color: "#e8ff3b", border: "none", padding: "14px 28px", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}
            >
              Browse Products
            </button>
          </div>
        ) : (
          /* GRID */
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(220px, 1fr))", gap: isMobile ? "12px" : "18px" }}>
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/products/${item.product.id}`)}
                style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden", cursor: "pointer", position: "relative" }}
              >
                {/* IMAGE */}
                <div style={{ position: "relative", height: isMobile ? "150px" : "200px", background: "#f8f8f8" }}>
                  <img
                    src={getImage(item.product.image)}
                    alt={item.product.name}
                    style={{ width: "100%", height: "100%", objectFit: "contain", padding: "14px" }}
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
                      background: "rgba(255,255,255,0.92)",
                      border: "1px solid #eee",
                      color: "#e63946",
                      fontSize: "17px",
                      lineHeight: 1,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                  >
                    ♥
                  </button>
                </div>

                {/* INFO */}
                <div style={{ padding: "12px 14px 14px" }}>
                  <p style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "20px", letterSpacing: "0.5px", color: "#1a1a1a", margin: "0 0 6px", lineHeight: 1.1 }}>
                    {item.product.name}
                  </p>
                  <p style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: "700", color: "#1a1a1a", margin: 0 }}>
                    ₹{parseFloat(item.product.price || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;