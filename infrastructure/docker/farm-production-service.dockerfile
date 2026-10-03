# Farm Production Service Dockerfile
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy pom.xml và source code
COPY services/farm-production-service/pom.xml .
COPY services/farm-production-service/src ./src
COPY services/image-storage-service/pom.xml ../image-storage-service/pom.xml
COPY services/image-storage-service/src ../image-storage-service/src

RUN apk add --no-cache maven
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
