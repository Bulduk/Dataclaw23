import { useState, useEffect } from "react";
import { usePersistentStore } from './state/persistentStore';
import { loadSettingsFromCloud, syncSettingsToCloud } from './services/settingsSync';
import { Sidebar } from './components/layout/Sidebar';
import { EnterpriseHeader } from './components/layout/EnterpriseHeader';
import AdminPanel from "./components/AdminPanel";
import PortfolioPanel from "./components/PortfolioPanel";
import ControlPlane from "./components/ControlPlane";
import SignalEngine from "./components/SignalEngine";

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

// Replace with new modules
function ComingSoon({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#050505] text-[#00FFB2] font-mono border border-white/5 rounded-xl m-4 p-8 relative overflow-hidden">
       <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,178,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,178,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
       <h1 className="text-2xl font-bold tracking-widest z-10">{title}</h1>
       <p className="text-gray-500 mt-4 text-xs max-w-md text-center z-10">{desc}</p>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState("patrol");
  const { mode, activeExchange, killSwitchEngaged, agents } = usePersistentStore();

  useEffect(() => { 
    loadSettingsFromCloud();
  }, []);

  useEffect(() => {
    syncSettingsToCloud();
  }, [mode, activeExchange, killSwitchEngaged, agents]);

  return (
    <div className="flex h-screen bg-[#050505] text-white font-mono overflow-hidden">
      <Sidebar currentTab={tab} setTab={setTab} />
      
      <div className="flex flex-col flex-1 min-w-0">
        <EnterpriseHeader audit={AUDIT_DATA} />
        
        <main className="flex-1 overflow-hidden flex flex-col relative">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          
          <div className="relative z-10 flex-1 overflow-y-auto flex flex-col">
            {tab === "patrol" && <ControlPlane auditData={AUDIT_DATA} />}
            {tab === "signals" && <SignalEngine />}
            {tab === "agents" && <AdminPanel forceSection="crewai" />}
            {tab === "trading" && <AdminPanel forceSection="trading" />}
            {tab === "portfolio" && <PortfolioPanel />}
            {tab === "admin" && <AdminPanel forceSection="nasa" />}
          </div>
        </main>
      </div>
    </div>
  );
}
