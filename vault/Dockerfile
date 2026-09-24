# ============================================
# Vault - Dockerfile
# Build em multi-estágio:
#   1. Fase de build: compila e empacota com Maven
#   2. Fase final: imagem leve com apenas o JRE
# ============================================

# ------- FASE 1: BUILD -------
# Usa Maven com JDK 21 para compilar o projeto
FROM maven:3.9-eclipse-temurin-21 AS build

# Copia o código fonte
WORKDIR /workspace
COPY pom.xml .
RUN mvn -q dependency:go-offline

# Copia o código e compila o jar (ignorando testes no build da imagem)
COPY src src
RUN mvn -q package -DskipTests

# ------- FASE FINAL: RUNTIME -------
# Usa apenas o JRE 21 para reduzir o tamanho da imagem
FROM eclipse-temurin:21-jre-alpine

# Cria usuário não-root por segurança
RUN addgroup -S vault && adduser -S vault -G vault

WORKDIR /app

# Copia o jar da fase de build
COPY --from=build /workspace/target/*.jar app.jar

# Expõe a porta da aplicação
EXPOSE 8080

# Usa usuário não-root
USER vault

# Define o entrypoint
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
