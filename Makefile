# BICAP Docker Management Scripts

# ============================================================
# CÁCH SỬ DỤNG
# ============================================================
# Chế độ 1: Chạy TẤT CẢ (khuyến nghị)
#   make up              # Khởi động tất cả (infra + services)
#   make down            # Dừng tất cả
#   make restart         # Restart tất cả
#
# Chế độ 2: Chạy RIÊNG LẺ (cần tạo network trước)
#   make init-network    # Tạo network chung
#   make up-infra        # Chỉ infrastructure
#   make up-services     # Chỉ backend services
#   make down-infra      # Dừng infrastructure
#   make down-services   # Dừng services
#
# Chế độ 3: Development
#   make up-dev          # Full development mode
#   make logs            # Xem logs
#   make logs-svc        # Xem logs services
# ============================================================

.PHONY: up down restart logs clean init-network up-infra up-services down-infra down-services

# Biến môi trường
COMPOSE = docker compose
PROJECT = bicap

# Tạo network chung trước khi chạy riêng lẻ
init-network:
	@echo "Creating bicap-global-net network..."
	@docker network create bicap-global-net 2>/dev/null || echo "Network already exists"
	@echo "Network ready!"

# Khởi động tất cả (khuyến nghị)
up: init-network
	$(COMPOSE) up -d
	@echo ""
	@echo "All services started! Access:"
	@echo "  - Kong Gateway:     http://localhost:8000"
	@echo "  - RabbitMQ:         http://localhost:15672 (root/root)"
	@echo "  - MinIO Console:    http://localhost:9001 (minioadmin/minioadmin)"

# Dừng tất cả
down:
	$(COMPOSE) down

# Restart tất cả
restart: down up

# Khởi động chỉ infrastructure
up-infra: init-network
	$(COMPOSE) -f docker-compose.infra.yml up -d

# Dừng chỉ infrastructure
down-infra:
	$(COMPOSE) -f docker-compose.infra.yml down

# Khởi động chỉ services (cần infra đang chạy!)
up-services:
	$(COMPOSE) -f docker-compose.services.yml up -d

# Dừng chỉ services
down-services:
	$(COMPOSE) -f docker-compose.services.yml down

# Xem tất cả logs
logs:
	$(COMPOSE) logs -f

# Xem logs services
logs-svc:
	$(COMPOSE) -f docker-compose.services.yml logs -f

# Xem logs infrastructure
logs-infra:
	$(COMPOSE) -f docker-compose.infra.yml logs -f

# Development mode
up-dev:
	$(COMPOSE) -f docker-compose.yml -f docker-compose.override.yml up -d

# Clean up (xóa container, image rác)
clean:
	$(COMPOSE) down -v --rmi local
	@docker network rm bicap-global-net 2>/dev/null || true
	@echo "Cleaned up!"

# Kiểm tra trạng thái
status:
	$(COMPOSE) ps

# Kiểm tra trạng thái infrastructure
status-infra:
	$(COMPOSE) -f docker-compose.infra.yml ps

# Kiểm tra trạng thái services
status-services:
	$(COMPOSE) -f docker-compose.services.yml ps

# Rebuild services
build:
	$(COMPOSE) build --no-cache

# Rebuild một service cụ thể
build-svc:
	$(COMPOSE) build --no-cache $(SVC)

# Help
help:
	@echo "BICAP Docker Management"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:' Makefile | sed 's/:.*//' | sed 's/^/  /'
