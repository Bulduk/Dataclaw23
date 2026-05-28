import React, { useState } from 'react';
import { MessageSquare, Activity, BrainCircuit, Menu, Network, Wallet, Settings, ShieldAlert, Cpu, ArrowLeftRight, X } from 'lucide-react';
import clsx from 'clsx';

const MAIN_TABS = [
  { id: 'patrol', icon: MessageSquare, label: 'Chat' },
  { id: 'signals', icon: Activity, label: 'Signals' },
  { id: 'bridge', icon: Network, label: 'Bridge' },
  { id: 'agents', icon: BrainCircuit, label: 'Agents' },
];

export function BottomNav({ 
  currentTab, 
  setTab,
  onMenuClick 
}: { 
  currentTab: string, 
  setTab: (t: string) => void,
  onMenuClick: () => void 
}) {
  const [fabOpen, setFabOpen] = useState(false);

  return (
    <>
      {/* FAB Overlay */}
      {fabOpen && (
        <div 
          className="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md z-[55] flex flex-col justify-end pb-24 items-center animate-in fade-in md:hidden"
          onClick={() => setFabOpen(false)}
        >
          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-slate-800 w-full max-w-sm mx-4 transform transition-all" onClick={e => e.stopPropagation()}>
            <h3 className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-6 tracking-[0.2em] uppercase">Quick Menu</h3>
            <div className="grid grid-cols-3 gap-y-6 gap-x-4">
              <button onClick={() => { setTab("bridge"); setFabOpen(false); }} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-[20px] bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-sm">
                  <ArrowLeftRight size={22} />
                </div>
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Execute</span>
              </button>
              <button onClick={() => { setTab("patrol"); setFabOpen(false); }} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-[20px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-sm">
                  <MessageSquare size={22} />
                </div>
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Agent Chat</span>
              </button>
              <button onClick={() => { setTab("risk"); setFabOpen(false); }} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-[20px] bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-sm">
                  <ShieldAlert size={22} />
                </div>
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Risk</span>
              </button>
              <button onClick={() => { setTab("portfolio"); setFabOpen(false); }} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-[20px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-sm">
                  <Wallet size={22} />
                </div>
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Ledger</span>
              </button>
              <button onClick={() => { setTab("signals"); setFabOpen(false); }} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-[20px] bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-sm">
                  <Activity size={22} />
                </div>
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Signals</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-xl border border-nexus-border z-50 px-4 pb-2 pt-2 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between h-14 relative">
          
          <div className="flex flex-1 justify-around h-full items-center">
             <TabButton item={MAIN_TABS[0]} active={currentTab === MAIN_TABS[0].id} onClick={() => setTab(MAIN_TABS[0].id)} />
             <TabButton item={MAIN_TABS[1]} active={currentTab === MAIN_TABS[1].id} onClick={() => setTab(MAIN_TABS[1].id)} />
          </div>

          <div className="px-2 -mt-10">
             <button 
                onClick={() => setFabOpen(!fabOpen)}
                className={clsx(
                  "w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(59,130,246,0.3)] transition-transform text-gray-900 dark:text-white border-4 border-white dark:border-[#1e293b]",
                  fabOpen ? "bg-red-500 rotate-45 shadow-[0_8px_24px_rgba(239,68,68,0.3)]" : "bg-nexus-accent hover:opacity-90"
                )}
             >
                {fabOpen ? <X size={24} /> : <ArrowLeftRight size={24} />}
             </button>
          </div>

          <div className="flex flex-1 justify-around h-full items-center">
             <TabButton item={MAIN_TABS[3]} active={currentTab === MAIN_TABS[3].id} onClick={() => setTab(MAIN_TABS[3].id)} />
             <button
                onClick={onMenuClick}
                className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-gray-400 transition-colors hover:text-nexus-accent"
             >
                <Menu size={20} />
                <span className="text-[10px] font-medium tracking-wide">Menu</span>
             </button>
          </div>
        </div>
      </div>
    </>
  );
}

function TabButton({ item, active, onClick }: { item: any, active: boolean, onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
        active ? "text-nexus-accent" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      )}
    >
      <Icon size={active ? 22 : 20} className={active ? "text-nexus-accent" : ""} />
      <span className={clsx("text-[10px] tracking-wide", active ? "font-bold" : "font-medium")}>{item.label}</span>
    </button>
  );
}

export function MobileMenuDrawer({ 
  isOpen, 
  onClose, 
  setTab 
}: { 
  isOpen: boolean, 
  onClose: () => void,
  setTab: (t: string) => void 
}) {
  if (!isOpen) return null;

  const handleSelect = (tabId: string) => {
    setTab(tabId);
    onClose();
  };

  return (
    <div className="md:hidden fixed inset-0 z-[60] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#f8f9fa] dark:bg-[#0f172a] rounded-t-[32px] p-6 flex flex-col gap-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-full duration-200">
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto" />
        
        <h3 className="text-[13px] font-bold text-gray-800 dark:text-gray-300 tracking-wide">Systems Config</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <MenuGridButton icon={Cpu} label="Laboratory" sub="Quant Data" color="text-blue-500" onClick={() => handleSelect('laboratory')} />
          <MenuGridButton icon={Activity} label="Stack" sub="Log Stream" color="text-indigo-500" onClick={() => handleSelect('stack')} />
        </div>

        <div className="grid grid-cols-1 gap-3 pb-8">
           <button onClick={() => handleSelect('portfolio')} className="flex items-center gap-4 p-4 bg-white dark:bg-[#1e293b] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm active:scale-[0.98] transition-transform">
             <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
               <Wallet size={24} className="text-emerald-500" />
             </div>
             <div className="flex flex-col text-left">
               <span className="text-sm text-gray-900 dark:text-gray-900 dark:text-white font-bold">Portfolio & Ledger</span>
               <span className="text-[11px] text-gray-500 mt-0.5">Track balance and exposure</span>
             </div>
           </button>

           <button onClick={() => handleSelect('trading')} className="flex items-center gap-4 p-4 bg-white dark:bg-[#1e293b] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm active:scale-[0.98] transition-transform">
             <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10">
               <Network size={24} className="text-indigo-500" />
             </div>
             <div className="flex flex-col text-left">
               <span className="text-sm text-gray-900 dark:text-gray-900 dark:text-white font-bold">API / Exec Config</span>
               <span className="text-[11px] text-gray-500 mt-0.5">Binance / CCXT Keys</span>
             </div>
           </button>

           <button onClick={() => handleSelect('risk')} className="flex items-center gap-4 p-4 bg-white dark:bg-[#1e293b] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm active:scale-[0.98] transition-transform">
             <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10">
               <ShieldAlert size={24} className="text-red-500" />
             </div>
             <div className="flex flex-col text-left">
               <span className="text-sm text-gray-900 dark:text-gray-900 dark:text-white font-bold">Risk Management</span>
               <span className="text-[11px] text-gray-500 mt-0.5">PolicyGuard Setup</span>
             </div>
           </button>

           <button onClick={() => handleSelect('admin')} className="flex items-center gap-4 p-4 bg-white dark:bg-[#1e293b] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm active:scale-[0.98] transition-transform">
             <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10">
               <Settings size={24} className="text-amber-500" />
             </div>
             <div className="flex flex-col text-left">
               <span className="text-sm text-gray-900 dark:text-gray-900 dark:text-white font-bold">Global Admin</span>
               <span className="text-[11px] text-gray-500 mt-0.5">Platform details</span>
             </div>
           </button>
        </div>
      </div>
    </div>
  );
}

function MenuGridButton({ icon: Icon, label, sub, color, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-start p-5 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-800 shadow-sm rounded-[24px] active:scale-[0.98] transition-transform">
      <div className={`w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mb-4 ${color}`}>
        <Icon size={20} />
      </div>
      <span className="font-bold text-sm text-gray-900 dark:text-gray-900 dark:text-white">{label}</span>
      <span className="text-[11px] text-gray-500 mt-1">{sub}</span>
    </button>
  );
}
