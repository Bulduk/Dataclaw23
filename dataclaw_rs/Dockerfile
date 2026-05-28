# --- Build Phase ---
FROM rust:1.75-bookworm AS builder
WORKDIR /usr/src/app

COPY Cargo.toml ./
# Bağımlılıkları derlemek için dummy src
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -rf src

# Gerçek kodu kopyala ve derle
COPY src ./src
# Son binary'yi oluştur
RUN touch src/main.rs && cargo build --release

# --- Runtime Phase ---
FROM debian:bookworm-slim

# SSL sertifikaları için gerekli araçları yükle (Reqwest / Borsa bağlantıları için)
RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /usr/src/app/target/release/dataclaw_rs /app/dataclaw_rs

EXPOSE 8000

# Container başlatıldığında Rust sunucusunu çalıştır
CMD ["./dataclaw_rs"]
