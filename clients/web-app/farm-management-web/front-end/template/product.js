document.addEventListener('DOMContentLoaded', () => {
    const farmIdInput = document.getElementById('farmId');
    const farmId = farmIdInput ? farmIdInput.value : null;

    if (farmId) {
        console.log('Product Management for Farm ID:', farmId);
        loadProducts(farmId);
    }

    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            resetModal();
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle) modalTitle.textContent = 'Add New Product';
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) submitBtn.textContent = 'Create Product';
        });
    }

    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleFormSubmit);
    }

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
                    if (imagePreview) imagePreview.src = e.target.result;
                    if (imagePreviewContainer) imagePreviewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                if (imagePreview) imagePreview.src = '#';
                if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
            }
        });
    }
});

async function loadProducts(farmId) {
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-4"><i class="fas fa-spinner fa-spin me-2"></i>Loading products...</td></tr>';
    
    try {
        // PRODUCT_API_URL is defined in the EJS template
        const response = await fetch(`${PRODUCT_API_URL}/farm/${farmId}`, {
            credentials: 'include'
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

    if (tableBody) tableBody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'none';

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
                ${product.status === 'APPROVED'
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
    if (tableBody) tableBody.innerHTML = '';
    if (emptyState) {
        emptyState.style.display = 'block';
        const p = emptyState.querySelector('p');
        if (p) p.textContent = message;
    }
}

function resetModal() {
    const form = document.getElementById('productForm');
    if (form) form.reset();
    const editId = document.getElementById('editProductId');
    if (editId) editId.value = '';
    
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imageUrl = document.getElementById('imageUrl');
    
    if (imagePreview) imagePreview.src = '#';
    if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
    if (imageUrl) imageUrl.value = '';
}

async function uploadImage(file) {
    const formData = new FormData();
    formData.append('productImage', file);

    try {
        const response = await fetch('/upload/product-image', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to upload image');
        }

        const result = await response.json();
        return result.imageUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const editIdInput = document.getElementById('editProductId');
    const productId = editIdInput ? editIdInput.value : '';
    const isEdit = !!productId;

    const productImageInput = document.getElementById('productImage');
    const imageFile = productImageInput ? productImageInput.files[0] : null;
    const imageUrlInput = document.getElementById('imageUrl');
    let uploadedImageUrl = imageUrlInput ? imageUrlInput.value : '';

    if (imageFile) {
        try {
            uploadedImageUrl = await uploadImage(imageFile);
        } catch (error) {
            alert(`Image upload failed: ${error.message}`);
            return;
        }
    }

    const productData = {
        farmId: document.getElementById('farmId').value,
        name: document.getElementById('productName').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        quantity: parseInt(document.getElementById('quantity').value, 10),
        unit: document.getElementById('unit').value,
        price: parseFloat(document.getElementById('price').value),
        imageUrl: uploadedImageUrl || null,
        batchId: document.getElementById('batchId') ? document.getElementById('batchId').value : null
    };

    const url = isEdit ? `${PRODUCT_API_URL}/${productId}` : PRODUCT_API_URL;
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            let errorMessage = 'Failed to save product';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                errorMessage += ` (Status: ${response.status})`;
            }
            throw new Error(errorMessage);
        }

        // Assuming bootstrap is available globally
        const modalEl = document.getElementById('productModal');
        if (modalEl && window.bootstrap) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }
        
        loadProducts(productData.farmId);

    } catch (error) {
        console.error('Error saving product:', error);
        alert(`Error: ${error.message}`);
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        const response = await fetch(`${PRODUCT_API_URL}/${productId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to delete product');
        }
        
        const farmIdInput = document.getElementById('farmId');
        const farmId = farmIdInput ? farmIdInput.value : null;
        if (farmId) loadProducts(farmId);

    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product.');
    }
}

// Placeholder for edit
async function editProduct(productId) {
    alert('Edit functionality not fully implemented in this version.');
}