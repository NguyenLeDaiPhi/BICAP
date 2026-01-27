document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('exportTableBody');
    const emptyState = document.getElementById('emptyState');
    const productForm = document.getElementById('productForm');

    // 1. Fetch Export Batches Logic
    async function loadExportHistory() {
        try {
            // Call the proxy route defined in productProxyController.js
            const response = await fetch(`/api/export-batches/list`); // Assumes route mapping in Node routes
            
            // NOTE: Since your routes file isn't provided, ensure your Node app maps:
            // router.get('/api/export-batches/list', productProxyController.getExportBatches);

            if (!response.ok) throw new Error('Failed to load export history');

            const batches = await response.json();
            renderTable(batches);
        } catch (error) {
            console.error(error);
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Lỗi tải dữ liệu: ${error.message}</td></tr>`;
        }
    }

    // 2. Render Table Logic
    function renderTable(batches) {
        if (!batches || batches.length === 0) {
            tableBody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        tableBody.innerHTML = '';

        batches.forEach(batch => {
            // Check if product exists (Backend should send marketplaceProduct object or null)
            const hasProduct = batch.marketplaceProduct !== null;
            const productType = batch.productionBatch ? batch.productionBatch.productType : 'N/A';
            const exportDate = new Date(batch.exportDate).toLocaleDateString('vi-VN');

            const statusBadge = hasProduct 
                ? `<span class="badge badge-sm bg-gradient-success">Đang bán</span>`
                : `<span class="badge badge-sm bg-gradient-secondary">Chưa bán</span>`;

            const actionButton = hasProduct
                ? `<button class="btn btn-sm btn-link text-dark" disabled>Đã tạo SP</button>`
                : `<button class="btn btn-sm btn-success" onclick='openCreateModal(${JSON.stringify(batch)})'>
                     <i class="material-symbols-rounded text-sm">add_shopping_cart</i> Tạo SP
                   </button>`;

            const row = `
                <tr>
                    <td><span class="text-xs font-weight-bold">${batch.batchCode}</span></td>
                    <td><span class="text-xs">${productType}</span></td>
                    <td><span class="text-xs font-weight-bold">${batch.quantity} ${batch.unit}</span></td>
                    <td><span class="text-xs">${exportDate}</span></td>
                    <td>${statusBadge}</td>
                    <td>${actionButton}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }

    // 3. Open Modal & Pre-fill Data
    window.openCreateModal = function(batch) {
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        
        // Pre-fill strict data from Export Batch
        document.getElementById('exportBatchId').value = batch.id;
        document.getElementById('quantity').value = batch.quantity;
        document.getElementById('unit').value = batch.unit;
        
        // Suggest name based on product type
        const type = batch.productionBatch ? batch.productionBatch.productType : '';
        document.getElementById('productName').value = type + " - Lô " + batch.batchCode;
        
        modal.show();
    };

    // 4. Handle Form Submit (Create Product)
    productForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerText = "Đang xử lý...";

        const formData = new FormData(productForm);

        // Convert FormData to JSON for the proxy (or handle FormData in proxy)
        // Here we assume the Proxy expects JSON for data but FormData for images.
        // Simplified: Sending JSON first.
        
        const payload = Object.fromEntries(formData.entries());

        try {
            // This calls productProxyController.createProduct
            const response = await fetch('/api/marketplace-products/create', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Sản phẩm đã được đưa lên sàn!");
                bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
                loadExportHistory(); // Reload table
            } else {
                const err = await response.json();
                alert("Lỗi: " + err.error);
            }
        } catch (error) {
            alert("Lỗi kết nối: " + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "Đăng bán";
        }
    });

    // Initial Load
    loadExportHistory();
});