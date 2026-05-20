const axios = require('axios');
const shiprocket = require('../utils/shiprocket');

exports.checkPincode = async (req, res) => {
  try {
    const { pincode } = req.query;

    if (!pincode) {
      return res.status(400).json({ msg: 'Pincode parameter is required' });
    }

    // Basic format validation for India Pincode (6 digits)
    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!pinRegex.test(pincode.trim())) {
      return res.status(400).json({ msg: 'Invalid pincode format. Must be 6 digits.' });
    }

    const pickupPostcode = process.env.SHIPROCKET_PICKUP_PINCODE || '302001'; // Default to Jaipur origin

    // Try Shiprocket live API if credentials are provided
    if (process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD) {
      try {
        const token = await shiprocket.authenticate();
        
        const response = await axios.get('https://apiv2.shiprocket.in/v1/external/courier/serviceability/', {
          params: {
            pickup_postcode: pickupPostcode,
            delivery_postcode: pincode.trim(),
            weight: 0.5,
            cod: 1
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = response.data;
        if (data.status === 200 && data.data && data.data.available_courier_companies?.length > 0) {
          // Find the best courier option
          const bestCourier = data.data.available_courier_companies[0];
          return res.json({
            success: true,
            courier_name: bestCourier.courier_name,
            etd: bestCourier.etd || '3-5 Days',
            rate: bestCourier.rate || 0,
            cod_available: bestCourier.cod === 1,
            estimated_delivery_days: bestCourier.estimated_delivery_days || 4
          });
        } else {
          return res.status(404).json({ msg: 'This pincode is not serviceable by our standard couriers.' });
        }
      } catch (apiErr) {
        console.warn('Shiprocket Live API call failed, falling back to simulated mode:', apiErr.message);
        // Fall through to mock logic on any live integration failures
      }
    }

    // Mock/Simulated Response for development & seamless testing without active API keys
    // Generate simple dynamic ETD depending on pincode region (first digit represents zone)
    const firstDigit = pincode.trim().charAt(0);
    let etdDays = 3;
    let courierType = 'Premium Express Air';

    if (['7', '8', '9'].includes(firstDigit)) {
      etdDays = 5;
      courierType = 'Standard Surface';
    } else if (['4', '5', '6'].includes(firstDigit)) {
      etdDays = 4;
      courierType = 'Express Cargo';
    }

    // Success response using the simulation fallback
    return res.json({
      success: true,
      mocked: true,
      courier_name: `${courierType} (via Shiprocket Sim)`,
      etd: `${etdDays} Days`,
      rate: 150,
      cod_available: true,
      estimated_delivery_days: etdDays
    });

  } catch (err) {
    console.error('Check Pincode Controller Error:', err.message);
    res.status(500).json({ msg: 'Error checking pincode availability', error: err.message });
  }
};
