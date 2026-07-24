import { Plane, Bed, Car, Plus, Trash2, Link, Pencil, Map, MapPin, Search, X, Check, Utensils, Info, GripVertical, CheckCircle2, Ticket, Video, Globe, FileText, Upload } from "lucide-react";
import { defaultChecklists, defaultPackingList, itineraryData } from "../data";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Note, PackingItem, SavedLink, Reservation, DayPlan, Checklist } from "../types";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { cn, generateId } from "../lib/utils";
import { motion, PanInfo, Reorder, useDragControls, AnimatePresence } from 'motion/react';
import { SwipeableItem } from "../components/SwipeableItem";

function TrashZone() {
  const [isHovering, setIsHovering] = useState(false);
  
  useEffect(() => {
    const handler = (e: any) => setIsHovering(e.detail);
    window.addEventListener('trash-hover', handler);
    return () => window.removeEventListener('trash-hover', handler);
  }, []);

  return (
    <motion.div
      key="trash"
      id="checklist-trash-zone"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isHovering ? 1.1 : 1, 
        opacity: 1, 
        rotate: isHovering ? [-5, 5, -5, 5, 0] : 0 
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ 
        rotate: isHovering ? { repeat: Infinity, duration: 0.25 } : { duration: 0.2 },
        scale: { type: "spring", bounce: 0.5, duration: 0.3 },
        opacity: { duration: 0.2 }
      }}
      className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border z-40 transition-colors shadow-inner", 
        isHovering ? "bg-red-500 text-white border-red-600 shadow-md" : "bg-red-100 text-red-500 border-red-200"
      )}
    >
      <Trash2 className="w-5 h-5" />
    </motion.div>
  );
}

function ChecklistItem({ item, onToggle, onRemove, onEdit }: { key?: React.Key, item: PackingItem, onToggle: () => void, onRemove: () => void, onEdit: (newText: string) => void }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.label);
  
  const editTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragControls = useDragControls();
  const [isDraggingItem, setIsDraggingItem] = useState(false);

  const handlePointerDown = () => {
    if (isEditing) return;
    
    cancelTimers();
    editTimeoutRef.current = setTimeout(() => {
      setIsEditing(true);
    }, 600);

    const handleGlobalPointerUp = () => {
      cancelTimers();
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
  };

  const cancelTimers = () => {
    if (editTimeoutRef.current) clearTimeout(editTimeoutRef.current);
  };

  const handleDragEnd = (e: any, info: PanInfo) => {
    if (info.offset.x < -40 || info.velocity.x < -300) {
      setIsRevealed(true);
    } else {
      setIsRevealed(false);
    }
  };

  if (isEditing) {
    return (
      <form 
        onSubmit={(e) => { e.preventDefault(); onEdit(editText); setIsEditing(false); }}
        className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-orange-200"
      >
        <input 
          type="text" 
          value={editText} 
          onChange={e => setEditText(e.target.value)} 
          className="flex-1 bg-transparent text-sm focus:outline-none"
          autoFocus
          onBlur={() => { onEdit(editText); setIsEditing(false); }}
        />
      </form>
    );
  }

  return (
    <Reorder.Item 
      as="div"
      value={item} 
      id={item.id}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={() => {
        setIsDraggingItem(true);
        cancelTimers();
      }}
      onDragEnd={() => setIsDraggingItem(false)}
      className="relative rounded-xl w-full"
      style={{ zIndex: isDraggingItem ? 50 : 1 }}
    >
      <div className="absolute inset-y-0 right-0 flex items-center justify-end pr-3 bg-red-50 text-red-500 rounded-xl w-full overflow-hidden">
        <button onClick={onRemove} className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100 hover:bg-red-200 transition-colors shadow-sm">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -60, right: 0 }}
        dragElastic={0.1}
        onDragStart={cancelTimers}
        onDragEnd={handleDragEnd}
        animate={{ x: isRevealed ? -60 : 0 }}
        onPointerDown={handlePointerDown}
        className="relative bg-white w-full h-full z-10 flex items-center gap-3 rounded-xl p-2 select-none"
        style={{ touchAction: 'pan-y' }}
      >
        <label className="flex items-center gap-3 cursor-pointer flex-1" onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <input 
              type="checkbox"
              className="sr-only"
              checked={item.checked}
              onChange={onToggle}
            />
            <div className={cn(
              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors",
              item.checked ? "bg-green-500 border-green-500 text-white" : "border-slate-200 bg-white"
            )}>
              {item.checked && <CheckCircle2 className="w-4 h-4" strokeWidth={3} />}
            </div>
          </div>
          <span className={cn("text-sm transition-all flex-1", item.checked ? "text-slate-400 line-through" : "text-slate-700 font-medium")}>
            {item.label}
          </span>
        </label>
        
        {/* Grip Handle for Reordering */}
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="px-2 text-slate-300 cursor-grab active:cursor-grabbing flex items-center justify-center touch-none shrink-0"
        >
          <GripVertical className="w-5 h-5" />
        </div>
      </motion.div>
    </Reorder.Item>
  );
}

