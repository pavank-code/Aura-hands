
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, AlertCircle, Sparkles } from 'lucide-react';
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

          // Calculate center
          let cx = 0, cy = 0, cz = 0;
          hands.forEach(h => {
            const palm = h.landmarks[0];
            cx += palm.x; cy += palm.y; cz += palm.z;
          });
          cx /= hands.length; cy /= hands.length; cz /= hands.length;

          // Rotation (Right hand control)
          let rotation = { x: 0, y: 0 };
          const rightHand = hands.find(h => h.label === 'Right') || hands[0];
          if (rightHand) {
            rotation.x = (rightHand.landmarks[0].y - 0.5) * Math.PI * 2;
            rotation.y = (rightHand.landmarks[0].x - 0.5) * Math.PI * 2;
          }

          // Expansion/Zoom (Distance between two hands + Finger Release Boost)
          let expansion = 1.0;
          let distance = 0;
          
          if (hands.length === 2) {
            const h1 = hands[0].landmarks[0];
            const h2 = hands[1].landmarks[0];
            distance = Math.sqrt(Math.pow(h1.x - h2.x, 2) + Math.pow(h1.y - h2.y, 2));
            
            // Base expansion from distance (Mapping 0.1 - 0.8 range to 0.1 - 10.0 scale)
            const baseExpansion = Math.max(0.1, (distance - 0.05) * 12);
            
            // Openness Boost: Releasing pinched fingers (opening hands) amplifies the zoom effect
            const opennessCount = hands.filter(h => h.isOpen).length;
            const opennessMultiplier = 1 + (opennessCount * 1.5); // Up to 4x total boost when both hands open
            
            expansion = Math.min(25.0, baseExpansion * opennessMultiplier);
          } else if (hands.length === 1) {
            // Single hand "sculpting" zoom
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

  return (
    <div className="relative w-full h-screen overflow-hidden text-white">
      <video ref={videoRef} autoPlay playsInline muted className="fixed opacity-0 pointer-events-none" />
      
      <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-1000 ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`}>
        <Sidebar 
          config={config} 
          setConfig={handleConfigChange} 
          gestureState={gestureState}
          onReset={() => setConfig(DEFAULT_CONFIG)}
          trackingActive={gestureState.hands.length > 0}
        />
        
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
      
      {status !== 'ready' && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-10 backdrop-blur-sm">
          <div className="max-w-md text-center space-y-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
              <div className="relative p-6 bg-white/5 border border-white/10 rounded-[2.5rem] shadow-2xl">
                {status === 'error' ? <AlertCircle className="w-16 h-16 text-red-400" /> : <Sparkles className="w-16 h-16 text-purple-400 animate-pulse" />}
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">AuraHands 3D</h2>
              <p className="text-white/40 text-lg">Pinch to zoom. Rotate with right hand. Sculpt with your presence.</p>
            </div>

            {status === 'idle' && (
              <button onClick={startAura} className="group relative px-10 py-5 bg-white text-black font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 pointer-events-auto">
                Connect Neural Interface
              </button>
            )}

            {status === 'initializing' && (
              <div className="flex items-center justify-center gap-3 text-purple-400 font-medium animate-pulse">
                Initializing MediaPipe Engine...
              </div>
            )}

            {status === 'error' && (
              <button onClick={startAura} className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl pointer-events-auto">Try Again</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
