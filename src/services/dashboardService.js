import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

export const subscribeToDashboardData = (callback) => {
  const data = {
    products: [],
    orders: [],
    customers: [],
    subscribers: [],
    categories: [],
  };

  const initialized = {
    products: false,
    orders: false,
    customers: false,
    subscribers: false,
    categories: false,
  };

  const checkCompletion = () => {
    if (Object.values(initialized).every(Boolean)) {
      callback({ ...data });
    }
  };

  const handleError = (key, error) => {
    console.error(`Error loading ${key}:`, error);
    initialized[key] = true;
    checkCompletion();
  };

  const subscribe = (path, key) => {
    const refPath = ref(db, `ttsCollection/${path}`);
    return onValue(
      refPath,
      (snapshot) => {
        const val = snapshot.val();
        data[key] = val ? Object.keys(val).map((k) => ({ id: k, ...val[k] })) : [];
        initialized[key] = true;
        checkCompletion();
      },
      (error) => handleError(key, error)
    );
  };

  const unsubProducts = subscribe("products", "products");
  const unsubOrders = subscribe("orders", "orders");
  const unsubCustomers = subscribe("customers", "customers");
  const unsubSubscribers = subscribe("subscribers", "subscribers");
  const unsubCategories = subscribe("categories", "categories");

  return () => {
    unsubProducts();
    unsubOrders();
    unsubCustomers();
    unsubSubscribers();
    unsubCategories();
  };
};