import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  // --- Dynamic / Floating Joystick State ---
  const [active, setActive] = useState(false);
  const [basePos, setBasePos] = useState({ x: 0, y: 0 });
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  const maxRadius = 50;

  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // ignore if not supported or disabled
      }
    }
  };

  const updateKnob = useCallback((clientX: number, clientY: number, baseX: number, baseY: number) => {
    const dx = clientX - baseX;
    const dy = clientY - baseY;
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
  }, [onMove]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;

    const startX = touch.clientX;
    const startY = touch.clientY;

    setBasePos({ x: startX, y: startY });
    setKnobPos({ x: 0, y: 0 });
    setActive(true);
    triggerHaptic(12);

    updateKnob(startX, startY, startX, startY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateKnob(touch.clientX, touch.clientY, basePos.x, basePos.y);
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

  useEffect(() => {
    return () => {
      onMove({ x: 0, y: 0 });
    };
  }, [onMove]);

  return (
    <>
      {/* =========================================================================
          1. DYNAMIC / FLOATING JOYSTICK CAPTURE ZONE (Full Left Screen Half)
          Touching anywhere on the left side instantly summons the joystick base!
          ========================================================================= */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="md:hidden fixed inset-y-0 left-0 w-1/2 z-40 touch-none select-none"
        style={{ touchAction: 'none' }}
      >
        {/* Active Floating Joystick (Rendered at Touch Coordinates) */}
        {active ? (
          <div
            className="pointer-events-none fixed -translate-x-1/2 -translate-y-1/2"
            style={{ left: basePos.x, top: basePos.y }}
          >
            {/* Outer Sci-Fi MOBA Ring */}
            <div className="relative w-28 h-28 rounded-full border-[2.5px] border-cyan-400/80 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center shadow-[0_0_24px_rgba(6,182,212,0.45)]">
              {/* Tactical Crosshair Guidelines */}
              <div className="absolute w-full h-[1px] bg-cyan-500/35" />
              <div className="absolute h-full w-[1px] bg-cyan-500/35" />
              
              {/* Inner Concentric Rune Ring */}
              <div className="w-18 h-18 rounded-full border border-cyan-300/40 border-dashed animate-spin-slow" />

              {/* 4 Directional Cardinal Notch Pointers */}
              <div className="absolute top-1 w-1.5 h-1.5 bg-amber-400 rotate-45" />
              <div className="absolute bottom-1 w-1.5 h-1.5 bg-amber-400 rotate-45" />
              <div className="absolute left-1 w-1.5 h-1.5 bg-amber-400 rotate-45" />
              <div className="absolute right-1 w-1.5 h-1.5 bg-amber-400 rotate-45" />

              {/* Floating Thumb Knob (Moves with thumb offset) */}
              <div
                className="absolute w-14 h-14 rounded-full border-2 border-amber-300 bg-gradient-to-tr from-blue-900 via-blue-600 to-cyan-400 shadow-[0_0_18px_rgba(56,189,248,0.85)] flex items-center justify-center transition-transform duration-75"
                style={{
                  transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
                }}
              >
                {/* Imperial Aquila Center Emblem */}
                <div className="w-5 h-5 rounded-full bg-amber-300/90 shadow-[0_0_8px_#fde047] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-slate-950" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Subtle Idle Guide Placeholder (Fades out when actively touched) */
          <div className="pointer-events-none fixed bottom-10 left-8 flex flex-col items-center gap-1.5 opacity-60">
            <div className="w-22 h-22 rounded-full border border-dashed border-slate-600/80 bg-slate-900/30 flex items-center justify-center animate-pulse">
              <div className="w-8 h-8 rounded-full border border-slate-500/60 bg-slate-800/40" />
            </div>
            <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
              Sentuh & Tarik
            </span>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. MOBA-STYLE ERGONOMIC ACTION CLUSTER (Arc Layout for Right Thumb)
          Arranged along natural thumb sweep arc: Dash (Primary) + Ulti + Fury
          ========================================================================= */}
      <div 
        className="md:hidden fixed z-40 select-none pointer-events-auto"
        style={{
          right: 'max(1.1rem, env(safe-area-inset-right))',
          bottom: 'max(1.1rem, env(safe-area-inset-bottom))'
        }}
      >
        <div className="relative w-48 h-48 flex items-end justify-end">
          
          {/* --- SKILL 2: FURY / OVERDRIVE [F] (Top of Arc) --- */}
          {onTriggerOverdrive && (
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                triggerHaptic([20, 20]);
                onTriggerOverdrive();
              }}
              onClick={onTriggerOverdrive}
              disabled={furyPct < 1 && overdrivePct <= 0}
              className={`absolute top-0 right-4 w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center font-gothic font-black shadow-2xl active:scale-90 transition-transform touch-none cursor-pointer ${
                overdrivePct > 0
                  ? 'bg-gradient-to-tr from-yellow-500 via-amber-400 to-cyan-300 border-white text-slate-950 shadow-[0_0_24px_rgba(250,204,21,0.95)] animate-pulse'
                  : furyPct >= 1
                  ? 'bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 border-yellow-200 text-slate-950 shadow-[0_0_20px_rgba(239,68,68,0.85)] animate-bounce'
                  : 'bg-slate-950/85 border-slate-700/80 text-slate-500 backdrop-blur-xs'
              }`}
            >
              {/* Outer Circular Progress Ring for Fury Meter */}
              <div className="relative flex items-center justify-center">
                <Bolt className={`w-4 h-4 ${overdrivePct > 0 ? 'text-slate-950 animate-spin-slow' : furyPct >= 1 ? 'text-slate-950' : 'text-amber-500/80'}`} />
              </div>
              <span className="text-[8px] tracking-wider leading-none mt-0.5">FURY</span>
              <span className="text-[7px] font-mono font-bold leading-none mt-0.5">
                {overdrivePct > 0 ? 'AKTIF!' : furyPct >= 1 ? 'MAX!' : `${Math.floor(furyPct * 100)}%`}
              </span>
            </button>
          )}

          {/* --- SKILL 1: ULTIMATE [Q] (Flank of Arc, Top-Left of Dash) --- */}
          {onTriggerUltimate && (
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                triggerHaptic([30, 20, 40]);
                onTriggerUltimate();
              }}
              onClick={onTriggerUltimate}
              disabled={ultimateCooldownPct > 0}
              className={`absolute top-8 left-2 w-16 h-16 rounded-full border-[2.5px] flex flex-col items-center justify-center font-gothic font-black shadow-2xl active:scale-90 transition-transform touch-none cursor-pointer ${
                ultimateCooldownPct > 0
                  ? 'bg-slate-950/85 border-slate-700/80 text-slate-500 backdrop-blur-xs'
                  : 'bg-gradient-to-tr from-amber-700 via-orange-500 to-yellow-300 border-amber-200 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.85)] animate-pulse'
              }`}
            >
              <Flame className={`w-5 h-5 ${ultimateCooldownPct > 0 ? 'text-slate-600' : 'text-slate-950'}`} />
              <span className="text-[9px] tracking-wider leading-none mt-0.5">ULTI</span>
              {ultimateCooldownPct > 0 ? (
                <span className="text-[8px] font-mono font-bold text-slate-400 leading-none mt-0.5">
                  {Math.ceil(ultimateCooldownPct * 32)}s
                </span>
              ) : (
                <span className="text-[7px] font-mono font-black text-slate-950 leading-none mt-0.5 animate-pulse">
                  SEDIA!
                </span>
              )}
            </button>
          )}

          {/* --- PRIMARY BUTTON: DASH [SPACE] (Main Thumb Anchor) --- */}
          {onDash && (
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                triggerHaptic(18);
                onDash();
              }}
              onClick={onDash}
              disabled={dashCooldownPct > 0}
              className={`absolute bottom-0 right-0 w-20 h-20 rounded-full border-[3px] flex flex-col items-center justify-center font-gothic font-black shadow-2xl active:scale-90 transition-transform touch-none cursor-pointer ${
                dashCooldownPct > 0
                  ? 'bg-slate-950/85 border-slate-700/80 text-slate-500 backdrop-blur-xs'
                  : 'bg-gradient-to-tr from-blue-700 via-cyan-500 to-sky-300 border-cyan-200 text-white shadow-[0_0_28px_rgba(6,182,212,0.75)]'
              }`}
            >
              {/* Outer Metallic Bezel Ring Accent */}
              <div className="absolute inset-1 rounded-full border border-white/30 pointer-events-none" />

              <Zap className={`w-6 h-6 mb-0.5 ${dashCooldownPct > 0 ? 'text-slate-600' : 'text-white drop-shadow'}`} />
              <span className="text-[11px] tracking-widest leading-none">DASH</span>
              {dashCooldownPct > 0 ? (
                <span className="text-[9px] font-mono font-bold text-slate-400 leading-none mt-0.5">
                  {Math.ceil(dashCooldownPct * 3.2)}s
                </span>
              ) : (
                <span className="text-[8px] font-mono font-black text-cyan-100 leading-none mt-0.5">
                  SEDIA
                </span>
              )}
            </button>
          )}

        </div>
      </div>
    </>
  );
};
