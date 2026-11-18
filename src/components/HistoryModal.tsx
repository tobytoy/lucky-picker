import React from 'react';
import { History, Download, Copy, Trash2, X, RotateCcw } from 'lucide-react';
import { DrawRecord } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  records: DrawRecord[];
  onClose: () => void;
  onClearRecords: () => void;
  onDeleteRecord: (id: string) => void;
  onRollbackRecord: (record: DrawRecord) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  records,
  onClose,
  onClearRecords,
  onDeleteRecord,
  onRollbackRecord,
}) => {
  if (!isOpen) return null;

  const exportCSV = () => {
    if (records.length === 0) {
      alert('目前沒有中獎紀錄可匯出');
      return;
    }

    const headers = ['次序', '時間', '中獎編號', '中獎人姓名', '獲得獎項'];
    const rows = records.map((r, i) => [
      i + 1,
      r.timestamp,
      `"${r.participantCode}"`,
      `"${r.participantName || ''}"`,
      `"${r.prizeName}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lucky-picker-draw-records-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (records.length === 0) return;
    const lines = records.map(
      (r, i) => `${i + 1}. [${r.timestamp}] ${r.prizeName} -> ${r.participantCode} ${r.participantName || ''}`
    );
    navigator.clipboard.writeText(lines.join('\n'));
    alert('中獎紀錄已複製至剪貼簿！');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base sm:text-lg">
                中獎紀錄列表
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                  共 {records.length} 筆紀錄
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              disabled={records.length === 0}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow transition"
            >
              <Download className="w-3.5 h-3.5" /> 匯出 CSV (Excel)
            </button>
            <button
              onClick={copyToClipboard}
              disabled={records.length === 0}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold rounded-xl flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" /> 複製文字
            </button>
          </div>

          {records.length > 0 && (
            <button
              onClick={() => {
                if (confirm('確定要清空所有中獎歷史紀錄嗎？')) {
                  onClearRecords();
                }
              }}
              className="text-slate-500 hover:text-rose-400 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> 清空所有紀錄
            </button>
          )}
        </div>

        {/* Records list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 min-h-[200px]">
          {records.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs sm:text-sm">
              尚無中獎紀錄，快轉動輪盤抽出大獎！
            </div>
          ) : (
            records.map((record, index) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 text-xs sm:text-sm transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-center font-mono font-bold text-slate-500 text-xs">
                    #{index + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-400">{record.prizeName}</span>
                    </div>
                    <div className="text-slate-300 font-mono mt-0.5">
                      得獎者：
                      <span className="font-bold text-white bg-slate-700/60 px-1.5 py-0.5 rounded">
                        {record.participantCode}
                      </span>
                      {record.participantName && record.participantName !== record.participantCode && (
                        <span className="text-slate-400 ml-1.5">({record.participantName})</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    {record.timestamp}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`確定要作廢此紀錄並將獎項/資格還原嗎？`)) {
                        onRollbackRecord(record);
                      }
                    }}
                    title="作廢重抽（還原資格與獎品數量）"
                    className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-700 rounded transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteRecord(record.id)}
                    title="僅刪除此筆紀錄"
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs sm:text-sm transition"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
