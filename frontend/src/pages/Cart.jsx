import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { getImage } from "../utils/api";
import useIsMobile from "../utils/useIsMobile";
import PageShell from "../components/ui/PageShell";
import Reveal from "../components/ui/Reveal";
import "../styles/cinematic.css";

/* ---------- styles (keyframes inline styles lo raavu, anduke inject) ---------- */
const injectCartStyles = () => {
  if (document.getElementById('solemate-cart-style')) return;
  const s = document.createElement('style');
  s.id = 'solemate-cart-style';
  s.innerHTML = `
    .smc-item { background:var(--cin-glass); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border:1px solid var(--cin-border); border-radius:16px; transition:opacity .28s ease, transform .28s ease, box-shadow .25s, border-color .25s; }
    .smc-item:hover { box-shadow:var(--cin-shadow-soft); border-color:var(--cin-border-strong); transform:translateY(-2px); }
    .smc-item.removing { opacity:0; transform:translateX(40px) scale(.96); }

    .smc-step { width:34px; height:34px; border-radius:50%; border:1px solid var(--cin-border); background:var(--cin-input-bg); color:var(--cin-text); cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
    .smc-step:hover { background:var(--cin-accent); color:var(--cin-accent-ink); border-color:var(--cin-accent); }

    .smc-btn { background:var(--cin-accent); color:var(--cin-accent-ink); border:none; border-radius:12px; font-family:'Space Mono',monospace; font-weight:700; letter-spacing:1px; cursor:pointer; transition:transform .12s, box-shadow .2s; }
    .smc-btn:hover { transform:translateY(-1px); box-shadow:0 10px 26px rgba(250,84,0,.28); }
    .smc-btn:active { transform:scale(.98); }
    .smc-btn:disabled { opacity:.5; cursor:not-allowed; }

    .smc-pay { flex:1; padding:12px 6px; border-radius:12px; font-family:'Space Mono',monospace; font-weight:700; font-size:13px; cursor:pointer; transition:all .18s; }

    .smc-prog { height:7px; background:var(--cin-surface-2); border-radius:99px; overflow:hidden; }
    .smc-prog-fill { height:100%; background:linear-gradient(90deg,var(--cin-accent),#ff8b4d); border-radius:99px; animation:smcFill 1s cubic-bezier(.22,1,.36,1) both; }
    @keyframes smcFill { from{ width:0; } }

    /* Nike-style address form */
    .smc-field { position:relative; }
    .smc-field label { position:absolute; top:-7px; left:12px; padding:0 6px; background:var(--cin-bg-1); font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:var(--cin-muted); border-radius:4px; }
    .smc-field input { width:100%; }
    .smc-field .err { color:var(--cin-danger); font-size:11px; margin:4px 0 0 4px; display:block; }
    .smc-field input.invalid { border-color:var(--cin-danger); }

    /* coupon chips */
    .smc-chip { background:var(--cin-surface-2); border:1px dashed var(--cin-border-strong); color:var(--cin-text); font-family:'Space Mono',monospace; font-size:10px; font-weight:700; letter-spacing:1px; padding:6px 10px; border-radius:8px; cursor:pointer; transition:all .15s; }
    .smc-chip:hover { border-color:var(--cin-accent); color:var(--cin-accent); }

    /* ---- SUCCESS OVERLAY ---- */
    .smc-overlay { position:fixed; inset:0; z-index:3000; background:rgba(5,5,10,.7); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; padding:20px; animation:smcFade .3s ease; }
    @keyframes smcFade { from{ opacity:0; } }
    .smc-card-success { background:var(--cin-glass-strong); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); border:1px solid var(--cin-border-strong); border-radius:24px; padding:44px 32px; max-width:420px; width:100%; text-align:center; position:relative; box-shadow:var(--cin-shadow); animation:smcPop .5s cubic-bezier(.18,1.25,.4,1) both; }
    @keyframes smcPop { from{ opacity:0; transform:translateY(24px) scale(.9); } }

    .smc-ring { width:96px; height:96px; margin:0 auto 22px; position:relative; }
    .smc-ring svg { width:100%; height:100%; transform:rotate(-90deg); }
    .smc-ring circle { fill:none; stroke-width:5; }
    .smc-ring .bg { stroke:var(--cin-surface-2); }
    .smc-ring .fg { stroke:var(--cin-accent); stroke-linecap:round; stroke-dasharray:283; stroke-dashoffset:283; animation:smcRing 0.7s ease forwards .15s; }
    @keyframes smcRing { to{ stroke-dashoffset:0; } }
    .smc-tick { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
    .smc-tick svg { width:46px; height:46px; transform:none; }
    .smc-tick path { fill:none; stroke:var(--cin-accent); stroke-width:6; stroke-linecap:round; stroke-linejoin:round; stroke-dasharray:60; stroke-dashoffset:60; animation:smcTick .4s ease forwards .6s; }
    @keyframes smcTick { to{ stroke-dashoffset:0; } }

    .smc-fade-up { opacity:0; animation:smcUp .5s ease forwards; }
    @keyframes smcUp { to{ opacity:1; transform:translateY(0);} from{ transform:translateY(12px);} }

    @media (prefers-reduced-motion: reduce) {
      .smc-ring .fg, .smc-tick path, .smc-prog-fill, .smc-fade-up, .smc-card-success, .smc-overlay { animation:none !important; opacity:1 !important; stroke-dashoffset:0 !important; }
    }
  `;
  document.head.appendChild(s);
};

