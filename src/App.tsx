import { useState } from 'react';
import TodayView from './views/TodayView';
import ItineraryView from './views/ItineraryView';
import BudgetView from './views/BudgetView';
import ToolsView from './views/ToolsView';
import MapView from './views/MapView';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('today');

  return (
    <div className="h-[100dvh] w-full bg-[#F4F7F9] flex flex-col md:flex-row overflow-hidden relative font-sans text-slate-900">
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full z-20">
        <Sidebar activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Mobile Header */}
      <header className="md:hidden bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-20 shadow-sm shrink-0">
         <div className="flex flex-col">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Tenerife<span className="text-orange-500">.</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agosto 2026</p>
         </div>
         <button onClick={() => setActiveTab('map')} className="text-2xl hover:scale-110 active:scale-95 transition-transform" aria-label="Abrir mapa">🏝️</button>
      </header>

      {/* Scrollable Content Area */}
      <main className={cn(
        "flex-1 scroll-smooth scrollbar-hide relative flex flex-col w-full z-10",
        activeTab === 'map' ? "overflow-hidden" : "overflow-y-auto"
      )}>
        <div className={cn(
          "mx-auto w-full flex-1 flex flex-col",
          activeTab === 'map' ? "max-w-none h-full" : "max-w-4xl pb-36 pt-6 px-4 md:pb-12 md:pt-10 md:px-12 min-h-max"
        )}>
          {activeTab === 'today' && <TodayView />}
          {activeTab === 'itinerary' && <ItineraryView />}
          {activeTab === 'budget' && <BudgetView />}
          {activeTab === 'tools' && <ToolsView />}
          {activeTab === 'map' && <MapView />}
        </div>
      </main>

      {/* Fixed Bottom Navigation (Mobile Only) */}
      <div className="z-20">
        <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  );
}
