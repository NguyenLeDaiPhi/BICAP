# Đánh giá khả năng chạy ổn định của BICAP

Ngày kiểm tra: 03/10/2026. Đánh giá trên mã và cấu hình hiện có trong workspace; không sửa mã nghiệp vụ.

Kết luận: dự án có các thành phần chính, nhưng còn thiếu sự thống nhất về cấu hình triển khai, API, quyền sở hữu dữ liệu và độ tin cậy của các luồng liên service. Biên dịch thành công chưa đủ chứng minh hệ thống chạy hoàn chỉnh.

## Tiến độ sửa lỗi

Mục 1 đã được xử lý về cấu hình: Compose gốc và đường dẫn `infrastructure/docker/docker-compose.yml` cùng dùng project `bicap` và một bộ MySQL/Kong. Cấu hình SQL Server cũ được giữ nguyên trong các file `.sqlserver.yml.example` để tham khảo. Makefile dùng đầy đủ Compose gốc cho từng nhóm, npm workspace chuyển sang `frontend/web/*`, các web có tên/cổng riêng, lockfile và README đã được đồng bộ. Đường dẫn Dockerfile admin được sửa đúng chữ hoa/thường và wrapper được cấp quyền thực thi trong image Linux.

Kiểm tra: Compose gốc và lối vào tương thích resolve giống nhau; 12 đường dẫn build cùng các bind mount tồn tại; dependency đầy đủ và không trùng cổng host; npm nhận đúng 5 workspace. Docker engine chưa hoạt động nên chưa kiểm chứng build/start container. Các phát hiện dưới đây là kết quả đánh giá ban đầu; lỗi YAML/API/schema và các mục khác vẫn cần xử lý tiếp.

## Kết quả kiểm tra thực tế

| Kiểm tra | Kết quả |
|---|---|
| Java trên máy | Java 21 |
| Docker daemon | Không kết nối được Docker Desktop Linux Engine; chưa chạy thử toàn hệ thống |
| `docker compose config --quiet` tại thư mục gốc | Qua |
| Compose trong `infrastructure/docker` | Qua phân tích cú pháp, nhưng có lỗi đường dẫn build và cổng |
| Maven compile offline | Cả 7 service trong `services/` đều qua; đây là kiểm tra biên dịch, không phải kiểm thử tích hợp |
| `BlockchainClientTest` | 19 test qua; kiểm tra client mô phỏng, không chứng minh có giao dịch trên mạng blockchain |
| `FarmManagementApplicationTests` | Thất bại: không tìm thấy `@SpringBootConfiguration` |
| TypeScript `--noEmit --incremental false` | Farm và guest qua |
| `npm run build` farm và guest | Đã thử, nhưng chưa hoàn tất sau hơn 5 phút và không có thêm log sau banner Next.js; đã dừng các process build của đợt kiểm tra |

Các service đã kiểm tra Maven: auth, farm-production, trading-order, shipping-manager, blockchain-adapter, admin và image-storage. Ba web admin, retailer, shipping chưa có `node_modules` riêng nên chưa kiểm tra build tại máy. Không cài thêm dependency trong đợt đánh giá này.

Chưa xác định nguyên nhân hai build Next.js không hoàn tất; cần điều tra riêng môi trường Node, dependency và quá trình build. Kết quả TypeScript không thay thế kiểm tra đóng gói Next.js. Các lệnh Maven/Next.js có thể cập nhật output sinh tự động trong `target/` và `.next/`; mã nguồn nghiệp vụ không được sửa trong đợt đánh giá.

## Ưu tiên 0: cấu hình và API để chạy được luồng chính

### 1. Chọn một bộ kiến trúc và cách chạy chính thức

