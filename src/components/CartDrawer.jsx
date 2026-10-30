import { Link } from "react-router-dom";
import { FiX, FiTrash2, FiMinus, FiPlus, FiShoppingBag } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import "./CartDrawer.css";

export default function CartDrawer({ isOpen, onClose }) {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  const formatPrice = (p) => `Rs. ${Number(p).toLocaleString()}`;

  return (
    <>
      <div className={`cart-overlay ${isOpen ? "open" : ""}`} onClick={onClose}></div>
      <aside className={`cart-drawer ${isOpen ? "open" : ""}`}>
        <div className="cart-drawer__header">
          <h2><FiShoppingBag /> Your Cart ({cartCount})</h2>
          <button onClick={onClose} aria-label="Close cart"><FiX /></button>
        </div>

        <div className="cart-drawer__body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <FiShoppingBag size={48} />
              <p>Your cart is empty.</p>
              <Link to="/collection" onClick={onClose}>Start Shopping</Link>
            </div>
          ) : (
            cartItems.map((item) => {
              const price = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
              return (
                <div className="cart-item" key={item.id}>
                  <img src={item.imageUrl || ""} alt={item.name} />
                  <div className="cart-item__info">
                    <h4>{item.name}</h4>
                    <p className="cart-item__price">{formatPrice(price)}</p>
                    <div className="cart-item__qty">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><FiMinus /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><FiPlus /></button>
                    </div>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}><FiTrash2 /></button>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-total-row">
              <span>Subtotal:</span>
              <span className="cart-total">{formatPrice(cartTotal)}</span>
            </div>
            <p className="cart-note">Delivery fee calculated at checkout.</p>
            <Link to="/checkout" onClick={onClose} className="checkout-btn">
              Proceed to Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}