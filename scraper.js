const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { scrapeJumiaListing, saveProductsToNeon, sql } = require('./index.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Add a flag to track if a scrape is in progress
let isScraping = false;
let scrapingQueue = [];

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('Body:', req.body);
  }
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Jumia Scraper API',
    endpoints: {
      'GET /health': 'Health check',
      'GET /products': 'List products',
      'POST /scrape': 'Trigger scrape'
    }
  });
});

// POST /scrape - trigger scrape and save
app.post('/scrape', async (req, res) => {
  console.log('🔥 POST /scrape route hit!');
  
  const { url } = req.body;
  const targetUrl = url || 'https://www.jumia.co.ke/mobile-phones/';
  
  if (!targetUrl.includes('jumia.co.ke')) {
    return res.status(400).json({ 
      error: 'Valid Jumia URL required',
      example: 'https://www.jumia.co.ke/mobile-phones/'
    });
  }

  // Check if already scraping
  if (isScraping) {
    return res.status(409).json({ 
      error: 'A scrape is already in progress. Please wait.',
      queuePosition: scrapingQueue.length + 1
    });
  }

  // Start scraping
  isScraping = true;
  
  try {
    console.log(`Starting scrape for: ${targetUrl}`);
    const data = await scrapeJumiaListing(targetUrl);
    
    if (data.length === 0) {
      isScraping = false;
      return res.status(404).json({ 
        error: 'No products found at the provided URL',
        url: targetUrl 
      });
    }
    
    await saveProductsToNeon(data);
    
    res.json({
      success: true,
      scrapedCount: data.length,
      message: 'Scraped and saved successfully',
      url: targetUrl
    });
  } catch (err) {
    console.error('Scrape error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    isScraping = false;
    // Process next in queue if any
    if (scrapingQueue.length > 0) {
      const nextReq = scrapingQueue.shift();
      // You could implement queue processing here
    }
  }
});

// GET /products - list all saved
app.get('/products', async (req, res) => {
  console.log('📊 GET /products route hit!');
  
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const rows = await sql`
      SELECT * FROM products
      ORDER BY scraped_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const countResult = await sql`SELECT COUNT(*) FROM products`;
    const total = parseInt(countResult[0].count);
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + rows.length < total
      }
    });
  } catch (err) {
    console.error('Products error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /scrape/status - check if scraping is in progress
app.get('/scrape/status', (req, res) => {
  res.json({
    isScraping,
    queueLength: scrapingQueue.length
  });
});

// GET /health - check if server is running
app.get('/health', (req, res) => {
  console.log('❤️ GET /health route hit!');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    endpoints: ['/scrape', '/products', '/health', '/', '/scrape/status']
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: 'Endpoint not found',
    available: [
      'GET /',
      'GET /health',
      'GET /products',
      'GET /scrape/status',
      'POST /scrape'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 ==================================`);
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`🚀 ==================================`);
  console.log(`📍 GET  /             - API info`);
  console.log(`📍 GET  /health        - Health check`);
  console.log(`📍 GET  /products       - List products`);
  console.log(`📍 GET  /scrape/status  - Check scrape status`);
  console.log(`📍 POST /scrape         - Trigger scrape`);
  console.log(`🚀 ==================================\n`);
});