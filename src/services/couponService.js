import { ref, onValue, push, set, update, remove } from "firebase/database";
import { db } from "../firebase";

const COUPONS_PATH = "ttsCollection/coupons";

// 1. Subscribe to all coupons
export const subscribeToCoupons = (callback) => {
  const couponsRef = ref(db, COUPONS_PATH);
  return onValue(couponsRef, (snapshot) => {
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

// 2. Create a new coupon
export const createCoupon = async (couponData) => {
  const couponsRef = ref(db, COUPONS_PATH);
  const newRef = push(couponsRef);
  await set(newRef, {
    ...couponData,
    code: couponData.code.trim().toUpperCase(),
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return newRef.key;
};

// 3. Update an existing coupon
export const updateCoupon = async (id, couponData) => {
  const couponRef = ref(db, `${COUPONS_PATH}/${id}`);
  await update(couponRef, {
    ...couponData,
    code: couponData.code.trim().toUpperCase(),
    updatedAt: Date.now(),
  });
};

// 4. Delete a coupon
export const deleteCoupon = async (id) => {
  await remove(ref(db, `${COUPONS_PATH}/${id}`));
};

// 5. Toggle active status
export const toggleCouponStatus = async (id, isActive) => {
  await update(ref(db, `${COUPONS_PATH}/${id}`), {
    isActive,
    updatedAt: Date.now(),
  });
};

// 6. Validate a coupon (used at checkout later)
export const validateCoupon = async (code, subtotal) => {
  return new Promise((resolve, reject) => {
    const couponsRef = ref(db, COUPONS_PATH);
    const unsub = onValue(
      couponsRef,
      (snapshot) => {
        unsub();
        const data = snapshot.val();
        if (!data) {
          reject("Coupon not found");
          return;
        }
        const normalized = code.trim().toUpperCase();
        const entry = Object.entries(data).find(
          ([, c]) => (c.code || "").toUpperCase() === normalized
        );
        if (!entry) {
          reject("Invalid coupon code");
          return;
        }
        const [id, coupon] = entry;

        if (!coupon.isActive) {
          reject("This coupon is no longer active");
          return;
        }
        if (coupon.expiresAt && Date.now() > coupon.expiresAt) {
          reject("This coupon has expired");
          return;
        }
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          reject("This coupon has reached its usage limit");
          return;
        }
        if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
          reject(`Minimum order value is Rs. ${coupon.minOrderValue}`);
          return;
        }

        let discount = 0;
        if (coupon.discountType === "percentage") {
          discount = (subtotal * coupon.discountValue) / 100;
        } else {
          discount = coupon.discountValue;
        }
        discount = Math.min(discount, subtotal);

        resolve({ id, coupon, discount });
      },
      (err) => {
        unsub();
        reject(err.message);
      }
    );
  });
};