import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { getImage } from "../utils/api";
import Sneaker3DExperience from "../components/Sneaker3DExperience";
import Reveal from "../components/ui/Reveal";
import Tilt from "../components/ui/Tilt";
import Footer from "../components/ui/Footer";
import "../styles/cinematic.css";

function Home() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/products/")
      .then((res) => setProducts(res.data.slice(0, 8)))
      .catch((err) => console.error(err));
  }, []);

  const handleProtectedRoute = () => {
    const token = localStorage.getItem("access");
    if (token) navigate("/products");
    else navigate("/login");
  };

  const addToCart = async (productId) => {
    if (!localStorage.getItem("access")) {
      navigate("/login");
      return;
    }

    try {
      await API.post("/cart/add/", {
        product_id: productId,
        quantity: 1,
      });

      alert("Added To Cart");
    } catch {
      alert("Error adding to cart");
    }
  };

  return (
    <div className="cin-page" style={{ background: "transparent" }}>
      <div className="cin-bgfx" aria-hidden="true" />

      {/* 3D SCROLL EXPERIENCE HERO */}
      <Sneaker3DExperience onCta={handleProtectedRoute} />

      {/* STATS */}
      <section style={{ padding: "90px 24px", maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          {[
            ["10K+", "Happy Customers"],
            ["500+", "Premium Products"],
            ["24/7", "Support"],
          ].map(([num, text], i) => (
            <Reveal key={text} delay={i * 120}>
              <Tilt className="cin-glass" style={{ padding: "38px 20px", textAlign: "center" }}>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(40px, 6vw, 64px)",
                    letterSpacing: "1px",
                    color: "var(--cin-accent)",
                    margin: 0,
                  }}
                >
                  {num}
                </h1>
                <p style={{ color: "var(--cin-muted)", marginTop: "6px", letterSpacing: "1px" }}>
                  {text}
                </p>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SPOTLIGHT */}
      <section style={{ padding: "10px 24px 90px", maxWidth: "1240px", margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: "50px" }}>
          <span className="cin-label no-line">Spotlight</span>
          <h2 className="cin-title" style={{ fontSize: "clamp(44px, 6vw, 72px)" }}>
            MOST POPULAR CATEGORIES
          </h2>
          <p className="cin-sub">Explore the collections everyone is lacing up</p>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "18px",
          }}
        >
          {["Running", "Lifestyle", "Basketball", "Training", "Sports", "Casual"].map(
            (item, i) => (
              <Reveal key={item} delay={i * 80}>
                <Tilt
                  className="cin-glass"
                  style={{ padding: "36px 16px", textAlign: "center", cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/products?category=${encodeURIComponent(item.toLowerCase())}`)
                  }
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "24px",
                      letterSpacing: "2px",
                      color: "var(--cin-text)",
                    }}
                  >
                    {item}
                  </span>
                </Tilt>
              </Reveal>
            )
          )}
        </div>
      </section>

      {/* TRENDING */}
      <section style={{ padding: "0 24px 90px", maxWidth: "1240px", margin: "0 auto" }}>
        <Reveal>
          <div
            className="cin-glass"
            style={{
              position: "relative",
              overflow: "hidden",
              textAlign: "center",
              padding: "clamp(60px, 9vw, 110px) 24px",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse 60% 80% at 50% 120%, var(--cin-glow), transparent 65%)",
                pointerEvents: "none",
              }}
            />
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(90px, 16vw, 220px)",
                letterSpacing: "6px",
                color: "transparent",
                WebkitTextStroke: "1.5px var(--cin-ghost)",
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              TRENDING
            </span>
            <span className="cin-label no-line">The Heat List</span>
            <h2 className="cin-title" style={{ fontSize: "clamp(40px, 6vw, 68px)" }}>
              TRENDING COLLECTION
            </h2>
            <p className="cin-sub" style={{ maxWidth: "620px", margin: "10px auto 0", lineHeight: 1.8 }}>
              Discover the latest sneaker drops and premium streetwear collections.
            </p>
          </div>
        </Reveal>
      </section>

      {/* FEATURED PRODUCTS */}
      <section style={{ padding: "0 24px 100px", maxWidth: "1240px", margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: "50px" }}>
          <span className="cin-label no-line">Featured</span>
          <h2 className="cin-title" style={{ fontSize: "clamp(40px, 5vw, 64px)" }}>
            FEATURED PRODUCTS
          </h2>
          <p className="cin-sub">Handpicked. Heat certified. Zero fake.</p>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
            gap: "22px",
          }}
        >
          {products.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 90}>
              <Tilt
                className="cin-glass"
                style={{ overflow: "hidden", cursor: "pointer" }}
                onClick={() => navigate(`/products/${p.id}`)}
              >
                <div style={{ background: "var(--cin-img-bg)", padding: "24px" }}>
                  <img
                    src={getImage(p.image)}
                    alt={p.name}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "230px",
                      objectFit: "contain",
                      filter: "drop-shadow(0 18px 22px rgba(0,0,0,.35))",
                    }}
                  />
                </div>

                <div style={{ padding: "20px" }}>
                  <h3
                    style={{
                      margin: "0 0 8px",
                      fontFamily: "var(--font-display)",
                      fontSize: "24px",
                      letterSpacing: "1px",
                      color: "var(--cin-text)",
                      fontWeight: 400,
                    }}
                  >
                    {p.name}
                  </h3>

                  <p className="cin-mono" style={{ fontSize: "18px", color: "var(--cin-accent)", margin: 0 }}>
                    ₹{p.price}
                  </p>

                  <button
                    className="cin-btn cin-btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(p.id);
                    }}
                    style={{ width: "100%", marginTop: "16px" }}
                  >
                    Add To Cart
                  </button>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

export default Home;
