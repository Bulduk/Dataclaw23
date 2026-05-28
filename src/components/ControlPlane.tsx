import { Activity, Lock, Unlock, Zap, Terminal, Server, Cpu, Clock, ShieldCheck, Box } from "lucide-react";
import { GlassCard, Badge } from "./ui";

export function ControlPlane({ auditData }: { auditData?: any }) {
  return (
    <div className="p-4 md:p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-mono text-nexus-text flex items-center gap-2">
            <Terminal className="w-6 h-6 text-nexus-accent" />
            POULS COMMAND CENTER
          </h2>
          <p className="text-sm text-nexus-text/60 mt-1">Multi-Agent Supervisor & Rust Execution Governor</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success" className="animate-pulse">WEBSOCKET: LIVE</Badge>
          <Badge variant="neutral">DOCKER: 5/5</Badge>
          <Badge variant="warning">BINANCE: CONNECTED</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard>
          <h3 className="font-mono text-sm border-b border-nexus-border pb-2 mb-4 flex items-center gap-2 text-gray-400">
            <Cpu size={14} className="text-blue-500" /> GO ORCHESTRATOR
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-nexus-bg border border-nexus-border rounded px-3 py-2 flex flex-col items-center">
               <span className="text-[10px] text-gray-500 uppercase tracking-widest">Active Channels</span>
               <span className="text-lg font-bold text-nexus-text">14</span>
            </div>
            <div className="bg-nexus-bg border border-nexus-border rounded px-3 py-2 flex flex-col items-center">
               <span className="text-[10px] text-gray-500 uppercase tracking-widest">Goroutines</span>
               <span className="text-lg font-bold text-nexus-text">8,401</span>
            </div>
          </div>
          <div className="space-y-2">
             <div className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 font-mono">[GO-SYNC] CrewAI dispatch loop initialized</div>
             <div className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 font-mono">[GO-ROUTINE] Waiting on Python AI intent struct</div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-mono text-sm border-b border-nexus-border pb-2 mb-4 flex items-center gap-2 text-gray-400">
            <Zap size={14} className="text-orange-500" /> RUST EXECUTION CORE
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
             <div className="bg-nexus-bg border border-nexus-border rounded px-3 py-2 flex flex-col items-center">
               <span className="text-[10px] text-gray-500 uppercase tracking-widest">Latency avg</span>
               <span className="text-lg font-bold text-nexus-text">0.4ms</span>
            </div>
            <div className="bg-nexus-bg border border-nexus-border rounded px-3 py-2 flex flex-col items-center">
               <span className="text-[10px] text-gray-500 uppercase tracking-widest">Mem Safety</span>
               <span className="text-lg font-bold text-emerald-500">100%</span>
            </div>
          </div>
          <div className="space-y-2">
             <div className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-1 rounded border border-orange-500/20 font-mono">[RUST-TOKIO] Bound to 0.0.0.0:8080 (Release)</div>
             <div className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-1 rounded border border-orange-500/20 font-mono">[RUST-CORE] Hummingbot schema validated</div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard>
          <h3 className="font-mono text-sm border-b border-nexus-border pb-2 mb-3">EXECUTION MODE</h3>
          <div className="grid grid-cols-2 gap-2">
            {["PAPER", "SEMI", "AUTO_CONFIRM", "FULL_AUTO"].map((mode, i) => (
              <button
                key={mode}
                className={`py-2 px-3 rounded-md font-mono text-[10px] tracking-wide font-bold border transition-colors ${
                  i === 1
                    ? "bg-nexus-accent/10 border-nexus-accent text-nexus-accent shadow-[0_0_10px_rgba(var(--nexus-accent),0.2)]"
                    : "border-nexus-border bg-nexus-bg/50 text-gray-900 dark:text-white/50 hover:border-white/30"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 uppercase">
                  {i === 3 ? <Lock className="w-3 h-3" /> : null}
                  {mode}
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-nexus-text/50 mt-3 font-mono">
            CURRENT: SEMI-AUTONOMOUS (Approval required by Admin)
          </p>
        </GlassCard>

        <GlassCard>
          <h3 className="font-mono text-sm border-b border-nexus-border pb-2 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> POLICY GUARD</span>
            <Badge variant="success">IN SYNC</Badge>
          </h3>
          <ul className="space-y-2 text-xs font-mono">
            <li className="flex justify-between border-b border-nexus-border/50 pb-1">
              <span className="text-nexus-text/70">Kill-Switch Circuit</span>
              <span className="text-emerald-500 font-bold">ARMED</span>
            </li>
            <li className="flex justify-between border-b border-nexus-border/50 pb-1">
              <span className="text-nexus-text/70">Max Position (DB)</span>
              <span className="text-nexus-text">$250.00</span>
            </li>
            <li className="flex justify-between">
              <span className="text-nexus-text/70">Daily Drawdown Status</span>
              <span className="text-emerald-400">0.00% &lt; 15%</span>
            </li>
          </ul>
        </GlassCard>
      </div>

      <GlassCard className="h-64 flex flex-col mt-4">
        <h3 className="font-mono text-sm border-b border-nexus-border pb-2 mb-3">SUPERVISOR TERMINAL (Golang stdout)</h3>
        <div className="flex-1 overflow-y-auto font-mono text-[10px] sm:text-xs space-y-2 mb-4 custom-scrollbar">
          <div className="text-nexus-text/50">[10:41:00] System initialized. POULS Command Center active.</div>
          <div className="text-nexus-text/50">[10:41:05] Loaded 4 swarm agents: Mirofish (Go), Betafish (Go), Onyx (Py), OpenClaw (Rust).</div>
          <div className="text-nexus-text/50">[10:41:10] Database PolicyGuard enforced: constraints verified in Postgres (Supabase).</div>
          <div className="text-nexus-accent">[10:42:30] MAJORITY consensus reached on BTC/USDT (LONG). Confidence: 82%</div>
          <div className="text-yellow-400">[10:42:30] Action required: SEMI mode activated. Awaiting admin approval payload.</div>
        </div>
        <div className="relative mt-auto">
          <input
            type="text"
            className="w-full bg-nexus-bg border border-nexus-border rounded-md py-2 px-3 pl-8 text-xs font-mono text-gray-900 dark:text-white placeholder:text-gray-900 dark:text-white/30 focus:outline-none focus:border-nexus-accent transition-colors"
            placeholder="Type supervisor command (/arm, /flatten, /status)..."
          />
          <Activity className="absolute left-2.5 top-2.5 w-3 h-3 text-nexus-text/50" />
        </div>
      </GlassCard>
    </div>
  );
}
