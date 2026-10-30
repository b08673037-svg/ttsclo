import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiMail, FiLogOut, FiShoppingBag, FiPackage } from "react-icons/fi";
import { signOutCustomer, subscribeToAuth } from "../services/customerAuthService";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import "./Account.css";

export default function Account() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 2500);

    const unsubAuth = subscribeToAuth((u) => {
      if (!isMounted) return;
      setUser(u);
      
      if (!u) {
        navigate("/login");
        setLoading(false);
      } else {
        // Fetch orders
        const ordersRef = ref(db, "ttsCollection/orders");
        const unsubOrders = onValue(ordersRef, (snap) => {
          if (!isMounted) return;
          const data = snap.val();
          if (data) {
            const arr = Object.keys(data)
              .map((k) => ({ id: k, ...data[k] }))
              .filter((o) => o.email === u.email)
              .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            setOrders(arr);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching orders:", error);
          setLoading(false);
        });

        return () => unsubOrders();
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      unsubAuth();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await signOutCustomer();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="account-loading">
        <div className="spinner" style={{ marginBottom: '16px' }}></div>
        Loading your account...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="account-page">
      <div className="account-container">
        <div className="account-header">
          <div className="account-avatar">
            <FiUser />
          </div>
          <div>
            <h1 className="account-name">{user.displayName || "Customer"}</h1>
            <p className="account-email"><FiMail /> {user.email}</p>
          </div>
          <button className="account-logout" onClick={handleLogout}>
            <FiLogOut /> Sign Out
          </button>
        </div>

        <div className="account-stats">
          <div className="account-stat">
            <FiShoppingBag />
            <div>
              <span>{orders.length}</span>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="account-stat">
            <FiPackage />
            <div>
              <span>
                {orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length}
              </span>
              <p>Active Orders</p>
            </div>
          </div>
        </div>

        <div className="account-section">
          <h2 className="account-section-title">Order History</h2>
          {orders.length === 0 ? (
            <div className="account-empty">
              <FiShoppingBag size={40} />
              <p>No orders yet.</p>
              <Link to="/collection">Start Shopping</Link>
            </div>
          ) : (
            <div className="account-orders">
              {orders.map((o) => (
                <div className="account-order-card" key={o.id}>
                  <div className="account-order-header">
                    <span className="account-order-id">#TTS-{o.id.slice(-6).toUpperCase()}</span>
                    <span className={`account-order-status ${o.status?.toLowerCase() || "pending"}`}>
                      {o.status || "Pending"}
                    </span>
                  </div>
                  <div className="account-order-body">
                    <div>
                      <span className="account-order-label">Date</span>
                      <span className="account-order-value">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="account-order-label">Items</span>
                      <span className="account-order-value">
                        {o.items ? Object.keys(o.items).length : 0}
                      </span>
                    </div>
                    <div>
                      <span className="account-order-label">Total</span>
                      <span className="account-order-value gold">
                        Rs. {Number(o.total || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Link to={`/track-order?order=${o.id}`} className="account-order-link">
                    Track Order →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}