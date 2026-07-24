import { Calendar, CheckSquare, Sun, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onChange }: SidebarProps) {
  const tabs = [
    { id: 'today', label: 'Hoy', icon: Sun },
    { id: 'itinerary', label: 'Ruta', icon: Calendar },
    { id: 'budget', label: 'Gastos', icon: Wallet },
    { id: 'tools', label: 'Útiles', icon: CheckSquare },
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-100 shadow-sm flex flex-col p-6 z-20">
      <div className="mb-12 flex items-center gap-3">
         <button onClick={() => onChange('map')} className="text-3xl hover:scale-110 active:scale-95 transition-transform" aria-label="Abrir mapa">🏝️</button>
         <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Tenerife<span className="text-orange-500">.</span></h1>
      </div>
      
      <nav className="flex-1 flex flex-col gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold text-sm w-full text-left",
                isActive 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-200" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="uppercase tracking-widest text-xs">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4 bg-orange-50 rounded-2xl">
        <p className="text-[10px] text-orange-800 font-bold uppercase mb-1">Estado de Viaje</p>
        <p className="text-[11px] text-orange-900 leading-tight italic">Itinerario sincronizado para Agosto 2026.</p>
      </div>
    </aside>
  );
}
