
import React, { useState, useMemo, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { ScheduleEntry } from '../types';

interface TimetableProps {
  entries: ScheduleEntry[];
  onUpdateEntry: (id: string, updates: Partial<ScheduleEntry>) => void;
  onQuickAdd: (date: string, hour: number, duration: number) => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
  onEditEntry?: (id: string) => void;
  onWeekChange?: (weekDates: string[]) => void;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const Timetable: React.FC<TimetableProps> = ({ 
  entries, 
  onUpdateEntry, 
  onQuickAdd, 
  onDragStart, 
  onDragEnd,
  onEditEntry,
  onWeekChange
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ date: string; hour: number } | null>(null);
  const [selectionEndHour, setSelectionEndHour] = useState<number | null>(null);

  // Generate 7 days starting from TODAY (adjusted by offset)
  const weekDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + (currentWeekOffset * 7) + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, [currentWeekOffset]);

  useEffect(() => {
    onWeekChange?.(weekDates);
  }, [weekDates, onWeekChange]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const getEntriesForSlot = (date: string, hour: number) => {
    const slotDate = new Date(date);
    const dayLabel = DAY_LABELS[slotDate.getDay()]; // e.g. 'Mon'
    const fullDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slotDate.getDay()];

    return entries.filter(e => {
      const startHour = parseInt(e.startTime.split(':')[0]);
      if (startHour !== hour) return false;

      // 1. Direct date match
      if (e.date === date) return true;

      // 2. Fixed schedule by day name
      if (e.type === 'FIXED' && e.dayOfWeek === fullDayName) return true;

      // 3. Recurring logic
      if (e.isRepeating && e.repeatConfig) {
        // Must be after or on the original task date
        if (date < e.date) return false;

        if (e.repeatConfig.type === 'DAILY') return true;
        if (e.repeatConfig.type === 'WEEKLY') {
          return e.repeatConfig.daysOfWeek?.includes(fullDayName);
        }
      }

      return false;
    });
  };

  const handleTaskDrop = (date: string, hour: number) => {
    if (!draggedTaskId) return;
    onUpdateEntry(draggedTaskId, {
      startTime: `${String(hour).padStart(2, '0')}:00`,
      endTime: `${String(hour + 1).padStart(2, '0')}:00`,
      date: date
    });
    setDraggedTaskId(null);
    if (onDragEnd) onDragEnd();
  };

  useEffect(() => {
    const globalMouseUp = () => {
      if (isSelecting) {
        setIsSelecting(false);
        setSelectionStart(null);
        setSelectionEndHour(null);
      }
    };
    window.addEventListener('mouseup', globalMouseUp);
    return () => window.removeEventListener('mouseup', globalMouseUp);
  }, [isSelecting]);

  const renderWeekly = () => (
    <div className="overflow-x-auto custom-scrollbar bg-white rounded-[40px] border border-gray-100 shadow-xl select-none">
      <table className="w-full border-collapse table-fixed min-w-[850px]">
        <thead>
          <tr className="bg-gray-50/30">
            <th className="p-4 border-b border-r border-gray-50 text-[10px] font-black text-gray-400 w-20 uppercase tracking-widest">TIME</th>
            {weekDates.map((date, idx) => {
              const isToday = date === todayStr;
              const dateObj = new Date(date);
              const dayName = DAY_LABELS[dateObj.getDay()];
              return (
                <th key={date} className={`p-4 border-b border-r border-gray-50 text-[11px] font-black uppercase tracking-widest transition-all ${isToday ? 'bg-indigo-600 text-white shadow-xl z-20 scale-y-105' : 'text-gray-500'}`}>
                  <div className="flex flex-col items-center">
                    <span>{idx === 0 && currentWeekOffset === 0 ? 'TODAY' : dayName}</span>
                    <span className={`text-[9px] mt-1 ${isToday ? 'text-indigo-100' : 'text-gray-300'}`}>{date.split('-').slice(1).join('/')}</span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {HOURS.map(hour => (
            <tr key={hour}>
              <td className="p-4 border-b border-r border-gray-50 text-[10px] text-gray-300 text-center font-black bg-gray-50/10">{hour}:00</td>
              {weekDates.map((date) => {
                const slotEntries = getEntriesForSlot(date, hour);
                const isEmpty = slotEntries.length === 0;
                const isSelected = isSelecting && selectionStart?.date === date && hour >= selectionStart.hour && hour <= (selectionEndHour || selectionStart.hour);

                return (
                  <td 
                    key={`${date}-${hour}`} 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleTaskDrop(date, hour)}
                    onMouseDown={() => {
                      if (!isEmpty) return;
                      setIsSelecting(true);
                      setSelectionStart({ date, hour });
                      setSelectionEndHour(hour);
                    }}
                    onMouseEnter={() => isSelecting && selectionStart && hour >= selectionStart.hour && setSelectionEndHour(hour)}
                    onMouseUp={() => {
                      if (isSelecting && selectionStart && selectionEndHour !== null) {
                        onQuickAdd(selectionStart.date, selectionStart.hour, (selectionEndHour - selectionStart.hour + 1) * 60);
                      }
                    }}
                    className={`p-1 border-b border-r border-gray-50 relative h-20 transition-colors group/slot cursor-crosshair
                      ${isEmpty ? 'hover:bg-indigo-50/40' : ''}
                      ${isSelected ? 'bg-indigo-600/10' : ''}
                    `}
                  >
                    {slotEntries.map(entry => {
                      const durationInSlots = entry.estimatedDuration / 60;
                      const heightPercent = durationInSlots * 100;
                      const isInvalid = entry.status === 'INVALID';
                      
                      return (
                        <div 
                          key={`${entry.id}-${date}`}
                          draggable={!entry.isLocked}
                          onDragStart={(e) => { 
                            e.stopPropagation(); 
                            setDraggedTaskId(entry.id); 
                            if (onDragStart) onDragStart(entry.id);
                          }}
                          onDragEnd={() => {
                            setDraggedTaskId(null);
                            if (onDragEnd) onDragEnd();
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditEntry?.(entry.id);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          className={`absolute inset-x-1 top-1 z-10 p-3 rounded-2xl border-l-[6px] shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] group/card overflow-hidden
                            ${isInvalid ? 'bg-gray-950 border-gray-800 text-gray-500' : entry.completed ? 'bg-gray-50 border-gray-300' : 'bg-indigo-50 border-indigo-600'}
                          `}
                          style={{ height: `calc(${heightPercent}% - 8px)`, minHeight: '60px' }}
                        >
                          <div className={`text-[11px] font-black leading-tight mb-1 truncate ${isInvalid ? 'text-gray-600' : entry.completed ? 'text-gray-400' : 'text-indigo-950'}`}>
                            {entry.title}
                          </div>
                          <div className="flex items-center gap-1 opacity-50">
                            {entry.isRepeating && <Clock size={10} className="text-indigo-400" />}
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{entry.startTime}</span>
                          </div>
                          {isInvalid && <div className="text-[8px] font-black text-red-900 absolute bottom-1 right-1">FAILED</div>}
                        </div>
                      );
                    })}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <CalendarIcon size={28} className="text-indigo-600" /> TIMETABLE
        </h2>
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
          <button onClick={() => setCurrentWeekOffset(prev => prev - 1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"><ChevronLeft size={20} /></button>
          <span className="text-[11px] font-black text-gray-800 uppercase tracking-widest px-4">{currentWeekOffset === 0 ? 'Upcoming 7 Days' : `Week Offset: ${currentWeekOffset}`}</span>
          <button onClick={() => setCurrentWeekOffset(prev => prev + 1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"><ChevronRight size={20} /></button>
        </div>
      </div>
      {renderWeekly()}
    </div>
  );
};
