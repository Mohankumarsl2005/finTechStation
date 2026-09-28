import React, { useState } from 'react';
import { 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Flame, 
  Trophy, 
  ChevronLeft, 
  ChevronRight, 
  BarChart2, 
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { JournalTrade } from '../../types/market';

interface TradingJournalModuleProps {
  trades: JournalTrade[];
  onAddTrade: (trade: Partial<JournalTrade>) => void;
  onDeleteTrade: (id: string) => void;
}

export const TradingJournalModule: React.FC<TradingJournalModuleProps> = ({
  trades,
  onAddTrade,
  onDeleteTrade
}) => {
  // State for user tracking
  const [hoursWatched, setHoursWatched] = useState(0);
  const [coursesEnrolled, setCoursesEnrolled] = useState(0);
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'streak' | 'trades'>('streak');

  // Trade form state
  const [newSymbol, setNewSymbol] = useState('BTC/USD');
  const [newDirection, setNewDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [newEntryPrice, setNewEntryPrice] = useState(62428.31);
  const [newExitPrice, setNewExitPrice] = useState(64800.00);
  const [newQuantity, setNewQuantity] = useState(1);
  const [newStrategy, setNewStrategy] = useState('Breakout Continuation');
  const [newNotes, setNewNotes] = useState('Clean test of daily support level.');

  // Calendar days generation for August 2026 (Starts on Saturday, 31 days)
  // August 1, 2026 is Saturday (index 6: SU=0, MO=1, TU=2, WE=3, TH=4, FR=5, SA=6)
  const daysInAugust = Array.from({ length: 31 }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: 6 }, (_, i) => null);

  const [activeDays, setActiveDays] = useState<Set<number>>(new Set());

  const toggleDayActivity = (day: number) => {
    setActiveDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      const count = next.size;
      setCurrentStreak(count);
      setBestStreak((b) => Math.max(b, count));
      setHoursWatched(count * 45); // 45m per active session
      setLessonsCompleted(count * 2);
      setCoursesEnrolled(count > 0 ? 1 : 0);
      return next;
    });
  };

  const handleCreateTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const pnl = (newExitPrice - newEntryPrice) * newQuantity * (newDirection === 'LONG' ? 1 : -1);
    const pnlPct = ((newExitPrice - newEntryPrice) / newEntryPrice) * 100 * (newDirection === 'LONG' ? 1 : -1);

    onAddTrade({
      symbol: newSymbol.toUpperCase(),
      assetClass: 'CRYPTO',
      direction: newDirection,
      entryPrice: newEntryPrice,
      exitPrice: newExitPrice,
      quantity: newQuantity,
      pnl: Number(pnl.toFixed(2)),
      pnlPercentage: Number(pnlPct.toFixed(2)),
      status: 'CLOSED',
      strategyTag: newStrategy,
      timeframe: '1D / 4H',
      notes: newNotes,
      entryDate: new Date().toISOString().split('T')[0],
      exitDate: new Date().toISOString().split('T')[0]
    });

    // Also update streak metrics
    setLessonsCompleted((prev) => prev + 1);
    setHoursWatched((prev) => prev + 30);
    setCoursesEnrolled(1);
    setCurrentStreak((prev) => Math.max(1, prev + 1));
    setBestStreak((prev) => Math.max(1, prev + 1));
    setActiveDays((prev) => new Set([...prev, 24]));

    setShowAddModal(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 font-sans text-white select-none pb-12">
      {/* 1. WELCOME HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Good evening, Mohan
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Start a streak today
          </p>
        </div>

        {/* View Switcher & Action buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#151518] p-1 rounded-xl border border-[#26262B]">
            <button
              onClick={() => setActiveTab('streak')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'streak'
                  ? 'bg-[#26262B] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Streak &amp; Learning
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'trades'
                  ? 'bg-[#26262B] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Trade Logs ({trades.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Log Activity</span>
          </button>
        </div>
      </div>

      {/* 2. TOP 4 METRIC CARDS (HOURS WATCHED, COURSES ENROLLED, LESSONS COMPLETED, DAY STREAK) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Hours watched */}
        <div className="rounded-2xl border border-[#222226] bg-[#0E0E11] p-5 shadow-sm flex flex-col justify-between h-36">
          <div className="h-9 w-9 rounded-full bg-orange-950/40 border border-orange-600/30 flex items-center justify-center text-orange-500">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1">
              <span>{hoursWatched}</span>
              <span className="text-base font-semibold text-slate-300">m</span>
            </div>
            <span className="text-xs text-slate-400 font-medium mt-0.5 block">
              Hours watched
            </span>
          </div>
        </div>

        {/* Card 2: Courses enrolled */}
        <div className="rounded-2xl border border-[#222226] bg-[#0E0E11] p-5 shadow-sm flex flex-col justify-between h-36">
          <div className="h-9 w-9 rounded-full bg-orange-950/40 border border-orange-600/30 flex items-center justify-center text-orange-500">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {coursesEnrolled}
            </div>
            <span className="text-xs text-slate-400 font-medium mt-0.5 block">
              Courses enrolled
            </span>
          </div>
        </div>

        {/* Card 3: Lessons completed */}
        <div className="rounded-2xl border border-[#222226] bg-[#0E0E11] p-5 shadow-sm flex flex-col justify-between h-36">
          <div className="h-9 w-9 rounded-full bg-orange-950/40 border border-orange-600/30 flex items-center justify-center text-orange-500">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {lessonsCompleted}
            </div>
            <span className="text-xs text-slate-400 font-medium mt-0.5 block">
              Lessons completed
            </span>
          </div>
        </div>

        {/* Card 4: Day streak */}
        <div className="rounded-2xl border border-[#222226] bg-[#0E0E11] p-5 shadow-sm flex flex-col justify-between h-36">
          <div className="h-9 w-9 rounded-full bg-orange-950/40 border border-orange-600/30 flex items-center justify-center text-orange-500">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1.5">
              <span>{currentStreak}</span>
              <span className="text-sm font-semibold text-slate-300">days</span>
            </div>
            <span className="text-xs text-slate-400 font-medium mt-0.5 block">
              Day streak
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN SECTION: STREAK CALENDAR & THIS WEEK ACTIVITY */}
      {activeTab === 'streak' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Card: Streak Calendar (span 5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-[#222226] bg-[#0E0E11] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-orange-950/40 border border-orange-600/30 flex items-center justify-center text-orange-500">
                    <Flame className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Streak</h3>
                    <span className="text-xs text-slate-400 font-medium">Start today</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/30 bg-orange-950/20 text-orange-400">
                    <Flame className="h-3.5 w-3.5 text-orange-500" />
                    <span>{currentStreak} current</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/30 bg-orange-950/20 text-orange-400">
                    <Trophy className="h-3.5 w-3.5 text-orange-500" />
                    <span>{bestStreak} best</span>
                  </span>
                </div>
              </div>

              {/* Month Navigator Header Bar */}
              <div className="flex items-center justify-between py-2 px-3 bg-[#151518] rounded-xl border border-[#222226] mb-4">
                <button
                  onClick={() => setSelectedMonth('July 2026')}
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-white tracking-wide">
                  {selectedMonth}
                </span>
                <button
                  onClick={() => setSelectedMonth('September 2026')}
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Weekday Labels (SU MO TU WE TH FR SA) */}
              <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 pb-3">
                <span>SU</span>
                <span>MO</span>
                <span>TU</span>
                <span>WE</span>
                <span>TH</span>
                <span>FR</span>
                <span>SA</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-y-3.5 text-center text-xs font-medium text-slate-300">
                {/* 6 blanks before August 1 */}
                {leadingBlanks.map((_, idx) => (
                  <span key={`blank-${idx}`} className="text-transparent">0</span>
                ))}

                {/* Day numbers 1 to 31 */}
                {daysInAugust.map((day) => {
                  const isActive = activeDays.has(day);
                  const isToday = day === 24; // Reference date in photo

                  return (
                    <button
                      key={day}
                      onClick={() => toggleDayActivity(day)}
                      className={`h-7 w-7 mx-auto rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-orange-500 text-black font-extrabold shadow-sm'
                          : isToday
                          ? 'border border-orange-500/50 text-white font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center mt-6 pt-3 border-t border-[#222226]">
              Click any calendar day to log learning or trade sessions.
            </p>
          </div>

          {/* Right Card: This Week (span 7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-[#222226] bg-[#0E0E11] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 pb-3">
                <div className="h-9 w-9 rounded-full bg-orange-950/40 border border-orange-600/30 flex items-center justify-center text-orange-500">
                  <BarChart2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">This Week</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <TrendingUp className="h-3 w-3 text-orange-500" />
                    <span>{hoursWatched}m watched · {lessonsCompleted} lessons</span>
                  </div>
                </div>
              </div>

              {/* Main Content Area / Empty State */}
              <div className="flex flex-col items-center justify-center py-16 text-center">
                {lessonsCompleted === 0 ? (
                  <>
                    <div className="h-12 w-12 rounded-2xl bg-[#151518] border border-[#26262B] flex items-center justify-center text-slate-500 mb-3">
                      <BarChart2 className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">No activity this week</h4>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Start watching to see your progress here
                    </p>
                    <button
                      onClick={() => {
                        setLessonsCompleted(1);
                        setHoursWatched(45);
                        setCoursesEnrolled(1);
                        setCurrentStreak(1);
                        setBestStreak(1);
                        setActiveDays(new Set([24]));
                      }}
                      className="mt-4 px-4 py-1.5 rounded-lg border border-orange-500/40 bg-orange-950/20 text-orange-400 hover:bg-orange-500 hover:text-black font-bold text-xs transition-all"
                    >
                      Start First Session Now
                    </button>
                  </>
                ) : (
                  <div className="w-full space-y-4 text-left">
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-[#222226] pb-2">
                      <span className="font-semibold text-white">Active Progress</span>
                      <span className="text-orange-400 font-bold">{hoursWatched} minutes completed</span>
                    </div>

                    <div className="grid grid-cols-7 gap-2 pt-2">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayName, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2">
                          <div className="w-full h-24 bg-[#151518] rounded-lg p-1 flex items-end justify-center">
                            <div
                              className="w-full bg-gradient-to-t from-orange-600 to-amber-400 rounded"
                              style={{ height: idx === 6 ? '75%' : idx === 5 ? '40%' : '15%' }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold">{dayName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#222226] flex items-center justify-between text-xs text-slate-400">
              <span>Weekly Target: 5 Hours</span>
              <span className="text-orange-400 font-semibold">{Math.round((hoursWatched / 300) * 100)}%</span>
            </div>
          </div>
        </div>
      ) : (
        /* TRADE LOGS TABLE */
        <div className="rounded-2xl border border-[#222226] bg-[#0E0E11] p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#222226]">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Executed Trades &amp; Historical Logs
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed record of all buy/sell orders, PnL outcomes, and execution setups.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Trade</span>
            </button>
          </div>

          <div className="overflow-x-auto pt-3">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#222226] text-[11px] text-slate-450 uppercase pb-2">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Entry</th>
                  <th className="py-2.5 px-3 text-right">Exit</th>
                  <th className="py-2.5 px-3 text-right">P&amp;L ($)</th>
                  <th className="py-2.5 px-3">Strategy</th>
                  <th className="py-2.5 px-3">Notes</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222226]">
                {trades.map((trade) => {
                  const isWin = (trade.pnl || 0) >= 0;
                  return (
                    <tr key={trade.id} className="hover:bg-[#151518] transition-colors">
                      <td className="py-3 px-3 text-slate-400">{trade.entryDate}</td>
                      <td className="py-3 px-3 font-bold text-white">{trade.symbol}</td>
                      <td className="py-3 px-3">
                        <span className={trade.direction === 'LONG' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {trade.direction}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300">${trade.entryPrice.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-slate-300">
                        {trade.exitPrice ? `$${trade.exitPrice.toLocaleString()}` : 'OPEN'}
                      </td>
                      <td className="py-3 px-3 text-right font-bold">
                        {trade.pnl !== undefined ? (
                          <span className={isWin ? 'text-emerald-400' : 'text-rose-400'}>
                            {isWin ? '+' : ''}${trade.pnl.toFixed(2)} ({trade.pnlPercentage}%)
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-400">{trade.strategyTag}</td>
                      <td className="py-3 px-3 text-slate-400 max-w-[180px] truncate">{trade.notes}</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onDeleteTrade(trade.id)}
                          className="p-1 rounded text-slate-600 hover:text-rose-400 transition-colors"
                          title="Delete Trade Log"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#222226] bg-[#0E0E11] p-6 shadow-2xl text-xs font-sans">
            <h3 className="text-base font-bold text-white mb-3 pb-2 border-b border-[#222226]">
              Log Session or Trade to Journal
            </h3>

            <form onSubmit={handleCreateTrade} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1 font-medium">SYMBOL</label>
                  <input
                    type="text"
                    required
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#26262B] bg-[#151518] text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1 font-medium">DIRECTION</label>
                  <select
                    value={newDirection}
                    onChange={(e) => setNewDirection(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-[#26262B] bg-[#151518] text-white font-bold"
                  >
                    <option value="LONG">LONG (Buy)</option>
                    <option value="SHORT">SHORT (Sell)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1 font-medium">ENTRY PRICE ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newEntryPrice}
                    onChange={(e) => setNewEntryPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#26262B] bg-[#151518] text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1 font-medium">EXIT PRICE ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newExitPrice}
                    onChange={(e) => setNewExitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#26262B] bg-[#151518] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1 font-medium">SETUP STRATEGY</label>
                <input
                  type="text"
                  value={newStrategy}
                  onChange={(e) => setNewStrategy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#26262B] bg-[#151518] text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1 font-medium">JOURNAL NOTES</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#26262B] bg-[#151518] text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222226]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#26262B] bg-[#151518] text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold"
                >
                  Save &amp; Update Streak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
