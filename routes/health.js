function healthCheck(req, res) {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    endpoints: ['/scrape', '/products', '/health', '/', '/products/export']
  });
}

function home(req, res) {
  res.json({ 
    message: 'Jumia Scraper API',
    endpoints: {
      'GET /health': 'Health check',
      'GET /products': 'List products',
      'POST /scrape': 'Trigger scrape',
      'GET /products/export': 'Download CSV'
    }
  });
}

module.exports = { healthCheck, home };