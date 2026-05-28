import React, { useState, useEffect } from 'react';
import { Network, TerminalSquare, Rss, Layers, Server, Activity, Database, Cpu } from 'lucide-react';
import { clsx } from 'clsx';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { usePersistentStore } from '../state/persistentStore';

export default function StreamingDashboard() {
  const allDelegationLogs = usePersistentStore(state => state.delegationLogs);
  const { agents } = usePersistentStore();

  const [mcpLogs, setMcpLogs] = useState<{id: number, tool: string, status: string, context: string, time: string}[]>([]);
  
  useEffect(() => {
    // Mock incoming MCP usage logs
    const interval = setInterval(() => {
      const tools = ['Binance REST', 'KuCoin WS', 'Local FS', 'PostgreSQL DB', 'Memcached'];
      const tool = tools[Math.floor(Math.random() * tools.length)];
      
      setMcpLogs(prev => {
        const newLog = {
          id: Date.now(),
          tool,
          status: Math.random() > 0.1 ? 'SUCCESS' : 'latency_spike',
          context: `Requested resource from ${tool} node`,
          time: new Date().toLocaleTimeString()
        };
        const updated = [newLog, ...prev];
        if (updated.length > 20) updated.pop();
        return updated;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#050505] font-mono text-gray-900 dark:text-white overflow-hidden">
      <div className="p-6 border-b border-white/5 shrink-0 bg-black/40 backdrop-blur-md">
        <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
          <Layers className="text-[#00FFB2]" /> 
          AGENTIC STACK <span className="text-gray-500 font-light tracking-wide">/ UNIQMODE</span>
        </h2>
        <p className="text-xs text-gray-500 mt-2 tracking-wide uppercase">Core Architecture & Real-time Flow</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20 md:pb-0">
          
          {/* L1: Tools (MCP) */}
          <Card className="flex flex-col">
            <CardHeader className="border-b border-white/5 pb-3">
              <CardTitle className="flex justify-between items-center text-sm uppercase text-gray-300">
                <span className="flex items-center gap-2"><Server size={14} className="text-[#00FFB2]" /> L1: Tool Integration (MCP)</span>
                <span className="text-[10px] bg-[#00FFB2]/10 text-[#00FFB2] px-2 py-0.5 rounded border border-[#00FFB2]/20 shadow-[0_0_10px_rgba(0,255,178,0.1)]">ACTIVE</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-y-auto space-y-3 h-64">
              {mcpLogs.map((log) => (
                <div key={log.id} className="bg-[#1A1A24] border border-white/5 rounded-lg p-3 flex justify-between items-center group hover:bg-[#2A2A35] transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">{log.tool}</span>
                    <span className="text-[10px] text-gray-500">{log.context}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-mono text-gray-400">{log.time}</span>
                    <span className={clsx("text-[9px] px-1.5 py-0.5 rounded border", log.status === 'SUCCESS' ? 'bg-[#00FFB2]/10 text-[#00FFB2] border-[#00FFB2]/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30')}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* L2: A2A (Inter-Agent) & ACP */}
          <Card className="flex flex-col">
            <CardHeader className="border-b border-white/5 pb-3">
              <CardTitle className="flex justify-between items-center text-sm uppercase text-gray-300">
                <span className="flex items-center gap-2"><Network size={14} className="text-purple-400" /> L2: A2A & ACP (Handoff)</span>
                <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">BEE_FRAMEWORK</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-y-auto space-y-3 h-64">
              {allDelegationLogs.length === 0 ? (
                <div className="text-[11px] text-gray-500 italic mt-2">Awaiting agent delegations...</div>
              ) : (
                [...allDelegationLogs].reverse().slice(0, 50).map(log => (
                  <div key={log.id} className="relative border-l-2 border-purple-500/50 pl-3 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-[#00FFB2] uppercase">{log.fromAgent}</span>
                      <span className="text-gray-600 text-xs">&rarr;</span>
                      <span className="text-[10px] font-bold text-[#38BDF8] uppercase">{log.toAgent}</span>
                      <span className="text-[9px] text-gray-500 ml-auto">{log.time}</span>
                    </div>
                    <div className="text-[11px] text-gray-300 leading-snug">{log.task}</div>
                    <div className="text-[10px] text-purple-400 mt-1 uppercase font-bold">Res: {log.result}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* L3: Agent Network Protocol (ANP) */}
          <Card className="flex flex-col">
            <CardHeader className="border-b border-white/5 pb-3">
              <CardTitle className="flex justify-between items-center text-sm uppercase text-gray-300">
                <span className="flex items-center gap-2"><Database size={14} className="text-blue-400" /> L3: Agent Network Routing (ANP)</span>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">P2P_MESH</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-64 flex flex-col justify-center items-center relative">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.1)_0%,transparent_70%)] pointer-events-none" />
               <div className="grid grid-cols-2 gap-4 w-full max-w-sm z-10 relative">
                  {agents.map((ag) => (
                    <div key={ag.id} className="bg-black/50 border border-blue-500/30 rounded-lg p-3 text-center transition-all hover:scale-105 shadow-[0_0_15px_rgba(56,189,248,0.1)]">
                       <span className="block text-xs font-bold text-[#38BDF8] uppercase">{ag.name}</span>
                       <span className="text-[9px] text-gray-400">Node Status: ON</span>
                    </div>
                  ))}
               </div>
               <div className="mt-6 text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2">
                 <Activity size={10} className="animate-pulse text-[#38BDF8]" /> Routing mesh active
               </div>
            </CardContent>
          </Card>

          {/* L4: Live AG-UI Stream */}
          <Card className="flex flex-col">
            <CardHeader className="border-b border-white/5 pb-3">
              <CardTitle className="flex justify-between items-center text-sm uppercase text-gray-300">
                <span className="flex items-center gap-2"><Rss size={14} className="text-emerald-400" /> L4: Live AG-UI (CopilotKit)</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 animate-pulse px-2 py-0.5 rounded border border-emerald-500/20">STREAMING</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-black/50 font-mono text-[10px] leading-relaxed flex-1 h-64 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505]/90 z-10 pointer-events-none" />
              <div className="p-4 space-y-2 opacity-80 h-full overflow-y-auto pb-10">
                <div className="text-gray-400">[SYS] Initiating frontend stream link...</div>
                <div className="text-[#00FFB2]">[OK] Connected AG-UI via standard Copilot interface.</div>
                <div className="text-gray-400">[Betafish] Evaluated funding rates (delta -0.01%)</div>
                <div className="text-purple-400">[Onyx] Sentiment module active: Bull ratio 0.65</div>
                <div className="text-[#38BDF8]">[Mirofish] P2P broadcast -&gt; Detected liquidity sweep</div>
                <div className="text-amber-400">[SYS] Awaiting next agent state diff...</div>
                {mcpLogs.length > 0 && <div className="text-gray-500">[MCP] {mcpLogs[0].tool} emitted data packet</div>}
                {allDelegationLogs.length > 0 && <div className="text-emerald-500">[A2A] Transfer complete: {allDelegationLogs[0].task.substring(0, 20)}...</div>}
                <div className="text-gray-400">[AG-UI] Render loop synced (60Hz)</div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
