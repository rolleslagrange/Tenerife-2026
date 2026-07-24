import { MapPin, Pencil, Check, X, Car, Bus, Lightbulb, GripVertical, Trash2, Plus, Navigation2 } from "lucide-react";
import { itineraryData } from "../data";
import { useState, useRef, useEffect } from "react";
import React from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { DayPlan } from "../types";
import { cn } from "../lib/utils";
import { SwipeableItem } from "../components/SwipeableItem";
import { Reorder, useDragControls, AnimatePresence, motion } from "motion/react";

type RouteItem = { id: string; text: string };

function RouteEditItem({ item, idx, setEditedRoute, editedRoute }: { key?: React.Key, item: RouteItem, idx: number, setEditedRoute: (route: RouteItem[]) => void, editedRoute: RouteItem[] }) {
  const dragControls = useDragControls();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
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

function AutoResizingTextarea({ value, onChange, className, placeholder }: { value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, className?: string, placeholder?: string }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      className={cn("resize-none overflow-hidden break-words", className)}
      placeholder={placeholder}
      rows={1}
    />
  );
}

function getComputedDate(index: number) {
  const date = new Date(2026, 7, index + 1);
  const weekdayStr = new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(date);
  const dayStr = date.getDate();
  const monthStr = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(date);
  return `${weekdayStr.charAt(0).toUpperCase() + weekdayStr.slice(1)} ${dayStr} ${monthStr.charAt(0).toUpperCase() + monthStr.slice(1)}`;
}

interface DayItemProps {
  key?: React.Key | number;
  day: DayPlan;
  index: number;
  isExpanded: boolean;
  startEdit: (day: DayPlan, e: React.MouseEvent) => void;
  deleteDay: (dayId: number) => void;
  setExpandedDay: (dayId: number | null) => void;
}