function ChecklistTab({ 
  list, 
  isActive, 
  onClick, 
  onRename, 
  onDelete,
  onDragStart,
  onDragEnd,
  constraintsRef
}: { 
  key?: React.Key,
  list: Checklist, 
  isActive: boolean, 
  onClick: () => void, 
  onRename: () => void, 
  onDelete: (id: string) => void,
  onDragStart: () => void,
  onDragEnd: () => void,
  constraintsRef: React.RefObject<any>
}) {
  const dragControls = useDragControls();
  const vibrateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPressing, setIsPressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const tabRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragControls.start(e);
    
    cancelTimers();
    vibrateTimeoutRef.current = setTimeout(() => {
      setIsPressing(true);
    }, 300);

    editTimeoutRef.current = setTimeout(() => {
      setIsPressing(false);
      onRename();
    }, 800);

    const handleGlobalPointerEnd = () => {
      cancelTimers();
      window.removeEventListener('pointerup', handleGlobalPointerEnd);
      window.removeEventListener('pointercancel', handleGlobalPointerEnd);
      window.removeEventListener('touchend', handleGlobalPointerEnd);
    };
    window.addEventListener('pointerup', handleGlobalPointerEnd);
    window.addEventListener('pointercancel', handleGlobalPointerEnd);
    window.addEventListener('touchend', handleGlobalPointerEnd);
  };

  const cancelTimers = () => {
    setIsPressing(false);
    if (vibrateTimeoutRef.current) clearTimeout(vibrateTimeoutRef.current);
    if (editTimeoutRef.current) clearTimeout(editTimeoutRef.current);
  };

  return (
    <Reorder.Item
      as="div"
      ref={tabRef}
      value={list}
      id={list.id}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={() => {
        setIsDragging(true);
        cancelTimers();
        onDragStart();
      }}
      onDrag={(e, info) => {
        const trashEl = document.getElementById('checklist-trash-zone');
        if (trashEl && tabRef.current) {
          const trashRect = trashEl.getBoundingClientRect();
          const tabRect = tabRef.current.getBoundingClientRect();
          
          // Check pointer overlap
          const pointerHover = (
            info.point.x >= trashRect.left - 20 &&
            info.point.x <= trashRect.right + 20 &&
            info.point.y >= trashRect.top - 20 &&
            info.point.y <= trashRect.bottom + 20
          );
          
          // Check element overlap (AABB)
          const elementHover = !(
            tabRect.right < trashRect.left ||
            tabRect.left > trashRect.right ||
            tabRect.bottom < trashRect.top ||
            tabRect.top > trashRect.bottom
          );
          
          const hovering = pointerHover || elementHover;
          
          // @ts-ignore
          if (window.__trashHovering !== hovering) {
            // @ts-ignore
            window.__trashHovering = hovering;
            window.dispatchEvent(new CustomEvent('trash-hover', { detail: hovering }));
          }
        }
      }}
      onDragEnd={(e, info) => {
        setIsDragging(false);
        // @ts-ignore
        window.__trashHovering = false;
        window.dispatchEvent(new CustomEvent('trash-hover', { detail: false }));
        onDragEnd();
        const trashEl = document.getElementById('checklist-trash-zone');
        if (trashEl && tabRef.current) {
          const trashRect = trashEl.getBoundingClientRect();
          const tabRect = tabRef.current.getBoundingClientRect();
          
          const pointerHover = (
            info.point.x >= trashRect.left - 20 &&
            info.point.x <= trashRect.right + 20 &&
            info.point.y >= trashRect.top - 20 &&
            info.point.y <= trashRect.bottom + 20
          );
          
          const elementHover = !(
            tabRect.right < trashRect.left ||
            tabRect.left > trashRect.right ||
            tabRect.bottom < trashRect.top ||
            tabRect.top > trashRect.bottom
          );
          
          if (pointerHover || elementHover) {
            onDelete(list.id);
          }
        }
      }}
      dragConstraints={constraintsRef}
      dragElastic={0.1}
      className="relative shrink-0 touch-none"
      style={{ zIndex: isDragging ? 100 : 1 }}
    >
      <motion.button
        type="button"
        animate={isPressing ? { 
          scale: 0.95,
          rotate: [-1.5, 1.5, -1.5, 1.5, 0]
        } : {
          scale: 1,
          rotate: 0
        }}
        transition={isPressing ? { rotate: { repeat: Infinity, duration: 0.25 } } : { duration: 0.2 }}
        onPointerDown={handlePointerDown}
        onPointerUp={cancelTimers}
        onPointerLeave={cancelTimers}
        onPointerCancel={cancelTimers}
        onClick={onClick}
        className={cn(
          "px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors shrink-0",
          isActive 
            ? "bg-orange-500 text-white shadow-md shadow-orange-200" 
            : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200"
        )}
      >
        {list.name}
      </motion.button>
    </Reorder.Item>
  );
}

