import React from 'react';
import { HelpCircle, RotateCcw, ListFilter, Hash, Mic, CheckCircle2 } from 'lucide-react';
import { QAModeConfig } from '../types';

interface QAControlPanelProps {
  config: QAModeConfig;
  onUpdateConfig: (updated: QAModeConfig) => void;
  activeCandidates: string[];
}

export const QAControlPanel: React.FC<QAControlPanelProps> = ({
  config,
  onUpdateConfig,
  activeCandidates,
}) => {
  const handleTypeChange = (type: 'range' | 'custom') => {
    onUpdateConfig({ ...config, type });
  };

  const handleResetCalled = () => {
    if (confirm('確定要清空已點名名單，讓所有人重新具備上台資格嗎？')) {
      onUpdateConfig({ ...config, calledCodes: [] });
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm sm:text-base">
              上台回答問題設定
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 font-normal">
                候選 {activeCandidates.length} 人
              </span>
            </h3>
          </div>
        </div>
      </div>

      <div className="py-3 space-y-4 flex-1 overflow-y-auto">
        {/* Question Title input */}
        <div>
          <label className="block text-slate-400 text-xs font-medium mb-1">
            問答主題 / 題目標題
          </label>
          <input
            type="text"
            value={config.questionTitle}
            onChange={(e) => onUpdateConfig({ ...config, questionTitle: e.target.value })}
            placeholder="例如：第 1 題回答者、英文課堂抽籤、隨堂發表"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Input Mode Switcher */}
        <div>
          <label className="block text-slate-400 text-xs font-medium mb-1.5">
            號碼指定方式
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('range')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                config.type === 'range'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              連續編號區間
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('custom')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                config.type === 'custom'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              指定自訂號碼
            </button>
          </div>
        </div>

        {/* Setting Form: Range */}
        {config.type === 'range' ? (
          <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-3">
            <div className="text-xs font-semibold text-purple-300 flex items-center gap-1">
              <Hash className="w-4 h-4" /> 設定區間（多少號到多少號）
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">起始號碼</label>
                <input
                  type="number"
                  min="1"
                  value={config.rangeStart}
                  onChange={(e) =>
                    onUpdateConfig({
                      ...config,
                      rangeStart: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-purple-500 font-mono text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">結束號碼</label>
                <input
                  type="number"
                  min="1"
                  value={config.rangeEnd}
                  onChange={(e) =>
                    onUpdateConfig({
                      ...config,
                      rangeEnd: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-purple-500 font-mono text-center font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">位數補零</label>
                <select
                  value={config.padDigits}
                  onChange={(e) =>
                    onUpdateConfig({
                      ...config,
                      padDigits: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100 text-xs"
                >
                  <option value={0}>不補零 (1, 2, 3...)</option>
                  <option value={2}>2 位數 (01, 02...)</option>
                  <option value={3}>3 位數 (001, 002...)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">號碼前綴 (選填)</label>
                <input
                  type="text"
                  placeholder="如 No."
                  value={config.prefix}
                  onChange={(e) => onUpdateConfig({ ...config, prefix: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none text-xs"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Setting Form: Custom numbers list */
          <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
              <span className="flex items-center gap-1">
                <ListFilter className="w-4 h-4" /> 輸入指定號碼清單
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                逗號、空白皆可隔開
              </span>
            </div>

            <textarea
              rows={3}
              value={config.customInput}
              onChange={(e) => onUpdateConfig({ ...config, customInput: e.target.value })}
              placeholder="例如：1, 3, 7, 10 或 5-8, 12, 19"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:border-purple-500 focus:outline-none"
            />

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400">快速範例：</span>
              <button
                type="button"
                onClick={() =>
                  onUpdateConfig({ ...config, customInput: '1, 3, 7, 10' })
                }
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30"
              >
                1, 3, 7, 10
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateConfig({ ...config, customInput: '2, 4, 6, 8, 10' })
                }
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30"
              >
                偶數組
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateConfig({ ...config, customInput: '1-5, 8, 12, 16' })
                }
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30"
              >
                範圍混合
              </button>
            </div>
          </div>
        )}

        {/* Exclusion option */}
        <div className="pt-1">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition border border-slate-800">
            <input
              type="checkbox"
              checked={config.excludeCalled}
              onChange={(e) => onUpdateConfig({ ...config, excludeCalled: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-0"
            />
            <span>避免重複點名（已上台過者自動移出抽籤池）</span>
          </label>
        </div>

        {/* Called list tags */}
        {config.calledCodes.length > 0 && (
          <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> 已上台回答 ({config.calledCodes.length} 人)
              </span>
              <button
                type="button"
                onClick={handleResetCalled}
                className="text-purple-400 hover:text-purple-300 text-[10px] underline"
              >
                全部重置回抽籤池
              </button>
            </div>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {config.calledCodes.map((code) => (
                <span
                  key={code}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono line-through"
                >
                  {code} 號
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={handleResetCalled}
          disabled={config.calledCodes.length === 0}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" /> 重置上台紀錄
        </button>
        <span className="text-slate-500 text-[11px] flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" /> 轉動輪盤直接抽中回答者
        </span>
      </div>
    </div>
  );
};
