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