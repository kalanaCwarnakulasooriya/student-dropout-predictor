import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserCheck, Info, BrainCircuit } from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const links = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: '/predict', label: 'Predict Risk', icon: <UserCheck className="w-5 h-5" /> },
    { to: '/about', label: 'About & ML Specs', icon: <Info className="w-5 h-5" /> },
  ];

  return (
    <>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}


      <aside
        className={`sidebar-bg fixed top-16 bottom-0 left-0 z-40 w-64 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">

          <div>
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Navigation
            </p>
            <nav className="space-y-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-300 shadow-lg shadow-indigo-500/10 border border-indigo-500/25'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                    }`
                  }
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>


          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-indigo-300 font-bold text-xs uppercase tracking-wide">
                ML Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Binary Classification for early student dropout intervention with 5+ engineered features.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {['XGBoost', 'sklearn', 'FastAPI'].map(tag => (
                <span key={tag} className="chip">{tag}</span>
              ))}
            </div>
          </div>
        </div>


        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-500 font-medium">System Operational</span>
          </div>
        </div>
      </aside>
    </>
  );
};


