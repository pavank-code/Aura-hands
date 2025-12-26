
import React from 'react';
import { Settings, RefreshCcw, Box, Circle, Heart, Disc, Dna } from 'lucide-react';
import { ParticleConfig, GestureState, VisualShape } from '../types';
import { MIN_PARTICLES, MAX_PARTICLES } from '../constants';

interface SidebarProps {
  config: ParticleConfig;
  setConfig: (config: Partial<ParticleConfig>) => void;
  gestureState: GestureState;
  onReset: () => void;
  trackingActive: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, gestureState, onReset, trackingActive }) => {
  const shapes: { id: VisualShape; icon: any }[] = [
    { id: 'sphere', icon: Circle },
    { id: 'cube', icon: Box },
    { id: 'torus', icon: Disc },
    { id: 'heart', icon: Heart },
    { id: 'dna', icon: Dna },
  ];

  return (
    <div className="fixed left-6 top-6 bottom-6 w-80 glass rounded-[2.5rem] p-8 flex flex-col gap-10 z-50 pointer-events-auto overflow-y-auto border-white/5">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
          <Settings className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">AuraHands</h1>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Neural Particle Engine</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Shape Selector */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Geometric Matrix</h3>
          <div className="grid grid-cols-5 gap-2">
            {shapes.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setConfig({ shape: id })}
                className={`p-3 rounded-2xl flex items-center justify-center transition-all ${
                  config.shape === id ? 'bg-white text-black scale-110 shadow-xl shadow-white/10' : 'bg-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        </section>

        {/* Tracking Status */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Real-time Feed</h3>
          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-3xl border border-white/5">
            <div className={`w-2 h-2 rounded-full ${trackingActive ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse'}`} />
            <span className="text-xs font-bold uppercase tracking-wider">{trackingActive ? 'Neural Lock Acquired' : 'Seeking Signal...'}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 p-4 rounded-3xl text-center border border-white/5">
              <span className="block text-[10px] text-white/30 uppercase font-black mb-1">Density</span>
              <span className="text-xl font-mono">{(config.count / 1000).toFixed(0)}k</span>
            </div>
            <div className="bg-white/5 p-4 rounded-3xl text-center border border-white/5">
              <span className="block text-[10px] text-white/30 uppercase font-black mb-1">Scale</span>
              <span className="text-xl font-mono">{gestureState.expansion.toFixed(1)}</span>
            </div>
          </div>
        </section>

        {/* Color Controls */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Visual Params</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-bold uppercase opacity-40">
              <span>Hue Spectrum</span>
              <span>{config.hue}°</span>
            </div>
            <input 
              type="range" min="0" max="360" value={config.hue}
              onChange={(e) => setConfig({ hue: parseInt(e.target.value) })}
              className="w-full accent-white h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-bold uppercase opacity-40">
              <span>Particle Saturation</span>
              <span>{config.saturation}%</span>
            </div>
            <input 
              type="range" min="0" max="100" value={config.saturation}
              onChange={(e) => setConfig({ saturation: parseInt(e.target.value) })}
              className="w-full accent-white h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
            />
          </div>
        </section>

        {/* Density */}
        <section className="space-y-3">
          <div className="flex justify-between text-[10px] font-bold uppercase opacity-40">
            <span>Particle Count</span>
            <span>{config.count.toLocaleString()}</span>
          </div>
          <input 
            type="range" min={MIN_PARTICLES} max={MAX_PARTICLES} step="5000" value={config.count}
            onChange={(e) => setConfig({ count: parseInt(e.target.value) })}
            className="w-full accent-white h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
          />
        </section>

        <button 
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-white text-black hover:bg-white/90 transition-all rounded-2xl text-xs font-black uppercase tracking-[0.1em]"
        >
          <RefreshCcw className="w-4 h-4" />
          Reset Neural Core
        </button>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="space-y-3 text-[9px] font-bold uppercase tracking-widest text-white/30 leading-loose">
          <p>• <span className="text-white/60">Zoom:</span> Distance between hands</p>
          <p>• <span className="text-white/60">Rotate:</span> Position of right hand</p>
          <p>• <span className="text-white/60">Sculpt:</span> Clench fist to shrink</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
