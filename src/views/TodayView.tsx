import { MapPin, Check, Pencil, Plus, Trash2, X, GripVertical, Car, Bus, Navigation2, Save, Lightbulb } from "lucide-react";
import React, { useState, useRef } from "react";
import { Reorder, useDragControls, AnimatePresence, motion } from "motion/react";
import { itineraryData } from "../data";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { DayPlan } from "../types";
import { cn, generateId } from "../lib/utils";

type RouteItem = { id: string; text: string };

function RouteEditItem({ item, idx, setEditedRoute, editedRoute }: { key?: React.Key, item: RouteItem, idx: number, setEditedRoute: (route: RouteItem[]) => void, editedRoute: RouteItem[] }) {
  const dragControls = useDragControls();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${Math.max(44, textareaRef.current.scrollHeight)}px`;
    }
  }, [item.text]);
  
  return (
    <Reorder.Item 
      as="div"
      value={item} 
      dragListener={false}
      dragControls={dragControls}
      className="flex items-center gap-3 bg-white rounded-2xl p-2 pr-3 border border-slate-100 shadow-sm relative z-10 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-300 transition-shadow"
    >
      <div 
        className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-colors shrink-0"
        onPointerDown={(e) => dragControls.start(e)}
        style={{ touchAction: "none" }}
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-[10px] font-black shrink-0">
        {idx + 1}
      </div>
      <textarea 
        ref={textareaRef}
        value={item.text}
        onChange={(e) => {
          const newRoute = [...editedRoute];
          newRoute[idx] = { ...newRoute[idx], text: e.target.value };
          setEditedRoute(newRoute);
        }}
        className="flex-1 bg-transparent border-none text-slate-700 font-medium text-sm focus:outline-none resize-none min-h-[44px] py-3 overflow-hidden break-words"
        placeholder="Describe esta parada..."
        rows={1}
      />
      <button 
        onClick={() => {
          const newRoute = editedRoute.filter((_, i) => i !== idx);
          setEditedRoute(newRoute);
        }}
        className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl shrink-0 transition-colors"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </Reorder.Item>
  );
}

export default function TodayView() {
  const [itinerary, setItinerary] = useLocalStorage<DayPlan[]>('tenerife_itinerary', itineraryData);
  const [currentDayIndex, setCurrentDayIndex] = useLocalStorage('currentDayIndex', 0);
  const [routeProgress, setRouteProgress] = useLocalStorage<Record<number, number>>('tenerife_route_progress', {});
  
  const [isEditingRoute, setIsEditingRoute] = useState(false);
  const [editedRoute, setEditedRoute] = useState<RouteItem[]>([]);
  const [slideDirection, setSlideDirection] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const todayPlan = itinerary[currentDayIndex] || itineraryData[0];
  const currentStep = routeProgress[todayPlan.day] || 0;

  const startLongPress = () => {
    if (isEditingRoute) return;
    timerRef.current = setTimeout(() => {
      setEditedRoute(todayPlan.route.map(r => ({ 
        id: generateId(), 
        text: r 
      })));
      setIsEditingRoute(true);
    }, 600);
  };

  const clearLongPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const saveRoute = () => {
    setItinerary(prev => {
      const newItinerary = [...prev];
      const dayIndex = newItinerary.findIndex(d => d.day === todayPlan.day);
      if (dayIndex !== -1) {
        newItinerary[dayIndex] = { ...newItinerary[dayIndex], route: editedRoute.map(r => r.text).filter(r => r.trim() !== '') };
      }
      return newItinerary;
    });
    setIsEditingRoute(false);
  };

  const advanceProgress = (index: number) => {
    setRouteProgress(prev => {
      // Si se pulsa el paso actual, avanzamos al siguiente. Si no, saltamos a ese paso.
      const next = (prev[todayPlan.day] || 0) === index ? index + 1 : index;
      return { ...prev, [todayPlan.day]: next };
    });
  };

  // Functions to go to next/prev day
  const goNext = () => {
    if (currentDayIndex < itinerary.length - 1) {
      setSlideDirection(1);
      setCurrentDayIndex(prev => prev + 1);
    }
  };
  
  const goPrev = () => {
    if (currentDayIndex > 0) {
      setSlideDirection(-1);
      setCurrentDayIndex(prev => prev - 1);
    }
  };

  return (
    <AnimatePresence mode="popLayout" initial={false} custom={slideDirection}>
      <motion.div 
        key={currentDayIndex}
        custom={slideDirection}
        variants={{
          enter: (dir: number) => ({ x: dir === 1 ? '100%' : '-100%', opacity: 0, scale: 0.95 }),
          center: { x: 0, opacity: 1, scale: 1 },
          exit: (dir: number) => ({ x: dir === 1 ? '-100%' : '100%', opacity: 0, scale: 0.95 })
        }}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={(e, info) => {
          if (info.offset.x < -50 || info.velocity.x < -500) {
            goNext();
          } else if (info.offset.x > 50 || info.velocity.x > 500) {
            goPrev();
          }
        }}
        className="space-y-6 pb-12 w-full touch-pan-y"
      >
        
        <div className="flex justify-between items-center mt-4">
          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{todayPlan.date}</h2>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none mt-1">Día {todayPlan.day}</h1>
          </div>
        </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="px-4 py-1.5 bg-orange-100 text-orange-700 text-sm font-bold rounded-full uppercase tracking-wider inline-block">Actividad del Día {todayPlan.icon}</span>
            <span className="w-9 h-9 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full shrink-0" title={todayPlan.car ? "Coche disponible" : "Transporte público / No coche"}>
              {todayPlan.car ? <Car className="w-5 h-5" /> : <Bus className="w-5 h-5" />}
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-slate-900">{todayPlan.title}</h3>
          <p className="text-slate-500 font-medium leading-relaxed text-sm">{todayPlan.desc}</p>
        </div>
      </div>

      <div 
        className={cn(
          "bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative",
          !isEditingRoute && "select-none"
        )}
        onMouseDown={!isEditingRoute ? startLongPress : undefined}
        onMouseUp={!isEditingRoute ? clearLongPress : undefined}
        onMouseLeave={!isEditingRoute ? clearLongPress : undefined}
        onTouchStart={!isEditingRoute ? startLongPress : undefined}
        onTouchEnd={!isEditingRoute ? clearLongPress : undefined}
      >
        {!isEditingRoute ? (
          <>
            <h4 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-6 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Navigation2 className="w-4 h-4 text-orange-500" />
                Ruta del Día
              </span>
            </h4>
            <div className="space-y-0">
              {todayPlan.route.map((r, i) => {
                const isCompleted = i < currentStep;
                const isCurrent = i === currentStep;
                const isUpcoming = i > currentStep;
                const isLast = i === todayPlan.route.length - 1;

                return (
                  <div 
                    key={i} 
                    className="flex gap-4 cursor-pointer group"
                    onClick={() => advanceProgress(i)}
                  >
                    <div className="flex flex-col items-center gap-0">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 z-10",
                        isCompleted ? "bg-slate-100 text-slate-400" : 
                        isCurrent ? "bg-orange-500 text-white shadow-md shadow-orange-200 ring-4 ring-orange-50" : 
                        "bg-white border-2 border-slate-200 text-slate-300 group-hover:border-slate-300"
                      )}>
                        {isCompleted ? <Check className="w-4 h-4" /> : 
                         isCurrent ? <Navigation2 className="w-4 h-4 fill-current" /> : 
                         <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-slate-300 transition-colors" />}
                      </div>
                      {!isLast && (
                        <div className={cn(
                          "w-0.5 h-12 transition-colors duration-300 -my-2", 
                          isCompleted ? "bg-orange-500" : "bg-slate-100"
                        )}></div>
                      )}
                    </div>
                    <div className={cn(
                      "pb-6 transition-all duration-300 flex-1",
                      isCompleted ? "opacity-40" :
                      isCurrent ? "opacity-100" :
                      "opacity-70"
                    )}>
                      <div className={cn(
                        "transition-all duration-300 rounded-2xl",
                        isCurrent ? "bg-orange-50 p-4 -mt-3 -ml-2 -mr-2 ring-1 ring-orange-100/50 shadow-sm relative overflow-hidden" : "pt-1"
                      )}>
                        {isCurrent && (
                          <div className="absolute top-0 right-0 w-16 h-16 bg-white/40 blur-2xl rounded-full -mr-8 -mt-8 pointer-events-none" />
                        )}
                        <p className={cn(
                          "font-bold leading-tight transition-colors duration-300 relative z-10",
                          isCompleted ? "line-through text-slate-500" :
                          isCurrent ? "text-orange-950 text-base" : "text-slate-600 text-sm"
                        )}>{r}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {currentStep >= todayPlan.route.length && (
              <div className="mt-4 p-4 bg-green-50 rounded-2xl flex items-center gap-3 text-green-700 animate-in fade-in zoom-in duration-500">
                <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">¡Ruta completada!</p>
                  <p className="text-xs font-medium opacity-80">Has terminado todas las paradas de hoy.</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="cursor-default">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
                <Pencil className="w-4 h-4 text-orange-500" />
                Editar Ruta
              </h4>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditingRoute(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button 
                  onClick={saveRoute}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 shadow-sm shadow-green-200 transition-colors"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <Reorder.Group as="div" axis="y" values={editedRoute} onReorder={setEditedRoute} className="flex flex-col gap-3 mb-4 list-none p-0 m-0">
              {editedRoute.map((item, idx) => (
                <RouteEditItem 
                  key={item.id}
                  item={item} 
                  idx={idx} 
                  setEditedRoute={setEditedRoute} 
                  editedRoute={editedRoute} 
                />
              ))}
            </Reorder.Group>
            
            <button 
              onClick={() => setEditedRoute([...editedRoute, { id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7), text: "" }])}
              className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-bold text-sm flex items-center justify-center gap-2 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Añadir Parada
            </button>
          </div>
        )}
      </div>

      <div className="bg-orange-50 p-6 rounded-[2rem] shadow-sm border border-orange-100 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/50 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
        <h4 className="font-bold text-orange-600 uppercase text-xs tracking-widest mb-4 flex items-center gap-2 relative z-10">
          <Lightbulb className="w-4 h-4" />
          TIPS
        </h4>
        <div className="relative z-10">
          <p className="text-sm text-[#968282] font-medium leading-relaxed">{todayPlan.tip}</p>
        </div>
      </div>

      </motion.div>
    </AnimatePresence>
  );
}
