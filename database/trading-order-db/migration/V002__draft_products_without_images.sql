-- Keep products awaiting an image out of the admin review queue.
-- Approved historical products remain unchanged. Safe to run repeatedly.
UPDATE marketplace_products SET status = 'DRAFT'
WHERE status = 'PENDING' AND TRIM(COALESCE(image_url, '')) = '';
