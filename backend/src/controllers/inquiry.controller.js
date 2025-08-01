const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createInquiry = async (req, res) => {
  try {
    const { propertyId, message } = req.body;

    const inquiry = await prisma.inquiry.create({
      data: {
        userId: req.user.id,
        propertyId,
        message
      }
    });

    res.status(201).json({ message: 'Inquiry sent successfully', inquiry });
  } catch (err) {
    console.error('Inquiry Error:', err);
    res.status(500).json({ error: 'Failed to send inquiry' });
  }
};

exports.getMyInquiries = async (req, res) => {
  try {
    const inquiries = await prisma.inquiry.findMany({
      where: { userId: req.user.id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            price: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(inquiries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
};

exports.getInquiriesForOwner = async (req, res) => {
  try {
    // Step 1: Get all property IDs owned by this user
    const ownerProperties = await prisma.property.findMany({
      where: { ownerId: req.user.id },
      select: { id: true }
    });

    const propertyIds = ownerProperties.map(p => p.id);

    // If no properties owned, return empty array
    if (propertyIds.length === 0) {
      return res.status(200).json([]);
    }

    // Step 2: Get inquiries for those properties
    const inquiries = await prisma.inquiry.findMany({
      where: {
        propertyId: { in: propertyIds }
      },
      include: {
        property: {
          select: { title: true }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Step 3: Format response
    const formattedInquiries = inquiries.map(inquiry => ({
      id: inquiry.id,
      propertyTitle: inquiry.property.title,
      buyerName: `${inquiry.user.firstName} ${inquiry.user.lastName}`,
      buyerEmail: inquiry.user.email,
      message: inquiry.message,
      createdAt: inquiry.createdAt
    }));

    // Step 4: Return
    res.status(200).json(formattedInquiries);
  } catch (err) {
    console.error('❌ Failed to fetch owner inquiries:', err);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
};