# Use Maven with Java 17
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Set working directory
WORKDIR /app

# Copy pom.xml
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src

# Build application
RUN mvn clean package -DskipTests

# Use lightweight Java image
FROM eclipse-temurin:17-jdk

WORKDIR /app

# Copy generated jar
COPY --from=build /app/target/*.jar app.jar

# Expose backend port
EXPOSE 5005

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]