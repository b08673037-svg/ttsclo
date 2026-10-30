import { ref, onValue, push, set, update, remove } from "firebase/database";
import { db } from "../firebase";

const CATEGORIES_PATH = "ttsCollection/categories";

// 1. Listen to all categories in real-time
export const subscribeToCategories = (callback) => {
  const categoriesRef = ref(db, CATEGORIES_PATH);
  const unsubscribe = onValue(categoriesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const categoriesArray = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      // Sort by display order
      categoriesArray.sort((a, b) => (a.order || 0) - (b.order || 0));
      callback(categoriesArray);
    } else {
      callback([]);
    }
  });
  return unsubscribe;
};

// 2. Create a new category
export const createCategory = async (categoryData) => {
  const categoriesRef = ref(db, CATEGORIES_PATH);
  const newRef = push(categoriesRef);
  await set(newRef, {
    ...categoryData,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return newRef.key;
};

// 3. Update category
export const updateCategory = async (id, categoryData) => {
  const categoryRef = ref(db, `${CATEGORIES_PATH}/${id}`);
  await update(categoryRef, {
    ...categoryData,
    updatedAt: Date.now(),
  });
};

// 4. Delete category
export const deleteCategory = async (id) => {
  const categoryRef = ref(db, `${CATEGORIES_PATH}/${id}`);
  await remove(categoryRef);
};