import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import PageShell from "../components/ui/PageShell";
import Reveal from "../components/ui/Reveal";
import "../styles/cinematic.css";

const STATUS = {
  pending:    { color: '#f5c542', bg: 'rgba(245,197,66,.14)', label: 'Pending' },
  processing: { color: '#6ea2ff', bg: 'rgba(110,162,255,.14)', label: 'Processing' },
  shipped:    { color: '#b48cff', bg: 'rgba(180,140,255,.14)', label: 'Shipped' },
  delivered:  { color: 'var(--cin-success)', bg: 'var(--cin-success-bg)', label: 'Delivered' },
  cancelled:  { color: 'var(--cin-danger)', bg: 'var(--cin-danger-bg)', label: 'Cancelled' },
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
    <PageShell ghost="ORDERS">
      <div style={{ minHeight: '40vh', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', justifyContent: 'center' }}>
        <div className="cin-spin" />
        <p className="cin-sub">Loading...</p>
      </div>
    </PageShell>
  );

  return (
    <PageShell ghost="ORDERS" maxWidth={940}>

        <Reveal style={{ marginBottom: '40px' }}>
          <span className="cin-label">
            {orders.length} orders
          </span>
          <h1 className="cin-title" style={{ fontSize: '56px' }}>
            MY ORDERS
          </h1>
        </Reveal>

        {orders.length === 0 ? (
          <Reveal className="cin-glass" style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div className="cin-empty-title" style={{ marginBottom: '24px' }}>
              NO ORDERS YET
            </div>
            <Link to="/products" className="cin-btn cin-btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>Start Shopping</Link>
          </Reveal>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.map((order, oi) => {
              const s = STATUS[order.status] || STATUS.pending;
              const open = expanded === order.id;
              const currentStep = STATUS_STEP[order.status] ?? 0;
              const cancelled = order.status === 'cancelled';
              return (
                <Reveal key={order.id} delay={(oi % 5) * 60}>
                <div className="cin-glass" style={{ overflow: 'hidden' }}>
                  <div onClick={() => setExpanded(open ? null : order.id)}
                    style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '24px', alignItems: 'center', cursor: 'pointer' }}>
                    <div>
                      <p className="cin-mono" style={{ fontSize: '11px', color: 'var(--cin-faint)', marginBottom: '4px', letterSpacing: '1px' }}>
                        Order #{String(order.id).padStart(4, '0')} · {order.created_at}
                      </p>
                      <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--cin-text)' }}>
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: '700', padding: '6px 14px', borderRadius: '100px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{s.label}</span>
                    <div style={{ textAlign: 'right' }}>
                      <p className="cin-mono" style={{ fontSize: '18px', color: 'var(--cin-accent)' }}>
                        ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                      </p>
                      <p style={{ fontSize: '11px', fontWeight: '600', color: order.payment_status === 'paid' ? 'var(--cin-success)' : '#f5c542', textTransform: 'uppercase', marginTop: '2px' }}>
                        {order.payment_status === 'paid' ? '✓ Paid' : order.payment_status === 'cod' ? 'COD' : 'Pending'}
                      </p>
                    </div>
                    <span style={{ color: 'var(--cin-faint)', fontSize: '18px', display: 'inline-block', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                  </div>

                  {open && (
                    <div style={{ borderTop: '1px solid var(--cin-border)', padding: '24px 28px', background: 'var(--cin-surface)' }}>

                      {/* ===== TRACKING TIMELINE ===== */}
                      {cancelled ? (
                        <div style={{ background: 'var(--cin-danger-bg)', color: 'var(--cin-danger)', padding: '14px 16px', borderRadius: '10px', marginBottom: '24px', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
                          ✕ This order was cancelled
                        </div>
                      ) : (
                        <div style={{ marginBottom: '28px' }}>
                          <p className="cin-label no-line" style={{ marginBottom: '18px' }}>Order Tracking</p>
                          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            {STEPS.map((step, idx) => {
                              const done = idx <= currentStep;
                              const isCurrent = idx === currentStep;
                              const isLast = idx === STEPS.length - 1;
                              return (
                                <div key={step.key} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                                  {!isLast && (
                                    <div style={{ position: 'absolute', top: '15px', left: '50%', width: '100%', height: '3px', background: idx < currentStep ? 'var(--cin-accent)' : 'var(--cin-surface-2)', zIndex: 0 }} />
                                  )}
                                  <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: done ? 'var(--cin-accent)' : 'var(--cin-surface-2)',
                                    border: done ? '2px solid var(--cin-accent)' : '2px solid var(--cin-border-strong)',
                                    color: done ? 'var(--cin-accent-ink)' : 'var(--cin-muted)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto', position: 'relative', zIndex: 1, fontSize: '14px',
                                    boxShadow: isCurrent ? '0 0 0 5px var(--cin-glow)' : 'none',
                                    transition: 'all .3s',
                                  }}>
                                    {done ? (isLast && isCurrent ? step.icon : '✓') : step.icon}
                                  </div>
                                  <p style={{ fontSize: '11px', marginTop: '8px', color: done ? 'var(--cin-text)' : 'var(--cin-faint)', fontWeight: isCurrent ? 700 : 500 }}>{step.label}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* ITEMS */}
                      {order.items.map((item, j) => (
                        <div key={j} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '12px 0', borderBottom: '1px solid var(--cin-border)' }}>
                          <div>
                            <p style={{ fontSize: '14px', color: 'var(--cin-text)', fontWeight: '600', marginBottom: '2px' }}>{item.product_name}</p>
                            <p style={{ fontSize: '12px', color: 'var(--cin-faint)' }}>{item.quantity} × ₹{parseFloat(item.price).toLocaleString('en-IN')}</p>
                          </div>
                          <span className="cin-mono" style={{ fontSize: '14px', color: 'var(--cin-text)' }}>₹{parseFloat(item.subtotal).toLocaleString('en-IN')}</span>
                        </div>
                      ))}

                      {order.shipping_address && (
                        <div className="cin-panel" style={{ padding: '14px 16px', marginTop: '12px' }}>
                          <p className="cin-label no-line" style={{ marginBottom: '6px', fontSize: '10px' }}>Delivery Address</p>
                          <p style={{ fontSize: '13px', color: 'var(--cin-muted)', lineHeight: '1.5' }}>{order.shipping_address}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                </Reveal>
              );
            })}
          </div>
        )}
    </PageShell>
  );
}

export default Orders;
