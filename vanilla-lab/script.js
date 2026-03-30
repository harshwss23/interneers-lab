const API_URL = 'http://localhost:8000/api/products/';
const container = document.getElementById('product-container');
const fetchBtn = document.getElementById('fetch-btn');

// Fectch to get data from backend
async function fetchProducts() {
    console.log('Fetching products from:', API_URL);

    // Show loading state
    container.innerHTML = `
        <div class="product-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text short"></div>
        </div>
    `;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        console.log('Successfully received data:', json);

        const products = json.data || [];
        renderProducts(products);

    } catch (error) {
        console.error('Failed to fetch products:', error);
        container.innerHTML = `<p style="color: red; text-align: center;">Error fetching products: ${error.message}</p>`;
    }
}

/**
 * Renders product cards into the container
 * @param {Array} products 
 */
function renderProducts(products) {
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center;">No products found.</p>';
        return;
    }

    // Add a summary header
    const summaryHeader = `
        <div style="grid-column: 1/-1; margin-bottom: 1rem; color: var(--text-muted); font-weight: 500;">
            Showing ${products.length} products
        </div>
    `;

    container.innerHTML = summaryHeader + products.map((product, index) => `
        <div class="product-card" style="animation-delay: ${index * 0.1}s">
            <img class="product-image" src="image.png" alt="${product.name}">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div class="product-category">${product.brand || 'General'}</div>
                <span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600;">IN STOCK</span>
            </div>
            <h2 class="product-title">${product.name}</h2>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <p class="product-description">${product.description || 'No description available for this item.'}</p>
            <button style="margin-top: auto; padding: 0.5rem; border: 1px solid var(--primary-color); background: transparent; color: var(--primary-color); border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='var(--primary-color)'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='var(--primary-color)'">View Details</button>
        </div>
    `).join('');
}

// Initial fetch attempt
fetchProducts();

// Bind button click
fetchBtn.addEventListener('click', fetchProducts);
