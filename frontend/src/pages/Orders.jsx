import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';

const STATUS = {
  pending:    { color: '#b45309', bg: '#fef3c7', label: 'Pending' },
  processing: { color: '#1d4ed8', bg: '#dbeafe', label: 'Processing' },
  shipped:    { color: '#7c3aed', bg: '#ede9fe', label: 'Shipped' },
  delivered:  { color: '#15803d', bg: '#dcfce7', label: 'Delivered' },
  cancelled:  { color: '#dc2626', bg: '#fee2e2', label: 'Cancelled' },
};

// tracking steps + which step ye status
const STEPS = [
  { key: 'ordered', label: 'Ordered', icon: '🛒' },
  { key: 'processing', label: 'Processing', icon: '📦' },
  { key: 'shipped', label: 'Shipped', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '🏠' },
];
const STATUS_STEP = { pending: 0, processing: 1, shipped: 2, delivered: 3 };

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    API.get('/orders/').then(res => { setOrders(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: "transparent", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#888', letterSpacing: '1px' }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ background: "transparent", minHeight: '100vh', paddingTop: '80px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 40px' }}>

        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '12px', color: '#888', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            {orders.length} orders
          </p>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '56px', letterSpacing: '2px', color: '#1a1a1a' }}>
            My Orders
          </h1>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '16px', border: '1px solid #eee' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '64px', color: '#e0e0e0', marginBottom: '24px', letterSpacing: '2px' }}>
              NO ORDERS YET
            </div>
            <Link to="/products" style={{ display: 'inline-block', background: '#1a1a1a', color: '#e8ff3b', padding: '14px 36px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none' }}>Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.map(order => {
              const s = STATUS[order.status] || STATUS.pending;
              const open = expanded === order.id;
              const currentStep = STATUS_STEP[order.status] ?? 0;
              const cancelled = order.status === 'cancelled';
              return (
                <div key={order.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div onClick={() => setExpanded(open ? null : order.id)}
                    style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '24px', alignItems: 'center', cursor: 'pointer' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                        Order #{String(order.id).padStart(4, '0')} · {order.created_at}
                      </p>
                      <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a' }}>
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: '700', padding: '6px 14px', borderRadius: '100px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{s.label}</span>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>
                        ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                      </p>
                      <p style={{ fontSize: '11px', fontWeight: '600', color: order.payment_status === 'paid' ? '#15803d' : '#b45309', textTransform: 'uppercase', marginTop: '2px' }}>
                        {order.payment_status === 'paid' ? '✓ Paid' : order.payment_status === 'cod' ? 'COD' : 'Pending'}
                      </p>
                    </div>
                    <span style={{ color: '#aaa', fontSize: '18px', display: 'inline-block', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                  </div>

                  {open && (
                    <div style={{ borderTop: '1px solid #f0f0f0', padding: '24px 28px', background: '#fafafa' }}>

                      {/* ===== TRACKING TIMELINE ===== */}
                      {cancelled ? (
                        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '14px 16px', borderRadius: '10px', marginBottom: '24px', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
                          ✕ This order was cancelled
                        </div>
                      ) : (
                        <div style={{ marginBottom: '28px' }}>
                          <p style={{ fontSize: '11px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '18px' }}>Order Tracking</p>
                          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            {STEPS.map((step, idx) => {
                              const done = idx <= currentStep;
                              const isCurrent = idx === currentStep;
                              const isLast = idx === STEPS.length - 1;
                              return (
                                <div key={step.key} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                                  {!isLast && (
                                    <div style={{ position: 'absolute', top: '15px', left: '50%', width: '100%', height: '3px', background: idx < currentStep ? '#15803d' : '#e0e0e0', zIndex: 0 }} />
                                  )}
                                  <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: done ? '#15803d' : '#fff',
                                    border: done ? '2px solid #15803d' : '2px solid #ddd',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto', position: 'relative', zIndex: 1, fontSize: '14px',
                                    boxShadow: isCurrent ? '0 0 0 5px rgba(21,128,61,0.15)' : 'none',
                                    transition: 'all .3s',
                                  }}>
                                    {done ? (isLast && isCurrent ? step.icon : '✓') : step.icon}
                                  </div>
                                  <p style={{ fontSize: '11px', marginTop: '8px', color: done ? '#1a1a1a' : '#aaa', fontWeight: isCurrent ? 700 : 500 }}>{step.label}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* ITEMS */}
                      {order.items.map((item, j) => (
                        <div key={j} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                          <div>
                            <p style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: '600', marginBottom: '2px' }}>{item.product_name}</p>
                            <p style={{ fontSize: '12px', color: '#888' }}>{item.quantity} × ₹{parseFloat(item.price).toLocaleString('en-IN')}</p>
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>₹{parseFloat(item.subtotal).toLocaleString('en-IN')}</span>
                        </div>
                      ))}

                      {order.shipping_address && (
                        <div style={{ background: '#fff', borderRadius: '8px', padding: '14px 16px', marginTop: '12px', border: '1px solid #eee' }}>
                          <p style={{ fontSize: '11px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Delivery Address</p>
                          <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.5' }}>{order.shipping_address}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;