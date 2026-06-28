import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API, { getImage } from "../utils/api";
import useIsMobile from "../utils/useIsMobile";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const SIZES = [6, 7, 8, 9, 10, 11, 12];

  useEffect(() => {
    setLoading(true);
    API.get(`/products/${id}/`)
      .then((res) => {
        setProduct(res.data);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load product");
      })
      .finally(() => setLoading(false));
  }, [id]);

  function addToCart() {
    if (!selectedSize) {
      alert("Please select a size!");
      return;
    }
    API.post("/cart/add/", {
      product_id: product.id,
      size: selectedSize,
    })
      .then(() => alert("Added to cart!"))
      .catch((error) => {
        console.log(error.response);
        alert("Something went wrong");
      });
  }

  if (loading) {
    return (
      <div style={{ background: "#f5f5f5", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#888", fontSize: "15px" }}>Loading product...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "#f5f5f5", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#dc2626" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", padding: isMobile ? "90px 16px 40px" : "100px 40px 60px" }}>
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
          background: "#fff",
          borderRadius: "20px",
          padding: isMobile ? "24px" : "48px",
          border: "1px solid #eee",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* IMAGE */}
        <div style={{ background: "#f8f8f8", borderRadius: "16px", padding: isMobile ? "20px" : "40px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #eee" }}>
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
          <h1 style={{ color: "#1a1a1a", fontSize: isMobile ? "24px" : "28px", fontWeight: "800", marginBottom: "12px" }}>
            {product?.name}
          </h1>
          <p style={{ color: "#1a1a1a", fontSize: isMobile ? "24px" : "28px", fontWeight: "700", marginBottom: "16px" }}>
            ₹{parseFloat(product?.price || 0).toLocaleString("en-IN")}
          </p>
          <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.7", marginBottom: "28px" }}>
            {product?.description || "No description available"}
          </p>

          <div style={{ marginTop: "20px" }}>
            <ul style={{ color: "#666", lineHeight: "2", paddingLeft: "20px" }}>
              <li>Premium Comfort</li>
              <li>Lightweight Design</li>
              <li>Breathable Material</li>
              <li>Durable Sole</li>
            </ul>
          </div>

          {/* SIZE */}
          <div style={{ marginBottom: "28px", marginTop: "20px" }}>
            <p style={{ color: "#1a1a1a", fontWeight: "600", fontSize: "14px", marginBottom: "12px" }}>
              Select Size {selectedSize && `— ${selectedSize}`}
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    width: "48px",
                    height: "48px",
                    border: selectedSize === size ? "2px solid #1a1a1a" : "1px solid #e0e0e0",
                    background: selectedSize === size ? "#1a1a1a" : "#fff",
                    color: selectedSize === size ? "#e8ff3b" : "#1a1a1a",
                    cursor: "pointer",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    transition: "all 0.2s",
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* ADD TO CART */}
          <button
            onClick={addToCart}
            style={{
              padding: "16px",
              width: "100%",
              background: selectedSize ? "#1a1a1a" : "#e0e0e0",
              color: selectedSize ? "#e8ff3b" : "#999",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "15px",
              letterSpacing: "0.5px",
              cursor: selectedSize ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            {selectedSize ? "Add to Cart" : "Select Size First"}
          </button>

          <div style={{ marginTop: "24px", background: "#f8f8f8", padding: "18px", borderRadius: "12px" }}>
            <p>🚚 Free Delivery</p>
            <p>🔄 Easy Returns</p>
            <p>🔒 Secure Checkout</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "80px" }}>
        <h2 style={{ marginBottom: "30px", textAlign: "center" }}>You May Also Like</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: "20px" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee" }}>
              Similar Product {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;