/* ---------- confetti (no library, pure canvas) ---------- */
const fireConfetti = () => {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:4000';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const colors = ['#fa5400', '#1a1a1a', '#ff4d6d', '#4d9bff', '#ffffff', '#ffd23f'];
  const pieces = [];
  for (let i = 0; i < 170; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: 7 + Math.random() * 7,
      h: 5 + Math.random() * 7,
      color: colors[(Math.random() * colors.length) | 0],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.32,
      vy: 3 + Math.random() * 4.5,
      vx: (Math.random() - 0.5) * 3.5,
    });
  }
  let frame = 0;
  const max = 240;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (frame < max) requestAnimationFrame(draw);
    else canvas.remove();
  };
  draw();
};

/* ---------- price count-up animation ---------- */
function CountUp({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = parseFloat(value) || 0;
    if (target === 0) { setDisplay(0); return; }
    const t0 = performance.now();
    const dur = 650;
    let raf;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>₹{display.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</>;
}

/* Backend unreachable aithe kuda ee codes pani cheyali (same rules as the
   seeded Coupon rows) — real charge backend redeploy tarvata match avtundi */
const LOCAL_COUPONS = {
  SOLE20: { pct: 20, min: 1999, cap: 1500 },
  SOLE30: { pct: 30, min: 3999, cap: 2500 },
  SOLE70: { pct: 70, min: 5999, cap: 5000 },
};

const CARD_OFFER = { pct: 5, cap: 300 }; // instant card discount, no coupon stacked

function Cart() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [cart, setCart] = useState({ items: [], total: '0' });
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [step, setStep] = useState('cart');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [removingId, setRemovingId] = useState(null);
  const [success, setSuccess] = useState(null); // order confirm aithe ee overlay

  // Nike-style structured address
  const [addr, setAddr] = useState({ name: '', phone: '', pincode: '', city: '', state: '', house: '', road: '' });
  const [errors, setErrors] = useState({});

  // Coupons
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null); // { code, discount }
  const [couponErr, setCouponErr] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => { injectCartStyles(); }, []);

  const fetchCart = async () => {
    try {
      const res = await API.get('/cart/');
      setCart(res.data);
    } catch (err) {
      console.error("Cart error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  // delivery date — ee roju + 4 days
  const deliveryDate = new Date(Date.now() + 4 * 86400000)
    .toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  const removeItem = async (id) => {
    setRemovingId(id);             // mundu slide-out animation
    setTimeout(async () => {
      try { await API.delete(`/cart/remove/${id}/`); await fetchCart(); }
      catch (err) { console.error(err); }
      setRemovingId(null);
    }, 280);
  };

  const updateQty = async (id, qty) => {
    try {
      if (qty < 1) return removeItem(id);
      await API.patch(`/cart/update/${id}/`, { quantity: qty });
      fetchCart();
    } catch (err) { console.error(err); }
  };

  /* ---------- discount math ---------- */
  const subtotal = parseFloat(cart.total) || 0;
  const couponDiscount = coupon ? Math.min(parseFloat(coupon.discount) || 0, subtotal) : 0;
  const cardDiscount = !coupon && paymentMethod === 'card'
    ? Math.min((subtotal * CARD_OFFER.pct) / 100, CARD_OFFER.cap)
    : 0;
  const payable = Math.max(subtotal - couponDiscount - cardDiscount, 0);

  // coupon becomes invalid if the cart total drops below its minimum
  useEffect(() => {
    if (coupon && LOCAL_COUPONS[coupon.code] && subtotal < LOCAL_COUPONS[coupon.code].min) {
      setCoupon(null);
      setCouponErr(`${coupon.code} needs a minimum order of ₹${LOCAL_COUPONS[coupon.code].min}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) { setCouponErr('Enter a coupon code'); return; }
    setApplying(true);
    setCouponErr('');
    try {
      const res = await API.post('/coupons/validate/', { code, total: subtotal });
      setCoupon({ code: res.data.code, discount: res.data.discount });
      setCouponInput('');
    } catch (err) {
      const serverMsg = err.response?.data?.error;
      if (serverMsg) {
        setCouponErr(serverMsg);
      } else if (LOCAL_COUPONS[code]) {
        // backend not reachable — apply the same seeded rules locally
        const rule = LOCAL_COUPONS[code];
        if (subtotal < rule.min) {
          setCouponErr(`${code} needs a minimum order of ₹${rule.min.toLocaleString('en-IN')}`);
        } else {
          const disc = Math.min((subtotal * rule.pct) / 100, rule.cap);
          setCoupon({ code, discount: disc.toFixed(2) });
          setCouponInput('');
        }
      } else {
        setCouponErr('Invalid coupon code');
      }
    } finally {
      setApplying(false);
    }
  };

  /* ---------- address validation (Nike-style) ---------- */
  const validateAddress = () => {
    const e = {};
    if (!addr.name.trim()) e.name = 'Name is required';
    if (!/^\d{10}$/.test(addr.phone.trim())) e.phone = 'Enter a valid 10-digit phone number';
    if (!/^\d{6}$/.test(addr.pincode.trim())) e.pincode = 'Pincode is compulsory (6 digits)';
    if (!addr.house.trim()) e.house = 'House / Flat No. is required';
    if (!addr.road.trim()) e.road = 'Road / Area / Colony is required';
    if (!addr.city.trim()) e.city = 'City is required';
    if (!addr.state.trim()) e.state = 'State is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const composedAddress = () =>
    `${addr.name}, ${addr.house}, ${addr.road}, ${addr.city}, ${addr.state} - ${addr.pincode}`;

  const celebrate = (total, method) => {
    setSuccess({ total, method, saved: couponDiscount + cardDiscount, offer: coupon?.code || (cardDiscount ? 'CARD OFFER' : '') });
    setCoupon(null);
    fireConfetti();
  };

  const handleCheckout = async () => {
    if (!validateAddress()) return;
    const orderTotal = payable.toFixed(2); // fetch tarwata cart khali avtundi, anduke mundu pattuko
    const payload = {
      shipping_address: composedAddress(),
      phone: addr.phone,
      coupon_code: coupon?.code || '',
      payment_method: paymentMethod,
    };
    setPlacing(true);
    try {
      if (paymentMethod === 'cod') {
        await API.post('/orders/create-cod/', payload);
        celebrate(orderTotal, 'cod');
        fetchCart();
        setStep('cart');
      } else {
        const res = await API.post('/orders/create/', payload);
        const { razorpay_order_id, amount, key, name, email } = res.data;

        // Same Razorpay order/verify flow — the chosen method only controls
        // which instruments the Razorpay sheet opens with. UPI covers
        // GPay / PhonePe / Paytm; card covers credit & debit cards.
        const displayConfig =
          paymentMethod === 'upi' ? {
            blocks: { upi: { name: 'Pay with UPI · GPay · PhonePe · Paytm', instruments: [{ method: 'upi' }] } },
            sequence: ['block.upi'],
            preferences: { show_default_blocks: false },
          } : paymentMethod === 'card' ? {
            blocks: { card: { name: 'Pay with Card', instruments: [{ method: 'card' }] } },
            sequence: ['block.card'],
            preferences: { show_default_blocks: false },
          } : undefined;

        const options = {
          key, amount, currency: 'INR', name: 'SoleMate',
          order_id: razorpay_order_id,
          handler: async (response) => {
            await API.post('/orders/verify-payment/', response);
            celebrate(orderTotal, 'razorpay');
            fetchCart();
            setStep('cart');
          },
          prefill: { name: addr.name || name || "", email: email || "", contact: addr.phone || "" },
          theme: { color: '#0a0a0e' },
          ...(displayConfig ? { config: { display: displayConfig } } : {}),
        };
        if (window.Razorpay) { new window.Razorpay(options).open(); }
        else { alert("Payment SDK not loaded"); }
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Checkout failed');
    } finally { setPlacing(false); }
  };

  if (loading) return (
    <PageShell ghost="BAG">
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <div className="cin-spin" style={{ marginBottom: '16px' }} />
        <span className="cin-mono" style={{ color: 'var(--cin-muted)', letterSpacing: '2px', fontSize: '12px' }}>LOADING BAG...</span>
      </div>
    </PageShell>
  );

  const itemCount = cart.items.reduce((a, it) => a + (it.quantity || 1), 0);

  const field = (key, label, props = {}) => (
    <div className="smc-field" style={{ flex: 1, minWidth: props.minWidth || '120px' }}>
      <label>{label}</label>
      <input
        className={`cin-input ${errors[key] ? 'invalid' : ''}`}
        value={addr[key]}
        onChange={(e) => { setAddr({ ...addr, [key]: e.target.value }); if (errors[key]) setErrors({ ...errors, [key]: '' }); }}
        {...props}
      />
      {errors[key] && <span className="err">{errors[key]}</span>}
    </div>
  );

  return (
    <PageShell ghost="BAG" maxWidth={1140}>

        {/* HEADER */}
        <Reveal style={{ marginBottom: isMobile ? '22px' : '30px' }}>
          <span className="cin-label">Secure Checkout</span>
          <h1 className="cin-title" style={{ fontSize: isMobile ? '46px' : '68px' }}>YOUR BAG</h1>
          {cart.items.length > 0 && (
            <span className="cin-mono" style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--cin-faint)' }}>{itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}</span>
          )}
        </Reveal>

        {cart.items.length === 0 ? (
          /* EMPTY */
          <Reveal className="cin-glass" style={{ textAlign: 'center', padding: isMobile ? '60px 20px' : '90px 20px' }}>
            <div style={{ fontSize: '50px', marginBottom: '14px' }}>🛒</div>
            <h2 className="cin-title" style={{ fontSize: '38px', marginBottom: '8px' }}>BAG IS EMPTY</h2>
            <p className="cin-sub" style={{ marginBottom: '26px' }}>Time to find your next pair.</p>
            <button className="smc-btn" onClick={() => navigate('/products')} style={{ padding: '14px 30px', fontSize: '13px' }}>
              BROWSE KICKS →
            </button>
          </Reveal>
        ) : (
          /* TWO COLUMN: items | summary */
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 360px', gap: isMobile ? '18px' : '28px', alignItems: 'start' }}>

            {/* LEFT — items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cart.items.map((item, idx) => (
                <Reveal key={item.id} delay={idx * 70}>
                <div className={`smc-item ${removingId === item.id ? 'removing' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '18px', padding: isMobile ? '12px' : '16px' }}>
                  <img
                    src={getImage(item?.product?.image)}
                    alt={item?.product?.name}
                    style={{ width: isMobile ? '64px' : '84px', height: isMobile ? '64px' : '84px', objectFit: 'contain', borderRadius: '10px', background: 'var(--cin-img-bg)', padding: '6px', flexShrink: 0, filter: 'drop-shadow(0 8px 10px rgba(0,0,0,.3))' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: isMobile ? '20px' : '24px', letterSpacing: '.5px', lineHeight: 1.05, color: 'var(--cin-text)' }}>
                      {item?.product?.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0 0', flexWrap: 'wrap' }}>
                      <span className="cin-mono" style={{ color: 'var(--cin-accent)', fontSize: '13px' }}>
                        ₹{item?.product?.price}
                      </span>
                      {item?.size && (
                        <span className="cin-tag">SIZE {item.size}</span>
                      )}
                    </div>
                    {isMobile && (
                      <button onClick={() => removeItem(item.id)} style={{ marginTop: '6px', background: 'none', border: 'none', color: 'var(--cin-danger)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                        Remove
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', minWidth: isMobile ? 'auto' : '118px', flexShrink: 0 }}>
                    <button className="smc-step" onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                    <span className="cin-mono" style={{ fontSize: '15px', minWidth: '22px', textAlign: 'center', color: 'var(--cin-text)' }}>{item.quantity}</span>
                    <button className="smc-step" onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                  </div>
                  {!isMobile && (
                    <button onClick={() => removeItem(item.id)} className="cin-btn cin-btn-danger" style={{ padding: '8px 14px', fontSize: '10px' }}>
                      Remove
                    </button>
                  )}
                </div>
                </Reveal>
              ))}

              {/* COUPONS */}
              <Reveal delay={140}>
                <div className="cin-glass" style={{ padding: '18px' }}>
                  <span className="cin-label no-line" style={{ marginBottom: '12px', display: 'inline-block' }}>🎟️ Apply Coupon</span>
                  {coupon ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--cin-success)', fontWeight: 700, fontSize: '14px' }}>
                        ✓ {coupon.code} applied — you save ₹{Number(couponDiscount).toLocaleString('en-IN')}
                      </span>
                      <button className="cin-btn cin-btn-ghost" style={{ padding: '8px 14px', fontSize: '10px' }}
                        onClick={() => { setCoupon(null); setCouponErr(''); }}>
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          className="cin-input"
                          placeholder="Enter code — e.g. SOLE30"
                          value={couponInput}
                          onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponErr(''); }}
                          onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                          style={{ flex: 1, textTransform: 'uppercase' }}
                        />
                        <button className="smc-btn" onClick={applyCoupon} disabled={applying} style={{ padding: '0 22px', fontSize: '12px' }}>
                          {applying ? '...' : 'APPLY'}
                        </button>
                      </div>
                      {couponErr && <p style={{ color: 'var(--cin-danger)', fontSize: '12px', margin: '8px 0 0' }}>{couponErr}</p>}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        {Object.entries(LOCAL_COUPONS).map(([code, r]) => (
                          <button key={code} className="smc-chip" onClick={() => { setCouponInput(code); setCouponErr(''); }}>
                            {code} · {r.pct}% OFF {subtotal < r.min ? `(min ₹${r.min.toLocaleString('en-IN')})` : ''}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Reveal>
            </div>

            {/* RIGHT — sticky summary */}
            <Reveal delay={120}>
            <div className="cin-glass" style={{ position: isMobile ? 'static' : 'sticky', top: '122px', padding: '24px' }}>

              {/* free shipping badge + progress */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                  <span className="cin-mono" style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--cin-success)' }}>🚚 FREE SHIPPING UNLOCKED</span>
                </div>
                <div className="smc-prog"><div className="smc-prog-fill" style={{ width: '100%' }} /></div>
              </div>

              {/* breakdown */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--cin-muted)', marginBottom: '10px' }}>
                <span>Bag Total ({itemCount} items)</span><span className="cin-mono" style={{ color: 'var(--cin-text)' }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--cin-muted)', marginBottom: '10px' }}>
                  <span>Coupon ({coupon.code})</span><span className="cin-mono" style={{ color: 'var(--cin-success)' }}>−₹{Number(couponDiscount).toLocaleString('en-IN')}</span>
                </div>
              )}
              {cardDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--cin-muted)', marginBottom: '10px' }}>
                  <span>💳 Card offer ({CARD_OFFER.pct}%)</span><span className="cin-mono" style={{ color: 'var(--cin-success)' }}>−₹{cardDiscount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--cin-muted)', marginBottom: '10px' }}>
                <span>Shipping</span><span className="cin-mono" style={{ color: 'var(--cin-success)' }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px dashed var(--cin-border-strong)', marginTop: '6px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '1px', color: 'var(--cin-text)' }}>YOU PAY</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '34px', letterSpacing: '.5px', color: 'var(--cin-accent)' }}>
                  <CountUp value={payable} />
                </span>
              </div>
              {(couponDiscount > 0 || cardDiscount > 0) && (
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--cin-success)', marginBottom: '12px' }}>
                  🎉 You save ₹{(couponDiscount + cardDiscount).toLocaleString('en-IN', { maximumFractionDigits: 0 })} on this order
                </div>
              )}

              {/* delivery estimate */}
              <div className="cin-panel" style={{ padding: '11px 14px', fontSize: '13px', color: 'var(--cin-muted)', marginBottom: '18px' }}>
                📦 Delivery by <strong style={{ color: 'var(--cin-text)' }}>{deliveryDate}</strong>
              </div>

              {step === 'cart' ? (
                <button className="smc-btn" onClick={() => setStep('checkout')} style={{ width: '100%', padding: '15px', fontSize: '14px' }}>
                  PROCEED TO CHECKOUT →
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* NIKE-STYLE ADDRESS */}
                  <span className="cin-label no-line" style={{ fontSize: '10px' }}>Shipping Address</span>
                  {field('name', 'Full Name *', { placeholder: 'Sai Teja' })}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {field('phone', 'Phone *', { placeholder: '10-digit mobile', maxLength: 10, inputMode: 'numeric' })}
                    {field('pincode', 'Pincode *', { placeholder: '500090', maxLength: 6, inputMode: 'numeric' })}
                  </div>
                  {field('house', 'House / Flat / Office No. *', { placeholder: 'Flat 402, Sunrise Residency' })}
                  {field('road', 'Road / Area / Colony *', { placeholder: 'Thipudam Pally' })}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {field('city', 'City *', { placeholder: 'Hyderabad' })}
                    {field('state', 'State *', { placeholder: 'Telangana' })}
                  </div>

                  {/* PAYMENT METHOD */}
                  <span className="cin-label no-line" style={{ fontSize: '10px', marginTop: '4px' }}>Payment Method</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '9px' }}>
                    {[
                      { key: 'upi', icon: '📱', label: 'UPI' },
                      { key: 'card', icon: '💳', label: 'CARD' },
                      { key: 'cod', icon: '🚚', label: 'COD' },
                    ].map(({ key, icon, label }) => (
                      <button key={key} className="smc-pay" onClick={() => setPaymentMethod(key)}
                        style={{
                          background: paymentMethod === key ? 'var(--cin-accent)' : 'var(--cin-input-bg)',
                          color: paymentMethod === key ? 'var(--cin-accent-ink)' : 'var(--cin-faint)',
                          border: paymentMethod === key ? '2px solid var(--cin-accent)' : '1px solid var(--cin-border)',
                        }}>
                        <span style={{ display: 'block', fontSize: '18px', marginBottom: '3px' }}>{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                  {paymentMethod === 'upi' && (
                    <div className="cin-panel" style={{ padding: '10px 13px', fontSize: '12px', color: 'var(--cin-muted)', textAlign: 'center' }}>
                      Pay instantly with <strong style={{ color: 'var(--cin-text)' }}>GPay · PhonePe · Paytm</strong> or any UPI app
                    </div>
                  )}
                  {paymentMethod === 'card' && (
                    <div className="cin-panel" style={{ padding: '10px 13px', fontSize: '12px', color: 'var(--cin-muted)', textAlign: 'center' }}>
                      {coupon
                        ? <>Credit &amp; debit cards — <strong style={{ color: 'var(--cin-text)' }}>Visa · Mastercard · RuPay</strong></>
                        : <><strong style={{ color: 'var(--cin-success)' }}>{CARD_OFFER.pct}% instant discount</strong> (up to ₹{CARD_OFFER.cap}) on Visa · Mastercard · RuPay</>}
                    </div>
                  )}
                  {paymentMethod === 'cod' && (
                    <div className="cin-panel" style={{ padding: '10px 13px', fontSize: '12px', color: 'var(--cin-muted)', textAlign: 'center' }}>
                      💡 Pay in cash when your order arrives.
                    </div>
                  )}
                  <button className="smc-btn" onClick={handleCheckout} disabled={placing}
                    style={{ padding: '15px', fontSize: '14px' }}>
                    {placing ? "PROCESSING..." : paymentMethod === 'cod' ? "🚚 PLACE ORDER"
                      : paymentMethod === 'upi' ? "📱 PAY WITH UPI" : "💳 PAY WITH CARD"}
                  </button>
                  <button className="cin-btn cin-btn-ghost" onClick={() => setStep('cart')} style={{ padding: '11px', fontSize: '11px' }}>
                    ← Back to Bag
                  </button>
                </div>
              )}
            </div>
            </Reveal>
          </div>
        )}

      {/* ===================== SUCCESS OVERLAY ===================== */}
      {success && (
        <div className="smc-overlay" onClick={() => setSuccess(null)}>
          <div className="smc-card-success" onClick={(e) => e.stopPropagation()}>
            {/* animated ring + tick */}
            <div className="smc-ring">
              <svg viewBox="0 0 100 100">
                <circle className="bg" cx="50" cy="50" r="45" />
                <circle className="fg" cx="50" cy="50" r="45" />
              </svg>
              <div className="smc-tick">
                <svg viewBox="0 0 52 52"><path d="M14 27 l8 8 l16 -18" /></svg>
              </div>
            </div>

            <div className="smc-fade-up" style={{ animationDelay: '.7s' }}>
              <span className="cin-mono" style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--cin-success)' }}>● ORDER CONFIRMED</span>
              <h2 className="cin-title" style={{ fontSize: '44px', margin: '8px 0 4px' }}>YOU'RE ALL SET</h2>
              <p className="cin-sub" style={{ margin: '0 0 20px' }}>
                {success.method === 'cod' ? 'Pay cash on delivery.' : 'Payment received successfully.'}
              </p>
            </div>

            <div className="smc-fade-up cin-panel" style={{ animationDelay: '.85s', padding: '16px', marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: 'var(--cin-muted)', marginBottom: '8px' }}>
                <span>Amount</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--cin-accent)' }}>₹{success.total}</span>
              </div>
              {success.saved > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--cin-success)', marginBottom: '8px' }}>
                  <span>You saved {success.offer && `(${success.offer})`}</span>
                  <strong>₹{Number(success.saved).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--cin-muted)' }}>
                <span>Arrives by</span>
                <strong style={{ color: 'var(--cin-text)' }}>{deliveryDate}</strong>
              </div>
            </div>

            <div className="smc-fade-up" style={{ animationDelay: '1s', display: 'flex', gap: '10px' }}>
              <button className="smc-btn" onClick={() => { setSuccess(null); navigate('/orders'); }} style={{ flex: 1, padding: '14px', fontSize: '13px' }}>
                VIEW ORDERS
              </button>
              <button className="cin-btn cin-btn-ghost" onClick={() => { setSuccess(null); navigate('/products'); }}
                style={{ flex: 1, padding: '14px', fontSize: '11px' }}>
                SHOP MORE
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

export default Cart;
