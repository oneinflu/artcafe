const Order = require('../models/Order');
const razorpay = require('../utils/razorpay');
const crypto = require('crypto');
const shiprocket = require('../utils/shiprocket');

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('customer', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.createOrder = async (req, res) => {
  try {
    const newOrder = new Order({
      ...req.body,
      customer: req.user.id
    });
    
    // If Razorpay is configured, create a Razorpay order
    if (razorpay) {
      const options = {
        amount: Math.round(req.body.totalAmount * 100), // in paisa
        currency: "INR",
        receipt: `receipt_${Date.now()}`
      };
      const rzpOrder = await razorpay.orders.create(options);
      newOrder.razorpay = { orderId: rzpOrder.id };
    }

    const order = await newOrder.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const order = await Order.findOneAndUpdate(
        { "razorpay.orderId": razorpay_order_id },
        { 
          paymentStatus: 'paid',
          "razorpay.paymentId": razorpay_payment_id,
          "razorpay.signature": razorpay_signature
        },
        { new: true }
      );
      res.json({ msg: 'Payment verified', order });
    } else {
      res.status(400).json({ msg: 'Invalid signature' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.createShipment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer');
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    // Format data for Shiprocket
    const shiprocketData = {
      order_id: order._id,
      order_date: order.createdAt,
      pickup_location: "Primary", // Should be configured in Shiprocket dashboard
      billing_customer_name: order.customer.name,
      billing_last_name: "",
      billing_address: order.shippingAddress.street,
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.zip,
      billing_state: order.shippingAddress.state,
      billing_country: order.shippingAddress.country,
      billing_email: order.customer.email,
      billing_phone: order.customer.phone || "9999999999",
      shipping_is_billing: true,
      order_items: order.items.map(item => ({
        name: item.productName,
        sku: item.product?._id || "SKU",
        units: item.quantity,
        selling_price: item.price
      })),
      payment_method: order.paymentStatus === 'paid' ? "Prepaid" : "COD",
      sub_total: order.totalAmount,
      length: 10, // These should ideally come from product data
      width: 10,
      height: 10,
      weight: 0.5
    };

    const response = await shiprocket.createOrder(shiprocketData);
    
    order.shiprocket = {
      shipmentId: response.shipment_id,
      orderId: response.order_id,
      trackingUrl: "" // Will be populated when AWB is assigned
    };
    order.status = 'processing';
    await order.save();

    res.json({ msg: 'Shipment created', shiprocketResponse: response, order });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Shiprocket error', error: err.message });
  }
};
