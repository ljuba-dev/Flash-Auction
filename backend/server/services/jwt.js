import jwt from 'jsonwebtoken';

async function generateToken(user) {
  const payload = { sub: user.id, email: user.email, username: user.username };
  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '3600s' });
}
async function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  return jwt.verify(token, secret);
}

function authMiddleware(req, res, next) {
  if (req.path.includes('auth') || req.path.includes('docs')) {
    return next();
  }
  if (req.path.includes('user') && req.method === 'POST') {
    return next();
  }
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  });
}

export { generateToken, verifyToken, authMiddleware };
