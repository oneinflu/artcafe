const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

// @route   GET api/orders
router.get('/', auth('admin'), orderController.getOrders);

router.get('/rentals', auth('admin'), orderController.getRentalOrders);
router.put('/rentals/:id/status', auth('admin'), orderController.updateRentalStatus);

// @route   PUT api/orders/:id
router.put('/:id', auth('admin'), orderController.updateOrderStatus);

// @route   POST api/orders
router.post('/', auth('customer'), orderController.createOrder);

// @route   POST api/orders/create-razorpay-order
router.post('/create-razorpay-order', orderController.createRazorpayOrder);

// @route   POST api/orders/verify
router.post('/verify', orderController.verifyPayment);

// @route   POST api/orders/:id/ship
router.post('/:id/ship', auth('admin'), orderController.createShipment);

module.exports = router;
