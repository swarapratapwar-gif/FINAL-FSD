const jwt = require('jsonwebtoken');

// This function runs BEFORE protected routes
// It checks if the user is logged in (has a valid token)
const protect = (req, res, next) => {

  // 1. Get the token from request headers
  const authHeader = req.headers.authorization;

  // 2. Check if token exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      message: 'Not authorized. Please login first.' 
    });
  }

  // 3. Extract the token (remove "Bearer " prefix)
  const token = authHeader.split(' ')[1];

  try {
    // 4. Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Attach user info to request object
    req.user = decoded;
    
    // 6. Move to the next step (the actual route)
    next();

  } catch (error) {
    return res.status(401).json({ 
      message: 'Token is invalid or expired. Please login again.' 
    });
  }
};

module.exports = protect;