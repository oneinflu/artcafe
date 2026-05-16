const axios = require('axios');
require('dotenv').config();

class ShiprocketService {
  constructor() {
    this.email = process.env.SHIPROCKET_EMAIL;
    this.password = process.env.SHIPROCKET_PASSWORD;
    this.token = null;
    this.baseUrl = 'https://apiv2.shiprocket.in/v1/external';
  }

  async authenticate() {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        email: this.email,
        password: this.password
      });
      this.token = response.data.token;
      return this.token;
    } catch (error) {
      console.error('Shiprocket Auth Error:', error.response?.data || error.message);
      throw new Error('Shiprocket Authentication Failed');
    }
  }

  async createOrder(orderData) {
    if (!this.token) await this.authenticate();
    try {
      const response = await axios.post(`${this.baseUrl}/orders/create/adhoc`, orderData, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Shiprocket Order Creation Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getTracking(shipmentId) {
    if (!this.token) await this.authenticate();
    try {
      const response = await axios.get(`${this.baseUrl}/courier/track/shipment/${shipmentId}`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Shiprocket Tracking Error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new ShiprocketService();
