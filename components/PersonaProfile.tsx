
import React from 'react';
import { Trophy, ShoppingBag, Zap, Medal } from 'lucide-react';
import { Persona } from '../types';
import { Character } from './Character';

interface PersonaProfileProps {
  persona: Persona;
  onOpenShop: () => void;
  onOpenAchievements: () => void;
}

export const PersonaProfile: React.FC<PersonaProfileProps> = ({ persona, onOpenShop, onOpenAchievements }) => {
  const xpPercent = (persona.xp / persona.nextLevelXp) * 100;

  return (
    <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl shadow-indigo-50/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
        <Zap size={150} className="text-indigo-600" />
      </div>

      <div className="flex flex-col items-center mb-8 relative z-10">
        <div className="relative mb-4">
          <div className="w-32 h-32 bg-indigo-50 rounded-[40px] flex items-center justify-center border-4 border-white shadow-inner overflow-hidden">
            <Character 
              expression={persona.expression} 
              avatar={persona.avatar} 
              size="lg" 
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white text-sm font-black w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            LV{persona.level}
          </div>
        </div>
        
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Growth Progress</span>
            <span className="text-[10px] font-black text-indigo-600">{Math.floor(persona.xp).toLocaleString()} / {persona.nextLevelXp.toLocaleString()} XP</span>
          </div>
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden p-1">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.5)]" style={{ width: `${xpPercent}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={onOpenShop} className="flex items-center justify-center gap-2 p-4 bg-indigo-50 text-indigo-700 rounded-2xl font-black text-xs hover:bg-indigo-100 transition-all border border-indigo-100">
          <ShoppingBag size={16}/> 스킨 상점
        </button>
        <button onClick={onOpenAchievements} className="flex items-center justify-center gap-2 p-4 bg-amber-50 text-amber-700 rounded-2xl font-black text-xs border border-amber-100 hover:bg-amber-100 transition-all">
          <Medal size={16}/> 도전 과제
        </button>
      </div>
    </div>
  );
};
