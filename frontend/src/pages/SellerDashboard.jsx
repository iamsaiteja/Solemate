import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function SellerDashboard() {
  const [data, setData] = useState({ orders: [], total_revenue: 0 })
  const navigate = useNavigate()
  const token = localStorage.getItem('access')

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetch("http://127.0.0.1:8000/orders/api/seller-dashboard/", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(d => setData(d))
  }, [navigate, token])

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2>Seller Dashboard</h2>

      <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
        <div style={cardStyle}>
          <h3>Total Orders</h3>
          <p style={{ fontSize: "36px", fontWeight: "bold", margin: 0 }}>{data.orders?.length || 0}</p>
        </div>
        <div style={{ ...cardStyle, background: "#27ae60", color: "white" }}>
          <h3>Total Revenue (Paid)</h3>
          <p style={{ fontSize: "36px", fontWeight: "bold", margin: 0 }}>₹{parseFloat(data.total_revenue || 0).toFixed(2)}</p>
        </div>
      </div>

      <h3>Order Items</h3>
      {data.orders?.length === 0 ? (
        <p>No orders received yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              {["Order #", "Product", "Qty", "Price", "Subtotal", "Status", "Payment", "Date"].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.orders?.map((item, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? "white" : "#fafafa" }}>
                <td style={td}>{item.order_number}</td>
                <td style={td}>{item.product_name}</td>
                <td style={td}>{item.quantity}</td>
                <td style={td}>₹{item.price}</td>
                <td style={td}>₹{item.subtotal}</td>
                <td style={td}>
                  <span style={{
                    padding: "3px 8px", borderRadius: "12px", fontSize: "12px",
                    background: item.order_status === 'delivered' ? '#27ae60' : item.order_status === 'cancelled' ? '#e74c3c' : '#f39c12',
                    color: 'white'
                  }}>{item.order_status}</span>
                </td>
                <td style={td}>
                  <span style={{ color: item.payment_status === 'paid' ? 'green' : 'orange', fontWeight: 'bold' }}>
                    {item.payment_status}
                  </span>
                </td>
                <td style={td}>{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const cardStyle = { background: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: "10px", padding: "20px", minWidth: "200px" }
const th = { padding: "10px 12px", textAlign: "left", borderBottom: "2px solid #ddd" }
const td = { padding: "10px 12px", borderBottom: "1px solid #eee" }

export default SellerDashboard