import React, { useState } from 'react';
import { BellRing, Plus, Trash2, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';
import { AlertRule, ScannerItem } from '../../types/market';

interface AlertsModuleProps {
  alerts: AlertRule[];
  instruments: ScannerItem[];
  onCreateAlert: (symbol: string, targetPrice: number, condition: string) => void;
  onDeleteAlert: (id: string) => void;
}

export const AlertsModule: React.FC<AlertsModuleProps> = ({
  alerts,
  instruments,
  onCreateAlert,
  onDeleteAlert
}) => {
  const [showModal, setShowModal] = useState(false);
  const [symbol, setSymbol] = useState('BTC/USD');
  const [targetPrice, setTargetPrice] = useState(98000);
  const [condition, setCondition] = useState('ABOVE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateAlert(symbol, Number(targetPrice), condition);
    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-[#0C1222] p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Price Threshold &amp; Technical Condition Alerts
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous Kafka streaming evaluation of price limits, RSI overbought/oversold levels, and London Edge triggers.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create New Alert</span>
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-2.5 pt-4">
          {alerts.length === 0 ? (
            <div className="py-16 text-center text-slate-500 font-mono text-xs">
              <BellRing className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-300 font-semibold">No active triggers configured</p>
              <p className="text-slate-500 mt-1">Add an alert rule to get notified when prices breach key support or resistance.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/60 font-mono text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{alert.symbol}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                        CONDITION: {alert.condition} ${alert.targetPrice.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">Created: {alert.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    STATUS: ACTIVE LISTENING
                  </span>
                  <button
                    onClick={() => onDeleteAlert(alert.id)}
                    className="p-1 rounded text-slate-600 hover:text-rose-400 transition-colors"
                    title="Delete Alert"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-[#0C1222] p-5 shadow-2xl font-mono text-xs">
            <h3 className="text-base font-bold text-white mb-3 pb-2 border-b border-slate-800">
              Set Real-Time Price Alert
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">SELECT INSTRUMENT</label>
                <select
                  value={symbol}
                  onChange={(e) => {
                    setSymbol(e.target.value);
                    const found = instruments.find((i) => i.symbol === e.target.value);
                    if (found) setTargetPrice(found.lastPrice);
                  }}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-750 bg-slate-900 text-white font-bold"
                >
                  {instruments.map((i) => (
                    <option key={i.symbol} value={i.symbol}>
                      {i.symbol} (${i.lastPrice})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[10px] block mb-1">TRIGGER CONDITION</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-750 bg-slate-900 text-white"
                >
                  <option value="ABOVE">Price Crosses Above (&gt;=)</option>
                  <option value="BELOW">Price Crosses Below (&lt;=)</option>
                  <option value="RSI_OVERSOLD">RSI(14) Drops Below 30</option>
                  <option value="RSI_OVERBOUGHT">RSI(14) Climbs Above 70</option>
                  <option value="LONDON_EDGE_BUY">London Edge Strong Buy Trigger</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[10px] block mb-1">TARGET PRICE LEVEL ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-750 bg-slate-900 text-white font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-750 bg-slate-850 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Alert Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
