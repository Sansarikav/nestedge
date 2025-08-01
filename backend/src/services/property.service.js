const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

// CREATE PROPERTY
exports.createProperty = async (userId, data) => {
  const newProperty = await prisma.property.create({
    data: {
      ...data,
      price: parseFloat(data.price),
      bedrooms: parseInt(data.bedrooms),
      bathrooms: parseInt(data.bathrooms),
      area: parseFloat(data.area),
      owner: { connect: { id: userId } }
    }
  });
  return newProperty;
};

// GET ALL PROPERTIES
exports.getAllProperties = async (token) => {
  let isSubscribed = false;

  if (token?.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      isSubscribed = user?.isSubscribed || false;
    } catch (err) {
      console.warn("Invalid token:", err.message);
    }
  }

  const properties = await prisma.property.findMany({
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
    },
    orderBy: { createdAt: "desc" }
  });

  return properties.map(property => ({
    ...property,
    owner: {
      ...property.owner,
      email: isSubscribed ? property.owner.email : "Email visible to subscribers",
      phone: isSubscribed ? property.owner.phone : "Phone visible to subscribers"
    }
  }));
};

// GET PROPERTY BY ID
exports.getPropertyById = async (id, token) => {
  let isSubscribed = false;

  if (token?.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      isSubscribed = user?.isSubscribed || false;
    } catch (err) {
      console.warn("Invalid token:", err.message);
    }
  }

  const property = await prisma.property.findUnique({
    where: { id: parseInt(id) },
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
  });

  if (!property) throw new Error("Property not found");

  return {
    ...property,
    owner: {
      ...property.owner,
      email: isSubscribed ? property.owner.email : "Email visible to subscribers",
      phone: isSubscribed ? property.owner.phone : "Phone visible to subscribers"
    }
  };
};

// GET MY PROPERTIES
exports.getMyProperties = async (userId) => {
  return prisma.property.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" }
  });
};

// UPDATE PROPERTY
exports.updateProperty = async (userId, id, data) => {
  const existing = await prisma.property.findUnique({ where: { id: parseInt(id) } });
  if (!existing || existing.ownerId !== userId) {
    throw new Error("Property not found or unauthorized");
  }

  const updateData = {};

  if (data.title) updateData.title = data.title;
  if (data.description) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = parseFloat(data.price);
  if (data.bedrooms !== undefined) updateData.bedrooms = parseInt(data.bedrooms);
  if (data.bathrooms !== undefined) updateData.bathrooms = parseInt(data.bathrooms);
  if (data.area !== undefined) updateData.area = parseFloat(data.area);
  if (data.type) updateData.type = data.type;
  if (data.furnishing) updateData.furnishing = data.furnishing;
  if (data.location) updateData.location = data.location;
  if (data.image) updateData.image = data.image;
  if (data.listingType) updateData.listingType = data.listingType;

  return prisma.property.update({
    where: { id: parseInt(id) },
    data: updateData,
  });
};

// DELETE PROPERTY
exports.deleteProperty = async (userId, id) => {
  const property = await prisma.property.findUnique({ where: { id: parseInt(id) } });
  if (!property || property.ownerId !== userId) {
    throw new Error("Property not found or unauthorized");
  }

  await prisma.property.delete({ where: { id: parseInt(id) } });
};

exports.searchProperties = async (filters) => {
  const {
    q,
    priceMin,
    priceMax,
    type,
    listingType,
    bedrooms,
    bathrooms
  } = filters;

  const whereClause = {
    ...(q && {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } }
      ]
    }),
    ...(priceMin && { price: { gte: parseFloat(priceMin) } }),
    ...(priceMax && {
      price: {
        ...(priceMin ? { gte: parseFloat(priceMin) } : {}),
        lte: parseFloat(priceMax)
      }
    }),
    ...(type && {
      type: {
        equals: type,
        mode: 'insensitive'
      }
    }),
    ...(listingType && {
      listingType: {
        equals: listingType,
        mode: 'insensitive'
      }
    }),
    ...(bedrooms && { bedrooms: parseInt(bedrooms) }),
    ...(bathrooms && { bathrooms: parseInt(bathrooms) }),
  };

  const properties = await prisma.property.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        }
      }
    }
  });

  return properties;
};