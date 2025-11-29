import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  HardHat,
  Briefcase,
  ChevronRight,
  Files,
  BarChart3,
  Receipt
} from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'quotes', label: 'Devis', icon: FileText },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'templates', label: 'Șabloane', icon: Files },
    { id: 'invoices', label: 'Facturi', icon: Receipt },
    { id: 'reports', label: 'Rapoarte', icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-[#0f172a] text-white h-screen flex flex-col fixed left-0 top-0 border-r border-gray-800 z-50 transition-all duration-300 font-sans">
      {/* Logo Area */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="font-bold text-white text-lg">C</span>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">Costructor</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Pro Edition</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-3">Menu Principal</div>

        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white transition-colors'} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} className="opacity-75" />}
            </button>
          );
        })}

        <div className="mt-8 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-3">Paramètres</div>

        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors">
          <Settings size={18} />
          <span>Configuration</span>
        </button>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800 bg-[#020617]">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm border-2 border-[#1e293b] group-hover:border-indigo-500 transition-colors">
            PB
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">Polistibrick</p>
            <p className="text-xs text-gray-400 truncate">admin@polistibrick.fr</p>
          </div>
          <LogOut size={16} className="text-gray-500 hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  );
};