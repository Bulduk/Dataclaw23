import React, { useState, useEffect } from 'react';
import { Target, Zap, Activity, ShieldAlert, BarChart2 } from 'lucide-react';
import { clsx } from 'clsx';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Mock live data generator
const generateChartData = () => {
    let base = 94000;
    return Array.from({length: 40}).map((_, i) => {
        base = base + (Math.random() * 200 - 100);
        return {
            time: `-${40-i}m`,
            price: base,
            momentum: Math.random() * 100
        }
    });
};

export default function SignalEngine() {
   const [data, setData] = useState(generateChartData());
   const [signals, setSignals] = useState([
     { id: 1, type: 'momentum', asset: 'BTC/USDT', conf: 89, desc: 'Strong bullish divergence on 15m. Structure break confirmed.', agent: 'Hunter' },
     { id: 2, type: 'orderflow', asset: 'ETH/USDT', conf: 74, desc: 'Large bid wall absorption at 3450. Delta rising.', agent: 'Hunter' },
     { id: 3, type: 'volatility', asset: 'SOL/USDT', conf: 92, desc: 'Bollinger band squeeze expansion. Imminent directional move.', agent: 'Hunter' }
   ]);

   useEffect(() => {
     const interval = setInterval(() => {
        setData(prev => {
            const next = [...prev.slice(1)];
            const last = prev[prev.length - 1];
            next.push({
                time: 'Now',
                price: last.price + (Math.random() * 200 - 100),
                momentum: Math.random() * 100
            });
            return next;
        });
     }, 3000);
     return () => clearInterval(interval);
   }, []);

   return (
     <div className="flex-1 flex flex-col h-full bg-[#050505] relative z-10 overflow-hidden">
       <div className="p-6 border-b border-white/5 shrink-0 bg-black/40 backdrop-blur-md flex items-center justify-between">
         <div>
           <h2 className="text-lg font-bold text-white flex items-center gap-2 font-['Syne']">
             <Activity size={18} className="text-[#00FFB2]" />
             Signal Engine
           </h2>
           <p className="text-xs text-gray-500 font-mono mt-1">Live Market Data & Agent Sub-Tasks Analysis</p>
         </div>
       </div>

       <div className="flex-1 overflow-y-auto p-6 font-mono">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             
             {/* Main Chart Area */}
             <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col h-[400px]">
                   <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                         <h3 className="text-sm font-bold text-white">BTC/USDT</h3>
                         <span className="text-[10px] bg-[#00FFB2]/20 text-[#00FFB2] px-2 py-0.5 rounded">Binance</span>
                         <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded">15m</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-xs text-[#00FFB2]">+1.24%</span>
                        <span className="text-xs text-gray-400">Vol: 1.2B</span>
                      </div>
                   </div>
                   <div className="flex-1 min-h-0">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                           <XAxis dataKey="time" stroke="#333" fontSize={10} tickMargin={10} />
                           <YAxis stroke="#333" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => `${v.toFixed(0)}`} />
                           <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '10px' }} />
                           <Line type="monotone" dataKey="price" stroke="#00FFB2" strokeWidth={2} dot={false} />
                        </LineChart>
                     </ResponsiveContainer>
                   </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                   <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">Agent Raw Data Stream (Orderbook & Flow)</h3>
                   <div className="grid grid-cols-4 gap-4">
                      {['Imbalance', 'Funding', 'RSI Divergence', 'CVD'].map((metric, i) => (
                         <div key={i} className="bg-black/30 border border-white/5 rounded-lg p-3">
                            <div className="text-[9px] text-gray-500 mb-1">{metric}</div>
                            <div className="text-sm text-white font-bold">{Math.random() > 0.5 ? '+' : '-'}{(Math.random() * 5).toFixed(2)}</div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* Agent Signals List */}
             <div className="flex flex-col gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex-1 flex flex-col min-h-0">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                         <Target size={14} />
                         Hunter Agent Detections
                      </h3>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFB2] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFB2]"></span>
                      </span>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2">
                      {signals.map(s => (
                         <div key={s.id} className="bg-black/40 border border-white/5 rounded-lg p-4 hover:border-[#00FFB2]/30 transition-colors cursor-pointer group">
                            <div className="flex justify-between items-start mb-2">
                               <div className="flex gap-2 items-center">
                                  <span className={clsx(
                                     "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase",
                                     s.type === 'momentum' ? "bg-blue-500/20 text-blue-400" :
                                     s.type === 'orderflow' ? "bg-purple-500/20 text-purple-400" :
                                     "bg-amber-500/20 text-amber-400"
                                  )}>{s.type}</span>
                                  <span className="text-xs text-white font-bold">{s.asset}</span>
                               </div>
                               <span className={clsx("text-xs font-bold", s.conf > 85 ? "text-[#00FFB2]" : "text-amber-400")}>{s.conf}% CONF</span>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-relaxed mb-3">
                               {s.desc}
                            </p>
                            <button className="w-full py-1.5 bg-white/5 hover:bg-[#00FFB2]/10 border border-white/10 hover:border-[#00FFB2]/30 rounded text-[9px] text-[#00FFB2] font-bold uppercase transition-colors opacity-0 group-hover:opacity-100">
                               Send to Strategy Agent
                            </button>
                         </div>
                      ))}
                   </div>
                </div>
             </div>

          </div>
       </div>
     </div>
   );
}
