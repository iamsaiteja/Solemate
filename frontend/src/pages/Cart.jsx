import React, { useEffect, useState } from 'react';
import API, { getImage } from "../utils/api";

function Cart() {
  const [cart, setCart] = useState({ items: [], total: '0' });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ shipping_address: '', phone: '' });
  const [placing, setPlacing] = useState(false);
  const [step, setStep] = useState('cart');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

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

  const removeItem = async (id) => {
    try {
      await API.delete(`/cart/remove/${id}/`);
      fetchCart();
    } catch (err) { console.error(err); }
  };

  const updateQty = async (id, qty) => {
    try {
      if (qty < 1) return removeItem(id);
      await API.patch(`/cart/update/${id}/`, { quantity: qty });
      fetchCart();
    } catch (err) { console.error(err); }
  };

  const handleCheckout = async () => {
    if (!form.shipping_address.trim()) { alert('Enter shipping address'); return; }
    setPlacing(true);
    try {
      if (paymentMethod === 'cod') {
        // COD — directly place order
        await API.post('/orders/create-cod/', form);
        alert('Order placed! Pay on delivery 🎉');
        fetchCart();
        setStep('cart');
      } else {
        // Razorpay existing flow
        const res = await API.post('/orders/create/', form);
        const { razorpay_order_id, amount, key, name, email } = res.data;
        const options = {
          key, amount, currency: 'INR', name: 'SoleMate',
          order_id: razorpay_order_id,
          handler: async (response) => {
            await API.post('/orders/verify-payment/', response);
            alert('Payment successful!');
            fetchCart();
            setStep('cart');
          },
          prefill: { name: name || "", email: email || "", contact: form.phone || "" },
          theme: { color: '#1a1a1a' },
        };
        if (window.Razorpay) { new window.Razorpay(options).open(); }
        else { alert("Payment SDK not loaded"); }
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Checkout failed');
    } finally { setPlacing(false); }
  };

  if (loading) return (
    <div style={{ padding: '100px 40px', textAlign: 'center', color: '#888' }}>
      Loading...
    </div>
  );

  return (
    <div style={{
      padding: '100px 40px 60px',
      maxWidth: '900px',
      margin: '0 auto',
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      <h1 style={{
        marginBottom: '32px',
        fontSize: '28px',
        fontWeight: '800',
        color: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        My Cart
      </h1>

      {cart.items.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px',
          background: '#fff', borderRadius: '16px',
          border: '1px solid #eee', color: '#aaa'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>Your cart is empty</p>
          <p style={{ fontSize: '14px' }}>Add some sneakers!</p>
        </div>
      ) : (
        <>
          {cart.items.map(item => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: '20px',
              background: '#fff', borderRadius: '12px',
              padding: '16px', marginBottom: '12px',
              border: '1px solid #eee',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <img
                src={getImage(item?.product?.image)}
                alt={item?.product?.name}
                style={{
                  width: '80px', height: '80px',
                  objectFit: 'contain', borderRadius: '8px',
                  background: '#f8f8f8', padding: '4px'
                }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '16px', color: '#1a1a1a' }}>
                  {item?.product?.name}
                </p>
                <p style={{ margin: '4px 0 0', color: '#1a1a1a', fontWeight: '600', fontSize: '15px' }}>
                  ₹{item?.product?.price}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={() => updateQty(item.id, item.quantity - 1)} style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  border: '1px solid #eee', background: '#f5f5f5',
                  color: '#1a1a1a', cursor: 'pointer', fontSize: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>−</button>
                <span style={{ fontSize: '16px', minWidth: '20px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a' }}>
                  {item.quantity}
                </span>
                <button onClick={() => updateQty(item.id, item.quantity + 1)} style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  border: '1px solid #eee', background: '#f5f5f5',
                  color: '#1a1a1a', cursor: 'pointer', fontSize: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>+</button>
              </div>
              <button onClick={() => removeItem(item.id)} style={{
                padding: '8px 16px', background: '#fff',
                border: '1px solid #ffcdd2', borderRadius: '8px',
                color: '#e53935', cursor: 'pointer',
                fontWeight: '600', fontSize: '13px'
              }}>
                Remove
              </button>
            </div>
          ))}

          <div style={{
            background: '#fff', borderRadius: '16px',
            padding: '24px', marginTop: '16px',
            border: '1px solid #eee',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
          }}>
            <h2 style={{ color: '#1a1a1a', margin: '0 0 20px', fontSize: '22px', fontWeight: '800' }}>
              Total: ₹{cart.total}
            </h2>

            {step === 'cart' ? (
              <button onClick={() => setStep('checkout')} style={{
                padding: '13px 32px', background: '#1a1a1a',
                border: 'none', borderRadius: '8px',
                fontWeight: '700', fontSize: '15px',
                cursor: 'pointer', color: '#e8ff3b'
              }}>
                Proceed to Checkout →
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>

                {/* Shipping Address */}
                <input
                  placeholder="Shipping Address"
                  value={form.shipping_address}
                  onChange={e => setForm({ ...form, shipping_address: e.target.value })}
                  style={{
                    padding: '12px 16px', borderRadius: '8px',
                    border: '1px solid #e0e0e0', background: '#f8f8f8',
                    color: '#1a1a1a', fontSize: '14px', outline: 'none'
                  }}
                />

                {/* Phone Number */}
                <input
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  style={{
                    padding: '12px 16px', borderRadius: '8px',
                    border: '1px solid #e0e0e0', background: '#f8f8f8',
                    color: '#1a1a1a', fontSize: '14px', outline: 'none'
                  }}
                />

                {/* Payment Method Selection */}
                <p style={{ margin: '4px 0 0', fontWeight: '700', fontSize: '14px', color: '#555' }}>
                  Select Payment Method:
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setPaymentMethod('razorpay')}
                    style={{
                      flex: 1, padding: '12px',
                      background: paymentMethod === 'razorpay' ? '#1a1a1a' : '#f5f5f5',
                      color: paymentMethod === 'razorpay' ? '#e8ff3b' : '#888',
                      border: paymentMethod === 'razorpay' ? '2px solid #1a1a1a' : '1px solid #e0e0e0',
                      borderRadius: '8px', fontWeight: '700',
                      cursor: 'pointer', fontSize: '14px'
                    }}>
                    💳 Pay Online
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    style={{
                      flex: 1, padding: '12px',
                      background: paymentMethod === 'cod' ? '#1a1a1a' : '#f5f5f5',
                      color: paymentMethod === 'cod' ? '#e8ff3b' : '#888',
                      border: paymentMethod === 'cod' ? '2px solid #1a1a1a' : '1px solid #e0e0e0',
                      borderRadius: '8px', fontWeight: '700',
                      cursor: 'pointer', fontSize: '14px'
                    }}>
                    🚚 Cash on Delivery
                  </button>
                </div>

                {/* COD info message */}
                {paymentMethod === 'cod' && (
                  <div style={{
                    padding: '10px 14px', background: '#fffde7',
                    border: '1px solid #fff176', borderRadius: '8px',
                    fontSize: '13px', color: '#795548'
                  }}>
                    💡 Pay in cash when your order is delivered.
                  </div>
                )}

                {/* Place Order / Pay Now Button */}
                <button onClick={handleCheckout} disabled={placing} style={{
                  padding: '13px', background: placing ? '#ccc' : '#1a1a1a',
                  border: 'none', borderRadius: '8px',
                  fontWeight: '700', fontSize: '15px',
                  cursor: placing ? 'not-allowed' : 'pointer',
                  color: '#e8ff3b'
                }}>
                  {placing
                    ? "Processing..."
                    : paymentMethod === 'cod'
                      ? "🚚 Place Order (Cash on Delivery)"
                      : "💳 Pay Now"}
                </button>

                {/* Back button */}
                <button onClick={() => setStep('cart')} style={{
                  padding: '11px', background: 'transparent',
                  border: '1px solid #e0e0e0', borderRadius: '8px',
                  color: '#888', cursor: 'pointer', fontSize: '14px'
                }}>
                  ← Back to Cart
                </button>

              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;