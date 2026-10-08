# Trợ lý AI tìm sản phẩm

Trợ lý dùng **Ollama + qwen3:4b thật**, đang có sẵn trên máy Windows này. Mô hình phân tích yêu cầu tiếng Việt thành bộ lọc; backend áp dụng bộ lọc vào danh mục thật trong database. Không tạo sản phẩm, giá hay chứng nhận bằng AI.

## Sử dụng

Mở guest tại <http://localhost:3010> hoặc retailer tại <http://localhost:3000>, nhấn **Hỏi AI tìm sản phẩm** ở góc dưới bên phải.

Ví dụ: `Tôi cần 10 kg gạo ST25, tổng ngân sách tối đa 200 nghìn`. Có thể hỏi tiếp `Chỉ còn 100 nghìn thôi` để thay ngân sách mà giữ loại hàng và số lượng.

Kết quả chỉ gồm sản phẩm **APPROVED**, còn hàng, đáp ứng loại hàng, giá, số lượng và ngân sách. Thẻ sản phẩm lấy ID, ảnh, giá và tồn kho từ database. Nút mua mở sản phẩm ở marketplace retailer; khách vẫn đăng nhập và đặt hàng theo quy trình hiện có.

## Chạy và cấu hình

Ollama cần chạy trên máy host. Kiểm tra `http://localhost:11434/api/tags` có model `qwen3:4b`. Trên máy này model đã được cài; không cần tải lại. Nếu Ollama chưa chạy, mở ứng dụng Ollama hoặc chạy `ollama serve` trong terminal.

Trong Docker Compose, trading-order-service dùng:

```dotenv
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=qwen3:4b
OLLAMA_KEEP_ALIVE=30m
OLLAMA_WARMUP_ENABLED=true
```

Các biến có thể đặt trong `.env` ở thư mục gốc. Khi đổi, chạy `docker compose up -d --no-deps trading-order-service`. Khi chạy Java trực tiếp ngoài Docker, URL mặc định là `http://localhost:11434`. Với máy chủ khác, đặt URL mà container có thể truy cập. Frontend gọi Kong qua `NEXT_PUBLIC_API_URL`; không cần API key.

Backend chuẩn bị mô hình và prompt ở nền khi khởi động, giữ mô hình trong bộ nhớ 30 phút sau mỗi yêu cầu bằng `keep_alive`. Có thể tắt bước chuẩn bị bằng `OLLAMA_WARMUP_ENABLED=false`. Thời gian đọc phản hồi AI giới hạn 45 giây; giao diện ngừng chờ sau 55 giây, hiển thị lỗi và cho phép mở danh mục. Nút **Dừng chờ** hủy chờ trên trình duyệt; backend có thể vẫn đang xử lý đến khi hoàn tất hoặc hết hạn. Log `Shopping AI completed` ghi thời gian tổng, nạp mô hình và xử lý prompt để chẩn đoán, không ghi thêm nội dung khách hỏi.

Tích hợp dùng [Chat API chính thức của Ollama](https://docs.ollama.com/api/chat) và [JSON schema cho structured outputs](https://docs.ollama.com/capabilities/structured-outputs). Mô hình chỉ nhận yêu cầu và các tin nhắn trước của khách; không nhận thông tin tài khoản, đơn hàng hay toàn bộ database.

## API

`POST http://localhost:8000/api/assistant/search` — không yêu cầu đăng nhập vì chỉ đọc danh mục công khai.

```json
{
  "message": "Tìm gạo ST25 dưới 20 nghìn/kg",
  "history": []
}
```

Phản hồi gồm `reply`, `products`, `filters`, `totalMatches`. Lịch sử tối đa 8 tin nhắn, chỉ nhận role `user` hoặc `assistant`; mỗi nội dung tối đa 1.200 ký tự. Tin nhắn của assistant không được đưa vào prompt làm chỉ dẫn cho mô hình.

Kong giới hạn 12 yêu cầu/phút theo client và payload 20 KB. Backend xử lý một yêu cầu AI cùng lúc để phù hợp model chạy tại máy này. Yêu cầu đồng thời bị trả `429`; mô hình không kết nối được, quá thời gian hoặc trả bộ lọc không hợp lệ bị trả `503`. Giao diện hiển thị lỗi và liên kết tìm sản phẩm thông thường.

## Giới hạn hiện tại

- Hỗ trợ tên, loại, giống sản phẩm, loại trừ, khoảng giá, số lượng, tồn kho, tổng ngân sách và sắp xếp. Có chuyển đổi g/kg/tấn; chai/thùng phải khớp đơn vị của sản phẩm, chưa có quy cách đóng gói để quy đổi.
- Ngân sách chưa gồm phí giao hàng; chưa kết nối tính phí hay thanh toán.
- Chứng nhận hữu cơ, xuất xứ địa lý, độ an toàn cho bệnh lý, khẩu vị và cam kết giao hàng chưa có dữ liệu xác thực. Trợ lý nói rõ chưa xác nhận được và đề nghị đổi tiêu chí.
- Tìm bằng bộ lọc và các từ đồng nghĩa phổ biến; chưa có tìm kiếm vector hoặc bộ đánh giá trên danh mục lớn. Mô hình có thể hiểu sai cách diễn đạt mới; người mua cần xem lại sản phẩm và điều kiện đã được hiểu trên thẻ kết quả.
- Chưa lưu hội thoại lâu dài. Cần Ollama hoạt động để sử dụng AI. Lần gọi khi model đã bị dỡ khỏi bộ nhớ vẫn có thể chậm hơn; bước chuẩn bị nền và `keep_alive` giảm số lần phải nạp lại, không đảm bảo tốc độ cố định trên mọi máy.

## Kiểm tra lại

Từ thư mục gốc, khi Docker và Ollama đang chạy:

```powershell
node scripts/check-shopping-ai.mjs
```

Script kiểm tra model thật qua Kong với 6 tình huống: ngân sách tổng, giá/kg, đổi ngân sách trong hội thoại, chứng nhận chưa xác minh, sản phẩm không có và yêu cầu vượt tồn kho. Kết quả tại `reports/full-audit-2026-10-04/ai-live-checks.json`. Các tình huống dữ liệu cụ thể dùng sản phẩm ST25 hiện có trên máy này.

Các test Java nằm trong `ShoppingAssistantTests`; kiểm tra component React dùng `scripts/check-shopping-ui.cjs` trong môi trường có TypeScript, React và lucide-react. Đây là kiểm tra logic component, chưa phải kiểm thử thao tác trình duyệt thực tế.
