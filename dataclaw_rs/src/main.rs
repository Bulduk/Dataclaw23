mod agents;
mod api;
mod db;
mod exchanges;

use axum::{routing::{get, post}, Router, Extension};
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    tracing::info!("🚀 Starting Dataclaw Rust Engine (VPS Edition)...");

    // Çevresel değişkenleri yükle
    dotenvy::dotenv().ok();

    // Agent Swarm & Borsa Yönlendirici (Smart Router) Başlatılıyor...
    let swarm_orchestrator = Arc::new(agents::swarm::SwarmOrchestrator::new());
    let _exchange_router = exchanges::router::SmartExecutionRouter::new();

    // Axum Web Server & API Rotaları
    let app = Router::new()
        .route("/api/health", get(api::routes::health_check))
        .route("/api/signals/webhook", post(api::routes::signal_webhook))
        .route("/api/agents/status", get(api::routes::agent_status))
        .layer(Extension(swarm_orchestrator))
        // CORS ayarları (Frontend'in bağlanabilmesi için)
        .layer(CorsLayer::permissive());


    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    tracing::info!("🌐 Dataclaw Core Engine listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
