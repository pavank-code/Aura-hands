
import React, { useState } from 'react';
import { Settings, RefreshCcw, Box, Circle, Heart, Disc, Dna, Activity, Zap, Info, Menu, X as CloseIcon, ChevronUp, ChevronDown } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);
  
  const shapes: { id: VisualShape; icon: any }[] = [
    { id: 'sphere', icon: Circle },
    { id: 'cube', icon: Box },
    { id: 'torus', icon: Disc },
    { id: 'heart', icon: Heart },
    { id: 'dna', icon: Dna },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 left-6 z-[60] w-14 h-14 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.4)] pointer-events-auto"
      >
        {isOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar / Drawer Container */}
      <div className={`
        fixed left-0 top-0 bottom-0 z-50 flex flex-col transition-all duration-500 ease-in-out border-r border-white/10 shadow-2xl pointer-events-auto
        ${isOpen ? 'translate-x-0 w-full md:w-[340px]' : '-translate-x-full lg:translate-x-0 w-full md:w-[340px]'}
        bg-[#020202]/95 backdrop-blur-2xl lg:bg-white/[0.01]
      `}>
        {/* Brand Header */}
        <div className="p-6 lg:p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold tracking-tighter uppercase italic">Nuero<span className="text-[#CCFF00]">Hands</span></h1>
            <div className="flex items-center gap-2 px-2 py-1 bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded">
              <Activity className="w-3 h-3 text-[#CCFF00]" />
              <span className="text-[9px] mono font-bold text-[#CCFF00]">v2.4.0</span>
            </div>
          </div>
          <p className="text-[10px] mono text-white/40 uppercase tracking-widest leading-tight">Kinetic Synthesis Environment</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 lg:space-y-10 custom-scrollbar">
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
                {trackingActive ? 'LOCKED' : 'NO_SIGNAL'}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/[0.03] p-4 border border-white/5">
                <span className="block text-[9px] mono text-white/30 uppercase mb-1">Density</span>
                <span className="text-xl font-bold mono">{(config.count / 1000).toFixed(1)}<span className="text-[#CCFF00]">K</span></span>
              </div>
              <div className="bg-white/[0.03] p-4 border border-white/5">
                <span className="block text-[9px] mono text-white/30 uppercase mb-1">Expansion</span>
                <span className="text-xl font-bold mono">x{gestureState.expansion.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* Module: Chromatic Controls */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/60">Visual Parameters</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between mono text-[10px]">
                  <span className="text-white/40 uppercase tracking-widest">Hue Shift</span>
                  <span className="text-[#CCFF00]">{config.hue}°</span>
                </div>
                <input 
                  type="range" min="0" max="360" value={config.hue}
                  onChange={(e) => setConfig({ hue: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/10 rounded-none appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between mono text-[10px]">
                  <span className="text-white/40 uppercase tracking-widest">Core Density</span>
                  <span className="text-[#CCFF00]">{config.count.toLocaleString()}</span>
                </div>
                <input 
                  type="range" min={MIN_PARTICLES} max={MAX_PARTICLES} step="5000" value={config.count}
                  onChange={(e) => setConfig({ count: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/10 rounded-none appearance-none cursor-pointer"
                />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-2 pt-4">
            <button 
              onClick={onReset}
              className="flex items-center justify-center gap-3 py-4 bg-transparent border border-white/10 text-white/40 hover:text-white hover:border-white/40 transition-all text-[10px] mono font-bold uppercase tracking-widest group"
            >
              <RefreshCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
              Reset
            </button>
            <button 
              onClick={onReplayBriefing}
              className="flex items-center justify-center gap-3 py-4 bg-transparent border border-white/10 text-white/40 hover:text-[#CCFF00] hover:border-[#CCFF00]/40 transition-all text-[10px] mono font-bold uppercase tracking-widest"
            >
              <Info className="w-3 h-3" />
              Re-Sync
            </button>
          </div>
        </div>

        {/* Footer Instructions - Hidden on small mobile screens to save space if panel is open */}
        <div className="p-8 border-t border-white/5 bg-white/[0.01]">
          <div className="grid grid-cols-1 gap-3 mono text-[9px] uppercase tracking-wider text-white/40">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>Zoom</span>
              <span className="text-white/60">Hand Dist</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>Rotate</span>
              <span className="text-white/60">Right Hand</span>
            </div>
            <div className="flex justify-between">
              <span>Clench</span>
              <span className="text-white/60">Compress</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" 
        />
      )}
    </>
  );
};

export default Sidebar;
