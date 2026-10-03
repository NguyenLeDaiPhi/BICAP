# Migration cho database farm

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
