import { Cpu, Settings, Code, Activity, Shield } from "lucide-react";
import { GlassCard, Badge } from "./ui";

export function AgentsPanel() {
  const agents = [
    { id: "mirofish", role: "Technical", model: "claude-3-5-sonnet-20241022", status: "ACTIVE", task: "VSA, MA squeeze, MACD breakout", load: 45 },
    { id: "betafish", role: "Arbitrage", model: "claude-3-5-haiku-20241022", status: "ACTIVE", task: "Funding rate, liquidation maps", load: 22 },
    { id: "onyx", role: "Research", model: "claude-3-5-sonnet-20241022", status: "ACTIVE", task: "Whale flow, Polymarket sentiment", load: 68 },
    { id: "openclaw", role: "Executor", model: "claude-3-5-haiku-20241022", status: "ACTIVE", task: "ATR trailing, TP levels", load: 15 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-mono text-nexus-accent mb-1 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            AGENT CONFIGURATION
          </h2>
          <p className="text-sm text-nexus-text/60">Per-agent model assignment and load balancing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent, i) => (
          <GlassCard key={i} className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg">
                  <Cpu className="w-5 h-5 text-nexus-accent" />
                </div>
                <div>
                  <h3 className="font-mono text-gray-900 dark:text-white font-bold text-lg uppercase">{agent.id}</h3>
                  <p className="text-xs text-nexus-text/60 font-mono">{agent.role}</p>
                </div>
              </div>
              <Badge variant="success">{agent.status}</Badge>
            </div>

            <div className="space-y-3 font-mono text-xs flex-1">
              <div>
                <div className="text-nexus-text/50 mb-1 flex items-center gap-1">
                  <Code className="w-3 h-3" /> Assigned Model
                </div>
                <div className="p-2 bg-black/40 rounded border border-white/5 text-nexus-accent">
                  {agent.model}
                </div>
              </div>
              <div>
                <div className="text-nexus-text/50 mb-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Core Directives
                </div>
                <div className="p-2 bg-black/40 rounded border border-white/5 text-gray-900 dark:text-white/80">
                  {agent.task}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-nexus-border/50">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-nexus-text/50 flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Node Load
                </span>
                <span className="text-gray-900 dark:text-white">{agent.load}%</span>
              </div>
              <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${agent.load > 60 ? 'bg-yellow-400' : 'bg-nexus-accent'}`} 
                  style={{ width: `${agent.load}%` }} 
                />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
