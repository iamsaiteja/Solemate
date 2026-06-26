import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const megaMenuData = {
  men: {
    "NEW DROPS": [
      "Latest Arrivals",
      "Limited Editions",
      "Trending"
    ],

    "SNEAKERS": [
      "Lifestyle",
      "Running",
      "Basketball",
      "Football",
      "Tennis",
      "Training",
      "Skateboarding"
    ],

    "PREMIUM": [
      "Jordan",
      "Nike Air",
      "Adidas Originals",
      "Puma Select",
      "New Balance"
    ],

    "SHOP BY PRICE": [
      "Under ₹3000",
      "₹3000 - ₹7000",
      "₹7000+"
    ]
  },

  women: {
    "NEW DROPS": [
      "Latest Arrivals",
      "Trending"
    ],

    "SNEAKERS": [
      "Lifestyle",
      "Running",
      "Training",
      "Tennis",
      "Walking"
    ],

    "PREMIUM": [
      "Nike Women",
      "Adidas Women",
      "Puma Women"
    ],

    "SHOP BY PRICE": [
      "Under ₹3000",
      "₹3000 - ₹7000",
      "₹7000+"
    ]
  },

  kids: {
    "BOYS": [
      "Running",
      "Basketball",
      "Lifestyle",
      "School"
    ],

    "GIRLS": [
      "Running",
      "Lifestyle",
      "Training",
      "School"
    ],

    "FEATURED": [
      "New Arrivals",
      "Best Sellers",
      "School Collection"
    ]
  },

  sale: {
    "MEN SALE": [
      "Running",
      "Lifestyle",
      "Basketball"
    ],

    "WOMEN SALE": [
      "Running",
      "Lifestyle"
    ],

    "KIDS SALE": [
      "School",
      "Lifestyle"
    ],

    "LAST CHANCE": [
      "Under ₹1999",
      "Under ₹2999",
      "Clearance"
    ]
  }
};

function MegaMenu({ data, visible }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "1000px",
        background: "#fff",
        borderTop: "1px solid #e5e5e5",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        padding: "40px 60px",
        display: "grid",
        gridTemplateColumns: `repeat(${Object.keys(data).length}, 1fr)`,
        gap: "50px",
        zIndex: 999,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "all" : "none",
        transition: "opacity 0.18s ease",
      }}
    >
      {Object.entries(data).map(([category, items]) => (
        <div key={category}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#111",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            {category}
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {items.map((item) => (
              <li key={item} style={{ marginBottom: "8px" }}>
                <Link
                  to={`/products?category=${encodeURIComponent(item.toLowerCase())}`}
                  style={{
                    fontSize: "14px",
                    color: "#555",
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "#111")}
                  onMouseLeave={(e) => (e.target.style.color = "#555")}
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Navbar() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  useEffect(() => {
    const token = localStorage.getItem("access");
    const username = localStorage.getItem("username");
    setUser(token ? username || "User" : null);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  const isLoginPage =
    location.pathname === "/login" || location.pathname === "/register";

  const navLinkStyle = (paths) => {
    const isActive = Array.isArray(paths)
      ? paths.includes(location.pathname)
      : location.pathname === paths;
    return {
      fontSize: "13px",
      fontWeight: "600",
      color: isActive ? "#111" : "#444",
      textDecoration: "none",
      letterSpacing: "0.02em",
      padding: "4px 0",
      borderBottom: isActive ? "2px solid #111" : "2px solid transparent",
      transition: "color 0.15s, border-color 0.15s",
    };
  };

  const megaItems = [
    { key: "men", label: "Men", path: "/products?category=men" },
    { key: "women", label: "Women", path: "/products?category=women" },
    { key: "kids", label: "Kids", path: "/products?category=kids" },
    { key: "sale", label: "Sale", path: "/products?sale=true" },
  ];

  return (
    <>
      {!isLoginPage && (
        <div
          style={{
            background: "#111",
            color: "#fff",
            textAlign: "center",
            padding: "8px",
            fontSize: "12px",
            fontWeight: "600",
            position: "fixed",
            top: 0,
            width: "100%",
            zIndex: 1001,
          }}
        >
          🔥 UP TO 40% OFF ON PREMIUM SNEAKERS
        </div>
      )}

      <nav
        onMouseLeave={() => setActiveMenu(null)}
        style={{
          position: "fixed",
          top: isLoginPage ? 0 : 34,
          left: 0,
          right: 0,
          height: "60px",
          zIndex: 1000,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 40px",
          background: "#fff",
          borderBottom: "1px solid #eee",
          boxShadow: scrolled ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontFamily: "Bebas Neue, sans-serif",
            fontSize: "28px",
            letterSpacing: "3px",
            color: "#111",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          SOLEMATE
        </Link>

        {/* Center Nav Links */}
        {!isLoginPage && (
          <div
            style={{
              display: "flex",
              gap: "28px",
              alignItems: "center",
              height: "100%",
              position: "relative",
            }}
          >
            <Link
              to="/"
              style={navLinkStyle("/")}
              onMouseEnter={() => setActiveMenu(null)}
            >
              Home
            </Link>

            <Link
              to="/products"
              style={navLinkStyle("/products")}
              onMouseEnter={() => setActiveMenu(null)}
            >
              Products
            </Link>

            {megaItems.map(({ key, label, path }) => (
              <div
                key={key}
                style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}
                onMouseEnter={() => setActiveMenu(key)}
              >
                <Link
                  to={path}
                  style={{
                    ...navLinkStyle("/products"),
                    color: activeMenu === key ? "#111" : "#444",
                    borderBottom: activeMenu === key ? "2px solid #111" : "2px solid transparent",
                  }}
                >
                  {label}
                </Link>
                <MegaMenu data={megaMenuData[key]} visible={activeMenu === key} />
              </div>
            ))}
          </div>
        )}

        {/* Right Side */}
        {!isLoginPage && (
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {user ? (
              <>
                <Link to="/cart" style={navLinkStyle("/cart")}>
                  Cart
                </Link>
                <Link to="/orders" style={navLinkStyle("/orders")}>
                  Orders
                </Link>
                {role === "seller" && (
                  <Link to="/seller" style={navLinkStyle("/seller")}>
                    Seller
                  </Link>
                )}
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#111",
                  }}
                >
                  {user}
                </span>
                <button
                  onClick={logout}
                  style={{
                    background: "#111",
                    color: "#fff",
                    border: "none",
                    padding: "9px 18px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={navLinkStyle("/login")}>
                  Login
                </Link>
                <Link
                  to="/register"
                  style={{
                    background: "#111",
                    color: "#e8ff3b",
                    padding: "9px 18px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontWeight: "700",
                    fontSize: "13px",
                  }}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
}

export default Navbar;