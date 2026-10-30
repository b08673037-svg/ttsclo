import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiUser, FiMapPin, FiPackage, FiClock,
  FiShoppingBag, FiDollarSign, FiCheck,
} from "react-icons/fi";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import { updateOrderStatus } from "../../services/orderService";
import "./AdminOrderDetails.css";

const STATUS_OPTIONS = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

const STATUS_COLORS = {
  Pending: "pending", Confirmed: "confirmed", Processing: "processing",
  Shipped: "shipped", Delivered: "delivered", Cancelled: "cancelled",
};

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const orderRef = ref(db, `ttsCollection/orders/${id}`);
    const unsub = onValue(orderRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setOrder({ id, ...data });
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const handleStatus = async (e) => {
    setUpdating(true);
    try {
      await updateOrderStatus(id, e.target.value);
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" /><p>Loading order...</p>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="admin-loading-screen">
        <FiPackage size={40} /><p>Order not found.</p>
      </div>
    );
  }

  const items = order.items ? Object.values(order.items) : [];
  const subtotal = items.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 1), 0);

  return (
    <div className="admin-order-details">
      <button className="od-back-btn" onClick={() => navigate("/admin/orders")}>
        <FiArrowLeft /> Back to Orders
      </button>

      <div className="od-header">
        <div>
          <h2 className="page-title">Order #TTS-{id.slice(-6).toUpperCase()}</h2>
          <p className="page-subtitle">
            Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
          </p>
        </div>
        <div className="od-status-control">
          <label>Update Status</label>
          <select value={order.status || "Pending"} onChange={handleStatus} disabled={updating}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="od-grid">
        <div className="od-card">
          <h3><FiUser /> Customer</h3>
          <div className="od-row"><span>Name:</span><strong>{order.customerName || "Guest"}</strong></div>
          <div className="od-row"><span>Phone:</span><strong>{order.phone || "—"}</strong></div>
          <div className="od-row"><span>Email:</span><strong>{order.email || "—"}</strong></div>
        </div>

        <div className="od-card">
          <h3><FiMapPin /> Delivery</h3>
          {order.address ? (
            <>
              <div className="od-row"><span>Street:</span><strong>{order.address.street || "—"}</strong></div>
              <div className="od-row"><span>City:</span><strong>{order.address.city || "—"}</strong></div>
              <div className="od-row"><span>Postal:</span><strong>{order.address.postalCode || "—"}</strong></div>
            </>
          ) : <p className="text-muted">No address provided</p>}
        </div>

        <div className="od-card">
          <h3><FiDollarSign /> Payment</h3>
          <div className="od-row"><span>Method:</span><strong>{order.paymentMethod || "COD"}</strong></div>
          <div className="od-row"><span>Status:</span><strong>{order.paymentStatus || "Pending"}</strong></div>
          <div className="od-row">
            <span>Order Status:</span>
            <span className={`od-status ${STATUS_COLORS[order.status] || "pending"}`}>{order.status || "Pending"}</span>
          </div>
        </div>
      </div>

      <div className="od-card od-items-card">
        <h3><FiShoppingBag /> Ordered Items</h3>
        <table className="od-items-table">
          <thead>
            <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            {items.length > 0 ? items.map((item, i) => (
              <tr key={i}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>Rs. {Number(item.price || 0).toLocaleString()}</td>
                <td>Rs. {(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}</td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="text-muted">No items</td></tr>
            )}
          </tbody>
        </table>

        <div className="od-totals">
          <div className="od-total-row"><span>Subtotal:</span><span>Rs. {subtotal.toLocaleString()}</span></div>
          <div className="od-total-row"><span>Delivery Fee:</span><span>Rs. {Number(order.deliveryFee || 0).toLocaleString()}</span></div>
          <div className="od-total-row od-grand"><span>Grand Total:</span><span>Rs. {Number(order.total || 0).toLocaleString()}</span></div>
        </div>
      </div>
    </div>
  );
}