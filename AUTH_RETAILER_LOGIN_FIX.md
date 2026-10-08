# Sửa lỗi đăng nhập retailer — 04/10/2026

Lỗi `Query did not return a unique result: 2 results were returned` xuất phát từ hai bản ghi có cùng email `retailer@gmail.com` và username `retailer`: ID 5 và ID 6. Truy vấn `findByEmail` yêu cầu đúng một kết quả nên đăng nhập trả lỗi 500.

Đăng ký trước đây chỉ kiểm tra username gửi lên. Web retailer không gửi username; factory tự tạo tên từ phần trước dấu @ sau khi bước kiểm tra đã chạy. Email cũng chưa được kiểm tra trùng và database chưa có UNIQUE.

## Đã thực hiện

- Theo lựa chọn của chủ dự án, giữ tài khoản mới ID 6 và xóa bản trùng ID 5 sau khi sao lưu, kiểm tra liên kết dữ liệu. Email, username và hash mật khẩu của ID 6 được đối chiếu với bản sao lưu và giữ nguyên.
- Áp dụng UNIQUE `ux_users_email` và `ux_users_username` trên database auth; không còn nhóm email hoặc username trùng.
- Chuẩn hóa email, tạo username trước khi kiểm tra và từ chối đăng ký trùng bằng HTTP 409. Database UNIQUE ngăn đăng ký đồng thời trùng email.
- Đăng nhập và tải user details chỉ xử lý danh tính có đúng một bản ghi; không tự chọn bản ghi đầu tiên. Dữ liệu cũ còn trùng trả thông báo rõ ràng thay cho lỗi truy vấn 500.
- Phản hồi đăng ký không trả hash mật khẩu. Lỗi vi phạm UNIQUE trả 409 và không lộ chi tiết SQL.
- Sửa bộ khởi tạo admin: nếu đã có username `admin` hoặc email mặc định thì không tạo thêm tài khoản admin khi khởi động.
- Theo xác nhận riêng của chủ dự án, giữ admin ID 1 (`admin@gmail.com`), xóa bản mặc định ID 2 (`admin@bicap.com`) đã sao lưu. Mật khẩu và danh tính admin ID 1 được giữ nguyên.
- Token được auth service tra cứu theo userId đã ký và kiểm tra khớp username/trạng thái ACTIVE; token của tài khoản bị xóa không được chuyển sang tài khoản khác cùng tên. Việc này không phải cơ chế thu hồi JWT trên toàn bộ các service khác.
- Bản auth mới đã build và triển khai vào Docker hiện tại.

## Kiểm thử

`AccountIdentityTests` và `JwtAccountIdentityTests`: **21/21 đạt**, gồm kiểm tra email trùng, username tự tạo, chuẩn hóa dữ liệu, danh tính không rõ ràng, vai trò, phản hồi API, khởi tạo admin và xác thực JWT đúng tài khoản.

`node scripts/check-auth-identity.mjs`: **6/6 đạt** qua Kong với tài khoản retailer tạm:

1. Hai yêu cầu đăng ký cùng email đồng thời chỉ tạo một tài khoản, một yêu cầu trả 409.
2. Đăng nhập thật tạo JWT với userId/role đúng; JWT truy cập được API đơn hàng retailer.
3. Email đăng ký trùng dù khác chữ hoa/thường bị từ chối.
4. Sai mật khẩu bị từ chối.
5. Retailer không đăng nhập được với client farm manager.
6. Tài khoản kiểm thử được xóa đúng theo ID và email UUID, không tác động tài khoản người dùng.

Kiểm tra email `retailer@gmail.com` với mật khẩu kiểm thử cố ý sai trả 400 Invalid credentials, không còn lỗi trùng hoặc lỗi 500. Không có mật khẩu thật của tài khoản ID 6 để chạy đăng nhập bằng chính thông tin đó; kiểm tra đăng nhập thành công dùng tài khoản tạm và đã xác nhận mật khẩu ID 6 không bị thay đổi.

Ba kiểm tra JWT trực tiếp trên auth service cũng đạt: ID 6 được nhận đúng, token cũ của retailer ID 5 và admin ID 2 bị từ chối 403. Profile của ID 6 trả 404 vì chưa có hồ sơ, sau khi xác thực thành công; đây không phải test tạo hồ sơ.

Bản sao lưu và kết quả kiểm tra nằm tại `reports/auth-duplicate-repair/`, được Git bỏ qua để tránh commit hash mật khẩu.

## Sử dụng lại

Cả hai migration trong `database/auth-database/migration/` đã áp dụng. SQL khởi tạo cho database mới cũng có ràng buộc chống trùng. Database có volume hiện tại đã được cập nhật trực tiếp; không cần tạo lại database.

Người dùng có thể đăng nhập lại retailer bằng email `retailer@gmail.com` và mật khẩu đã đặt cho tài khoản mới ID 6.
