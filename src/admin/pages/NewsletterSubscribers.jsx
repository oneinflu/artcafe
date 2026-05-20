import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';

const NewsletterSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const data = await apiFetch('/newsletter/subscribers');
      setSubscribers(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching subscribers:", err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subscriber?")) return;
    try {
      await apiFetch(`/newsletter/subscribers/${id}`, {
        method: 'DELETE'
      });
      setSubscribers(subscribers.filter(sub => sub._id !== id));
    } catch (err) {
      alert("Error deleting subscriber: " + err.message);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-page newsletter-subscribers">
      <h1>Newsletter Subscribers</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        View and manage users who have subscribed to the ARTCAFE newsletter.
      </p>

      {loading ? <p>Loading subscribers...</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email Address</th>
                <th>Subscribed Date</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No newsletter subscribers found.
                  </td>
                </tr>
              ) : (
                subscribers.map(sub => (
                  <tr key={sub._id}>
                    <td>
                      <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{sub.email}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#666' }}>
                      {formatDate(sub.subscribedAt)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn-icon delete" 
                        onClick={() => handleDelete(sub._id)}
                        style={{ fontSize: '1.1rem', cursor: 'pointer', background: 'none', border: 'none' }}
                        title="Remove Subscriber"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NewsletterSubscribers;
