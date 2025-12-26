
import React from 'react';
import { Settings, RefreshCcw, Box, Circle, Heart, Disc, Dna, Activity, Zap, Info } from 'lucide-react';
import { ParticleConfig, GestureState, VisualShape } from '../types';
import { MIN_PARTICLES, MAX_PARTICLES } from '../constants';

interface SidebarProps {
  config: ParticleConfig;
  setConfig: (config: Partial<ParticleConfig>) => void;
  gestureState: GestureState;
  onReset: () => void;
  onReplayBriefing?: () => void;
  trackingActive: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, gestureState, onReset, onReplayBriefing, trackingActive }) => {
  const shapes: { id: VisualShape; icon: any }[] = [
    { id: 'sphere', icon: Circle },
    { id: 'cube', icon: Box },
    { id: 'torus', icon: Disc },
    { id: 'heart', icon: Heart },
    { id: 'dna', icon: Dna },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-[340px] hud-panel p-0 flex flex-col z-50 pointer-events-auto border-r border-white/10 shadow-2xl">
      {/* Brand Header */}
      <div className="p-8 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tighter uppercase italic">Aura<span className="text-[#CCFF00]">Hands</span></h1>
          <div className="flex items-center gap-2 px-2 py-1 bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded">
            <Activity className="w-3 h-3 text-[#CCFF00]" />
            <span className="text-[9px] mono font-bold text-[#CCFF00]">v2.4.0</span>
          </div>
        </div>
        <p className="text-[10px] mono text-white/40 uppercase tracking-widest leading-tight">Kinetic Synthesis Environment</p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
        {/* Module: Geometric Primitive */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
              <Box className="w-3 h-3" /> Primitive Matrix
            </h3>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {shapes.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setConfig({ shape: id })}
                className={`h-12 flex items-center justify-center transition-all border ${
                  config.shape === id 
                    ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.3)]' 
                    : 'bg-white/[0.03] text-white/40 border-white/10 hover:border-white/30'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        </section>

        {/* Module: Neural Telemetry */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
              <Zap className="w-3 h-3" /> Telemetry
            </h3>
            <div className={`text-[9px] mono px-2 py-0.5 rounded border ${trackingActive ? 'text-[#CCFF00] border-[#CCFF00]/30' : 'text-red-500 border-red-500/30'}`}>
              {trackingActive ? 'LOCKED' : 'DISCONNECTED'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/[0.03] p-4 border border-white/5">
              <span className="block text-[9px] mono text-white/30 uppercase mb-2">Particle Density</span>
              <span className="text-xl font-bold mono">{(config.count / 1000).toFixed(1)}<span className="text-[#CCFF00]">K</span></span>
            </div>
            <div className="bg-white/[0.03] p-4 border border-white/5">
              <span className="block text-[9px] mono text-white/30 uppercase mb-2">Expansion Ratio</span>
              <span className="text-xl font-bold mono">x{gestureState.expansion.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Module: Chromatic Controls */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/60">Visual Parameters</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between mono text-[10px]">
                <span className="text-white/40 uppercase">Hue Shift</span>
                <span className="text-[#CCFF00]">{config.hue}°</span>
              </div>
              <input 
                type="range" min="0" max="360" value={config.hue}
                onChange={(e) => setConfig({ hue: parseInt(e.target.value) })}
                className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between mono text-[10px]">
                <span className="text-white/40 uppercase">Density Load</span>
                <span className="text-[#CCFF00]">{config.count.toLocaleString()}</span>
              </div>
              <input 
                type="range" min={MIN_PARTICLES} max={MAX_PARTICLES} step="5000" value={config.count}
                onChange={(e) => setConfig({ count: parseInt(e.target.value) })}
                className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer"
              />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onReset}
            className="flex items-center justify-center gap-3 py-4 bg-transparent border border-white/10 text-white/40 hover:text-white hover:border-white/40 transition-all text-[10px] mono font-bold uppercase tracking-widest group"
          >
            <RefreshCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
            Purge
          </button>
          <button 
            onClick={onReplayBriefing}
            className="flex items-center justify-center gap-3 py-4 bg-transparent border border-white/10 text-white/40 hover:text-[#CCFF00] hover:border-[#CCFF00]/40 transition-all text-[10px] mono font-bold uppercase tracking-widest"
          >
            <Info className="w-3 h-3" />
            Briefing
          </button>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="p-8 border-t border-white/5 bg-white/[0.01]">
        <div className="grid grid-cols-1 gap-2 mono text-[9px] uppercase tracking-wider text-white/40">
          <div className="flex justify-between border-b border-white/5 pb-1">
            <span>Spatial Zoom</span>
            <span className="text-white/60">Distance</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-1">
            <span>Axis Rotation</span>
            <span className="text-white/60">Right Hand</span>
          </div>
          <div className="flex justify-between">
            <span>Core Compression</span>
            <span className="text-white/60">Pinch</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
