const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/user.routes");

dotenv.config();
const app = express();

app.use(express.json());
app.use("/api/users", userRoutes);

const propertyRoutes = require('./routes/property.routes');
app.use('/api/properties', propertyRoutes);

const brokerRoutes = require('./routes/broker.routes');
app.use('/api/brokers', brokerRoutes);

const inquiryRoutes = require('./routes/inquiry.routes');
app.use('/api/inquiries', inquiryRoutes);

const dashboardRoutes = require('./routes/dashboard.routes');
app.use('/api/dashboard', dashboardRoutes);

module.exports = app;
