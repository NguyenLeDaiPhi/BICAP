# Tài khoản không trùng định danh

`V001__unique_account_identifiers.sql` thêm UNIQUE cho email; `V002__unique_usernames.sql` thêm UNIQUE cho username. Các chỉ mục ngăn hai đăng ký đồng thời tạo tài khoản trùng. Backend chuẩn hóa email và kiểm tra tên tự tạo trước khi lưu; đăng ký trùng trả 409.

Trước khi áp dụng, kiểm tra:

```sql
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;
SELECT username, COUNT(*) FROM users GROUP BY username HAVING COUNT(*) > 1;
```

Sao lưu các tài khoản và vai trò bị trùng. Xác định tài khoản cần giữ và kiểm tra profile, đơn hàng, liên kết userId ở các service trước khi xử lý. Không tự chọn bản ghi đầu tiên khi đăng nhập, không xóa tài khoản chưa được chủ dự án đồng ý.

Chạy từng migration trên database auth sau khi xử lý các bản ghi trùng tương ứng. Nếu còn trùng, ALTER bị từ chối và không thêm chỉ mục đó; cần giải quyết dữ liệu trước rồi chạy lại. Có thể khóa email trước trong khi chờ xử lý username cũ. Database đang có volume sẽ không tự áp dụng thay đổi trong SQL khởi tạo.
