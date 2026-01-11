
import React from 'react';
import { X, Coins, Check } from 'lucide-react';
import { ShopItem } from '../types';

interface XPShopProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShopItem[];
  userXp: number;
  currentAvatar: string;
  onBuy: (id: string) => void;
  onEquip: (id: string) => void;
}

export const XPShop: React.FC<XPShopProps> = ({ isOpen, onClose, items, userXp, currentAvatar, onBuy, onEquip }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b flex items-center justify-between bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black">XP 스킨 상점</h2>
            <div className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-black">
              <Coins size={14}/> {userXp.toLocaleString()}
            </div>
          </div>
          <button onClick={onClose}><X size={20}/></button>
        </div>

        <div className="p-6 grid grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {items.map(item => {
            const isEquipped = currentAvatar === item.icon;
            return (
              <div key={item.id} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${item.owned ? 'bg-indigo-50 border-indigo-100 shadow-sm' : 'bg-white border-gray-100 hover:border-indigo-100'}`}>
                <div className="text-3xl relative">
                  {item.icon}
                  {isEquipped && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                      <Check size={10} strokeWidth={4} />
                    </div>
                  )}
                </div>
                <div className="text-[10px] font-black text-gray-800 text-center leading-tight h-8 flex items-center">{item.name}</div>
                
                {item.owned ? (
                  <button 
                    onClick={() => onEquip(item.id)}
                    className={`w-full py-1.5 text-[9px] font-black rounded-lg transition-all ${isEquipped ? 'bg-white text-indigo-600 border border-indigo-200' : 'bg-indigo-600 text-white shadow-md shadow-indigo-100'}`}
                  >
                    {isEquipped ? '착용 중' : '장착하기'}
                  </button>
                ) : (
                  <button 
                    onClick={() => onBuy(item.id)} 
                    disabled={userXp < item.cost}
                    className="w-full py-1.5 bg-indigo-600 disabled:bg-gray-200 text-white text-[9px] font-black rounded-lg transition-all"
                  >
                    {item.cost.toLocaleString()} XP
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
