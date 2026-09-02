# BICAP Database Schema Documentation

## Overview

This folder contains database schemas for the BICAP microservices architecture. Each database is isolated per service following the database-per-service pattern.

## Database List

| Database | Service | Port | Tables | Description |
|----------|---------|------|--------|-------------|
| `notification_db` | Notification Service | 4310 | 4 | System notifications and preferences |
| `iot_db` | IoT Service | 4311 | 6 | IoT devices, sensors, and alerts |
| `payment_db` | Payment Service | 4312 | 8 | Payments, refunds, and subscriptions |
| `traceability_db` | Traceability Service | 4313 | 10 | Product traceability and QR codes |
| `user_db` | User Service | 4318 | 8 | User profiles and settings |

## Existing Databases

| Database | Service | Port | Tables | Description |
|----------|---------|------|--------|-------------|
| `auth_db` | Auth Service | 4306 | 5 | User authentication and roles |
| `farm_production_db` | Farm Service | 4307 | 9 | Farm and production data |
| `shipping_db` | Shipping Service | 4308 | 5 | Shipping and logistics |
| `trading_db` | Trading Service | 4309 | 5 | Trading and orders |
| `blockchain_db` | Blockchain Adapter | 4314 | 5 | Blockchain records |
| `admin_db` | Admin Service | 4315 | 6 | Admin management |
| `order_db` | Order Service | 4316 | 5 | Order management |
| `image_storage_db` | Image Storage | 4317 | 1 | Image storage metadata |

## Running Databases

### Run all new databases:
```bash
docker-compose -f docker-compose-databases.yml up -d
```

### Run a specific database:
```bash
docker-compose -f notification-db/docker-compose.yml up -d
```

### Stop all databases:
```bash
docker-compose -f docker-compose-databases.yml down
```

### View logs:
```bash
docker logs bicap-mysql-notification
docker logs bicap-mysql-iot
docker logs bicap-mysql-payment
docker logs bicap-mysql-traceability
```

## Database Connection Strings

### JDBC URLs (for Spring Boot):
```
# Notification Service
jdbc:mysql://localhost:4310/notification_db

# IoT Service
jdbc:mysql://localhost:4311/iot_db

# Payment Service
jdbc:mysql://localhost:4312/payment_db

# Traceability Service
jdbc:mysql://localhost:4313/traceability_db
```

### Default Credentials:
- Username: `root`
- Password: `root`
- Database: See table above

## Schema Details

### user_db (8 tables)
- `user_profiles` - Extended user profile information
- `user_addresses` - User saved addresses for shipping
- `user_activities` - User activity logs for analytics
- `user_sessions` - User login sessions
- `user_devices` - Registered devices for push notifications
- `user_kyc` - KYC (Know Your Customer) information
- `user_privacy_settings` - User privacy and data settings
- `user_relationships` - User relationships with entities

### notification_db (4 tables)
- `notifications` - Main notification storage
- `notification_preferences` - User notification settings
- `notification_templates` - Predefined templates
- `notification_logs` - Audit trail for sent notifications

### iot_db (6 tables)
- `iot_devices` - Registered IoT devices
- `sensor_readings` - Environmental data readings
- `threshold_configs` - Alert threshold configurations
- `iot_alerts` - Generated alerts
- `sensor_statistics` - Aggregated statistics
- `device_commands` - Commands to actuators

### payment_db (8 tables)
- `payments` - Payment transactions
- `payment_transactions` - Detailed transaction logs
- `payment_refunds` - Refund records
- `payment_methods` - Saved payment methods
- `payment_webhooks` - Webhook events
- `payment_reconciliation` - Daily reconciliation
- `service_packages` - Subscription packages
- `package_subscriptions` - Farm subscriptions

### traceability_db (10 tables)
- `trace_codes` - Main traceability codes
- `trace_journeys` - Product journey stages
- `trace_verifications` - Verification records
- `trace_certificates` - Product certificates
- `trace_environmental_data` - IoT summary data
- `trace_shipment_info` - Shipping information
- `trace_farm_info` - Denormalized farm data
- `trace_product_info` - Denormalized product data
- `trace_blockchain_records` - Blockchain verification
- `trace_public_pages` - Cached public pages
- `trace_code_sequences` - Sequence generator

## Best Practices

1. **Database per Service**: Each microservice owns its database
2. **No Cross-DB Foreign Keys**: Use IDs instead of foreign keys across services
3. **Indexes**: All foreign keys and frequently queried columns are indexed
4. **Audit Fields**: created_at and updated_at on all tables
5. **UUID/Code Columns**: Unique business codes for each entity
6. **Soft Deletes**: Consider adding deleted_at for sensitive data

## Backup & Restore

### Backup a database:
```bash
docker exec bicap-mysql-notification mysqldump -uroot -proot notification_db > backup.sql
```

### Restore a database:
```bash
docker exec -i bicap-mysql-notification mysql -uroot -proot notification_db < backup.sql
```

## Troubleshooting

### Connection refused:
- Check if container is running: `docker ps`
- Check logs: `docker logs <container-name>`
- Verify port not in use: `netstat -an | grep <port>`

### Access denied:
- Default credentials may need to be updated
- Check MYSQL_ROOT_PASSWORD in docker-compose

### Data persistence issues:
- Verify volumes are properly configured
- Check volume mounts in docker-compose
