
import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Tag, Layers, AlertTriangle, FileText, Repeat, Lock, Sparkles, History, Check } from 'lucide-react';
import { ScheduleEntry, Priority, Difficulty, Project, RepeatConfig } from '../types';
import { suggestTags } from '../services/geminiService';
import { DurationPicker } from './DurationPicker';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<ScheduleEntry>) => void;
  initialTask?: Partial<ScheduleEntry>;
  projects: Project[];
  recentTasksByProject: (projectId: string) => ScheduleEntry[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, initialTask, projects, recentTasksByProject }) => {
  const [task, setTask] = useState<Partial<ScheduleEntry>>({
    title: '', memo: '', date: new Date().toISOString().split('T')[0],
    startTime: '09:00', endTime: '10:00', projectId: projects[0]?.id || 'default',
    priority: 'Medium', difficulty: 'Normal', estimatedDuration: 60, tags: [],
    isRepeating: false, repeatConfig: { type: 'NONE', interval: 1, daysOfWeek: [], dayOfMonth: 1 },
    ...initialTask
  });

  const [isDurationPickerOpen, setIsDurationPickerOpen] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    if (initialTask) setTask(prev => ({ ...prev, ...initialTask }));
  }, [initialTask]);

  if (!isOpen) return null;

  const handleSuggestTags = async () => {
    if (!task.title) return;
    setIsSuggesting(true);
    const tags = await suggestTags(task.title);
    setTask(prev => ({ ...prev, tags: Array.from(new Set([...(prev.tags || []), ...tags])) }));
    setIsSuggesting(false);
  };

  const toggleRepeatDay = (day: string) => {
    const currentDays = task.repeatConfig?.daysOfWeek || [];
    const newDays = currentDays.includes(day) 
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    setTask({ ...task, repeatConfig: { ...task.repeatConfig!, daysOfWeek: newDays } });
  };

  const recent = task.projectId ? recentTasksByProject(task.projectId) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto animate-in zoom-in-95">
        
        {/* Recent Sidebar */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-6 overflow-y-auto custom-scrollbar">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <History size={14}/> 최근 항목
          </h3>
          <div className="space-y-2">
            {recent.length === 0 ? <p className="text-[10px] text-gray-400 italic">내역 없음</p> : 
              recent.map(r => (
                <button 
                  key={r.id}
                  type="button"
                  onClick={() => setTask({ ...task, title: r.title, tags: r.tags, memo: r.memo })}
                  className="w-full text-left p-2 rounded-xl border border-transparent hover:bg-white hover:border-indigo-100 transition-all text-xs font-medium group"
                >
                  <div className="text-gray-700 truncate font-bold">{r.title}</div>
                  <div className="text-[9px] text-gray-400">#{r.tags[0]}</div>
                </button>
              ))
            }
          </div>
        </div>

        {/* Main Form */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b flex items-center justify-between bg-white">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Quest Settings</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={20}/></button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onSave(task); onClose(); }} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
            <div className="space-y-1">
              <label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Title</label>
              <div className="flex gap-2">
                <input required className="flex-1 px-4 py-3 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                  value={task.title} onChange={e => setTask({ ...task, title: e.target.value })} placeholder="퀘스트 이름을 입력하세요..." />
                <button type="button" onClick={handleSuggestTags} disabled={isSuggesting} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all">
                  {isSuggesting ? <Clock className="animate-spin" size={20}/> : <Sparkles size={20}/>}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Memo</label>
              <textarea 
                className="w-full px-4 py-3 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium text-sm h-20"
                value={task.memo} onChange={e => setTask({ ...task, memo: e.target.value })} placeholder="추가 설명을 입력하세요..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-gray-400 uppercase">Project</label>
                <select className="w-full px-4 py-3 bg-gray-100 rounded-2xl outline-none font-bold text-gray-700 appearance-none"
                  value={task.projectId} onChange={e => setTask({ ...task, projectId: e.target.value })}>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-gray-400 uppercase">Priority</label>
                <select className="w-full px-4 py-3 bg-gray-100 rounded-2xl outline-none font-bold text-gray-700 appearance-none"
                  value={task.priority} onChange={e => setTask({ ...task, priority: e.target.value as Priority })}>
                  <option value="Low">낮음 (1x XP)</option>
                  <option value="Medium">보통 (2x XP)</option>
                  <option value="High">높음 (4x XP)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-gray-400 uppercase">Duration</label>
                <button type="button" onClick={() => setIsDurationPickerOpen(true)} className="w-full px-4 py-3 bg-indigo-50 text-indigo-700 rounded-2xl font-bold flex justify-between items-center">
                  <span>{task.estimatedDuration}분</span>
                  <Clock size={16}/>
                </button>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Date</label>
                <input type="date" className="w-full px-4 py-3 bg-gray-100 rounded-2xl outline-none font-bold text-gray-700"
                  value={task.date} onChange={e => setTask({ ...task, date: e.target.value })} />
              </div>
            </div>

            <div className="p-5 bg-orange-50/50 border border-orange-100 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-orange-700 font-black text-xs uppercase tracking-widest"><Repeat size={14}/> Repeat Settings</div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={task.isRepeating} onChange={e => setTask({...task, isRepeating: e.target.checked})} className="sr-only peer"/>
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
              {task.isRepeating && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-2 gap-3">
                    <select className="px-4 py-3 bg-white rounded-2xl text-xs font-black outline-none border border-orange-100 shadow-sm" value={task.repeatConfig?.type}
                      onChange={e => setTask({...task, repeatConfig: {...task.repeatConfig!, type: e.target.value as any}})}>
                      <option value="DAILY">매일</option>
                      <option value="WEEKLY">매주</option>
                      <option value="MONTHLY">매달</option>
                    </select>
                    <div className="flex items-center bg-white px-4 rounded-2xl border border-orange-100 shadow-sm">
                      <span className="text-[10px] font-black text-gray-400 mr-2">INTERVAL</span>
                      <input type="number" min="1" className="w-full py-3 bg-transparent text-xs font-black outline-none" value={task.repeatConfig?.interval}
                        onChange={e => setTask({...task, repeatConfig: {...task.repeatConfig!, interval: parseInt(e.target.value)}})}/>
                    </div>
                  </div>

                  {task.repeatConfig?.type === 'WEEKLY' && (
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Select Days</p>
                      <div className="flex flex-wrap gap-1">
                        {DAYS.map(day => {
                          const isSelected = task.repeatConfig?.daysOfWeek?.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleRepeatDay(day)}
                              className={`flex-1 min-w-[50px] py-2 text-[9px] font-black rounded-xl transition-all border ${isSelected ? 'bg-orange-500 border-orange-500 text-white shadow-md' : 'bg-white border-orange-100 text-orange-300'}`}
                            >
                              {day.substring(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {task.repeatConfig?.type === 'MONTHLY' && (
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Select Date (1-31)</p>
                      <input 
                        type="number" min="1" max="31"
                        className="w-full px-4 py-3 bg-white border border-orange-100 rounded-2xl text-xs font-black outline-none shadow-sm"
                        value={task.repeatConfig?.dayOfMonth}
                        onChange={e => setTask({...task, repeatConfig: { ...task.repeatConfig!, dayOfMonth: parseInt(e.target.value) }})}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {task.tags?.map(t => (
                  <span key={t} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black flex items-center gap-1">
                    <Tag size={10} /> #{t}
                    <button type="button" onClick={() => setTask({...task, tags: task.tags?.filter(tag => tag !== t)})} className="hover:text-red-500 ml-1">×</button>
                  </span>
                ))}
                {(!task.tags || task.tags.length === 0) && <span className="text-[10px] text-gray-400 italic">태그가 없습니다.</span>}
              </div>
            </div>

            <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] uppercase tracking-widest text-sm flex items-center justify-center gap-2">
              <Check size={20} /> Accept Quest
            </button>
          </form>
        </div>
      </div>
      <DurationPicker isOpen={isDurationPickerOpen} onClose={() => setIsDurationPickerOpen(false)} currentValue={task.estimatedDuration || 60} onSelect={m => setTask({...task, estimatedDuration: m})} />
    </div>
  );
};
