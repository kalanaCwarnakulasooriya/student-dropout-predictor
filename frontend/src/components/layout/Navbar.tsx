import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Menu, X, Server, Zap } from 'lucide-react';
import { checkBackendStatus } from '../../services/predictionService';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    checkBackendStatus().then(status => {
      if (isMounted) setBackendOnline(status);
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <header className="navbar-bg sticky top-0 z-30 h-16">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">


        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-3 group">

            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>

            <div>
              <div className="font-extrabold text-white tracking-tight text-lg leading-none">
                EduRisk<span className="gradient-text">AI</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block mt-0.5">
                Student Dropout Risk Early Warning System
              </p>
            </div>
          </Link>
        </div>


        <div className="flex items-center gap-3">

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium glass border-0">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">API:</span>
            {backendOnline === true ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Fallback Mode
              </span>
            )}
          </div>


          <Link
            to="/predict"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white btn-gradient rounded-xl shadow-lg shadow-indigo-500/30"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Predict Risk</span>
          </Link>
        </div>

      </div>
    </header>
  );
};
