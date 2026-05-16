const jwt = require('jsonwebtoken');

const auth = (role = 'customer') => {
  return (req, res, next) => {
    const token = req.header('x-auth-token');
    console.log(`Auth Middleware: Token ${token ? 'Found' : 'Missing'}, Required Role: ${role}`);

    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user;
      console.log(`Auth Middleware: User ${req.user.email} (Role: ${req.user.role})`);

      if (role === 'admin' && req.user.role !== 'admin') {
        console.log(`Auth Middleware: Forbidden - Admin required, user is ${req.user.role}`);
        return res.status(403).json({ msg: 'Access denied: Administrator only' });
      }

      next();
    } catch (err) {
      res.status(401).json({ msg: 'Token is not valid' });
    }
  };
};

module.exports = auth;
