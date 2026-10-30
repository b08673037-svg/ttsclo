import { ref, push, set, onValue, remove, update } from "firebase/database";
import { db } from "../firebase";

const PRODUCTS_PATH = "ttsCollection/products";

// 1. Listen to all products in real-time
export const subscribeToProducts = (callback) => {
  const productsRef = ref(db, PRODUCTS_PATH);
  const unsubscribe = onValue(productsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Convert object of objects to array of objects with IDs
      const productsArray = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      callback(productsArray);
    } else {
      callback([]);
    }
  });
  return unsubscribe; // Return cleanup function
};

// 2. Create a new product
export const createProduct = async (productData) => {
  const productsRef = ref(db, PRODUCTS_PATH);
  const newProductRef = push(productsRef); // Generate unique ID
  
  const product = {
    ...productData,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  await set(newProductRef, product);
  return newProductRef.key;
};

// 3. Update an existing product
export const updateProduct = async (productId, productData) => {
  const productRef = ref(db, `${PRODUCTS_PATH}/${productId}`);
  await update(productRef, {
    ...productData,
    updatedAt: Date.now(),
  });
};

// 4. Delete a product
export const deleteProduct = async (productId) => {
  const productRef = ref(db, `${PRODUCTS_PATH}/${productId}`);
  await remove(productRef);
};