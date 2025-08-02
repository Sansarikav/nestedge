const dashboardService = require('../services/dashboard.service');

exports.getBuyerDashboard = async (req, res) => {
  try {
    const result = await dashboardService.getBuyerDashboard(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBrokerDashboard = async (req, res) => {
  try {
    const result = await dashboardService.getBrokerDashboard(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOwnerDashboard = async (req, res) => {
  try {
    const result = await dashboardService.getOwnerDashboard(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, phone } = req.body;

    const updatedUser = await dashboardService.updateUserProfile(userId, { username, email, phone });

    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};