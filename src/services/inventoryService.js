import { ref, onValue, push, set, update } from "firebase/database";
import { db } from "../firebase";

const PRODUCTS_PATH = "ttsCollection/products";
const LOGS_PATH = "ttsCollection/inventoryLogs";

// 1. Subscribe to products for inventory tracking
export const subscribeToInventory = (callback) => {
  const productsRef = ref(db, PRODUCTS_PATH);
  return onValue(productsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const arr = Object.keys(data).map((k) => ({ id: k, ...data[k] }));
      arr.sort((a, b) => (a.stock || 0) - (b.stock || 0));
      callback(arr);
    } else {
      callback([]);
    }
  });
};

// 2. Subscribe to stock movement logs
export const subscribeToInventoryLogs = (callback) => {
  const logsRef = ref(db, LOGS_PATH);
  return onValue(logsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const arr = Object.keys(data).map((k) => ({ id: k, ...data[k] }));
      arr.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      callback(arr);
    } else {
      callback([]);
    }
  });
};

// 3. Adjust stock + log the movement
export const adjustStock = async (product, newStock, reason, note = "") => {
  const previousStock = Number(product.stock || 0);
  const newQty = Math.max(0, Number(newStock));

  await update(ref(db, `${PRODUCTS_PATH}/${product.id}`), {
    stock: newQty,
    updatedAt: Date.now(),
  });

  const logRef = push(ref(db, LOGS_PATH));
  await set(logRef, {
    productId: product.id,
    productName: product.name,
    previousStock,
    newStock: newQty,
    change: newQty - previousStock,
    reason: reason || "Manual Adjustment",
    note,
    timestamp: Date.now(),
  });
};

// 4. Restock shortcut
export const restock = async (product, quantity, note = "") => {
  const newStock = Number(product.stock || 0) + Number(quantity);
  return adjustStock(product, newStock, "Restock", note);
};