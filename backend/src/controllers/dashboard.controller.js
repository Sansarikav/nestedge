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