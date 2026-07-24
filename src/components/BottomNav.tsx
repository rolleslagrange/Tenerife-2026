import { Calendar, CheckSquare, Sun, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  const tabs = [
    { id: 'today', label: 'Hoy', icon: Sun },
    { id: 'itinerary', label: 'Ruta', icon: Calendar },
    { id: 'budget', label: 'Gastos', icon: Wallet },
    { id: 'tools', label: 'Útiles', icon: CheckSquare },
  ];

  return (
    <div className="fixed md:hidden bottom-6 left-6 right-6 z-50 pb-safe">
      <nav className="bg-white h-20 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center justify-around px-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all",
                isActive ? "text-orange-500 scale-110" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-[10px] font-bold uppercase tracking-widest", isActive && "text-orange-500")}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
