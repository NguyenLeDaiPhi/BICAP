document.addEventListener('DOMContentLoaded', () => {
    const token = getCookie('auth_token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    const API_BASE_URL = (typeof API_GATEWAY_BASE_URL !== 'undefined') ? API_GATEWAY_BASE_URL : 'http://localhost:8000';
    // Update paths to match Kong Gateway configuration (kong.yml)
    // Explicitly using /api/marketplace-products to ensure alignment with farm-production-service route
    const PRODUCTS_API_URL = `${API_BASE_URL}/api/marketplace-products`;
    const BATCHES_API_URL = `${API_BASE_URL}${typeof FARMING_SEASONS_API_PATH !== 'undefined' ? FARMING_SEASONS_API_PATH : '/api/farming-seasons'}`;

    const tableBody = document.getElementById('productsTableBody');
    const emptyState = document.getElementById('emptyState');
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    const productForm = document.getElementById('productForm');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');
    const viewProductModal = new bootstrap.Modal(document.getElementById('viewProductModal'));

    let products = [];
    let currentEditId = null;
    let farmId = null;

    // --- Utility Functions ---
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function getFarmIdFromToken(token) {
        try {
            const parts = token.split('.');
            if (parts.length < 2) return null;
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
            const jsonPayload = decodeURIComponent(window.atob(padded).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);
            return payload.farmId || payload.farm_id || null;
        } catch (e) {
            console.error('Failed to parse JWT:', e);
            return null;
        }
    }
    
    farmId = getFarmIdFromToken(token);
    if (farmId) {
        const farmIdInput = document.getElementById('farmId');
        if (farmIdInput) {
            farmIdInput.value = farmId;
        }
    }


    async function apiFetch(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
        };
        const response = await fetch(url, { ...defaultOptions, ...options });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    // --- Data Fetching ---
    async function fetchProducts() {
        try {
            tableBody.innerHTML = '<tr><td colspan="10" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
            emptyState.style.display = 'none';

            // Use the correct farmId from the token
            const farmIdFromToken = getFarmIdFromToken(token);
            if (!farmIdFromToken) {
                throw new Error("Farm ID not found in token.");
            }

            products = await apiFetch(`${PRODUCTS_API_URL}/farm/${farmIdFromToken}`);
            renderProducts(products);
            updateStats(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            tableBody.innerHTML = `<tr><td colspan="10" class="text-center text-danger">Failed to load products: ${error.message}</td></tr>`;
        }
    }

    async function fetchBatches() {
        try {
             const farmIdFromToken = getFarmIdFromToken(token);
            if (!farmIdFromToken) {
                throw new Error("Farm ID not found in token.");
            }
            const batches = await apiFetch(`${BATCHES_API_URL}/farm/${farmIdFromToken}`);
            const batchSelect = document.getElementById('batchId');
            batchSelect.innerHTML = '<option value="">Select a batch</option>';
            batches.forEach(batch => {
                const option = document.createElement('option');
                option.value = batch.batchId;
                option.textContent = `${batch.seasonName} (${new Date(batch.startDate).toLocaleDateString()} - ${new Date(batch.endDate).toLocaleDateString()})`;
                batchSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    }

    // --- UI Rendering ---
    function renderProducts(productsToRender) {
        if (!productsToRender || productsToRender.length === 0) {
            tableBody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        tableBody.innerHTML = productsToRender.map(product => `
            <tr>
                <td>${product.productId}</td>
                <td>${product.productName}</td>
                <td>${product.category}</td>
                <td>${product.batchId}</td>
                <td>${product.quantity}</td>
                <td>${product.unit}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td><span class="badge bg-gradient-${product.status === 'APPROVED' ? 'success' : 'warning'}">${product.status}</span></td>
                <td>${new Date(product.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-info view-btn" data-id="${product.productId}"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-sm btn-warning edit-btn" data-id="${product.productId}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${product.productId}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    function updateStats(products) {
        const totalProducts = products.length;
        const pendingProducts = products.filter(p => p.status === 'PENDING').length;
        const approvedProducts = products.filter(p => p.status === 'APPROVED').length;
        const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('pendingProducts').textContent = pendingProducts;
        document.getElementById('approvedProducts').textContent = approvedProducts;
        document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
    }
    
    function calculateTotalValue() {
        const quantity = parseFloat(document.getElementById('quantity').value) || 0;
        const price = parseFloat(document.getElementById('price').value) || 0;
        const totalValue = quantity * price;
        document.getElementById('totalValue').value = totalValue.toFixed(2);
    }


    // --- Event Handlers ---
    addProductBtn.addEventListener('click', () => {
        currentEditId = null;
        modalTitle.textContent = 'Add New Product';
        submitBtn.textContent = 'Create Product';
        productForm.reset();
        const farmIdInput = document.getElementById('farmId');
        if(farmId) {
            farmIdInput.value = farmId;
        }
        productModal.show();
    });

    tableBody.addEventListener('click', e => {
        const viewBtn = e.target.closest('.view-btn');
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');

        if (viewBtn) {
            const id = viewBtn.dataset.id;
            const product = products.find(p => p.productId == id);
            showViewModal(product);
        }
        if (editBtn) {
            const id = editBtn.dataset.id;
            const product = products.find(p => p.productId == id);
            showEditModal(product);
        }
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            if (confirm('Are you sure you want to delete this product?')) {
                deleteProduct(id);
            }
        }
    });

    productForm.addEventListener('submit', async e => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        const farmIdFromToken = getFarmIdFromToken(token);
        if (!farmIdFromToken) {
            alert("Error: Farm ID is missing. Cannot proceed.");
            submitBtn.disabled = false;
            submitBtn.textContent = currentEditId ? 'Save Changes' : 'Create Product';
            return;
        }

        const productData = {
            productName: document.getElementById('productName').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            quantity: parseFloat(document.getElementById('quantity').value),
            unit: document.getElementById('unit').value,
            price: parseFloat(document.getElementById('price').value),
            batchId: parseInt(document.getElementById('batchId').value, 10),
            farmId: parseInt(farmIdFromToken, 10),
            imageUrl: document.getElementById('imageUrl').value || null,
        };

        try {
            if (currentEditId) {
                await apiFetch(`${PRODUCTS_API_URL}/${currentEditId}`, {
                    method: 'PUT',
                    body: JSON.stringify(productData)
                });
            } else {
                await apiFetch(PRODUCTS_API_URL, {
                    method: 'POST',
                    body: JSON.stringify(productData)
                });
            }
            productModal.hide();
            fetchProducts();
        } catch (error) {
            alert(`Error saving product: ${error.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = currentEditId ? 'Save Changes' : 'Create Product';
        }
    });

    function showEditModal(product) {
        currentEditId = product.productId;
        modalTitle.textContent = 'Edit Product';
        submitBtn.textContent = 'Save Changes';
        
        document.getElementById('productName').value = product.productName;
        document.getElementById('category').value = product.category;
        document.getElementById('description').value = product.description;
        document.getElementById('quantity').value = product.quantity;
        document.getElementById('unit').value = product.unit;
        document.getElementById('price').value = product.price;
        document.getElementById('batchId').value = product.batchId;
        const farmIdInput = document.getElementById('farmId');
        if(farmId) {
            farmIdInput.value = farmId;
        }
        document.getElementById('imageUrl').value = product.imageUrl;
        document.getElementById('editProductId').value = product.productId;

        productModal.show();
    }
    
    function showViewModal(product) {
        const content = document.getElementById('viewProductContent');
        content.innerHTML = `
            <h5>${product.productName}</h5>
            <p><strong>Category:</strong> ${product.category}</p>
            <p><strong>Description:</strong> ${product.description || 'N/A'}</p>
            <p><strong>Quantity:</strong> ${product.quantity} ${product.unit}</p>
            <p><strong>Price:</strong> $${product.price.toFixed(2)} per ${product.unit}</p>
            <p><strong>Total Value:</strong> $${(product.quantity * product.price).toFixed(2)}</p>
            <p><strong>Status:</strong> <span class="badge bg-gradient-${product.status === 'APPROVED' ? 'success' : 'warning'}">${product.status}</span></p>
            <p><strong>Batch ID:</strong> ${product.batchId}</p>
            <p><strong>Farm ID:</strong> ${product.farmId}</p>
            <p><strong>Created At:</strong> ${new Date(product.createdAt).toLocaleString()}</p>
            ${product.imageUrl ? `<img src="${product.imageUrl}" class="img-fluid mt-3" alt="Product Image">` : ''}
        `;
        
        const editBtn = document.getElementById('editFromViewBtn');
        editBtn.onclick = () => {
            viewProductModal.hide();
            showEditModal(product);
        };

        viewProductModal.show();
    }

    async function deleteProduct(id) {
        try {
            await apiFetch(`${PRODUCTS_API_URL}/${id}`, { method: 'DELETE' });
            fetchProducts();
        } catch (error) {
            alert(`Error deleting product: ${error.message}`);
        }
    }
    
    // --- Initial Load ---
    function initialize() {
        if (!farmId) {
            alert('Could not identify your farm. Please log in again.');
            window.location.href = '/login';
            return;
        }
        fetchProducts();
        fetchBatches();

        document.getElementById('quantity').addEventListener('input', calculateTotalValue);
        document.getElementById('price').addEventListener('input', calculateTotalValue);
    }

    initialize();
});