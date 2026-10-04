# Kiểm tra BICAP — 04/10/2026

Dự án chạy được các phần chính, nhưng **chưa đủ để vận hành thực tế ổn định**. Hai vấn đề cần ưu tiên nhất là API admin nội bộ chưa có xác thực và khả năng đọc sản phẩm của trang trại khác. Blockchain/truy xuất, xử lý tồn kho, thanh toán và một số tích hợp vẫn chưa hoàn chỉnh.

Lần kiểm tra lại: **14:22:29 4/10/2026 (giờ Việt Nam)**. Đã chạy lại build cả 12 image, toàn bộ test Java, 81 kiểm tra HTTP, 6 tình huống AI thật và logic widget của cả guest/retailer. Kết quả còn thiếu không thay đổi so với lần trước.

## Phạm vi và kết quả

Kiểm tra bộ Compose đang hoạt động: 7 backend trong `services/`, 5 web trong `frontend/web/`, Kong, database và các kết nối hạ tầng liên quan. Các thư mục `backend/`, `clients/`, `mobile/` không thuộc bộ chạy này; chưa kiểm thử thực thi đầy đủ các ứng dụng đó.

| Kiểm tra | Kết quả |
| --- | --- |
| Build Docker: 7 backend + 5 web | Thành công cả 12 image |
| Cấu hình Compose và Kong | Hợp lệ |
| Health API 7 backend, sau sửa Redis | 7/7 HTTP 200 |
| HTTP: API, lỗi đầu vào, phân quyền, các trang web | 71/81 đạt, 10 không đạt |
| HTTP 37 đường dẫn page của 5 web | 37/37 trả 200 |
| Java: chạy lại toàn bộ test của 7 service | 65 test khác nhau: 60 đạt, 5 lỗi khởi tạo application context |
| Test nghiệp vụ giao dịch trong lần chạy toàn bộ | 23/23 đạt; trong đó 12 test AI; test context riêng vẫn lỗi |
| Model AI thật qua Kong, có Origin của guest | 6/6 tình huống đạt |
| Logic widget guest và retailer bằng React hook harness | Đạt trên cả hai component |
| Image service | Biên dịch/test phase thành công qua wrapper dự phòng; chưa có test |

HTTP 200 của trang Next.js chỉ xác nhận route tải được, không xác nhận mọi thao tác trong trang. Các API có quyền dùng JWT kiểm thử được ký bằng cấu hình hiện tại; chưa kiểm thử đăng nhập thực bằng mật khẩu và toàn bộ luồng mua/giao hàng qua trình duyệt. Không gọi thanh toán ngoài, không gửi giao dịch blockchain thật. Đánh giá oversell và đồng bộ sự kiện bên dưới dựa trên mã nguồn, chưa tạo đơn thực để thử cạnh tranh trên dữ liệu người dùng.

Bằng chứng: [HTTP](reports/full-audit-2026-10-04/http-checks.json), [Java tổng hợp](reports/full-audit-2026-10-04/java-tests-final.json), [Java theo service](reports/full-audit-2026-10-04/java-tests.json), [AI thật](reports/full-audit-2026-10-04/ai-live-checks.json), [kiểm tra AI và widget đã triển khai](reports/full-audit-2026-10-04/final-ai-smoke.json), [container](reports/full-audit-2026-10-04/container-status.json). Log build và test giữ trong cùng thư mục trên máy, được bỏ qua khi commit vì kích thước lớn.

Database farm đã có bảng nhật ký `farming_processes`; API nhật ký mùa vụ hiện có trả 200. Kiểm tra sau audit không có sản phẩm `AUDIT_MUST_NOT_SAVE` trong trading database.

## Những phần đã sửa trong lượt này

1. Redis trước đó không có kết nối đúng vào network BICAP; cổng host 6379 đã bị một dự án khác sử dụng. Chuyển cổng Redis của BICAP sang `${REDIS_HOST_PORT:-6380}`, giữ cổng nội bộ 6379, khôi phục kết nối và thêm cấu hình Redis cho auth/trading/shipping. Không xóa volume. Cả 7 health API đã trả 200.
2. Chặn `POST /api/fetch-marketplace-products` cũ bằng 409, hướng farm manager tạo sản phẩm và thêm ảnh ở giao diện quản lý trang trại. Endpoint cũ thiếu kiểm tra một sản phẩm/mùa vụ và ảnh, có thể bỏ qua quy trình hiện tại. Danh mục GET vẫn hoạt động; test hồi quy xác nhận không gọi service lưu dữ liệu qua đường tạo cũ.
3. Thêm AI thực bằng Ollama `qwen3:4b`, widget trên guest và retailer. Backend lấy sản phẩm thật đã duyệt, kiểm tra tồn kho và ngân sách; AI không tự tạo giá hay thông tin chứng nhận. [Hướng dẫn sử dụng và cấu hình](docs/SHOPPING_ASSISTANT.md).

## Các thiếu sót cần xử lý

