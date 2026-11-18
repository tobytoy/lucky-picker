import React, { useState } from 'react';
import {
  Users,
  Plus,
  Shuffle,
  RotateCcw,
  Trash2,
  ListPlus,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { Participant } from '../types';
import { parseCustomNumbers } from '../utils/numberParser';

interface ParticipantManagerProps {
  participants: Participant[];
  onUpdateParticipants: (updated: Participant[]) => void;
}

export const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  participants,
  onUpdateParticipants,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'quick-range' | 'bulk'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWon, setFilterWon] = useState<'all' | 'unwon' | 'won'>('all');

  // Single add form
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');

  // Quick range generator form
  const [genType, setGenType] = useState<'range' | 'custom'>('range');
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(50);
  const [customNumberText, setCustomNumberText] = useState<string>('1, 3, 7, 10');
  const [rangePrefix, setRangePrefix] = useState<string>('');
  const [rangePad, setRangePad] = useState<number>(0);

  // Bulk paste form
  const [bulkText, setBulkText] = useState('');

  // Filtered participants
  const filtered = participants.filter((p) => {
    if (filterWon === 'unwon' && p.isWon) return false;
    if (filterWon === 'won' && !p.isWon) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.code.toLowerCase().includes(q) || (p.name && p.name.toLowerCase().includes(q));
  });

  const remainingCount = participants.filter((p) => !p.isWon).length;

  // Handlers
  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    const item: Participant = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code: newCode.trim(),
      name: newName.trim() || undefined,
      isWon: false,
    };
    onUpdateParticipants([...participants, item]);
    setNewCode('');
    setNewName('');
  };

  const handleGenerateRange = () => {
    let newItems: Participant[] = [];

    if (genType === 'range') {
      if (rangeStart > rangeEnd) {
        alert('起始號碼不能大於結束號碼！');
        return;
      }
      const count = rangeEnd - rangeStart + 1;
      if (count > 2000) {
        alert('單次生成號碼請不要超過 2000 筆！');
        return;
      }

      for (let i = rangeStart; i <= rangeEnd; i++) {
        const codeStr = rangePad > 0 ? i.toString().padStart(rangePad, '0') : i.toString();
        const finalCode = rangePrefix ? `${rangePrefix}${codeStr}` : codeStr;
        newItems.push({
          id: `p-${Date.now()}-${i}`,
          code: finalCode,
          name: `${finalCode} 號`,
          isWon: false,
        });
      }
    } else {
      // Custom numbers e.g. "1, 3, 7, 10"
      const codes = parseCustomNumbers(customNumberText, rangePad, rangePrefix);
      if (codes.length === 0) {
        alert('請輸入有效的自訂號碼，例如 1, 3, 7, 10！');
        return;
      }
      newItems = codes.map((c, idx) => ({
        id: `p-${Date.now()}-${idx}`,
        code: c,
        name: `${c} 號`,
        isWon: false,
      }));
    }

    if (confirm(`即將設定 ${newItems.length} 個抽獎號碼，是否直接覆蓋目前名單？（點「取消」則保留原有名單並追加於後方）`)) {
      onUpdateParticipants(newItems);
    } else {
      onUpdateParticipants([...participants, ...newItems]);
    }
    setActiveTab('list');
  };

  const handleBulkImport = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const imported: Participant[] = lines.map((line, idx) => {
      // Check if comma or tab separated (code, name)
      const parts = line.split(/[,，\t]/).map((p) => p.trim());
      if (parts.length >= 2) {
        return {
          id: `p-${Date.now()}-${idx}`,
          code: parts[0],
          name: parts.slice(1).join(' '),
          isWon: false,
        };
      }
      return {
        id: `p-${Date.now()}-${idx}`,
        code: line,
        name: line,
        isWon: false,
      };
    });

    if (confirm(`已解析出 ${imported.length} 筆名單，是否直接覆蓋目前名單？（點「取消」則為追加至名單後方）`)) {
      onUpdateParticipants(imported);
    } else {
      onUpdateParticipants([...participants, ...imported]);
    }
    setBulkText('');
    setActiveTab('list');
  };

  const handleShuffle = () => {
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    onUpdateParticipants(shuffled);
  };

  const handleResetWonStatus = () => {
    if (confirm('確定要將所有中獎標記重置（全部重新恢復可抽獎資格）嗎？')) {
      const reset = participants.map((p) => ({ ...p, isWon: false, wonPrizeId: undefined, wonAt: undefined }));
      onUpdateParticipants(reset);
    }
  };

  const handleClearAll = () => {
    if (confirm('確定要清空所有參加者名單嗎？此操作無法復原。')) {
      onUpdateParticipants([]);
    }
  };

  const handleDeleteItem = (id: string) => {
    onUpdateParticipants(participants.filter((p) => p.id !== id));
  };

  const handleToggleWon = (id: string) => {
    onUpdateParticipants(
      participants.map((p) => (p.id === id ? { ...p, isWon: !p.isWon } : p))
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm sm:text-base">
              名單與編號設定
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                剩餘 {remainingCount} / 共 {participants.length} 人
              </span>
            </h3>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-2.5 py-1 rounded-lg transition ${
              activeTab === 'list' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            名單檢視
          </button>
          <button
            onClick={() => setActiveTab('quick-range')}
            className={`px-2.5 py-1 rounded-lg transition ${
              activeTab === 'quick-range' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            快速生成
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-2.5 py-1 rounded-lg transition ${
              activeTab === 'bulk' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            批次貼上
          </button>
        </div>
      </div>

      {/* Tab: Quick Range Generator */}
      {activeTab === 'quick-range' && (
        <div className="py-4 space-y-4 animate-in fade-in duration-200">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-amber-300 flex items-center gap-1.5">
                <ListPlus className="w-4 h-4" /> 快速號碼生成
              </h4>
              <div className="flex gap-1 text-[11px] bg-slate-900/80 p-0.5 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setGenType('range')}
                  className={`px-2 py-0.5 rounded ${genType === 'range' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  連續區間
                </button>
                <button
                  type="button"
                  onClick={() => setGenType('custom')}
                  className={`px-2 py-0.5 rounded ${genType === 'custom' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  指定號碼
                </button>
              </div>
            </div>

            {genType === 'range' ? (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">起始號碼</label>
                  <input
                    type="number"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">結束號碼</label>
                  <input
                    type="number"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-slate-400 text-xs mb-1">
                  輸入指定號碼（逗號、空白隔開，如 1, 3, 7, 10 或 1-5, 8）
                </label>
                <input
                  type="text"
                  value={customNumberText}
                  onChange={(e) => setCustomNumberText(e.target.value)}
                  placeholder="例如：1, 3, 7, 10"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">前綴詞 (選填)</label>
                <input
                  type="text"
                  placeholder="例如 NO."
                  value={rangePrefix}
                  onChange={(e) => setRangePrefix(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">位數補零</label>
                <select
                  value={rangePad}
                  onChange={(e) => setRangePad(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
                >
                  <option value={0}>不補零 (1, 2, 3...)</option>
                  <option value={2}>2 位數 (01, 02...)</option>
                  <option value={3}>3 位數 (001, 002...)</option>
                  <option value={4}>4 位數 (0001...)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateRange}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm shadow transition"
            >
              設定抽獎號碼
            </button>
          </div>
        </div>
      )}

      {/* Tab: Bulk Paste */}
      {activeTab === 'bulk' && (
        <div className="py-4 space-y-3 animate-in fade-in duration-200">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-2">
            <h4 className="text-sm font-semibold text-amber-300">批次貼上名單</h4>
            <p className="text-xs text-slate-400">
              每行一筆。支援純姓名、純號碼，或 <code className="text-amber-300">編號,姓名</code> 格式：
            </p>
            <textarea
              rows={6}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`例如：\n001, 王小明\n002, 李小華\n003, 陳大雄\n或直接每行一個名字`}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:border-rose-500 focus:outline-none"
            />
            <button
              onClick={handleBulkImport}
              disabled={!bulkText.trim()}
              className="w-full py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 text-white font-bold rounded-xl text-sm shadow transition"
            >
              匯入清單
            </button>
          </div>
        </div>
      )}

      {/* Tab: List View */}
      {activeTab === 'list' && (
        <div className="flex-1 flex flex-col min-h-0 pt-3">
          {/* Quick single add bar */}
          <form onSubmit={handleAddSingle} className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="編號 (如 101)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="w-28 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
            />
            <input
              type="text"
              placeholder="姓名/備註 (選填)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> 新增
            </button>
          </form>

          {/* Search & Filters */}
          <div className="flex items-center justify-between gap-2 mb-2 text-xs">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜尋編號或姓名..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1 text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterWon('all')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  filterWon === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterWon('unwon')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  filterWon === 'unwon' ? 'bg-slate-700 text-emerald-400' : 'text-slate-400'
                }`}
              >
                未中
              </button>
              <button
                onClick={() => setFilterWon('won')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  filterWon === 'won' ? 'bg-slate-700 text-rose-400' : 'text-slate-400'
                }`}
              >
                已中
              </button>
            </div>
          </div>

          {/* Participant items scroll container */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 min-h-[160px] max-h-[320px]">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                {participants.length === 0 ? '目前無名單，請先快速生成或批次貼上' : '無符合搜尋條件的名單'}
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs border transition ${
                    item.isWon
                      ? 'bg-slate-800/30 border-slate-800 text-slate-500 line-through'
                      : 'bg-slate-800/70 border-slate-700/60 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-amber-400">{item.code}</span>
                    {item.name && item.name !== item.code && (
                      <span className="truncate text-slate-300">{item.name}</span>
                    )}
                    {item.isWon && (
                      <span className="no-underline inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" /> 已中獎
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleWon(item.id)}
                      title={item.isWon ? '標記為未中獎' : '標記為已中獎'}
                      className={`p-1 rounded hover:bg-slate-700 ${
                        item.isWon ? 'text-slate-500 hover:text-emerald-400' : 'text-slate-400 hover:text-amber-400'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      title="刪除"
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-3 mt-auto border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShuffle}
                title="隨機打亂目前名單排序"
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition"
              >
                <Shuffle className="w-3 h-3" /> 打亂排序
              </button>
              <button
                onClick={handleResetWonStatus}
                title="重置所有人的中獎標記"
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" /> 重置中獎狀態
              </button>
            </div>
            <button
              onClick={handleClearAll}
              title="清空名單"
              className="text-slate-500 hover:text-rose-400 px-2 py-1 transition"
            >
              清空
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
