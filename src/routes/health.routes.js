const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  
  res.status(200).json({
    status: 'UP',
    service: 'ms3-infraestructura-api',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;