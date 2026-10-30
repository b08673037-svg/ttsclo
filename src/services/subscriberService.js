import { ref, onValue, push, set, remove } from "firebase/database";
import { db } from "../firebase";

const SUBSCRIBERS_PATH = "ttsCollection/subscribers";

// 1. Listen to all subscribers (admin only)
export const subscribeToSubscribers = (callback) => {
  const subscribersRef = ref(db, SUBSCRIBERS_PATH);
  const unsubscribe = onValue(subscribersRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const subscribersArray = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      // Sort by newest first
      subscribersArray.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(subscribersArray);
    } else {
      callback([]);
    }
  });
  return unsubscribe;
};

// 2. Add new subscriber (public - from footer)
export const addSubscriber = async (email) => {
  const subscribersRef = ref(db, SUBSCRIBERS_PATH);
  const newRef = push(subscribersRef);
  await set(newRef, {
    email: email.toLowerCase().trim(),
    createdAt: Date.now(),
  });
  return newRef.key;
};

// 3. Delete subscriber (admin only)
export const deleteSubscriber = async (subscriberId) => {
  const subscriberRef = ref(db, `${SUBSCRIBERS_PATH}/${subscriberId}`);
  await remove(subscriberRef);
};