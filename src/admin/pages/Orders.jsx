import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await apiFetch('/orders');
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      fetchOrders();
    } catch (err) {
      alert("Error updating order: " + err.message);
    }
  };

  const handleShip = async (id) => {
    if (!window.confirm("Are you sure you want to create a Shiprocket shipment for this order?")) return;
    try {
      await apiFetch(`/orders/${id}/ship`, {
        method: 'POST'
      });
      fetchOrders();
      alert("Shipment created successfully!");
    } catch (err) {
      alert("Error creating shipment: " + err.message);
    }
  };

  return (
    <div className="admin-page orders">
      <h1>Order Management</h1>

      {loading ? <p>Loading...</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    #{order._id.slice(-8).toUpperCase()}
                    {order.shiprocket?.shipmentId && (
                      <div style={{ fontSize: '0.65rem', color: '#ff6b00', marginTop: '5px' }}>
                        🚀 ID: {order.shiprocket.shipmentId}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.customer?.name || 'Guest'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{order.customer?.email}</div>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 700 }}>₹{order.totalAmount}</td>
                  <td>
                    <span className={`status-pill ${order.paymentStatus === 'paid' ? 'delivered' : 'cancelled'}`}>
                      {order.paymentStatus?.toUpperCase() || 'PENDING'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${order.status?.toLowerCase()}`}>{order.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select 
                        value={order.status} 
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="admin-select-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {!order.shiprocket?.shipmentId && order.paymentStatus === 'paid' && (
                        <button className="btn-primary btn-sm" onClick={() => handleShip(order._id)}>🚀 Ship</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