- Compose gốc chạy `services/`, MySQL, RabbitMQ và Kong; frontend ở `frontend/web/`.
- README và cấu hình trong `infrastructure/docker/` còn mô tả/chạy bộ SQL Server, Spring Cloud Gateway và các service tách riêng trong `backend/`.
- `package.json` gốc vẫn trỏ workspace đến `clients/web-app/*`, nên lệnh npm ở gốc không quản lý bộ Next.js đang được Compose sử dụng.
- Compose trong `infrastructure/docker/` dùng `context: ..`, tức thư mục `infrastructure`, nhưng Dockerfile được khai báo theo đường dẫn tính từ gốc repo. Kiểm tra đường dẫn sau khi resolve cho thấy các Dockerfile không tồn tại tại vị trí đó.
- Cấu hình này còn trùng host port 8081 giữa auth và farm-production, 8086 giữa order và image-storage.

Việc cần làm: chọn Compose gốc làm bộ chạy demo hiện tại, đồng bộ README, workspace npm và scripts; đánh dấu bộ còn lại là legacy hoặc sửa riêng nếu thực sự cần triển khai theo RULE.MD. Nếu SQL Server/Spring Cloud Gateway là yêu cầu nghiệm thu bắt buộc, cần xác định kế hoạch chuyển đổi rõ ràng.

Nguồn: [Compose gốc](docker-compose.yml), [Compose còn lại](infrastructure/docker/docker-compose.yml), [npm workspace](package.json), [README](README.md).

### 2. Sửa cấp cấu hình YAML ở cả 7 service

Trong các `services/*/src/main/resources/application.yml`, `datasource`, `jpa`, `kafka`, `rabbitmq`, `data.redis` đang nằm dưới `server` do thụt lề. Chúng cần nằm dưới `spring`. Image-storage còn đặt `servlet.multipart` dưới `server`.

Compose ghi đè một số cấu hình bằng biến môi trường nên che được một phần lỗi; chạy trực tiếp hoặc các thuộc tính không được ghi đè vẫn có thể dùng mặc định sai. Đặc biệt `ddl-auto: update` nằm sai cấp sẽ không có tác dụng như dự định ở các service không có cấu hình khác thay thế.

Việc cần làm: sửa YAML, tách profile local/docker và kiểm tra cấu hình hiệu lực cho DB, broker, Redis, upload và JPA.

Ví dụ: [farm YAML](services/farm-production-service/src/main/resources/application.yml), [auth YAML](services/auth-service/src/main/resources/application.yml), [image YAML](services/image-storage-service/src/main/resources/application.yml).

### 3. Đồng bộ frontend → Kong → controller

- Farm gọi `/api/farms/my` và `PUT /api/farms/{id}`, nhưng `FarmController` hiện chỉ có POST/GET `/api/farms`. Kong cũng chưa có route riêng `/api/farms`.
- Retailer gọi `/api/trading/products`, nhưng Kong chưa có route riêng `/api/trading`; controller hiện chưa có GET collection tương ứng với `getProducts()` của frontend.
- Admin gọi `/api/admin/*`, trong khi admin-service dùng `/api/v1/admin/*`. Route `/api/v1/admin` của Kong lại trỏ `admin-web`, và web Next.js hiện không có API route proxy tương ứng.
- Guest mặc định gọi port 8080 trong khi Kong của Compose gốc mở port 8000; chưa có route `/api/trace` đến traceability-service trong bộ Compose gốc.
- Shipping gọi trading qua `application.config.trading-order-service-url` mặc định `localhost:8082`; Compose mới chỉ ghi đè farm và blockchain URL. Trong container, localhost không phải container trading.

Việc cần làm: lập bảng API chính thức theo từng web, chuẩn hóa đường dẫn/phương thức/response và trỏ đúng upstream. Cấu hình API URL công khai khi build Next.js; tách URL nội bộ Docker nếu dùng proxy phía server.

Nguồn: [Kong](api-gateway/kong.yml), [farm API frontend](frontend/web/farm-manager-web/src/lib/api.ts), [FarmController](services/farm-production-service/src/main/java/com/bicap/farm_management/controller/FarmController.java), [admin API frontend](frontend/web/admin-web/src/lib/api.ts), [shipping OrderService](services/shipping-manager-service/src/main/java/com/bicap/shipping_manager_service/service/OrderService.java).

