const { sql } = require('../index.js');

async function getProducts(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || '';
    
    let rows;
    let countResult;
    
    if (search) {
      rows = await sql`
        SELECT * FROM products 
        WHERE name ILIKE ${'%' + search + '%'}
        ORDER BY scraped_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*) FROM products 
        WHERE name ILIKE ${'%' + search + '%'}
      `;
    } else {
      rows = await sql`
        SELECT * FROM products
        ORDER BY scraped_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`SELECT COUNT(*) FROM products`;
    }
    
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
}

async function exportProducts(req, res) {
  try {
    const rows = await sql`SELECT * FROM products ORDER BY scraped_at DESC`;
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No products to export' });
    }
    
    const headers = ['name', 'current_price', 'old_price', 'image_url', 'rating', 'reviews_count', 'scraped_at'];
    const csvRows = rows.map(row => 
      headers.map(header => {
        let value = row[header] || '';
        value = value.toString().replace(/"/g, '""');
        return `"${value}"`;
      }).join(',')
    );
    const csv = [headers.join(','), ...csvRows].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=products_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getProducts, exportProducts };