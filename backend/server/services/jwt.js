import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for user
 * @param {object} user
 * @returns {string} token
 * */
function generateToken(user) {
  const payload = { sub: user.id, id: user.id, email: user.email, username: user.username };
  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '3600s' });
}
/**
 * Verify JWT token
 * @param {string} token
 * @returns {object} decoded token
 * */
async function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET;
    return await jwt.verify(token, secret);
  } catch (error) {
    return error;
  }
}
/**
 * Authentification middleware for routes that require authentication
 *
 * * *Note: Added custom x-test-auth header for testing purposes*
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns next
 * */
async function authMiddleware(req, res, next) {
  if (process.env.TESTING && process.env.TESTING === 'true') {
    const authHeader = req.headers['x-test-auth'];
    if (authHeader) {
      const user = JSON.parse(JSON.stringify(authHeader));
      req.user = JSON.parse(user);
      return next();
    }
  }
  if (req.path.includes('auth') || req.path.includes('docs') || req.path.includes('health')) {
    return next();
  } else if (req.path.includes('user') && req.method === 'POST') {
    return next();
  } else {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }
    const verify = await verifyToken(token);

    if (verify && (verify.sub || verify.id)) {
      req.user = verify;
      next();
    } else if (!verify) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    } else if (verify.message === 'jwt expired') {
      return res.status(403).json({ message: 'Expired token: expired token' });
    } else if (verify.message === 'invalid token') {
      return res.status(403).json({ message: 'Invalid token: invalid token' });
    } else if (verify.message === 'jwt malformed') {
      return res.status(403).json({ message: 'Invalid token: jwt malformed' });
    } else {
      return res.status(403).json({ message: 'Invalid token' });
    }
  }
}

export { generateToken, verifyToken, authMiddleware };
