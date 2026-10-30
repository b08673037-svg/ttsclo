import { ref, onValue, update } from "firebase/database";
import { db } from "../firebase";

const SETTINGS_PATH = "ttsCollection/settings";

export const subscribeToSettings = (callback) => {
  const settingsRef = ref(db, SETTINGS_PATH);
  const unsubscribe = onValue(settingsRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || {});
  });
  return unsubscribe;
};

export const updateSettings = async (settingsData) => {
  const settingsRef = ref(db, SETTINGS_PATH);
  await update(settingsRef, settingsData);
};