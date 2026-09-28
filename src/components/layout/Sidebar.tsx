import React from 'react';
import { 
  LayoutDashboard, 
  Radar, 
  CandlestickChart, 
  Compass, 
  BrainCircuit, 
  Newspaper, 
  BookOpen, 
  Star, 
  BellRing, 
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  watchlistCount: number;
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  collapsed,
  setCollapsed,
  watchlistCount,
  alertCount
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'scanner',
      label: 'Stock Scanner',
      icon: Radar,
      badge: 'LIVE',
      highlight: true
    },
    {
      id: 'chart',
      label: 'Chart Analysis',
      icon: CandlestickChart,
      badge: null
    },
    {
      id: 'plan',
      label: 'Trading Plan',
      icon: Compass,
      badge: null
    },
    {
      id: 'research',
      label: 'Research',
      icon: BrainCircuit,
      badge: 'AI'
    },
    {
      id: 'news',
      label: 'News',
      icon: Newspaper,
      badge: 'FF/WM'
    },
    {
      id: 'journal',
      label: 'Trading Journal',
      icon: BookOpen,
      badge: null
    },
    {
      id: 'watchlist',
      label: 'Watchlist',
      icon: Star,
      badge: watchlistCount > 0 ? String(watchlistCount) : null
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: BellRing,
      badge: alertCount > 0 ? String(alertCount) : null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-800 bg-[#070B14] transition-all duration-300 ease-in-out select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 p-2 pt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`group relative flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-950/40'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200 border border-transparent'
              }`}
              title={collapsed ? item.label : undefined}
            >
              {/* Active accent pill indicator */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-cyan-400" />
              )}

              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-450 group-hover:text-slate-200'
                }`}
              />

              {!collapsed && (
                <span className="ml-3 truncate font-medium text-left flex-1 tracking-tight">
                  {item.label}
                </span>
              )}

              {!collapsed && item.badge && (
                <span
                  className={`ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                    item.highlight
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : item.badge === 'AI'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Terminal Engine Info card when expanded */}
      {!collapsed && (
        <div className="p-3 mx-2 mb-3 rounded-lg border border-slate-800/80 bg-slate-900/40 text-[11px] font-mono">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Cpu className="h-3 w-3 text-cyan-400" /> Engine
            </span>
            <span className="text-emerald-400 text-[10px]">SPRING/NODE</span>
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            PostgreSQL · Kafka · Spark
          </div>
        </div>
      )}

      {/* Collapse / Expand Toggle Button */}
      <div className="border-t border-slate-800 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-850 hover:text-slate-200 transition-colors text-xs"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              <span className="text-[11px] font-mono">Collapse Station</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
