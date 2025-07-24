const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('Token missing');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) throw new Error('User not found');

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: ' + err.message });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

exports.isSubscribed = (req, res, next) => {
  if (!req.user || !req.user.isSubscribed) {
    return res.status(403).json({ error: 'Subscription required to access this resource' });
  }
  next();
};
