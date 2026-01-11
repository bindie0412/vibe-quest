
import React from 'react';
import { Clock, X } from 'lucide-react';

interface DurationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (minutes: number) => void;
  currentValue: number;
}

export const DurationPicker: React.FC<DurationPickerProps> = ({ isOpen, onClose, onSelect, currentValue }) => {
  if (!isOpen) return null;

  const options = Array.from({ length: 24 }, (_, i) => (i + 1) * 10); // 10m to 240m

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><Clock size={18}/> 소요 시간 (10분 단위)</h3>
          <button onClick={onClose}><X size={18}/></button>
        </div>
        <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[300px] custom-scrollbar p-1">
          {options.map(m => (
            <button
              key={m}
              onClick={() => { onSelect(m); onClose(); }}
              className={`py-2 text-sm font-bold rounded-lg transition-all ${currentValue === m ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              {m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
