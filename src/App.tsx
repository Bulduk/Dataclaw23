import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { usePersistentStore } from './state/persistentStore';
import { loadSettingsFromCloud, syncSettingsToCloud } from './services/settingsSync';
import { Sidebar } from './components/layout/Sidebar';
import { EnterpriseHeader } from './components/layout/EnterpriseHeader';
import { BottomNav, MobileMenuDrawer } from './components/layout/BottomNav';
import AdminPanel from "./components/AdminPanel";
import PortfolioPanel from "./components/PortfolioPanel";
import { ControlPlane } from "./components/ControlPlane";
import SignalEngine from "./components/SignalEngine";
import QuantDashboard from "./components/QuantDashboard";
import AgentOperatingDesk from "./components/AgentOperatingDesk";
import ExecutionBridge from "./components/ExecutionBridge";
import StreamingDashboard from "./components/StreamingDashboard";
import { NotificationCopilot } from "./components/NotificationCopilot";

// Keep existing audit data for components that expect it
const AUDIT_DATA = {
  version: "4.0.0",
  mode: "SIMULATE",
  modules: {
    ccxt:    { status:"OK",      version:"4.5.50"  },
    anthropic:{ status:"MISSING", install:"pip install anthropic>=0.40" },
    crewai:  { status:"MISSING", install:"pip install crewai>=0.80"    },
    fastapi: { status:"OK",      version:"0.136.1" },
    coremem: { status:"OK",      version:"1.0.0"   },
  },
  market: {
    "BTC/USDT": { price:94331.34, change:-1.96, vol:"21.9B" },
    "ETH/USDT": { price:3468.44,  change:+1.66, vol:"12.1B" },
    "SOL/USDT": { price:179.12,   change:-2.57, vol:"4.3B"  },
    "BNB/USDT": { price:607.71,   change:-0.43, vol:"3.0B"  },
  },
  signals: {
    orderbook:    { symbol:"BTC/USDT", imbalance:+12.4, bias:"BULLISH"   },
    funding:      { symbol:"BTC/USDT", rate:0.00012,    bias:"LONG_HEAVY"},
    arbitrage:    { symbol:"BTC/USDT", spread_pct:0.051,opportunity:true },
    sentiment:    { BTC:74, ETH:62, SOL:55 },
    freqtrade:    { signal:"long", confidence:0.71, strategy:"SampleStrategy" },
    mirofish:     { direction:"LONG", confidence:78, entry:94210, tp:98920, sl:91384, rr:2.19, approval:true },
  },
};

export default function App() {
  const [tab, setTab] = useState("laboratory");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const { mode, activeExchange, killSwitchEngaged, agents, theme } = usePersistentStore();

  useEffect(() => { 
    loadSettingsFromCloud();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    syncSettingsToCloud();
  }, [mode, activeExchange, killSwitchEngaged, agents]);

  return (
    <div className="flex h-screen bg-nexus-bg text-nexus-text font-sans overflow-hidden transition-colors duration-300">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-nexus-border relative z-30">
        <Sidebar currentTab={tab} setTab={setTab} />
      </div>
      
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <EnterpriseHeader audit={AUDIT_DATA} />
        
        <main className="flex-1 overflow-hidden flex flex-col relative pb-16 md:pb-0 pt-4 md:pt-6 px-4 md:px-8">
          
          <div className="relative z-10 flex-1 overflow-hidden flex flex-col max-w-5xl mx-auto w-full">
              <>
                {tab === "laboratory" && <QuantDashboard />}
                {tab === "patrol" && <ControlPlane auditData={AUDIT_DATA} />}
                {tab === "stack" && <StreamingDashboard />}
                {tab === "signals" && <SignalEngine />}
                {tab === "agents" && <AdminPanel forceSection="crewai" onSelectAgent={(id) => setSelectedAgentId(id)} />}
                {tab === "trading" && <AdminPanel forceSection="trading" />}
                {tab === "risk" && <AdminPanel forceSection="risk" />}
                {tab === "bridge" && <ExecutionBridge />}
                {tab === "portfolio" && <PortfolioPanel />}
                {tab === "admin" && <AdminPanel />}
              </>
          </div>
        </main>
      </div>

      {/* Mobile Navigation & Menu */}
      <BottomNav 
        currentTab={tab} 
        setTab={setTab} 
        onMenuClick={() => setIsMenuOpen(true)} 
      />
      <MobileMenuDrawer 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        setTab={setTab} 
      />
      
      {/* Agent Detail Modal (Drawer) */}
      <Drawer.Root open={!!selectedAgentId} onOpenChange={(open) => !open && setSelectedAgentId(null)} direction="bottom">
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[101] flex flex-col bg-[#0b1326] border-t border-[#00FFB2]/20 rounded-t-2xl shadow-[0_-20px_60px_rgba(0,255,178,0.05)] h-[95vh] md:h-[85vh] !mx-auto md:max-w-4xl focus:outline-none">
            <Drawer.Title className="sr-only">Agent Operating Desk</Drawer.Title>
            <Drawer.Description className="sr-only">View and manage agent details and configuration.</Drawer.Description>
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/20 mt-4 mb-2 cursor-grab active:cursor-grabbing" />
            <div className="flex-1 overflow-hidden relative">
               {selectedAgentId && <AgentOperatingDesk agentId={selectedAgentId} onBack={() => setSelectedAgentId(null)} />}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
      
      <NotificationCopilot />
    </div>
  );
}