const LINK_CATEGORIES: { id: SavedLink['category'], icon: any, label: string, colorClass: string }[] = [
  { id: 'Restaurante', icon: Utensils, label: 'Restaurante', colorClass: 'bg-orange-500 text-white' },
  { id: 'Ruta', icon: Map, label: 'Ruta / Mapa', colorClass: 'bg-emerald-500 text-white' },
  { id: 'Actividad', icon: Ticket, label: 'Actividad', colorClass: 'bg-blue-500 text-white' },
  { id: 'Vídeo', icon: Video, label: 'Vídeo', colorClass: 'bg-red-500 text-white' },
  { id: 'Info', icon: Info, label: 'Info / Artículo', colorClass: 'bg-purple-500 text-white' },
  { id: 'Web', icon: Globe, label: 'Web General', colorClass: 'bg-slate-200 text-slate-600' }
];

export default function ToolsView() {
  const [checklists, setChecklists] = useLocalStorage<Checklist[]>('tenerife_checklists', []);
  const [oldPackingList] = useLocalStorage<PackingItem[]>('tenerife_packing', []);

  useEffect(() => {
    if (checklists.length === 0) {
      if (oldPackingList.length > 0) {
        setChecklists([{ id: 'c1', name: 'Equipaje', items: oldPackingList }]);
      } else {
        setChecklists(defaultChecklists);
      }
    }
  }, []);

  const [activeChecklistId, setActiveChecklistId] = useState<string>('');
  const [isDraggingTab, setIsDraggingTab] = useState(false);
  
  useEffect(() => {
    if (checklists.length > 0 && !activeChecklistId) {
      setActiveChecklistId(checklists[0].id);
    } else if (checklists.length === 0 && activeChecklistId) {
      setActiveChecklistId('');
    }
  }, [checklists, activeChecklistId]);

  const activeChecklist = checklists.find(c => c.id === activeChecklistId) || checklists[0];

  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState("");
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [isCreatingChecklist, setIsCreatingChecklist] = useState(false);
  const [reservations, setReservations] = useLocalStorage<Reservation[]>('tenerife_reservations', []);
  const [activeResId, setActiveResId] = useState<string | null>(null);
  const [isAddingRes, setIsAddingRes] = useState(false);
  const [editingResId, setEditingResId] = useState<string | null>(null);
  const [resTitle, setResTitle] = useState('');
  const [resSubtitle, setResSubtitle] = useState('');
  const [resType, setResType] = useState<'flight' | 'hotel' | 'car'>('flight');
  const [resCode, setResCode] = useState('');
  const [resDocUrl, setResDocUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  const [links, setLinks] = useLocalStorage<SavedLink[]>('tenerife_links', []);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<SavedLink['category'] | null>(null);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkCategory, setNewLinkCategory] = useState<SavedLink['category']>('Web');
  const [itinerary] = useLocalStorage<DayPlan[]>('tenerife_itinerary', itineraryData);
  
  const defaultReservations = useMemo<Reservation[]>(() => {
    const carDays = itinerary.filter(d => d.car).map(d => d.day);
    const carSubtitle = carDays.length > 0 
      ? `Días ${Math.min(...carDays)} al ${Math.max(...carDays)}`
      : 'Ningún día configurado';

    return [
      { id: '1', title: 'Vuelo Ida Bilbao (BIO)', subtitle: '16:10', type: 'flight', code: '#RYA-881' },
      { id: '2', title: 'Panorámica Garden', subtitle: 'El Toscal (Pto. Cruz)', type: 'hotel' },
      { id: '3', title: 'Coche de Alquiler', subtitle: carSubtitle, type: 'car' },
      { id: '4', title: 'Vuelo Vuelta a Bilbao', subtitle: '15:25', type: 'flight', code: '#RYA-882' }
    ];
  }, [itinerary]);

  useEffect(() => {
    if (reservations.length === 0 || !reservations.find(r => r.id === '4')) {
      setReservations(defaultReservations);
    } else {
      setReservations(prev => prev.map(res => {
        const def = defaultReservations.find(d => d.id === res.id);
        return def && res.type === 'car' ? { ...res, subtitle: def.subtitle } : res;
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultReservations]);
  
  const [newNote, setNewNote] = useState('');
  
  const [notes, setNotes] = useLocalStorage<Note[]>('tenerife_notes', []);
  const [newPackingItem, setNewPackingItem] = useState('');

  const toggleItem = (itemId: string) => {
    setChecklists(checklists.map(list => 
      list.id === activeChecklistId 
        ? { ...list, items: list.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i) }
        : list
    ));
  };

  const removePackingItem = (itemId: string) => {
    setChecklists(checklists.map(list => 
      list.id === activeChecklistId 
        ? { ...list, items: list.items.filter(i => i.id !== itemId) }
        : list
    ));
  };

  const handleAddPackingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackingItem.trim() || !activeChecklistId) return;
    const item: PackingItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
      label: newPackingItem,
      checked: false,
      category: 'Otro'
    };
    setChecklists(checklists.map(list => 
      list.id === activeChecklistId 
        ? { ...list, items: [item, ...list.items] }
        : list
    ));
    setNewPackingItem('');
  };

  const handleCreateChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistName.trim()) return;
    const newList: Checklist = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
      name: newChecklistName.trim(),
      items: []
    };
    setChecklists([...checklists, newList]);
    setActiveChecklistId(newList.id);
    setNewChecklistName('');
    setIsCreatingChecklist(false);
  };
  const [newChecklistName, setNewChecklistName] = useState('');

  const editPackingItem = (itemId: string, newLabel: string) => {
    if (!newLabel.trim()) return;
    setChecklists(checklists.map(list => 
      list.id === activeChecklistId 
        ? { ...list, items: list.items.map(i => i.id === itemId ? { ...i, label: newLabel.trim() } : i) }
        : list
    ));
  };

  const handleRenameChecklist = (e?: React.FormEvent | React.FocusEvent) => {
    if (e) e.preventDefault();
    if (!editingNameValue.trim() || !activeChecklistId) {
      setIsEditingName(false);
      return;
    }
    setChecklists(checklists.map(list => 
      list.id === activeChecklistId ? { ...list, name: editingNameValue.trim() } : list
    ));
    setIsEditingName(false);
  };

  const removeChecklist = (id: string) => {
    setChecklists(prev => prev.filter(c => c.id !== id));
    setTimeout(() => setIsDraggingTab(false), 500);
    if (activeChecklistId === id) {
      const updated = checklists.filter(list => list.id !== id);
      setActiveChecklistId(updated.length > 0 ? updated[0].id : '');
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: generateId(),
      text: newNote.trim(),
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    };
    setNotes([note, ...notes]);
    setNewNote('');
    if (noteInputRef.current) {
      noteInputRef.current.style.height = '44px';
    }
  };

  const removeNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkUrl.trim() || !newLinkName.trim()) return;

    const newLink: SavedLink = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
      url: newLinkUrl.trim(),
      title: newLinkName.trim(),
      category: newLinkCategory
    };
    
    setLinks([...links, newLink]);
    setNewLinkUrl("");
    setNewLinkName("");
    setNewLinkCategory("Web");
    setIsAddingLink(false);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const openAddResModal = () => {
    setResTitle('');
    setResSubtitle('');
    setResType('flight');
    setResCode('');
    setResDocUrl('');
    setEditingResId(null);
    setIsAddingRes(true);
  };

  const openEditResModal = (res: Reservation) => {
    setResTitle(res.title);
    setResSubtitle(res.subtitle || '');
    setResType(res.type);
    setResCode(res.code || '');
    setResDocUrl(res.documentUrl || '');
    setEditingResId(res.id);
    setIsAddingRes(false);
  };

  const closeResForm = () => {
    setIsAddingRes(false);
    setEditingResId(null);
    setResTitle('');
    setResSubtitle('');
    setResCode('');
    setResDocUrl('');
  };

  const handleSaveRes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim()) return;

    if (editingResId) {
      setReservations(reservations.map(r => 
        r.id === editingResId ? {
          ...r,
          title: resTitle.trim(),
          subtitle: resSubtitle.trim(),
          type: resType,
          code: resCode.trim() || undefined,
          documentUrl: resDocUrl.trim() || r.documentUrl
        } : r
      ));
    } else {
      const newRes: Reservation = {
        id: generateId(),
        title: resTitle.trim(),
        subtitle: resSubtitle.trim(),
        type: resType,
        code: resCode.trim() || undefined,
        documentUrl: resDocUrl.trim() || undefined
      };
      setReservations([...reservations, newRes]);
    }

    closeResForm();
  };

  const removeReservation = (id: string) => {
    setReservations(reservations.filter(r => r.id !== id));
    if (editingResId === id) closeResForm();
  };

  const removeDocument = (id: string) => {
    setReservations(reservations.map(r => r.id === id ? { ...r, documentUrl: undefined } : r));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeResId) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setReservations(reservations.map(res => 
          res.id === activeResId ? { ...res, documentUrl: dataUrl } : res
        ));
      };
      reader.readAsDataURL(file);
    }
    setActiveResId(null);
  };


  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mt-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">Herramientas</h1>
        <p className="text-sm font-medium text-slate-500">Logística y apuntes del viaje</p>
      </div>

      {/* Reservations Summary */}
      <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">Reservas</h3>
          {!isAddingRes && !editingResId && (
            <button 
              onClick={openAddResModal}
              className="w-9 h-9 bg-orange-500 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 active:scale-95 transition-all shadow-sm shadow-orange-200"
              title="Nueva Reserva"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept="application/pdf,image/*"
        />

        {/* Add / Edit Form */}
        {(isAddingRes || editingResId) && (
          <form onSubmit={handleSaveRes} className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col gap-4 mb-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {editingResId ? 'Editar Reserva' : 'Nueva Reserva'}
              </span>
              <button 
                type="button" 
                onClick={closeResForm} 
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type selector pills */}
            <div className="flex gap-2">
              {[
                { id: 'flight', label: 'Vuelo', icon: Plane, activeColor: 'bg-blue-500 text-white' },
                { id: 'hotel', label: 'Alojamiento', icon: Bed, activeColor: 'bg-green-500 text-white' },
                { id: 'car', label: 'Coche', icon: Car, activeColor: 'bg-orange-500 text-white' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setResType(t.id as any)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border",
                    resType === t.id ? `${t.activeColor} border-transparent shadow-sm scale-102` : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  )}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input 
                type="text"
                value={resTitle}
                onChange={(e) => setResTitle(e.target.value)}
                placeholder="Título (ej. Vuelo Ida, Hotel Panorámica)"
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 text-slate-900 font-medium"
                required
                autoFocus
              />
              <input 
                type="text"
                value={resSubtitle}
                onChange={(e) => setResSubtitle(e.target.value)}
                placeholder="Subtítulo / Horario (ej. 16:10, El Toscal)"
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input 
                type="text"
                value={resCode}
                onChange={(e) => setResCode(e.target.value)}
                placeholder="Código de reserva (ej. #RYA-881)"
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 text-slate-900 font-mono"
              />
              <div className="flex gap-2 items-center">
                <input 
                  type="text"
                  value={resDocUrl}
                  onChange={(e) => setResDocUrl(e.target.value)}
                  placeholder="URL o enlace a documento"
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 text-slate-900 flex-1 min-w-0"
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
                  title="Subir archivo local"
                >
                  <Upload className="w-4 h-4 text-orange-500" />
                  <span className="hidden sm:inline">Archivo</span>
                </button>
              </div>
            </div>

            {resDocUrl && (
              <div className="flex items-center justify-between bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs">
                <span className="font-medium text-slate-600 truncate flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                  Documento adjunto guardado
                </span>
                <button 
                  type="button"
                  onClick={() => setResDocUrl('')}
                  className="text-red-500 hover:text-red-700 font-bold ml-2 shrink-0 cursor-pointer"
                >
                  Quitar documento
                </button>
              </div>
            )}

            <div className="flex gap-2 justify-end mt-1">
              <button 
                type="button"
                onClick={closeResForm}
                className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-200/70 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={!resTitle.trim()}
                className="px-5 py-2 text-xs font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> Guardar
              </button>
            </div>
          </form>
        )}

        {/* Reservations List */}
        <div className="space-y-3">
          {reservations.length === 0 ? (
            <p className="text-sm font-medium text-slate-400 text-center py-6">No hay reservas registradas.</p>
          ) : (
            reservations.map(res => (
              <SwipeableItem
                key={res.id}
                onEdit={() => openEditResModal(res)}
                onDelete={() => removeReservation(res.id)}
                isEditing={editingResId === res.id}
              >
                <div 
                  className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all cursor-pointer select-none"
                  onClick={() => {
                    if (res.documentUrl) {
                      const link = document.createElement('a');
                      link.href = res.documentUrl;
                      link.target = '_blank';
                      link.rel = 'noopener noreferrer';
                      if (res.documentUrl.startsWith('data:')) {
                        link.download = `reserva_${res.title.toLowerCase().replace(/\s+/g, '_')}`;
                      }
                      link.click();
                    } else {
                      openEditResModal(res);
                    }
                  }}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm text-white",
                      res.type === 'flight' ? "bg-blue-500" :
                      res.type === 'hotel' ? "bg-green-500" :
                      "bg-orange-500"
                    )}>
                      {res.type === 'flight' && <Plane className="w-5 h-5" />}
                      {res.type === 'hotel' && <Bed className="w-5 h-5" />}
                      {res.type === 'car' && <Car className="w-5 h-5" />}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 text-sm truncate">{res.title}</p>
                        {res.code && (
                          <span className={cn(
                            "text-[10px] font-extrabold px-2 py-0.5 rounded-md tracking-wider font-mono",
                            res.type === 'flight' ? "text-blue-700 bg-blue-100" :
                            res.type === 'hotel' ? "text-green-700 bg-green-100" :
                            "text-orange-700 bg-orange-100"
                          )}>{res.code}</span>
                        )}
                        {res.documentUrl && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-orange-600 bg-orange-100/80 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            <FileText className="w-3 h-3" /> Doc
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-500 truncate">{res.subtitle}</p>
                    </div>
                  </div>
                </div>
              </SwipeableItem>
            ))
          )}
        </div>
      </section>

      {/* Saved Links */}
      <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">Enlaces Guardados</h3>
          {!isAddingLink && (
            <button 
              onClick={() => setIsAddingLink(true)}
              className="w-9 h-9 bg-orange-500 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 active:scale-95 transition-all shadow-sm shadow-orange-200"
              title="Nuevo Enlace"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {isAddingLink ? (
          <form onSubmit={handleAddLink} className="flex flex-col gap-4 animate-in fade-in">
            
            <input 
              type="text"
              value={newLinkName}
              onChange={(e) => setNewLinkName(e.target.value)}
              placeholder="Título del enlace (ej. Restaurante recomendado)"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 text-slate-900 w-full font-medium"
              autoFocus
            />

            <div>
              <div className="flex flex-wrap gap-2">
                {LINK_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setNewLinkCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all border",
                      newLinkCategory === cat.id 
                        ? cn(cat.colorClass, "border-transparent shadow-sm scale-105")
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <input 
              type="url"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              placeholder="https://..."
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 text-slate-900 w-full"
            />

            <div className="flex gap-2 justify-end mt-2">
              <button 
                type="button"
                onClick={() => setIsAddingLink(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={!newLinkName.trim() || !newLinkUrl.trim()}
                className="px-5 py-2 text-xs font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> Guardar
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4 animate-in fade-in">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar enlaces por nombre o URL..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-900"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {LINK_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryFilter(activeCategoryFilter === cat.id ? null : cat.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5",
                    activeCategoryFilter === cat.id ? cat.colorClass : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
                >
                  <cat.icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Link List */}
            <div className="space-y-3">
              {(() => {
                if (!searchQuery && !activeCategoryFilter) {
                  return null;
                }

                const filteredLinks = links.filter(l => {
                  const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        l.url.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesCategory = activeCategoryFilter ? l.category === activeCategoryFilter : true;
                  return matchesSearch && matchesCategory;
                });
                
                if (filteredLinks.length === 0) {
                  return <p className="text-sm font-medium text-slate-400 text-center py-4 bg-slate-50 rounded-2xl border border-slate-200 border-dashed animate-in fade-in zoom-in">No hay coincidencias.</p>;
                }

                return filteredLinks.map(link => {
                  const catInfo = LINK_CATEGORIES.find(c => c.id === link.category) || LINK_CATEGORIES[5];
                  const Icon = catInfo.icon;
                  return (
                    <div key={link.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group border border-slate-100 hover:border-slate-300 transition-colors animate-in fade-in slide-in-from-bottom-2">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1 overflow-hidden">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", catInfo.colorClass)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-900 truncate">{link.title}</p>
                          <p className="text-xs text-slate-500 truncate">{link.url}</p>
                        </div>
                      </a>
                      <button 
                        onClick={() => removeLink(link.id)} 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 shrink-0 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </section>

      {/* Checklists */}
      <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">Listas</h3>
          {activeChecklist && (
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              {activeChecklist.items.filter(i => i.checked).length}/{activeChecklist.items.length}
            </span>
          )}
        </div>

        {/* Tabs for checklists */}
        <div ref={tabsContainerRef} className="flex items-center justify-between gap-2 mb-4 relative">
          {isEditingName ? (
            <form onSubmit={handleRenameChecklist} className="flex flex-1 gap-2 animate-in fade-in">
              <input
                type="text"
                value={editingNameValue}
                onChange={(e) => setEditingNameValue(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500 text-slate-900 font-bold"
                autoFocus
                onBlur={handleRenameChecklist}
              />
            </form>
          ) : (
            <div className={cn(
              "flex items-center gap-2 pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-1 transition-all",
              isDraggingTab ? "overflow-visible" : "overflow-x-auto"
            )}>
              <Reorder.Group 
                axis="x" 
                values={checklists} 
                onReorder={setChecklists} 
                className="flex items-center gap-2"
              >
                {checklists.map(list => (
                  <ChecklistTab 
                    key={list.id}
                    list={list}
                    isActive={activeChecklistId === list.id}
                    onClick={() => setActiveChecklistId(list.id)}
                    onRename={() => {
                      setEditingNameValue(list.name);
                      setIsEditingName(true);
                      setActiveChecklistId(list.id);
                    }}
                    onDelete={removeChecklist}
                    onDragStart={() => setIsDraggingTab(true)}
                    onDragEnd={() => {
                      setTimeout(() => setIsDraggingTab(false), 500);
                    }}
                    constraintsRef={tabsContainerRef}
                  />
                ))}
              </Reorder.Group>
            </div>
          )}

          {!isEditingName && (
            <AnimatePresence mode="popLayout">
              {isDraggingTab ? (
                <TrashZone key="trash" />
              ) : (
                <motion.button
                  key="add"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={() => setIsCreatingChecklist(true)}
                  className="w-9 h-9 bg-orange-500 text-white rounded-xl flex items-center justify-center shrink-0 hover:bg-orange-600 active:scale-95 transition-all shadow-sm shadow-orange-200"
                  title="Crear nueva lista"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          )}
        </div>

        {isCreatingChecklist && (
          <form onSubmit={handleCreateChecklist} className="flex gap-2 mb-4 animate-in fade-in slide-in-from-top-2">
            <input 
              type="text"
              value={newChecklistName}
              onChange={(e) => setNewChecklistName(e.target.value)}
              placeholder="Nombre de la nueva lista..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-900"
              autoFocus
            />
            <button 
              type="submit"
              className="bg-slate-900 text-white rounded-xl px-4 flex items-center justify-center shrink-0 hover:bg-slate-800 transition-colors text-xs font-bold shadow-md"
            >
              Crear
            </button>
            <button 
              type="button"
              onClick={() => setIsCreatingChecklist(false)}
              className="bg-white border border-slate-200 text-slate-500 rounded-xl px-3 flex items-center justify-center shrink-0 hover:bg-slate-50 transition-colors text-xs font-bold shadow-sm"
            >
              Cancelar
            </button>
          </form>
        )}

        {activeChecklist && !isCreatingChecklist && (
          <div className="flex flex-col animate-in fade-in duration-300">
            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-x-hidden mb-4">
              <Reorder.Group 
                axis="y" 
                values={activeChecklist.items} 
                onReorder={(newItems) => {
                  const newChecklists = checklists.map(c => 
                    c.id === activeChecklist.id ? { ...c, items: newItems } : c
                  );
                  setChecklists(newChecklists);
                }}
                className="space-y-2"
              >
                {activeChecklist.items.map(item => (
                  <ChecklistItem 
                    key={item.id} 
                    item={item} 
                    onToggle={() => toggleItem(item.id)} 
                    onRemove={() => removePackingItem(item.id)} 
                    onEdit={(newText) => editPackingItem(item.id, newText)} 
                  />
                ))}
              </Reorder.Group>
              {activeChecklist.items.length === 0 && (
                <p className="text-sm font-medium text-slate-400 text-center py-4 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">Esta lista está vacía.</p>
              )}
            </div>

            <form onSubmit={handleAddPackingItem} className="flex gap-2">
              <input 
                type="text"
                value={newPackingItem}
                onChange={(e) => setNewPackingItem(e.target.value)}
                placeholder={`Añadir ítem a ${activeChecklist.name}...`}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-900"
              />
              <button 
                type="submit"
                className="w-11 h-11 bg-orange-500 text-white rounded-xl flex items-center justify-center shrink-0 hover:bg-orange-600 active:scale-95 transition-all shadow-sm shadow-orange-200"
                title="Añadir ítem"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
        {!activeChecklist && !isCreatingChecklist && (
           <p className="text-sm font-medium text-slate-400 text-center py-4">No hay listas. Crea una nueva.</p>
        )}
      </section>

      {/* Quick Notes */}
      <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
        <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-4">Notas Rápidas</h3>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleAddNote();
          }}
          className="flex gap-2 items-start mb-4"
        >
          <textarea 
            ref={noteInputRef}
            value={newNote}
            onChange={(e) => {
              setNewNote(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(200, Math.max(44, e.target.scrollHeight))}px`;
            }}
            placeholder="Escribir apunte..."
            rows={1}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-900 resize-none overflow-hidden min-h-[44px] transition-all"
          />
          <button 
            type="submit"
            onMouseDown={(e) => {
              if (newNote.trim()) {
                e.preventDefault();
                handleAddNote();
              }
            }}
            onTouchStart={(e) => {
              if (newNote.trim()) {
                e.preventDefault();
                handleAddNote();
              }
            }}
            disabled={!newNote.trim()}
            className="w-11 h-11 bg-orange-500 text-white rounded-xl flex items-center justify-center shrink-0 hover:bg-orange-600 active:scale-95 transition-all shadow-sm shadow-orange-200 disabled:opacity-40 disabled:scale-100 disabled:shadow-none cursor-pointer"
            title="Guardar nota"
          >
            <Plus className="w-5 h-5 pointer-events-none" />
          </button>
        </form>
        <div className="space-y-3">
          {notes.length === 0 ? (
            <p className="text-sm font-medium text-slate-400 text-center py-4 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">Aún no hay notas.</p>
          ) : (
            notes.map(note => (
              <div key={note.id} className="bg-orange-50 p-4 rounded-2xl relative group border border-orange-100/80 transition-all">
                <button 
                  onClick={() => removeNote(note.id)} 
                  className="absolute top-3 right-3 p-1 text-orange-300 hover:text-red-500 hover:bg-orange-100/80 rounded-lg transition-colors"
                  title="Eliminar nota"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <p className="text-sm text-orange-950 whitespace-pre-wrap break-words [word-break:break-word] overflow-wrap-anywhere pr-8 leading-relaxed font-medium">
                  {note.text}
                </p>
                <p className="text-[11px] font-extrabold text-orange-800/50 mt-2 tracking-wider uppercase">{note.date}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
