const fs = require('fs');
const puppeteer = require('puppeteer');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: './.env' });  // loads .env

// 2. Neon setup 
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not found in .env file');
  console.error('Please create a .env file with: DATABASE_URL=your_connection_string');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);


async function scrapeJumiaListing(url) {

  const browser = await puppeteer.launch({
    headless: true,  // switch to true for production/demo runs
    args: ['--no-sandbox', '--disable-setuid-sandbox']  // helps on some hosts
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ...'); // full UA string
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    await page.waitForSelector('article', { timeout: 45000 }); // your working broad selector

    const productHandles = await page.$$('article');
    console.log(`Found ${productHandles.length} product elements`);

    const items = [];

    for (const productHandle of productHandles) {
      let title = null, price = null, oldPrice = null, img = null, rating = null, reviews = null;

      try { title = await productHandle.$eval('.-name, .name, h3', el => el.textContent.trim()); } catch { }
      try { price = await productHandle.$eval('.-price, .prc', el => el.textContent.trim()); } catch { }
      try { oldPrice = await productHandle.$eval('.-old, .old', el => el.textContent.trim()); } catch { }
      try { img = await productHandle.$eval('img', el => el.getAttribute('data-src') || el.getAttribute('src') || ''); } catch { }
      try { rating = await productHandle.$eval('[class*="stars"]', el => el.textContent.trim()); } catch { }
      try { reviews = await productHandle.$eval('[class*="rev"]', el => el.textContent.trim()); } catch { }

      let productUrl = null;
      try {
        // Try specific selectors one by one and log which works
        let selectors = [
          'a.core',
          'a[href^="/"]',
          'a.-df.-i-ctr',
          'a',
          '.-paxs a',          
          'div.info a',        
          'article a:first-child'  
        ];

        for (const sel of selectors) {
          const linkHandle = await productHandle.$(sel);
          if (linkHandle) {
            productUrl = await linkHandle.evaluate(el => {
              let href = el.href || el.getAttribute('href') || '';
              if (href && !href.startsWith('http')) {
                href = 'https://www.jumia.co.ke' + href;
              }
              return href.trim() || null;
            });
            if (productUrl) {
              // console.log(`Found link with selector "${sel}": ${productUrl}`);
              break;
            }
          }
        }
      } catch (err) {
        console.log('Link extraction error:', err.message);
      }


      if (title && price && productUrl) {
        items.push({
          title,
          current_price: price,
          old_price: oldPrice || null,
          image_url: img || null,
          rating: rating || null,
          reviews_count: reviews || null,
          scraped_url: productUrl,          // unique per product
          scraped_at: new Date().toISOString()
        });
      } else {
        // console.log(`Skipped product: title=${title}, price=${price}, url=${productUrl}`);
      }

    }

    console.log(`Scraped ${items.length} products from ${url}`);
    return items;
  } catch (err) {
    console.error('Scrape error:', err.message);
    return [];
  } finally {
    await browser.close();
  }
}

// // Test it
// (async () => {
//   const data = await scrapeJumiaListing('https://www.jumia.co.ke/mobile-phones/');
//   console.log(data.slice(0, 3));  // first 3 for quick check
// })();



async function saveProductsToNeon(products) {
  if (products.length === 0) {
    console.log('No products to save');
    return;
  }

  let savedCount = 0;
  let errorCount = 0;

  for (const p of products) {
    try {
      await sql`
        INSERT INTO products (url, name, current_price, old_price, image_url, rating, reviews_count, scraped_at)
        VALUES (${p.scraped_url}, ${p.title}, ${p.current_price}, ${p.old_price || null}, ${p.image_url || null}, ${p.rating || null}, ${p.reviews_count || null}, ${p.scraped_at})
        ON CONFLICT (url) DO UPDATE SET
          name = EXCLUDED.name,
          current_price = EXCLUDED.current_price,
          old_price = EXCLUDED.old_price,
          image_url = EXCLUDED.image_url,
          rating = EXCLUDED.rating,
          reviews_count = EXCLUDED.reviews_count,
          scraped_at = EXCLUDED.scraped_at
      `;
      savedCount++;
    } catch (err) {
      console.error(`Failed to save "${p.title}":`, err.message);
      errorCount++;
    }
  }

  console.log(`Processed ${products.length} products → ${savedCount} saved/updated, ${errorCount} failed`);
}

// 5. Test block (bottom, for now)
// (async () => {
//   try {
//     const url = 'https://www.jumia.co.ke/mobile-phones/';
//     const scrapedData = await scrapeJumiaListing(url);

//     if (scrapedData.length > 0) {
//       await saveProductsToNeon(scrapedData);
//       console.log('First few saved:', scrapedData.slice(0, 3));
//     } else {
//       console.log('No products scraped – check selectors or page load');
//     }
//   } catch (err) {
//     console.error('Test run failed:', err);
//   }
//   // Don't close pool here if planning API later
//   // await pool.end();  // only at end of script if no server
// })();


module.exports = {
  scrapeJumiaListing,
  saveProductsToNeon,
  sql
};

