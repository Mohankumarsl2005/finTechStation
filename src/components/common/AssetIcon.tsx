import React from 'react';

interface AssetIconProps {
  symbol: string;
  size?: number;
}

export const AssetIcon: React.FC<AssetIconProps> = ({ symbol, size = 28 }) => {
  const s = symbol.toUpperCase().replace('/', '');

  // Exact brand colors & iconography matching the reference image
  if (s === 'BTC' || s === 'BTCUSD') {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="rounded-full bg-[#F7931A] flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0"
      >
        ₿
      </div>
    );
  }

  if (s === 'ETH' || s === 'ETHUSD') {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="rounded-full bg-[#627EEA] flex items-center justify-center text-white shrink-0 shadow-sm"
      >
        <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="white">
          <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
        </svg>
      </div>
    );
  }

  if (s === 'SOL' || s === 'SOLUSD') {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="rounded-full bg-black flex items-center justify-center shrink-0 shadow-sm"
      >
        <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6}>
          <defs>
            <linearGradient id="solGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FFA3" />
              <stop offset="100%" stopColor="#DC1FFF" />
            </linearGradient>
          </defs>
          <path d="M4 17.5h13.5l2.5 2.5H6.5L4 17.5zm0-7.5h13.5l2.5 2.5H6.5L4 10zm2.5-7.5H20l-2.5 2.5H4l2.5-2.5z" fill="url(#solGrad)" />
        </svg>
      </div>
    );
  }

  if (s === 'XRP' || s === 'XRPUSD') {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="rounded-full bg-black flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm"
      >
        ✕
      </div>
    );
  }

  if (s === 'LINK' || s === 'LINKUSD') {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="rounded-full bg-[#375BD2] flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
      >
        <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="none" stroke="currentColor" strokeWidth="2.5">
          <polygon points="12,3 21,8.5 21,15.5 12,21 3,15.5 3,8.5" />
        </svg>
      </div>
    );
  }

  if (s === 'AVAX' || s === 'AVAXUSD') {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="rounded-full bg-[#E84142] flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm"
      >
        ▲
      </div>
    );
  }

  if (s === 'DOGE' || s === 'DOGEUSD') {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="rounded-full bg-[#C2A633] flex items-center justify-center text-white font-serif font-black text-sm shrink-0 shadow-sm"
      >
        Ð
      </div>
    );
  }

  if (s === 'ADA' || s === 'ADAUSD') {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="rounded-full bg-[#0033AD] flex items-center justify-center text-white shrink-0 shadow-sm"
      >
        <div className="w-2.5 h-2.5 rounded-full border-2 border-white flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-white" />
        </div>
      </div>
    );
  }

  if (s === 'NVDA') {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="rounded-full bg-[#76B900] flex items-center justify-center text-black font-extrabold text-[10px] shrink-0 shadow-sm"
      >
        NV
      </div>
    );
  }

  if (s === 'TSLA') {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="rounded-full bg-[#E82127] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm"
      >
        T
      </div>
    );
  }

  if (s === 'AAPL') {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm"
      >
        
      </div>
    );
  }

  // Fallback for any other symbol
  return (
    <div 
      style={{ width: size, height: size }} 
      className="rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-bold text-[11px] shrink-0 shadow-sm"
    >
      {symbol.slice(0, 3)}
    </div>
  );
};
