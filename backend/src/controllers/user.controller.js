const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Razorpay = require('razorpay');
const verifySignature = require('../utils/verifySignature');
const userService = require('../services/user.service');

const prisma = new PrismaClient();

// Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// -------------------- AUTH --------------------

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

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
        role
      }
    });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid email or password');

    //Check if role matches
    if (user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(403).json({ error: `This account is registered as a ${user.role}. Please log in as a ${user.role}.` });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`
      }
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

// -------------------- RAZORPAY --------------------

exports.pay = async (req, res) => {
  try {
    const userId = req.user.id;

    const shortReceipt = `rcpt_${Math.random().toString(36).substring(2, 12)}`;

    const options = {
      amount: 19900, // ₹199 in paise
      currency: 'INR',
      receipt: shortReceipt,
      payment_capture: 1
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      message: 'Order created',
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err) {
    console.error('Payment order creation error:', err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.id;

    const isValid = verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      process.env.RAZORPAY_SECRET
    );

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const now = new Date();
    const subscriptionEnd = new Date(now);
    subscriptionEnd.setMonth(now.getMonth() + 1);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isSubscribed: true,
        subscriptionStart: now,
        subscriptionEnd
      }
    });

    res.status(200).json({
      message: 'Payment verified and subscription activated',
      user: updatedUser
    });
  } catch (error) {
    console.error('Payment verification failed:', error);
    res.status(500).json({ message: 'Server error during payment verification' });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await userService.getUserFavorites(req.user.id);
    res.status(200).json(favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/users/favorites/:propertyId
exports.addFavorite = async (req, res) => {
  try {
    const propertyId = parseInt(req.params.propertyId);
    const favorite = await userService.addFavorite(req.user.id, propertyId);
    res.status(201).json({ message: "Property added to favorites", favorite });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/users/favorites/:propertyId
exports.removeFavorite = async (req, res) => {
  try {
    const propertyId = parseInt(req.params.propertyId);
    await userService.removeFavorite(req.user.id, propertyId);
    res.status(200).json({ message: "Property removed from favorites" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};