        let currentPage = 0;
        let currentSearch = '';

        // Load products on page load
        loadStats();
        loadProducts();

        // Auto-refresh every 30 seconds
        setInterval(() => {
            loadStats();
            loadProducts();
        }, 30000);

        async function loadStats() {
            try {
                const response = await fetch('http://localhost:3000/products');
                const data = await response.json();
                document.getElementById('totalProducts').innerText = data.pagination?.total || data.data?.length || 0;
                
                if (data.data && data.data.length > 0) {
                    const lastDate = new Date(data.data[0].scraped_at);
                    document.getElementById('lastScrape').innerText = lastDate.toLocaleString();
                }
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }

        async function loadProducts() {
            try {
                let url = `http://localhost:3000/products?limit=50&offset=${currentPage * 50}`;
                if (currentSearch) {
                    url += `&search=${encodeURIComponent(currentSearch)}`;
                }
                
                const response = await fetch(url);
                const data = await response.json();
                
                const products = data.data || [];
                const total = data.pagination?.total || 0;
                
                renderProducts(products);
                renderPagination(total);
            } catch (error) {
                console.error('Error loading products:', error);
                document.getElementById('productsBody').innerHTML = '<tr><td colspan="5" class="loading">Failed to load products. Make sure the server is running.</td></tr>';
            }
        }

        function renderProducts(products) {
            if (!products || products.length === 0) {
                document.getElementById('productsBody').innerHTML = '<tr><td colspan="5" class="loading">No products found</td></tr>';
                return;
            }

            const html = products.map(p => `
                <tr>
                    <td><img src="${p.image_url || 'https://via.placeholder.com/50'}" class="product-image" onerror="this.src='https://via.placeholder.com/50'"></td>
                    <td style="max-width: 400px;">${escapeHtml(p.name || p.title || 'N/A')}</td>
                    <td>
                        <span class="price">${p.current_price || 'N/A'}</span>
                        ${p.old_price ? `<div class="old-price">${p.old_price}</div>` : ''}
                    </td>
                    <td>${p.rating || '⭐ No rating'}</td>
                    <td>${new Date(p.scraped_at).toLocaleDateString()}</td>
                </tr>
            `).join('');
            
            document.getElementById('productsBody').innerHTML = html;
        }

        function renderPagination(total) {
            const totalPages = Math.ceil(total / 50);
            if (totalPages <= 1) {
                document.getElementById('pagination').innerHTML = '';
                return;
            }

            let html = '';
            for (let i = 0; i < Math.min(totalPages, 10); i++) {
                html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i + 1}</button>`;
            }
            document.getElementById('pagination').innerHTML = html;
        }

        function goToPage(page) {
            currentPage = page;
            loadProducts();
        }

        function searchProducts() {
            currentSearch = document.getElementById('searchInput').value;
            currentPage = 0;
            loadProducts();
        }

        async function startScrape() {
            const btn = document.getElementById('scrapeBtn');
            btn.disabled = true;
            btn.innerHTML = '🔄 Scraping in progress...';
            
            updateStatus('scraping', 'SCRAPING...');
            showAlert('Starting scrape... This may take 30-60 seconds', 'info');
            
            try {
                const response = await fetch('http://localhost:3000/scrape', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url: 'https://www.jumia.co.ke/mobile-phones/'
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showAlert(`✅ Success! Scraped ${data.scrapedCount} products.`, 'success');
                    loadStats();
                    loadProducts();
                } else {
                    showAlert(`❌ Error: ${data.error}`, 'error');
                    updateStatus('idle', 'IDLE');
                }
            } catch (error) {
                showAlert(`❌ Failed to connect to server: ${error.message}`, 'error');
                updateStatus('idle', 'IDLE');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '🚀 Start Scraping';
                setTimeout(() => updateStatus('idle', 'IDLE'), 5000);
            }
        }

        async function refreshProducts() {
            showAlert('Refreshing products...', 'info');
            await loadStats();
            await loadProducts();
            showAlert('Products refreshed!', 'success');
        }

        function exportCSV() {
            window.open('http://localhost:3000/products/export', '_blank');
            showAlert('CSV export started!', 'success');
        }

        function updateStatus(status, text) {
            const statusEl = document.getElementById('scraperStatus');
            statusEl.innerText = text;
            statusEl.className = `status-badge status-${status}`;
        }

        function showAlert(message, type) {
            const alertDiv = document.getElementById('alert');
            alertDiv.className = `alert alert-${type}`;
            alertDiv.innerHTML = message;
            alertDiv.style.display = 'block';
            
            setTimeout(() => {
                alertDiv.style.display = 'none';
            }, 4000);
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