### P0 — API admin nội bộ chưa được bảo vệ

**Xác nhận trực tiếp:** gọi không có JWT đến `http://localhost:8082/api/admin/products` trả 200 và danh sách sản phẩm. Trading `SecurityConfig` đặt `/api/admin/**` là `permitAll`; Compose công khai cổng 8082. Controller nội bộ còn có các thao tác duyệt/từ chối; lượt audit chỉ gọi đọc, không thử đổi trạng thái dữ liệu thật.

Cần xác thực service-to-service, phân quyền cho thao tác nội bộ và giới hạn cổng backend khỏi truy cập bên ngoài. Các client gọi nội bộ phải được cập nhật cùng lúc để admin/shipping tiếp tục hoạt động. Bảo vệ `/api/v1/admin/**` ở Kong không bảo vệ được cổng backend đang mở.

Nguồn: `services/trading-order-service/.../security/SecurityConfig.java`, `controller/InternalAdminProductController.java`, `docker-compose.services.yml`.

### P0/P1 — Kiểm tra chủ sở hữu còn thiếu

**Xác nhận trực tiếp:** JWT farm manager khác đọc `/api/products/farm/1` vẫn trả 200 với hai sản phẩm, gồm dữ liệu chưa được công bố. API chi tiết mùa vụ của farm khác trả 500 thay vì 403/404; đây là lỗi xử lý từ chối quyền, không phải bằng chứng endpoint đó tiết lộ nội dung mùa vụ.

Cần kiểm tra farmId với chủ sở hữu lấy từ JWT cho các API sản phẩm, mùa vụ, nhật ký và đơn hàng; không tin ID do client gửi. Phân biệt API đọc danh mục công khai với dữ liệu nội bộ của trang trại. Chuẩn hóa lỗi thiếu quyền thành 403 hoặc 404.

### P1 — Đơn hàng và tồn kho chưa đảm bảo

**Qua mã nguồn:** `OrderService.createOrder` kiểm tra số lượng từng dòng so với tồn hiện tại nhưng chưa giữ/trừ tồn kho và chưa có khóa hoặc cập nhật tồn kho nguyên tử. Hai dòng cùng sản phẩm hoặc nhiều đơn đồng thời có thể vượt tồn. Cần cộng số lượng theo productId, giữ tồn trong transaction và hoàn tồn khi hủy/từ chối; kiểm tra chuyển trạng thái và chủ sở hữu đơn.

**Sai kết nối ở farm UI:** `farm-manager-web/src/lib/api.ts` dùng `/api/orders/my` cho danh sách, trong khi API này là đơn của người mua. UI gọi `/api/orders/{id}/accept`, backend có `/confirm`. Cần nối danh sách theo farm và endpoint xác nhận đúng, rồi kiểm thử retailer đặt → farm xác nhận/từ chối → shipping nhận → hoàn tất.

**Shipping:** `application.properties` còn gọi trading qua `http://localhost:8082` trong container. `getConfirmedOrders` bắt lỗi và trả danh sách rỗng, nên HTTP 200 không chứng minh kết nối liên dịch vụ thành công. Cần URL nội bộ Compose và phản hồi lỗi tích hợp rõ ràng.

Nguồn: `services/trading-order-service/.../service/OrderService.java`, `frontend/web/farm-manager-web/src/lib/api.ts`, `services/shipping-manager-service/src/main/resources/application.properties`, `.../service/OrderService.java`.

### P1 — Blockchain và truy xuất vẫn là mô phỏng

**Qua mã nguồn:** `BlockchainClient` tạo dữ liệu giao dịch bằng `SecureRandom`; các test hiện tại kiểm tra cơ chế mô phỏng, không chứng minh dữ liệu đã ghi lên mạng blockchain. Guest `/trace` dùng `mockDatabase` và còn tạo transaction hash ngẫu nhiên cho mã không có. API `/api/trace/AUDIT-NOT-A-REAL-CODE` trả 500.

Cần RPC thật, ví ký giao dịch, smart contract đã triển khai, transaction receipt và số xác nhận; lưu chainId/contract/transactionHash gắn với bản ghi. Nhật ký chỉ chuyển trạng thái xác thực sau khi có receipt hợp lệ. Trang truy xuất phải dùng dữ liệu API thật và báo không tìm thấy khi mã không tồn tại. Không được dùng hash tạo ngẫu nhiên như bằng chứng xác thực.

Nguồn: `services/blockchain-adapter-service/.../service/BlockchainClient.java`, `frontend/web/guest-web/src/app/trace/page.tsx`.

### P1/P2 — Một số chức năng còn gọi API chưa có hoặc sai đường dẫn