### 4. Đồng bộ schema SQL với entity và thêm migration

- SQL khởi tạo image-storage tạo `product_images`, nhưng JPA dùng `image_metadata` với bộ cột khác.
- SQL farm `marketplace_products` có `batch_id`, nhưng entity dùng quan hệ `export_batch_id`.
- Sai cấp `spring.jpa` ở trên khiến không thể mặc định tin Hibernate sẽ bù các khác biệt schema này.

Việc cần làm: bổ sung migration có version cho từng DB, kiểm thử trên DB mới và DB đã có dữ liệu; dùng schema validation sau khi migration. Không dựa vào thao tác xóa DB để nâng cấp.

Nguồn: [image SQL](database/image-storage-db/image_storage_db.sql), [ImageMetadata](services/image-storage-service/src/main/java/com/bicap/imagestorage/entity/ImageMetadata.java), [farm SQL](database/farm-production-database/bicap_farm_db.sql), [MarketplaceProduct](services/farm-production-service/src/main/java/com/bicap/farm_management/entity/MarketplaceProduct.java).

## Ưu tiên 1: dữ liệu và nghiệp vụ đúng

### 5. Kiểm tra quyền sở hữu ngoài role

- `/api/products/my` đang trả toàn bộ sản phẩm APPROVED, không lọc trang trại hiện tại và không trả sản phẩm PENDING của chính người tạo.
- Khi tạo sản phẩm thiếu farmId, service lấy trang trại đầu tiên trong DB, thay vì trang trại của người đăng nhập.
- Update/delete sản phẩm tìm theo ID nhưng chưa kiểm tra chủ trang trại.
- Confirm/reject đơn kiểm tra role nhưng service chưa kiểm tra đơn có thuộc trang trại của người thao tác.
- Trading cho `permitAll()` với `/api/admin/**`, trong khi cổng backend 8082 được công khai trên host; API mang tên nội bộ chưa có xác thực liên service.

Việc cần làm: lấy userId từ JWT, kiểm tra ownerId trong service cho từng thao tác, bổ sung xác thực API nội bộ và test bằng hai tài khoản trang trại khác nhau.

Nguồn: [product controller](services/farm-production-service/src/main/java/com/bicap/farm_management/controller/MarketplaceProductController.java), [product service](services/farm-production-service/src/main/java/com/bicap/farm_management/service/impl/MarketplaceProductServiceImpl.java), [OrderService](services/trading-order-service/src/main/java/com/bicap/trading_order_service/service/OrderService.java), [trading security](services/trading-order-service/src/main/java/com/bicap/trading_order_service/security/SecurityConfig.java).

### 6. Hoàn thiện thanh toán MoMo

- `GET /api/payments/momo/success/{paymentToken}` tạo đơn từ token trong bộ nhớ mà chưa xác minh chữ ký, số tiền hoặc kết quả thanh toán với MoMo.
- IPN URL hard-code `localhost:8081`, khác port trading 8082; PaymentController chưa có endpoint POST `/momo/ipn`.
- `PaymentStorage` lưu request bằng `ConcurrentHashMap`: restart làm mất dữ liệu, nhiều instance không chia sẻ dữ liệu. Token chưa được gắn với người tạo trong storage.
- Luồng đọc token → tạo đơn → xóa token chưa bảo đảm chỉ xử lý một lần khi có request đồng thời.
- PaymentService tạo `new RestTemplate()` nhưng chưa thiết lập timeout, dù comment nói đã có timeout.

Việc cần làm: lưu payment vào DB, gắn buyer/order/amount, xử lý IPN có xác thực chữ ký, chuyển trạng thái atomically và chống callback trùng. Cấu hình callback URL mà cổng thanh toán có thể truy cập, thông số môi trường và timeout.

