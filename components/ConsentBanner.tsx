
import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Settings, ArrowRight, Info } from 'lucide-react';

interface ConsentSettings {
  analytics: boolean;
  ads: boolean;
  performance: boolean;
}

const STORAGE_KEY = 'nuero_consent_state';

const ConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [view, setView] = useState<'summary' | 'manage'>('summary');
  const [settings, setSettings] = useState<ConsentSettings>({
    analytics: false,
    ads: false,
    performance: false
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem(STORAGE_KEY);
    if (!savedConsent) {
      // Check if user is in EEA/UK region (simplified detection)
      const isEEA = isUserInEEA();
      if (isEEA) {
        setIsVisible(true);
      }
    } else {
      applyConsent(JSON.parse(savedConsent));
    }
    
    // Listen for custom event to reopen settings
    const handleReopen = () => {
      setIsVisible(true);
      setView('manage');
    };
    window.addEventListener('reopen-privacy-settings', handleReopen);
    return () => window.removeEventListener('reopen-privacy-settings', handleReopen);
  }, []);

  const isUserInEEA = () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const eeaTimezones = [
        'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome', 
        'Europe/Madrid', 'Europe/Brussels', 'Europe/Amsterdam', 'Europe/Vienna',
        'Europe/Zurich', 'Europe/Stockholm', 'Europe/Oslo', 'Europe/Helsinki'
      ];
      return eeaTimezones.some(tz => timezone.includes(tz)) || true; // Default to true for safety
    } catch {
      return true;
    }
  };

  const applyConsent = (consents: ConsentSettings) => {
    // Update Google Consent Mode
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': consents.analytics ? 'granted' : 'denied',
        'ad_storage': consents.ads ? 'granted' : 'denied',
        'ad_user_data': consents.ads ? 'granted' : 'denied',
        'ad_personalization': consents.ads ? 'granted' : 'denied',
      });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consents));
  };

  const handleAcceptAll = () => {
    const allOn = { analytics: true, ads: true, performance: true };
    applyConsent(allOn);
    setIsVisible(false);
  };

  const handleDeclineAll = () => {
    const allOff = { analytics: false, ads: false, performance: false };
    applyConsent(allOff);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    applyConsent(settings);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 lg:left-auto lg:bottom-10 lg:right-10 z-[200] max-w-lg animate-[slideUp_0.5s_ease-out]">
      <div className="bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Futuristic accent line */}
        <div className="absolute top-0 left-0 w-1 h-full bg-[#CCFF00]/50" />
        
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#CCFF00] mono text-[10px] uppercase tracking-[0.3em] font-bold">
                <Shield className="w-3 h-3" /> Privacy & Data
              </div>
              <h3 className="text-xl font-bold tracking-tighter uppercase italic text-white">
                {view === 'summary' ? 'Preferences Matrix' : 'Granular Controls'}
              </h3>
            </div>
            {view === 'manage' && (
              <button onClick={() => setView('summary')} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {view === 'summary' ? (
            <>
              <p className="text-white/40 text-xs lg:text-sm mono leading-relaxed uppercase tracking-wider">
                We use kinetic tracking and neural cookies to stabilize this environment. Your data stays yours. You are always in control.
              </p>
              
              <div className="grid grid-cols-1 gap-3 pt-2">
                <button 
                  onClick={handleAcceptAll}
                  className="group flex items-center justify-center gap-3 py-3.5 bg-[#CCFF00] text-black font-bold uppercase tracking-widest text-[10px] lg:text-xs transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  Authorize All <Check className="w-3 h-3" />
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleDeclineAll}
                    className="py-3 bg-white/[0.03] border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all font-bold uppercase tracking-widest text-[9px] mono"
                  >
                    Decline All
                  </button>
                  <button 
                    onClick={() => setView('manage')}
                    className="py-3 bg-white/[0.03] border border-white/10 text-white/40 hover:text-[#CCFF00] hover:border-[#CCFF00]/30 transition-all font-bold uppercase tracking-widest text-[9px] mono flex items-center justify-center gap-2"
                  >
                    Manage <Settings className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-5 py-2">
              <ToggleRow 
                title="Essential Systems" 
                desc="Core environment stabilization and security." 
                checked={true} 
                disabled={true} 
                onChange={() => {}} 
              />
              <ToggleRow 
                title="Neural Analytics" 
                desc="Understand usage patterns to optimize performance." 
                checked={settings.analytics} 
                onChange={(v) => setSettings({...settings, analytics: v})} 
              />
              <ToggleRow 
                title="Personalized Output" 
                desc="Support the project via relevant content discovery." 
                checked={settings.ads} 
                onChange={(v) => setSettings({...settings, ads: v})} 
              />
              
              <button 
                onClick={handleSavePreferences}
                className="w-full py-4 bg-[#CCFF00] text-black font-bold uppercase tracking-widest text-[10px] mt-4 flex items-center justify-center gap-3 group"
              >
                Apply Preferences <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const ToggleRow: React.FC<{ title: string; desc: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }> = ({ title, desc, checked, onChange, disabled }) => (
  <div className={`flex items-start justify-between gap-4 ${disabled ? 'opacity-50' : ''}`}>
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <h4 className="text-[11px] font-bold text-white uppercase tracking-wider italic">{title}</h4>
        {disabled && <span className="text-[8px] mono text-[#CCFF00] px-1 border border-[#CCFF00]/20 uppercase">Required</span>}
      </div>
      <p className="text-[10px] mono text-white/30 uppercase leading-relaxed">{desc}</p>
    </div>
    <button 
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 mt-1 shrink-0 transition-all duration-300 border ${checked ? 'bg-[#CCFF00]/20 border-[#CCFF00]/40' : 'bg-white/5 border-white/10'}`}
    >
      <div className={`absolute top-0.5 bottom-0.5 w-4 transition-all duration-300 ${checked ? 'right-0.5 bg-[#CCFF00]' : 'left-0.5 bg-white/20'}`} />
    </button>
  </div>
);

export default ConsentBanner;
