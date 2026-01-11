
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Timetable } from './components/Timetable';
import { TodoList } from './components/TodoList';
import { TaskModal } from './components/TaskModal';
import { ProjectModal } from './components/ProjectModal';
import { PersonaProfile } from './components/PersonaProfile';
import { ShopTab } from './components/ShopTab';
import { WorkMode } from './components/WorkMode';
import { AchievementGallery } from './components/AchievementGallery';
import { ScheduleEntry, Persona, Project, ShopItem, EntryStatus } from './types';
import { Zap, Flame, Trophy, LayoutDashboard, Save, Trash2, Smartphone, ShoppingBag, MoreVertical, PlayCircle, PlusCircle, Edit3, Download } from 'lucide-react';

interface TemplateEntry extends Partial<ScheduleEntry> {
  dayOffset: number; // 0 to 6
}

interface Template {
  id: string;
  name: string;
  entries: TemplateEntry[];
}

const INITIAL_SHOP_ITEMS: ShopItem[] = [
  { id: 'av1', name: '기본 용사', description: '가장 평범하지만 잠재력이 큽니다.', cost: 0, type: 'AVATAR', icon: '👤', owned: true },
  { id: 'av2', name: '초보 마법사', description: '지식 습득 효율이 좋아 보입니다.', cost: 5000, type: 'AVATAR', icon: '🧙', owned: false },
  { id: 'av3', name: '강철 기사', description: '어떤 힘든 일정도 버텨냅니다.', cost: 15000, type: 'AVATAR', icon: '🛡️', owned: false },
  { id: 'av4', name: '심연의 군주', description: '시간을 초월한 존재의 아바타.', cost: 100000, type: 'AVATAR', icon: '👿', owned: false },
  { id: 'tk1', name: '일정 수정권 (x1)', description: '이미 확정된 일정을 1회 수정합니다.', cost: 3000, type: 'EDIT_TICKET', icon: '🎫', owned: false, count: 0 },
  { id: 'th1', name: '네온 시티', description: '강렬한 네온 핑크 테마', cost: 25000, type: 'THEME', icon: '🌆', owned: false, value: '#f43f5e' },
  { id: 'th2', name: '에메랄드 포레스트', description: '눈이 편안한 초록 숲 테마', cost: 25000, type: 'THEME', icon: '🌲', owned: false, value: '#10b981' },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'SHOP' | 'ACHIEVEMENTS'>('DASHBOARD');
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([
    { id: 'p1', name: '기본 루틴', color: '#6366f1' },
    { id: 'p2', name: '자기 계발', color: '#10b981' },
  ]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [openTemplateMenu, setOpenTemplateMenu] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [visibleWeekDates, setVisibleWeekDates] = useState<string[]>([]);
  
  const [persona, setPersona] = useState<Persona>({ 
    level: 1, xp: 0, nextLevelXp: 1000, flameCount: 0, avatar: '👤', decorations: [], expression: 'NEUTRAL', unlockedAchievements: [],
    inventory: { editTickets: 3, unlockedThemes: [], unlockedQuotePacks: [] }
  });
  
  const [shopItems, setShopItems] = useState<ShopItem[]>(INITIAL_SHOP_ITEMS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefilledTask, setPrefilledTask] = useState<Partial<ScheduleEntry> | undefined>(undefined);
  const [isWorkModeOpen, setIsWorkModeOpen] = useState(false);

  const playSound = useCallback((type: 'click' | 'success' | 'level-up' | 'buy' | 'fail' | 'lock' | 'burn') => {
    const sounds = {
      click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      success: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
      'level-up': 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
      buy: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
      fail: 'https://assets.mixkit.co/active_storage/sfx/258/258-preview.mp3',
      lock: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      burn: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'
    };
    new Audio(sounds[type]).play().catch(() => {});
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('vibe_focus_v12');
    if (saved) {
      const data = JSON.parse(saved);
      setEntries(data.entries || []);
      setPersona(data.persona || persona);
      setShopItems(data.shopItems || INITIAL_SHOP_ITEMS);
      setProjects(data.projects || projects);
      setTemplates(data.templates || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vibe_focus_v12', JSON.stringify({ entries, persona, shopItems, projects, templates }));
  }, [entries, persona, shopItems, projects, templates]);

  const updateEntry = (id: string, updates: Partial<ScheduleEntry>) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    playSound('fail');
  };

  const saveAsTemplate = () => {
    if (visibleWeekDates.length === 0) return;
    // Get all entries that match the currently visible dates
    const currentWeekEntries = entries.filter(e => visibleWeekDates.includes(e.date));
    
    if (currentWeekEntries.length === 0) {
      alert('저장할 일정이 없습니다. 시간표에 일정을 먼저 추가하세요!');
      return;
    }

    const name = prompt('새 주간 템플릿 이름:');
    if (!name) return;

    const weekStartStr = visibleWeekDates[0];
    const weekStartDate = new Date(weekStartStr);

    const templateEntries: TemplateEntry[] = currentWeekEntries.map(e => {
      const taskDate = new Date(e.date);
      const diffTime = taskDate.getTime() - weekStartDate.getTime();
      const dayOffset = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      const { id: _, date: __, status: ___, completed: ____, xpEarned: _____, ...rest } = e;
      return { ...rest, dayOffset };
    });

    setTemplates(prev => [...prev, { id: `template-${Date.now()}`, name, entries: templateEntries }]);
    playSound('success');
  };

  const applyTemplate = (template: Template) => {
    if (visibleWeekDates.length === 0) return;
    const weekStartStr = visibleWeekDates[0];
    
    const newTasks: ScheduleEntry[] = template.entries.map(te => {
      const targetDate = new Date(weekStartStr);
      targetDate.setDate(targetDate.getDate() + te.dayOffset);
      
      return {
        ...te,
        id: `task-${Date.now()}-${Math.random()}`,
        date: targetDate.toISOString().split('T')[0],
        status: 'ACTIVE',
        completed: false,
        isLocked: false,
        projectId: te.projectId || 'p1',
        tags: te.tags || [],
      } as ScheduleEntry;
    });

    setEntries(prev => [...prev, ...newTasks]);
    playSound('success');
    setOpenTemplateMenu(null);
  };

  const handleBuyItem = (item: ShopItem) => {
    if (persona.xp < item.cost) { playSound('fail'); return; }
    playSound('buy');
    setPersona(p => ({ ...p, xp: p.xp - item.cost }));
    setShopItems(prev => prev.map(i => i.id === item.id ? { ...i, owned: true } : i));
  };

  const completeTask = (id: string) => {
    setEntries(prev => {
      const entry = prev.find(e => e.id === id);
      if (!entry || entry.status !== 'ACTIVE') return prev;
      playSound('success');
      const xp = entry.estimatedDuration * (entry.priority === 'High' ? 4 : 2);
      setPersona(p => ({ ...p, xp: p.xp + xp }));
      return prev.map(e => e.id === id ? { ...e, status: 'COMPLETED' as EntryStatus, completed: true, xpEarned: xp } : e);
    });
  };

  return (
    <div className="min-h-screen pb-24 bg-[#f8faff] text-gray-900 font-sans" onClick={() => setOpenTemplateMenu(null)}>
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-[18px] flex items-center justify-center shadow-xl shadow-indigo-100">
                <Zap className="text-white fill-white" size={24} />
              </div>
              <h1 className="text-xl font-black tracking-tight hidden sm:block">VIBE QUEST</h1>
            </div>
            <nav className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-2xl">
              <button onClick={() => setCurrentView('DASHBOARD')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${currentView === 'DASHBOARD' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <LayoutDashboard size={14}/> 퀘스트보드
              </button>
              <button onClick={() => setCurrentView('SHOP')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${currentView === 'SHOP' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <ShoppingBag size={14}/> 상점
              </button>
              <button onClick={() => setCurrentView('ACHIEVEMENTS')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${currentView === 'ACHIEVEMENTS' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <Trophy size={14}/> 명예의 전당
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl border border-orange-100">
               <Flame size={16} className="text-orange-500 fill-orange-500" />
               <span className="text-xs font-black text-orange-700">{persona.flameCount} 일</span>
            </div>
            <button onClick={() => setIsWorkModeOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-black text-xs shadow-lg shadow-indigo-100">
              <PlayCircle size={16} className="fill-white" /> 집중 모드
            </button>
          </div>
        </div>
      </header>
      
      {/* FLOATING ACTION ZONES (Visible during drag) */}
      {draggedTaskId && (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-12 p-4 animate-in slide-in-from-right-8 duration-300">
          <div 
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('scale-125', 'bg-red-600'); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove('scale-125', 'bg-red-600'); }}
            onDrop={() => { if(draggedTaskId) deleteEntry(draggedTaskId); setDraggedTaskId(null); }}
            className="w-24 h-24 rounded-full bg-red-500/90 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-2xl border-4 border-white/40"
          >
            <Trash2 size={40} />
          </div>
          <div 
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('scale-125', 'bg-indigo-700'); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove('scale-125', 'bg-indigo-700'); }}
            onDrop={() => { 
              if(draggedTaskId) { 
                setPrefilledTask(entries.find(ex => ex.id === draggedTaskId)); 
                setIsModalOpen(true); 
              } 
              setDraggedTaskId(null); 
            }}
            className="w-24 h-24 rounded-full bg-indigo-600/90 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-2xl border-4 border-white/40"
          >
            <Edit3 size={40} />
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 pt-10">
        {currentView === 'DASHBOARD' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-8">
              <PersonaProfile 
                persona={persona} 
                onOpenShop={() => setCurrentView('SHOP')} 
                onOpenAchievements={() => setCurrentView('ACHIEVEMENTS')} 
              />
              <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-black text-gray-800 text-sm uppercase tracking-widest flex items-center gap-2">
                    <Smartphone size={18} className="text-indigo-500"/> Templates
                  </h2>
                  <button onClick={(e) => { e.stopPropagation(); saveAsTemplate(); }} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-2 text-[10px] font-black">
                    <Save size={18}/> 주간 저장
                  </button>
                </div>
                <div className="space-y-3">
                   {templates.map(t => (
                     <div key={t.id} className="relative w-full flex items-center gap-4 p-4 rounded-[20px] bg-gray-50 border border-transparent hover:bg-white hover:border-indigo-200 transition-all group shadow-sm">
                        <div className="text-[13px] font-black text-gray-700 group-hover:text-indigo-600 flex-1 text-left truncate">{t.name}</div>
                        <button onClick={(e) => { e.stopPropagation(); setOpenTemplateMenu(openTemplateMenu === t.id ? null : t.id); }} className="p-2 text-gray-400 hover:text-indigo-600">
                          <MoreVertical size={16}/>
                        </button>
                        {openTemplateMenu === t.id && (
                          <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-2 animate-in fade-in slide-in-from-top-2" onClick={(e) => e.stopPropagation()}>
                             <button onClick={() => applyTemplate(t)} className="w-full text-left p-3 text-[11px] font-black text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl flex items-center gap-2">
                               <PlusCircle size={14} /> 불러오기
                             </button>
                             <button onClick={() => setTemplates(templates.filter(tm => tm.id !== t.id))} className="w-full text-left p-3 text-[11px] font-black text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-2">
                               <Trash2 size={14} /> 삭제
                             </button>
                          </div>
                        )}
                     </div>
                   ))}
                   {templates.length === 0 && <p className="text-[10px] text-gray-400 italic text-center py-4">저장된 주간 템플릿이 없습니다.</p>}
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 space-y-12">
              <Timetable 
                entries={entries} 
                onUpdateEntry={updateEntry} 
                onDragStart={(id) => setDraggedTaskId(id)}
                onDragEnd={() => setDraggedTaskId(null)}
                onWeekChange={setVisibleWeekDates}
                onEditEntry={(id) => { 
                  setPrefilledTask(entries.find(e => e.id === id)); 
                  setIsModalOpen(true); 
                }}
                onQuickAdd={(date, hour, duration) => {
                  const endH = Math.floor(hour + (duration/60));
                  setPrefilledTask({ date, startTime: `${String(hour).padStart(2,'0')}:00`, endTime: `${String(endH).padStart(2,'0')}:00`, estimatedDuration: duration });
                  setIsModalOpen(true);
                }} 
              />
              <TodoList entries={entries} onToggleComplete={completeTask} onDelete={deleteEntry} onToggleLock={(id, val) => updateEntry(id, { isLocked: val })} />
            </div>
          </div>
        ) : currentView === 'SHOP' ? (
          <ShopTab 
            items={shopItems} 
            userXp={persona.xp} 
            onBuy={handleBuyItem} 
            onEquip={icon => setPersona(prev => ({ ...prev, avatar: icon }))} 
            currentAvatar={persona.avatar} 
          />
        ) : (
          <AchievementGallery unlockedIds={persona.unlockedAchievements} />
        )}
      </main>

      <TaskModal 
        isOpen={isModalOpen} 
        projects={projects} 
        recentTasksByProject={pId => entries.filter(e => e.projectId === pId).slice(-5)} 
        onClose={() => { setIsModalOpen(false); setPrefilledTask(undefined); }} 
        onSave={(task) => {
          if (task.id) {
            updateEntry(task.id, task);
          } else {
            setEntries(prev => [...prev, { ...task, id: `task-${Date.now()}`, completed: false, status: 'ACTIVE', isLocked: false } as ScheduleEntry]);
          }
        }} 
        initialTask={prefilledTask} 
      />
      <WorkMode isOpen={isWorkModeOpen} onClose={() => setIsWorkModeOpen(false)} currentTask={null} nextTask={null} persona={persona} />
    </div>
  );
};

export default App;