function DayItem({
  day, index, isExpanded, startEdit, deleteDay, setExpandedDay
}: DayItemProps) {
  const dragControls = useDragControls();
  const computedDate = getComputedDate(index);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<number>(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isExpanded) return;
    const nativeEvent = e.nativeEvent;
    timeoutRef.current = setTimeout(() => {
      setIsLongPressing(true);
      dragControls.start(nativeEvent);
    }, 400); // 400ms to activate drag
  };

  const cancelLongPress = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Slight delay so onClick knows we were dragging and can prevent toggle
    setTimeout(() => setIsLongPressing(false), 50);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPressing) {
      e.preventDefault();
      return;
    }
    setExpandedDay(isExpanded ? null : day.day);
  };

  const handleExpandedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 350; // ms
    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      startEdit(day, e);
      lastTapRef.current = 0; // reset
    } else {
      lastTapRef.current = now;
    }
  };

  return (
    <Reorder.Item 
      value={day} 
      dragListener={false}
      dragControls={dragControls}
      className="relative w-full"
      animate={isLongPressing ? { rotate: [-1, 1, -1.5, 1.5, 0], scale: 1.02 } : { rotate: 0, scale: 1 }}
      transition={isLongPressing ? { rotate: { repeat: Infinity, duration: 0.25 } } : {}}
      onPointerUp={cancelLongPress}
      onPointerCancel={cancelLongPress}
    >
      <SwipeableItem
        onEdit={(e) => startEdit(day, e)}
        onDelete={() => deleteDay(day.day)}
        isEditing={false}
        isExpanded={isExpanded}
        isSwipeDisabled={isExpanded}
      >
        <div 
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          className={cn(
            "p-6 h-full w-full transition-all cursor-pointer relative overflow-hidden flex flex-col active:scale-[0.98]",
            isExpanded && "bg-slate-50/50"
          )}
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{computedDate}</span>
                <h3 className="text-2xl font-bold mt-1 text-slate-900 leading-tight flex items-center gap-2">
                  <span>Día {index + 1}</span>
                  <span className="text-2xl ml-1">{day.icon}</span>
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full shrink-0 shadow-sm" title={day.car ? "Coche disponible" : "Transporte público / No coche"}>
                  {day.car ? <Car className="w-5 h-5" /> : <Bus className="w-5 h-5" />}
                </span>
              </div>
            </div>
            
            <h4 className="text-sm font-bold text-slate-800 mt-2 mb-1">{day.title}</h4>
            
            {!isExpanded && (
              <p className="text-sm text-slate-500 line-clamp-2 mt-1">{day.desc}</p>
            )}

            {isExpanded && (
              <div 
                className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300 cursor-default" 
                onClick={handleExpandedClick}
              >
                <p className="text-sm text-slate-600 mb-5 font-medium leading-relaxed select-none">{day.desc}</p>
                
                <div className="bg-slate-50 p-5 rounded-[1.5rem] mb-4 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4 flex items-center gap-1.5">
                    <Navigation2 className="w-4 h-4 text-orange-500" />
                    Ruta del Día
                  </h4>
                  <ul className="text-sm font-medium text-slate-700 space-y-4">
                    {day.route.map((r, i) => (
                      <li key={i} className="flex gap-3 items-start group">
                        <div className="w-6 h-6 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold text-slate-400 group-hover:border-orange-300 group-hover:text-orange-500 transition-colors">
                          {i + 1}
                        </div>
                        <span className="leading-snug pt-1">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-[1.5rem] mb-2 relative overflow-hidden border border-slate-100 shadow-sm flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100/50 text-orange-500">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {day.tip}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </SwipeableItem>
    </Reorder.Item>
  );
}

export default function ItineraryView() {
  const [itinerary, setItinerary] = useLocalStorage<DayPlan[]>('tenerife_itinerary', itineraryData);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<DayPlan | null>(null);
  const [editedRoute, setEditedRoute] = useState<{id: string, text: string}[]>([]);
  const [slideDirection, setSlideDirection] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const modalDragControls = useDragControls();

  const startEdit = (day: DayPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideDirection(0);
    setEditingDay(day.day);
    setEditForm({ ...day });
    setEditedRoute(day.route.map(r => ({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
      text: r
    })));
    setExpandedDay(day.day);
  };

  const switchDay = (direction: 1 | -1) => {
    if (!editForm) return;
    const currentIndex = itinerary.findIndex(d => d.day === editingDay);
    if (currentIndex === -1) return;
    
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= itinerary.length) return;
    
    setSlideDirection(direction);
    
    // Save current edit first
    const updatedItinerary = itinerary.map(d => d.day === editForm.day ? { ...editForm, route: editedRoute.map(r => r.text).filter(r => r.trim() !== '') } : d);
    setItinerary(updatedItinerary);
    
    const nextDay = updatedItinerary[nextIndex];
    setEditForm({ ...nextDay });
    setEditedRoute(nextDay.route.map(r => ({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
      text: r
    })));
    setEditingDay(nextDay.day);
  };

  const cancelEdit = () => {
    setEditingDay(null);
    setEditForm(null);
    setEditedRoute([]);
  };

  const saveEdit = () => {
    if (editForm) {
      setItinerary(itinerary.map(d => d.day === editForm.day ? { ...editForm, route: editedRoute.map(r => r.text).filter(r => r.trim() !== '') } : d));
    }
    setEditingDay(null);
    setEditForm(null);
    setEditedRoute([]);
  };

  const deleteDay = (dayId: number) => {
    setDeleteConfirm(dayId);
  };

  const confirmDelete = () => {
    if (deleteConfirm !== null) {
      setItinerary(itinerary.filter(d => d.day !== deleteConfirm));
      if (expandedDay === deleteConfirm) setExpandedDay(null);
      if (editingDay === deleteConfirm) cancelEdit();
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mt-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">Itinerario Completo</h1>
        <p className="text-sm font-medium text-slate-500">Agosto 2026 • Tenerife</p>
      </div>

      <Reorder.Group axis="y" values={itinerary} onReorder={setItinerary} className="flex flex-col gap-5 pb-24">
        {itinerary.map((day, index) => (
          <DayItem 
            key={day.day}
            day={day}
            index={index}
            isExpanded={expandedDay === day.day}
            startEdit={startEdit}
            deleteDay={deleteDay}
            setExpandedDay={setExpandedDay}
          />
        ))}
        
        <button 
          onClick={() => {
            const newDayId = itinerary.length > 0 ? Math.max(...itinerary.map(d => d.day)) + 1 : 1;
            const newDay: DayPlan = {
              day: newDayId,
              date: getComputedDate(itinerary.length),
              title: "Nuevo Día",
              desc: "Añade una descripción de la jornada.",
              icon: "📍",
              car: true,
              route: [],
              tip: "",
              food: ""
            };
            setItinerary([...itinerary, newDay]);
          }}
          className="w-full flex items-center justify-center gap-2 py-4 mt-2 bg-orange-50 text-orange-600 rounded-3xl border-2 border-dashed border-orange-200 font-bold hover:bg-orange-100/70 hover:border-orange-300 transition-all active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" /> Añadir Día
        </button>
      </Reorder.Group>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-2">Eliminar Día</h3>
              <p className="text-slate-500 mb-6 font-medium leading-relaxed">¿Estás seguro de que quieres eliminar este día del itinerario? Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirm(null)} 
                  className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-sm"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingDay && editForm && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex flex-col bg-[#F4F7F9]/80 backdrop-blur-sm sm:p-6"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 1 }}
            dragListener={false}
            dragControls={modalDragControls}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                saveEdit();
              }
            }}
          >
            <div className="bg-white flex-1 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl sm:border sm:border-slate-100 flex flex-col overflow-hidden max-w-2xl w-full mx-auto mt-16 sm:mt-0 relative">
              
              {/* Drag Handle Area */}
              <div 
                className="w-full flex justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing touch-none shrink-0"
                onPointerDown={(e) => modalDragControls.start(e)}
              >
                <div className="w-16 h-2 bg-slate-300 hover:bg-slate-400 transition-colors rounded-full"></div>
              </div>

              <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100 shrink-0 bg-white relative z-10">
                <h2 className="font-extrabold text-slate-900">Editar Día</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => deleteDay(editingDay!)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-full transition-colors mr-2 shadow-sm">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden relative">
                <AnimatePresence custom={slideDirection} mode="popLayout" initial={false}>
                  <motion.div 
                    key={editingDay}
                    custom={slideDirection}
                    variants={{
                      enter: (dir: number) => ({ x: dir === 1 ? '100%' : '-100%', opacity: 0 }),
                      center: { x: 0, opacity: 1 },
                      exit: (dir: number) => ({ x: dir === 1 ? '-100%' : '100%', opacity: 0 })
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = offset.x;
                      if (swipe < -50 || velocity.x < -500) {
                        switchDay(1);
                      } else if (swipe > 50 || velocity.x > 500) {
                        switchDay(-1);
                      }
                    }}
                    className="absolute inset-0 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  >
                    <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Título</label>
                  <input 
                    value={editForm.title} 
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" 
                  />
                </div>
                <div className="w-16 shrink-0 flex flex-col justify-end">
                  <input 
                    value={editForm.icon} 
                    onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-1 py-3 text-xl text-center focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all h-[46px]" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Transporte</label>
                <button
                  onClick={() => setEditForm({ ...editForm, car: !editForm.car })}
                  className="w-full flex items-center justify-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all hover:bg-slate-100"
                >
                  {editForm.car ? (
                    <><Car className="w-5 h-5 text-slate-900" /> Coche Disponible</>
                  ) : (
                    <><Bus className="w-5 h-5 text-slate-900" /> Transporte Público</>
                  )}
                </button>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Descripción</label>
                <AutoResizingTextarea 
                  value={editForm.desc} 
                  onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[100px]" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Ruta del Día</label>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <Reorder.Group axis="y" values={editedRoute} onReorder={setEditedRoute} className="space-y-3">
                    {editedRoute.map((item, idx) => (
                      <RouteEditItem 
                        key={item.id} 
                        item={item} 
                        idx={idx} 
                        editedRoute={editedRoute} 
                        setEditedRoute={setEditedRoute} 
                      />
                    ))}
                  </Reorder.Group>
                  <button 
                    onClick={() => {
                      const newItem = { id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7), text: '' };
                      setEditedRoute([...editedRoute, newItem]);
                    }}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl hover:bg-white hover:border-slate-300 transition-colors font-bold text-sm"
                  >
                    <Plus className="w-4 h-4" /> Añadir Parada
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Tips</label>
                <AutoResizingTextarea 
                  value={editForm.tip} 
                  onChange={(e) => setEditForm({ ...editForm, tip: e.target.value })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[80px]" 
                />
              </div>
              
              <div className="h-24 sm:h-8"></div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

