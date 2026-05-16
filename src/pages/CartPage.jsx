import React from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../utils/helpers';

const CartPage = ({ cart, updateQty, removeItem }) => {
  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);
  const total = subtotal;

  return (
    <main className="cart-page">
      <div className="container">
        <h1>SHOPPING CART</h1>
        {cart.length === 0 ? (
          <div className="cart-empty-state" style={{ minHeight: '60vh' }}>
            <div className="empty-icon">🛍️</div>
            <h2>YOUR CART IS WAITING</h2>
            <Link to="/shop" className="btn-primary">Back to Shop</Link>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-left">
              <div className="cart-full-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-full-item">
                    <div className="p-info">
                      <img src={resolveImageUrl(item.img)} alt={item.name} />
                      <div>
                        <h4>{item.name}</h4>
                        <p>₹{item.price}</p>
                      </div>
                    </div>
                    <div className="p-qty">
                      <div className="qty-controls">
                        <button onClick={() => updateQty(item.id, -1)}>-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)}>+</button>
                      </div>
                    </div>
                    <div className="p-total">
                      <span>₹{(parseFloat(item.price) * item.qty).toFixed(2)}</span>
                      <button className="remove-link" onClick={() => removeItem(item.id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="cart-summary">
              <h3>ORDER SUMMARY</h3>
              <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="summary-row total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
              <button className="btn-primary full-width">Proceed to Checkout</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default CartPage;
