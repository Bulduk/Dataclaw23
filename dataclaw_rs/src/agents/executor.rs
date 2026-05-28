use async_trait::async_trait;
use serde_json::Value;
use crate::agents::swarm::Agent;
use crate::agents::config::AgentConfig;

pub struct CoreAgent {
    pub config: AgentConfig,
}

impl CoreAgent {
    pub fn new(config: AgentConfig) -> Self {
        Self { config }
    }
}

#[async_trait]
impl Agent for CoreAgent {
    async fn evaluate_signal(&self, signal: &Value) -> Result<f64, String> {
        tracing::info!("[{}] Evaluating signal using model: {}", self.config.name, self.config.model);
        
        // Simulating some processing using the agent's unique capabilities
        if signal.get("action").and_then(|a| a.as_str()) == Some("analyze") {
            tracing::info!("[{}] Applying strategies: {:?}", self.config.name, self.config.capabilities);
        }

        Ok(self.config.confidence_threshold)
    }

    fn name(&self) -> &str {
        &self.config.name
    }
    
    fn config(&self) -> &AgentConfig {
        &self.config
    }
}
