# Run from the repository root. All targets use the same Compose project.
COMPOSE = docker compose -f docker-compose.yml
INFRA = auth-db farm-production-db trading-order-db shipping-db blockchain-db image-storage-db bicap-message-queue minio bicap-redis bicap-zookeeper bicap-kafka kong-gateway
BACKEND = auth-service farm-production-service trading-order-service blockchain-adapter-service shipping-manager-service admin-service image-storage-service
WEB = admin-web farm-management-web retailer-web shipping-manager-web guest-web

.PHONY: up down restart up-infra up-services up-apps down-infra down-services down-apps up-dev logs logs-svc logs-infra status status-infra status-services build build-svc check clean help

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

# Compose starts dependencies and creates the shared network automatically.
up-infra:
	$(COMPOSE) up -d $(INFRA)

up-services:
	$(COMPOSE) up -d --build $(BACKEND)

up-apps:
	$(COMPOSE) up -d --build $(WEB)

# Stop selected containers without removing the shared project/network.
down-infra:
	$(COMPOSE) stop $(INFRA)

down-services:
	$(COMPOSE) stop $(BACKEND)

down-apps:
	$(COMPOSE) stop $(WEB)

up-dev: up

logs:
	$(COMPOSE) logs -f

logs-svc:
	$(COMPOSE) logs -f $(BACKEND)

logs-infra:
	$(COMPOSE) logs -f $(INFRA)

status:
	$(COMPOSE) ps

status-infra:
	$(COMPOSE) ps $(INFRA)

status-services:
	$(COMPOSE) ps $(BACKEND)

build:
	$(COMPOSE) build

build-svc:
	$(COMPOSE) build $(SVC)

check:
	$(COMPOSE) config --quiet

# Explicit data cleanup: removes project volumes and locally built images.
clean:
	$(COMPOSE) down -v --rmi local

help:
	@echo "BICAP: up | down | restart | check | status | logs | build"
	@echo "Groups: up-infra | up-services | up-apps | down-infra | down-services | down-apps"
	@echo "Single service: make build-svc SVC=farm-production-service"
	@echo "Windows without make: npm run compose:up"
