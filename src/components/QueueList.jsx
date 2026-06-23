import React, { useState, useRef, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Individual Draggable Item Component
function SortableQueueItem({ c, onCallCustomer }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: c.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const isCompleted = c.status === 'completed';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-[#FFF9EC] dark:bg-[#26170c] p-4 rounded-xl border border-[#E9E2D0] dark:border-white/5 shadow-sm hover:border-[#944925]/50 dark:hover:border-[#944925]/50 transition-colors duration-200 flex flex-col ${
        isDragging ? 'opacity-85 scale-102 shadow-xl border-[#944925] dark:border-[#ffb596] ring-1 ring-[#944925]/30' : ''
      } ${isCompleted ? 'opacity-60 bg-[#efe8d5]/40 dark:bg-[#26170C]/40' : ''}`}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-1">
          {/* Drag Handle: 6-dot icon */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-[#26170C]/60 dark:text-[#faf3e0]/60 hover:bg-[#faf3e0] dark:hover:bg-[#26170C] rounded transition-colors"
            title="Tarik untuk menggeser posisi antrean"
          >
            <span className="material-symbols-outlined text-lg">drag_indicator</span>
          </div>
          <span className="text-[10px] text-[#26170C]/70 dark:text-[#faf3e0]/70 font-mono">{c.code}</span>
        </div>
        {c.timeLeft ? (
          <span className="bg-[#ffdea5] dark:bg-[#3f2c00] text-[#261900] dark:text-[#e9c176] px-2 py-0.5 rounded text-[9px] font-bold">
            {c.timeLeft}
          </span>
        ) : isCompleted ? (
          <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded text-[9px] font-bold">
            Selesai
          </span>
        ) : (
          <span className="text-[#26170C]/60 dark:text-[#faf3e0]/60 text-[9px] font-bold uppercase tracking-wider">
            {c.bookingSource || 'Antrean'}
          </span>
        )}
      </div>

      <h4 className="text-[#26170C] dark:text-[#faf3e0] font-bold text-sm">{c.customerName}</h4>
      <div className="flex items-center space-x-2 mt-1">
        <p className="text-[#26170C]/70 dark:text-[#faf3e0]/70 text-xs">{c.serviceName}</p>
        {c.paymentMethod && (
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
            c.paymentMethod === 'Cash'
              ? 'bg-[#81756e]/10 text-[#4f453f] dark:bg-white/10 dark:text-[#faf3e0]/70'
              : c.paymentMethod === 'QRIS'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
          }`}>
            {c.paymentMethod}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center text-[11px] text-[#26170C]/80 dark:text-[#faf3e0]/80">
          <span className="material-symbols-outlined text-xs mr-1 text-[#26170C]/60 dark:text-[#faf3e0]/60">content_cut</span>
          <span>{c.barberName}</span>
        </div>
        
        {c.status === 'waiting' ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCallCustomer(c.id);
            }}
            className="text-[#944925] dark:text-[#ffb596] hover:text-[#773310] dark:hover:text-white font-bold text-xs flex items-center transition-colors hover:scale-105 transform active:scale-95 duration-100"
          >
            Panggil Sekarang
            <span className="material-symbols-outlined text-xs ml-1">chevron_right</span>
          </button>
        ) : (
          <span className="text-[#26170C] dark:text-[#faf3e0]/80 text-[10px] font-bold">
            {isCompleted ? 'Selesai' : (c.bookingSource || 'Menunggu')}
          </span>
        )}
      </div>
    </div>
  );
}

