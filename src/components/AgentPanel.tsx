import React, { useState } from 'react';
import { usePersistentStore } from '../state/persistentStore';
import { ChevronDown, ChevronUp, Save, BrainCircuit, Activity, Settings2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function AgentPanel() {
  const { agents, updateAgent, models, addModel, removeModel, assignModelToAgent } = usePersistentStore();
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);
  const [newModel, setNewModel] = useState({ name: '', source: '', endpoint: '', assignTo: 'all' });
  const [isSaving, setIsSaving] = useState(false);

  const handleAddModel = () => {
    if (!newModel.name || !newModel.endpoint) return;
    const modelId = `model-${Date.now()}`;
    addModel({
      id: modelId,
      name: newModel.name,
      source: newModel.source,
      endpoint: newModel.endpoint,
      assignedTo: [newModel.assignTo],
    });
    
    if (newModel.assignTo !== 'none') {
      if (newModel.assignTo === 'all') {
        agents.forEach(a => assignModelToAgent(a.id, modelId));
      } else {
        assignModelToAgent(newModel.assignTo, modelId);
      }
    }
    
    setNewModel({ name: '', source: '', endpoint: '', assignTo: 'all' });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] text-gray-900 dark:text-white relative font-mono overflow-hidden">
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 z-10 custom-scrollbar">
        
        <div className="flex justify-between items-center mb-6">
          <div className="font-['Syne'] text-xl font-bold flex items-center gap-2">
            <BrainCircuit size={20} className="text-[#00FFB2]" /> CrewAI Config
          </div>
        </div>

        {/* Expandable Model Config Header */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-6 transition-all duration-300">
          <button 
            onClick={() => setIsConfigExpanded(!isConfigExpanded)}
            className="w-full flex items-center justify-between p-4 bg-black/40 hover:bg-black/60 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-[#00FFB2]">
              <Settings2 size={16} /> Edit LLM Settings & Apply to All
            </div>
            {isConfigExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          
          {isConfigExpanded && (
            <div className="p-4 flex flex-col gap-4 border-t border-white/10 bg-black/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input 
                  placeholder="Model Adı (ör. Llama 3 8B)" 
                  value={newModel.name} 
                  onChange={e => setNewModel({...newModel, name: e.target.value})}
                  className="bg-black/40 border border-white/10 rounded-md p-2 text-xs text-gray-900 dark:text-white focus:border-[#00FFB2] focus:outline-none transition-colors"
                />
                <input 
                  placeholder="Kaynağı (ör. Ollama, NIM API)" 
                  value={newModel.source} 
                  onChange={e => setNewModel({...newModel, source: e.target.value})}
                  className="bg-black/40 border border-white/10 rounded-md p-2 text-xs text-gray-900 dark:text-white focus:border-[#00FFB2] focus:outline-none transition-colors"
                />
                <input 
                  placeholder="Endpoint (ör. http://localhost:11434)" 
                  value={newModel.endpoint} 
                  onChange={e => setNewModel({...newModel, endpoint: e.target.value})}
                  className="bg-black/40 border border-white/10 rounded-md p-2 text-xs text-gray-900 dark:text-white focus:border-[#00FFB2] focus:outline-none transition-colors"
                />
              </div>
              <div className="flex gap-3 items-center">
                <select 
                  value={newModel.assignTo} 
                  onChange={e => setNewModel({...newModel, assignTo: e.target.value})}
                  className="bg-black/40 border border-white/10 rounded-md p-2 text-xs text-gray-900 dark:text-white focus:border-[#00FFB2] focus:outline-none flex-1"
                >
                  <option value="none">Sadece Ekle (Atama Yapma)</option>
                  <option value="all">Tüm Ajanlara Ata ("Tüm Ajanlara Uygula")</option>
                  {agents.map(a => <option key={a.id} value={a.id}>Sadece {a.name} Ajanına</option>)}
                </select>
                <button 
                  onClick={handleAddModel}
                  className="bg-[#00FFB2]/10 text-[#00FFB2] border border-[#00FFB2]/30 hover:bg-[#00FFB2]/20 px-4 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap"
                >
                  Ekle ve Uygula
                </button>
              </div>

              {/* Models List inside expandable */}
              <div className="mt-2 pt-4 border-t border-white/5 flex flex-col gap-2">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Kayıtlı Özel Modeller</div>
                {models.filter(m => m.id !== 'default-local').map(m => (
                  <div key={m.id} className="flex justify-between items-center bg-black/40 p-2 px-3 rounded-md border border-white/5">
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">{m.name}</div>
                      <div className="text-[9px] text-gray-500">{m.endpoint}</div>
                    </div>
                    <button 
                      onClick={() => removeModel(m.id)}
                      className="text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-2 py-1 rounded text-[10px] transition-colors"
                    >
                      Sil
                    </button>
                  </div>
                ))}
                {models.filter(m => m.id !== 'default-local').length === 0 && (
                  <div className="text-[10px] text-gray-600 italic">No custom models added.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Height Agent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {agents.map(agent => (
            <div 
              key={agent.id} 
              className={clsx(
                "h-[120px] rounded-xl border p-4 flex flex-col justify-between transition-all duration-300 cursor-pointer relative overflow-hidden group",
                agent.enabled ? "bg-white/5 border-white/10 hover:border-[#00FFB2]/50" : "bg-black/60 border-red-900/30 opacity-60"
              )}
              onClick={() => updateAgent(agent.id, { enabled: !agent.enabled })}
            >
              {/* Status Glow */}
              <div className={clsx(
                "absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-20 transition-colors",
                agent.enabled ? "bg-[#00FFB2]" : "bg-red-500"
              )} />

              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">{agent.name}</h3>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">{agent.role}</div>
                </div>
                <div className={clsx(
                  "px-2 py-0.5 rounded text-[9px] font-bold",
                  agent.enabled ? "bg-[#00FFB2]/20 text-[#00FFB2]" : "bg-red-500/20 text-red-400"
                )}>
                  {agent.enabled ? 'ACTIVE' : 'IDLE'}
                </div>
              </div>

              <div className="relative z-10 flex items-end justify-between">
                <div className="flex flex-col">
                   <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-widest"><Activity size={10}/> PnL</div>
                   <div className={clsx(
                     "text-lg font-bold font-mono tracking-tight",
                     agent.state && agent.state.performance.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                   )}>
                     {agent.state && agent.state.performance.pnl >= 0 ? '+' : ''}
                     ${agent.state?.performance.pnl.toFixed(2) || '0.00'}
                   </div>
                </div>
              </div>

              {/* Hover text indicator to toggle */}
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                 <span className="text-xs font-bold text-gray-900 dark:text-white tracking-widest uppercase">
                   {agent.enabled ? 'Click to Suspend' : 'Click to Activate'}
                 </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button for saving changes */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={clsx(
            "flex items-center gap-2 px-6 py-3 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all font-bold text-sm",
            isSaving 
              ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 scale-95"
              : "bg-[#00FFB2] text-black hover:scale-105 hover:bg-[#00FFB2] border border-[#00FFB2]/50 shadow-[0_0_15px_rgba(0,255,178,0.3)]"
          )}
        >
          <Save size={16} className={isSaving ? 'animate-bounce' : ''} />
          {isSaving ? 'KAYDEDİLDİ ✔' : 'DEĞİŞİKLİKLERİ KAYDET'}
        </button>
      </div>
      
      {/* Scrollbar injections if not present globally */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1C212A; border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #2B3340; }
      `}} />
    </div>
  );
}
