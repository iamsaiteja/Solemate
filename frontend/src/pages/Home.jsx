import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { getImage } from "../utils/api";

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

```
try {
  await API.post("/cart/add/", {
    product_id: productId,
    quantity: 1,
  });

  alert("Added To Cart");
} catch {
  alert("Error adding to cart");
}
```

};

return (
<div
style={{
background: "transparent",
minHeight: "100vh",
color: "#111",
}}
>
{/* HERO */}
<section
style={{
height: "100vh",
backgroundImage:
"linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.55)),url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1800&auto=format&fit=crop')",
backgroundSize: "cover",
backgroundPosition: "center",
display: "flex",
flexDirection: "column",
justifyContent: "center",
alignItems: "center",
textAlign: "center",
padding: "20px",
}}
>
<h1
style={{
fontSize: "clamp(40px, 12vw, 110px)",
fontWeight: "900",
letterSpacing: "6px",
color: "#fff",
marginBottom: "20px",
}}
>
SOLEMATE </h1>

```
    <p
      style={{
        maxWidth: "800px",
        fontSize: "22px",
        color: "rgba(255,255,255,.85)",
        lineHeight: "1.8",
      }}
    >
      Discover premium sneakers crafted for comfort,
      performance and modern street fashion.
    </p>

    <div
      style={{
        display: "flex",
        gap: "20px",
        marginTop: "40px",
        flexWrap: "wrap",
      }}
    >
      <button
        onClick={handleProtectedRoute}
        style={{
          background: "transparent",
          color: "#111",
          padding: "16px 40px",
          border: "none",
          borderRadius: "999px",
          fontWeight: "700",
          cursor: "pointer",
        }}
      >
        Shop Now
      </button>

      <button
        onClick={handleProtectedRoute}
        style={{
          background: "transparent",
          color: "#fff",
          border: "2px solid #fff",
          padding: "16px 40px",
          borderRadius: "999px",
          fontWeight: "700",
          cursor: "pointer",
        }}
      >
        Explore Collection
      </button>
    </div>
  </section>

  {/* STATS */}
  <section
    style={{
      display: "flex",
      justifyContent: "space-around",
      flexWrap: "wrap",
      background: "#fff",
      padding: "70px 20px",
    }}
  >
    {[
      ["10K+", "Happy Customers"],
      ["500+", "Premium Products"],
      ["24/7", "Support"],
    ].map(([num, text]) => (
      <div key={text} style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "clamp(28px, 6vw, 52px)",
            fontWeight: "900",
          }}
        >
          {num}
        </h1>

        <p style={{ color: "#666" }}>{text}</p>
      </div>
    ))}
  </section>

  {/* SPOTLIGHT */}
  <section
    style={{
      background:"transparent",
      padding: "80px 40px",
    }}
  >
    <h2
      style={{
        textAlign: "center",
        fontSize: "52px",
        marginBottom: "15px",
        fontWeight: "900",
      }}
    >
      SPOTLIGHT
    </h2>

    <p
      style={{
        textAlign: "center",
        color: "#777",
        marginBottom: "50px",
      }}
    >
      Explore our most popular categories
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(180px,1fr))",
        gap: "20px",
      }}
    >
      {[
        "Running",
        "Lifestyle",
        "Basketball",
        "Training",
        "Sports",
        "Casual",
      ].map((item) => (
        <div
          key={item}
          style={{
            background: "#f8f8f8",
            padding: "35px",
            borderRadius: "16px",
            textAlign: "center",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          {item}
        </div>
      ))}
    </div>
  </section>

  {/* TRENDING */}
  <section
    style={{
      background: "#111",
      color: "#fff",
      textAlign: "center",
      padding: "100px 20px",
    }}
  >
    <h2
      style={{
        fontSize: "clamp(28px, 7vw,60pxx)",
        marginBottom: "20px",
      }}
    >
      TRENDING COLLECTION
    </h2>

    <p
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        color: "#ccc",
        lineHeight: "1.8",
      }}
    >
      Discover the latest sneaker drops and premium
      streetwear collections.
    </p>
  </section>

  {/* FEATURED PRODUCTS */}
  <section
    style={{
      padding: "80px 40px",
    }}
  >
    <h2
      style={{
        textAlign: "center",
        fontSize: "clamp(24px, 5vw, 42px)",
        marginBottom: "10px",
      }}
    >
      Featured Products
    </h2>

    <p
      style={{
        textAlign: "center",
        color: "#777",
        marginBottom: "50px",
      }}
    >
      Handpicked. Heat certified. Zero fake.
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(280px,1fr))",
        gap: "24px",
      }}
    >
      {products.map((p) => (
        <div
          key={p.id}
          onClick={() =>
            navigate(`/products/${p.id}`)
          }
          style={{
            background: "#fff",
            borderRadius: "18px",
            overflow: "hidden",
            cursor: "pointer",
            border: "1px solid #eee",
            transition: ".3s",
          }}
        >
          <div
            style={{
              background: "#f8f8f8",
              padding: "25px",
            }}
          >
            <img
              src={getImage(p.image)}
              alt={p.name}
              style={{
                width: "100%",
                height: "250px",
                objectFit: "contain",
              }}
            />
          </div>

          <div style={{ padding: "20px" }}>
            <h3
              style={{
                marginBottom: "10px",
                fontSize: "17px",
              }}
            >
              {p.name}
            </h3>

            <p
              style={{
                fontSize: "22px",
                fontWeight: "800",
              }}
            >
              ₹{p.price}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(p.id);
              }}
              style={{
                width: "100%",
                marginTop: "15px",
                padding: "14px",
                border: "none",
                background: "#111",
                color: "#fff",
                borderRadius: "10px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Add To Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>

  {/* FOOTER */}
  <footer
    style={{
      background: "#fff",
      textAlign: "center",
      padding: "50px 20px",
      borderTop: "1px solid #eee",
    }}
  >
    <h2
      style={{
        fontSize: "clamp(20px, 4vw, 34px)",
        letterSpacing: "3px",
      }}
    >
      SOLEMATE
    </h2>

    <p
      style={{
        color: "#777",
        marginTop: "10px",
      }}
    >
      Premium Sneakers For Modern Lifestyle
    </p>

    <p
      style={{
        color: "#999",
        marginTop: "15px",
        fontSize: "13px",
      }}
    >
      © 2026 SOLEMATE. All Rights Reserved.
    </p>
  </footer>
</div>


);
}

export default Home;
