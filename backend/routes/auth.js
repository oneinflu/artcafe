const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
router.post('/register', authController.register);

// @route   POST api/auth/login
router.post('/login', authController.login);

// @route   GET api/auth/customers
// @desc    Get all customers
// @access  Private (Admin)
router.get('/customers', auth('admin'), authController.getCustomers);

module.exports = router;
