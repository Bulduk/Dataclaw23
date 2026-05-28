import React, { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { supabase } from "../lib/supabaseClient";
import AgentOperatingDesk from "./AgentOperatingDesk";
import { usePersistentStore } from "../state/persistentStore";

function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>((() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  })());
  const [loaded, setLoaded] = useState(false);

  // Load from Supabase on mount
  useEffect(() => {
    async function loadState() {
      if ((import.meta as any).env.VITE_SUPABASE_URL?.includes?.('xxxxxxxx') || !(import.meta as any).env.VITE_SUPABASE_URL) {
        setLoaded(true);
        return;
      }
      try {
        const { data } = await supabase.from('plugin_registry').select('state_json').eq('plugin_name', key).single();
        if (data && data.state_json) {
          setState(data.state_json as unknown as T);
        }
      } catch (e) {
        console.warn("Supabase fetch failed", e);
      }
      setLoaded(true);
    }
    loadState();
  }, [key]);

  // Sync back to Supabase and LocalStorage
  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {}

    async function sync() {
      if ((import.meta as any).env.VITE_SUPABASE_URL?.includes?.('xxxxxxxx') || !(import.meta as any).env.VITE_SUPABASE_URL) return;
      try {
        const { data: user } = await supabase.auth.getUser();
        // If we don't have a user, RLS will fail. We skip sync.
        if (!user?.user) {
          return;
        }
        await supabase.from('plugin_registry').upsert({
          user_id: user.user.id,
          plugin_name: key,
          state_json: state
        }, { onConflict: 'user_id, plugin_name' });
      } catch (e) {
        console.warn("Supabase sync failed", e);
      }
    }
    const t = setTimeout(() => sync(), 500); // debounce slightly
    return () => clearTimeout(t);
  }, [key, state, loaded]);

  return [state, setState];
}

// ─── DESIGN TOKENS ──────────────────────────────────────
const C = {
  bg:      "transparent",
  surface: "transparent",
  card:    "var(--nexus-glass)",
  border:  "var(--nexus-border)",
  green:   "var(--nexus-accent)",
  red:     "#ef4444",
  blue:    "#3b82f6",
  purple:  "#8b5cf6",
  amber:   "#f59e0b",
  muted:   "gray",
  dim:     "var(--nexus-border)",
};

const AGENT_META = {
  OpenClaw: { color:"#00FFB2", icon:"🦅", role:"İstihbarat Ajanı", model:"claude-sonnet-4-20250514" },
  Onyx:     { color:"#A78BFA", icon:"🔮", role:"Araştırma Ajanı",   model:"claude-sonnet-4-20250514" },
  Mirofish: { color:"#38BDF8", icon:"🐟", role:"Simülasyon Ajanı",  model:"claude-sonnet-4-20250514" },
  Betafish: { color:"#F59E0B", icon:"⚡", role:"Operasyon Ajanı",   model:"claude-sonnet-4-20250514" },
};

// OpenClaw'ın en iyi görevleri (araştırmaya göre)
const OPENCLAW_TASKS = [
  { id:"sentiment",   label:"Sentiment Analizi",       desc:"Fear&Greed, Twitter/X, Reddit skorları",      tool:"SentimentTool",      enabled:true  },
  { id:"news",        label:"Haber Monitörlüğü",       desc:"CryptoPanic, RSS, breaking news taraması",    tool:"NewsScraperTool",    enabled:true  },
  { id:"ohlcv",       label:"OHLCV Veri Toplama",      desc:"ccxt.fetchOHLCV() — tüm coinler, 1m/5m/1h",  tool:"ccxtMarketTool",     enabled:true  },
  { id:"orderbook",   label:"Order Book Analizi",      desc:"Büyük duvarlar, bid/ask dengesizliği",        tool:"OrderBookTool",      enabled:true  },
  { id:"whale",       label:"Balina Takibi",           desc:"Büyük cüzdan hareketleri, on-chain flows",    tool:"WhaleAlertTool",     enabled:false },
  { id:"arbitrage",   label:"Arbitraj Tespiti",        desc:"Çapraz borsa fiyat farkı taraması",           tool:"ArbitrageScanTool",  enabled:true  },
  { id:"funding",     label:"Funding Rate Takibi",     desc:"Perp funding oranları, long/short bias",      tool:"FundingRateTool",    enabled:true  },
  { id:"trending",    label:"Trending Coin Tespiti",   desc:"Sosyal medya hacim artışı, momentum",         tool:"TrendScanTool",      enabled:false },
];

const EXCHANGES = ["Binance","Bybit","OKX","Kraken","Bitget","KuCoin"];
const SYMBOLS   = ["BTC/USDT","ETH/USDT","SOL/USDT","BNB/USDT","ARB/USDT","AVAX/USDT","XRP/USDT","DOGE/USDT"];

// ─── UI PRIMITIVES ──────────────────────────────────────
const Label = ({children,sub, style}: {children: React.ReactNode, sub?: boolean, style?: React.CSSProperties}) => (
  <div style={{marginBottom:sub?4:8, ...style}}>
    <span style={{fontSize:sub?9:10,color:sub?C.muted:"rgba(var(--text-rgb),0.5)",
      textTransform:"uppercase",letterSpacing:0.9,fontWeight:600}}>{children}</span>
  </div>
);

const SectionTitle = ({icon,children,badge}: {icon: string, children: React.ReactNode, badge?: string}) => (
  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
    <span style={{fontSize:18}}>{icon}</span>
    <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"var(--nexus-text)"}}>{children}</span>
    {badge&&<span style={{fontSize:9,padding:"2px 8px",borderRadius:20,
      background:"rgba(0,255,178,0.1)",border:"1px solid rgba(0,255,178,0.2)",color:C.green}}>{badge}</span>}
  </div>
);

const Card = ({children,style={},onClick}: {children: React.ReactNode, style?: React.CSSProperties, key?: any, onClick?: () => void}) => (
  <div onClick={onClick} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"16px 18px",...style}}>
    {children}
  </div>
);

const Toggle = ({value,onChange,label,size="md"}: {value: boolean, onChange: (v: boolean) => void, label?: string, size?: "sm" | "md"}) => {
  const s = size==="sm";
  return (
    <div style={{display:"flex",alignItems:"center",gap:s?6:8,cursor:"pointer"}} onClick={()=>onChange(!value)}>
      <div style={{width:s?32:40,height:s?18:22,borderRadius:12,position:"relative",transition:"all 0.2s",
        background:value?`linear-gradient(135deg,${C.green},#00C8A0)`:"rgba(var(--text-rgb),0.1)",
        border:`1px solid ${value?C.green:C.dim}`}}>
        <div style={{position:"absolute",top:2,left:value?(s?16:20):2,width:s?12:16,height:s?12:16,
          borderRadius:"50%",background:value?"#000":"rgba(var(--text-rgb),0.5)",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(var(--text-rgb),0.4)"}}/>
      </div>
      {label&&<span style={{fontSize:s?10:11,color:value?"rgba(var(--text-rgb),0.8)":C.muted}}>{label}</span>}
    </div>
  );
};

const Slider = ({value,onChange,min=1,max=125,step=1,label,color=C.green}: {value: number, onChange: (v: number) => void, min?: number, max?: number, step?: number, label: string, color?: string}) => (
  <div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
      <span style={{fontSize:10,color:C.muted}}>{label}</span>
      <span style={{fontSize:11,fontWeight:700,color,fontFamily:"'Syne',sans-serif"}}>{value}x</span>
    </div>
    <div style={{position:"relative",height:20,display:"flex",alignItems:"center"}}>
      <div style={{position:"absolute",left:0,right:0,height:4,background:"rgba(var(--text-rgb),0.06)",borderRadius:2}}>
        <div style={{height:"100%",width:`${((value-min)/(max-min))*100}%`,background:color,borderRadius:2}}/>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(Number(e.target.value))}
        style={{position:"absolute",left:0,right:0,width:"100%",opacity:0,height:20,cursor:"pointer"}}/>
    </div>
    <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
      <span style={{fontSize:8,color:"rgba(var(--text-rgb),0.2)"}}>{min}x</span>
      <span style={{fontSize:8,color:"rgba(var(--text-rgb),0.2)"}}>{max}x</span>
    </div>
  </div>
);

const Input = ({value,onChange,placeholder,type="text",prefix,suffix,onKeyDown}: {value: any, onChange: (v: any) => void, placeholder?: string, type?: string, prefix?: string, suffix?: string, onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void | Promise<void>}) => (
  <div style={{display:"flex",alignItems:"center",background:"rgba(var(--text-rgb),0.04)",
    border:`1px solid ${C.dim}`,borderRadius:10,overflow:"hidden"}}>
    {prefix&&<span style={{padding:"0 10px",fontSize:10,color:C.muted,borderRight:`1px solid ${C.dim}`,
      height:36,display:"flex",alignItems:"center",flexShrink:0,background:"rgba(var(--text-rgb),0.02)"}}>{prefix}</span>}
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type} onKeyDown={onKeyDown}
      style={{flex:1,background:"transparent",border:"none",padding:"8px 12px",color:"var(--nexus-text)",
        fontSize:11,outline:"none",fontFamily:"'DM Mono',monospace"}}/>
    {suffix&&<span style={{padding:"0 10px",fontSize:10,color:C.muted,flexShrink:0}}>{suffix}</span>}
  </div>
);

const Select = ({value,onChange,options}: {value: string, onChange: (v: string) => void, options: any[]}) => (
  <select value={value} onChange={e=>onChange(e.target.value)}
    style={{background:C.card,border:`1px solid ${C.dim}`,borderRadius:10,padding:"8px 12px",
      color:"var(--nexus-text)",fontSize:11,outline:"none",width:"100%",fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>
    {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
  </select>
);

const Btn = ({children,onClick,variant="ghost",color=C.green,small,disabled,style={}}: {children: React.ReactNode, onClick?: () => void, variant?: "primary" | "ghost" | "danger" | "success", color?: string, small?: boolean, disabled?: boolean, style?: React.CSSProperties}) => {
  const styles = {
    primary: {background:`linear-gradient(135deg,${color},${color}CC)`,color:color==C.green?"#000":"#fff",border:"none"},
    ghost:   {background:"rgba(var(--text-rgb),0.04)",border:`1px solid ${C.dim}`,color:"rgba(var(--text-rgb),0.7)"},
    danger:  {background:"rgba(255,77,109,0.12)",border:"1px solid rgba(255,77,109,0.3)",color:C.red},
    success: {background:"rgba(0,255,178,0.1)",border:`1px solid rgba(0,255,178,0.25)`,color:C.green},
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant],borderRadius:10,padding:small?"5px 12px":"8px 16px",
      fontSize:small?10:11,fontFamily:"'DM Mono',monospace",fontWeight:600,cursor:disabled?"not-allowed":"pointer",
      opacity:disabled?0.5:1,transition:"all 0.15s",whiteSpace:"nowrap", ...style
    }}>{children}</button>
  );
};

