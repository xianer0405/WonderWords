
import React, { useState, useEffect } from 'react';
import { Settings, X, Save, RotateCcw, Cpu, Sliders, Key, ExternalLink, AlertTriangle } from 'lucide-react';
import { AIModelConfig } from '../types';
import { getAIConfig, saveAIConfig, DEFAULT_CONFIG, AVAILABLE_MODELS } from '../services/aiCore';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<AIModelConfig>(DEFAULT_CONFIG);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getAIConfig());
      setIsSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    saveAIConfig(config);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && aistudio.openSelectKey) {
        await aistudio.openSelectKey();
        // We don't need to do anything else; process.env.API_KEY is updated automatically in this env
    } else {
        alert("API Key selection is not supported in this environment.");
    }
  };

  const isDeepSeek = config.model.startsWith('deepseek');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-gray-900 p-6 text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
                <Settings className="w-6 h-6 text-brand-yellow" />
            </div>
            <div>
                <h2 className="text-xl font-bold tracking-wide">AI Configuration</h2>
                <p className="text-xs text-gray-400 font-mono">System & Model Settings</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Model Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <Cpu size={16} /> Model Selection
            </label>
            <div className="relative">
              <select
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl font-mono text-sm focus:border-brand-blue focus:ring-4 focus:ring-blue-50 outline-none appearance-none text-gray-700 font-bold cursor-pointer hover:bg-gray-100 transition-colors"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                ▼
              </div>
            </div>
            <p className="text-xs text-gray-500 px-1">Select the brain powering the application.</p>
          </div>

          <div className="h-px bg-gray-100 my-2" />

          {/* API Key Section */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <Key size={16} /> API Access
            </label>
            
            {isDeepSeek ? (
              // DeepSeek Custom Key Input
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 space-y-3">
                 <div className="flex items-start gap-2 text-indigo-800">
                    <AlertTriangle size={16} className="mt-1 flex-shrink-0" />
                    <p className="text-xs leading-relaxed font-medium">
                        You are using a third-party model (DeepSeek). 
                        Please provide your DeepSeek API Key below. 
                        <br/>
                        <span className="opacity-75 text-[10px]">(Stored locally in your browser)</span>
                    </p>
                 </div>
                 <input 
                    type="password" 
                    placeholder="sk-..."
                    value={config.customApiKey || ''}
                    onChange={(e) => setConfig({...config, customApiKey: e.target.value})}
                    className="w-full p-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none text-sm font-mono"
                 />
                 <div className="text-center pt-1">
                    <a 
                        href="https://platform.deepseek.com/api_keys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-600 font-medium transition-colors"
                    >
                        Get DeepSeek API Key <ExternalLink size={10} />
                    </a>
                </div>
              </div>
            ) : (
              // Google Native Key Selector
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-3">
                  <p className="text-xs text-gray-600 leading-relaxed">
                      To generate stories and word lists, you need to authorize access.
                      Clicking the button below will open the <strong>platform's secure key selector</strong>. 
                  </p>
                  <button
                      onClick={handleSelectKey}
                      className="w-full py-3 bg-white border-2 border-blue-200 text-brand-blue hover:bg-blue-600 hover:border-blue-600 hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                      <Key size={18} /> Open Key Selector
                  </button>
                  <div className="text-center pt-1">
                      <a 
                          href="https://ai.google.dev/gemini-api/docs/billing" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-brand-blue font-medium transition-colors"
                      >
                          View Billing & Quota Information <ExternalLink size={10} />
                      </a>
                  </div>
              </div>
            )}
          </div>

          <div className="h-px bg-gray-100 my-4" />

          {/* Parameters */}
          <div className="space-y-6">
             <div className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                <Sliders size={16} /> Generation Parameters
             </div>

             {/* Temperature */}
             <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-gray-700">Creativity (Temperature)</label>
                    <span className="font-mono text-brand-blue font-bold bg-blue-50 px-2 rounded">{config.temperature}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1 font-medium">
                    <span>Precise (0.0)</span>
                    <span>Balanced (1.0)</span>
                    <span>Random (2.0)</span>
                </div>
             </div>

             {/* Top P & Top K (Grouped) */}
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                     <div className="flex justify-between mb-1">
                        <label className="text-xs font-bold text-gray-600">Top P</label>
                        <span className="text-xs font-mono text-gray-500">{config.topP}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={config.topP}
                        onChange={(e) => setConfig({ ...config, topP: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-purple"
                    />
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                     <div className="flex justify-between mb-1">
                        <label className="text-xs font-bold text-gray-600">Top K</label>
                        <span className="text-xs font-mono text-gray-500">{config.topK}</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        step="1"
                        value={config.topK}
                        onChange={(e) => setConfig({ ...config, topK: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-purple"
                    />
                </div>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 flex items-center justify-between gap-4 border-t border-gray-100 sticky bottom-0">
            <button 
                onClick={handleReset}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-all flex items-center gap-2 text-sm font-bold"
            >
                <RotateCcw size={16} /> Reset
            </button>
            
            <button 
                onClick={handleSave}
                className={`
                    flex-1 px-6 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95
                    ${isSaved ? 'bg-green-500' : 'bg-gray-900 hover:bg-gray-800'}
                `}
            >
                {isSaved ? (
                    <>Saved!</>
                ) : (
                    <><Save size={18} /> Save Configuration</>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AISettingsModal;
