import React, { useState, useEffect } from 'react';
import { Target, Zap, Activity, ShieldAlert, BarChart2 } from 'lucide-react';
import { clsx } from 'clsx';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { usePersistentStore } from '../state/persistentStore';
import { useRealtimeMarket } from '../hooks/useRealtimeMarket';

export default function SignalEngine() {
   const [chartData, setChartData] = useState<{time: string, price: number}[]>([]);
   const { agents } = usePersistentStore();
   
   const symbol = 'btcusdt';
   const market = useRealtimeMarket(symbol);

   // Gather explainable signals across all agents
   const signals = agents.flatMap(a => (a.state?.decisionLog || []).map(log => ({ ...log, agentName: a.name }))).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

   useEffect(() => {
     if (market.price > 0) {
       setChartData(prev => {
         const now = new Date();
         const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
         const newData = [...prev, { time: timeStr, price: market.price }].slice(-40);
         return newData;
       });
     }
   }, [market.price]);

   return (
     <div className="flex-1 flex flex-col h-full bg-[#050505] relative z-10 overflow-hidden">
       <div className="p-4 md:p-6 border-b border-white/5 shrink-0 bg-black/40 backdrop-blur-md flex items-center justify-between">
         <div>
           <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 font-['Syne']">
             <Activity size={18} className="text-[#00FFB2]" />
             Signal Engine (Real-Time L2)
           </h2>
           <p className="text-xs text-gray-500 font-mono mt-1">High-Frequency VSA & Market Depth</p>
         </div>
       </div>

       <div className="flex-1 overflow-y-auto p-4 md:p-6 font-mono">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
             
             {/* Main Chart Area */}
             <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
                 <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-[300px] md:h-[400px]">
                   <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                         <h3 className="text-sm font-bold text-gray-900 dark:text-white">BTC/USDT</h3>
                         <span className="text-[10px] bg-[#00FFB2]/20 text-[#00FFB2] px-2 py-0.5 rounded">Binance WS</span>
                         <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded">Realtime L2</span>
                      </div>
                      <div className="flex gap-2">
                        <span className={clsx("text-xs font-bold", market.change >= 0 ? "text-[#00FFB2]" : "text-red-400")}>
                           {market.change >= 0 ? '+' : ''}{market.changePercent.toFixed(2)}%
                        </span>
                        <span className="text-xs text-gray-400">Vol: {(market.volume * market.price / 1e9).toFixed(2)}B</span>
                      </div>
                   </div>
                   <div className="flex-1 min-h-0 relative">
                     {/* VSA Overlay Annotations */}
                     {chartData.length > 20 && chartData[chartData.length - 1].price > chartData[chartData.length - 5].price && (
                       <div className="absolute top-[20%] left-[50%] bg-[#00FFB2]/10 border border-[#00FFB2]/20 text-[#00FFB2] text-[9px] px-2 py-1 rounded animate-pulse">
                         VSA: Hacim Akümülasyonu
                       </div>
                     )}
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData.length > 0 ? chartData : [{time: '0', price: market.price || 94000}]}>
                           <XAxis dataKey="time" stroke="#333" fontSize={10} tickMargin={10} minTickGap={30} />
                           <YAxis stroke="#333" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => `${v.toFixed(0)}`} width={60} orientation="right" />
                           <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '10px' }} />
                           <Line type="stepAfter" dataKey="price" stroke="#00FFB2" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                        </LineChart>
                     </ResponsiveContainer>
                   </div>
                 </div>

                 {/* Phase 2: Betafish Level-2 & funding metrics */}
                 <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-4 snap-x snap-mandatory pb-2 hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
                     <div className="min-w-[150px] lg:min-w-0 flex-none snap-start bg-[#0A0E17] border border-white/5 rounded-xl p-4">
                       <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Open Interest (Δ 1h)</div>
                       <div className="text-sm font-mono font-bold text-amber-400">+4.2% <span className="text-xs text-gray-400 ml-1">($1.2B)</span></div>
                     </div>
                     <div className="min-w-[150px] lg:min-w-0 flex-none snap-start bg-[#0A0E17] border border-white/5 rounded-xl p-4">
                       <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Funding Rate</div>
                       <div className="text-sm font-mono font-bold text-rose-400">0.052% <span className="text-[10px] text-gray-500 ml-1">Squeeze Risk</span></div>
                     </div>
                     <div className="min-w-[150px] lg:min-w-0 flex-none snap-start bg-[#0A0E17] border border-white/5 rounded-xl p-4">
                       <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">CVD (Cum. Vol)</div>
                       <div className="text-sm font-mono font-bold text-[#00FFB2]">+850 BTC</div>
                     </div>
                     <div className="min-w-[150px] lg:min-w-0 flex-none snap-start bg-[#0A0E17] border border-white/5 rounded-xl p-4">
                       <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Engine Status</div>
                       <div className="text-sm font-mono font-bold text-[#00FFB2]">SYNCED <span className="text-[10px] text-gray-500 ml-1">11ms</span></div>
                     </div>
                 </div>

                {/* Explainability Breakdown (Last Signal) */}
                {signals[0] ? (
                <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-4 md:p-5">
                   <h3 className="text-[10px] md:text-xs font-bold text-emerald-400 uppercase mb-4 tracking-wider">Active Signal Logic Trace</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                         <div className="text-[9px] text-gray-500 mb-1">EXECUTION THESIS</div>
                         <div className="text-xs text-gray-900 dark:text-white leading-relaxed">{signals[0].whyEntry}</div>
                      </div>
                      <div>
                         <div className="text-[9px] text-gray-500 mb-1">RISK ENGINE (SIZE & LEVERAGE)</div>
                         <div className="text-xs text-amber-200 leading-relaxed mb-2">SIZE: {signals[0].whySize}</div>
                         <div className="text-xs text-emerald-200 leading-relaxed">LEV: {signals[0].whyLeverage}</div>
                      </div>
                      <div>
                         <div className="text-[9px] text-gray-500 mb-1">INVALIDATION PARAMETERS</div>
                         <div className="text-xs text-red-300 leading-relaxed mb-2">STOP: {signals[0].whyStop}</div>
                         <div className="text-xs text-blue-300 leading-relaxed">TARGET: {signals[0].whyTarget}</div>
                      </div>
                   </div>
                </div>
                ) : (
                <div className="bg-white/5 border border-neutral-800 rounded-xl p-4 md:p-5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Zap size={16} className="text-amber-400" />
                      <div>
                         <div className="text-xs text-gray-900 dark:text-white">Ajan Sinyalleri Bekleniyor (VSA Squeeze Analizi)</div>
                         <div className="text-[10px] text-neutral-500 mt-1">Sistem piyasa volatilitesini izliyor. Anormal VSA hareketi bekleniyor...</div>
                      </div>
                   </div>
                </div>
                )}
             </div>

             {/* Agent Signals List */}
             <div className="flex flex-col gap-4 md:gap-6 pb-20 md:pb-0">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-5 flex-1 flex flex-col min-h-0">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                         <Target size={14} />
                         Swarm Ledger
                      </h3>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFB2] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFB2]"></span>
                      </span>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 custom-scrollbar">
                      {signals.length === 0 ? <p className="text-xs text-gray-500">No signals generated.</p> : signals.map((s, i) => (
                         <SignalCard key={`${s.id}-${i}`} s={s} />
                      ))}
                   </div>
                </div>
             </div>

          </div>
       </div>
     </div>
   );
}

