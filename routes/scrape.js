const { scrapeJumiaListing, saveProductsToNeon } = require('../index.js');

let isScraping = false;

async function triggerScrape(req, res) {
  console.log('🔥 POST /scrape route hit!');
  
  const { url } = req.body;
  const targetUrl = url || 'https://www.jumia.co.ke/mobile-phones/';
  
  if (!targetUrl.includes('jumia.co.ke')) {
    return res.status(400).json({ 
      error: 'Valid Jumia URL required',
      example: 'https://www.jumia.co.ke/mobile-phones/'
    });
  }

  if (isScraping) {
    return res.status(409).json({ 
      error: 'A scrape is already in progress. Please wait.'
    });
  }

  isScraping = true;
  
  try {
    console.log(`Starting scrape for: ${targetUrl}`);
    const data = await scrapeJumiaListing(targetUrl);
    
    if (data.length === 0) {
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
  }
}

async function getScrapeStatus(req, res) {
  res.json({ isScraping });
}

module.exports = { triggerScrape, getScrapeStatus };