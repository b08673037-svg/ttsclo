import { ref, onValue, update, remove } from "firebase/database";
import { db } from "../firebase";

const REVIEWS_PATH = "ttsCollection/reviews";

// 1. Subscribe to all reviews
export const subscribeToReviews = (callback) => {
  const reviewsRef = ref(db, REVIEWS_PATH);
  const unsub = onValue(reviewsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const arr = Object.keys(data).map((k) => ({ id: k, ...data[k] }));
      arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(arr);
    } else {
      callback([]);
    }
  });
  return unsub;
};

// 2. Approve or reject a review
export const updateReviewStatus = async (reviewId, status) => {
  // status: "approved" | "rejected" | "pending"
  await update(ref(db, `${REVIEWS_PATH}/${reviewId}`), {
    status,
    moderatedAt: Date.now(),
  });
};

// 3. Toggle featured testimonial
export const toggleFeatured = async (reviewId, isFeatured) => {
  await update(ref(db, `${REVIEWS_PATH}/${reviewId}`), {
    isFeatured,
  });
};

// 4. Delete a review
export const deleteReview = async (reviewId) => {
  await remove(ref(db, `${REVIEWS_PATH}/${reviewId}`));
};