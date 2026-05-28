import React from 'react';
import { Network, Activity, BrainCircuit, Wallet, Settings, TerminalSquare, ShieldAlert, Layers, Cpu, Database, Server } from 'lucide-react';
import clsx from 'clsx';
import { usePersistentStore } from '../../state/persistentStore';

const NAV_GROUPS = [
  {
    title: 'Operations',
    items: [
      { id: 'patrol', icon: TerminalSquare, label: 'Command Center', subtitle: 'Supervisor Interface' },
      { id: 'bridge', icon: Network, label: 'Execution Bridge', subtitle: 'Rust Order Router' },
      { id: 'portfolio', icon: Wallet, label: 'Ledger & State', subtitle: 'Live PnL Tracking' },
    ]
  },
  {
    title: 'Engine & Models',
    items: [
      { id: 'laboratory', icon: Activity, label: 'Quant Lab', subtitle: 'Backtest & Scopes' },
      { id: 'agents', icon: BrainCircuit, label: 'Neural Core', subtitle: 'Agent Nodes (Go/Py)' },
      { id: 'signals', icon: Database, label: 'Signal DB', subtitle: 'Real-time Aggregation' },
    ]
  },
  {
    title: 'Telemetry & Config',
    items: [
      { id: 'stack', icon: Layers, label: 'Log Stream', subtitle: 'System Stack Trace' },
      { id: 'admin', icon: Settings, label: 'Platform Settings', subtitle: 'API & Key Vault' },
    ]
  }
];

export function Sidebar({ currentTab, setTab }: { currentTab: string, setTab: (t: string) => void }) {
  const killSwitchEngaged = usePersistentStore(s => s.killSwitchEngaged);
  const setKillSwitch = usePersistentStore(s => s.setKillSwitch);

  return (
    <div className="w-64 bg-nexus-bg border-r border-nexus-border flex flex-col h-screen shrink-0 relative z-20">
      <div className="p-4 flex items-center justify-between border-b border-nexus-border">
         <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded bg-nexus-accent flex items-center justify-center font-bold text-black shadow-[0_0_15px_rgba(var(--nexus-accent),0.3)]">
             D
           </div>
           <div className="flex flex-col">
             <span className="font-['Syne'] font-bold text-sm tracking-wide text-nexus-text">POULS O.S.</span>
             <span className="text-[9px] text-nexus-accent font-mono uppercase">V5.0.1_RUST_CORE</span>
           </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6 px-3 custom-scrollbar">
        {NAV_GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="flex flex-col gap-1">
            <h3 className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{group.title}</h3>
            {group.items.map((item) => {
              const active = currentTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={clsx(
                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors duration-200 group font-mono",
                    active ? "bg-nexus-glass" : "hover:bg-nexus-glass/50"
                  )}
                >
                  <Icon size={16} className={active ? "text-nexus-accent" : "text-gray-400 group-hover:text-nexus-text"} />
                  <div className="flex flex-col flex-1">
                     <span className={clsx("text-xs tracking-tight", active ? "font-bold text-nexus-text" : "font-medium text-gray-400 group-hover:text-nexus-text")}>{item.label}</span>
                     <span className="text-[9px] text-gray-500">{item.subtitle}</span>
                  </div>
                  {active && <div className="w-1 h-4 rounded-full bg-nexus-accent" />}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-nexus-border flex flex-col gap-3">
         <button 
           onClick={() => setKillSwitch(!killSwitchEngaged)}
           className={clsx(
             "w-full flex flex-col items-center justify-center py-2.5 rounded-lg font-mono text-[10px] uppercase font-bold transition-all border",
             killSwitchEngaged 
               ? "bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]" 
               : "bg-nexus-glass border-transparent text-nexus-text/70 hover:text-nexus-text hover:bg-nexus-glass/80"
           )}
         >
           <span className="flex items-center gap-2"><ShieldAlert size={14} /> Global Kill Switch</span>
           <span className="text-[8px] font-normal opacity-70 mt-0.5">{killSwitchEngaged ? 'Rust Engine Halted' : 'Armed via DB Schema'}</span>
         </button>
      </div>
    </div>
  );
}
