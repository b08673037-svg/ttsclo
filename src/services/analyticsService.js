import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

// Subscribe to all data needed for analytics
export const subscribeToAnalytics = (callback) => {
  const data = { orders: [], products: [], customers: [], categories: [] };
  const initialized = { orders: false, products: false, customers: false, categories: false };

  const check = () => {
    if (Object.values(initialized).every(Boolean)) callback({ ...data });
  };

  const sub = (path, key) => {
    return onValue(ref(db, `ttsCollection/${path}`), (snap) => {
      const val = snap.val();
      data[key] = val ? Object.keys(val).map((k) => ({ id: k, ...val[k] })) : [];
      initialized[key] = true;
      check();
    });
  };

  const unsubs = [
    sub("orders", "orders"),
    sub("products", "products"),
    sub("customers", "customers"),
    sub("categories", "categories"),
  ];

  return () => unsubs.forEach((u) => u());
};

// Helpers
export const filterByRange = (orders, days) => {
  const now = Date.now();
  const cutoff = now - days * 86400000;
  return orders.filter((o) => (o.createdAt || 0) >= cutoff);
};

export const filterPreviousRange = (orders, days) => {
  const now = Date.now();
  const currentCutoff = now - days * 86400000;
  const prevCutoff = currentCutoff - days * 86400000;
  return orders.filter((o) => {
    const ts = o.createdAt || 0;
    return ts >= prevCutoff && ts < currentCutoff;
  });
};

// Generate daily series
export const generateDailySeries = (orders, days) => {
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const start = new Date(d).setHours(0, 0, 0, 0);
    const end = start + 86400000;
    const dayOrders = orders.filter((o) => o.createdAt >= start && o.createdAt < end);
    const revenue = dayOrders.reduce((s, o) => s + Number(o.total || 0), 0);
    series.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      revenue,
      orders: dayOrders.length,
    });
  }
  return series;
};

// CSV Export
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};