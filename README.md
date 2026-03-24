# 📱 Jumia Product Scraper

A powerful web scraper that extracts mobile phone listings from Jumia Kenya, 
stores them in Neon PostgreSQL, and provides a beautiful dashboard for viewing and analyzing products.

## ✨ Features

- 🕷️ **Web Scraping** - Extracts product titles, prices, images, ratings, and unique product URLs
- 📊 **Dashboard** - Beautiful UI to view, search, and filter products
- 🔄 **REST API** - Trigger scrapes and retrieve data programmatically
- 💾 **PostgreSQL** - Serverless Neon database for scalable storage
- 📥 **CSV Export** - Download all products as CSV for analysis
- 🚦 **Concurrency Safe** - Prevents multiple simultaneous scrapes

## 🛠️ Tech Stack

- **Backend**: Node.js, Express
- **Scraping**: Puppeteer
- **Database**: Neon PostgreSQL (serverless)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Deployment**: Ready for GitHub Actions / cron jobs

## 📡 API Endpoints
Method	Endpoint	Description:

    ** GET	/	API information
    ** GET	/health	Health check
    ** GET	/products	List products (with pagination & search)
    ** GET	/products/export	Download all products as CSV
    ** POST	/scrape	Trigger a new scraping job
    ** GET	/scrape/status	Check if a scrape is in progress


## 🎨 Dashboard Features
Real-time Stats - Total products, last scrape time, scraper status

Product Grid - View products with images, prices, and ratings

Search - Filter products by name

One-click Scrape - Trigger new scrapes from the UI

CSV Export - Download data for offline analysis


## 📁 Project Structure
    jumia-product-scraper/
    ├── public/                 # Frontend dashboard
    │   ├── index.html
    │   ├── css/style.css
    │   └── js/dashboard.js
    ├── routes/                 # API route handlers
    │   ├── products.js
    │   ├── scrape.js
    │   └── health.js
    ├── index.js               # Core scraping logic
    ├── app.js                 # Express app setup
    ├── server.js              # Server entry point
    ├── .env.example           # Environment template
    ├── .gitignore
    ├── package.json
    └── README.md

## 🔄 Automated Scraping (GitHub Actions)
The scraper can be scheduled to run automatically using GitHub Actions. Add this to .github/workflows/scrape.yml:

yaml
name: Daily Scrape
on:
  schedule:
    - cron: '0 6 * * *'  # Runs daily at 6 AM
jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: node -e "require('./index').scrapeJumiaListing('https://www.jumia.co.ke/mobile-phones/').then(data => console.log('Scraped', data.length, 'products'))"


## 🚀 Deployment
Deploy to any Node.js hosting platform (Render, Railway, Heroku, etc.):

Set DATABASE_URL environment variable

Deploy with node server.js

## 📝 Notes
The scraper uses Puppeteer and may need additional system dependencies

Neon's serverless PostgreSQL offers a generous free tier

All data is stored in your own database 

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first.



## 🙏 Acknowledgments
Jumia Kenya for product listings

Neon for serverless PostgreSQL

Puppeteer team for the amazing scraping library





## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jumia-product-scraper.git
   cd jumia-product-scraper


2. **Install dependencies**
 ```bash
 npm install
 
 
3. **Set up environment variables**
 ```bash
  cp .env.example .env
  Edit .env and add your Neon database URL:
  DATABASE_URL=postgresql://username:password@host/  databasesslmode=require
  Start the server

4. **Start server**
 ```bash
node server.js


5. **Open the dashboard**
 ```bash
  http://localhost:3000
