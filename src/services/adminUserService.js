import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set, onValue, update, remove, get } from "firebase/database";
import { auth, db } from "../firebase";

// 1. Listen to all admin users
export const subscribeToAdminUsers = (callback) => {
  const adminsRef = ref(db, "ttsCollection/admins");
  return onValue(adminsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const arr = Object.keys(data).map((uid) => ({ uid, ...data[uid] }));
      callback(arr);
    } else {
      callback([]);
    }
  });
};

// 2. Create a new user WITHOUT logging out the current admin
export const createAdminUser = async (email, password, role, name) => {
  // Get current config to create a secondary instance
  const firebaseConfig = auth.app.options;
  
  // Create a temporary secondary app so we don't log out the current admin
  const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    // Create the user in Firebase Auth using the secondary instance
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const newUser = userCredential.user;

    if (name) {
      await updateProfile(newUser, { displayName: name });
    }

    // Save their role in the Realtime Database
    await set(ref(db, `ttsCollection/admins/${newUser.uid}`), {
      email: email,
      name: name || "",
      role: role, // 'admin' or 'cashier'
      createdAt: Date.now(),
    });

    return newUser.uid;
  } finally {
    // Always clean up the secondary app
    await deleteApp(secondaryApp);
  }
};

// 3. Update a user's role
export const updateAdminRole = async (uid, newRole) => {
  await update(ref(db, `ttsCollection/admins/${uid}`), {
    role: newRole,
  });
};

// 4. Delete a user (removes from database, but you must also delete from Auth manually)
export const deleteAdminUser = async (uid) => {
  await remove(ref(db, `ttsCollection/admins/${uid}`));
};

// 5. Get current user's role
export const getUserRole = async (uid) => {
  const snap = await get(ref(db, `ttsCollection/admins/${uid}`));
  return snap.exists() ? snap.val().role : null;
};