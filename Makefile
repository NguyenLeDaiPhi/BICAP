# BICAP Makefile
# Quản lý Docker Compose một cách dễ dàng

.PHONY: help up up-infra up-services up-apps up-dev down ps logs logs-infra logs-services logs-apps clean rebuild clean-all add-web-app

# Colors
YELLOW := $(shell tput bold 2>/dev/null || echo "")
RESET := $(shell tput sgr0 2>/dev/null || echo "")

# ==================== HELP ====================
help: ## Hiển thị hướng dẫn sử dụng
	@echo "$(YELLOW)========================================$(RESET)"
	@echo "$(YELLOW)BICAP Docker Management$(RESET)"
	@echo "$(YELLOW)========================================$(RESET)"
	@echo ""
	@echo "Lệnh có sẵn:"
	@echo ""
	@echo "  $(YELLOW)Khởi động:$(RESET)"
	@echo "    make up              - Khởi động tất cả services"
	@echo "    make up-infra        - Chỉ khởi động infrastructure (DB, MQ, MinIO, Kong)"
	@echo "    make up-services     - Khởi động backend services"
	@echo "    make up-apps         - Khởi động web apps"
	@echo ""
	@echo "  $(YELLOW)Dừng services:$(RESET)"
	@echo "    make down            - Dừng tất cả services"
	@echo "    make down-infra      - Dừng infrastructure"
	@echo "    make down-services   - Dừng backend services"
	@echo "    make down-apps       - Dừng web apps"
	@echo ""
	@echo "  $(YELLOW)Quản lý:$(RESET)"
	@echo "    make ps              - Xem trạng thái containers"
	@echo "    make logs            - Xem logs tất cả"
	@echo "    make logs-<name>     - Xem logs service cụ thể"
	@echo "    make clean           - Dừng và xóa containers"
	@echo "    make rebuild         - Rebuild tất cả images"
	@echo "    make clean-all       - Dừng, xóa containers và volumes"
	@echo ""
	@echo "  $(YELLOW)Tiện ích:$(RESET)"
	@echo "    make add-web-app     - Thêm web app mới"
	@echo ""
	@echo "$(YELLOW)========================================$(RESET)"

# ==================== UP (Start) ====================
up: ## Khởi động tất cả services
	docker compose up -d
	@echo ""
	@echo "$(YELLOW)✓ All services started!$(RESET)"
	@echo "Truy cập:"
	@echo "  - Kong Gateway:     http://localhost:8000"
	@echo "  - Retailer Web:     http://localhost:3000"
	@echo "  - Admin Web:        http://localhost:3001"
	@echo "  - Farm Management:  http://localhost:3002"
	@echo "  - Shipping Manager:  http://localhost:3003"
	@echo "  - Guest Web:        http://localhost:3005"

up-infra: ## Khởi động infrastructure (DBs, MQ, MinIO, Kong)
	docker compose -f docker-compose.yml -f docker-compose.infra.yml up -d
	@echo "$(YELLOW)✓ Infrastructure started!$(RESET)"
	@echo "  - MySQL Databases:  3307-3312"
	@echo "  - RabbitMQ:         http://localhost:15672"
	@echo "  - MinIO:           http://localhost:9000"
	@echo "  - Kong Gateway:     http://localhost:8000"

up-services: ## Khởi động backend services
	docker compose -f docker-compose.yml -f docker-compose.infra.yml -f docker-compose.services.yml up -d
	@echo "$(YELLOW)✓ Backend services started!$(RESET)"
	@echo "  - Auth Service:        http://localhost:8088"
	@echo "  - Farm Service:        http://localhost:8081"
	@echo "  - Trading Service:     http://localhost:8082"
	@echo "  - Shipping Service:    http://localhost:8083"
	@echo "  - Blockchain Service:  http://localhost:8084"
	@echo "  - Admin Service:       http://localhost:8085"
	@echo "  - Image Storage:       http://localhost:8086"

up-apps: ## Khởi động web apps
	docker compose -f docker-compose.yml -f docker-compose.apps.yml up -d
	@echo "$(YELLOW)✓ Web apps started!$(RESET)"

