const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const { getProducts, exportProducts } = require('./routes/products');
const { triggerScrape, getScrapeStatus } = require('./routes/scrape');
const { healthCheck, home } = require('./routes/health');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/', home);
app.get('/health', healthCheck);
app.get('/products', getProducts);
app.get('/products/export', exportProducts);
app.post('/scrape', triggerScrape);
app.get('/scrape/status', getScrapeStatus);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    available: [
      'GET /',
      'GET /health',
      'GET /products',
      'GET /products/export',
      'POST /scrape',
      'GET /scrape/status'
    ]
  });
});

module.exports = app;