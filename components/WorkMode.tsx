
import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, SkipForward, Coffee, Music, Heart } from 'lucide-react';
import { ScheduleEntry, Persona } from '../types';
import { Character } from './Character';

interface WorkModeProps {
  isOpen: boolean;
  onClose: () => void;
  currentTask: ScheduleEntry | null;
  nextTask: ScheduleEntry | null;
  persona: Persona;
}

export const WorkMode: React.FC<WorkModeProps> = ({ isOpen, onClose, currentTask, nextTask, persona }) => {
  const [time, setTime] = useState(new Date());
  const [timeLeft, setTimeLeft] = useState<string>('--:--');
  const [isPlaying, setIsPlaying] = useState(false);
  const [quote, setQuote] = useState('지금 이 순간에 집중하세요. 당신은 빛나고 있어요!');

  const quotes = [
    "작은 성취가 모여 큰 승리가 됩니다!",
    "당신의 노력이 미래를 바꿉니다.",
    "지금 하는 일에 온 마음을 다하세요.",
    "힘들면 잠시 커피 한 잔 어때요?",
    "거의 다 왔어요! 조금만 더 힘내요!",
    "당신은 오늘 최고로 멋진 퀘스트를 수행 중입니다."
  ];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentTask) {
      const calculateRemaining = () => {
        const [endH, endM] = currentTask.endTime.split(':').map(Number);
        const end = new Date();
        end.setHours(endH, endM, 0);
        
        const diff = end.getTime() - new Date().getTime();
        if (diff <= 0) return '00:00';
        
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      };
      const int = setInterval(() => setTimeLeft(calculateRemaining()), 1000);
      return () => clearInterval(int);
    } else {
      setTimeLeft('--:--');
    }
  }, [currentTask]);

  useEffect(() => {
    const qInt = setInterval(() => {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 15000);
    return () => clearInterval(qInt);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-indigo-950 flex flex-col items-center justify-center p-6 text-white animate-in fade-in zoom-in duration-500 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-white/10 rounded-full transition-all group">
        <X size={32} className="text-white/50 group-hover:text-white" />
      </button>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-12">
        {/* Clock Section */}
        <div className="text-center">
          <div className="text-8xl font-black tracking-tighter opacity-90 drop-shadow-2xl">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
          <div className="text-indigo-300 font-bold tracking-widest uppercase mt-2">Current Time</div>
        </div>

        {/* Character & Quote */}
        <div className="flex flex-col items-center gap-6">
          <Character 
            expression={currentTask ? 'FOCUSED' : 'HAPPY'} 
            avatar={persona.avatar}
            size="xl" 
            className="drop-shadow-2xl" 
          />
          <div className="bg-white/5 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/10 text-center max-w-md shadow-2xl">
            <p className="text-lg font-medium italic text-indigo-100 flex items-center gap-2">
              <Heart size={18} className="text-pink-400 animate-pulse fill-pink-400" />
              "{quote}"
            </p>
          </div>
        </div>

        {/* Task Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Current Task */}
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[40px] border border-white/20 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <Coffee size={100} />
             </div>
             <h3 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-4">현재 작업</h3>
             {currentTask ? (
               <div>
                 <h2 className="text-3xl font-bold mb-2 truncate">{currentTask.title}</h2>
                 <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 px-4 py-1 rounded-full text-sm font-bold animate-pulse">
                      남은 시간: {timeLeft}
                    </div>
                    <span className="text-white/50 text-sm font-medium">{currentTask.startTime} - {currentTask.endTime}</span>
                 </div>
               </div>
             ) : (
               <div className="text-white/30 font-medium">진행 중인 작업이 없습니다.</div>
             )}
          </div>

          {/* Next Task */}
          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-[40px] border border-white/10 shadow-xl opacity-80">
             <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">다음 작업</h3>
             {nextTask ? (
               <div>
                 <h2 className="text-2xl font-bold mb-2 truncate">{nextTask.title}</h2>
                 <div className="text-white/40 text-sm font-medium">{nextTask.startTime} 시작 예정</div>
               </div>
             ) : (
               <div className="text-white/20 font-medium">다음 일정이 없습니다.</div>
             )}
          </div>
        </div>

        {/* Sound Controls */}
        <div className="flex items-center gap-6 bg-white/10 px-8 py-4 rounded-full border border-white/20">
          <Music size={20} className="text-indigo-300" />
          <div className="h-6 w-px bg-white/10"></div>
          <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 hover:text-indigo-300 transition-colors">
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-white/40">Ambient Sound</span>
            <span className="text-sm font-bold">Rainy Forest (추천)</span>
          </div>
          <Volume2 size={20} className="text-white/40" />
        </div>
      </div>
    </div>
  );
};
