import { useCart } from "../context/CartContext.jsx";

export default function Cart() {
  const { cartItems, clearCart } = useCart();

  return (
    <div className="page">
      <h1>Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty. Add some products to get started.</p>
      ) : (
        <>
          <p>{cartItems.length} item(s) in your cart.</p>
          <button
            onClick={clearCart}
            style={{
              background: "#d8b12d",
              color: "#000",
              padding: "10px 22px",
              borderRadius: "999px",
              fontWeight: 700,
            }}
          >
            Clear Cart
          </button>
        </>
      )}
    </div>
  );
}