// src/controllers/broker.controller.js
const brokerService = require('../services/broker.service');

exports.createProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Comes from auth middleware
    const profile = await brokerService.createBrokerProfile(userId, req.body);
    res.status(201).json({ message: 'Profile created', profile });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getBrokers = async (_req, res) => {
  try {
    const brokers = await brokerService.getAllSubscribedBrokers();
    res.status(200).json(brokers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await brokerService.getMyBrokerProfile(req.user.id);
    res.status(200).json(profile);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

// Optional endpoints
exports.updateProfile = async (req, res) => {
  try {
    const updated = await brokerService.updateBrokerProfile(req.user.id, req.body);
    res.status(200).json({ message: 'Profile updated', updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    await brokerService.deleteBrokerProfile(req.user.id);
    res.status(200).json({ message: 'Profile deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const Razorpay = require('razorpay');
const { PrismaClient } = require('@prisma/client');
const verifySignature = require('../utils/verifySignature');

const prisma = new PrismaClient();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

exports.createFeaturedOrder = async (req, res) => {
  try {
    // Get the current user
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let amount = 49900; // Default ₹499

    // If user is already a subscribed broker, apply discounted upgrade
    const broker = await prisma.brokerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (broker) {
      amount = 14900; // ₹149 for upgrade
    }

    const options = {
      amount,
      currency: 'INR',
      receipt: `featured_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpayInstance.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
};


exports.verifyFeaturedPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const isValid = verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      process.env.RAZORPAY_SECRET
    );

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // Mark user as featured
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        isFeatured: true
      }
    });

    res.status(200).json({ message: 'User upgraded to featured' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBrokerById = async (req, res) => {
  try {
    const brokerId = req.params.id;
    const broker = await brokerService.getBrokerById(brokerId);

    if (!broker) {
      return res.status(404).json({ message: 'Broker not found' });
    }

    return res.status(200).json(broker);
  } catch (error) {
    console.error('Error fetching broker by ID:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};