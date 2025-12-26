
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, AlertCircle, Sparkles, Instagram, Github } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Visualizer from './components/Visualizer';
import { handDetectionService } from './services/handDetectionService';
import { ParticleConfig, GestureState, HandData } from './types';
import { DEFAULT_CONFIG } from './constants';

const App: React.FC = () => {
  const [config, setConfig] = useState<ParticleConfig>(DEFAULT_CONFIG);
  const [gestureState, setGestureState] = useState<GestureState>({
    hands: [],
    distance: 0,
    center: { x: 0.5, y: 0.5, z: 0 },
    expansion: 1.0,
    rotation: { x: 0, y: 0 }
  });
  
  const [status, setStatus] = useState<'idle' | 'initializing' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackingRef = useRef<boolean>(false);

  const startAura = async () => {
    setStatus('initializing');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, frameRate: 30 } 
      });
      const engineReady = await handDetectionService.initialize();
      if (!engineReady) throw new Error("Hand tracking engine failed.");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        handDetectionService.setVideo(videoRef.current);
        setStatus('ready');
        trackingRef.current = true;
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || "Camera access denied.");
    }
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

  const PersonalBranding = ({ className = "" }: { className?: string }) => (
    <div className={`flex flex-col items-center gap-3 transition-all duration-700 ${className}`}>
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Developed by</span>
      <h3 className="text-xl font-bold tracking-tighter bg-gradient-to-r from-purple-400 via-white to-purple-400 bg-clip-text text-transparent">Pavan</h3>
      <div className="flex gap-4">
        <a 
          href="https://instagram.com/notpavanistg" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors pointer-events-auto group"
        >
          <Instagram className="w-4 h-4 text-white/40 group-hover:text-purple-400 transition-colors" />
        </a>
        <a 
          href="https://github.com/pavank-code" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors pointer-events-auto group"
        >
          <Github className="w-4 h-4 text-white/40 group-hover:text-purple-400 transition-colors" />
        </a>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden text-white bg-[#050505]">
      <video ref={videoRef} autoPlay playsInline muted className="fixed opacity-0 pointer-events-none" />
      
      {/* Live UI Layer */}
      <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-1000 ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`}>
        <Sidebar 
          config={config} 
          setConfig={handleConfigChange} 
          gestureState={gestureState}
          onReset={() => setConfig(DEFAULT_CONFIG)}
          trackingActive={gestureState.hands.length > 0}
        />
        
        {/* Floating Branding when active */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <PersonalBranding className="scale-90" />
        </div>

        <div className="fixed bottom-6 right-6 w-48 h-36 glass rounded-3xl overflow-hidden border-white/10">
           <video 
              autoPlay playsInline muted 
              ref={(v) => { if(v && videoRef.current) v.srcObject = videoRef.current.srcObject; }}
              className="w-full h-full object-cover grayscale opacity-40"
              style={{ transform: 'scaleX(-1)' }}
            />
        </div>
      </div>

      <Visualizer config={config} gestureState={gestureState} />
      
      {/* Splash / Loading Screen */}
      {status !== 'ready' && (
        <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-[100] p-10 backdrop-blur-md">
          <div className="max-w-md text-center space-y-12">
            <div className="space-y-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
                <div className="relative p-6 bg-white/5 border border-white/10 rounded-[2.5rem] shadow-2xl">
                  {status === 'error' ? <AlertCircle className="w-16 h-16 text-red-400" /> : <Sparkles className="w-16 h-16 text-purple-400 animate-pulse" />}
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-6xl font-black tracking-tighter bg-gradient-to-b from-white to-white/30 bg-clip-text text-transparent">AuraHands</h2>
                <p className="text-white/40 text-lg font-medium leading-relaxed">Neural Particle Engine with Real-time Hand Presence</p>
              </div>
            </div>

            <div className="flex flex-col gap-6 items-center">
              {status === 'idle' && (
                <button 
                  onClick={startAura} 
                  className="group relative px-12 py-6 bg-white text-black font-black uppercase tracking-widest rounded-2xl transition-all hover:scale-105 active:scale-95 pointer-events-auto shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)]"
                >
                  Enter Interface
                </button>
              )}

              {status === 'initializing' && (
                <div className="flex items-center justify-center gap-3 text-purple-400 font-black uppercase tracking-widest animate-pulse text-xs">
                  Neural Sync in Progress...
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-4">
                  <p className="text-red-400 text-sm font-bold uppercase">{errorMessage}</p>
                  <button onClick={startAura} className="px-8 py-4 bg-red-500/10 text-red-400 border border-red-500/20 font-black uppercase text-xs rounded-xl pointer-events-auto hover:bg-red-500/20 transition-all">Retry Link</button>
                </div>
              )}
            </div>

            {/* Bottom Branding on Splash */}
            <div className="pt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
               <PersonalBranding />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
