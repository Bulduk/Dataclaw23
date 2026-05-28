import React, { useState } from 'react';
import { usePersistentStore } from '../state/persistentStore';
import { BrainCircuit, Activity, Crosshair, Cpu, MemoryStick, Target, ShieldAlert, BadgeCheck, TerminalSquare, X, Save } from 'lucide-react';
import { clsx } from 'clsx';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

export default function AgentOperatingDesk({ agentId, onBack }: { agentId: string, onBack: () => void }) {
  const { agents, models, assignModelToAgent, updateAgent } = usePersistentStore();
  const [isFabOpen, setIsFabOpen] = React.useState(false);
  const [showPromptEditor, setShowPromptEditor] = React.useState(false);
  
  const agent = agents.find(a => a.id.toLowerCase() === agentId.toLowerCase() || a.name.toLowerCase() === agentId.toLowerCase());

  const [promptForm, setPromptForm] = React.useState({
    systemPrompt: '',
    coreDirectives: ''
  });

  React.useEffect(() => {
    if (agent) {
      setPromptForm({
        systemPrompt: agent.systemPrompt || '',
        coreDirectives: agent.coreDirectives ? agent.coreDirectives.join('\n') : ''
      });
    }
  }, [agent]);

  if (!agent || !agent.state) return (
    <div className="flex flex-col items-center justify-center h-full p-8 font-mono text-gray-500">
      <BrainCircuit size={48} className="mb-4 text-gray-800" />
      <div>No memory trace found for agent signature '{agentId}'.</div>
      <button onClick={onBack} className="mt-4 text-[#00FFB2] hover:text-gray-900 dark:text-white underline">Return to CrewAI</button>
    </div>
  );

  const { state } = agent;
  const [memorySearchQuery, setMemorySearchQuery] = React.useState('');
  const allDelegationLogs = usePersistentStore(state => state.delegationLogs);

  const filteredMemory = state.memory.filter(m => 
    m.content.toLowerCase().includes(memorySearchQuery.toLowerCase())
  );

  const handleSavePrompts = () => {
    updateAgent(agent.id, {
      systemPrompt: promptForm.systemPrompt,
      coreDirectives: promptForm.coreDirectives.split('\n').filter(d => d.trim().length > 0)
    });
    setShowPromptEditor(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] relative z-10 overflow-hidden font-mono text-gray-900 dark:text-white">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-white/5 shrink-0 bg-black/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
           <button onClick={onBack} className="text-gray-500 hover:text-gray-900 dark:text-white transition-colors text-xs border border-white/10 px-3 py-1 rounded">
             &larr; BACK
           </button>
           <div>
             <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 font-['Syne'] uppercase">
               <BrainCircuit size={18} className="text-[#00FFB2]" />
               {agent.name} 
               <span className="text-[10px] text-gray-500 font-mono tracking-widest">{agent.id}</span>
               <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 ml-2 shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                 Health: {state.health}%
               </span>
               <button 
                 onClick={() => setShowPromptEditor(true)}
                 className="ml-4 text-[10px] bg-purple-500/20 text-purple-400 px-2 py-1 rounded border border-purple-500/30 hover:bg-purple-500/30 transition-colors flex items-center gap-1 cursor-pointer font-sans tracking-wide"
                 title="Edit Prompts & Directives"
               >
                 <TerminalSquare size={12} /> Edit Prompts
               </button>
             </h2>
             <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-wider">Role: {agent.role}</p>
           </div>
        </div>
        <div className="flex gap-4">
           <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex flex-col items-end">
              <span className="text-[9px] text-gray-400 font-mono uppercase">Win Rate</span>
              <span className="text-sm font-bold text-blue-400">{state.performance.winRate.toFixed(1)}%</span>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 pb-20 md:pb-0">
          
          {/* Main Execution Log & Reason Trace */}
          <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
            <Card className="flex flex-col min-h-[400px]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><Crosshair size={14} className="text-[#00FFB2]"/> <span>Decision Ledger & Diagnostics</span></CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-y-auto">
                 {state.decisionLog.length === 0 ? (
                   <div className="text-gray-500 text-xs italic">No decisions logged.</div>
                 ) : (
                   <div className="flex flex-col gap-4">
                     {state.decisionLog.map(log => (
                       <div key={log.id} className="border border-white/10 rounded-lg bg-black/40 p-4">
                         <div className="flex justify-between items-center mb-3">
                           <div className="flex items-center gap-3">
                             <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold", log.type === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : log.type === 'SHORT' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400')}>
                               {log.type}
                             </span>
                             <span className="font-bold text-sm">{log.asset}</span>
                           </div>
                           <span className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                           <div>
                             <h4 className="text-[9px] text-gray-500 mb-1 uppercase tracking-wider">Why Entry?</h4>
                             <p className="text-xs text-gray-300">{log.whyEntry}</p>
                           </div>
                           <div>
                             <h4 className="text-[9px] text-gray-500 mb-1 uppercase tracking-wider">Position & Leverage</h4>
                             <p className="text-xs text-gray-300"><span className="text-blue-400">Lev:</span> {log.whyLeverage}</p>
                             <p className="text-xs text-gray-300 mt-1"><span className="text-blue-400">Size:</span> {log.whySize}</p>
                           </div>
                           <div>
                             <h4 className="text-[9px] text-gray-500 mb-1 uppercase tracking-wider">Risk Management</h4>
                             <p className="text-xs text-gray-300"><span className="text-red-400">Stop:</span> {log.whyStop}</p>
                             <p className="text-xs text-gray-300 mt-1"><span className="text-emerald-400">Target:</span> {log.whyTarget}</p>
                           </div>
                           <div className="flex flex-col justify-end">
                             <div className="bg-black border border-white/5 p-2 rounded flex justify-between items-center">
                                <span className="text-[10px] text-gray-500 uppercase">Swarm Consensus</span>
                                <div className="flex items-center gap-1">
                                  <BadgeCheck size={12} className="text-[#00FFB2]"/>
                                  <span className="text-xs font-bold text-[#00FFB2]">{log.confidence}%</span>
                                </div>
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
              </CardContent>
            </Card>

            <Card className="flex flex-col h-[400px]">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="flex items-center space-x-2"><MemoryStick size={14} className="text-purple-400"/> <span>Context & Memory State</span></CardTitle>
                <input 
                  type="text" 
                  placeholder="Search memory..." 
                  value={memorySearchQuery}
                  onChange={e => setMemorySearchQuery(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-gray-900 dark:text-white w-[140px] focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-y-auto">
                <div className="space-y-3">
                  {filteredMemory.length === 0 ? (
                     <div className="text-gray-500 text-xs italic">No memory entries found.</div>
                  ) : filteredMemory.map(m => (
                    <div key={m.id} className="flex gap-4 items-start border-l-2 border-purple-500/30 pl-3 py-1 hover:bg-white/5 transition-colors rounded-r-lg">
                       <span className="text-[10px] text-gray-500 w-16 shrink-0 pt-0.5">{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                       <p className="text-xs text-gray-300 leading-relaxed">{m.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Performance & Settings */}
          <div className="flex flex-col gap-4 md:gap-6">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><Activity size={14} className="text-blue-400"/> <span>Performance Analytics</span></CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-4">
                 <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs text-gray-400">Total PnL</span>
                    <span className={clsx("text-sm font-bold", state.performance.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {state.performance.pnl >= 0 ? '+' : ''}${state.performance.pnl.toFixed(2)}
                    </span>
                 </div>
                 <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs text-gray-400">Total Trades</span>
                    <span className="text-sm text-gray-200">{state.performance.totalTrades}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs text-gray-400">Sharpe Ratio</span>
                    <span className="text-sm text-gray-200">{state.performance.sharpeRatio.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs text-gray-400">Max Drawdown</span>
                    <span className="text-sm text-red-400">{state.performance.maxDrawdown.toFixed(1)}%</span>
                 </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><ShieldAlert size={14} className="text-amber-400"/> <span>Risk Configuration</span></CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                 <div className="text-xs space-y-4">
                    <div>
                      <div className="flex justify-between text-gray-400 mb-1"><span>Confidence Threshold</span> <span>{agent.confidenceThreshold}%</span></div>
                      <div className="h-1 bg-white/10 rounded overflow-hidden">
                        <div className="h-full bg-amber-400" style={{width: `${agent.confidenceThreshold}%`}}></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-3">
                       <span className="text-gray-400">Assigned Model</span>
                       <select 
                         value={agent.modelAssignmentType === 'default' ? 'default-local' : (agent.assignedModelId || 'default-local')}
                         onChange={(e) => assignModelToAgent(agent.id, e.target.value === 'default-local' ? 'default' : e.target.value)}
                         className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-gray-900 dark:text-white max-w-[150px]"
                       >
                         {models.map(m => (
                           <option key={m.id} value={m.id}>{m.name}</option>
                         ))}
                       </select>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-3">
                       <span className="text-gray-400">Execution Status</span>
                       <span className={clsx("px-2 py-0.5 rounded text-[10px]", agent.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400')}>
                         {agent.enabled ? 'ACTIVE' : 'SUSPENDED'}
                       </span>
                    </div>
                 </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col flex-1 min-h-[300px]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><Cpu size={14} className="text-gray-400"/> <span>Swarm Delegation Log</span></CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-y-auto">
                 {/* Filter out delegation logs that only involve this specific agent (from or to) */}
                 {(() => {
                   const relevantLogs = allDelegationLogs.filter(
                     log => log.fromAgent.toLowerCase() === agentId.toLowerCase() || log.toAgent.toLowerCase() === agentId.toLowerCase()
                   );
                   
                   if (relevantLogs.length === 0) {
                     return (
                       <div className="text-[10px] text-gray-500 italic mt-2">
                         No delegation logs found for this agent...
                       </div>
                     );
                   }

                   return (
                     <div className="flex flex-col gap-3">
                       {[...relevantLogs].reverse().map(log => (
                         <div key={log.id} className="border border-white/5 bg-black/30 rounded p-3">
                           <div className="flex justify-between items-center mb-2">
                             <div className="flex items-center gap-2">
                               <span className={clsx("text-[9px] font-bold px-1.5 py-0.5 rounded", log.fromAgent.toLowerCase() === agentId.toLowerCase() ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400")}>
                                 {log.fromAgent.toLowerCase() === agentId.toLowerCase() ? 'OUTBOUND' : 'INBOUND'}
                               </span>
                               <span className="text-[10px] text-gray-400">
                                 {log.fromAgent.toLowerCase() === agentId.toLowerCase() ? `To: ${log.toAgent}` : `From: ${log.fromAgent}`}
                               </span>
                             </div>
                             <span className="text-[9px] text-gray-500">{log.time}</span>
                           </div>
                           <p className="text-[10px] text-gray-300 leading-snug">{log.task}</p>
                           <div className="mt-2 text-[9px] text-right font-bold" style={{ color: log.success ? '#00FFB2' : '#FF4D6D' }}>
                             {log.result}
                           </div>
                         </div>
                       ))}
                     </div>
                   );
                 })()}
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>

      {/* FAB Menu */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isFabOpen && (
          <div className="flex flex-col gap-2 mb-2 w-48 text-right font-mono transition-all">
            <button className="bg-[#1A1A24] border border-white/10 hover:bg-[#2A2A35] text-gray-900 dark:text-white px-4 py-2 rounded-lg text-xs shadow-lg flex items-center justify-between">
               <span>Clear Memory</span>
               <Activity size={12} className="text-amber-400" />
            </button>
            <button 
              onClick={() => {
                setShowPromptEditor(true);
                setIsFabOpen(false);
              }}
              className="bg-[#1A1A24] border border-white/10 hover:bg-[#2A2A35] text-gray-900 dark:text-white px-4 py-2 rounded-lg text-xs shadow-lg flex items-center justify-between"
            >
               <span>Edit Prompts</span>
               <TerminalSquare size={12} className="text-[#00FFB2]" />
            </button>
            <button className="bg-[#1A1A24] border border-white/10 hover:bg-[#2A2A35] text-gray-900 dark:text-white px-4 py-2 rounded-lg text-xs shadow-lg flex items-center justify-between">
               <span>Disable Agent</span>
               <ShieldAlert size={12} className="text-red-400" />
            </button>
          </div>
        )}
        <button 
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={clsx(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
            isFabOpen ? "bg-[#00FFB2] text-black rotate-45" : "bg-white/10 border border-white/20 text-[#00FFB2] hover:bg-white/20 hover:scale-105"
          )}
        >
          <Target size={24} />
        </button>
      </div>

      {showPromptEditor && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1326] border border-[#00FFB2]/20 shadow-[0_0_30px_rgba(0,255,178,0.1)] w-full max-w-2xl rounded-xl flex flex-col overflow-hidden max-h-full">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/30">
              <h3 className="text-gray-900 dark:text-white font-bold flex items-center gap-2">
                <TerminalSquare className="text-[#00FFB2]" size={18} />
                Agent Configuration: {agent.name}
              </h3>
              <button onClick={() => setShowPromptEditor(false)} className="text-gray-400 hover:text-gray-900 dark:text-white p-1">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs uppercase text-gray-500 tracking-wider mb-2">System Prompt</label>
                <textarea
                  className="w-full bg-[#1A1A24] border border-white/10 rounded-lg p-3 text-sm text-gray-300 h-40 focus:outline-none focus:border-[#00FFB2]/50 font-mono resize-none leading-relaxed"
                  value={promptForm.systemPrompt}
                  onChange={e => setPromptForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  placeholder={`You are ${agent.name}, an expert quant agent...`}
                />
              </div>
              
              <div>
                <label className="block text-xs uppercase text-gray-500 tracking-wider mb-2">Core Directives (One per line)</label>
                <textarea
                  className="w-full bg-[#1A1A24] border border-white/10 rounded-lg p-3 text-sm text-gray-300 h-32 focus:outline-none focus:border-purple-500/50 font-mono resize-none leading-relaxed"
                  value={promptForm.coreDirectives}
                  onChange={e => setPromptForm(prev => ({ ...prev, coreDirectives: e.target.value }))}
                  placeholder="1. Never use more than 2x leverage&#10;2. Wait for MA squeeze confirmation"
                />
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-black/30 flex justify-end gap-3">
              <button 
                onClick={() => setShowPromptEditor(false)}
                className="px-4 py-2 rounded text-xs text-gray-400 hover:text-gray-900 dark:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePrompts}
                className="px-4 py-2 rounded text-xs bg-[#00FFB2]/20 text-[#00FFB2] border border-[#00FFB2]/50 hover:bg-[#00FFB2]/30 flex items-center gap-2 transition-colors font-bold uppercase tracking-wide"
              >
                <Save size={14} /> Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
