// src/services/broker.service.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createBrokerProfile = async (userId, profileData) => {
  // Check if user exists and is a BROKER
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'BROKER') throw new Error('Unauthorized');

  // Check if broker is subscribed
  if (!user.isSubscribed || new Date(user.subscriptionEnd) < new Date()) {
    throw new Error('Subscription expired or inactive');
  }

  // Check if profile already exists
  const existing = await prisma.brokerProfile.findUnique({
    where: { userId },
  });
  if (existing) throw new Error('Broker profile already exists');

  const broker = await prisma.brokerProfile.create({
    data: {
      userId,
      specialization: profileData.specialization,
      location: profileData.location,
      phone: profileData.phone,
      email: profileData.email,
      experience: profileData.experience,
      description: profileData.description,
    },
  });

  return broker;
};

exports.getAllSubscribedBrokers = async () => {
  return await prisma.brokerProfile.findMany({
    where: {
      createdBy: {
        isSubscribed: true,
        role: 'BROKER',
        subscriptionEnd: { gte: new Date() }
      }
    },
    orderBy: {
      createdBy: {
        isFeatured: 'desc'
      }
    },
    include: {
      createdBy: {
        select: {
          firstName: true,
          lastName: true,
          isFeatured: true
        }
      }
    }
  });
};

exports.getMyBrokerProfile = async (userId) => {
  const profile = await prisma.brokerProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error('Broker profile not found');
  return profile;
};

// Optional update/delete if needed
exports.updateBrokerProfile = async (userId, updates) => {
  const profile = await prisma.brokerProfile.update({
    where: { userId },
    data: updates,
  });
  return profile;
};

exports.deleteBrokerProfile = async (userId) => {
  await prisma.brokerProfile.delete({ where: { userId } });
};