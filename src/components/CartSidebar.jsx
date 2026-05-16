import React from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../utils/helpers';

const CartSidebar = ({ isOpen, onClose, cart, updateQty, removeItem }) => {
  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);

  return (
    <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>YOUR CART ({cart.length})</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <div className="empty-icon">🛍️</div>
              <h2>YOUR CART IS EMPTY</h2>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <Link to="/shop" className="btn-primary" onClick={onClose}>Start Shopping</Link>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img">
                  <img src={resolveImageUrl(item.img)} alt={item.name} />
                </div>
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p className="item-price">₹{item.price}</p>
                  <div className="qty-controls">
                    <button onClick={() => updateQty(item.id, -1)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                </div>
                <button className="remove-item" onClick={() => removeItem(item.id)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="subtotal">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <p className="shipping-note">Shipping & taxes calculated at checkout</p>
            <Link to="/cart" className="btn-primary checkout-btn" onClick={onClose}>View Cart</Link>
            <button className="btn-minimal" onClick={onClose}>Continue Shopping</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
