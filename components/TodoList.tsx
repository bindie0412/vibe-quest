
import React from 'react';
import { CheckCircle2, Circle, Trash2, Calendar, Clock, Lock, Unlock, Zap, AlertCircle } from 'lucide-react';
import { ScheduleEntry } from '../types';

interface TodoListProps {
  entries: ScheduleEntry[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleLock: (id: string, locked: boolean) => void;
}

export const TodoList: React.FC<TodoListProps> = ({ entries, onToggleComplete, onDelete, onToggleLock }) => {
  const sorted = [...entries].sort((a, b) => {
    if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1;
    if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return -1;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">ACTIVE QUESTS</h2>
        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">
          {entries.filter(e => e.status === 'ACTIVE').length} Remaining
        </span>
      </div>
      
      <div className="grid gap-4">
        {sorted.length === 0 ? (
          <div className="p-20 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100 text-gray-300 font-bold">
            No active quests. Start your journey!
          </div>
        ) : sorted.map(entry => {
          const isInvalid = entry.status === 'INVALID';
          const isCompleted = entry.status === 'COMPLETED';

          return (
            <div 
              key={entry.id} 
              className={`group flex items-start gap-5 p-6 rounded-[32px] border transition-all 
                ${isCompleted ? 'bg-gray-50 border-gray-100 opacity-60' : isInvalid ? 'bg-gray-900 border-gray-800 text-gray-500' : 'bg-white border-gray-100 hover:border-indigo-200 shadow-sm'}
                ${entry.isLocked && !isCompleted ? 'border-l-[6px] border-l-indigo-600' : ''}
              `}
            >
              <button 
                onClick={() => onToggleComplete(entry.id)} 
                disabled={isCompleted || isInvalid} 
                className={`mt-1.5 transition-all ${isCompleted ? 'text-green-500' : isInvalid ? 'text-gray-700' : 'text-gray-200 hover:text-indigo-600'}`}
              >
                {isCompleted ? <CheckCircle2 size={32}/> : isInvalid ? <AlertCircle size={32}/> : <Circle size={32}/>}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest
                    ${isInvalid ? 'bg-red-900/30 text-red-500' : entry.priority === 'High' ? 'bg-red-50 text-red-600' : 
                      entry.priority === 'Medium' ? 'bg-indigo-50 text-indigo-600' : 
                      'bg-green-50 text-green-600'}`}>
                    {isInvalid ? 'Failed' : `${entry.priority} Priority`}
                  </span>
                  <h3 className={`text-base font-black truncate ${isCompleted ? 'line-through text-gray-400' : isInvalid ? 'text-gray-600' : 'text-gray-900'}`}>
                    {entry.title}
                  </h3>
                  {entry.xpEarned && <span className="text-[11px] font-black text-amber-600 flex items-center gap-1 animate-bounce"><Zap size={14} className="fill-amber-500"/> +{entry.xpEarned} XP</span>}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-black text-gray-400 uppercase tracking-tight">
                  <div className="flex items-center gap-1.5"><Calendar size={14} className={isInvalid ? 'text-gray-700' : 'text-indigo-300'}/> {entry.date}</div>
                  <div className="flex items-center gap-1.5"><Clock size={14} className={isInvalid ? 'text-gray-700' : 'text-indigo-300'}/> {entry.startTime} ({entry.estimatedDuration}m)</div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                {!isInvalid && (
                  <button 
                    onClick={() => onToggleLock(entry.id, !entry.isLocked)}
                    className={`p-2.5 rounded-2xl transition-all ${entry.isLocked ? 'bg-indigo-50 text-indigo-900' : 'bg-transparent text-gray-200 hover:text-gray-400 opacity-0 group-hover:opacity-100'}`}
                  >
                    {entry.isLocked ? <Lock size={18}/> : <Unlock size={18}/>}
                  </button>
                )}
                
                {(!entry.isLocked || isInvalid) && (
                  <button onClick={() => onDelete(entry.id)} className="opacity-0 group-hover:opacity-100 p-2.5 text-gray-200 hover:text-red-500 transition-all">
                    <Trash2 size={18}/>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
