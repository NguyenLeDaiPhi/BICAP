# Migration cho database farm

`V002__link_products_to_seasons.sql` giữ `marketplace_products.batch_id` làm liên
kết mùa vụ, thêm `export_batch_id` để liên kết lô xuất hàng nếu có. Script bổ sung
index/foreign key, không xóa dữ liệu. Chạy tương tự V001 bằng cách thay tên file.

`V001__add_export_batch_farm.sql` bổ sung `export_batches.farm_id` mà entity
`ExportBatch` cần khi API chi tiết mùa vụ đọc danh sách lô xuất. Script giữ dữ liệu
hiện có, lấy farm của lô xuất cũ từ `production_batches`, tạo index và foreign key.
Có thể chạy lại script mà không tạo cột hoặc constraint trùng.

Schema khởi tạo `bicap_farm_db.sql` đã có cột này. Với database đã chạy trước đó,
Docker không tự chạy lại file khởi tạo; áp dụng migration một lần từ thư mục gốc
repo bằng PowerShell:

```powershell
Get-Content -Raw database/farm-production-database/migration/V001__add_export_batch_farm.sql |
  docker exec -i farm-production-db sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"'
```

Không cần xóa database, tạo lại mùa vụ hoặc restart backend để đọc cột vừa thêm.

V003__one_product_per_season.sql adds a unique season link (including pending and rejected products). Apply after V002. It preserves existing products and fails if duplicate season links need review.

V004__draft_products_without_images.sql moves PENDING products with no image back to DRAFT. Run the matching V002 migration for trading-order-db as well. Approved historical products are preserved. New products remain DRAFT in the farm database until a successful image upload publishes them to the admin review queue.
