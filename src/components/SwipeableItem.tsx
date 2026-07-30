import React, { useState } from 'react';
import { motion, PanInfo, DragControls } from 'motion/react';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { cn } from '../lib/utils';

interface SwipeableItemProps {
  key?: React.Key;
  children: React.ReactNode;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: () => void;
  isEditing: boolean;
  isExpanded?: boolean;
  isSwipeDisabled?: boolean;
}

export function SwipeableItem({ 
  children, onEdit, onDelete, isEditing, isExpanded, isSwipeDisabled
}: SwipeableItemProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const isDragging = React.useRef(false);

  const handleDragStart = () => {
    isDragging.current = true;
  };

  const handleDragEnd = (e: any, info: PanInfo) => {
    setTimeout(() => {
      isDragging.current = false;
    }, 100);

    if (isEditing) return;
    
    // Swipe left to reveal
    if (info.offset.x < -50 || info.velocity.x < -300) {
      setIsRevealed(true);
    } else {
      setIsRevealed(false);
    }
  };

  const closeMenu = () => {
    setIsRevealed(false);
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] w-full" id="itinerary-item-container">
      {/* Background Actions */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-end pr-4 gap-2 bg-slate-100 rounded-[2rem] w-full">
        <button onClick={(e) => { onEdit(e); closeMenu(); }} className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shadow-sm transition-transform hover:scale-110 active:scale-95">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={() => { onDelete(); closeMenu(); }} className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 shadow-sm transition-transform hover:scale-110 active:scale-95">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Foreground Card */}
      <motion.div
        drag={isEditing || isSwipeDisabled ? false : "x"}
        dragConstraints={{ left: -110, right: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClickCapture={(e) => {
          if (isRevealed || isDragging.current) {
            e.stopPropagation();
            if (isRevealed) {
              closeMenu();
            }
          }
        }}
        animate={{ x: isRevealed ? -110 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className={cn("relative bg-white w-full h-full z-10 rounded-[2rem] border transition-shadow transition-colors duration-300", isExpanded ? "border-slate-200 shadow-md ring-4 ring-slate-50/50" : "border-slate-100 shadow-sm")}
        style={{ touchAction: 'pan-y' }}
      >
        {children}
      </motion.div>

    </div>
  );
}
