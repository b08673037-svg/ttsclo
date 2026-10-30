import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

// Generate notifications from multiple data sources
export const subscribeToNotifications = (callback) => {
  const notifications = [];
  
  // Data sources
  let orders = [];
  let messages = [];
  let products = [];
  
  const buildNotifications = () => {
    notifications.length = 0; // Clear array

    // 1. NEW ORDERS (Pending, created in last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    orders
      .filter((o) => o.status === "Pending" && o.createdAt >= sevenDaysAgo)
      .forEach((o) => {
        notifications.push({
          id: `order-${o.id}`,
          type: "order",
          title: "New Order Placed",
          message: `Order #TTS-${o.id.slice(-4).toUpperCase()} from ${o.customerName || "Guest"} · Rs. ${Number(o.total || 0).toLocaleString()}`,
          link: `/admin/orders/${o.id}`,
          createdAt: o.createdAt,
          read: false,
        });
      });

    // 2. LOW STOCK PRODUCTS
    products
      .filter((p) => p.stock > 0 && p.stock <= 5)
      .forEach((p) => {
        notifications.push({
          id: `stock-${p.id}`,
          type: "stock",
          title: "Low Stock Alert",
          message: `${p.name} is running low (${p.stock} left)`,
          link: `/admin/inventory`,
          createdAt: Date.now() - 1000, // Hint to place them near top
          read: false,
        });
      });

    // 3. NEW MESSAGES (Unread)
    messages
      .filter((m) => !m.read)
      .forEach((m) => {
        notifications.push({
          id: `msg-${m.id}`,
          type: "message",
          title: "New Contact Message",
          message: `${m.name} · ${m.subject}`,
          link: `/admin/messages`,
          createdAt: m.createdAt,
          read: false,
        });
      });

    // Sort newest first
    notifications.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    // Slice for performance
    callback([...notifications].slice(0, 30));
  };

  // Listeners
  const unsubOrders = onValue(ref(db, "ttsCollection/orders"), (snap) => {
    const data = snap.val();
    orders = data ? Object.keys(data).map((k) => ({ id: k, ...data[k] })) : [];
    buildNotifications();
  });

  const unsubProducts = onValue(ref(db, "ttsCollection/products"), (snap) => {
    const data = snap.val();
    products = data ? Object.keys(data).map((k) => ({ id: k, ...data[k] })) : [];
    buildNotifications();
  });

  const unsubMessages = onValue(ref(db, "ttsCollection/contactMessages"), (snap) => {
    const data = snap.val();
    messages = data ? Object.keys(data).map((k) => ({ id: k, ...data[k] })) : [];
    buildNotifications();
  });

  return () => {
    unsubOrders();
    unsubProducts();
    unsubMessages();
  };
};