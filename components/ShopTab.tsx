
import React from 'react';
import { Coins, Check, Zap, ShoppingCart, Paintbrush, MessageSquare, Ticket } from 'lucide-react';
import { ShopItem } from '../types';

interface ShopTabProps {
  items: ShopItem[];
  userXp: number;
  currentAvatar: string;
  onBuy: (item: ShopItem) => void;
  onEquip: (icon: string) => void;
}

export const ShopTab: React.FC<ShopTabProps> = ({ items, userXp, currentAvatar, onBuy, onEquip }) => {
  const categories = [
    { type: 'AVATAR', label: '캐릭터 스킨', icon: <Zap size={20}/> },
    { type: 'EDIT_TICKET', label: '아이템', icon: <Ticket size={20}/> },
    { type: 'THEME', label: '테마 색상', icon: <Paintbrush size={20}/> },
    { type: 'QUOTE_PACK', label: '문구 팩', icon: <MessageSquare size={20}/> },
  ];

  return (
    <div className="space-y-10 pb-20 animate-in slide-in-from-bottom-4 duration-700">
      <div className="bg-indigo-600 rounded-[40px] p-10 text-white shadow-2xl shadow-indigo-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">VIBE EMPORIUM</h2>
          <p className="text-indigo-100 font-bold opacity-80 uppercase tracking-widest text-xs">노력의 결실을 가치 있게 바꾸세요.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-10 py-5 rounded-3xl border border-white/20 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600">
             <Coins size={28} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">보유 XP</div>
            <div className="text-3xl font-black">{userXp.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {categories.map(cat => (
          <section key={cat.type} className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">{cat.icon}</div>
              <h3 className="text-xl font-black text-gray-800">{cat.label}</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.filter(i => i.type === cat.type).map(item => {
                const isEquipped = item.type === 'AVATAR' && currentAvatar === item.icon;
                return (
                  <div key={item.id} className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-5xl group-hover:scale-110 transition-transform">{item.icon}</div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full font-black text-[10px]">
                        <Coins size={12}/> {item.cost}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-black text-gray-900">{item.name}</h4>
                      <p className="text-[11px] text-gray-400 font-medium leading-relaxed">{item.description}</p>
                    </div>
                    <div className="mt-6">
                      {item.owned && item.type === 'AVATAR' ? (
                        <button onClick={() => onEquip(item.icon)} className={`w-full py-3 rounded-2xl font-black text-xs transition-all ${isEquipped ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'}`}>
                          {isEquipped ? '장착 중' : '장착하기'}
                        </button>
                      ) : (
                        <button onClick={() => onBuy(item)} disabled={userXp < item.cost && !item.owned} className={`w-full py-3 rounded-2xl font-black text-xs transition-all ${item.owned && item.type !== 'EDIT_TICKET' ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:bg-gray-200 disabled:shadow-none'}`}>
                          {item.owned && item.type !== 'EDIT_TICKET' ? '보유함' : '구매하기'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