| Yêu cầu kiểm tra | HTTP hiện tại | Việc cần làm |
| --- | --- | --- |
| `/api/farms/my` | 500 | Nối endpoint lấy farm của người đăng nhập |
| `/api/auth/profile` | 404 | Đồng bộ frontend với endpoint profile thực tế của auth |
| `/api/notifications/me` | 500 | Hoàn thiện notification backend/route và API đang gọi |
| `/api/iot/farm/1` | 500 | Nối service dữ liệu IoT hoặc xử lý trạng thái chưa tích hợp |
| `/api/shipping/reports/daily` | 500 | Hoàn thiện API báo cáo và route |
| `/api/trace/<mã không tồn tại>` | 500 | Nối truy xuất thật; mã không tồn tại phải trả 404 |
| `/api/admin/products` qua Kong | 500 | Đường nội bộ không được expose đúng; phân biệt với API admin frontend `/api/v1/admin/products`, đang trả 200 với quyền admin |

Cùng với hai vấn đề quyền và lỗi 500 khi đọc mùa vụ khác ở trên, đây là 10 kiểm tra HTTP không đạt. Các endpoint thiếu không đồng nghĩa phải thêm bảng mới: trước tiên cần thống nhất API contract và xác định service chịu trách nhiệm.

### P1 — Thanh toán và đồng bộ sự kiện chưa hoàn thiện

**Qua mã nguồn:** PaymentService còn cấu hình MOMO sandbox, callback sang cổng 8081 và redirect tới `/payment-success` chưa có page trong web đang chạy. Chưa kiểm chứng payment callback gắn bền vững với đơn, chữ ký và idempotency; không thể coi thanh toán đã sẵn sàng.

OrderService bắt lỗi phát RabbitMQ rồi tiếp tục trả thành công; chưa thấy outbox để đảm bảo đơn đã lưu thì sự kiện sẽ được gửi lại. Listener shipping còn phần xử lý cache TODO. Cần outbox/retry/DLQ, chống xử lý lặp và khả năng đối soát trạng thái giữa các service.

Nguồn: `services/trading-order-service/.../service/PaymentService.java`, `.../service/OrderService.java`, `services/shipping-manager-service/.../listener/OrderResponseListener.java` (tìm listener theo sự kiện response).

### P2 — Test và cấu hình phát triển còn thiếu

| Backend | Test khác nhau | Đạt | Lỗi khởi tạo context |
| --- | ---: | ---: | ---: |
| Auth | 1 | 0 | 1 |
| Admin | 4 | 3 | 1 |
| Blockchain | 21 | 20 | 1 |
| Farm | 14 | 13 | 1 |
| Shipping | 1 | 1 | 0 |
| Trading | 24 | 23 | 1 |
| Image | 0 | 0 | 0; chưa có test |
| Tổng | 65 | 60 | 5 |

Auth/blockchain thiếu cấu hình datasource khi chạy test; admin/trading không kết nối được database localhost của cấu hình test. Test context farm đặt sai package (`com.example...` so với application `com.bicap...`) nên không tìm thấy `@SpringBootConfiguration`. Một số application.yml đặt datasource/JPA/RabbitMQ dưới `server` thay vì `spring`; biến Compose che được lỗi khi chạy Docker. Wrapper Windows của image service bị lỗi, test phase chạy được khi dùng wrapper farm dự phòng nhưng không có test.

Cần profile kiểm thử tách biệt với database thật, kiểm thử tích hợp database/message broker, CI và migration có phiên bản. Bổ sung E2E trình duyệt theo vai trò, test cạnh tranh tồn kho, lỗi broker, xác thực blockchain và callback thanh toán. Cần đồng bộ tài liệu kiến trúc mục tiêu với bộ MySQL/Kong đang chạy trước khi nghiệm thu.

## Thứ tự triển khai tiếp theo

1. Bảo vệ API nội bộ và kiểm tra chủ sở hữu trên mọi dữ liệu farm/đơn hàng.
2. Sửa luồng đơn hàng, giữ tồn kho và kết nối shipping; chạy E2E mua–xác nhận–giao hàng.
3. Thay mô phỏng blockchain/truy xuất bằng giao dịch thật và bằng chứng receipt.
4. Hoàn thiện thanh toán, sự kiện, notification/IoT/báo cáo theo phạm vi sản phẩm cần dùng.
5. Chuẩn hóa cấu hình, test, migration, CI; đánh giá AI trên danh mục lớn và nhiều cách diễn đạt.

## Chạy lại audit

Từ root trên Windows, cần Docker đang chạy, Java phù hợp và Maven dependencies có sẵn:

```powershell
node scripts/audit-java.mjs
node scripts/audit-http.mjs
node scripts/check-shopping-ai.mjs
```

Hai script audit trả exit code 1 khi phát hiện kiểm tra không đạt. Script HTTP dùng các ID farm/mùa vụ và JWT theo dữ liệu hiện có trên máy này; cần cập nhật fixture nếu chuyển sang database khác. Các POST của audit là dữ liệu không hợp lệ hoặc bị trùng, phải bị từ chối trước ghi dữ liệu; không dùng chúng như bộ tạo dữ liệu demo. Khi các quy tắc tạo sản phẩm thay đổi, cần xem lại các kiểm tra này trước khi chạy trên dữ liệu khác.
