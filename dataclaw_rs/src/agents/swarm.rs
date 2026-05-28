use async_trait::async_trait;
use serde_json::Value;
use std::collections::HashMap;
use crate::agents::config::AgentConfig;
use crate::agents::executor::CoreAgent;

#[async_trait]
pub trait Agent: Send + Sync {
    async fn evaluate_signal(&self, signal: &Value) -> Result<f64, String>;
    fn name(&self) -> &str;
    fn config(&self) -> &AgentConfig;
}

pub struct SwarmOrchestrator {
    // Burada Rust kanal (mpsc) veya Redis PubSub entegrasyonu olacak
    pub agents: HashMap<String, Box<dyn Agent>>,
}

impl SwarmOrchestrator {
    pub fn new() -> Self {
        tracing::info!("Swarm Orchestrator initialized. Core agents loading...");
        
        let mut agents_map: HashMap<String, Box<dyn Agent>> = HashMap::new();
        let default_configs = AgentConfig::default_agents();
        
        for config in default_configs {
            if config.enabled {
                if config.confidence_threshold >= 70.0 {
                    tracing::info!("Registering Agent [{}]: {} (Confidence: {}%)", config.role, config.name, config.confidence_threshold);
                    let agent = CoreAgent::new(config.clone());
                    agents_map.insert(config.agent_id.clone(), Box::new(agent));
                } else {
                    tracing::warn!("PolicyGuard: Agent {} rejected (Confidence {}% < 70%)", config.name, config.confidence_threshold);
                }
            }
        }
        
        Self { agents: agents_map }
    }

    pub async fn process_signal_event(&self, signal_data: Value) {
        tracing::info!("Swarm analyzing signal: {:?}", signal_data);
        
        for (id, agent) in &self.agents {
            tracing::info!("Routing to {}: {}", agent.name(), id);
            let _ = agent.evaluate_signal(&signal_data).await;
        }
    }
}