Nguồn: [PaymentController](services/trading-order-service/src/main/java/com/bicap/trading_order_service/controller/PaymentController.java), [PaymentStorage](services/trading-order-service/src/main/java/com/bicap/trading_order_service/service/PaymentStorage.java), [PaymentService](services/trading-order-service/src/main/java/com/bicap/trading_order_service/service/PaymentService.java).

### 7. Đồng bộ sản phẩm và đơn hàng khi broker lỗi

- ProductProducerMQ nhận `type` nhưng không đưa loại event vào message.
- Message sản phẩm chưa có sourceProductId ổn định; consumer tìm theo batchId hoặc farm + tên + PENDING. Sản phẩm không có batchId, đổi tên hoặc đã APPROVED dễ không được khớp đúng khi cập nhật/gửi lại.
- Approve/delete ở farm chưa phát event tương ứng sang trading.
- Publisher và consumer bắt lỗi rồi chỉ log; DB có thể đã lưu, nhưng service kia không nhận dữ liệu. Consumer có thể kết thúc bình thường dù xử lý thất bại.

Việc cần làm: chuẩn hóa eventId/type/sourceProductId/version, transactional outbox, retry/DLQ, consumer xử lý lặp an toàn và cơ chế đối soát. Kiểm thử mất kết nối broker và thứ tự event đăng ký → tạo farm → tạo sản phẩm.

Nguồn: [ProductProducerMQ](services/farm-production-service/src/main/java/com/bicap/farm_management/service/ProductProducerMQ.java), [TradingOrderEventListener](services/trading-order-service/src/main/java/com/bicap/trading_order_service/service/TradingOrderEventListener.java), [OrderService](services/trading-order-service/src/main/java/com/bicap/trading_order_service/service/OrderService.java).

### 8. Bổ sung kiểm soát tồn kho và trạng thái đơn

`createOrder()` lấy sản phẩm và tính tiền nhưng chưa kiểm tra APPROVED, tồn kho hoặc giữ/trừ số lượng. Controller chưa dùng `@Valid`; DTO items chưa có kiểm tra danh sách không rỗng và validation lồng nhau. `completeOrder()` chuyển COMPLETED mà chưa kiểm tra trạng thái trước đó.

Việc cần làm: kiểm tra đầu vào, giữ/trừ tồn kho trong transaction có kiểm soát đồng thời, hoàn tồn khi hủy/từ chối và định nghĩa các chuyển trạng thái hợp lệ. Giá trị tiền cần thống nhất kiểu BigDecimal và quy tắc làm tròn.

Nguồn: [OrderService](services/trading-order-service/src/main/java/com/bicap/trading_order_service/service/OrderService.java), [OrderController](services/trading-order-service/src/main/java/com/bicap/trading_order_service/controller/OrderController.java), [CreateOrderRequest](services/trading-order-service/src/main/java/com/bicap/trading_order_service/dto/CreateOrderRequest.java).

### 9. Kết nối blockchain và truy xuất bằng dữ liệu thật

BlockchainClient hiện tự sinh transaction hash, block, gas và contract address; không gửi giao dịch thật. Guest khi API lỗi còn tự sinh thông tin và hash cho bất kỳ mã bắt đầu bằng BICAP, sử dụng dữ liệu mẫu có trạng thái xác minh hợp lệ. Như vậy giao diện có thể trông thành công dù backend lỗi hoặc mã không tồn tại.

Việc cần làm: tách rõ chế độ demo, hiển thị lỗi/mã không tồn tại đúng thực tế; nối QR với dữ liệu mùa vụ/lô xuất/vận chuyển. Nếu yêu cầu blockchain thật, cần adapter testnet, contract đã deploy, cấu hình ví, gửi giao dịch và xác minh receipt/hash trên chain.

