import React, { useState, useEffect, useRef } from 'react';
import { Network, Activity, ShieldAlert, Cpu, ArrowRight, Play, TerminalSquare, AlertTriangle, CheckCircle, Server, Settings, Power, Anchor, X, Maximize, Clock, Code, LayoutGrid, Box } from 'lucide-react';
import { bridgeService, DataclawSignal } from '../services/executionBridge';
import { Drawer } from "vaul";
import clsx from "clsx";

export default function ExecutionBridge() {
  const [events, setEvents] = useState<{time: string, type: string, message: string, raw?: any, id?: number}[]>([
    { time: new Date().toLocaleTimeString(), type: '[SYSTEM]', message: 'Bridge node [rust-core-01] initialized in docker swarm.' }
  ]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('execution'); // execution, logs, orders

  const testDispatch = async () => {
    if (activeStep !== 0) return;

    const signal: DataclawSignal = {
      intent_id: Math.random().toString(36).substring(7).toUpperCase(),
      agent_origin: 'Betafish (Python)',
      symbol: 'BTC/USDT',
      direction: 'LONG',
      entry_price: 64500,
      stop_loss: 62000,
      take_profit: 68000,
      position_size_usd: 50000,
      leverage: 5,
      confidence_score: 92,
      order_type: 'LIMIT',
      ttl_seconds: 60
    };

    const addEvent = (type: string, message: string, raw?: any) => {
      setEvents(prev => [{ time: new Date().toLocaleTimeString(), type, message, raw, id: Date.now() + Math.random() }, ...prev].slice(0, 50));
    };

    setActiveStep(1);
    addEvent('[SIGNAL]', `Generated Intent ${signal.intent_id} via Python AI Engine.`, signal);

    setTimeout(async () => {
      setActiveStep(2);
      const gateResult = await bridgeService.validateSafetyGate(signal);
      
      if (!gateResult.valid) {
        addEvent('[SYSTEM]', `PolicyGuard Reject: ${gateResult.reason}`, gateResult);
        setActiveStep(0);
        return;
      }
      addEvent('[SYSTEM]', `Rust Risk Gate Pass: Configs validated.`, gateResult);
      
      setTimeout(() => {
        setActiveStep(3);
        addEvent('[SYSTEM]', `Sending Schema to Docker Hub Router.`, signal);
        
        bridgeService.dispatch(signal, 'binance').then(order => {
          if (order) {
            setTimeout(() => {
               setActiveStep(4);
               addEvent('[ORDER]', `Exchange ACKs order placement.`, order);
               setTimeout(() => {
                  setActiveStep(0);
                  addEvent('[ORDER]', `Fill confirmed. Slippage: 0.8bps.`, { slippage: 0.00008, filled: true });
               }, 1500);
            }, 1000);
          } else {
             setActiveStep(0);
             addEvent('[SYSTEM]', `Exchange API error (Binance Network).`, { reason: 'api_timeout' });
          }
        });
      }, 1000);
    }, 1000);
  };

  const getEventColor = (type: string) => {
    if (type === '[SIGNAL]') return 'text-indigo-500 dark:text-[#00F2FF]';
    if (type === '[ORDER]') return 'text-emerald-500 dark:text-[#00FF88]';
    return 'text-gray-500 dark:text-gray-400';
  }

  const getEventBorder = (type: string) => {
    if (type === '[SIGNAL]') return 'border-indigo-500 dark:border-[#00F2FF]';
    if (type === '[ORDER]') return 'border-emerald-500 dark:border-[#00FF88]';
    return 'border-gray-500 dark:border-gray-400';
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-nexus-bg text-nexus-text overflow-hidden font-mono relative">
      
      {/* Top Status Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-nexus-border bg-nexus-glass z-10 shrink-0 gap-2">
         <div className="flex items-center gap-4 text-[10px] md:text-xs tracking-widest uppercase">
            <div className="flex items-center gap-1.5" title="Rust Core execution time">
               <Cpu size={12} className="text-nexus-accent" />
               <span className="text-gray-500">RUST_ENGINE:</span>
               <span className="font-bold">0.4ms</span>
            </div>
            <div className="w-px h-3 bg-nexus-border"></div>
            <div className="flex items-center gap-1.5" title="Python inference">
               <Activity size={12} className="text-blue-500" />
               <span className="text-gray-500">PY_MODELS:</span>
               <span className="text-blue-500 font-bold">ONLINE</span>
            </div>
            <div className="w-px h-3 bg-nexus-border"></div>
            <div className="flex items-center gap-1.5 hidden md:flex" title="Docker Swarm">
               <Box size={12} className="text-fuchsia-500" />
               <span className="text-gray-500">DOCKER_NODES:</span>
               <span className="text-fuchsia-500 font-bold">3/3</span>
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col pb-24 md:pb-6">
         
         {/* Page Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
               <h1 className="text-2xl font-bold tracking-tight mb-1" style={{fontFamily: "'Syne', sans-serif"}}>Execution Bridge</h1>
               <p className="text-xs text-gray-500 uppercase tracking-widest">High-Frequency Deterministic Routing</p>
            </div>
            
            <button 
               onClick={testDispatch}
               disabled={activeStep !== 0}
               className={clsx(
                 "flex w-max items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-sm border",
                 activeStep === 0 
                   ? "bg-nexus-accent text-gray-900 dark:text-white border-transparent hover:opacity-90 shadow-nexus-accent/30 cursor-pointer"
                   : "bg-nexus-glass text-gray-400 border-nexus-border cursor-not-allowed hidden md:flex"
               )}
            >
               <Play size={12} className={activeStep !== 0 ? "opacity-50" : ""} />
               Test Dispatch
            </button>
         </div>

         {/* Mobile Test Dispatch FAB */}
         {activeStep === 0 && (
           <button 
             onClick={testDispatch}
             className="md:hidden fixed bottom-24 right-4 z-40 bg-nexus-accent text-gray-900 dark:text-white shadow-lg w-14 h-14 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-nexus-accent focus:ring-offset-2 focus:ring-offset-nexus-bg animate-in slide-in-from-bottom"
           >
             <Play size={24} className="ml-1" />
           </button>
         )}

         {/* Bridge Navigation Tabs */}
         <div className="flex gap-4 border-b border-nexus-border mb-4 overflow-x-auto no-scrollbar">
           {['execution', 'logs', 'orders'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={clsx(
                 "px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2",
                 activeTab === tab ? "border-nexus-accent text-nexus-accent" : "border-transparent text-gray-500 hover:text-nexus-text"
               )}
             >
               {tab}
             </button>
           ))}
         </div>

         {activeTab === 'execution' && (
           <div className="flex flex-col gap-6 flex-1">
             {/* Pipeline Viz */}
             <div className="w-full bg-nexus-glass border border-nexus-border rounded-2xl p-6 md:p-10 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between relative max-w-4xl mx-auto">
                   
                   {/* Lines Background */}
                   <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-[2px] bg-nexus-border z-0 flex items-center overflow-hidden">
                     {activeStep > 0 && activeStep < 4 && (
                       <div 
                          className="h-[2px] w-24 bg-nexus-accent animate-[flow_1.5s_linear_infinite]"
                          style={{ transformOrigin: 'left' }}
                       />
                     )}
                   </div>

                   {/* Node 1: AI */}
                   <div className={clsx("flex flex-col items-center gap-3 z-10 transition-all duration-500 bg-nexus-bg rounded-full p-1", activeStep === 1 ? "scale-110" : activeStep > 1 ? "opacity-70" : "opacity-50")}>
                      <div className={clsx(
                         "w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 bg-nexus-glass",
                         activeStep === 1 ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border-nexus-border"
                      )}>
                         <Cpu size={24} className={activeStep === 1 ? "text-blue-500" : "text-gray-500"} />
                      </div>
                      <span className={clsx("text-[10px] md:text-xs font-bold uppercase tracking-wider", activeStep === 1 ? "text-blue-500" : "text-gray-500")}>AI Init</span>
                   </div>

                   {/* Node 2: Rust Gate */}
                   <div className={clsx("flex flex-col items-center gap-3 z-10 transition-all duration-500 bg-nexus-bg rounded-full p-1", activeStep === 2 ? "scale-110" : activeStep > 2 ? "opacity-70" : "opacity-50")}>
                      <div className={clsx(
                         "w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 bg-nexus-glass",
                         activeStep === 2 ? "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "border-nexus-border"
                      )}>
                         <ShieldAlert size={24} className={activeStep === 2 ? "text-amber-500" : "text-gray-500"} />
                      </div>
                      <span className={clsx("text-[10px] md:text-xs font-bold uppercase tracking-wider", activeStep === 2 ? "text-amber-500" : "text-gray-500")}>Risk Guard</span>
                   </div>

                   {/* Node 3: Docker Bridge */}
                   <div className={clsx("flex flex-col items-center gap-3 z-10 transition-all duration-500 bg-nexus-bg rounded-full p-1", activeStep === 3 ? "scale-110" : activeStep > 3 ? "opacity-70" : "opacity-50")}>
                      <div className={clsx(
                         "w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 bg-nexus-glass",
                         activeStep === 3 ? "border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.3)]" : "border-nexus-border"
                      )}>
                         <Network size={24} className={activeStep === 3 ? "text-fuchsia-500" : "text-gray-500"} />
                      </div>
                      <span className={clsx("text-[10px] md:text-xs font-bold uppercase tracking-wider", activeStep === 3 ? "text-fuchsia-500" : "text-gray-500")}>Container</span>
                   </div>

                   {/* Node 4: Exchange */}
                   <div className={clsx("flex flex-col items-center gap-3 z-10 transition-all duration-500 bg-nexus-bg rounded-full p-1", activeStep === 4 ? "scale-110" : "opacity-50")}>
                      <div className={clsx(
                         "w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 bg-nexus-glass",
                         activeStep === 4 ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border-nexus-border"
                      )}>
                         <CheckCircle size={24} className={activeStep === 4 ? "text-emerald-500" : "text-gray-500"} />
                      </div>
                      <span className={clsx("text-[10px] md:text-xs font-bold uppercase tracking-wider", activeStep === 4 ? "text-emerald-500" : "text-gray-500")}>Exchange</span>
                   </div>

                </div>
             </div>
             
             {/* Status Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-nexus-glass border border-nexus-border rounded-xl p-4 flex flex-col justify-center items-center">
                   <Server size={18} className="text-gray-400 mb-2" />
                   <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Docker Daemon</span>
                   <span className="text-sm font-bold text-emerald-500">RUNNING</span>
                </div>
                <div className="bg-nexus-glass border border-nexus-border rounded-xl p-4 flex flex-col justify-center items-center">
                   <Code size={18} className="text-gray-400 mb-2" />
                   <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Python Subprocess</span>
                   <span className="text-sm font-bold text-blue-500">IDLE (0.1ms)</span>
                </div>
                <div className="bg-nexus-glass border border-nexus-border rounded-xl p-4 flex flex-col justify-center items-center">
                   <ShieldAlert size={18} className="text-gray-400 mb-2" />
                   <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Rust PG Guard</span>
                   <span className="text-sm font-bold text-amber-500">ARMED</span>
                </div>
                <div className="bg-nexus-glass border border-nexus-border rounded-xl p-4 flex flex-col justify-center items-center">
                   <Activity size={18} className="text-gray-400 mb-2" />
                   <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">API Node Rate</span>
                   <span className="text-sm font-bold">120/s</span>
                </div>
             </div>
           </div>
         )}

         {activeTab === 'logs' && (
           <div className="flex-1 bg-nexus-glass border border-nexus-border rounded-xl flex flex-col overflow-hidden shadow-inner relative">
             <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
             <div className="p-4 overflow-y-auto custom-scrollbar flex flex-col gap-2 relative z-10 flex-1">
                {events.map((e, index) => {
                  let colorClass = getEventColor(e.type);
                  let borderClass = getEventBorder(e.type);
                  return (
                  <div 
                     key={e.id || index} 
                     onClick={() => setSelectedEvent(e)}
                     className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs cursor-pointer p-3 rounded-lg transition-all hover:bg-nexus-glass active:scale-[0.99] group border border-transparent hover:border-nexus-border"
                     style={{
                       opacity: Math.max(0.4, 1 - index * 0.1),
                     }}
                  >
                     <div className="flex text-[10px] items-center gap-2 w-28 shrink-0">
                        <span className="text-gray-500 font-mono tracking-tighter">{e.time}</span>
                     </div>
                     <span className={clsx("font-bold tracking-wider", colorClass)}>{e.type}</span>
                     <span className="text-nexus-text flex-1 truncate">{e.message}</span>
                     
                     <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className={clsx("text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border", borderClass, colorClass)}>Inspect Node</span>
                     </div>
                  </div>
                )})}
             </div>
           </div>
         )}
         
         {activeTab === 'orders' && (
           <div className="flex-1 bg-nexus-glass border border-nexus-border rounded-xl flex flex-col justify-center items-center opacity-60">
             <Box size={32} className="text-gray-400 mb-4" />
             <span className="font-bold text-gray-500">No active Docker container orchestrals.</span>
             <span className="text-xs text-gray-500 mt-2 tracking-widest uppercase">Start dispatch to trace.</span>
           </div>
         )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flow {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(400%); opacity: 0; }
        }
      `}} />

      {/* Detail Dialog Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 dark:bg-[#000000]/60 backdrop-blur-md" onClick={() => setSelectedEvent(null)} />
          <div className="relative w-full max-w-2xl bg-nexus-bg border border-nexus-border rounded-2xl shadow-xl overflow-hidden flex flex-col font-mono text-xs origin-center animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-nexus-border bg-nexus-glass">
               <div className="flex items-center gap-3">
                 <TerminalSquare size={16} className="text-nexus-accent" />
                 <span className="font-bold uppercase tracking-widest">Rust/Python Dump</span>
                 <span className="px-2 py-0.5 rounded text-[10px] bg-nexus-glass text-gray-500 border border-nexus-border">{selectedEvent.time}</span>
               </div>
               <button onClick={() => setSelectedEvent(null)} className="text-gray-500 hover:text-nexus-text transition-colors p-1 bg-nexus-glass rounded-md">
                 <X size={16} />
               </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto max-h-[70vh]">
               <div className="text-gray-500 mb-6 font-sans text-sm">{selectedEvent.message}</div>
               <div className="bg-nexus-glass p-4 rounded-xl border border-nexus-border overflow-x-auto">
                 <pre className="text-nexus-accent leading-relaxed">
                   {selectedEvent.raw ? JSON.stringify(selectedEvent.raw, null, 2) : '{\n  "sys": "No struct returned from rust/python handler",\n  "timestamp": "' + selectedEvent.time + '"\n}'}
                 </pre>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Fab Settings / Global Config  */}
      <Drawer.Root>
        <Drawer.Trigger asChild>
          <div className="fixed bottom-20 md:bottom-8 right-20 md:right-8 z-40 hidden md:block">
             <button className="bg-nexus-glass border border-nexus-border text-nexus-text p-3 md:px-5 md:py-3 rounded-full md:rounded-xl shadow-lg flex items-center gap-3 transition-colors hover:border-nexus-accent hover:text-nexus-accent group">
                <Settings size={18} />
                <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">Config</span>
             </button>
          </div>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
          <Drawer.Content className="bg-nexus-bg border-t border-nexus-border h-auto mt-24 fixed bottom-0 left-0 right-0 z-[101] flex flex-col rounded-t-[24px] focus:outline-none">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-nexus-border mt-4 mb-8" />
            <div className="max-w-2xl mx-auto w-full px-6 pb-12 flex flex-col gap-6 font-mono text-nexus-text">
               
               <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2">
                     <Settings size={20} className="text-nexus-accent" /> Rust Policy Guard Settings
                  </h2>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-nexus-glass border border-nexus-border p-4 rounded-xl flex flex-col justify-center items-center">
                     <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Max Position</span>
                     <span className="text-xl font-bold">500.00 USD</span>
                  </div>
                  <div className="bg-nexus-glass border border-nexus-border p-4 rounded-xl flex flex-col justify-center items-center">
                     <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Max Lev</span>
                     <span className="text-xl font-bold">5x</span>
                  </div>
               </div>

               <div className="mt-4 pt-6 border-t border-nexus-border">
                  <h3 className="text-xs uppercase text-gray-500 tracking-widest mb-4">Manual Override</h3>
                  <button className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 p-4 rounded-xl flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest transition-all">
                     <Power size={18} /> Emergency Flatten All
                  </button>
               </div>

            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
      
    </div>
  );
}

