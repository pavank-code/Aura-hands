
import React, { useMemo } from 'react';
import { GestureState, ParticleConfig } from '../types';

interface CursorProps {
  gestureState: GestureState;
  config: ParticleConfig;
}

const Cursor: React.FC<CursorProps> = ({ gestureState, config }) => {
  const { hands, center, expansion } = gestureState;
  const isTracking = hands.length > 0;

  // Calculate screen coordinates. 
  // center.x and center.y are typically 0-1 from MediaPipe.
  // We mirror X because the camera feed is mirrored for the user.
  const style = useMemo(() => {
    if (!isTracking) return { opacity: 0 };
    
    return {
      left: `${(1 - center.x) * 100}%`,
      top: `${center.y * 100}%`,
      opacity: 1,
      transform: `translate(-50%, -50%) scale(${0.5 + expansion * 0.1})`,
      borderColor: `hsla(${config.hue}, ${config.saturation}%, ${config.lightness}%, 0.8)`,
      boxShadow: `0 0 30px hsla(${config.hue}, ${config.saturation}%, ${config.lightness}%, 0.4)`,
    };
  }, [center, expansion, isTracking, config.hue, config.saturation, config.lightness]);

  return (
    <div 
      className="fixed pointer-events-none z-[60] transition-opacity duration-300 ease-out"
      style={style}
    >
      {/* Primary Ring */}
      <div className="relative w-20 h-20 border-2 rounded-full flex items-center justify-center">
        {/* Pulsating Inner Circle */}
        <div 
          className="w-4 h-4 rounded-full animate-pulse"
          style={{ backgroundColor: `hsl(${config.hue}, ${config.saturation}%, ${config.lightness}%)` }}
        />
        
        {/* Orbiting Elements */}
        {hands.map((_, i) => (
          <div 
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{ 
              backgroundColor: `hsl(${config.hue}, ${config.saturation}%, ${config.lightness}%)`,
              transform: `rotate(${i * 180 + (Date.now() / 10)}deg) translateY(-40px)`
            }}
          />
        ))}

        {/* Dynamic HUD Lines */}
        <div className="absolute inset-[-10px] border border-white/10 rounded-full border-t-transparent border-b-transparent animate-[spin_4s_linear_infinite]" />
        <div className="absolute inset-[-20px] border border-white/5 rounded-full border-l-transparent border-r-transparent animate-[spin_8s_linear_reverse_infinite]" />
      </div>

      {/* Label/Readout */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 mono text-[8px] uppercase tracking-[0.2em] text-white/40 whitespace-nowrap text-center">
        <div className="bg-black/60 px-2 py-0.5 border border-white/5 backdrop-blur-md">
          Pos: {center.x.toFixed(2)}, {center.y.toFixed(2)}
          <br />
          Exp: {expansion.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default Cursor;
