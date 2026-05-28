import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Activity, Zap, TrendingUp, TrendingDown, Clock, ShieldAlert, Cpu, Maximize2, Shield, TerminalSquare } from 'lucide-react';
import { useRealtimeMarket } from '../hooks/useRealtimeMarket';
import { usePersistentStore } from '../state/persistentStore';
import { useSimEngine } from '../state/simEngine';
import { clsx } from "clsx";

export default function QuantDashboard() {
  const symbol = 'btcusdt';
  const market = useRealtimeMarket(symbol);
  const { executionMode, killSwitchEngaged } = usePersistentStore();
  const { positions } = useSimEngine();

  const [chartData, setChartData] = useState<{t: number, p: number}[]>([]);

  useEffect(() => {
    if (market.price > 0) {
      setChartData(prev => {
        const newData = [...prev, { t: Date.now(), p: market.price }].slice(-60);
        return newData;
      });
    }
  }, [market.price]);

  const livePrice = market.price || 94331.34;
  const isUp = market.change >= 0;

  return (
    <div className="flex-1 bg-transparent text-nexus-text font-sans text-sm overflow-y-auto w-full max-w-7xl mx-auto h-full flex flex-col custom-scrollbar">
      
      {/* Ticker Header - Sticky */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 p-5 flex flex-col md:flex-row justify-between md:items-center shadow-[0_4px_24px_rgba(0,0,0,0.02)] gap-4 md:gap-0">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-900 dark:text-white tracking-tight flex items-center">
              BTC/USDT <span className="ml-3 text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-1 rounded-full font-bold uppercase tracking-widest">PERP</span>
            </h1>
          </div>
          <div className={`text-3xl font-bold flex items-center mt-2 transition-colors ${isUp ? 'text-blue-500' : 'text-rose-500'}`}>
            ${livePrice.toFixed(2)}
            <span className="text-sm ml-3 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 font-semibold px-2 py-1 rounded-full border border-gray-100 dark:border-gray-700/50">
               {isUp ? '+' : ''}{market.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="flex flex-row md:flex-col gap-4 md:gap-2 text-[11px]">
          <div className="flex flex-col md:flex-row justify-between md:w-32"><span className="text-gray-500 font-medium">24h Vol</span><span className="font-bold text-gray-900 dark:text-gray-200">{market.volume > 0 ? (market.volume * livePrice / 1e9).toFixed(1) + 'B' : '...'}</span></div>
          <div className="flex flex-col md:flex-row justify-between md:w-32"><span className="text-gray-500 font-medium">Funding</span><span className="text-amber-500 font-bold">0.01%</span></div>
          <div className="flex flex-col md:flex-row justify-between md:w-32"><span className="text-gray-500 font-medium">Signals</span><span className="text-blue-500 font-bold animate-pulse">STRONG</span></div>
        </div>
      </div>

      {/* Main Trading Area Layout */}
      <div className="flex flex-col lg:flex-row flex-1 p-4 md:p-6 gap-6">
        
        {/* CHART SECTION */}
        <div className="flex-1 flex flex-col gap-6 min-h-[300px]">
          <div className="flex-1 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-800 overflow-hidden relative group rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-4">
            {/* Chart overlay actions */}
            <div className="absolute top-2 right-2 flex space-x-1 z-10 opacity-50 group-hover:opacity-100 transition-opacity">
              <button className="bg-neutral-800/80 p-1.5 rounded hover:bg-neutral-700 hover:text-gray-900 dark:text-white"><Activity size={14}/></button>
              <button className="bg-neutral-800/80 p-1.5 rounded hover:bg-neutral-700 hover:text-gray-900 dark:text-white"><Maximize2 size={14}/></button>
            </div>
            
            <div className="p-0 h-full w-full absolute inset-0 pt-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.length > 0 ? chartData : Array.from({length:2}).map((_, i) => ({ t: i, p: livePrice }))}>
                  <defs>
                    <linearGradient id="gradientUp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--nexus-glass)', border: '1px solid var(--nexus-border)', borderRadius: '12px', fontSize: '11px', color: 'var(--nexus-text)' }}
                    itemStyle={{ color: '#3b82f6' }}
                    labelFormatter={() => ''}
                  />
                  <Area type="stepBefore" dataKey="p" stroke="#3b82f6" strokeWidth={2} fill="url(#gradientUp)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AGENT SWARM METRICS (Mobile: Swipeable Row, Desktop: Grid) */}
          <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-4 snap-x snap-mandatory pb-4 hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
            {[
              { id: 'Mirofish', role: 'VSA', conf: 88, stat: 'A-Grade' },
              { id: 'Betafish', role: 'ARB', conf: 45, stat: 'Wait' },
              { id: 'Onyx', role: 'RSH', conf: 92, stat: 'Alpha' },
              { id: 'OpenClaw', role: 'EXE', conf: 75, stat: 'Armed' }
            ].map(agent => (
              <div key={agent.id} className="min-w-[160px] lg:min-w-0 flex-none snap-start bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-800 p-5 rounded-[24px] relative overflow-hidden flex flex-col shadow-sm">
                <div className="absolute top-0 right-0 w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-bl-full" />
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-900 dark:text-gray-900 dark:text-white font-bold tracking-tight text-[15px]">{agent.id}</span>
                  <Cpu size={14} className={agent.conf >= 70 ? 'text-blue-500' : 'text-gray-400'} />
                </div>
                <div className="text-[11px] text-gray-500 mb-4 font-medium">{agent.role} &middot; {agent.stat}</div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-gray-400">Conf.</span>
                  <span className={agent.conf >= 70 ? 'text-blue-500' : 'text-rose-500'}>{agent.conf}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${agent.conf >= 70 ? 'bg-blue-500' : 'bg-rose-500'}`} style={{width: `${agent.conf}%`}} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN / MOBILE BOTTOM: Orderbook & Execution */}
        <div className="flex flex-col gap-6 w-full lg:w-80 shrink-0">
          
          {/* Orderbook Depth View */}
          <div className="bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-800 overflow-hidden flex-1 lg:h-auto min-h-[400px] flex flex-col rounded-[32px] shadow-sm">
            <div className="flex justify-between px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <span className="flex-1 w-1/3">Price (USDT)</span>
              <span className="flex-1 w-1/3 text-right">Qty (BTC)</span>
              <span className="flex-1 w-1/3 text-right">Total</span>
            </div>
            <div className="flex-1 flex flex-col py-1 text-[11px] h-full overflow-y-auto custom-scrollbar relative">
              {/* ASKS (Sells) */}
              <div className="flex flex-col-reverse justify-end flex-1">
                {market.orderbook.asks.length > 0 ? market.orderbook.asks.slice(-10).map((row, i) => (
                   <div key={i} className="flex px-3 relative h-5 items-center hover:bg-nexus-bg/50 font-mono">
                     <div className="absolute right-0 top-0 bottom-0 bg-red-500/10 z-0" style={{ width: `${(row.total/Math.max(...market.orderbook.asks.map(a => a.total)))*100}%` }} />
                     <span className="text-red-400 w-1/3 z-10">{row.price.toFixed(1)}</span>
                     <span className="text-nexus-text w-1/3 text-right z-10">{row.qty.toFixed(3)}</span>
                     <span className="text-gray-500 w-1/3 text-right z-10">{row.total.toFixed(3)}</span>
                   </div>
                )) : <div className="text-gray-500 text-center py-4 text-[10px] uppercase font-bold animate-pulse">Awaiting Rust Sink...</div>}
              </div>
              
              {/* Spread Mid-Market */}
              <div className="my-1 py-1 px-3 border-y border-nexus-border font-bold text-lg flex items-center justify-between bg-nexus-glass/50 transition-colors rounded-sm">
                <span className={isUp ? 'text-emerald-500' : 'text-red-500'}>{livePrice.toFixed(2)}</span>
                <span className="text-[10px] bg-nexus-bg border border-nexus-border text-gray-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">Mark</span>
              </div>
              
              {/* BIDS (Buys) */}
              <div className="flex flex-col flex-1">
                {market.orderbook.bids.length > 0 ? market.orderbook.bids.slice(0, 10).map((row, i) => (
                   <div key={i} className="flex px-3 relative h-5 items-center hover:bg-nexus-bg/50 font-mono">
                     <div className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 z-0" style={{ width: `${(row.total/Math.max(...market.orderbook.bids.map(b => b.total)))*100}%` }} />
                     <span className="text-emerald-500 w-1/3 z-10">{row.price.toFixed(1)}</span>
                     <span className="text-nexus-text w-1/3 text-right z-10">{row.qty.toFixed(3)}</span>
                     <span className="text-gray-500 w-1/3 text-right z-10">{row.total.toFixed(3)}</span>
                   </div>
                )) : null}
              </div>
            </div>
          </div>


          {/* Agent Operations Panel */}
          <div className="bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-800 p-5 rounded-[32px] flex flex-col gap-4 flex-none lg:h-[280px] shadow-sm">
             <div className="flex justify-between items-center mb-2 border-b border-gray-100 dark:border-gray-800 pb-3">
               <h3 className="text-gray-900 dark:text-gray-300 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                 <TerminalSquare size={14} className="text-blue-500" /> 
                 Agents Operations
               </h3>
               <span className="text-[9px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest animate-pulse border border-blue-100 dark:border-blue-500/20">
                 LIVE SYNC
               </span>
             </div>

             {positions && positions.length > 0 ? (
               <div className="overflow-y-auto no-scrollbar flex-1 -mx-2 px-2 flex flex-col gap-3">
                 {positions.map(pos => (
                   <div key={pos.id} className="bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 rounded-[20px] p-4">
                     <div className="flex justify-between items-center mb-3">
                       <span className="font-bold text-gray-900 dark:text-gray-900 dark:text-white text-sm tracking-tight">{pos.symbol}</span>
                       <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider", 
                         pos.side === 'LONG' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                       )}>{pos.side}</span>
                     </div>
                     <div className="flex justify-between text-[11px] mb-1 font-medium">
                       <span className="text-gray-500">Entry: {pos.entryPrice.toFixed(2)}</span>
                       <span className={clsx("font-bold", pos.pnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                         {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)} USDT
                       </span>
                     </div>
                     <div className="text-[11px] text-gray-500 truncate mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-blue-500 font-bold">NEXUS:</span> Holding position per OpenClaw strategy.
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70 bg-gray-50 dark:bg-gray-800/30 rounded-[20px] border border-gray-100 dark:border-gray-700/50 p-6">
                  <Activity size={24} className="mb-3 text-gray-400" />
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Patroling Markets</p>
                  <p className="text-[11px] text-gray-500 mt-1">Awaiting signal from Prime Council</p>
                </div>
             )}

             {killSwitchEngaged && (
               <div className="mt-auto text-[10px] text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-3 rounded-[16px] flex items-center justify-center gap-2 font-bold uppercase tracking-widest">
                  <ShieldAlert size={14} /> Execution Blocked By PolicyGuard
               </div>
             )}
          </div>

        </div>
      </div>
{/* SCROLL-INJECTED STYLES FOR SCROLLBARS */}
<style dangerouslySetInnerHTML={{__html: `
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 4px; }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.8); }
`}} />
    </div>
  );
}
