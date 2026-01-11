
import React, { useState } from 'react';
import { X, Layout, Sparkles, Loader2, BarChart3, PlusCircle } from 'lucide-react';
import { Project, Difficulty, ScheduleEntry } from '../types';
import { generateProjectPlan, suggestAIScheduling } from '../services/geminiService';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  selectedProject?: Project | null;
  onAutoSchedule?: (suggestions: Partial<ScheduleEntry>[]) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSave, selectedProject, onAutoSchedule }) => {
  const [name, setName] = useState(selectedProject?.name || '');
  const [description, setDescription] = useState(selectedProject?.description || '');
  const [difficulty, setDifficulty] = useState<Difficulty>(selectedProject?.difficulty || 'Normal');
  const [color, setColor] = useState(selectedProject?.color || '#6366f1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPlan, setAiPlan] = useState('');

  if (!isOpen) return null;

  const handleGeneratePlan = async () => {
    if (!name) return;
    setIsGenerating(true);
    const plan = await generateProjectPlan({ name, description, difficulty });
    setAiPlan(plan);
    setIsGenerating(false);
  };

  const handleAutoSchedule = async () => {
    if (!selectedProject || !onAutoSchedule) return;
    setIsGenerating(true);
    const suggestions = await suggestAIScheduling([], selectedProject);
    onAutoSchedule(suggestions);
    setIsGenerating(false);
    onClose();
  };

  const handleSave = () => {
    if (!name) return;
    onSave({
      id: selectedProject?.id || `p-${Date.now()}`,
      name,
      description,
      difficulty,
      color
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        <div className="p-8 border-b flex items-center justify-between bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <Layout size={24} />
            <h2 className="text-xl font-black">{selectedProject ? '프로젝트 관리' : '새로운 프로젝트 생성'}</h2>
          </div>
          <button onClick={onClose}><X size={24}/></button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {selectedProject && (
            <button 
              onClick={handleAutoSchedule}
              disabled={isGenerating}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
              AI로 시간표 빈칸 자동 채우기
            </button>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">프로젝트 이름</label>
            <input 
              value={name} onChange={e => setName(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold"
              placeholder="제목 입력"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">난이도</label>
              <select 
                value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none font-bold"
              >
                <option value="Easy">쉬움</option>
                <option value="Normal">보통</option>
                <option value="Hard">어려움</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">색상</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-14 bg-gray-50 rounded-2xl p-1" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">설명</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-5 py-4 bg-gray-50 rounded-2xl h-32 outline-none font-medium" />
          </div>

          {(aiPlan || selectedProject) && (
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
               <h4 className="flex items-center gap-2 text-indigo-700 font-black text-sm uppercase mb-3"><BarChart3 size={16} /> 프로젝트 플랜</h4>
               <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">{aiPlan || "AI 플랜 생성을 눌러보세요."}</div>
               {!aiPlan && (
                  <button onClick={handleGeneratePlan} className="mt-4 text-xs font-black text-indigo-600 flex items-center gap-1 hover:underline">
                    <Sparkles size={12}/> AI 가이드 생성하기
                  </button>
               )}
            </div>
          )}

          <button 
            onClick={handleSave}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            저장 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
