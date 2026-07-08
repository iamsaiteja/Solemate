import React from "react";
import { Link } from "react-router-dom";
import "../../styles/cinematic.css";

function Footer() {
  return (
    <footer
      style={{
        position: "relative",
        borderTop: "1px solid var(--cin-border)",
        background: "var(--cin-glass)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        color: "var(--cin-text)",
        padding: "56px 24px 40px",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(26px, 4vw, 40px)",
          letterSpacing: "4px",
          margin: 0,
        }}
      >
        SOLEMATE
      </h2>
      <p style={{ color: "var(--cin-muted)", marginTop: "10px", fontSize: "14px" }}>
        Premium Sneakers For Modern Lifestyle
      </p>

      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "26px",
          margin: "26px 0 30px",
        }}
      >
        {[
          ["Home", "/"],
          ["Products", "/products"],
          ["Cart", "/cart"],
          ["Wishlist", "/wishlist"],
          ["Orders", "/orders"],
        ].map(([label, to]) => (
          <Link
            key={to}
            to={to}
            style={{
              color: "var(--cin-muted)",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            {label}
          </Link>
        ))}
      </nav>

      <p style={{ color: "var(--cin-faint)", fontSize: "12px", letterSpacing: "1px" }}>
        © 2026 SOLEMATE. All Rights Reserved.
      </p>
    </footer>
  );
}

export default Footer;