up-dev: up-infra up-services up-apps ## Khởi động đầy đủ cho development

# ==================== DOWN (Stop) ====================
down: ## Dừng tất cả services
	docker compose down
	@echo "$(YELLOW)✓ All services stopped!$(RESET)"

down-infra: ## Dừng infrastructure
	docker compose -f docker-compose.yml -f docker-compose.infra.yml down

down-services: ## Dừng backend services
	docker compose -f docker-compose.yml -f docker-compose.services.yml down

down-apps: ## Dừng web apps
	docker compose -f docker-compose.yml -f docker-compose.apps.yml down

# ==================== PS ====================
ps: ## Xem trạng thái containers
	docker compose ps

# ==================== LOGS ====================
logs: ## Xem logs tất cả services
	docker compose logs -f

logs-infra: ## Xem logs infrastructure
	docker compose -f docker-compose.infra.yml logs -f

logs-services: ## Xem logs backend services
	docker compose -f docker-compose.services.yml logs -f

logs-apps: ## Xem logs web apps
	docker compose -f docker-compose.apps.yml logs -f

# Logs cho từng service cụ thể
logs-auth: ## Xem logs auth-service
	docker compose logs -f auth-service

logs-farm: ## Xem logs farm-production-service
	docker compose logs -f farm-production-service

logs-trading: ## Xem logs trading-order-service
	docker compose logs -f trading-order-service

logs-shipping: ## Xem logs shipping-manager-service
	docker compose logs -f shipping-manager-service

logs-blockchain: ## Xem logs blockchain-adapter-service
	docker compose logs -f blockchain-adapter-service

logs-kong: ## Xem logs Kong Gateway
	docker compose logs -f kong-gateway

logs-rabbitmq: ## Xem logs RabbitMQ
	docker compose logs -f bicap-message-queue

# ==================== CLEAN ====================
clean: ## Dừng và xóa containers
	docker compose down
	@echo "$(YELLOW)✓ Containers cleaned!$(RESET)"

rebuild: ## Rebuild tất cả images
	docker compose build --no-cache
	@echo "$(YELLOW)✓ Images rebuilt!$(RESET)"

rebuild-service:
	@read -p "Tên service cần rebuild (ví dụ: auth-service): " service; \
	docker compose build --no-cache $$service
	@echo "$(YELLOW)✓ $$service rebuilt!$(RESET)"

clean-all: ## Dừng, xóa containers và volumes
	docker compose down -v
	@echo "$(YELLOW)✓ Containers and volumes cleaned!$(RESET)"

# ==================== ADD WEB APP ====================
add-web-app: ## Thêm web app mới vào docker-compose.apps.yml
	@./scripts/add-web-app.sh

# ==================== DEV TOOLS ====================
shell: ## Truy cập shell của một container
	@read -p "Container name: " container; \
	docker exec -it $$container sh

db-shell: ## Truy cập MySQL shell
	@read -p "Database (auth-db, farm-production-db, etc.): " db; \
	docker exec -it $$db mysql -uroot -proot

rabbitmq-shell: ## Truy cập RabbitMQ CLI
	docker exec -it bicap-message-queue rabbitmqctl bash

# ==================== STATUS ====================
status: ## Kiểm tra health của tất cả services
	@echo "$(YELLOW)Checking service health...$(RESET)"
	@echo ""
	@docker ps --filter "name=auth-db" --filter "name=farm-production-db" --filter "name=trading-order-db" --filter "name=shipping-db" --filter "name=blockchain-db" --filter "name=image-storage-db" --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo "No containers running"
	@echo ""
	@echo "$(YELLOW)Services:$(RESET)"
	@docker ps --filter "name=auth-service" --filter "name=farm-production-service" --filter "name=trading-order-service" --filter "name=shipping-manager-service" --filter "name=blockchain-adapter-service" --filter "name=admin-service" --filter "name=image-storage-service" --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo "No containers running"
	@echo ""
	@echo "$(YELLOW)Web Apps:$(RESET)"
	@docker ps --filter "name=guest-web" --filter "name=retailer-web" --filter "name=admin-web" --filter "name=farm-management-web" --filter "name=shipping-manager-web" --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo "No containers running"
