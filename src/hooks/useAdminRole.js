import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "../firebase";

export function useAdminRole() {
  const [role, setRole] = useState("admin"); // Default to admin to prevent layout flash
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const snap = await get(ref(db, `ttsCollection/admins/${user.uid}`));
        
        if (snap.exists()) {
          // Found in database, use the assigned role
          setRole(snap.val().role);
        } else {
          // NOT found in database (this happens if you forgot to add your UID)
          // We default you to admin so you don't lose access to your own panel.
          setRole("admin"); 
        }
      } catch (err) {
        console.error("Error fetching admin role:", err);
        setRole("admin"); // Fallback to admin on error
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { role, loading };
}