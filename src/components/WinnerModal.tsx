import React, { useEffect } from 'react';
import { Trophy, Sparkles, UserCheck, X, RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { fireCelebrationConfetti } from '../utils/confetti';
import { WheelItem } from './Wheel';
import { Prize } from '../types';

interface WinnerModalProps {
  isOpen: boolean;
  winnerItem: WheelItem | null;
  currentPrize?: Prize | null;
  mode: 'participants' | 'prizes';
  onClose: () => void;
  onConfirmRemoveWinner?: () => void;
  onKeepWinner?: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  isOpen,
  winnerItem,
  currentPrize,
  mode,
  onClose,
  onConfirmRemoveWinner,
  onKeepWinner,
}) => {
  useEffect(() => {
    if (isOpen && winnerItem) {
      soundManager.playWin();
      fireCelebrationConfetti();
    }
  }, [isOpen, winnerItem]);

  if (!isOpen || !winnerItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(245,158,11,0.3)] animate-in zoom-in-90 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Trophy Icon */}
        <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/40">
            <Trophy className="w-10 h-10 text-slate-950 animate-bounce" />
          </div>
          <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-300 animate-pulse" />
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide uppercase mb-1">
          🎉 恭喜中獎！ 🎉
        </h3>
        <p className="text-sm text-slate-400 mb-6">幸運得主出爐，掌聲鼓勵！</p>

        {/* Winner Highlight Card */}
        <div className="bg-slate-800/90 border border-amber-500/30 rounded-2xl p-5 mb-6 shadow-inner">
          {mode === 'participants' ? (
            <>
              {currentPrize && (
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs sm:text-sm font-semibold">
                  <span>獲得獎項：</span>
                  <span className="font-bold text-white">{currentPrize.name}</span>
                </div>
              )}
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 py-1">
                {winnerItem.label}
              </div>
              {winnerItem.subLabel && (
                <div className="text-base text-slate-300 font-medium mt-1">
                  {winnerItem.subLabel}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-xs text-slate-400 mb-1">轉中獎項</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 py-1">
                {winnerItem.label}
              </div>
              {winnerItem.subLabel && (
                <div className="text-sm text-slate-400 mt-1">
                  {winnerItem.subLabel}
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {mode === 'participants' && onConfirmRemoveWinner && (
            <button
              onClick={() => {
                onConfirmRemoveWinner();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition active:scale-95"
            >
              <UserCheck className="w-5 h-5" />
              確認領獎（移出名單，不重複抽）
            </button>
          )}

          {mode === 'participants' && onKeepWinner && (
            <button
              onClick={() => {
                onKeepWinner();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4" />
              保留在名單內（可再次被抽中）
            </button>
          )}

          {mode === 'prizes' && (
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg transition active:scale-95"
            >
              太棒了！繼續抽下一個
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
