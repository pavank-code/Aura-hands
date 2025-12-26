
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircle, Zap, Instagram, Github, Camera, CornerDownRight } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Visualizer from './components/Visualizer';
import Cursor from './components/Cursor';
import Onboarding from './components/Onboarding';
import { handDetectionService } from './services/handDetectionService';
import { ParticleConfig, GestureState, HandData } from './types';
import { DEFAULT_CONFIG } from './constants';

const App: React.FC = () => {
  const [config, setConfig] = useState<ParticleConfig>(DEFAULT_CONFIG);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [gestureState, setGestureState] = useState<GestureState>({
    hands: [],
    distance: 0,
    center: { x: 0.5, y: 0.5, z: 0 },
    expansion: 1.0,
    rotation: { x: 0, y: 0 }
  });
  
  const [status, setStatus] = useState<'idle' | 'initializing' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackingRef = useRef<boolean>(false);

  // Check if user has been onboarded before
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('aura_onboarded');
    if (!hasSeenOnboarding && status === 'ready') {
      setShowOnboarding(true);
    }
  }, [status]);

  const startAura = async () => {
    setStatus('initializing');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, frameRate: 30 } 
      });
      
      const engineReady = await handDetectionService.initialize();
      if (!engineReady) throw new Error("Synthesis core failed to initialize.");

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        handDetectionService.setVideo(videoRef.current);
      }
      
      setStatus('ready');
      trackingRef.current = true;
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || "Input signal denied.");
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('aura_onboarded', 'true');
  };

  const replayBriefing = () => {
    setShowOnboarding(true);
  };

  useEffect(() => {
    let animationFrameId: number;
    const update = () => {
      if (trackingRef.current) {
        const result = handDetectionService.detect(performance.now());
        
        if (result && result.landmarks && result.landmarks.length > 0) {
          const hands: HandData[] = result.landmarks.map((landmarks, i) => ({
            landmarks,
            isOpen: handDetectionService.calculateHandOpenness(landmarks),
            score: 1.0,
            label: result.handedness[i] ? (result.handedness[i][0].categoryName as 'Left' | 'Right') : 'Right'
          }));

          let cx = 0, cy = 0, cz = 0;
          hands.forEach(h => {
            const palm = h.landmarks[0];
            cx += palm.x; cy += palm.y; cz += palm.z;
          });
          cx /= hands.length; cy /= hands.length; cz /= hands.length;

          let rotation = { x: 0, y: 0 };
          const rightHand = hands.find(h => h.label === 'Right') || hands[0];
          if (rightHand) {
            rotation.x = (rightHand.landmarks[0].y - 0.5) * Math.PI * 2;
            rotation.y = (rightHand.landmarks[0].x - 0.5) * Math.PI * 2;
          }

          let expansion = 1.0;
          let distance = 0;
          
          if (hands.length === 2) {
            const h1 = hands[0].landmarks[0];
            const h2 = hands[1].landmarks[0];
            distance = Math.sqrt(Math.pow(h1.x - h2.x, 2) + Math.pow(h1.y - h2.y, 2));
            const baseExpansion = Math.max(0.1, (distance - 0.05) * 12);
            const opennessCount = hands.filter(h => h.isOpen).length;
            const opennessMultiplier = 1 + (opennessCount * 1.5);
            expansion = Math.min(25.0, baseExpansion * opennessMultiplier);
          } else if (hands.length === 1) {
            expansion = hands[0].isOpen ? 2.5 : 0.5;
          }

          setGestureState({ hands, center: { x: cx, y: cy, z: cz }, distance, expansion, rotation });
        } else {
          setGestureState(prev => ({ ...prev, hands: [], expansion: 1.0 }));
        }
      }
      animationFrameId = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleConfigChange = useCallback((newConfig: Partial<ParticleConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const Signature = ({ className = "" }: { className?: string }) => (
    <div className={`flex flex-col items-start mono ${className}`}>
      <div className="flex items-center gap-2 text-[9px] text-white/30 uppercase tracking-[0.4em] font-bold mb-1">
        <CornerDownRight className="w-2 h-2" /> Engineered By
      </div>
      <h3 className="text-xl font-bold tracking-tighter uppercase italic leading-none mb-4">Pavan <span className="text-[#CCFF00]">/</span> Team401forbidden</h3>
      <div className="flex gap-2">
        <a 
          href="https://instagram.com/notpavanistg" 
          target="_blank" rel="noopener noreferrer" 
          className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/10 hover:border-[#CCFF00]/50 hover:bg-[#CCFF00]/5 transition-all text-[9px] mono uppercase font-bold text-white/40 hover:text-[#CCFF00] pointer-events-auto"
        >
          <Instagram className="w-3 h-3" /> @notpavanistg
        </a>
        <a 
          href="https://github.com/pavank-code" 
          target="_blank" rel="noopener noreferrer" 
          className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/10 hover:border-[#CCFF00]/50 hover:bg-[#CCFF00]/5 transition-all text-[9px] mono uppercase font-bold text-white/40 hover:text-[#CCFF00] pointer-events-auto"
        >
          <Github className="w-3 h-3" /> pavank-code
        </a>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden text-white bg-[#020202]">
      <video ref={videoRef} autoPlay playsInline muted className="fixed opacity-0 pointer-events-none" />
      
      {/* Interface Layer */}
      <div className={`absolute inset-0 z-10 pointer-events-none transition-all duration-1000 ${status === 'ready' ? 'opacity-100' : 'opacity-0'} ${showOnboarding ? 'blur-md grayscale brightness-50' : ''}`}>
        <Sidebar 
          config={config} 
          setConfig={handleConfigChange} 
          gestureState={gestureState}
          onReset={() => setConfig(DEFAULT_CONFIG)}
          onReplayBriefing={replayBriefing}
          trackingActive={gestureState.hands.length > 0}
        />
        
        {/* Dynamic Cursor */}
        <Cursor gestureState={gestureState} config={config} />
        
        {/* Subtle Branding Integration */}
        <div className="fixed bottom-10 right-10 z-50">
          <Signature />
        </div>

        {/* Diagnostic Input Preview */}
        <div className="fixed top-10 right-10 w-64 h-48 bg-black/40 border border-white/10 overflow-hidden shadow-2xl">
          <div className="absolute top-2 left-3 z-10 mono text-[8px] uppercase tracking-widest text-[#CCFF00] bg-black/60 px-2 py-0.5 border border-[#CCFF00]/20">
            Sensor Feed: Primary
          </div>
          {stream && (
            <video 
              autoPlay playsInline muted 
              ref={(v) => { if(v) v.srcObject = stream; }}
              className="w-full h-full object-cover grayscale brightness-110 contrast-110 opacity-70"
              style={{ transform: 'scaleX(-1)' }}
            />
          )}
          <div className="absolute inset-0 border-[20px] border-transparent pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, transparent 0%, black 100%)' }} />
        </div>
      </div>

      <Visualizer config={config} gestureState={gestureState} />
      
      {/* Onboarding Assistant Layer */}
      {showOnboarding && (
        <Onboarding 
          accentColor="#CCFF00" 
          onComplete={handleOnboardingComplete} 
        />
      )}

      {/* Splash Environment */}
      {status !== 'ready' && (
        <div className="fixed inset-0 bg-[#020202] flex items-center justify-center z-[100] p-12">
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-3 py-1 bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] mono text-[10px] font-bold uppercase tracking-[0.3em]">
                  <Zap className="w-3 h-3 fill-current" /> System Ready
                </div>
                <h2 className="text-8xl font-black tracking-tighter uppercase italic leading-[0.85] text-white">
                  Aura<br/><span className="text-[#CCFF00]">Hands</span>
                </h2>
                <p className="text-white/30 text-xl font-medium max-w-md leading-snug">
                  High-fidelity kinetic synthesis environment powered by real-time hand presence.
                </p>
              </div>

              <div className="flex flex-col gap-8 items-start">
                {status === 'idle' && (
                  <button 
                    onClick={startAura} 
                    className="group relative px-10 py-5 bg-[#CCFF00] text-black font-bold uppercase tracking-widest transition-all hover:pr-14 active:scale-95 pointer-events-auto"
                  >
                    Initialize Core
                    <CornerDownRight className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                )}

                {status === 'initializing' && (
                  <div className="flex flex-col gap-2">
                    <div className="w-48 h-1 bg-white/10 overflow-hidden">
                      <div className="w-1/2 h-full bg-[#CCFF00] animate-[shimmer_1.5s_infinite]" />
                    </div>
                    <span className="mono text-[9px] uppercase tracking-widest text-[#CCFF00] animate-pulse">Syncing Neural Buffers...</span>
                  </div>
                )}

                {status === 'error' && (
                  <div className="space-y-4">
                    <p className="mono text-red-500 text-xs font-bold uppercase flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Error: {errorMessage}
                    </p>
                    <button onClick={startAura} className="px-6 py-3 border border-red-500/20 text-red-500 mono uppercase text-[10px] font-bold pointer-events-auto hover:bg-red-500/10 transition-all">Re-establish Link</button>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden md:block border-l border-white/5 pl-20 space-y-12">
              <Signature />
              
              <div className="space-y-6">
                <h4 className="mono text-[10px] text-white/20 uppercase tracking-[0.4em] font-bold">Operational Guide</h4>
                <div className="space-y-4 mono text-[11px] text-white/40 uppercase tracking-widest leading-loose">
                  <p className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-[#CCFF00]" /> Use dual-hand separation for hyper-zoom</p>
                  <p className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-[#CCFF00]" /> Right hand position dictates axis rotation</p>
                  <p className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-[#CCFF00]" /> Clench for compression, open for bloom</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};

export default App;
