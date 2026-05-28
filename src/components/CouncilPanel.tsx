import { Activity, ShieldAlert, Cpu } from "lucide-react";
import { GlassCard, Badge } from "./ui";

export function CouncilPanel() {
  const agents = [
    { id: "mirofish", role: "Technical (sonnet-4.5)", vote: "LONG", conf: 85, reason: "MACD pre-breakout, MA squeeze" },
    { id: "betafish", role: "Arbitrage (haiku-4.5)", vote: "LONG", conf: 76, reason: "OI build-up, funding neutral" },
    { id: "onyx", role: "Research (sonnet-4.5)", vote: "HOLD", conf: 50, reason: "Whale flow mixed" },
    { id: "openclaw", role: "Executor (haiku-4.5)", vote: "LONG", conf: 90, reason: "ATR trailing ideal, TP1 set" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-mono text-nexus-accent mb-1 flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            SWARM COUNCIL
          </h2>
          <p className="text-sm text-nexus-text/60">Multi-agent consensus engine</p>
        </div>
        <Badge variant="success">DECISION: MAJORITY LONG</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map(a => (
          <GlassCard key={a.id} className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
              <Cpu className="w-24 h-24" />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-mono text-lg text-gray-900 dark:text-white font-bold">{a.id.toUpperCase()}</h3>
                <p className="text-xs text-nexus-accent font-mono">{a.role}</p>
              </div>
              <Badge variant={a.vote === "LONG" ? "success" : "neutral"}>{a.vote}</Badge>
            </div>
            
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-nexus-text/50">Confidence</span>
                <span className="text-gray-900 dark:text-white">{a.conf}%</span>
              </div>
              <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${a.vote === "HOLD" ? "bg-white/30" : "bg-nexus-accent"}`} 
                  style={{ width: `${a.conf}%` }} 
                />
              </div>
              <p className="text-nexus-text/70 mt-2 block h-8 border-t border-nexus-border/50 pt-2">
                " {a.reason} "
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="border-nexus-accent/50 bg-nexus-accent/5">
        <h3 className="font-mono text-sm mb-3 flex items-center gap-2 text-nexus-accent">
          <Activity className="w-4 h-4" />
          CONSENSUS AGGREGATION
        </h3>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-32 h-32 rounded-full border-4 border-nexus-border flex items-center justify-center relative">
            <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 -rotate-90">
              <circle cx="50" cy="50" r="46" fill="transparent" stroke="rgba(0,255,178,0.1)" strokeWidth="8" />
              <circle cx="50" cy="50" r="46" fill="transparent" stroke="#00FFB2" strokeWidth="8" strokeDasharray="289" strokeDashoffset={289 * (1 - 0.75)} className="transition-all duration-1000" />
            </svg>
            <div className="text-center font-mono">
              <div className="text-2xl text-gray-900 dark:text-white font-bold">75%</div>
              <div className="text-[10px] text-nexus-accent">AGREEMENT</div>
            </div>
          </div>
          <div className="flex-1 space-y-3 font-mono text-xs w-full">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-nexus-text/60">Asset</span>
              <span className="text-gray-900 dark:text-white font-bold">BTC/USDT</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-nexus-text/60">Direction</span>
              <span className="text-nexus-accent font-bold">LONG</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-nexus-text/60">Risk Override</span>
              <span className="text-nexus-text">None</span>
            </div>
            <button className="w-full mt-2 py-2 bg-nexus-accent text-black font-bold text-sm tracking-widest rounded transition-opacity hover:opacity-90">
              APPROVE TRADE (SEMI)
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
