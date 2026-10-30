// src/hooks/useStorefrontProducts.js
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

export function useStorefrontProducts(filterType = "all") {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsRef = ref(db, "ttsCollection/products");
    
    // Listen to Firebase products
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let productsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key]
        }));

        // Filter only active products (visible on store)
        productsArray = productsArray.filter((p) => p.status === "active");

        // Apply the specific filter
        if (filterType === "bestSellers") {
          productsArray = productsArray.filter((p) => p.isBestSeller === true);
        } else if (filterType === "newArrivals") {
          productsArray = productsArray.filter((p) => p.isNewArrival === true);
        } else if (filterType === "featured") {
          productsArray = productsArray.filter((p) => p.isFeatured === true);
        }

        // Sort by newest first
        productsArray.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        setProducts(productsArray);
      } else {
        setProducts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filterType]);

  return { products, loading };
}