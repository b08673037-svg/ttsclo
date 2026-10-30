import { ref, onValue, push, set, update, remove } from "firebase/database";
import { db } from "../firebase";

const MESSAGES_PATH = "ttsCollection/contactMessages";

// 1. Save a new message (public - from contact form)
export const saveContactMessage = async (messageData) => {
  const messagesRef = ref(db, MESSAGES_PATH);
  const newRef = push(messagesRef);
  await set(newRef, {
    ...messageData,
    read: false,
    createdAt: Date.now(),
  });
  return newRef.key;
};

// 2. Subscribe to all messages (admin)
export const subscribeToContactMessages = (callback) => {
  const messagesRef = ref(db, MESSAGES_PATH);
  return onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const arr = Object.keys(data).map((k) => ({ id: k, ...data[k] }));
      arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(arr);
    } else {
      callback([]);
    }
  });
};

// 3. Mark a message as read
export const markMessageAsRead = async (id) => {
  await update(ref(db, `${MESSAGES_PATH}/${id}`), { read: true });
};

// 4. Delete a message
export const deleteContactMessage = async (id) => {
  await remove(ref(db, `${MESSAGES_PATH}/${id}`));
};