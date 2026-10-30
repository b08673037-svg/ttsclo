import { ref, onValue, update, remove } from "firebase/database";
import { db } from "../firebase";

const ORDERS_PATH = "ttsCollection/orders";

export const subscribeToOrders = (callback, onError) => {
  const ordersRef = ref(db, ORDERS_PATH);
  const unsubscribe = onValue(
    ordersRef,
    (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ordersArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        ordersArray.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        callback(ordersArray);
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error("Firebase read error:", error);
      if (onError) onError(error);
      else callback([]); // Fallback so it doesn't hang
    }
  );
  return unsubscribe;
};

export const updateOrderStatus = async (orderId, newStatus) => {
  const orderRef = ref(db, `${ORDERS_PATH}/${orderId}`);
  await update(orderRef, {
    status: newStatus,
    updatedAt: Date.now(),
  });
};

export const deleteOrder = async (orderId) => {
  const orderRef = ref(db, `${ORDERS_PATH}/${orderId}`);
  await remove(orderRef);
};