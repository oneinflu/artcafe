import React, { useState } from 'react';

const BulkOrdersPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', companyName: '',
    quantity: '50 - 100 items',
    productType: 'Apparel (Shirts/Hoodies)',
    projectDetails: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="bulk-page" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2>THANK YOU!</h2>
        <p style={{ color: '#aaa', marginTop: '16px' }}>We'll reach out to you within 24 hours.</p>
      </main>
    );
  }

  return (
    <main className="bulk-page">
      <section className="bulk-hero-v2">
        <div className="container">
          <h1>PREMIUM BULK SOLUTIONS</h1>
        </div>
      </section>
      <section className="section bulk-inquiry">
        <div className="container">
          <form className="bulk-form" onSubmit={handleSubmit}>
            <input type="text" placeholder="Name" required onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <input type="email" placeholder="Email" required onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <input type="text" placeholder="Company Name" onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
            <select onChange={e => setFormData({ ...formData, quantity: e.target.value })}>
              <option>50 - 100 items</option>
              <option>100 - 500 items</option>
              <option>500 - 1000 items</option>
              <option>1000+ items</option>
            </select>
            <select onChange={e => setFormData({ ...formData, productType: e.target.value })}>
              <option>Apparel (Shirts/Hoodies)</option>
              <option>Tote Bags</option>
              <option>Mugs & Drinkware</option>
              <option>Posters & Wall Art</option>
              <option>Stickers</option>
              <option>Other</option>
            </select>
            <textarea placeholder="Project Details" required rows="5" onChange={e => setFormData({ ...formData, projectDetails: e.target.value })}></textarea>
            <button type="submit" className="btn-primary">Send Inquiry</button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default BulkOrdersPage;
