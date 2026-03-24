const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 ==================================`);
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`🚀 ==================================`);
  console.log(`📍 GET  /             - API info`);
  console.log(`📍 GET  /health        - Health check`);
  console.log(`📍 GET  /products       - List products`);
  console.log(`📍 GET  /products/export - Export CSV`);
  console.log(`📍 POST /scrape         - Trigger scrape`);
  console.log(`📍 GET  /scrape/status  - Check scrape status`);
  console.log(`🚀 ==================================\n`);
});