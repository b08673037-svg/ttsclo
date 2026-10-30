import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch, FiPackage, FiPhone, FiTag, FiClock, FiCheck,
  FiMapPin, FiShoppingBag, FiX, FiTruck, FiUser, FiDollarSign,
} from "react-icons/fi";
import { ref, get } from "firebase/database";
import { db } from "../firebase";
import "./TrackOrder.css";

const STATUS_STEPS = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

export default function TrackOrder() {
  const [mode, setMode] = useState("phone"); // "phone" | "orderId"
  const [phone, setPhone] = useState("");
  const [orderId, setOrderId] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setResults(null);

    const trimmedPhone = phone.trim().replace(/\s+/g, "");
    const trimmedOrder = orderId.trim().toUpperCase();

    if (mode === "phone" && !trimmedPhone) {
      setError("Please enter your phone number.");
      return;
    }
    if (mode === "orderId" && !trimmedOrder) {
      setError("Please enter your order ID.");
      return;
    }

    setLoading(true);

    try {
      const snapshot = await get(ref(db, "ttsCollection/orders"));
      const data = snapshot.val();

      if (!data) {
        setError("No orders found in our system yet.");
        setLoading(false);
        return;
      }

      const allOrders = Object.keys(data).map((k) => ({ id: k, ...data[k] }));

      let matches = [];

      if (mode === "phone") {
        matches = allOrders.filter((o) => {
          const orderPhone = (o.phone || "").replace(/\s+/g, "");
          return orderPhone === trimmedPhone || orderPhone.endsWith(trimmedPhone);
        });
      } else {
        matches = allOrders.filter((o) =>
          o.id.toUpperCase().endsWith(trimmedOrder)
        );
      }

      if (matches.length === 0) {
        setError(
          mode === "phone"
            ? "No orders found with this phone number."
            : "No orders found with this order ID."
        );
        setLoading(false);
        return;
      }

      matches.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setResults(matches);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setResults(null);
    setError("");
    setPhone("");
    setOrderId("");
  };

  const getStatusIndex = (status) => {
    const idx = STATUS_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="track-page">
      <div className="track-container">

        {/* HEADER */}
        <div className="track-header">
          <div className="track-badge">
            <FiTruck />
            <span>ORDER TRACKING</span>
          </div>
          <h1 className="track-title">Track Your Order</h1>
          <p className="track-desc">
            Enter your phone number or order ID to see your order status.
          </p>
        </div>

        {/* SEARCH CARD */}
        {!results && (
          <div className="track-card">
            <div className="track-card-header">
              <div className="track-icon-box">
                <FiSearch />
              </div>
              <div className="track-header-text">
                <h2>Find Your Order</h2>
                <p>We'll show all orders linked to your details</p>
              </div>
            </div>

            <div className="track-divider"></div>

            {/* Mode tabs */}
            <div className="track-mode-tabs">
              <button
                type="button"
                className={`track-mode-tab ${mode === "phone" ? "active" : ""}`}
                onClick={() => { setMode("phone"); setError(""); }}
              >
                <FiPhone /> Phone Number
              </button>
              <button
                type="button"
                className={`track-mode-tab ${mode === "orderId" ? "active" : ""}`}
                onClick={() => { setMode("orderId"); setError(""); }}
              >
                <FiTag /> Order ID
              </button>
            </div>

            <form className="track-form" onSubmit={handleSearch}>
              {mode === "phone" ? (
                <div className="track-input-group">
                  <label>
                    <FiPhone className="label-icon" /> PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    placeholder="+92 300 0000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              ) : (
                <div className="track-input-group">
                  <label>
                    <FiTag className="label-icon" /> ORDER ID (LAST 6 CHARS)
                  </label>
                  <input
                    type="text"
                    placeholder="ABC123"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
              )}

              {error && <p className="track-error">{error}</p>}

              <button type="submit" className="track-btn" disabled={loading}>
                <FiSearch /> {loading ? "Searching..." : "Track Order"}
              </button>
            </form>
          </div>
        )}

        {/* RESULTS */}
        {results && results.length > 0 && (
          <div className="track-results">
            <div className="results-header">
              <h3>
                {results.length} order{results.length > 1 ? "s" : ""} found
              </h3>
              <button className="btn-clear" onClick={resetSearch}>
                <FiX /> Track another
              </button>
            </div>

            {results.map((order) => {
              const currentIdx = getStatusIndex(order.status);
              const items = order.items ? Object.values(order.items) : [];

              return (
                <div className="order-card" key={order.id}>
                  {/* CARD HEADER */}
                  <div className="order-card-header">
                    <div>
                      <span className="order-id-label">ORDER ID</span>
                      <p className="order-id-value">
                        #TTS-{order.id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                    <div className={`order-status-badge ${order.status?.toLowerCase() || "pending"}`}>
                      {order.status || "Pending"}
                    </div>
                  </div>

                  {/* TIMELINE */}
                  <div className="order-timeline">
                    {STATUS_STEPS.map((step, idx) => {
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;
                      return (
                        <div
                          className={`timeline-step ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}
                          key={step}
                        >
                          <div className="timeline-icon">
                            {isCompleted ? <FiCheck /> : <FiClock />}
                          </div>
                          <span className="timeline-label">{step}</span>
                          {idx < STATUS_STEPS.length - 1 && (
                            <div className={`timeline-line ${idx < currentIdx ? "completed" : ""}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* DETAILS GRID */}
                  <div className="order-details-grid">
                    <div>
                      <span className="detail-label">Order Date</span>
                      <p>{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <span className="detail-label">Payment</span>
                      <p>{order.paymentMethod || "Cash on Delivery"}</p>
                    </div>
                    <div>
                      <span className="detail-label">Total</span>
                      <p className="order-total-highlight">
                        Rs. {Number(order.total || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* CUSTOMER + ADDRESS */}
                  <div className="order-info-row">
                    <div className="order-info-block">
                      <FiUser className="info-icon" />
                      <div>
                        <span className="detail-label">Customer</span>
                        <p>{order.customerName || "Guest"}</p>
                      </div>
                    </div>
                    <div className="order-info-block">
                      <FiMapPin className="info-icon" />
                      <div>
                        <span className="detail-label">Delivery Address</span>
                        <p>
                          {order.address
                            ? `${order.address.street || ""}, ${order.address.city || ""}`
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ITEMS */}
                  {items.length > 0 && (
                    <div className="order-items">
                      <div className="detail-label">
                        <FiShoppingBag /> Items ({items.length})
                      </div>
                      <ul>
                        {items.map((item, i) => (
                          <li key={i}>
                            <span>{item.quantity}x {item.name}</span>
                            <span>Rs. {(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}

            <Link to="/collection" className="track-shop-link">
              Continue Shopping →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}