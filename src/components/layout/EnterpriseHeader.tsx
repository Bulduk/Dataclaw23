import React, { useEffect, useState } from 'react';
import { Activity, Power, Wifi, Cpu, Fingerprint, Moon, Sun } from 'lucide-react';
import { usePersistentStore } from '../../state/persistentStore';
import clsx from 'clsx';

const formatP = (n: number) => n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});

export function EnterpriseHeader({ audit }: { audit: any }) {
  const [time, setTime] = useState(new Date().toISOString());
  const { mode, executionMode, activeExchange, killSwitchEngaged, theme, toggleTheme } = usePersistentStore();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toISOString()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-16 bg-white dark:bg-[#1e293b] border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-20 transition-colors shadow-sm">
      
      {/* Ticker Tape */}
      <div className="flex bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-full px-4 h-9 items-center overflow-hidden flex-1 max-w-2xl mr-4 font-sans">
        <div className="flex gap-6 animate-pulse-slow overflow-x-auto no-scrollbar whitespace-nowrap">
          {Object.entries(audit.market).map(([sym, d]: [string, any]) => {
            const isUp = d.change >= 0;
            return (
              <div key={sym} className="flex items-center gap-2 text-[10px]">
                <span className="text-gray-500 font-semibold">{sym}</span>
                <span className="text-nexus-text font-bold">${formatP(d.price)}</span>
                <span className={clsx("font-bold", isUp ? "text-emerald-500" : "text-red-500")}>
                  {isUp ? "+" : ""}{d.change.toFixed(2)}%
                </span>
                <span className="text-gray-500 ml-1">vol:{d.vol}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* System Status Indicators */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[9px] sm:text-[10px] whitespace-nowrap">
        <button onClick={toggleTheme} className="opacity-70 hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-nexus-glass">
           {theme === 'dark' ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} className="text-indigo-500" />}
        </button>
        
        <div className="w-px h-4 bg-nexus-border hidden md:block" />

        <div className="hidden md:flex items-center gap-2 text-gray-500">
           <Fingerprint size={12} />
           <span className="font-bold">{time.split('T')[1].split('.')[0]} UTC</span>
        </div>
        
        <div className="w-px h-4 bg-nexus-border hidden md:block" />
        
        <div className="hidden md:flex items-center gap-2 text-gray-500">
           <Cpu size={12} className={killSwitchEngaged ? "text-red-500" : "text-emerald-500"} />
           <span className="font-bold uppercase tracking-widest text-nexus-text">RUST_CORE: {killSwitchEngaged ? 'HALTED' : 'SYNCED'}</span>
        </div>

        <div className="w-px h-4 bg-nexus-border" />

        <div className="flex flex-col items-start gap-0.5 mt-[-2px]">
           <span className="text-[8px] text-gray-500 tracking-widest uppercase">EnvMode</span>
           <div className="flex items-center gap-2">
             <Wifi size={12} className={executionMode === 'FULL_AUTO' ? "text-emerald-500" : executionMode === 'PAPER' ? "text-blue-500" : "text-amber-500"} />
             <span className={clsx("font-bold uppercase tracking-widest text-nexus-text")}>
               {executionMode}
             </span>
           </div>
        </div>
        
        <div className="w-px h-6 bg-nexus-border" />
        
        <div className="flex flex-col items-start gap-0.5 mt-[-2px]">
           <span className="text-[8px] text-gray-500 tracking-widest uppercase">Target</span>
           <div className="flex items-center gap-2">
             <Power size={12} className="text-nexus-accent" />
             <span className="text-nexus-accent font-bold tracking-widest uppercase">{activeExchange}</span>
           </div>
        </div>
      </div>
    </div>
  );
}
