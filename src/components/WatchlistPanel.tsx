import { Plus, Trash2, LineChart, TrendingUp, TrendingDown } from "lucide-react";
import { GlassCard, Badge } from "./ui";

export function WatchlistPanel() {
  const assets = [
    { pair: "BTC/USDT", price: "64,230.50", change: "+4.2%", trend: "up", vol: "1.2B" },
    { pair: "ETH/USDT", price: "3,450.20", change: "+2.1%", trend: "up", vol: "850M" },
    { pair: "SOL/USDT", price: "145.60", change: "-1.5%", trend: "down", vol: "410M" },
    { pair: "AVAX/USDT", price: "24.15", change: "+0.5%", trend: "up", vol: "120M" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-mono text-nexus-accent mb-1 flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            WATCHLIST
          </h2>
          <p className="text-sm text-nexus-text/60">Live KuCoin polling (30s) & Volatility tracking</p>
        </div>
        <button className="px-3 py-1.5 font-mono text-xs bg-nexus-accent/20 text-nexus-accent border border-nexus-accent/50 rounded flex items-center gap-2 hover:bg-nexus-accent/30 transition-colors">
          <Plus className="w-3 h-3" />
          ADD ASSET
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {assets.map((asset, i) => (
          <GlassCard key={i} className="group hover:bg-white/5 transition-colors cursor-pointer relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-16 h-16 blur-2xl opacity-10 ${asset.trend === 'up' ? 'bg-nexus-accent' : 'bg-rose-500'}`}></div>
            <div className="flex justify-between items-start mb-2 relative z-10">
              <span className="font-mono font-bold text-gray-900 dark:text-white text-lg">{asset.pair}</span>
              <button className="text-nexus-text/30 hover:text-rose-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="font-mono text-2xl text-gray-900 dark:text-white mb-2 relative z-10">${asset.price}</div>
            <div className="flex justify-between items-center text-xs font-mono relative z-10">
              <span className={`flex items-center gap-1 ${asset.trend === 'up' ? 'text-nexus-accent' : 'text-rose-400'}`}>
                {asset.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {asset.change}
              </span>
              <span className="text-nexus-text/50">VOL: {asset.vol}</span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
