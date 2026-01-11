
import React, { useMemo, useState } from 'react';
import { Trophy, Lock, Zap, Clock, Calendar, Sparkles, Sword, Book, Ghost, Coffee, Target, Medal, ChevronDown, ChevronUp } from 'lucide-react';
import { Achievement } from '../types';

const ACHIEVEMENTS: Achievement[] = [
  // COMBAT
  { id: 'c1', category: 'COMBAT', title: '슬라임 학살자', description: '쉬움 난이도 퀘스트 5개 완수', icon: '🟢', rewardXp: 100 },
  { id: 'c2', category: 'COMBAT', title: '드래곤 슬레이어', description: '어려움 난이도 퀘스트 완수', icon: '🐲', rewardXp: 500 },
  { id: 'c3', category: 'COMBAT', title: '전설의 용사', description: '어려움 난이도 퀘스트 10개 완수', icon: '⚔️', rewardXp: 2000 },
  { id: 'c4', category: 'COMBAT', title: '콤보 마스터', description: '하루에 퀘스트 10개 완수', icon: '🔥', rewardXp: 1000 },
  { id: 'c5', category: 'COMBAT', title: '무혈 입성', description: '미루지 않고 예정된 모든 퀘스트 완료', icon: '🛡️', rewardXp: 800 },
  { id: 'c6', category: 'COMBAT', title: '그림자 추적자', description: '오전 8시 이전 퀘스트 3개 연속 완료', icon: '👤', rewardXp: 400 },
  { id: 'c7', category: 'COMBAT', title: '파괴의 전차', description: '하루에 High 난이도 3개 완료', icon: '🚜', rewardXp: 1200 },
  { id: 'c8', category: 'COMBAT', title: '평화주의자', description: '전투(운동) 없이 공부만 5시간 수행', icon: '🕊️', rewardXp: 500 },
  { id: 'c9', category: 'COMBAT', title: '검은 기사', description: '밤 12시 이후 퀘스트 완료', icon: '🌒', rewardXp: 300 },

  // STUDY
  { id: 's1', category: 'STUDY', title: '미라클 모닝의 화신', description: '오전 7시 이전 퀘스트 시작', icon: '☀️', rewardXp: 300 },
  { id: 's2', category: 'STUDY', title: '올빼미족의 역습', description: '오후 11시 이후 퀘스트 완수', icon: '🦉', rewardXp: 300 },
  { id: 's3', category: 'STUDY', title: '부동석', description: '집중 모드 2시간 유지', icon: '🗿', rewardXp: 1200 },
  { id: 's4', category: 'STUDY', title: '지식의 탐구자', description: '자기계발 프로젝트 퀘스트 20개 완수', icon: '📖', rewardXp: 1500 },
  
  // MYSTIC (미스테리 퀘스트 - 화면에서 감춰짐)
  { id: 'm1', category: 'MYSTIC', title: '행운의 주인공', description: '아바타를 정지 상태에서 50번 클릭', icon: '🍀', rewardXp: 777 },
  { id: 'm2', category: 'MYSTIC', title: '시간의 지배자', description: '새벽 4시 44분에 퀘스트 완료', icon: '⏳', rewardXp: 444 },
  { id: 'm3', category: 'MYSTIC', title: '디지털 금식', description: '집중 모드 중 한 번도 마우스를 이탈하지 않음', icon: '📵', rewardXp: 2000 },
  { id: 'm4', category: 'MYSTIC', title: '완벽주의자의 비애', description: '이미 완료된 퀘스트의 메모를 5회 이상 수정', icon: '💎', rewardXp: 100 },
  { id: 'm5', category: 'MYSTIC', title: '이스터 에그 발견', description: '상점 아이콘을 1분간 주시', icon: '🥚', rewardXp: 500 },
  { id: 'm6', category: 'MYSTIC', title: '프로젝트 중독', description: '동시에 5개 이상의 프로젝트 생성', icon: '📂', rewardXp: 1000 },
];

interface CategorySectionProps {
  category: { key: string; label: string; icon: React.ReactNode };
  items: Achievement[];
  unlockedIds: string[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, items, unlockedIds }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayItems = isExpanded ? items : items.slice(0, 8);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 px-2">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">{category.icon}</div>
        <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">{category.label}</h3>
        <span className="text-[10px] font-black text-gray-400 ml-auto">
          {items.filter(i => unlockedIds.includes(i.id)).length} / {items.length} COMPLETED
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-500">
        {displayItems.map(ach => {
          const isUnlocked = unlockedIds.includes(ach.id);
          const isMystery = ach.category === 'MYSTIC';
          
          return (
            <div key={ach.id} className={`group relative p-6 rounded-[32px] border-2 transition-all duration-500 ${isUnlocked ? 'bg-white border-amber-200 shadow-xl shadow-amber-50' : 'bg-gray-50 border-gray-100 opacity-60 grayscale'}`}>
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">
                {isUnlocked ? ach.icon : (isMystery ? '❓' : '🔒')}
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-sm mb-1">
                  {isUnlocked || !isMystery ? ach.title : '???'}
                </h4>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-4">
                  {isUnlocked || !isMystery ? ach.description : '이 퀘스트의 해금 조건은 아직 베일에 싸여 있습니다.'}
                </p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-indigo-600 font-black text-[10px] bg-indigo-50 px-2 py-1 rounded-lg">
                  <Zap size={10} className="fill-indigo-500" /> +{ach.rewardXp} XP
                </div>
                {isUnlocked && <Medal size={14} className="text-green-600" />}
              </div>
            </div>
          );
        })}
      </div>

      {items.length > 8 && (
        <button onClick={() => setIsExpanded(!isExpanded)} className="w-full py-4 flex items-center justify-center gap-2 text-indigo-600 font-black text-xs hover:bg-indigo-50 rounded-2xl transition-all border border-dashed border-indigo-100">
          {isExpanded ? <><ChevronUp size={16}/> 간략히 보기</> : <><ChevronDown size={16}/> 목록 펼쳐보기 ({items.length - 8}개 더 있음)</>}
        </button>
      )}
    </section>
  );
};

export const AchievementGallery: React.FC<{ unlockedIds: string[] }> = ({ unlockedIds }) => {
  const daysUntilReset = useMemo(() => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const diff = nextMonth.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, []);

  const categories = [
    { key: 'COMBAT', label: '전투 & 완수', icon: <Sword size={18}/> },
    { key: 'STUDY', label: '집중 & 학습', icon: <Target size={18}/> },
    { key: 'LIFE', label: '생활 & 기행', icon: <Coffee size={18}/> },
    { key: 'MYSTIC', label: '미스테리', icon: <Ghost size={18}/> },
  ];

  return (
    <div className="space-y-16 pb-20 animate-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black">명예의 전당 (HALL OF FAME)</h2>
            <p className="text-amber-100 font-bold text-xs uppercase tracking-widest">이곳에 기록된 당신의 업적은 전설이 됩니다.</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/30 text-center">
            <div className="text-4xl font-black mb-1">{daysUntilReset}일 남음</div>
            <p className="text-[10px] font-bold uppercase opacity-80">월간 초기화 카운트다운</p>
          </div>
        </div>
      </div>

      <div className="space-y-20">
        {categories.map(cat => (
          <CategorySection key={cat.key} category={cat} items={ACHIEVEMENTS.filter(a => a.category === cat.key)} unlockedIds={unlockedIds} />
        ))}
      </div>
    </div>
  );
};
