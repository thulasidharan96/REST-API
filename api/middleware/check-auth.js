const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Check if the Authorization header is present
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Extract the token from the header
    const token = req.headers.authorization.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // Attach the decoded user data to the request object
    req.userData = decoded;

    next();  // Continue to the next middleware/route
  } catch (error) {
    const errorMessage = error.name === 'TokenExpiredError'
      ? 'Token expired'
      : 'Authentication failed';
    res.status(401).json({ message: errorMessage });
  }
};
