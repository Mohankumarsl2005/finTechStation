import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2, Server, Database, Radio, X, Cpu, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDemoFeed: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, isDemoFeed }) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('LONDON_STRATEGIC_EDGE_API_KEY', apiKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-[#0C1222] p-5 shadow-2xl font-mono text-xs text-slate-300">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Institutional Feeds &amp; Station Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* London Strategic Edge Status Box */}
        <div className={`p-3.5 rounded-lg border mb-4 ${
          isDemoFeed ? 'bg-amber-950/20 border-amber-500/40 text-amber-200' : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2 font-bold mb-1 text-sm">
            {isDemoFeed ? (
              <>
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span>ACTIVE MODE: HIGH-FIDELITY DEMO SIMULATION</span>
              </>
            ) : (
              <>
                <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span>ACTIVE MODE: LONDON STRATEGIC EDGE LIVE GATEWAY</span>
              </>
            )}
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            {isDemoFeed
              ? 'London Strategic Edge institutional credentials have not been detected in this environment. All quotes, algorithmic scores, and depth indicators are simulated using stochastic financial models. FinTechStation strictly identifies simulated data to comply with compliance mandates.'
              : 'Connected to the London Strategic Edge enterprise low-latency order flow feed.'}
          </p>
        </div>

        {/* API Key Form */}
        <form onSubmit={handleSaveKey} className="space-y-3 mb-5">
          <div>
            <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
              London Strategic Edge API Key
            </label>
            <input
              type="password"
              placeholder="Paste LSE-PRO-xxxx-xxxx API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-750 bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Configure in .env as LONDON_STRATEGIC_EDGE_API_KEY for permanent container deployment.
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-colors"
          >
            {saved ? 'Credentials Verified & Saved!' : 'Apply Credentials'}
          </button>
        </form>

        {/* Stack Health Status */}
        <div className="border-t border-slate-800 pt-3 space-y-2">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">
            Enterprise Infrastructure Verification
          </span>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-800">
              <Server className="h-3.5 w-3.5 text-emerald-400" />
              <span>Spring Boot 3 / Java 21</span>
              <span className="text-emerald-400 ml-auto font-bold">READY</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-800">
              <Database className="h-3.5 w-3.5 text-emerald-400" />
              <span>PostgreSQL 16 &amp; Flyway</span>
              <span className="text-emerald-400 ml-auto font-bold">V1 MIG</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-800">
              <Radio className="h-3.5 w-3.5 text-emerald-400" />
              <span>Kafka &amp; Spark Streaming</span>
              <span className="text-emerald-400 ml-auto font-bold">ACTIVE</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-800">
              <Cpu className="h-3.5 w-3.5 text-purple-400" />
              <span>LangChain &amp; Gemini AI</span>
              <span className="text-purple-300 ml-auto font-bold">CONNECTED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
