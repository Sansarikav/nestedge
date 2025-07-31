const propertyService = require('../services/property.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// CREATE
exports.createProperty = async (req, res) => {
  try {
    console.log("🔧 Incoming Property Data:", req.body);
    const userId = req.user.id; // Or however you're getting userId from JWT
    const result = await propertyService.createProperty(userId, req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error("❌ Create Property Error:", err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// GET ALL
exports.getAllProperties = async (req, res) => {
  try {
    const result = await propertyService.getAllProperties(req.headers.authorization);
    res.status(200).json(result);
  } catch (err) {
    console.error("Get All Error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET BY ID
exports.getPropertyById = async (req, res) => {
  try {
    const result = await propertyService.getPropertyById(req.params.id, req.headers.authorization);
    res.status(200).json(result);
  } catch (err) {
    console.error("Get by ID Error:", err);
    res.status(404).json({ message: err.message });
  }
};

// GET MY PROPERTIES
exports.getMyProperties = async (req, res) => {
  try {
    const result = await propertyService.getMyProperties(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    console.error("Get My Props Error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// UPDATE
exports.updateProperty = async (req, res) => {
  try {
    const result = await propertyService.updateProperty(req.user.id, req.params.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(404).json({ message: err.message });
  }
};

// DELETE
exports.deleteProperty = async (req, res) => {
  try {
    await propertyService.deleteProperty(req.user.id, req.params.id);
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(404).json({ message: err.message });
  }
};

exports.searchProperties = async (req, res) => {
  try {
    const results = await propertyService.searchProperties(req.query);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.incrementView = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.property.update({
      where: { id: parseInt(id) },
      data: {
        views: {
          increment: 1
        }
      }
    });

    res.status(200).json({ message: "View recorded" });
  } catch (err) {
    console.error("View increment error:", err); // ✅ Add this
    res.status(500).json({ error: "Failed to increment view count" });
  }
};