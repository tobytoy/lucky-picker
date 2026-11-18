import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Wheel, WheelItem } from './components/Wheel';
import { ParticipantManager } from './components/ParticipantManager';
import { PrizeManager } from './components/PrizeManager';
import { WinnerModal } from './components/WinnerModal';
import { HistoryModal } from './components/HistoryModal';
import {
  Participant,
  Prize,
  DrawRecord,
  DrawMode,
} from './types';
import {
  loadParticipants,
  saveParticipants,
  loadPrizes,
  savePrizes,
  loadRecords,
  saveRecords,
  loadDrawMode,
  saveDrawMode,
  loadSoundSetting,
  saveSoundSetting,
  DEFAULT_PARTICIPANTS,
  DEFAULT_PRIZES,
} from './utils/storage';
import { soundManager } from './utils/audio';
import { Sparkles, Award } from 'lucide-react';

export const App: React.FC = () => {
  // Main states
  const [participants, setParticipants] = useState<Participant[]>(loadParticipants);
  const [prizes, setPrizes] = useState<Prize[]>(loadPrizes);
  const [records, setRecords] = useState<DrawRecord[]>(loadRecords);
  const [drawMode, setDrawMode] = useState<DrawMode>(loadDrawMode);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(loadSoundSetting);

  // Selected Prize ID for 'participants' mode
  const [selectedPrizeId, setSelectedPrizeId] = useState<string | null>(() => {
    const list = loadPrizes();
    const available = list.find((p) => p.remaining > 0);
    return available ? available.id : list[0]?.id || null;
  });

  // Settings & Toggles
  const [excludeWon, setExcludeWon] = useState(true);

  // Modals
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [lastWinnerItem, setLastWinnerItem] = useState<WheelItem | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Mobile active panel toggle
  const [mobileTab, setMobileTab] = useState<'wheel' | 'participants' | 'prizes'>('wheel');

  // Sync sounds
  useEffect(() => {
    soundManager.enabled = soundEnabled;
    saveSoundSetting(soundEnabled);
  }, [soundEnabled]);

  // Sync to localStorage
  useEffect(() => {
    saveParticipants(participants);
  }, [participants]);

  useEffect(() => {
    savePrizes(prizes);
  }, [prizes]);

  useEffect(() => {
    saveRecords(records);
  }, [records]);

  useEffect(() => {
    saveDrawMode(drawMode);
  }, [drawMode]);

  // Current active prize object
  const currentPrize = useMemo(() => {
    return prizes.find((p) => p.id === selectedPrizeId) || null;
  }, [prizes, selectedPrizeId]);

  // If active prize has 0 remaining, auto-switch to next available prize if possible
  useEffect(() => {
    if (currentPrize && currentPrize.remaining <= 0) {
      const nextAvailable = prizes.find((p) => p.remaining > 0);
      if (nextAvailable) {
        setSelectedPrizeId(nextAvailable.id);
      }
    }
  }, [prizes, currentPrize]);

  // Compute Wheel Items based on current DrawMode
  const wheelItems: WheelItem[] = useMemo(() => {
    if (drawMode === 'participants') {
      const pool = excludeWon ? participants.filter((p) => !p.isWon) : participants;
      return pool.map((p) => ({
        id: p.id,
        label: p.code,
        subLabel: p.name && p.name !== p.code ? p.name : undefined,
      }));
    } else {
      // Draw mode is 'prizes': slices are available prizes
      const activePrizes = prizes.filter((p) => p.remaining > 0);
      if (activePrizes.length === 0) return [];
      return activePrizes.map((p) => ({
        id: p.id,
        label: p.name,
        subLabel: `剩餘 ${p.remaining} 份`,
        color: p.color,
      }));
    }
  }, [drawMode, participants, prizes, excludeWon]);

  // Handle Wheel Finished
  const handleWheelFinish = (winner: WheelItem) => {
    setLastWinnerItem(winner);

    const now = new Date().toLocaleTimeString('zh-TW', { hour12: false });

    if (drawMode === 'participants') {
      const prizeName = currentPrize ? currentPrize.name : '未指定獎項';
      const pRecord: DrawRecord = {
        id: `rec-${Date.now()}`,
        timestamp: now,
        participantId: winner.id,
        participantCode: winner.label,
        participantName: winner.subLabel,
        prizeId: currentPrize?.id,
        prizeName,
      };

      // Add to records
      setRecords((prev) => [pRecord, ...prev]);

      // Decrement prize remaining
      if (currentPrize) {
        setPrizes((prev) =>
          prev.map((p) =>
            p.id === currentPrize.id ? { ...p, remaining: Math.max(0, p.remaining - 1) } : p
          )
        );
      }

      setWinnerModalOpen(true);
    } else {
      // Mode 'prizes'
      const prize = prizes.find((p) => p.id === winner.id);
      const prizeName = prize ? prize.name : winner.label;

      const pRecord: DrawRecord = {
        id: `rec-${Date.now()}`,
        timestamp: now,
        participantCode: '現場抽中',
        participantName: '幸運兒',
        prizeId: winner.id,
        prizeName,
      };

      setRecords((prev) => [pRecord, ...prev]);

      // Decrement prize remaining
      if (prize) {
        setPrizes((prev) =>
          prev.map((p) => (p.id === prize.id ? { ...p, remaining: Math.max(0, p.remaining - 1) } : p))
        );
      }

      setWinnerModalOpen(true);
    }
  };

  // Participant Winner Modal: Mark participant as won (exclude)
  const handleConfirmRemoveWinner = () => {
    if (!lastWinnerItem) return;
    setParticipants((prev) =>
      prev.map((p) => (p.id === lastWinnerItem.id ? { ...p, isWon: true } : p))
    );
  };

  // Rollback a draw record (restore prize count and unwon state)
  const handleRollbackRecord = (record: DrawRecord) => {
    // Restore participant if found
    if (record.participantId) {
      setParticipants((prev) =>
        prev.map((p) => (p.id === record.participantId ? { ...p, isWon: false } : p))
      );
    } else {
      setParticipants((prev) =>
        prev.map((p) => (p.code === record.participantCode ? { ...p, isWon: false } : p))
      );
    }

    // Restore prize remaining count
    if (record.prizeId) {
      setPrizes((prev) =>
        prev.map((p) => (p.id === record.prizeId ? { ...p, remaining: p.remaining + 1 } : p))
      );
    }

    // Delete record
    setRecords((prev) => prev.filter((r) => r.id !== record.id));
  };

  // Reset to initial sample data
  const handleResetAll = () => {
    setParticipants(DEFAULT_PARTICIPANTS);
    setPrizes(DEFAULT_PRIZES);
    setRecords([]);
    setSelectedPrizeId('prize-1');
  };

  // Wheel is disabled if no items or if in participant mode and no remaining prize
  const isWheelDisabled =
    wheelItems.length < 2 ||
    (drawMode === 'participants' && currentPrize !== null && currentPrize.remaining <= 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <Navbar
        mode={drawMode}
        onChangeMode={(m) => {
          setDrawMode(m);
          setMobileTab('wheel');
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        recordCount={records.length}
        onOpenHistory={() => setHistoryModalOpen(true)}
        onResetAll={handleResetAll}
      />

      {/* Mobile Tab Selector */}
      <div className="lg:hidden flex border-b border-slate-800 bg-slate-900/90 px-4 py-2 text-xs font-semibold">
        <button
          onClick={() => setMobileTab('wheel')}
          className={`flex-1 py-1.5 rounded-lg transition ${
            mobileTab === 'wheel' ? 'bg-rose-600 text-white' : 'text-slate-400'
          }`}
        >
          🎡 抽獎輪盤
        </button>
        <button
          onClick={() => setMobileTab('participants')}
          className={`flex-1 py-1.5 rounded-lg transition ${
            mobileTab === 'participants' ? 'bg-rose-600 text-white' : 'text-slate-400'
          }`}
        >
          👥 名單 ({participants.filter((p) => !p.isWon).length})
        </button>
        <button
          onClick={() => setMobileTab('prizes')}
          className={`flex-1 py-1.5 rounded-lg transition ${
            mobileTab === 'prizes' ? 'bg-rose-600 text-white' : 'text-slate-400'
          }`}
        >
          🎁 獎項 ({prizes.reduce((a, b) => a + b.remaining, 0)})
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Participants Manager */}
        <div
          className={`lg:col-span-3 h-[520px] lg:h-[620px] ${
            mobileTab === 'participants' ? 'block' : 'hidden lg:block'
          }`}
        >
          <ParticipantManager
            participants={participants}
            onUpdateParticipants={setParticipants}
          />
        </div>

        {/* Center Column: The Lucky Wheel Stage */}
        <div
          className={`lg:col-span-6 flex flex-col items-center justify-center ${
            mobileTab === 'wheel' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Current Target Banner */}
          {drawMode === 'participants' ? (
            <div className="w-full max-w-md bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/30 rounded-2xl p-3.5 mb-2 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-rose-300 font-semibold uppercase tracking-wider">
                    當前抽獎獎項
                  </div>
                  <div className="text-base font-extrabold text-white truncate">
                    {currentPrize ? currentPrize.name : '未選擇獎項'}
                  </div>
                </div>
              </div>

              {currentPrize && (
                <div className="text-right flex-shrink-0">
                  <div className="text-[11px] text-slate-400">剩餘名額</div>
                  <div
                    className={`font-mono font-black text-lg ${
                      currentPrize.remaining > 0 ? 'text-amber-400' : 'text-rose-400'
                    }`}
                  >
                    {currentPrize.remaining} / {currentPrize.count}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full max-w-md bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-3.5 mb-2 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider">
                    目前模式：抽獎項輪盤
                  </div>
                  <div className="text-sm font-bold text-white">
                    轉動輪盤抽出本次幸運獎品
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wheel Options bar */}
          {drawMode === 'participants' && (
            <div className="flex items-center gap-3 text-xs text-slate-400 mb-1">
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={excludeWon}
                  onChange={(e) => setExcludeWon(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-rose-600 focus:ring-0"
                />
                <span>僅抽未中獎者 (已中獎自動移出輪盤)</span>
              </label>
            </div>
          )}

          {/* The Wheel */}
          <Wheel
            items={wheelItems}
            onFinish={handleWheelFinish}
            disabled={isWheelDisabled}
            buttonText={drawMode === 'participants' ? '抽中獎人' : '抽大獎'}
          />
        </div>

        {/* Right Column: Prizes Manager */}
        <div
          className={`lg:col-span-3 h-[520px] lg:h-[620px] ${
            mobileTab === 'prizes' ? 'block' : 'hidden lg:block'
          }`}
        >
          <PrizeManager
            prizes={prizes}
            selectedPrizeId={selectedPrizeId}
            onSelectPrize={setSelectedPrizeId}
            onUpdatePrizes={setPrizes}
          />
        </div>
      </main>

      {/* Winner Celebration Modal */}
      <WinnerModal
        isOpen={winnerModalOpen}
        winnerItem={lastWinnerItem}
        currentPrize={currentPrize}
        mode={drawMode}
        onClose={() => setWinnerModalOpen(false)}
        onConfirmRemoveWinner={handleConfirmRemoveWinner}
        onKeepWinner={() => {}}
      />

      {/* History Records Modal */}
      <HistoryModal
        isOpen={historyModalOpen}
        records={records}
        onClose={() => setHistoryModalOpen(false)}
        onClearRecords={() => setRecords([])}
        onDeleteRecord={(id) => setRecords((prev) => prev.filter((r) => r.id !== id))}
        onRollbackRecord={handleRollbackRecord}
      />
    </div>
  );
};
