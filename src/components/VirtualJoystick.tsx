import React, { useRef, useState, useEffect } from 'react';
import { Flame, Zap, Bolt } from 'lucide-react';

interface VirtualJoystickProps {
  onMove: (dir: { x: number; y: number }) => void;
  onDash?: () => void;
  dashCooldownPct?: number;
  onTriggerUltimate?: () => void;
  ultimateCooldownPct?: number;
  onTriggerOverdrive?: () => void;
  furyPct?: number;
  overdrivePct?: number;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onMove,
  onDash,
  dashCooldownPct = 0,
  onTriggerUltimate,
  ultimateCooldownPct = 0,
  onTriggerOverdrive,
  furyPct = 0,
  overdrivePct = 0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);
  const centerRef = useRef({ x: 0, y: 0 });

  const maxRadius = 46;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }

    setActive(true);
    updateKnob(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateKnob(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setActive(false);
        setKnobPos({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
        break;
      }
    }
  };

  const updateKnob = (clientX: number, clientY: number) => {
    const dx = clientX - centerRef.current.x;
    const dy = clientY - centerRef.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) {
      setKnobPos({ x: 0, y: 0 });
      onMove({ x: 0, y: 0 });
      return;
    }

    const clampedDist = Math.min(dist, maxRadius);
    const normX = dx / dist;
    const normY = dy / dist;

    setKnobPos({
      x: normX * clampedDist,
      y: normY * clampedDist
    });

    onMove({
      x: normX * (clampedDist / maxRadius),
      y: normY * (clampedDist / maxRadius)
    });
  };

  useEffect(() => {
    return () => {
      onMove({ x: 0, y: 0 });
    };
  }, [onMove]);

  return (
    <>
      {/* Left Thumb Virtual Joystick (Mobile / Tablet Touch) */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="md:hidden fixed bottom-6 left-5 z-40 w-32 h-32 rounded-full bg-slate-900/65 border-2 border-slate-700/80 backdrop-blur-xs flex items-center justify-center touch-none select-none active:border-amber-500/80 transition-colors shadow-xl"
        style={{ touchAction: 'none' }}
      >
        {/* Inner guide crosshairs */}
        <div className="absolute w-full h-px bg-slate-700/40 pointer-events-none" />
        <div className="absolute h-full w-px bg-slate-700/40 pointer-events-none" />

        {/* Outer subtle ring */}
        <div className="w-20 h-20 rounded-full border border-slate-600/50 pointer-events-none" />

        {/* Floating thumb knob */}
        <div
          className={`w-14 h-14 rounded-full border-2 transition-transform duration-75 pointer-events-none flex items-center justify-center ${
            active
              ? 'bg-blue-600/90 border-amber-400 shadow-[0_0_14px_rgba(234,179,8,0.65)]'
              : 'bg-slate-800/85 border-slate-500'
          }`}
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
          }}
        >
          <div className="w-4 h-4 rounded-full bg-amber-400/90" />
        </div>
      </div>

      {/* Right-Thumb Action Cluster (Overdrive [F], Ultimate [Q] & Dash [SPACE]) for Mobile */}
      <div className="md:hidden fixed bottom-6 right-5 z-40 flex items-end gap-2.5 select-none">
        {onTriggerOverdrive && (
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onTriggerOverdrive();
            }}
            onClick={onTriggerOverdrive}
            disabled={furyPct < 1 && overdrivePct <= 0}
            className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center font-gothic font-bold text-[9px] shadow-xl active:scale-95 transition-all touch-none cursor-pointer ${
              overdrivePct > 0
                ? 'bg-gradient-to-tr from-yellow-500 to-cyan-400 border-white text-slate-950 shadow-[0_0_20px_rgba(250,204,21,0.85)] animate-pulse'
                : furyPct >= 1
                ? 'bg-gradient-to-tr from-orange-600 to-amber-400 border-yellow-200 text-slate-950 shadow-[0_0_18px_rgba(251,146,60,0.8)] animate-bounce'
                : 'bg-slate-900/85 border-slate-700 text-slate-400'
            }`}
          >
            <Bolt className="w-3.5 h-3.5 mb-0.5" />
            <span>FURY</span>
            <span className="text-[8px] font-mono font-black">
              {overdrivePct > 0 ? 'AKTIF!' : furyPct >= 1 ? 'SEDIA!' : `${Math.floor(furyPct * 100)}%`}
            </span>
          </button>
        )}

        {onTriggerUltimate && (
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onTriggerUltimate();
            }}
            onClick={onTriggerUltimate}
            disabled={ultimateCooldownPct > 0}
            className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center font-gothic font-bold text-[10px] shadow-xl active:scale-95 transition-all touch-none cursor-pointer ${
              ultimateCooldownPct > 0
                ? 'bg-slate-900/85 border-slate-700 text-slate-500'
                : 'bg-gradient-to-tr from-amber-600 to-yellow-400 border-yellow-200 text-slate-950 shadow-[0_0_18px_rgba(245,158,11,0.65)] animate-pulse'
            }`}
          >
            <Flame className="w-4 h-4 mb-0.5" />
            <span>ULTI</span>
            {ultimateCooldownPct > 0 ? (
              <span className="text-[9px] font-mono">{Math.ceil(ultimateCooldownPct * 32)}s</span>
            ) : (
              <span className="text-[8px] font-mono font-black">SEDIA!</span>
            )}
          </button>
        )}

        {onDash && (
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onDash();
            }}
            onClick={onDash}
            disabled={dashCooldownPct > 0}
            className={`w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center font-gothic font-bold text-xs shadow-xl active:scale-95 transition-all touch-none cursor-pointer ${
              dashCooldownPct > 0
                ? 'bg-slate-900/85 border-slate-700 text-slate-500'
                : 'bg-gradient-to-tr from-blue-700 to-cyan-500 border-cyan-300 text-white shadow-[0_0_18px_rgba(56,189,248,0.55)]'
            }`}
          >
            <Zap className="w-4 h-4 mb-0.5" />
            <span>DASH</span>
            {dashCooldownPct > 0 ? (
              <span className="text-[10px] font-mono text-slate-400">{Math.ceil(dashCooldownPct * 3.2)}s</span>
            ) : (
              <span className="text-[9px] font-mono text-cyan-200 font-bold">SEDIA</span>
            )}
          </button>
        )}
      </div>
    </>
  );
};
