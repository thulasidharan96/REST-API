// middleware/check-auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Extract token from Authorization header
        const decoded = jwt.verify(token, process.env.JWT_KEY); // Verify the token using the secret key
        req.userData = decoded; // Attach decoded data to the request object
        // Check if the user has an 'admin' role
        if (req.userData.role !== 'admin') {
            return res.status(403).json({
                message: 'Access forbidden: Admins only'
            });
        }
        next(); // If user is admin, proceed to the next middleware/route handler
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
};