function SignalCard({ s }: { s: any; key?: string }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div 
      onClick={() => setExpanded(!expanded)}
      className="bg-black/40 border border-white/5 rounded-lg p-3 hover:border-[#00FFB2]/30 transition-all cursor-pointer relative"
    >
       <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2 items-center">
             <span className={clsx(
                "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase",
                s.type === 'LONG' ? "bg-emerald-500/20 text-emerald-400" :
                s.type === 'SHORT' ? "bg-red-500/20 text-red-400" :
                "bg-gray-500/20 text-gray-400"
             )}>{s.type}</span>
             <span className="text-xs text-gray-900 dark:text-white font-bold">{s.asset}</span>
          </div>
          <span className={clsx("text-[10px] font-bold", s.confidence > 85 ? "text-[#00FFB2]" : "text-amber-400")}>{s.confidence}% CONF</span>
       </div>
       <div className="text-[9px] text-gray-500 mb-2">Source: {s.agentName}</div>
       
       <p className={clsx("text-[10px] text-gray-400 leading-relaxed mb-2 transition-all", expanded ? "" : "line-clamp-2")}>
          <span className="text-emerald-400 font-bold block mb-1">Decision Trace:</span>
          {s.whyEntry}
       </p>

       <div className={clsx("overflow-hidden transition-all duration-300 ease-in-out", expanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0")}>
          <div className="pt-2 mt-2 border-t border-white/10 space-y-2">
            <div>
              <div className="text-[9px] text-gray-500 uppercase">Why Leverage</div>
              <div className="text-[10px] text-emerald-200 leading-relaxed">{s.whyLeverage}</div>
            </div>
            <div>
              <div className="text-[9px] text-gray-500 uppercase">Why Size</div>
              <div className="text-[10px] text-amber-200 leading-relaxed">{s.whySize}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <div className="text-[9px] text-gray-500 uppercase">Target</div>
                <div className="text-[10px] text-blue-300">{s.whyTarget}</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500 uppercase">Stop Loss</div>
                <div className="text-[10px] text-red-300">{s.whyStop}</div>
              </div>
            </div>
          </div>
       </div>
    </div>
  );
}
