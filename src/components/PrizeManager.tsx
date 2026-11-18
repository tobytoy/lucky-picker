import React, { useState } from 'react';
import { Gift, Plus, Trash2, RotateCcw, Check, Edit2 } from 'lucide-react';
import { Prize } from '../types';

interface PrizeManagerProps {
  prizes: Prize[];
  selectedPrizeId: string | null;
  onSelectPrize: (id: string) => void;
  onUpdatePrizes: (updated: Prize[]) => void;
}

const PRESET_COLORS = [
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#f97316', // Orange
  '#06b6d4', // Cyan
];

export const PrizeManager: React.FC<PrizeManagerProps> = ({
  prizes,
  selectedPrizeId,
  onSelectPrize,
  onUpdatePrizes,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [count, setCount] = useState<number>(1);
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const totalPrizes = prizes.reduce((acc, p) => acc + p.count, 0);
  const remainingPrizes = prizes.reduce((acc, p) => acc + p.remaining, 0);

  const handleAddPrize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPrize: Prize = {
      id: `prize-${Date.now()}`,
      name: name.trim(),
      count: Math.max(1, count),
      remaining: Math.max(1, count),
      color,
    };

    onUpdatePrizes([...prizes, newPrize]);
    setName('');
    setCount(1);
    setIsAdding(false);
  };

  const handleSaveEdit = (prize: Prize, newName: string, newTotal: number) => {
    const diff = newTotal - prize.count;
    const updated = prizes.map((p) => {
      if (p.id === prize.id) {
        return {
          ...p,
          name: newName,
          count: newTotal,
          remaining: Math.max(0, p.remaining + diff),
        };
      }
      return p;
    });
    onUpdatePrizes(updated);
    setEditingId(null);
  };

  const handleDeletePrize = (id: string) => {
    onUpdatePrizes(prizes.filter((p) => p.id !== id));
    if (selectedPrizeId === id) {
      const remainingList = prizes.filter((p) => p.id !== id);
      if (remainingList.length > 0) onSelectPrize(remainingList[0].id);
    }
  };

  const handleResetAllPrizeCounts = () => {
    if (confirm('確定要將所有獎項的剩餘名額重置回初始數量嗎？')) {
      const reset = prizes.map((p) => ({ ...p, remaining: p.count }));
      onUpdatePrizes(reset);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm sm:text-base">
              獎項管理與設定
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                剩餘 {remainingPrizes} / 總額 {totalPrizes} 份
              </span>
            </h3>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          新增獎項
        </button>
      </div>

      {/* Add Prize Accordion Form */}
      {isAdding && (
        <form onSubmit={handleAddPrize} className="py-3 border-b border-slate-800 space-y-3 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 text-xs mb-1">獎項名稱</label>
              <input
                type="text"
                required
                placeholder="例如：頭獎 - 4K 智慧電視"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">名額數量</label>
              <input
                type="number"
                min="1"
                required
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1">代表色彩</label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition ${
                    color === c ? 'border-white scale-110 shadow' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded-lg text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
            >
              確認新增
            </button>
          </div>
        </form>
      )}

      {/* Prize list */}
      <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-2 min-h-[160px] max-h-[340px]">
        {prizes.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            目前無獎項，請點擊上方按鈕新增獎項
          </div>
        ) : (
          prizes.map((prize) => {
            const isSelected = selectedPrizeId === prize.id;
            const isExhausted = prize.remaining <= 0;

            if (editingId === prize.id) {
              return (
                <div key={prize.id} className="p-3 bg-slate-800/90 rounded-xl border border-amber-500/50 space-y-2 text-xs">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      defaultValue={prize.name}
                      id={`edit-name-${prize.id}`}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    />
                    <input
                      type="number"
                      min="1"
                      defaultValue={prize.count}
                      id={`edit-count-${prize.id}`}
                      className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 py-0.5 text-slate-400 hover:text-white"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        const nameEl = document.getElementById(`edit-name-${prize.id}`) as HTMLInputElement;
                        const countEl = document.getElementById(`edit-count-${prize.id}`) as HTMLInputElement;
                        handleSaveEdit(prize, nameEl.value, parseInt(countEl.value) || 1);
                      }}
                      className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold rounded"
                    >
                      儲存
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={prize.id}
                onClick={() => onSelectPrize(prize.id)}
                className={`relative flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/80 shadow-md shadow-amber-500/10'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-200'
                } ${isExhausted ? 'opacity-60' : ''}`}
              >
                {/* Left color pill and title */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: prize.color }}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-xs sm:text-sm text-slate-100 truncate">
                      {prize.name}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>
                        名額剩餘：
                        <strong className={prize.remaining > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {prize.remaining}
                        </strong>{' '}
                        / {prize.count}
                      </span>
                      {isExhausted && (
                        <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded font-medium">
                          已全數抽出
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-1">
                  {isSelected && (
                    <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 mr-1">
                      <Check className="w-3 h-3" /> 當前選定
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(prize.id);
                    }}
                    title="編輯"
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePrize(prize.id);
                    }}
                    title="刪除"
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 mt-auto border-t border-slate-800 flex items-center justify-between text-xs">
        <button
          onClick={handleResetAllPrizeCounts}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" /> 恢復所有名額
        </button>
        <span className="text-slate-500 text-[11px]">點選獎項可設為當前抽獎目標</span>
      </div>
    </div>
  );
};
