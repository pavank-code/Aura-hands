
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, X, Cpu, ShieldCheck, Zap, Layers } from 'lucide-react';

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
    text: "Neural link established.", 
    subtext: "System identity: AURA. Initializing kinetic synthesis core...",
    icon: Cpu
  },
  { 
    text: "Welcome, Operator.", 
    subtext: "I am your interface assistant. We are currently calibrated to your local environment.",
    icon: ShieldCheck
  },
  { 
    text: "Motion is energy.", 
    subtext: "Every gesture you make influences the particle matrix. Separation drives expansion, clenching induces compression.",
    icon: Zap
  },
  { 
    text: "You are the conductor.", 
    subtext: "Your dominant hand dictates spatial orientation. Move with intention. The system is yours.",
    icon: Layers
  },
  { 
    text: "Engage.", 
    subtext: "Core initialization complete. Ready for primary input.",
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
      <div className="absolute inset-0 bg-[#020202]/80 backdrop-blur-xl" />
      
      {/* Animated Sci-Fi Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#CCFF00 1px, transparent 1px), linear-gradient(90deg, #CCFF00 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      
      {/* Scanning Line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-[2px] bg-[#CCFF00]/10 absolute top-0 animate-[scan_4s_linear_infinite]" />
      </div>

      <div className="relative w-full max-w-2xl px-10 text-center space-y-8">
        {/* Step Indicator */}
        <div className="flex justify-center gap-2 mb-12">
          {SEQUENCE.map((_, i) => (
            <div 
              key={i} 
              className={`h-0.5 transition-all duration-500 ${i === step ? 'w-8 bg-[#CCFF00]' : 'w-2 bg-white/10'}`} 
            />
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[200px] flex flex-col items-center justify-center">
          {Icon && (
            <div className="mb-6 p-4 rounded-full border border-[#CCFF00]/20 bg-[#CCFF00]/5 animate-pulse">
              <Icon className="w-6 h-6 text-[#CCFF00]" />
            </div>
          )}
          
          <h2 className="text-4xl font-bold tracking-tighter uppercase italic text-white mb-4">
            <TypewriterText 
              key={`title-${step}`} 
              text={SEQUENCE[step].text} 
              onFinished={() => setShowSubtext(true)} 
            />
          </h2>
          
          <div className={`transition-all duration-1000 h-12 ${showSubtext ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="mono text-white/40 text-sm uppercase tracking-[0.2em] leading-relaxed max-w-lg mx-auto">
              {SEQUENCE[step].subtext}
            </p>
          </div>
        </div>

        {/* Interaction Bar */}
        <div className="flex flex-col items-center gap-6 pt-12">
          <button 
            onClick={nextStep}
            className="group relative flex items-center gap-4 px-12 py-4 bg-[#CCFF00] text-black font-bold uppercase tracking-widest transition-all hover:pr-16 active:scale-95 pointer-events-auto overflow-hidden"
          >
            <span className="relative z-10">{step === SEQUENCE.length - 1 ? 'Begin Interaction' : 'Acknowledge'}</span>
            <ChevronRight className="absolute right-6 w-5 h-5 transition-all group-hover:translate-x-1" />
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
          </button>

          <button 
            onClick={handleComplete}
            className="mono text-[10px] text-white/20 uppercase tracking-[0.3em] hover:text-[#CCFF00]/60 transition-colors pointer-events-auto"
          >
            Skip Briefing
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