// Active Serving Card sub-component with Hold-to-Confirm feature
function ActiveServingCard({ c, onCompleteServing }) {
  const [isHolding, setIsHolding] = useState(false);
  const pressTimer = useRef(null);

  const handlePressStart = (e) => {
    // Prevent context menu on mobile touch
    if (e.cancelable) {
      // e.preventDefault(); // Don't block event completely to keep touch behavior natural
    }
    setIsHolding(true);
    pressTimer.current = setTimeout(() => {
      if (onCompleteServing) {
        onCompleteServing(c.id);
      }
      setIsHolding(false);
    }, 1500); // 1.5 seconds hold time
  };

  const handlePressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    setIsHolding(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }
    };
  }, []);

  return (
    <div className="bg-[#26170c] dark:bg-[#3d2b1f] p-4 rounded-xl shadow-lg border-l-4 border-[#944925] transition-all duration-300">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold text-[#ac9181] tracking-widest uppercase">Sedang Dilayani</span>
        <span className="text-[#ac9181] text-xs font-mono">{c.code}</span>
      </div>
      <div className="flex items-center justify-between gap-4 mb-1">
        <h4 className="text-white font-headline text-lg italic">{c.customerName}</h4>
        <button
          type="button"
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          title="Menyelesaikan pertemuan"
          className={`w-8 h-8 rounded-xl border-2 transition-all duration-[1500ms] ease-linear relative overflow-hidden z-10 select-none flex-shrink-0 flex items-center justify-center ${
            isHolding 
              ? 'border-black scale-95 ring-4 ring-amber-500/25' 
              : 'border-[#B8860B] hover:bg-[#B8860B]/10'
          }`}
        >
          {/* Radial Glow scaling indicator */}
          <span 
            className={`absolute top-1/2 left-1/2 w-[250%] h-[250%] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none -z-10 bg-[radial-gradient(circle,_#d97706_0%,_#92400e_100%)] origin-center ${
              isHolding
                ? 'scale-100 opacity-100 transition-all duration-[1500ms] ease-linear'
                : 'scale-0 opacity-0 transition-all duration-300 ease-out'
            }`}
          />
          <Check 
            className={`w-4 h-4 relative z-20 transition-colors duration-[1500ms] ease-linear ${
              isHolding ? 'text-black font-bold' : 'text-[#B8860B]'
            }`} 
          />
        </button>
      </div>
      <div className="flex items-center justify-between mt-3 text-[#ac9181]/80 text-xs">
        <div className="flex items-center text-white/80">
          <span className="material-symbols-outlined text-sm mr-1">person</span>
          <span>Barber: {c.barberName}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="bg-[#944925] text-white px-2 py-0.5 rounded text-[9px] font-bold">
            {c.serviceName}
          </span>
          {c.paymentMethod && (
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              c.paymentMethod === 'Cash'
                ? 'bg-[#ac9181]/25 text-white'
                : c.paymentMethod === 'QRIS'
                ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-500/20'
                : 'bg-blue-900/50 text-blue-200 border border-blue-500/20'
            }`}>
              {c.paymentMethod}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Main QueueList Component
export default function QueueList({ queue = [], onCallCustomer, onReorderQueue, onOpenQRModal, onCompleteServing }) {
  const activeAppointments = queue.filter(q => !q.isBreak && q.status === 'serving');
  const waitingAppointments = queue.filter(q => !q.isBreak && q.status !== 'serving');

  // Drag Sensors configuration: Mouse for desktop, Touch with hold delay for mobile
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // Activates drag only after moving 8px, allowing clicks on action buttons
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Long press 250ms on mobile to initiate drag, avoiding page scroll interference
        tolerance: 5, // Allow minimal movement before starting
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = waitingAppointments.findIndex((item) => item.id === active.id);
    const newIndex = waitingAppointments.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      // Reorder the waiting sublist
      const reorderedWaiting = arrayMove(waitingAppointments, oldIndex, newIndex);
      
      // Construct new full queue (preserving locked batch serving customers at the beginning)
      const newQueue = [...activeAppointments, ...reorderedWaiting];

      if (onReorderQueue) {
        onReorderQueue(newQueue);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Queue Box */}
      <div className="bg-[#faf3e0] dark:bg-[#26170C] rounded-xl p-6 shadow-sm border border-[#E9E2D0] dark:border-white/5 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline italic text-xl text-[#26170c] dark:text-[#faf3e0]">Antrean Berjalan</h3>
          <span className="bg-[#944925]/10 dark:bg-[#944925]/20 text-[#944925] dark:text-[#ffb596] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {queue.length} Pelanggan
          </span>
        </div>

        <div className="space-y-4">
          {/* Active Serving Card - LOCKED & SECURED outside the DndContext */}
          {activeAppointments.length > 0 ? (
            activeAppointments.map((c) => (
              <ActiveServingCard 
                key={c.id} 
                c={c} 
                onCompleteServing={onCompleteServing} 
              />
            ))
          ) : (
            <div className="bg-[#efe8d5] dark:bg-[#26170c] p-6 rounded-xl border border-dashed border-[#81756e]/30 dark:border-white/10 text-center text-sm text-[#4f453f] dark:text-[#faf3e0]/60 italic">
              Menunggu Panggilan Berikutnya
            </div>
          )}

          {/* Draggable/Droppable Context for waitingAppointments list */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={waitingAppointments.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {waitingAppointments.length === 0 ? (
                  <div className="bg-[#efe8d5]/50 dark:bg-[#26170c]/50 p-6 rounded-xl border border-dashed border-[#81756e]/30 dark:border-white/10 text-center text-sm text-[#4f453f] dark:text-[#faf3e0]/60 italic">
                    Belum ada antrean
                  </div>
                ) : (
                  waitingAppointments.map((c) => (
                    <SortableQueueItem 
                      key={c.id} 
                      c={c} 
                      onCallCustomer={onCallCustomer}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>


    </div>
  );
}
