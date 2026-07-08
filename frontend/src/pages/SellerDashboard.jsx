import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../utils/api"
import PageShell from "../components/ui/PageShell"
import Reveal from "../components/ui/Reveal"
import Tilt from "../components/ui/Tilt"
import "../styles/cinematic.css"

// seller dashboard endpoint api.js BASE_URL root lo untundi (not under /api)
const DASHBOARD_URL = `${API.defaults.baseURL.replace(/\/api$/, "")}/orders/api/seller-dashboard/`

function SellerDashboard() {
  const [data, setData] = useState({ orders: [], total_revenue: 0 })
  const navigate = useNavigate()
  const token = localStorage.getItem('access')

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetch(DASHBOARD_URL, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error(err))
  }, [navigate, token])

  const statusColors = {
    delivered: { color: 'var(--cin-success)', bg: 'var(--cin-success-bg)' },
    cancelled: { color: 'var(--cin-danger)', bg: 'var(--cin-danger-bg)' },
  }

  return (
    <PageShell ghost="SELLER" maxWidth={1040}>
      <Reveal style={{ marginBottom: "30px" }}>
        <span className="cin-label">Admin Console</span>
        <h1 className="cin-title" style={{ fontSize: "clamp(44px, 6vw, 64px)" }}>SELLER DASHBOARD</h1>
      </Reveal>

      <div style={{ display: "flex", gap: "20px", marginBottom: "34px", flexWrap: "wrap" }}>
        <Reveal delay={60} style={{ flex: 1, minWidth: "220px" }}>
          <Tilt className="cin-glass" style={{ padding: "24px" }}>
            <span className="cin-label no-line" style={{ color: "var(--cin-muted)" }}>Total Orders</span>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "52px", margin: "8px 0 0", color: "var(--cin-text)" }}>
              {data.orders?.length || 0}
            </p>
          </Tilt>
        </Reveal>
        <Reveal delay={140} style={{ flex: 1, minWidth: "220px" }}>
          <Tilt className="cin-glass" style={{ padding: "24px" }}>
            <span className="cin-label no-line" style={{ color: "var(--cin-muted)" }}>Total Revenue (Paid)</span>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "52px", margin: "8px 0 0", color: "var(--cin-accent)" }}>
              ₹{parseFloat(data.total_revenue || 0).toFixed(2)}
            </p>
          </Tilt>
        </Reveal>
      </div>

      <Reveal delay={200}>
        <h3 className="cin-label no-line" style={{ marginBottom: "14px" }}>Order Items</h3>
        {data.orders?.length === 0 ? (
          <div className="cin-glass" style={{ padding: "44px", textAlign: "center" }}>
            <p className="cin-sub">No orders received yet.</p>
          </div>
        ) : (
          <div className="cin-glass" style={{ overflow: "auto", padding: "6px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "760px" }}>
              <thead>
                <tr>
                  {["Order #", "Product", "Qty", "Price", "Subtotal", "Status", "Payment", "Date"].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.orders?.map((item, idx) => {
                  const sc = statusColors[item.order_status] || { color: '#f5c542', bg: 'rgba(245,197,66,.14)' }
                  return (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? "transparent" : "var(--cin-surface)" }}>
                      <td style={td} className="cin-mono">{item.order_number}</td>
                      <td style={{ ...td, color: "var(--cin-text)", fontWeight: 600 }}>{item.product_name}</td>
                      <td style={td}>{item.quantity}</td>
                      <td style={td}>₹{item.price}</td>
                      <td style={{ ...td, color: "var(--cin-accent)", fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>₹{item.subtotal}</td>
                      <td style={td}>
                        <span style={{
                          padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 700,
                          textTransform: "uppercase", letterSpacing: "0.5px",
                          background: sc.bg, color: sc.color,
                        }}>{item.order_status}</span>
                      </td>
                      <td style={td}>
                        <span style={{ color: item.payment_status === 'paid' ? 'var(--cin-success)' : '#f5c542', fontWeight: 'bold' }}>
                          {item.payment_status}
                        </span>
                      </td>
                      <td style={td}>{item.date}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Reveal>
    </PageShell>
  )
}

const th = { padding: "12px 14px", textAlign: "left", borderBottom: "1px solid var(--cin-border-strong)", fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--cin-faint)" }
const td = { padding: "12px 14px", borderBottom: "1px solid var(--cin-border)", fontSize: "14px", color: "var(--cin-muted)" }

export default SellerDashboard
