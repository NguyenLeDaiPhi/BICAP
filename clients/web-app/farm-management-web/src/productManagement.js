const PRODUCT_API_URL = '/api/marketplace-products';

document.addEventListener('DOMContentLoaded', () => {
    const farmIdInput = document.getElementById('farmId');
    const farmId = farmIdInput ? farmIdInput.value : null;

    if (farmId) {
        console.log('Product Management for Farm ID:', farmId);
        loadProducts(farmId);
    } else {
        console.error('Farm ID not found.');
        showEmptyState('Farm not found. Cannot load products.');
    }

    const addProductBtn = document.getElementById('addProductBtn');
    addProductBtn.addEventListener('click', () => {
        resetModal();
        const modalTitle = document.getElementById('modalTitle');
        modalTitle.textContent = 'Add New Product';
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.textContent = 'Create Product';
    });

    const productForm = document.getElementById('productForm');
    productForm.addEventListener('submit', handleFormSubmit);

    // Image preview logic
    const productImageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');

    if (productImageInput) {
        productImageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreviewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.src = '#';
                imagePreviewContainer.style.display = 'none';
            }
        });
    }
});

const getAuthToken = () => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});
    return cookies.auth_token;
};

async function loadProducts(farmId) {
    const tableBody = document.getElementById('productsTableBody');
    tableBody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-4"><i class="fas fa-spinner fa-spin me-2"></i>Loading products...</td></tr>';
    
    try {
        const token = getAuthToken();
        const response = await fetch(`${PRODUCT_API_URL}/farm/${farmId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showEmptyState('Could not load products.');
    }
}

function renderProducts(products) {
    const tableBody = document.getElementById('productsTableBody');
    const emptyState = document.getElementById('emptyState');

    if (!products || products.length === 0) {
        showEmptyState();
        return;
    }

    tableBody.innerHTML = '';
    emptyState.style.display = 'none';

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.batchId || 'N/A'}</td>
            <td>${product.quantity}</td>
            <td>${product.unit}</td>
            <td>$${product.price ? product.price.toFixed(2) : '0.00'}</td>
            <td>
                ${product.isApproved 
                    ? '<span class="badge bg-success">Approved</span>' 
                    : '<span class="badge bg-warning text-dark">Pending</span>'}
            </td>
            <td>${new Date(product.createdAt).toLocaleDateString()}</td>
            <td>
                <a href="#" class="btn btn-link text-dark px-3 mb-0" onclick="editProduct(${product.id})"><i class="fas fa-pencil-alt text-dark me-2" aria-hidden="true"></i>Edit</a>
                <a href="#" class="btn btn-link text-danger px-3 mb-0" onclick="deleteProduct(${product.id})"><i class="far fa-trash-alt me-2" aria-hidden="true"></i>Delete</a>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function showEmptyState(message = 'No products found. Create your first product to get started!') {
    const tableBody = document.getElementById('productsTableBody');
    const emptyState = document.getElementById('emptyState');
    tableBody.innerHTML = '';
    emptyState.style.display = 'block';
    emptyState.querySelector('p').textContent = message;
}

function resetModal() {
    document.getElementById('productForm').reset();
    document.getElementById('editProductId').value = '';
    document.getElementById('imagePreview').src = '#';
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('imageUrl').value = ''; // Clear hidden URL
}

async function uploadImage(file, token) {
    const formData = new FormData();
    formData.append('productImage', file);

    try {
        const response = await fetch('/upload/product-image', { // New upload endpoint
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to upload image');
        }

        const result = await response.json();
        return result.imageUrl; // Assuming the backend returns { imageUrl: '...' }
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const token = getAuthToken();
    const isEdit = !!document.getElementById('editProductId').value;
    const productId = document.getElementById('editProductId').value;

    const productImageInput = document.getElementById('productImage');
    const imageFile = productImageInput ? productImageInput.files[0] : null;
    let uploadedImageUrl = document.getElementById('imageUrl').value; // Existing or cleared URL

    if (imageFile) {
        try {
            uploadedImageUrl = await uploadImage(imageFile, token);
        } catch (error) {
            alert(`Image upload failed: ${error.message}`);
            return; // Stop form submission if image upload fails
        }
    }

    const productData = {
        farmId: document.getElementById('farmId').value,
        productName: document.getElementById('productName').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        quantity: parseInt(document.getElementById('quantity').value, 10),
        unit: document.getElementById('unit').value,
        price: parseFloat(document.getElementById('price').value),
        imageUrl: uploadedImageUrl || null, // Use uploaded URL or null
        // Batch ID is not included as it's not in this simplified form
    };

    const url = isEdit ? `${PRODUCT_API_URL}/${productId}` : PRODUCT_API_URL;
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save product');
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        modal.hide();
        loadProducts(productData.farmId);

    } catch (error) {
        console.error('Error saving product:', error);
        alert(`Error: ${error.message}`);
    }
}

// Placeholder for edit/delete functionality
async function editProduct(productId) {
    alert('Edit functionality not fully implemented in this version.');
    // TODO: Fetch product details and populate modal
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        const token = getAuthToken();
        const response = await fetch(`${PRODUCT_API_URL}/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to delete product');
        }
        
        const farmId = document.getElementById('farmId')?.value;
        loadProducts(farmId);

    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product.');
    }
}
