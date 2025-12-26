
import React, { useState } from 'react';
import { Send, X, Star, MessageSquare, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FeedbackPopupProps {
  onClose: () => void;
}

const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [experience, setExperience] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !experience) return;

    setStatus('submitting');
    setErrorMessage(null);
    
    try {
      const { error } = await supabase
        .from('feedback')
        .insert([
          { 
            name: name.trim(), 
            experience: experience.trim(), 
            created_at: new Date().toISOString() 
          }
        ]);

      if (error) {
        if (error.message.includes("public.feedback")) {
          throw new Error("The 'feedback' table was not found in your Supabase database. Please create it using the SQL Editor.");
        }
        throw new Error(error.message);
      }

      setStatus('success');
      localStorage.setItem('nuero_feedback_given', 'true');
      setTimeout(onClose, 2000);
    } catch (err: any) {
      const msg = err.message || 'Unknown network error';
      console.error('Feedback Critical Failure:', msg);
      setErrorMessage(msg);
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-none overflow-hidden shadow-2xl animate-[scaleIn_0.4s_ease-out]">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#CCFF00 1px, transparent 1px), linear-gradient(90deg, #CCFF00 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <div className="relative p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#CCFF00] mono text-[10px] uppercase tracking-[0.3em]">
                <MessageSquare className="w-3 h-3" /> Neural Feedback
              </div>
              <h2 className="text-2xl font-bold tracking-tighter uppercase italic text-white">Share Experience</h2>
            </div>
            <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {status === 'success' ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-[#CCFF00] animate-bounce" />
              </div>
              <p className="mono text-sm text-[#CCFF00] uppercase tracking-widest">Data Upload Successful</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="mono text-[9px] text-white/40 uppercase tracking-widest">Operator Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="IDENTIFY YOURSELF..."
                  className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm mono text-white placeholder:text-white/10 focus:outline-none focus:border-[#CCFF00]/50 transition-all rounded-none"
                />
              </div>

              <div className="space-y-2">
                <label className="mono text-[9px] text-white/40 uppercase tracking-widest">Simulation Insights</label>
                <textarea
                  required
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="DESCRIBE THE KINETIC SYNC..."
                  rows={4}
                  className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm mono text-white placeholder:text-white/10 focus:outline-none focus:border-[#CCFF00]/50 transition-all rounded-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full flex items-center justify-center gap-3 py-4 bg-[#CCFF00] text-black font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                {status === 'submitting' ? 'Uploading Signal...' : 'Submit Signal'}
                <Send className="w-4 h-4" />
              </button>
              
              {status === 'error' && (
                <div className="space-y-2 p-4 bg-red-500/10 border border-red-500/20 text-center">
                  <div className="flex items-center justify-center gap-2 text-red-500 mono text-[10px] font-bold uppercase">
                    <AlertTriangle className="w-3 h-3" /> Sync Failed
                  </div>
                  {errorMessage && (
                    <p className="mono text-[9px] text-white/60 uppercase leading-relaxed">
                      {errorMessage}
                    </p>
                  )}
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default FeedbackPopup;