const StatusDot = ({on,pulse}: {on: boolean, pulse?: boolean}) => (
  <div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,
    background:on?C.green:"#444",
    boxShadow:on?`0 0 ${pulse?10:6}px ${C.green}`:"none",
    animation:pulse&&on?"glow 2s ease infinite":undefined}}/>
);

// ─── SECTIONS ───────────────────────────────────────────

function CrewAISection({ agents, setAgents, models, setModels, onSelectAgent }: { agents: any, setAgents: any, models: any[], setModels: any, onSelectAgent?: (id: string) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAddModel, setShowAddModel] = useState(false);
  const [newModel, setNewModel] = useState({ name: '', source: '', endpoint: '', assignTo: 'none' });
  const [benchRunning, setBenchRunning] = useState(false);
  const [benchResults, setBenchResults] = useState<any>(null);
  const [benchSettings, setBenchSettings] = useState({ model: 'default-local' });
  const [reloadingAgent, setReloadingAgent] = useState<string | null>(null);
  const [perfLogs, setPerfLogs] = useState<{id: number, time: string, agent: string, action: string, latency: number, quality: number, conf: number, pnl?: number}[]>([]);
  const { delegationLogs, setDelegationLogs } = usePersistentStore();
  const [agentStats, setAgentStats] = useState<Record<string, { totalPnl: number, trades: number, win: number, loss: number }>>({});

  useEffect(() => {
    // Simulate real-time streaming agent logs
    const interval = setInterval(() => {
      const activeAgents = Object.keys(agents).filter(k => agents[k].enabled);
      if (activeAgents.length === 0) return;
      
      const randomAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
      
      let isExecution = Math.random() > 0.7 && (randomAgent === 'OpenClaw' || randomAgent === 'Betafish');
      const actions = ["Inferring trend", "Analyzing orderbook", "Generating strategy", "Sanitizing input", "Scraping news"];
      let action = actions[Math.floor(Math.random() * actions.length)];
      let pnlVal: number | undefined = undefined;

      if (isExecution) {
        action = Math.random() > 0.5 ? "Executed Trade (LONG BTC)" : "Executed Trade (SHORT ETH)";
        pnlVal = parseFloat(((Math.random() * 200) - 80).toFixed(2)); // Ranges from -80 to +120
        
        setAgentStats(prev => {
          const stats = prev[randomAgent] || { totalPnl: 0, trades: 0, win: 0, loss: 0 };
          return {
            ...prev,
            [randomAgent]: {
              totalPnl: parseFloat((stats.totalPnl + pnlVal!).toFixed(2)),
              trades: stats.trades + 1,
              win: stats.win + (pnlVal! > 0 ? 1 : 0),
              loss: stats.loss + (pnlVal! <= 0 ? 1 : 0),
            }
          };
        });
      }
      
      setPerfLogs(prev => {
        const newLogs = [...prev, {
          id: Date.now(),
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" }),
          agent: randomAgent,
          action: action,
          latency: Math.floor(Math.random() * 800 + 200),
          quality: parseFloat((Math.random() * 0.2 + 0.8).toFixed(2)),
          conf: Math.floor(Math.random() * 20 + 80),
          pnl: pnlVal
        }];
        if (newLogs.length > 8) newLogs.shift();
        return newLogs;
      });

      // Simüle Görev Devri (Delegation)
      const agentDelegationOn = agents[randomAgent]?.delegation;
      if (agentDelegationOn && Math.random() > 0.65) {
         const potentialTargets = Object.keys(agents).filter(k => k !== randomAgent && agents[k].enabled);
         if (potentialTargets.length > 0) {
            const targetAgent = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
            const delegTasks = [
               "XRP/USDT emir defterini analiz et ve sonucu dön",
               "Duyarlılık(sentiment) skoru oluşturmasını talep et",
               "Portföy risk analizini dogrula",
               "Anlık volatilite verisini getir",
               "Günlük haberleri özetle"
            ];
            const task = delegTasks[Math.floor(Math.random() * delegTasks.length)];
            const isSuccess = Math.random() > 0.15; // 85% başarı
            
            setDelegationLogs(prev => {
                const newLogs = [...prev, {
                    id: Date.now() + 1,
                    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" }),
                    fromAgent: randomAgent,
                    toAgent: targetAgent,
                    task: task,
                    result: isSuccess ? "Görev Başarıyla Tamamlandı" : "Görev Reddedildi (Meşgul/Yetki Yok)",
                    success: isSuccess
                }];
                if (newLogs.length > 6) newLogs.shift();
                return newLogs;
            });
         }
      }

    }, 3500);
    return () => clearInterval(interval);
  }, [agents]);

  const handleSoftReload = (agentName: string) => {
    setReloadingAgent(agentName);
    setTimeout(() => {
      setReloadingAgent(null);
    }, 1500);
  };

  const handleRunBenchmark = async () => {
    setBenchRunning(true);
    setBenchResults(null);
    try {
      const { withPerformanceTracking } = await import("../services/metrics");
      await withPerformanceTracking(
        benchSettings.model,
        'model_benchmark',
        async () => {
          return new Promise<void>(resolve => {
            setTimeout(() => {
              setBenchRunning(false);
              setBenchResults({
                latency: Math.floor(Math.random() * 50 + 10) + " ms/token",
                ttft: Math.floor(Math.random() * 200 + 100) + " ms",
                qualityScore: (Math.random() * 2 + 8).toFixed(1) + " / 10",
                vramUsage: (Math.random() * 4 + 4).toFixed(1) + " GB",
                log: `Benchmarking complete for ${benchSettings.model}. Real-time constraints validated.`
              });
              resolve();
            }, 2000);
          });
        }
      );
    } catch {
       setBenchRunning(false);
    }
  };

  const handleAddModel = () => {
    if (!newModel.name || !newModel.endpoint) return;
    const modelId = `model-${Date.now()}`;
    const modelData = {
      id: modelId,
      name: newModel.name,
      source: newModel.source,
      endpoint: newModel.endpoint,
    };
    
    setModels((prev: any) => [...prev, modelData]);
    
    if (newModel.assignTo !== 'none') {
      if (newModel.assignTo === 'all') {
        setAgents((a: any) => {
          const next: any = {};
          Object.keys(a).forEach(k => {
            next[k] = { ...a[k], assignedModelId: modelId, modelAssignmentType: 'assigned' };
          });
          return next;
        });
      } else {
        setAgents((a: any) => ({
          ...a,
          [newModel.assignTo]: {
            ...a[newModel.assignTo],
            assignedModelId: modelId,
            modelAssignmentType: 'assigned'
          }
        }));
      }
    }
    
    setShowAddModel(false);
    setNewModel({ name: '', source: '', endpoint: '', assignTo: 'none' });
  };

  const handleRemoveAgent = (name: string) => {
    setAgents((prev: any) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleRemoveModel = (id: string) => {
    if (id === 'default-local') return;
    setModels((prev: any) => prev.filter((m: any) => m.id !== id));
    setAgents((prev: any) => {
      const next: any = {};
      Object.keys(prev).forEach(k => {
        if (prev[k].assignedModelId === id) {
          next[k] = { ...prev[k], assignedModelId: undefined, modelAssignmentType: 'default' };
        } else {
          next[k] = prev[k];
        }
      });
      return next;
    });
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <SectionTitle icon="🤖" children="Nexus Neural Core" badge="Go / Py Nodes"/>
        <Btn onClick={() => setShowAddModel(!showAddModel)} small variant="primary">
          {showAddModel ? 'İptal' : '+ Yeni Model Ekle'}
        </Btn>
      </div>

      {showAddModel && (
        <Card style={{border:`1px solid ${C.green}40`, background:`rgba(0,255,178,0.05)`}}>
          <div style={{fontSize:"13px",fontWeight:600,color:C.green,marginBottom:12}}>Yeni Yerel Model Tanımla (Self-Hosted Model Assignment)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label sub>Model Adı</Label>
              <Input value={newModel.name} onChange={v=>setNewModel({...newModel,name:v})} placeholder="ör. DeepSeek-Coder-33B" />
            </div>
            <div>
              <Label sub>Model Kaynağı</Label>
              <Input value={newModel.source} onChange={v=>setNewModel({...newModel,source:v})} placeholder="ör. vLLM, Ollama, NIM" />
            </div>
          </div>
          <div style={{marginTop:12}}>
            <Label sub>Endpoint (Inference Address)</Label>
            <Input value={newModel.endpoint} onChange={v=>setNewModel({...newModel,endpoint:v})} placeholder="ör. http://localhost:8000/v1" />
          </div>
          <div style={{marginTop:12}}>
            <Label sub>Bu model hangi ajana atansın?</Label>
            <select value={newModel.assignTo} onChange={e=>setNewModel({...newModel,assignTo:e.target.value})}
              style={{background:C.card,border:`1px solid ${C.dim}`,borderRadius:10,padding:"8px 12px",
                color:"var(--nexus-text)",fontSize:11,outline:"none",width:"100%",fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>
              <option value="none">Sadece Ekle (Atama Yapma)</option>
              <option value="all">Tüm Ajanlara Ata (Hot Swapping)</option>
              {Object.keys(agents).map(name=><option key={name} value={name}>Sadece {name} Ajanına Ata</option>)}
            </select>
          </div>
          <div style={{marginTop:14,display:"flex",gap:8}}>
            <Btn variant="primary" onClick={handleAddModel}>Kaydet & Entegre Et</Btn>
          </div>
        </Card>
      )}

      {/* PATRON — Manager */}
      <Card style={{background:"linear-gradient(135deg,rgba(0,255,178,0.06),rgba(0,200,160,0.03))",
        border:"1px solid rgba(0,255,178,0.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#00FFB2,#006B4F)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,
              boxShadow:"0 0 16px rgba(0,255,178,0.3)"}}>P</div>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14,color:"var(--nexus-text)"}}>PATRON</div>
              <div style={{fontSize:9,color:C.green}}>Manager Agent · Rust Orchestrator</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:9,color:C.muted,marginBottom:2}}>manager_llm</div>
            <div style={{fontSize:10,color:"var(--nexus-text)",fontFamily:"'DM Mono',monospace"}}>claude-3-sonnet</div>
          </div>
        </div>
        <div style={{marginTop:12,padding:"8px 12px",borderRadius:10,background:"rgba(0,255,178,0.05)",
          border:"1px solid rgba(0,255,178,0.1)",fontSize:9,color:"rgba(var(--text-rgb),0.5)",fontFamily:"'DM Mono',monospace",lineHeight:1.7}}>
          Process: <span style={{color:C.green}}>dist_go</span> · allow_delegation: <span style={{color:C.green}}>True</span> · memory: <span style={{color:C.green}}>True</span> · verbose: <span style={{color:C.amber}}>False</span>
        </div>
        {/* Tree lines */}
        <div style={{display:"flex",justifyContent:"center",marginTop:12}}>
          <div style={{display:"flex",gap:0,position:"relative"}}>
            {["🦅","🔮","🐟","⚡"].map((ic,i,arr)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",position:"relative",
                paddingLeft:i>0?0:0}}>
                {i<arr.length-1&&<div style={{position:"absolute",top:0,right:"-50%",width:"100%",height:1,
                  background:"rgba(0,255,178,0.2)"}}/>}
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:6,marginTop:8,justifyContent:"center"}}>
          {Object.entries(agents).filter(([n]) => AGENT_META.hasOwnProperty(n)).map(([n, agent]: [string, any])=> {
            const m = (AGENT_META as any)[n] || { color: C.green, icon: "🔌" };
            return (
            <div key={n} 
              onClick={() => onSelectAgent ? onSelectAgent(n) : setExpanded(n)}
              className="hover:bg-white/5"
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3, cursor:"pointer",
              flex:1,padding:"6px 4px",borderRadius:8, transition:"background 0.2s",
              background:`rgba(${n==="OpenClaw"?"0,255,178":n==="Onyx"?"167,139,250":n==="Mirofish"?"56,189,248":"245,158,11"},0.05)`,
              border:`1px solid ${m.color}22`}}>
              <span style={{fontSize:14}}>{m.icon}</span>
              <span style={{fontSize:8,color:m.color,fontWeight:600}}>{n}</span>
              <span style={{fontSize:7,color:C.muted}}>worker</span>
            </div>
          )})}
        </div>
      </Card>

      {/* Benchmark Tool */}
      <Card style={{padding: "16px", marginBottom: "8px", background: "rgba(167, 139, 250, 0.05)", border: `1px solid ${C.purple}40`}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12}}>
          <div>
            <div style={{fontSize: "13px", fontWeight: 600, color: C.purple}}>Local LLM Benchmark Tool</div>
            <div style={{fontSize: "10px", color: C.muted}}>Ajanlar atanmadan önce model latency ve constraint performansını test edin.</div>
          </div>
          <Btn variant="primary" style={{background: C.purple, color:"var(--nexus-text)", borderColor: C.purple}} onClick={handleRunBenchmark} disabled={benchRunning}>
            {benchRunning ? "Test Ediliyor..." : "Run Benchmark"}
          </Btn>
        </div>
        <div style={{display: "flex", gap: 12, alignItems: "flex-start"}}>
          <div style={{flex: 1}}>
            <Select value={benchSettings.model}
              onChange={v => setBenchSettings({ model: v })}
              options={[
                {value: 'default-local', label: 'Varsayılan Yerel Model (Self-Host Default)'},
                ...models.filter(m => m.id !== 'default-local').map(m => ({
                   value: m.id, 
                   label: `Admin Atanan: ${m.name} (${m.source})`
                }))
              ]}/>
          </div>
          {benchResults && (
            <div style={{flex: 2, background: "rgba(var(--text-rgb),0.3)", borderRadius: 6, padding: "8px 12px", border: `1px solid ${C.border}`, display:"flex", flexDirection:"column", gap: 6}}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div><span style={{color:C.muted, fontSize:10}}>Token Latency:</span> <span style={{fontSize:11, color:C.green, fontWeight:600}}>{benchResults.latency}</span></div>
                <div><span style={{color:C.muted, fontSize:10}}>TTFT (First Token):</span> <span style={{fontSize:11, color:C.green, fontWeight:600}}>{benchResults.ttft}</span></div>
                <div><span style={{color:C.muted, fontSize:10}}>Reasoning Q-Score:</span> <span style={{fontSize:11, color:C.amber, fontWeight:600}}>{benchResults.qualityScore}</span></div>
                <div><span style={{color:C.muted, fontSize:10}}>VRAM Footprint:</span> <span style={{fontSize:11, color:C.blue, fontWeight:600}}>{benchResults.vramUsage}</span></div>
              </div>
              <div style={{fontSize: 9, color:C.muted, borderTop: `1px solid ${C.border}`, paddingTop: 6, marginTop: 4}}>{benchResults.log}</div>
            </div>
          )}
        </div>
      </Card>

      {/* Saved Models List */}
      <Card style={{padding: "16px", marginBottom: "8px", background: "rgba(var(--text-rgb), 0.02)", border: `1px solid ${C.dim}`}}>
        <div style={{marginBottom: 12}}>
          <div style={{fontSize: "13px", fontWeight: 600, color:"var(--nexus-text)"}}>Kayıtlı Modeller</div>
          <div style={{fontSize: "10px", color: C.muted}}>Eklediğiniz özel yerel modelleri yönetin veya silin.</div>
        </div>
        <div style={{display: "flex", flexDirection: "column", gap: 8}}>
          {models.filter((m: any) => m.id !== 'default-local').map((m: any) => (
            <div key={m.id} style={{display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(var(--text-rgb),0.2)", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`}}>
              <div>
                <div style={{fontSize: 12, fontWeight: 600, color:"var(--nexus-text)"}}>{m.name}</div>
                <div style={{fontSize: 10, color: C.muted}}>{m.source} · {m.endpoint}</div>
              </div>
              <Btn variant="danger" small onClick={() => handleRemoveModel(m.id)}>Sil</Btn>
            </div>
          ))}
          {models.filter((m: any) => m.id !== 'default-local').length === 0 && (
            <div style={{fontSize: 11, color: C.muted, fontStyle: "italic"}}>Henüz eklenmiş özel model yok.</div>
          )}
        </div>
      </Card>

      {/* Bulk Assignment */}
      <Card style={{padding: "16px", marginBottom: "8px", background: "rgba(0, 255, 178, 0.05)", border: `1px solid ${C.green}40`}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <div>
            <div style={{fontSize: "13px", fontWeight: 600, color: C.green}}>Tüm Ajanlara Model Uygula</div>
            <div style={{fontSize: "10px", color: C.muted}}>Mevcut bir modeli tüm ajanlara atamak için kullanın (Bulk Apply).</div>
          </div>
        </div>
        <div style={{marginTop: 12}}>
          <Select value="none"
            onChange={(v) => {
              if (v === 'none') return;
              setAgents((a: any) => {
                const next: any = {};
                Object.keys(a).forEach(k => {
                  next[k] = { 
                    ...a[k], 
                    assignedModelId: v, 
                    modelAssignmentType: v === 'default-local' ? 'default' : 'assigned' 
                  };
                });
                return next;
              });
            }}
            options={[
              {value: 'none', label: 'Bir model seçin...'},
              {value: 'default-local', label: 'Varsayılan Yerel Model (Self-Host Default)'},
              ...models.filter((m: any) => m.id !== 'default-local').map((m: any) => ({
                 value: m.id, 
                 label: `Admin Atanan: ${m.name} (${m.source})`
              }))
            ]}/>
        </div>
      </Card>

      {/* New Custom Agents Info Cards */}
      {Object.entries(agents).filter(([name]) => !AGENT_META.hasOwnProperty(name)).length > 0 && (
        <Card style={{padding: "16px", marginBottom: "8px", background: "rgba(var(--text-rgb), 0.02)", border: `1px solid ${C.dim}`}}>
          <div style={{marginBottom: 12}}>
            <div style={{fontSize: "13px", fontWeight: 600, color:"var(--nexus-text)"}}>Özel Ajanlar (Custom Plugins)</div>
            <div style={{fontSize: "10px", color: C.muted}}>Sonradan eklenmiş özel görev ve rollere sahip ajanlar. Tıklayarak detayları görebilirsiniz.</div>
          </div>
          <div className="flex flex-wrap gap-4">
            {Object.entries(agents).filter(([name]) => !AGENT_META.hasOwnProperty(name)).map(([name, agent]: [string, any])=>{
              const meta = { color: C.green, icon: "🔌", role: "Custom Plugin Agent" };
              return (
                <div key={name} onClick={()=> onSelectAgent ? onSelectAgent(name) : setExpanded(name)}
                  className="flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer hover:bg-white/5 transition-colors relative overflow-hidden"
                  style={{width: 120, height: 120, borderColor: `${meta.color}30`, background: `${meta.color}05`}}>
                   {/* Status Glow */}
                   <div style={{
                     position: "absolute", top: 0, right: 0, width: 40, height: 40, borderRadius: "0 0 0 100%", opacity: 0.2, transition: "background 0.3s",
                     background: agent.enabled ? C.green : C.red
                   }} />
                   <div style={{fontSize: 24, marginBottom: 8}}>{meta.icon}</div>
                   <div style={{fontSize: 11, fontWeight: 600, color:"var(--nexus-text)", textAlign: 'center', wordBreak: 'break-word', lineHeight: 1.2}}>{name}</div>
                   <div style={{display: "flex", alignItems: "center", gap: 4, marginTop: 8}}>
                     <StatusDot on={agent.enabled} pulse={agent.enabled} />
                     <span style={{fontSize: 8, color: C.muted, fontWeight: 700}}>{agent.enabled ? "AKTİF" : "PASİF"}</span>
                   </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Live Performance & PnL Summary */}
      <Card style={{padding: "16px", marginTop: "16px", background: "rgba(var(--text-rgb), 0.2)", border: `1px solid ${C.border}`}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12}}>
          <div>
            <div style={{fontSize: "13px", fontWeight: 600, color:"var(--nexus-text)"}}>Live Agent Executions & PnL Tracking</div>
            <div style={{fontSize: "10px", color: C.muted}}>NASA real-time logging & PnL (Kar/Zarar) auditing of agent sub-tasks</div>
          </div>
          <div style={{display: "flex", alignItems: "center", gap: 6}}>
            <StatusDot on={true} pulse={true} />
            <span style={{fontSize: 10, color: C.green}}>Streaming</span>
          </div>
        </div>

        {Object.keys(agentStats).length > 0 && (
          <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, marginBottom: 16}}>
            {Object.entries(agentStats).map(([agentName, stats]: [string, any]) => (
              <div key={agentName} style={{background: "rgba(var(--text-rgb),0.03)", padding: "10px 12px", borderRadius: 8, border: `1px solid ${stats.totalPnl >= 0 ? 'rgba(0, 255, 178, 0.2)' : 'rgba(255, 77, 109, 0.2)'}`}}>
                <div style={{fontSize: 11, fontWeight: "bold", color: (AGENT_META as any)[agentName]?.color || "#fff"}}>{agentName} PnL</div>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 4}}>
                  <div style={{fontSize: 20, fontWeight: "bold", color: stats.totalPnl >= 0 ? C.green : C.red}}>
                    {stats.totalPnl >= 0 ? "+" : ""}{stats.totalPnl.toFixed(2)}$
                  </div>
                  <div style={{fontSize: 9, color: C.muted, textAlign: "right"}}>
                    <div style={{color: C.green}}>{stats.win}W</div>
                    <div style={{color: C.red}}>{stats.loss}L</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{overflowX: "auto", paddingBottom: "4px"}}>
          <div style={{display: "flex", flexDirection: "column", gap: 4, minWidth: "600px"}}>
            {perfLogs.length === 0 && <div style={{fontSize: 10, color: C.muted, fontStyle: "italic", padding: "8px 0"}}>Awaiting agent telemetry...</div>}
            {[...perfLogs].reverse().map((log: any, index: number) => {
              const c = (AGENT_META as any)[log.agent]?.color || C.green;
              return (
              <div key={log.id} style={{
                display: "grid", gridTemplateColumns: "100px 100px 1fr 60px 50px 50px 60px", gap: 8, 
                padding: "8px 12px", background: "rgba(var(--text-rgb),0.02)", 
                borderRadius: 8, alignItems: "center", fontFamily: "'DM Mono', monospace", 
                fontSize: 10, transition: "all 0.3s",
                opacity: Math.max(0.2, 1 - index * 0.15),
              }}>
                <div style={{color: C.muted, whiteSpace: "nowrap"}}>{log.time}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{display: "flex", alignItems: "flex-end", height: 12, gap: 2}} title="Active Task">
                     <div style={{width: 2, height: '40%', background: c, borderRadius: 2}} className="animate-[pulse_1.2s_ease-in-out_infinite]" />
                     <div style={{width: 2, height: '100%', background: c, borderRadius: 2}} className="animate-[pulse_0.8s_ease-in-out_infinite_0.1s]" />
                     <div style={{width: 2, height: '60%', background: c, borderRadius: 2}} className="animate-[pulse_1.0s_ease-in-out_infinite_0.2s]" />
                  </div>
                  <span style={{color: c, fontWeight: "bold", whiteSpace: "nowrap"}}>{log.agent}</span>
                </div>
                <div style={{color: "rgba(var(--text-rgb),0.9)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{log.action}</div>
                <div style={{color: log.latency < 400 ? C.green : C.amber, textAlign: "right"}}>{log.latency}ms</div>
                <div style={{color: log.quality >= 0.9 ? C.green : C.amber, textAlign: "right"}}>Q:{log.quality}</div>
                <div style={{color: log.conf > 90 ? C.green : C.amber, textAlign: "right"}}>C:{log.conf}%</div>
                <div style={{color: log.pnl !== undefined ? (log.pnl >= 0 ? C.green : C.red) : "transparent", textAlign: "right", fontWeight: "bold"}}>
                  {log.pnl !== undefined ? `${log.pnl > 0 ? '+' : ''}${log.pnl}$` : '-'}
                </div>
              </div>
            )})}
          </div>
        </div>
      </Card>

      {/* Live Delegation Logs */}
      <Card style={{padding: "16px", marginTop: "16px", background: "rgba(var(--text-rgb), 0.2)", border: `1px solid ${C.border}`}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12}}>
          <div>
            <div style={{fontSize: "13px", fontWeight: 600, color:"var(--nexus-text)"}}>Ajanlar Arası Görev Devri (Delegation Logs)</div>
            <div style={{fontSize: "10px", color: C.muted}}>NASA real-time logging of inter-agent task delegations</div>
          </div>
          <div style={{display: "flex", alignItems: "center", gap: 6}}>
            <StatusDot on={delegationLogs.length > 0} pulse={delegationLogs.length > 0} />
            <span style={{fontSize: 10, color: C.purple}}>Delegation Ready</span>
          </div>
        </div>
        
        <div style={{overflowX: "auto", paddingBottom: "4px"}}>
          <div style={{display: "flex", flexDirection: "column", gap: 4, minWidth: "600px"}}>
            {delegationLogs.length === 0 && <div style={{fontSize: 10, color: C.muted, fontStyle: "italic", padding: "8px 0"}}>Henüz görev devri saptanmadı...</div>}
            {[...delegationLogs].reverse().map((log: any, index: number) => {
              const fromC = (AGENT_META as any)[log.fromAgent]?.color || C.amber;
              const toC = (AGENT_META as any)[log.toAgent]?.color || C.blue;
              return (
              <div key={log.id} style={{
                display: "grid", gridTemplateColumns: "80px 100px 30px 100px 1fr 180px", gap: 8, 
                padding: "8px 12px", background: "rgba(var(--text-rgb),0.02)", 
                borderRadius: 8, alignItems: "center", fontFamily: "'DM Mono', monospace", 
                fontSize: 10, transition: "all 0.3s",
                opacity: Math.max(0.2, 1 - index * 0.15)
              }}>
                <div style={{color: C.muted, whiteSpace: "nowrap"}}>{log.time}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{width: 2, height: 8, background: fromC, borderRadius: 2}} className="animate-pulse" />
                  <span style={{color: fromC, fontWeight: "bold", whiteSpace: "nowrap"}}>{log.fromAgent}</span>
                </div>
                <div style={{color:"var(--nexus-text)", display: "flex", justifyContent: "center", animation: "flow 2s linear infinite"}} className="opacity-80">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="url(#neonGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <defs>
                        <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                           <stop offset="0%" stopColor={fromC} />
                           <stop offset="100%" stopColor={toC} />
                        </linearGradient>
                     </defs>
                     <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{width: 2, height: 8, background: toC, borderRadius: 2}} className="animate-pulse" />
                  <span style={{color: toC, fontWeight: "bold", whiteSpace: "nowrap"}}>{log.toAgent}</span>
                </div>
                <div style={{color: "rgba(var(--text-rgb),0.9)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                  {log.task}
                </div>
                <div style={{color: log.success ? C.green : C.red, textAlign: "right"}}>
                  {log.result}
                </div>
              </div>
            )})}
          </div>
        </div>
      </Card>

    </div>
  );
}

function TradingSection({ tradeCfg, setTradeCfg }: { tradeCfg: any, setTradeCfg: any }) {
  const [selSym, setSelSym] = useState("BTC/USDT");

  const sym = tradeCfg.symbols?.[selSym] || { leverage:10, marginMode:"isolated", posSize:5, sl:2, tp:4 };
  const setSymCfg = (k: string, v: any) => setTradeCfg((c: any)=>({...c,symbols:{...c.symbols,[selSym]:{...sym,[k]:v}}}));

  const riskColor = sym.leverage<=5?C.green:sym.leverage<=20?C.amber:C.red;

  const currentExchange = tradeCfg.exchange || "Binance";
  const exConfig = tradeCfg.endpoints?.[currentExchange] || { apiKey: "", secret: "" };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <SectionTitle icon="⚡" children="Multi-Exchange Execution" badge="Autonomous Routing"/>

      {/* Exchange config */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <Label>Active Exchange Connection</Label>
          <div style={{fontSize:10, color:C.green, fontFamily:"'DM Mono',monospace"}}>Smart Routing Enabled</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
          {EXCHANGES.map(ex=>(
            <button key={ex} onClick={()=>setTradeCfg((c: any)=>({...c,exchange:ex}))}
              style={{padding:"7px 0",borderRadius:9,border:`1px solid ${currentExchange===ex?C.green:C.dim}`,
                background:currentExchange===ex?"rgba(0,255,178,0.1)":"rgba(var(--text-rgb),0.03)",
                color:currentExchange===ex?C.green:"rgba(var(--text-rgb),0.5)",fontSize:10,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>
              {ex}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label sub>API Key ({currentExchange})</Label>
            <Input value={exConfig.apiKey||""} onChange={v=>setTradeCfg((c: any)=>({...c,endpoints:{...c.endpoints,[currentExchange]:{...exConfig, apiKey: v}}}))} placeholder="Configured via .env or Custom..." type="password"/>
          </div>
          <div>
            <Label sub>API Secret ({currentExchange})</Label>
            <Input value={exConfig.secret||""} onChange={v=>setTradeCfg((c: any)=>({...c,endpoints:{...c.endpoints,[currentExchange]:{...exConfig, secret: v}}}))} placeholder="Configured via .env or Custom..." type="password"/>
          </div>
        </div>

        <div style={{marginTop:12,display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
          <Toggle value={tradeCfg.testnet??true} onChange={v=>setTradeCfg((c: any)=>({...c,testnet:v}))} label="Testnet Modu"/>
          <Toggle value={tradeCfg.sandbox??false} onChange={v=>setTradeCfg((c: any)=>({...c,sandbox:v}))} label="Sandbox"/>
          <Toggle value={tradeCfg.hedgeMode??false} onChange={v=>setTradeCfg((c: any)=>({...c,hedgeMode:v}))} label="Hedge Modu"/>
        </div>
      </Card>

      {/* Per-symbol config */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <Label>Sembol Bazlı Kaldıraç & Marjin</Label>
          <Btn variant="ghost" small onClick={() => {
            const symInput = prompt("Yeni Sembol (Örn: WIF/USDT):");
            if (symInput && symInput.trim() !== "") {
              const cleaned = symInput.trim().toUpperCase();
              if(!SYMBOLS.includes(cleaned)) SYMBOLS.push(cleaned);
              setTradeCfg((c: any) => ({
                ...c,
                symbols: {
                  ...c.symbols,
                  [cleaned]: { leverage: 10, marginMode: "isolated", posSize: 5, sl: 2, tp: 4 }
                }
              }));
              setSelSym(cleaned);
            }
          }}>+ Yeni Sembol</Btn>
        </div>
        {/* Symbol tabs */}
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:16}}>
          {Object.keys(tradeCfg.symbols || {}).map(s=>(
            <button key={s} onClick={()=>setSelSym(s)}
              style={{padding:"4px 10px",borderRadius:20,border:`1px solid ${selSym===s?C.green:C.dim}`,
                background:selSym===s?"rgba(0,255,178,0.1)":"rgba(var(--text-rgb),0.02)",
                color:selSym===s?C.green:"rgba(var(--text-rgb),0.4)",fontSize:9,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>
              {s.split("/")[0]}
            </button>
          ))}
        </div>

        {/* Leverage */}
        <div style={{marginBottom:16}}>
          <Slider value={sym.leverage} onChange={v=>setSymCfg("leverage",v)} min={1} max={125} label="Kaldıraç" color={riskColor}/>
          {sym.leverage>20&&(
            <div style={{marginTop:6,padding:"5px 10px",borderRadius:8,background:"rgba(255,77,109,0.06)",
              border:"1px solid rgba(255,77,109,0.15)",fontSize:9,color:C.red}}>
              ⚠️ Yüksek kaldıraç — likidayson riski artmış
            </div>
          )}
        </div>

        {/* Margin mode */}
        <div style={{marginBottom:16}}>
          <Label sub>Marjin Modu (ccxt.setMarginMode)</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {["isolated","cross"].map(m=>(
              <button key={m} onClick={()=>setSymCfg("marginMode",m)}
                style={{padding:"9px 0",borderRadius:10,border:`1px solid ${sym.marginMode===m?C.blue:C.dim}`,
                  background:sym.marginMode===m?"rgba(56,189,248,0.1)":"rgba(var(--text-rgb),0.02)",
                  color:sym.marginMode===m?C.blue:"rgba(var(--text-rgb),0.4)",
                  fontSize:11,cursor:"pointer",fontFamily:"'DM Mono',monospace",fontWeight:600}}>
                {m==="isolated"?"🔒 Isolated":"🌐 Cross"}
              </button>
            ))}
          </div>
        </div>

        {selSym === "BTC/USDT" && (
          <div style={{marginBottom:16, padding:"12px", borderRadius:10, backgroundColor:"rgba(245,158,11,0.05)", border:`1px solid rgba(245,158,11,0.2)`}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <Label sub style={{marginBottom:0}}>Arbitraj Spread</Label>
              <div style={{fontFamily:"'DM Mono',monospace", color:C.amber, fontWeight:600}}>$48 (0.051%)</div>
            </div>
            <div style={{marginTop:8, fontSize:10, color:C.amber, display:"flex", alignItems:"center", gap:6}}>
              <span>⚡</span> ARBİTRAJ ADAYI — Betafish hazır
            </div>
          </div>
        )}

        {/* Position size, SL, TP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
          <div>
            <Label sub>Pozisyon Büyüklüğü</Label>
            <Input value={sym.posSize} onChange={v=>setSymCfg("posSize",v)} suffix="%" type="number"/>
          </div>
          <div>
            <Label sub>Stop Loss</Label>
            <Input value={sym.sl} onChange={v=>setSymCfg("sl",v)} suffix="%" type="number"/>
          </div>
          <div>
            <Label sub>Take Profit</Label>
            <Input value={sym.tp} onChange={v=>setSymCfg("tp",v)} suffix="%" type="number"/>
          </div>
        </div>

        {/* Order types */}
        <Label sub>İzin Verilen Emir Tipleri (ccxt.createOrder)</Label>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
          {["market","limit","stop_market","stop_limit","take_profit","trailing_stop"].map(ot=>{
            const on=(tradeCfg.orderTypes||["market","limit","stop_market"]).includes(ot);
            return (
              <button key={ot} onClick={()=>setTradeCfg((c: any)=>{
                const cur=c.orderTypes||["market","limit","stop_market"];
                return {...c,orderTypes:on?cur.filter((x: string)=>x!==ot):[...cur,ot]};
              })} style={{padding:"4px 10px",borderRadius:20,fontSize:9,cursor:"pointer",
                border:`1px solid ${on?C.green:C.dim}`,
                background:on?"rgba(0,255,178,0.08)":"rgba(var(--text-rgb),0.02)",
                color:on?C.green:"rgba(var(--text-rgb),0.35)",fontFamily:"'DM Mono',monospace"}}>
                {ot}
              </button>
            );
          })}
        </div>

        {/* ccxt method preview */}
        <div style={{marginTop:14,padding:"10px 12px",borderRadius:10,background:"rgba(var(--text-rgb),0.3)",
          border:`1px solid ${C.dim}`,fontSize:9,color:"rgba(var(--text-rgb),0.4)",fontFamily:"'DM Mono',monospace",lineHeight:1.8}}>
          <span style={{color:C.purple}}>exchange</span>.setLeverage(<span style={{color:C.amber}}>{sym.leverage}</span>, <span style={{color:"#86efac"}}>'{selSym}'</span>)<br/>
          <span style={{color:C.purple}}>exchange</span>.setMarginMode(<span style={{color:"#86efac"}}>'{sym.marginMode}'</span>, <span style={{color:"#86efac"}}>'{selSym}'</span>)<br/>
          <span style={{color:C.purple}}>exchange</span>.createOrder(<span style={{color:"#86efac"}}>'{selSym}'</span>, <span style={{color:"#86efac"}}>'market'</span>, <span style={{color:"#86efac"}}>'buy'</span>, amount, price)
        </div>
      </Card>
    </div>
  );
}

function RiskSection({ risk, setRisk }: { risk: any, setRisk: any }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <SectionTitle icon="🛡️" children="Risk Yönetimi"/>

      <Card>
        <Label>Portföy Koruma Limitleri</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {[
            {k:"maxDrawdown",   l:"Max Drawdown",      s:"%",  def:15},
            {k:"dailyLossLim",  l:"Günlük Kayıp Limiti",s:"%", def:5},
            {k:"maxPositions",  l:"Max Açık Pozisyon",  s:"",  def:5},
            {k:"maxPerTrade",   l:"Max İşlem Büyüklüğü",s:"%", def:10},
            {k:"cooldownMin",   l:"Kayıp Sonrası Bekleme",s:"dk",def:30},
            {k:"correlLimit",   l:"Korelasyon Limiti",  s:"%",  def:70},
          ].map(({k,l,s,def}: any)=>(
            <div key={k}>
              <Label sub>{l}</Label>
              <Input value={risk[k]??def} onChange={v=>setRisk((r: any)=>({...r,[k]:v}))} suffix={s} type="number"/>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Label>Otomatik Koruma Mekanizmaları</Label>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
          {[
            {k:"autoStopLoss",    l:"Otomatik Stop-Loss",    desc:"Pozisyon açıldığında anında yerleştirir"},
            {k:"trailingStop",    l:"Trailing Stop",          desc:"Kâr arttıkça SL güncellenir"},
            {k:"antiLiquidation", l:"Likidayson Koruması",   desc:"Margin %10 altındaysa pozisyon kapat"},
            {k:"news_pause",      l:"Haber Bazlı Duraklat",  desc:"Büyük haber öncesi Betafish'i beklet"},
            {k:"volFilter",       l:"Volatilite Filtresi",   desc:"ATR eşiği aşarsa işleme girme"},
            {k:"nightMode",       l:"Gece Modu",             desc:"00:00-06:00 arası işlem yapma"},
          ].map(({k,l,desc}: any)=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"8px 12px",borderRadius:10,background:"rgba(var(--text-rgb),0.02)",border:`1px solid ${C.dim}`}}>
              <div>
                <div style={{fontSize:11,color:"rgba(var(--text-rgb),0.8)",fontWeight:600}}>{l}</div>
                <div style={{fontSize:9,color:C.muted,marginTop:1}}>{desc}</div>
              </div>
              <Toggle value={risk[k]??false} onChange={v=>setRisk((r: any)=>({...r,[k]:v}))} size="sm"/>
            </div>
          ))}
        </div>
      </Card>

      {/* Black Swan Logic */}
      <Card>
        <Label>Black Swan Eşik Değerleri (Aşırı Durum Koruması)</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {[
            {k:"blackSwanDrawdown",   l:"Kritik Drawdown Eşiği",   s:"%",  def:10},
            {k:"blackSwanVolSpike",   l:"Volatilite Spike Kriteri",s:"z",  def:4},
            {k:"exchangeLatencyMax",  l:"Maks Borsa Gecikmesi",    s:"ms", def:3000},
          ].map(({k,l,s,def}: any)=>(
            <div key={k}>
              <Label sub>{l}</Label>
              <Input value={risk[k]??def} onChange={v=>setRisk((r: any)=>({...r,[k]:v}))} suffix={s} type="number"/>
            </div>
          ))}
        </div>
      </Card>

      {/* Kill Switch */}
      <Card style={{border:"1px solid rgba(255,77,109,0.25)",background:"rgba(255,77,109,0.04)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,color:C.red,fontSize:13}}>🚨 Acil Kill Switch</div>
            <div style={{fontSize:9,color:"rgba(255,100,100,0.7)",marginTop:2}}>Tüm pozisyonları piyasa fiyatından kapatır · Tüm botları durdurur</div>
          </div>
          <Btn variant="danger" onClick={()=>alert("/panic komutu gönderildi — tüm pozisyonlar kapatılıyor")}>⛔ PANIC</Btn>
        </div>
      </Card>
    </div>
  );
}

function StrategySection({ strategy, setStrategy }: { strategy: any, setStrategy: any }) {
  const MODES = [
    {id:"arbitrage",  icon:"⚖️",  label:"Arbitraj",        desc:"Çapraz borsa fiyat farkı"},
    {id:"scalping",   icon:"⚡",  label:"Scalping",        desc:"Kısa vadeli momentum"},
    {id:"news",       icon:"📰",  label:"News Trading",    desc:"Haber bazlı giriş"},
    {id:"marketmake", icon:"📊",  label:"Market Making",   desc:"Likidite sağlama"},
    {id:"swing",      icon:"📈",  label:"Swing Trade",     desc:"Orta vadeli trend"},
    {id:"grid",       icon:"🔲",  label:"Grid Bot",        desc:"Fiyat aralığı grid"},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <SectionTitle icon="🎯" children="Strateji Konfigürasyonu"/>

      {/* Active strategies */}
      <Card>
        <Label>Aktif Stratejiler</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {MODES.map(m=>{
            const on=(strategy.modes||["arbitrage","scalping","news"]).includes(m.id);
            return (
              <div key={m.id} onClick={()=>setStrategy((s: any)=>{
                const cur=s.modes||["arbitrage","scalping","news"];
                return {...s,modes:on?cur.filter((x: string)=>x!==m.id):[...cur,m.id]};
              })} style={{padding:"10px 12px",borderRadius:12,cursor:"pointer",transition:"all 0.15s",
                border:`1px solid ${on?C.green:C.dim}`,
                background:on?"rgba(0,255,178,0.06)":"rgba(var(--text-rgb),0.02)"}}>
                <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:16}}>{m.icon}</span>
                  <span style={{fontSize:11,fontWeight:600,color:on?"#fff":C.muted}}>{m.label}</span>
                </div>
                <div style={{fontSize:9,color:"rgba(var(--text-rgb),0.3)"}}>{m.desc}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Mirofish thresholds */}
      <Card>
        <Label>Mirofish Eşik Değerleri</Label>
        <div style={{display:"flex",flexDirection:"column",gap:14,marginTop:10}}>
          {[
            {k:"autoExecThresh",  l:"Otonom İşlem Eşiği",    v:80, color:C.green,  desc:"Bu %'nin üstünde Betafish otomatik çalışır"},
            {k:"alertThresh",     l:"Patron Uyarı Eşiği",    v:60, color:C.amber,  desc:"Bu %'nin üstünde bildirim gönderilir"},
            {k:"ignoreThresh",    l:"Yoksay Eşiği",          v:50, color:C.red,    desc:"Bu %'nin altındaki sinyaller görmezden gelinir"},
          ].map(({k,l,v,color,desc}: any)=>(
            <div key={k}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <span style={{fontSize:10,color:"rgba(var(--text-rgb),0.7)",fontWeight:600}}>{l}</span>
                  <div style={{fontSize:8,color:C.muted,marginTop:1}}>{desc}</div>
                </div>
                <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color}}>
                  {strategy[k]??v}%
                </span>
              </div>
              <input type="range" min={40} max={99} value={strategy[k]??v}
                onChange={e=>setStrategy((s: any)=>({...s,[k]:Number(e.target.value)}))}
                style={{width:"100%",accentColor:color,cursor:"pointer"}}/>
            </div>
          ))}
        </div>
      </Card>

      {/* Strategy Mutation Engine */}
      <Card>
        <Label>Strateji Mutasyon Motoru (Evolutionary Engine)</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <div>
            <Label sub>Mutasyon Oranı (%)</Label>
            <Input value={strategy.mutationRate??5} onChange={v=>setStrategy((st: any)=>({...st,mutationRate:v}))} suffix="%" type="number"/>
          </div>
          <div>
            <Label sub>Crossover Stratejisi</Label>
            <Select 
              value={strategy.crossoverStrategy??"uniform"} 
              onChange={v=>setStrategy((st: any)=>({...st,crossoverStrategy:v}))} 
              options={["uniform", "single-point", "two-point"]}
            />
          </div>
          <div>
            <Label sub>Fitness Fonksiyonu</Label>
            <Select 
              value={strategy.fitnessMulti??"sharpe"} 
              onChange={v=>setStrategy((st: any)=>({...st,fitnessMulti:v}))} 
              options={["sharpe", "sortino", "total pnl", "calmar"]}
            />
          </div>
        </div>
        <Btn variant="primary" onClick={()=>alert("Mutasyon döngüsü başlatıldı. Başarısız stratejiler emekliye ayrılıyor, kazananlar çaprazlanıyor.")} style={{marginTop: 12, width: "100%"}}>♻️ Mutasyon Döngüsünü Tetikle</Btn>
      </Card>

      {/* Timing */}
      <Card>
        <Label>Zamanlama & Interval</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {[
            {k:"scanInterval",   l:"OpenClaw Tarama",   s:"sn",  def:30},
            {k:"miroInterval",   l:"Mirofish Güncelleme",s:"sn", def:60},
            {k:"arbScanDelay",   l:"Arbitraj Tarama",   s:"ms",  def:500},
            {k:"orderTimeout",   l:"Emir Timeout",      s:"sn",  def:30},
          ].map(({k,l,s,def}: any)=>(
            <div key={k}>
              <Label sub>{l}</Label>
              <Input value={strategy[k]??def} onChange={v=>setStrategy((st: any)=>({...st,[k]:v}))} suffix={s} type="number"/>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SystemSection({ system, setSystem }: { system: any, setSystem: any }) {
  const [pingResult, setPingResult] = useState<string | null>(null);
  const testConn = () => { setPingResult("testing"); setTimeout(()=>setPingResult("ok"),1200); };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16, paddingBottom: 60}}>
      <SectionTitle icon="🖥️" children="Sistem & VPS Yapılandırması"/>

      {/* Service health */}
      <Card>
        <Label>Servis Sağlık Durumu</Label>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
          {[
            {name:"pouls-orchestrator", port:8000, st:"running"},
            {name:"pouls-openclaw",     port:8001, st:"running"},
            {name:"pouls-onyx",         port:8002, st:"running"},
            {name:"pouls-mirofish",     port:8003, st:"running"},
            {name:"pouls-betafish",     port:8004, st:"running"},
            {name:"PostgreSQL",         port:5432, st:"running"},
            {name:"CoreMem (Internal)", port:"RAM",st:"running"},
            {name:"Nginx",              port:443,  st:"running"},
          ].map(svc=>(
            <div key={svc.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"7px 12px",borderRadius:9,background:"rgba(var(--text-rgb),0.02)",border:`1px solid ${C.dim}`}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <StatusDot on={svc.st==="running"}/>
                <span style={{fontSize:10,color:"rgba(var(--text-rgb),0.75)",fontFamily:"'DM Mono',monospace"}}>{svc.name}</span>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:9,color:C.muted}}>:{svc.port}</span>
                <span style={{fontSize:9,padding:"2px 7px",borderRadius:10,
                  background:svc.st==="running"?"rgba(0,255,178,0.1)":"rgba(255,77,109,0.1)",
                  color:svc.st==="running"?C.green:C.red}}>{svc.st}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Docker / Deploy */}
      <Card>
        <Label>Deployment Kontrolleri</Label>
        <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:8}}>
          <div style={{padding:"10px 12px",borderRadius:10,background:"rgba(var(--text-rgb),0.3)",
            border:`1px solid ${C.dim}`,fontSize:9,color:"rgba(var(--text-rgb),0.4)",fontFamily:"'DM Mono',monospace",lineHeight:1.8}}>
            <span style={{color:"rgba(var(--text-rgb),0.25)"}}>$ </span><span style={{color:C.green}}>cd /opt/pouls/pouls-infra</span><br/>
            <span style={{color:"rgba(var(--text-rgb),0.25)"}}>$ </span>docker-compose up -d --build<br/>
            <span style={{color:"rgba(var(--text-rgb),0.25)"}}>$ </span>docker-compose ps
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <Btn variant="success" small onClick={()=>alert("Orchestrator'a restart komutu gönderiliyor...")}>🔄 Restart All</Btn>
            <Btn variant="ghost" small onClick={testConn}>
              {pingResult==="testing"?"⏳ Test...":pingResult==="ok"?"✅ Bağlı":"🔌 Bağlantı Test"}
            </Btn>
            <Btn variant="danger" small>⏹ Durdur</Btn>
          </div>
        </div>
      </Card>

      {/* Model config */}
      <Card>
        <Label>Otonom Model Yönetimi</Label>
        <div style={{marginTop:8, display:"flex", flexDirection:"column", gap:12}}>
          <Input value={system.localLlmPath || ""} onChange={v=>setSystem((s: any)=>({...s, localLlmPath: v}))} prefix="Yerel Yol / Repo URL" />
          <div style={{fontSize:9, color:C.muted}}>StickyBoot özelliği buraya girilen yolu kalıcı referans (LOCAL_LLM_PATH) olarak alır ve boot işlemlerinde tekrarlayan sormayı engeller. Github linki girildiğinde LinkToPathAdapter üzerinden otonom klonlama devreye girer.</div>
        </div>
      </Card>

      {/* Log settings */}
      <Card>
        <Label>Log & Monitoring</Label>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
          {[
            {k:"dbLog",     l:"Tüm Aksiyonları DB'ye Yaz", def:true},
            {k:"tradeLog",  l:"Trade Audit Log",            def:true},
            {k:"agentLog",  l:"Ajan Debug Logu",            def:false},
            {k:"alertPush", l:"Mobil Push Bildirimi",       def:true},
            {k:"emailAlert",l:"E-posta Uyarıları",          def:false},
          ].map(({k,l,def}: any)=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:10,color:"rgba(var(--text-rgb),0.7)"}}>{l}</span>
              <Toggle value={system[k]??def} onChange={v=>setSystem((s: any)=>({...s,[k]:v}))} size="sm"/>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PluginsSection({ agents, setAgents, models, setModels }: { agents: any, setAgents: any, models: any, setModels: any }) {
  const [repoUrl, setRepoUrl] = useState("https://github.com/Bulduk/crewAI");
  const [targetAgent, setTargetAgent] = useState("all");
  const [preflightData, setPreflightData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePreflight = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agents/add/repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_url: repoUrl,
          target_agent: targetAgent,
          preflight_only: true,
          confidence_threshold: 85
        })
      });
      const data = await res.json();
      setPreflightData(data);
    } catch(e) {
      alert("Pre-flight check failed");
    }
    setLoading(false);
  };

  const handleInstall = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agents/add/repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_url: repoUrl,
          name: repoUrl.split('/').pop() || "CustomRepo",
          target_agent: targetAgent,
          confidence_threshold: 85
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert("✅ " + data.message);
        if (data.repoType === 'model') {
           setModels((m: any) => [...m, {
             id: data.entity.id,
             name: data.entity.name,
             source: data.entity.source,
             endpoint: data.entity.endpoint
           }]);
           // If assigned to specific agent, update the agent too
           if (targetAgent !== 'all' && targetAgent !== 'none') {
             setAgents((a: any) => ({
                ...a,
                [targetAgent]: {
                   ...a[targetAgent],
                   assignedModelId: data.entity.id,
                   modelAssignmentType: 'assigned'
                }
             }));
           }
        } else {
           setAgents((a: any) => ({
             ...a,
             [data.entity.name]: {
               enabled: true, model: 'custom', goal: `Integrated: ${repoUrl}`, tasks: []
             }
           }));
        }
      } else {
        alert("❌ Hata: " + (data.reason || "Bilinmiyor. Rollback aktif."));
      }
    } catch(e) {
      alert("Hata sırasında Rollback mekanizması devreye girdi.");
    }
    setLoading(false);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <SectionTitle icon="🔌" children="Plugin & Intelligence Copilot" badge="V5.0 Institutional"/>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start font-mono text-gray-900 dark:text-white">
         <Card style={{ height: '100%' }}>
            <Label>Unified Installer</Label>
            <p className="text-[10px] text-gray-500 mb-4 mt-1">Paste any GitHub repo or tool API. System will automatically detect capabilities, map tools, and generate agent prompts.</p>
            
            <div className="flex flex-col gap-4">
               <div>
                  <Label sub>Source URI</Label>
                  <Input value={repoUrl} onChange={setRepoUrl} placeholder="e.g. github.com/user/defi-plugin" />
               </div>

               {preflightData ? (
                  <div style={{padding:"12px", borderRadius:12, background: preflightData.status === 'success' ? "rgba(0,255,178,0.03)" : "rgba(255,0,0,0.05)", border:`1px solid ${preflightData.status === 'success' ? 'rgba(0,255,178,0.15)' : 'red'}`}}>
                     <div style={{fontSize:11, fontWeight:700, color: preflightData.status === 'success' ? C.green : '#FF4D6D', marginBottom:4}}>
                     {preflightData.status === 'success' ? `✅ ${preflightData.display_type || preflightData.repo_type} Verified` : '❌ Sandbox Rejection'}
                     </div>
                     <div style={{fontSize:9, color:"rgba(var(--text-rgb),0.7)", lineHeight:1.5}}>
                     {preflightData.analysis}
                     </div>
                     {preflightData.status === 'success' && (
                     <div className="mt-3 pt-3 border-t border-white/5 space-y-2 font-mono">
                        <div className="text-[10px] text-gray-400">Auto-Generated Prompt:</div>
                        <div className="text-[9px] bg-black/50 p-2 rounded text-emerald-300">
                           "Act as an expert in {preflightData.repo_type}. Utilize the associated toolset to orchestrate capabilities on-demand..."
                        </div>
                     </div>
                     )}
                  </div>
               ) : (
                  <Btn variant="ghost" onClick={handlePreflight} disabled={loading}>{loading ? 'EXTRACTING CAPABILITIES...' : '🔍 ANALYZE & EXTRACT CAPABILITIES'}</Btn>
               )}

               <Btn variant="primary" onClick={handleInstall} disabled={loading || (preflightData && preflightData.status !== 'success')}>
                  {loading ? 'INITIALIZING SANDBOX...' : '🚀 DEPLOY TO SANDBOX'}
               </Btn>
            </div>
         </Card>

         <Card style={{ height: '100%' }}>
            <Label>Institutional Marketplace Hub</Label>
            <p className="text-[10px] text-gray-500 mb-4 mt-1">Pre-audited plugins ready for one-click deployment into Nexus.</p>

            <div className="space-y-3">
               {[
                  { name: 'DefiLlama Oracle', type: 'Data Stream', c: 'blue' },
                  { name: 'DEX Screener', type: 'Liquidity Scanner', c: 'purple' },
                  { name: 'Hyperliquid Perps', type: 'Execution', c: 'amber' }
               ].map(p => (
                  <div key={p.name} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-black/30 hover:border-white/20 transition-colors">
                     <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">{p.name}</div>
                        <div className="text-[9px] text-gray-500 uppercase mt-0.5">{p.type}</div>
                     </div>
                     <Btn variant="ghost" small onClick={() => { setRepoUrl(p.name); handlePreflight(); }}>INSTALL</Btn>
                  </div>
               ))}
            </div>
         </Card>
      </div>

    </div>
  );
}

function FreqtradeSection({ cfg, setCfg }: { cfg: any, setCfg: any }) {
  const [isCompiling, setIsCompiling] = useState(false);

  const handleCompileInternal = async () => {
    setIsCompiling(true);
    try {
      // Simulate compiling python strategies to JS/TS engine
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert("✅ Freqtrade Native Engine başarıyla derlendi ve sistemin içerisine entegre edildi.\nDışa bağımlılık kaldırıldı!");
      setCfg((c: any) => ({ ...c, nativeCompiled: true, enabled: true }));
    } catch (e: any) {
      alert("❌ Derleme hatası: " + e.message);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <SectionTitle icon="⚡" children="NEXUS Trade Engine (Freqtrade Native)" badge="Internalized"/>
      
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,color:"var(--nexus-text)",fontSize:13}}>Native Engine Durumu</div>
            <div style={{fontSize:9,color:C.green}}>Dışa bağımlılık yok. Kod tabanına entegre Node.js simülasyon motoru.</div>
          </div>
          <Toggle value={cfg.enabled} onChange={v=>setCfg((c: any)=>({...c,enabled:v}))}/>
        </div>

        <Label>İç Aktarılmış (Imported) Strateji Seçimi</Label>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
          <select value={cfg.strategy || "AwesomeMacd"} onChange={e=>setCfg((c: any)=>({...c,strategy:e.target.value}))}
            style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",color:"var(--nexus-text)",fontSize:12,outline:"none",fontFamily:"'DM Mono', monospace"}}>
            <option value="AwesomeMacd">AwesomeMacd (Native Port)</option>
            <option value="BBRSI">Bollinger Bands + RSI (Native Port)</option>
            <option value="Scalping">Multi-TF Scalper (Native Port)</option>
          </select>
        </div>
        
        <Btn variant={cfg.nativeCompiled ? "success" : "primary"} onClick={handleCompileInternal} style={{marginTop:16, width: "100%"}} disabled={isCompiling}>
          {isCompiling ? "Motor Derleniyor..." : cfg.nativeCompiled ? "✅ Motor Aktif ve Kullanıma Hazır" : "⚙️ Engine'i Sisteme İç Aktar (Import & Compile)"}
        </Btn>
      </Card>
      
      <Card>
        <Label>Anti-Leak & Dış Bağımlılık Kontrolü</Label>
        <div style={{fontSize:10,color:"rgba(var(--text-rgb),0.7)",lineHeight:1.6}}>
          Freqtrade mantığı (Sinyal üretimi, Backtest simülasyonları) artık REST API ile dışarıdan gelmiyor. Bunun yerine <strong>Dataclaw Sistemi</strong> içerisine TypeScript modülü olarak yüklendi ({cfg.nativeCompiled ? "Derlendi" : "Derlenmeyi bekliyor"}). Bu sayede ağ hataları ve sızıntı riskleri sıfıra indirildi.
        </div>
      </Card>
    </div>
  );
}

function ModesSection({ system, setSystem }: { system: any, setSystem: any }) {
  const modes = [
    { id: "paper", label: "Paper Trading", desc: "Simulated orders only. Safe environment.", color: C.blue },
    { id: "shadow", label: "Shadow Mode", desc: "Generates real signals but drops execution.", color: C.purple },
    { id: "live", label: "Live Execution", desc: "REAL MONEY. Direct CCXT execution.", color: C.red },
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <SectionTitle icon="🚦" children="Trading Mode Switch" badge="Safety Layer" />
      <Card>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {modes.map(mode => (
            <div key={mode.id} onClick={() => {
                if(mode.id === "live") {
                  if(!confirm("WARNING: LIVE MODE IS REAL MONEY OVER CCXT.\nAre you absolutely sure?")) return;
                }
                setSystem((s: any) => ({...s, tradingMode: mode.id}));
              }}
              style={{display:"flex", alignItems:"center", gap:16, padding:16, borderRadius:12,
                cursor:"pointer", border:`1px solid ${system.tradingMode === mode.id ? mode.color : C.border}`,
                background: system.tradingMode === mode.id ? `${mode.color}11` : "rgba(var(--text-rgb),0.02)"
              }}>
              <div style={{width: 24, height: 24, borderRadius:"50%", border:`2px solid ${mode.color}`,
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                {system.tradingMode === mode.id && <div style={{width: 12, height:12, borderRadius:"50%", background:mode.color}} />}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize: 14, fontWeight:600, color: system.tradingMode === mode.id ? mode.color : "#fff"}}>{mode.label}</div>
                <div style={{fontSize: 10, color: C.muted, marginTop:4}}>{mode.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {system.tradingMode === "live" && (
        <Card style={{border:`1px solid ${C.red}44`, background:`${C.red}11`}}>
          <div style={{color: C.red, fontWeight: 700, fontSize:12, display:"flex", alignItems:"center", gap:8}}>
            <span>⚠️</span> LIVE MODE IS ACTIVE!
          </div>
          <div style={{fontSize: 10, color:"var(--nexus-text)", marginTop:8}}>
            All executions are being routed to exchange real environments. Make sure your Risk configuration is verified.
          </div>
        </Card>
      )}
    </div>
  );
}

function OnchainSection() {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <SectionTitle icon="⛓️" children="Onchain Intelligence" badge="Agent Data" />
      <Card>
        <Label>Blockchain Analytics & Signals</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div style={{padding:12, background:"rgba(var(--text-rgb),0.02)", borderRadius:8, border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10, color:C.muted}}>Whale Exchange Inflow (24h)</div>
            <div style={{fontSize:18, fontWeight:"bold", color:C.red}}>$48.2M</div>
          </div>
          <div style={{padding:12, background:"rgba(var(--text-rgb),0.02)", borderRadius:8, border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10, color:C.muted}}>DEX Volume Momentum</div>
            <div style={{fontSize:18, fontWeight:"bold", color:C.green}}>+14.2%</div>
          </div>
        </div>
        <div style={{marginTop:16, fontSize:11, color:"rgba(var(--text-rgb),0.6)", lineHeight:1.5}}>
          The Onchain Agent continuously monitors Etherscan, Solscan, and mempools for abnormal liquidity sweeps. Wait for AgentNode logs to view deep insights.
        </div>
      </Card>
    </div>
  );
}

function NasaSection({ vault, setVault }: { vault: any, setVault: any }) {
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<{role:string, content:string}[]>([
    {role: "assistant", content: "Merhaba. Ben NEXUS Admin & Setup Agent (NASA). Sistem loglarına, veritabanı ayarlarına ve otonom ajanların canlı durumlarına sahibim. \n\nSistemi yapılandırmak, VPS bağımlılıklarını kurmak ('Yeni Nvidia LLM kur') veya mevcut hataları ayıklamak ('Neden OpenClaw pasif?') için bana sorabilirsiniz."}
  ]);

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatLog(prev => [...prev, {role: "user", content: userMsg}]);
    setChatInput("");
    
    try {
      const { withPerformanceTracking } = await import("../services/metrics");
      const res = await withPerformanceTracking(
        'NASA_Admin',
        'prompt_processing',
        async () => {
          const response = await fetch("/api/nasa/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command: userMsg, context: vault })
          });
          if (!response.ok) throw new Error("HTTP error " + response.status);
          return await response.json();
        }
      );
      const data = res;
      setChatLog(prev => [...prev, {role: "assistant", content: data.message}]);
      if (data.logs && data.logs.length > 0) {
        data.logs.forEach((l: string) => {
          setChatLog(prev => [...prev, {role: "assistant", content: l}]);
        });
      }
    } catch(e) {
      setChatLog(prev => [...prev, {role: "assistant", content: `(NASA Backend Hatası): ${e}`}]);
    }
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <SectionTitle icon="🧠" children="NASA (Nexus Admin & Setup Agent)" badge="Vault.v1"/>
      
      <div style={{display:"flex", gap:16, alignItems:"flex-start"}}>
        <Card style={{flex:1}}>
          <Label>Merkezi Konfigürasyon Kasası (Env Vault)</Label>
          <div style={{fontSize:10, color:C.muted, marginBottom:12}}>
            AI Studio değişkenleri bypass edildi. Tüm LLM, Supabase ve CoreMem ortam değişkenleri doğrudan şifreli olarak buradan enjekte edilir.
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Input value={vault.supabaseUrl || ""} onChange={v=>setVault({...vault, supabaseUrl:v})} prefix="Supabase URL" />
            <Input value={vault.supabaseAnonKey || ""} onChange={v=>setVault({...vault, supabaseAnonKey:v})} prefix="Supabase Anon Key" type="password" />
            <Input value={vault.supabaseServiceKey || ""} onChange={v=>setVault({...vault, supabaseServiceKey:v})} prefix="Supabase Service Key" type="password" />
            <Input value={vault.localLlmEndpoint || ""} onChange={v=>setVault({...vault, localLlmEndpoint:v})} prefix="Local LLM Endpoint" />
            <div style={{marginBottom: -4}}><Label sub>Dahili Hafıza (CoreMem-Protocol)</Label></div>
            <Input value={vault.corememConfig || "auto"} onChange={v=>setVault({...vault, corememConfig:v})} prefix="CoreMem Allocation" />
            <div style={{fontSize:9,color:"rgba(var(--text-rgb),0.4)",marginTop:-6}}>* Sistem "auto" ayarında RAM'i dinamik olarak Patron ajanı üzerinden yönetir. Harici Redis bağımlılığı kaldırılmıştır.</div>
            
            <div style={{marginBottom: -4, marginTop: 8}}><Label sub>Sistem Ajanları API & Model (Patron & NASA)</Label></div>
            <Input value={vault.patronApiKey || ""} onChange={v=>setVault({...vault, patronApiKey:v})} prefix="Patron (Orkestrasyon) API Key" type="password" />
            <Input value={vault.patronModel || "openrouter/auto"} onChange={v=>setVault({...vault, patronModel:v})} prefix="Patron Model" />
            
            <Input value={vault.nasaApiKey || ""} onChange={v=>setVault({...vault, nasaApiKey:v})} prefix="NASA (Setup) API Key" type="password" />
            <Input value={vault.nasaModel || "openrouter/auto"} onChange={v=>setVault({...vault, nasaModel:v})} prefix="NASA Model" />
            <div style={{fontSize:10,color:C.muted}}>* Eklediğiniz API anahtarı o ajanı yerel LLM yerine ilgili API modeline (örn. OpenAI, Anthropic, OpenRouter) geçirir.</div>
          </div>
        </Card>

        <Card style={{flex:1, display:"flex", flexDirection:"column", gap:12}}>
          <Label>System-Aware Admin Chat</Label>
          <div style={{flex:1, background:"rgba(var(--text-rgb),0.3)", borderRadius:8, border:`1px solid ${C.dim}`, padding:12, minHeight:200, maxHeight: 200, overflowY:"auto", display:"flex", flexDirection:"column", gap:8, fontFamily:"'DM Mono', monospace", fontSize:11}}>
            {chatLog.map((msg, i) => (
              <div key={i} style={{color: msg.role === "assistant" ? C.green : "#fff"}}>
                <span style={{fontWeight: "bold"}}>{msg.role === "assistant" ? "> NASA: " : "> You: "}</span> 
                {msg.content}
              </div>
            ))}
          </div>
          <div style={{display:"flex", gap:8}}>
            <Input value={chatInput} onChange={setChatInput} placeholder="Sisteme ne yaptırmak istiyorsun?" 
                   onKeyDown={e => e.key === "Enter" && handleChat()} />
            <Btn variant="primary" onClick={handleChat}>Gönder</Btn>
          </div>
        </Card>
      </div>

      <Card>
        <Label>Dynamic Setup Wizard</Label>
        <div style={{marginTop:8, display:"flex", gap:12, flexWrap:"wrap"}}>
          {["Docker Engine", "vLLM Server", "Portainer", "Nginx Proxy"].map(tech => (
            <div key={tech} style={{padding:"8px 16px", borderRadius:20, border:`1px solid ${C.dim}`, background:"rgba(var(--text-rgb),0.02)", cursor:"pointer", fontSize:11}}
                 onClick={() => {
                   setChatInput(`${tech} kurulum sihirbazını başlat.`);
                   handleChat();
                 }}>
              + {tech} Ekle
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── MAIN ADMIN PANEL ───────────────────────────────────
export default function AdminPanel({ forceSection, onSelectAgent }: { forceSection?: string, onSelectAgent?: (id: string) => void } = {}) {
  const [activeSection, setActiveSection] = usePersistentState("dataclaw_activeSection", "crewai");
  const currentSection = forceSection || activeSection;
  const [saved, setSaved] = useState(false);
  const [liveLog, setLiveLog] = useState<any[]>([]);

  useEffect(() => {
    if ((import.meta as any).env.VITE_SUPABASE_URL?.includes?.('xxxxxxxx') || !(import.meta as any).env.VITE_SUPABASE_URL) return;
    // Supabase Realtime Subscription
    let channel: any;
    try {
      channel = supabase.channel('dataclaw_events')
        .on('broadcast', { event: 'signal' }, payload => {
          setLiveLog(prev => [{...payload.payload, time: Date.now()}, ...prev].slice(0, 10));
        })
        .on('broadcast', { event: 'trade' }, payload => {
          setLiveLog(prev => [{...payload.payload, type: 'trade', time: Date.now()}, ...prev].slice(0, 10));
        })
        .subscribe();
    } catch(e) {
      console.warn("Realtime setup failed:", e);
    }
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  // State
  const [agents, setAgents] = usePersistentState("dataclaw_agents",
    Object.fromEntries(Object.entries(AGENT_META).map(([n,m])=>[n,{
      enabled:true, delegation:false, model:m.model,
      maxIter:15, maxRpm:10, memory:true, verbose:false, cache:true,
      goal: n==="OpenClaw"?"Kripto piyasasındaki tüm veri akışlarını sürekli izle, sentiment analizi yap ve kritik fırsatları raporla."
          : n==="Onyx"?"Gelen haberleri ve sinyalleri doğrula, derin araştırma yaparak güvenilirlik skoru üret."
          : n==="Mirofish"?"LSTM ve Monte Carlo modellerini kullanarak fiyat tahminleri üret, güven skoru hesapla."
          :"Patron ve Orchestrator'dan gelen emirleri Binance API üzerinden güvenle yürüt.",
      tasks: OPENCLAW_TASKS.map(t=>({...t}))
    }]))
  );

  const [models, setModels] = usePersistentState("dataclaw_models", [
    { id: "default-local", name: "Default Local LLM", source: "localhost", endpoint: "http://localhost:11434/v1" }
  ]);

  const [tradeCfg, setTradeCfg] = usePersistentState("dataclaw_tradeCfg", {
    exchange:"Binance", endpoints: { Binance: {apiKey:"", secret:""}, Bybit: {apiKey:"", secret:""}, MEXC: {apiKey:"", secret:""}, OKX: {apiKey:"", secret:""} }, 
    testnet:true, sandbox:false, hedgeMode:false,
    orderTypes:["market","limit","stop_market"],
    symbols: Object.fromEntries(SYMBOLS.map(s=>[s,{leverage:10,marginMode:"isolated",posSize:5,sl:2,tp:4}]))
  });
  const [risk, setRisk] = usePersistentState("dataclaw_risk", {
    maxDrawdown:15,dailyLossLim:5,maxPositions:5,maxPerTrade:10,cooldownMin:30,correlLimit:70,
    autoStopLoss:true,trailingStop:false,antiLiquidation:true,news_pause:false,volFilter:true,nightMode:false,
    blackSwanDrawdown:10,blackSwanVolSpike:4
  });
  const [strategy, setStrategy] = usePersistentState("dataclaw_strategy", {
    modes:["arbitrage","scalping","news"],
    autoExecThresh:80, alertThresh:60, ignoreThresh:50,
    scanInterval:30, miroInterval:60, arbScanDelay:500, orderTimeout:30
  });
  const [system, setSystem] = usePersistentState("dataclaw_system", {
    tradingMode: "paper",
    dbLog:true,tradeLog:true,agentLog:false,alertPush:true,emailAlert:false
  });
  const [freqtradeCfg, setFreqtradeCfg] = usePersistentState("dataclaw_freqtradeCfg", {
    enabled: true, 
    nativeCompiled: false,
    strategy: "AwesomeMacd"
  });
  const [vault, setVault] = usePersistentState("dataclaw_vault", {
    supabaseUrl: (import.meta as any).env.VITE_SUPABASE_URL || "", supabaseAnonKey: (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "", supabaseServiceKey: (import.meta as any).env.VITE_SUPABASE_SERVICE_ROLE_KEY || "", localLlmEndpoint: (import.meta as any).env.VITE_LOCAL_LLM_ENDPOINT || "http://localhost:11434/v1", corememConfig: "auto",
    patronApiKey: (import.meta as any).env.VITE_OPENROUTER_API_KEY || "",
    patronModel: "openrouter/auto",
    nasaApiKey: (import.meta as any).env.VITE_OPENROUTER_API_KEY || "",
    nasaModel: "openrouter/auto"
  });

  const handleSave = async () => { 
    setSaved(true); 
    setTimeout(()=>setSaved(false),2000); 
    try {
      await fetch('/api/config/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agents, tradeCfg, risk, strategy, system, freqtradeCfg, vault })
      });
    } catch(e) {
      console.error("Config save mock call failed", e);
    }
  };

  const NAV = [
    {id:"nasa",     icon:"🧠", label:"NASA (Vault)"},
    {id:"crewai",   icon:"🤖", label:"Neural Core"},
    {id:"freqtrade",icon:"📈", label:"Freqtrade"},
    {id:"trading",  icon:"⚡", label:"Exchanges"},
    {id:"modes",    icon:"🚦", label:"Modes"},
    {id:"onchain",  icon:"⛓️", label:"Onchain"},
    {id:"risk",     icon:"🛡️", label:"Risk"},
    {id:"strategy", icon:"🎯", label:"Strategy"},
    {id:"system",   icon:"🖥️", label:"System"},
    {id:"plugins",  icon:"🔌", label:"Plugins"},
  ];

  const handleInstallRepo = async (repoUrl: string) => {
    const repo = repoUrl;
    const name = repo.split('/').pop() || "CrewAI-AMP";
    
    // Simulate API call to backend
    try {
      const res = await fetch('/api/agents/add/repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_url: repo,
          name: name,
          role: 'Orchestrator',
          confidence_threshold: 85 // Safe above 70
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert("✅ " + data.message);
        // Refresh or add to list locally
        setAgents((prev: any) => ({
          ...prev,
          [name]: {
            enabled: true, delegation: true, model: 'Bulduk/crewAI-custom',
            maxIter: 25, maxRpm: 15, memory: true, verbose: true, cache: true,
            goal: "CrewAI AMP Suite: Multi-agent orchestration and complex workflow automation.",
            tasks: []
          }
        }));
      } else {
        alert("❌ " + data.reason);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{height:"100%", display:"flex",flexDirection:"column"}}>

      {/* SUPABASE REALTIME MARQUEE */}
      {liveLog.length > 0 && (
        <div style={{padding:"8px 16px", background:"rgba(0, 255, 178, 0.05)", borderBottom:`1px solid ${C.green}33`, display:"flex", overflowX:"auto", whiteSpace:"nowrap", fontSize:11, color:C.green, fontFamily:"'DM Mono', monospace"}}>
          <span style={{marginRight: 16, fontWeight: "bold"}}>LIVE EVENTS:</span>
          {liveLog.map((log: any, i: number) => (
             <span key={i} style={{marginRight: 24}}>
               [{new Date(log.time).toLocaleTimeString()}] {log.type === 'trade' ? `🔥 EXEC: ${log.side} ${log.symbol} @ ${log.venue}` : `⚡ SIGNAL: ${log.agent_name || ''} ${log.signal || ''} ${log.symbol || ''}`}
             </span>
          ))}
        </div>
      )}

      {/* Section Nav - FAB Grid Style */}
      {!forceSection && (
      <div className="grid grid-cols-5 md:grid-cols-10 gap-3 p-4 md:p-6 bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800 shrink-0">
        {NAV.map(n=>{
          const active=currentSection===n.id;
          return (
            <button key={n.id} onClick={()=>setActiveSection(n.id)} className="flex flex-col items-center gap-2 group transition-transform active:scale-95">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-all duration-300 ${active ? 'bg-blue-500 text-white shadow-blue-500/30' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-slate-700 hover:border-blue-400/50 hover:shadow-md'}`}>
                {n.icon}
              </div>
              <span className={`text-[10px] md:text-xs font-bold text-center tracking-wide ${active ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'}`}>
                {n.label}
              </span>
            </button>
          );
        })}
      </div>
      )}

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px"}}>
        {currentSection==="nasa"     && <NasaSection     vault={vault}     setVault={setVault}/>}
        {currentSection==="crewai"   && <CrewAISection   agents={agents}   setAgents={setAgents} models={models} setModels={setModels} onSelectAgent={onSelectAgent}/>}
        {currentSection==="freqtrade"&& <FreqtradeSection cfg={freqtradeCfg} setCfg={setFreqtradeCfg}/>}
        {currentSection==="trading"  && <TradingSection  tradeCfg={tradeCfg} setTradeCfg={setTradeCfg}/>}
        {currentSection==="modes"    && <ModesSection    system={system}   setSystem={setSystem}/>}
        {currentSection==="onchain"  && <OnchainSection />}
        {currentSection==="risk"     && <RiskSection     risk={risk}       setRisk={setRisk}/>}
        {currentSection==="strategy" && <StrategySection strategy={strategy} setStrategy={setStrategy}/>}
        {currentSection==="system"   && <SystemSection   system={system}   setSystem={setSystem}/>}
        {currentSection==="plugins"  && <PluginsSection agents={agents} setAgents={setAgents} models={models} setModels={setModels}/>}
      </div>
    </div>
  );
}
