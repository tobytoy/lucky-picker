import React, { useRef, useEffect, useState, useCallback } from 'react';
import { soundManager } from '../utils/audio';

export interface WheelItem {
  id: string;
  label: string;
  subLabel?: string;
  color?: string;
}

interface WheelProps {
  items: WheelItem[];
  onFinish: (selectedItem: WheelItem) => void;
  disabled?: boolean;
  buttonText?: string;
}

const PALETTE = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
];

export const Wheel: React.FC<WheelProps> = ({
  items,
  onFinish,
  disabled = false,
  buttonText = '開始抽獎',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const currentAngleRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickSliceRef = useRef<number>(-1);
  const [pointerBounce, setPointerBounce] = useState(false);

  // Fallback if no items
  const displayItems = items.length > 0 ? items : [
    { id: 'empty-1', label: '請先新增名單', color: '#64748b' },
    { id: 'empty-2', label: '或獎項資料', color: '#475569' },
  ];

  const numSlices = displayItems.length;
  const sliceAngle = (2 * Math.PI) / numSlices;

  // Pointer position is at 12 o'clock (top): angle is -Math.PI / 2
  const POINTER_ANGLE = -Math.PI / 2;

  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 16;

    ctx.clearRect(0, 0, width, height);

    // Outer decorative glow & ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.shadowColor = 'rgba(244, 63, 94, 0.4)';
    ctx.shadowBlur = 24;
    ctx.fill();

    // Golden metallic border
    const borderGradient = ctx.createLinearGradient(0, 0, width, height);
    borderGradient.addColorStop(0, '#fef08a');
    borderGradient.addColorStop(0.5, '#ca8a04');
    borderGradient.addColorStop(1, '#eab308');
    ctx.lineWidth = 10;
    ctx.strokeStyle = borderGradient;
    ctx.stroke();
    ctx.restore();

    // Outer rivets / light dots
    const rivetCount = Math.max(16, Math.min(36, numSlices * 2));
    for (let i = 0; i < rivetCount; i++) {
      const rivetAngle = (i * 2 * Math.PI) / rivetCount;
      const rx = centerX + (radius + 5) * Math.cos(rivetAngle);
      const ry = centerY + (radius + 5) * Math.sin(rivetAngle);

      ctx.beginPath();
      ctx.arc(rx, ry, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = (i % 2 === 0) ? '#fef08a' : '#ffffff';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 6;
      ctx.fill();
    }

    // Draw Slices
    for (let i = 0; i < numSlices; i++) {
      const item = displayItems[i];
      const startAngle = angle + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Color
      const sliceColor = item.color || PALETTE[i % PALETTE.length];
      ctx.fillStyle = sliceColor;
      ctx.fill();

      // Divider line
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.stroke();

      // Inner radial highlight
      const radialGradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
      radialGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      radialGradient.addColorStop(0.85, 'transparent');
      radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
      ctx.fillStyle = radialGradient;
      ctx.fill();

      // Text drawing
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';

      // Smart font sizing based on slice count
      let fontSize = 16;
      if (numSlices > 30) fontSize = 10;
      else if (numSlices > 20) fontSize = 12;
      else if (numSlices > 12) fontSize = 14;

      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Truncate label if too long
      const maxTextLength = numSlices > 24 ? 8 : 14;
      let text = item.label;
      if (text.length > maxTextLength) {
        text = text.slice(0, maxTextLength - 1) + '…';
      }

      ctx.fillText(text, radius - 20, 0);

      if (item.subLabel && numSlices <= 18) {
        ctx.font = `normal ${Math.max(10, fontSize - 3)}px sans-serif`;
        ctx.fillStyle = '#f1f5f9';
        ctx.fillText(item.subLabel, radius - 20, fontSize + 2);
      }

      ctx.restore();
      ctx.restore();
    }

    // Center Hub (Inner Core)
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 38, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 12;
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();

    // Center decorative inner gem
    const gemGrad = ctx.createRadialGradient(centerX - 4, centerY - 4, 2, centerX, centerY, 24);
    gemGrad.addColorStop(0, '#f43f5e');
    gemGrad.addColorStop(1, '#9f1239');
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    ctx.fillStyle = gemGrad;
    ctx.fill();
    ctx.restore();
  }, [displayItems, numSlices, sliceAngle]);

  // Initial draw & resize handling
  useEffect(() => {
    drawWheel(currentAngleRef.current);
  }, [drawWheel]);

  // Calculate which slice is currently under the top pointer
  const getIndexUnderPointer = useCallback((angle: number) => {
    const normalizedAngle = (POINTER_ANGLE - angle) % (2 * Math.PI);
    const positiveAngle = normalizedAngle < 0 ? normalizedAngle + 2 * Math.PI : normalizedAngle;
    return Math.floor(positiveAngle / sliceAngle) % numSlices;
  }, [sliceAngle, numSlices]);

  const spin = () => {
    if (isSpinning || disabled || displayItems.length < 2) return;

    setIsSpinning(true);
    soundManager.playSpinStart();

    // Choose target index randomly
    const targetIndex = Math.floor(Math.random() * numSlices);

    // Calculate angle that will put targetIndex exactly under the pointer (at -Math.PI / 2)
    // Pointer aligns with: (POINTER_ANGLE - finalAngle) mod 2PI == targetIndex * sliceAngle + halfSlice
    const halfSlice = sliceAngle / 2;
    // Add small jitter within the slice so it doesn't always land at the exact micro-center
    const jitter = (Math.random() - 0.5) * (sliceAngle * 0.7);
    const targetSliceCenter = targetIndex * sliceAngle + halfSlice + jitter;

    // Minimum rotations for dramatic tension (5 to 8 full revolutions)
    const extraRotations = 6 + Math.floor(Math.random() * 3);
    const fullTurnsAngle = extraRotations * 2 * Math.PI;

    const startAngle = currentAngleRef.current;
    // Compute finalAngle such that (POINTER_ANGLE - finalAngle) mod 2PI matches targetSliceCenter
    // targetAngle = POINTER_ANGLE - targetSliceCenter + K * 2PI
    const currentBase = startAngle % (2 * Math.PI);
    const desiredNormalized = (POINTER_ANGLE - targetSliceCenter) % (2 * Math.PI);
    let delta = desiredNormalized - currentBase;
    while (delta < 0) {
      delta += 2 * Math.PI;
    }
    const finalAngle = startAngle + delta + fullTurnsAngle;
    const totalDistance = finalAngle - startAngle;

    const duration = 6000; // 6 seconds spin
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Quartic ease out: starts brisk, decelerates realistically
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const newAngle = startAngle + totalDistance * easeOut;
      currentAngleRef.current = newAngle;

      // Tick sound and pointer bounce when crossing slice boundaries
      const currentSlice = getIndexUnderPointer(newAngle);
      if (currentSlice !== lastTickSliceRef.current) {
        lastTickSliceRef.current = currentSlice;
        soundManager.playTick();
        setPointerBounce(true);
        setTimeout(() => setPointerBounce(false), 50);
      }

      drawWheel(newAngle);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const winningIndex = getIndexUnderPointer(finalAngle);
        const winner = displayItems[winningIndex];
        onFinish(winner);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-4">
      {/* Top Pointer */}
      <div className="relative z-20 flex flex-col items-center -mb-5">
        <div
          className={`w-0 h-0 border-x-[16px] border-x-transparent border-t-[34px] border-t-amber-400 drop-shadow-[0_4px_10px_rgba(245,158,11,0.8)] transition-transform duration-75 ${
            pointerBounce ? '-translate-y-1 scale-110' : 'translate-y-0 scale-100'
          }`}
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}
        />
        <div className="w-4 h-4 rounded-full bg-amber-300 -mt-9 shadow-inner border border-amber-500" />
      </div>

      {/* Canvas Container */}
      <div className="relative p-2 rounded-full bg-gradient-to-br from-slate-800/80 to-slate-900/90 shadow-2xl backdrop-blur border border-slate-700/50">
        <canvas
          ref={canvasRef}
          width={480}
          height={480}
          className="max-w-full w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] md:w-[480px] md:h-[480px] rounded-full cursor-pointer transition-transform duration-200"
          onClick={spin}
        />

        {/* Center Spin Button Overlay */}
        <button
          onClick={spin}
          disabled={isSpinning || disabled || displayItems.length < 2}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full font-bold text-sm sm:text-base flex flex-col items-center justify-center tracking-wider uppercase transition-all duration-300 shadow-xl border-4 ${
            isSpinning || disabled || displayItems.length < 2
              ? 'bg-slate-700/80 border-slate-600 text-slate-400 cursor-not-allowed scale-95'
              : 'bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 border-amber-300 text-white hover:scale-105 active:scale-95 hover:shadow-rose-500/50'
          }`}
        >
          <span className="font-extrabold text-xs sm:text-sm drop-shadow">
            {isSpinning ? '旋轉中' : buttonText}
          </span>
          {!isSpinning && (
            <span className="text-[10px] sm:text-xs text-amber-200 opacity-90">點擊轉動</span>
          )}
        </button>
      </div>

      {/* Hint info */}
      <div className="mt-4 text-xs sm:text-sm text-slate-400 font-medium flex items-center gap-2">
        <span>共有 <strong className="text-amber-400 font-bold">{displayItems.length}</strong> 個候選項目</span>
        {disabled && <span className="text-rose-400 font-medium">（已無剩餘名額或名單已抽完）</span>}
      </div>
    </div>
  );
};