Nguồn: [BlockchainClient](services/blockchain-adapter-service/src/main/java/com/bicap/blockchain_adapter_service/service/BlockchainClient.java), [guest trace](frontend/web/guest-web/src/app/trace/page.tsx).

## Ưu tiên 2: giữ hệ thống ổn định sau khi chạy được

### 10. Kiểm thử và pipeline

Test farm nằm trong `com.example.farm_management`, còn application nằm trong `com.bicap.farm_management`, nên Spring không tìm được configuration. Các service còn lại phần lớn chỉ có contextLoads; chưa thấy bộ E2E frontend hoặc CI trong repo. Dockerfile backend đang bỏ qua test.

Việc cần làm: sửa test farm, thêm test nghiệp vụ và tích hợp cho phân quyền, payment, tồn kho, event; chạy build/test trong CI. Các lỗi kết nối cần hiển thị riêng với trạng thái danh sách rỗng.

### 11. Lưu dữ liệu, healthcheck và quản lý cấu hình

- Compose MySQL mới chỉ mount SQL khởi tạo, chưa quản lý `/var/lib/mysql` bằng named volume ổn định. MySQL image có thể dùng anonymous volume, nhưng cần quy trình tái sử dụng và backup/restore rõ ràng khi recreate container.
- RabbitMQ/Kafka chưa có volume dữ liệu được cấu hình trong Compose gốc.
- Một số healthcheck coi 401/403 là healthy; điều này chưa kiểm tra được tình trạng DB/broker.
- JWT secret, mật khẩu DB/MinIO và thông số thanh toán nằm trực tiếp trong mã/cấu hình.
- URL tải ảnh được ký bằng MinioClient có endpoint `http://minio:9000`; cần kiểm tra URL trả về có truy cập được từ trình duyệt ngoài Docker và xử lý thời hạn URL.

Việc cần làm: cấu hình named volumes và backup, readiness/liveness đúng, logging có correlationId, quản lý secret ngoài Git và tách endpoint lưu trữ nội bộ/công khai.

### 12. Dọn trạng thái repository và tái lập build

`.gitignore` hiện chỉ có node_modules; 157 file trong target đang được Git theo dõi. Farm và shipping Next.js còn có package name `admin-web`. Các web chưa đồng bộ lockfile, Dockerfile dùng npm install.

Việc cần làm: bỏ theo dõi build artifacts bằng thay đổi có kiểm soát, thêm ignore cho target/.next/.env/logs, thống nhất package name và lockfile rồi dùng npm ci. Không ghi đè hoặc xóa các thay đổi đang có của người phát triển.

## Checklist nghiệm thu đề xuất

1. Một lệnh chạy từ clone mới; tất cả service readiness đạt, cấu hình DB/broker đúng.
2. Đăng ký → đăng nhập → tạo farm → tạo mùa vụ → nhật ký → lô xuất/QR.
3. Tạo sản phẩm → chủ trang trại thấy PENDING của mình → admin duyệt → retailer thấy đúng dữ liệu.
4. Hai chủ trang trại không đọc/sửa/xóa/xác nhận dữ liệu của nhau.
5. Hai đơn mua đồng thời không vượt tồn kho; hủy/từ chối hoàn tồn đúng.
6. Thanh toán thất bại không được tạo trạng thái thành công; callback trùng không tạo đơn trùng.
7. Confirm đơn → shipping nhận được → giao hàng → hoàn tất đúng trạng thái.
8. QR thật trả dữ liệu thật; mã không tồn tại không được báo xác minh thành công.
9. Dừng broker rồi bật lại: dữ liệu/event được phục hồi, không mất hoặc nhân đôi nghiệp vụ.
10. Restart/recreate theo quy trình: DB, ảnh, payment và trạng thái đơn vẫn còn; restore backup được kiểm chứng.

Thứ tự triển khai: cấu hình/đường dẫn/API/schema → quyền sở hữu và payment → đồng bộ event/tồn kho → QR/blockchain → E2E và vận hành.
