
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, Cpu, ShieldCheck, Zap, Layers } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  accentColor: string;
}

interface Message {
  text: string;
  subtext?: string;
  icon?: any;
}

const SEQUENCE: Message[] = [
  { 
    text: "Neural Link Established.", 
    subtext: "System identity: AURA. Initializing kinetic synthesis core...",
    icon: Cpu
  },
  { 
    text: "Welcome, Operator.", 
    subtext: "I am your interface assistant. Calibrating to spatial presence...",
    icon: ShieldCheck
  },
  { 
    text: "Motion is Energy.", 
    subtext: "Gently move your hands to influence the particle matrix. Separation drives expansion.",
    icon: Zap
  },
  { 
    text: "You are the Conductor.", 
    subtext: "Dominant hand dictates orientation. For mobile, prop your device for best tracking.",
    icon: Layers
  },
  { 
    text: "Engage.", 
    subtext: "Core initialization complete. Ready for primary input stream.",
  }
];

const TypewriterText: React.FC<{ text: string; speed?: number; onFinished?: () => void }> = ({ text, speed = 25, onFinished }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (onFinished) onFinished();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayedText}
      <span className="inline-block w-1.5 h-4 bg-[#CCFF00] ml-1 animate-pulse" />
    </span>
  );
};

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, accentColor }) => {
  const [step, setStep] = useState(0);
  const [showSubtext, setShowSubtext] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const nextStep = useCallback(() => {
    if (step < SEQUENCE.length - 1) {
      setStep(s => s + 1);
      setShowSubtext(false);
    } else {
      handleComplete();
    }
  }, [step]);

  const handleComplete = () => {
    setIsExiting(true);
    setTimeout(onComplete, 1000);
  };

  const Icon = SEQUENCE[step].icon;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-1000 ${isExiting ? 'opacity-0 scale-105' : 'opacity-100'}`}>
      {/* Cinematic Background Overlays */}
      <div className="absolute inset-0 bg-[#020202]/90 backdrop-blur-2xl" />
      
      {/* Animated Sci-Fi Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#CCFF00 1px, transparent 1px), linear-gradient(90deg, #CCFF00 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      
      {/* Scanning Line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-[1px] bg-[#CCFF00]/20 absolute top-0 animate-[scan_4s_linear_infinite]" />
      </div>

      <div className="relative w-full max-w-2xl px-6 lg:px-10 text-center space-y-6 lg:space-y-8">
        {/* Step Indicator */}
        <div className="flex justify-center gap-1.5 lg:gap-2 mb-8 lg:mb-12">
          {SEQUENCE.map((_, i) => (
            <div 
              key={i} 
              className={`h-0.5 transition-all duration-500 ${i === step ? 'w-6 lg:w-8 bg-[#CCFF00]' : 'w-1.5 lg:w-2 bg-white/10'}`} 
            />
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[160px] lg:min-h-[200px] flex flex-col items-center justify-center">
          {Icon && (
            <div className="mb-4 lg:mb-6 p-3 lg:p-4 rounded-full border border-[#CCFF00]/20 bg-[#CCFF00]/5 animate-pulse">
              <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-[#CCFF00]" />
            </div>
          )}
          
          <h2 className="text-2xl lg:text-4xl font-bold tracking-tighter uppercase italic text-white mb-3 lg:mb-4 px-4">
            <TypewriterText 
              key={`title-${step}`} 
              text={SEQUENCE[step].text} 
              onFinished={() => setShowSubtext(true)} 
            />
          </h2>
          
          <div className={`transition-all duration-1000 h-10 lg:h-12 ${showSubtext ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="mono text-white/40 text-[10px] lg:text-sm uppercase tracking-[0.2em] leading-relaxed max-w-sm lg:max-w-lg mx-auto px-4">
              {SEQUENCE[step].subtext}
            </p>
          </div>
        </div>

        {/* Interaction Bar */}
        <div className="flex flex-col items-center gap-4 lg:gap-6 pt-8 lg:pt-12">
          <button 
            onClick={nextStep}
            className="group relative flex items-center justify-center gap-4 w-full max-w-xs lg:max-w-none lg:w-auto px-8 lg:px-12 py-3.5 lg:py-4 bg-[#CCFF00] text-black font-bold uppercase tracking-widest transition-all hover:pr-16 active:scale-95 pointer-events-auto overflow-hidden text-xs lg:text-sm"
          >
            <span className="relative z-10">{step === SEQUENCE.length - 1 ? 'Execute Sync' : 'Acknowledge'}</span>
            <ChevronRight className="absolute right-4 lg:right-6 w-4 h-4 lg:w-5 lg:h-5 transition-all group-hover:translate-x-1" />
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
          </button>

          <button 
            onClick={handleComplete}
            className="mono text-[8px] lg:text-[10px] text-white/20 uppercase tracking-[0.3em] hover:text-[#CCFF00]/60 transition-colors pointer-events-auto py-2"
          >
            Bypass Sequence
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: -10%; }
          100% { top: 110%; }
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
