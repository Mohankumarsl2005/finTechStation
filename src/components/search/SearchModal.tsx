import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { ScannerItem } from '../../types/market';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  instruments: ScannerItem[];
  onSelectInstrument: (item: ScannerItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  instruments,
  onSelectInstrument
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = instruments.filter(
    (i) =>
      i.symbol.toLowerCase().includes(query.toLowerCase()) ||
      i.name.toLowerCase().includes(query.toLowerCase()) ||
      (i.sector && i.sector.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-xl border border-slate-800 bg-[#0C1222] shadow-2xl overflow-hidden font-mono text-xs">
        {/* Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800">
          <Search className="h-4 w-4 text-cyan-400 mr-2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type symbol or asset name (e.g. NVDA, Bitcoin, S&P 500, Gold)..."
            className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700 mr-2">
            ESC
          </kbd>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-850 p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No matching instruments found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item) => {
              const isPositive = item.changePercent24h >= 0;
              return (
                <div
                  key={item.symbol}
                  onClick={() => {
                    onSelectInstrument(item);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-850 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-sm">{item.symbol}</span>
                    <div>
                      <span className="text-slate-300">{item.name}</span>
                      <span className="text-[10px] text-slate-500 ml-2">[{item.assetClass}]</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-200">${item.lastPrice}</span>
                    <span className={isPositive ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                      {isPositive ? '+' : ''}{item.changePercent24h.toFixed(2)}%
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
