const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// BUYER DASHBOARD
exports.getBuyerDashboard = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Favorites using Favorite model
  const favorites = await prisma.favorite.findMany({
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
              phone: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const recommended = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  return {
    user,
    isSubscribed: user.isSubscribed,
    favorites: favorites.map((fav) => fav.property),
    recommendedProperties: recommended
  };
};

// BROKER DASHBOARD
exports.getBrokerDashboard = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isSubscribed: true,
      profileViews: true
    }
  });

  const profile = await prisma.brokerProfile.findUnique({
    where: { userId }
  });

  // Fetch all properties listed by the broker
  const brokerProperties = await prisma.property.findMany({
    where: { ownerId: userId },
    select: { id: true }
  });

  const propertyIds = brokerProperties.map(p => p.id);

  // Fetch inquiries for those properties
  const leads = await prisma.inquiry.findMany({
    where: {
      propertyId: { in: propertyIds }
    },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          location: true
        }
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  // Profile completion %
  const requiredFields = ['specialization', 'location', 'phone', 'email', 'experience', 'description'];
  const filledFields = requiredFields.filter(field => profile?.[field]).length;
  const completion = `${Math.round((filledFields / requiredFields.length) * 100)}%`;

  return {
    isSubscribed: user.isSubscribed,
    profile,
    leads,
    analytics: {
      profileViews: user.profileViews || 0,
      responseRate: leads.length > 0 ? '100%' : '0%',
      completion
    }
  };
};

// OWNER DASHBOARD
exports.getOwnerDashboard = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const properties = await prisma.property.findMany({
    where: { ownerId: userId },
    include: {
      inquiries: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        }
      }
    }
  });

  const inquiries = properties.flatMap((p) => p.inquiries || []);

  return {
    isSubscribed: user.isSubscribed,
    activeListings: properties.length,
    properties,
    inquiries
  };
};