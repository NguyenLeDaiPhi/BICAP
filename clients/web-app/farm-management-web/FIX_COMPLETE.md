# ✅ Đã sửa: Lấy thông tin Farm theo userId

## 🔧 Thay đổi

### 1. **Java Auth Service** - Thêm userId vào JWT token
File: `services/auth-service/src/main/java/com/bicap/auth/config/JwtUtils.java`

```java
// Đã thêm userId vào token
.claim("userId", userPrinciple.getId())
```

### 2. **Node.js farmController** - Dùng userId từ token
```javascript
const ownerId = req.user.userId || req.user.id;
```

### 3. **Environment Variable** - Config API URL
```env
FARM_API_URL=http://farm-production-service:8081/api/farm-features
```

## 🎯 Luồng hoạt động

```
1. User login → Auth Service tạo JWT token
   Token chứa: {
     sub: "username",
     userId: 1,          ← MỚI THÊM
     email: "user@email.com",
     roles: "ROLE_FARMMANAGER"
   }
   ↓
2. User vào /farm-info → farmController.getFarmInfoPage()
   ↓
3. Lấy ownerId = req.user.userId (từ token)
   ↓
4. Gọi API: GET /farm-features/owner/{ownerId}
   ↓
5. Hiển thị dữ liệu farm hoặc thông báo lỗi
```

## 🚀 Cách test

### Bước 1: Rebuild Auth Service (để áp dụng JWT mới)
```bash
cd services/auth-service
mvn clean package -DskipTests
cd ../..
docker-compose build auth-service
docker-compose up -d auth-service
```

### Bước 2: Restart Farm Management Web
```bash
cd clients/web-app/farm-management-web
npm start
```

### Bước 3: Test flow
1. **Logout** (nếu đang login) để xóa token cũ
2. **Login lại** → Tạo token MỚI có userId
3. Vào `/debug/user-info` → Xem token có userId chưa
4. Vào `/farm-info` → Kiểm tra có lấy được dữ liệu không

### Bước 4: Debug
```bash
# Terminal logs sẽ hiển thị:
Debug User Token: {
  sub: 'username',
  userId: 1,
  email: 'user@email.com',
  roles: 'ROLE_FARMMANAGER'
}
Owner ID used for API call: 1
✓ Lấy thông tin farm thành công: Tên Farm
```

## 🔍 Debug Checklist

### Token không có userId?
**Nguyên nhân**: Token cũ chưa có userId

**Giải pháp**:
1. Logout
2. Xóa cookie auth_token (F12 → Application → Cookies)
3. Login lại
4. Check `/debug/user-info` xem có userId không

### API trả về 404?
**Nguyên nhân**: Database chưa có farm với ownerId này

**Giải pháp**: Tạo farm mới cho user
```bash
curl -X POST "http://localhost:8081/api/farm-features" \
  -H "Content-Type: application/json" \
  -d '{
    "ownerId": 1,
    "farmName": "Trang trại của tôi",
    "address": "Hà Nội",
    "areaSize": 10.5,
    "email": "farm@example.com",
    "hotline": "0123456789"
  }'
```

### CORS Error?
**Nguyên nhân**: Kong Gateway chưa config CORS

**Giải pháp**: Thêm CORS plugin vào kong.yml

### Connection refused?
**Nguyên nhân**: Service chưa chạy hoặc sai URL

**Giải pháp**:
```bash
# Kiểm tra services
docker ps | grep farm-production-service

# Restart nếu cần
docker-compose restart farm-production-service
```

## 📊 Expected Output

### Thành công:
```
Debug User Token: { sub: 'farmmanager', userId: 1, email: 'fm@example.com', roles: 'ROLE_FARMMANAGER' }
Owner ID used for API call: 1
✓ Lấy thông tin farm thành công: Nông trại ABC
```

### Chưa có farm:
```
Debug User Token: { sub: 'farmmanager', userId: 1, email: 'fm@example.com', roles: 'ROLE_FARMMANAGER' }
Owner ID used for API call: 1
✗ Lỗi lấy thông tin farm: Request failed with status code 404
API Error Status: 404
API Error Data: { message: 'Chưa tìm thấy trang trại nào cho tài khoản này' }
```

## 💡 Tips

1. **Luôn logout/login lại** sau khi sửa JWT generator
2. **Check `/debug/user-info`** để verify token structure
3. **Xem terminal logs** để debug flow
4. **Dùng test-api.bat** để test API trước khi test UI

## 🎉 Kết quả

Sau khi sửa xong và rebuild:
- ✅ JWT token có userId
- ✅ farmController lấy userId từ token
- ✅ API được gọi đúng với ownerId
- ✅ Hiển thị farm info dựa trên user đang login
