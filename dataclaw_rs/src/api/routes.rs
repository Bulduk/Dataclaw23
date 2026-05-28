use axum::{Json, response::IntoResponse, Extension};
use serde_json::{json, Value};
use chrono::Utc;
use std::sync::Arc;
use crate::agents::swarm::SwarmOrchestrator;

pub async fn health_check() -> impl IntoResponse {
    Json(json!({
        "status": "ok",
        "engine": "rust-hyper-vps",
        "latency_ms": 1,
        "timestamp": Utc::now().to_rfc3339()
    }))
}

pub async fn signal_webhook(
    Extension(swarm): Extension<Arc<SwarmOrchestrator>>,
    Json(payload): Json<Value>
) -> impl IntoResponse {
    tracing::info!("Received Trading Signal: {:?}", payload);
    // Swarm'a yönlendir.
    swarm.process_signal_event(payload.clone()).await;

    Json(json!({
        "status": "ack", 
        "signal_id": uuid::Uuid::new_v4().to_string(),
        "processed_by": "swarm_orchestrator"
    }))
}

pub async fn agent_status(Extension(swarm): Extension<Arc<SwarmOrchestrator>>) -> impl IntoResponse {
    let mut status_map = serde_json::Map::new();
    
    for (id, agent) in &swarm.agents {
        let conf = agent.config();
        
        status_map.insert(id.clone(), json!({
            "status": if conf.enabled { "ACTIVE" } else { "IDLE" },
            "confidence": conf.confidence_threshold,
            "role": conf.role,
            "name": conf.name,
            "model": conf.model,
            "capabilities": conf.capabilities,
            "risk_level": conf.risk_level
        }));
    }

    Json(Value::Object(status_map))
}
