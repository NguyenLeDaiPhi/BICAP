#!/bin/bash

# ============================================================
# Script thêm web app mới vào docker-compose.apps.yml
# ============================================================

set -e

echo "=============================================="
echo "BICAP - Thêm Web App Mới"
echo "=============================================="
echo ""

# Kiểm tra OS và set delimiter
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    DELIMITER='\\r\\n'
    SCRIPT_DIR=$(dirname "$(readlink -f "$0" 2>/dev/null || echo "$0")")
else
    DELIMITER='\\n'
    SCRIPT_DIR=$(dirname "$(readlink -f "$0" 2>/dev/null || echo "$0")")
fi

# Đọc thông tin từ user
read -p "Tên web app (ví dụ: supplier-web): " APP_NAME
read -p "Port (ví dụ: 3006): " PORT
read -p "JWT Secret (Enter để tự động tạo): " JWT_SECRET

# Tạo JWT Secret nếu không nhập
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
fi

# Validate inputs
if [ -z "$APP_NAME" ] || [ -z "$PORT" ]; then
    echo "Error: Tên app và port là bắt buộc!"
    exit 1
fi

# Kiểm tra web app đã tồn tại chưa
if grep -q "^  ${APP_NAME}:" docker-compose.apps.yml 2>/dev/null; then
    echo "Error: Web app '$APP_NAME' đã tồn tại trong docker-compose.apps.yml!"
    exit 1
fi

# Kiểm tra port đã được sử dụng chưa
if grep -q "\"${PORT}:${PORT}\"" docker-compose.apps.yml 2>/dev/null; then
    echo "Error: Port $PORT đã được sử dụng!"
    exit 1
fi

# Tạo tên container
CONTAINER_NAME="${APP_NAME}"

# Tạo config mới
NEW_CONFIG=$(cat <<EOF

  # ==================== ${APP_NAME^^} ====================
  
  ${APP_NAME}:
    <<: *web-app-base
    build:
      context: ./clients/web-app/${APP_NAME}
    container_name: ${CONTAINER_NAME}
    depends_on:
      - kong-gateway
    environment:
      <<: *web-app-env
      - JWT_SECRET=${JWT_SECRET}
    ports:
      - "${PORT}:${PORT}"
EOF
)

# Thêm vào file (thay thế phần hướng dẫn ở cuối file)
# Xóa phần hướng dẫn cũ và thêm config mới
if [ -f "docker-compose.apps.yml" ]; then
    # Đọc file và loại bỏ phần hướng dẫn ở cuối
    head -n -15 docker-compose.apps.yml > docker-compose.apps.yml.tmp
    echo "$NEW_CONFIG" >> docker-compose.apps.yml.tmp
    mv docker-compose.apps.yml.tmp docker-compose.apps.yml
    
    echo ""
    echo "=============================================="
    echo "✓ Đã thêm '$APP_NAME' vào docker-compose.apps.yml!"
    echo "=============================================="
    echo ""
    echo "Tiếp theo:"
    echo "1. Tạo thư mục: mkdir -p clients/web-app/${APP_NAME}"
    echo "2. Thêm Dockerfile cho ${APP_NAME}"
    echo "3. Chạy: docker compose up -d ${APP_NAME}"
    echo ""
    echo "Hoặc cập nhật Kong gateway config nếu cần route mới."
else
    echo "Error: docker-compose.apps.yml không tìm thấy!"
    exit 1
fi
