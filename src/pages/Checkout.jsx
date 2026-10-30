import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import { ref, push, set } from "firebase/database";
import { db } from "../firebase";
import { useCart } from "../context/CartContext";
import { useStoreSettings } from "../hooks/useStoreSettings";
import "./Checkout.css";

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { settings } = useStoreSettings();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    street: "",
    city: "Toba Tek Singh",
    postalCode: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const deliveryFee = Number(settings?.deliveryFee || 200);
  const grandTotal = cartTotal + deliveryFee;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.customerName || !form.phone || !form.street) {
      setError("Please fill in your name, phone, and delivery address.");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customerName: form.customerName,
        phone: form.phone,
        email: form.email,
        address: {
          street: form.street,
          city: form.city,
          postalCode: form.postalCode,
        },
        note: form.note,
        items: cartItems.reduce((acc, item) => {
          acc[item.id] = {
            name: item.name,
            price: item.salePrice && item.salePrice > 0 ? item.salePrice : item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl || "",
          };
          return acc;
        }, {}),
        subtotal: cartTotal,
        deliveryFee,
        total: grandTotal,
        paymentMethod: "Cash on Delivery",
        paymentStatus: "Pending",
        status: "Pending",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const ordersRef = ref(db, "ttsCollection/orders");
      const newOrderRef = push(ordersRef);
      await set(newOrderRef, orderData);

      clearCart();
      setSuccess(true);
      
      // Redirect after 3 seconds
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-page">
        <div className="checkout-success">
          <div className="success-icon"><FiCheck /></div>
          <h2>Order Placed!</h2>
          <p>Thank you for shopping with TTS Collection. We'll contact you shortly on WhatsApp to confirm delivery.</p>
          <Link to="/" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h2>Your cart is empty</h2>
          <Link to="/collection" className="btn-primary">Browse Collection</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <Link to="/collection" className="back-link"><FiArrowLeft /> Continue Shopping</Link>
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-layout">
          {/* LEFT: FORM */}
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2>Delivery Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input name="customerName" value={form.customerName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input name="phone" value={form.phone} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Email (Optional)</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Street Address *</label>
              <input name="street" value={form.street} onChange={handleChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input name="city" value={form.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input name="postalCode" value={form.postalCode} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Order Note (Optional)</label>
              <textarea name="note" value={form.note} onChange={handleChange} rows={3} />
            </div>

            {error && <div className="checkout-error">{error}</div>}

            <button type="submit" className="place-order-btn" disabled={loading}>
              {loading ? "Placing Order..." : `Place Order — Rs. ${grandTotal.toLocaleString()}`}
            </button>
            <p className="cod-note">Payment: Cash on Delivery</p>
          </form>

          {/* RIGHT: SUMMARY */}
          <div className="checkout-summary">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {cartItems.map((item) => {
                const price = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
                return (
                  <div className="summary-item" key={item.id}>
                    <img src={item.imageUrl} alt={item.name} />
                    <div>
                      <p className="summary-item__name">{item.name}</p>
                      <p className="summary-item__qty">Qty: {item.quantity}</p>
                    </div>
                    <span className="summary-item__price">Rs. {(price * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            <div className="summary-totals">
              <div className="total-row"><span>Subtotal</span><span>Rs. {cartTotal.toLocaleString()}</span></div>
              <div className="total-row"><span>Delivery</span><span>Rs. {deliveryFee.toLocaleString()}</span></div>
              <div className="total-row grand"><span>Total</span><span>Rs. {grandTotal.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}