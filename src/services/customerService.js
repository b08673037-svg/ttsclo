import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

const ORDERS_PATH = "ttsCollection/orders";
const CUSTOMERS_PATH = "ttsCollection/customers";

/**
 * Aggregates customers from the orders table.
 * Every unique phone number becomes a customer record.
 * We merge with any manually-created customers if they exist.
 */
export const subscribeToCustomers = (callback) => {
  const ordersRef = ref(db, ORDERS_PATH);
  const customersRef = ref(db, CUSTOMERS_PATH);

  let ordersData = null;
  let manualData = null;

  const build = () => {
    if (ordersData === null || manualData === null) return;

    const customersMap = {};

    // 1. Seed with manual customer records (if any)
    if (manualData) {
      Object.keys(manualData).forEach((key) => {
        customersMap[key] = {
          id: key,
          ...manualData[key],
          orders: [],
          totalSpent: 0,
          orderCount: 0,
          lastOrderAt: 0,
        };
      });
    }

    // 2. Aggregate from orders
    if (ordersData) {
      Object.keys(ordersData).forEach((orderId) => {
        const order = ordersData[orderId];
        const phone = order.phone || order.customerPhone || "";
        const email = order.email || "";
        const name = order.customerName || order.customer || "Guest";

        // Use phone as primary key; fallback to email or orderId
        const custKey = phone
          ? `phone_${phone.replace(/\s+/g, "")}`
          : email
          ? `email_${email.toLowerCase()}`
          : `anon_${orderId}`;

        if (!customersMap[custKey]) {
          customersMap[custKey] = {
            id: custKey,
            name,
            phone,
            email,
            address: order.address || null,
            orders: [],
            totalSpent: 0,
            orderCount: 0,
            lastOrderAt: 0,
            createdAt: order.createdAt || Date.now(),
          };
        }

        const c = customersMap[custKey];
        if (order.status !== "Cancelled") {
          c.totalSpent += Number(order.total || 0);
        }
        c.orderCount += 1;
        if ((order.createdAt || 0) > c.lastOrderAt) {
          c.lastOrderAt = order.createdAt || 0;
        }
        // Prefer latest address
        if (order.address && (order.createdAt || 0) > (c.address?._ts || 0)) {
          c.address = { ...order.address, _ts: order.createdAt || 0 };
        }
        // Prefer latest name if guest was used first
        if (c.name === "Guest" && name !== "Guest") c.name = name;

        c.orders.push({ id: orderId, ...order });
      });
    }

    // Convert to array
    const arr = Object.values(customersMap).map((c) => ({
      ...c,
      orders: c.orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
    }));

    // Sort newest customers first
    arr.sort((a, b) => (b.lastOrderAt || b.createdAt || 0) - (a.lastOrderAt || a.createdAt || 0));

    callback(arr);
  };

  const unsubOrders = onValue(ordersRef, (snap) => {
    ordersData = snap.val() || {};
    build();
  });
  const unsubManual = onValue(customersRef, (snap) => {
    manualData = snap.val() || {};
    build();
  });

  return () => {
    unsubOrders();
    unsubManual();
  };
};