const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = async ({ firstName, lastName, email, phone, password, role }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already registered');

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role,
    }
  });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  return {
    message: 'Signup successful',
    token,
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    }
  };
};

exports.login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid email or password');

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  return {
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    }
  };
};

// Optional: For manual marking of payments (e.g. admin panel)
exports.markAsPaid = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { hasPaid: true }
  });
};

exports.getUserFavorites = async (userId) => {
  return await prisma.favorite.findMany({
    where: { userId },
    include: {
      property: {
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

exports.addFavorite = async (userId, propertyId) => {
  // Check if already favorited
  const existing = await prisma.favorite.findFirst({
    where: { userId, propertyId },
  });
  if (existing) throw new Error('Already in favorites');

  return await prisma.favorite.create({
    data: {
      userId,
      propertyId,
    },
  });
};

exports.removeFavorite = async (userId, propertyId) => {
  return await prisma.favorite.deleteMany({
    where: { userId, propertyId },
  });
};