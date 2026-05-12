import React, { useEffect, useState } from "react";
import API, { getImage } from "../utils/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/products/")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error:", err));
  }, []);

  const handleAiSearch = async () => {
    if (!query) return;
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

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>Products</h2>

      {/* AI Search Box */}
      <div style={{ marginBottom: "30px", background: "#1a1a2e", padding: "20px", borderRadius: "10px" }}>
        <h3 style={{ color: "#00d4ff" }}>🤖 AI Search</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. comfortable running shoes under 2000"
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", fontSize: "14px" }}
          />
          <button
            onClick={handleAiSearch}
            style={{ padding: "10px 20px", background: "#00d4ff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
          >
            {loading ? "Searching..." : "Ask AI"}
          </button>
        </div>
        {aiResult && (
          <div style={{ marginTop: "15px", background: "#0f3460", padding: "15px", borderRadius: "8px", whiteSpace: "pre-wrap" }}>
            {aiResult}
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "20px"
      }}>
        {products.map((p) => (
          <div key={p.id} style={{ border: "1px solid #333", padding: "10px", borderRadius: "10px" }}>
            <img
              src={getImage(p.image)}
              alt={p.name}
              style={{ width: "100%", height: "150px", objectFit: "contain" }}
            />
            <h4>{p.name}</h4>
            <p>₹{p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;