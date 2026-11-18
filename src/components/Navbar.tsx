import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  History,
  Maximize2,
  Minimize2,
  RotateCcw,
} from 'lucide-react';
import { DrawMode } from '../types';

interface NavbarProps {
  mode: DrawMode;
  onChangeMode: (mode: DrawMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  recordCount: number;
  onOpenHistory: () => void;
  onResetAll: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onChangeMode,
  soundEnabled,
  onToggleSound,
  recordCount,
  onOpenHistory,
  onResetAll,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-rose-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="font-black text-lg sm:text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
              Lucky Picker <span className="text-amber-400 font-extrabold text-sm sm:text-base">幸運大輪盤</span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              自訂編號與獎項的抽獎系統
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-2xl text-xs font-semibold shadow-inner">
          <button
            onClick={() => onChangeMode('participants')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              mode === 'participants'
                ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎯 抽名單編號</span>
          </button>
          <button
            onClick={() => onChangeMode('prizes')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              mode === 'prizes'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎁 抽大獎</span>
          </button>
          <button
            onClick={() => onChangeMode('qa')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              mode === 'qa'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎤 上台回答問題</span>
          </button>
        </div>

        {/* Utility Actions */}
        <div className="flex items-center gap-2">
          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="relative px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
            title="查看中獎紀錄"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>中獎紀錄</span>
            {recordCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {recordCount}
              </span>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition ${
              soundEnabled
                ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={soundEnabled ? '關閉音效' : '開啟音效'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isFullscreen ? '退出全螢幕' : '投影全螢幕模式'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Reset All */}
          <button
            onClick={() => {
              if (confirm('確定要恢復預設範例資料（清除目前的所有修改與紀錄）嗎？')) {
                onResetAll();
              }
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            title="重設所有資料為預設範例"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
