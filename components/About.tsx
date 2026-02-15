
import React from 'react';
import { X, ShieldCheck, CloudOff, Share2, Sparkles, Smartphone, Trash2, PiggyBank } from 'lucide-react';

interface AboutProps {
  onClose: () => void;
  generateShareLink: () => void;
}

const About: React.FC<AboutProps> = ({ onClose, generateShareLink }) => {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-0 md:p-6 bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-2xl w-full max-w-4xl h-full md:h-[90vh] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-emerald-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-100">
              <Smartphone size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">How it Works</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Everything you need to know</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-emerald-50 text-emerald-500 rounded-full hover:bg-emerald-100 transition-all ios-tap">
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 hide-scrollbar">
          {/* Section: Mechanics */}
          <section className="space-y-6">
            <div className="flex items-center space-x-3">
              <PiggyBank className="text-emerald-600" size={24} />
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">The Basics</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-emerald-50/30 rounded-[2rem] border border-emerald-100/50">
                <h4 className="font-black text-slate-900 mb-2 text-sm uppercase">Tracking</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">Add "Deposits" when you receive money and "Withdrawals" when you spend. The app automatically calculates your total balance and shows your progress on the chart.</p>
              </div>
              <div className="p-6 bg-emerald-50/30 rounded-[2rem] border border-emerald-100/50">
                <h4 className="font-black text-slate-900 mb-2 text-sm uppercase">Starting Fund</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">Use the "Starting Fund" setting to set your initial balance. This is perfect if you already have money in your piggy bank before you started using the app.</p>
              </div>
            </div>
          </section>

          {/* Section: Data Privacy */}
          <section className="space-y-6">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="text-emerald-600" size={24} />
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Your Data Privacy</h3>
            </div>
            <div className="p-8 bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100/50 space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-white rounded-xl shadow-sm"><CloudOff size={20} className="text-emerald-600" /></div>
                <div>
                  <h4 className="font-black text-slate-900 mb-1 text-sm uppercase">Saved on your Phone</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">This app does not have a server. All your financial data is stored in your browser's <strong>Local Storage</strong>. This means your data never leaves your device and we can't see it.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-white rounded-xl shadow-sm"><Trash2 size={20} className="text-rose-500" /></div>
                <div>
                  <h4 className="font-black text-slate-900 mb-1 text-sm uppercase">Clearing Data</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium"><strong>Caution:</strong> If you clear your browser history or "Website Data" in your settings, your entries will be deleted permanently. Use the Share feature to back up your data!</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Sharing */}
          <section className="space-y-6">
            <div className="flex items-center space-x-3">
              <Share2 className="text-emerald-600" size={24} />
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Sharing & Backup</h3>
            </div>
            <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-10 -mt-10"></div>
              <p className="text-sm text-slate-300 leading-relaxed font-medium z-10 relative">Want to show your parents or friends your progress? Use the <strong>Share Link</strong> feature.</p>
              <div className="space-y-4 z-10 relative">
                <div className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest text-emerald-400">
                  <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center">1</div>
                  <span>Tap "Share Progress"</span>
                </div>
                <div className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest text-emerald-400">
                  <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center">2</div>
                  <span>A special link is created</span>
                </div>
                <p className="text-xs text-slate-400 font-medium pl-9">This link contains your last 100 entries encoded into the URL itself. When someone opens it, they see a read-only view of your dashboard.</p>
              </div>
              <button 
                onClick={generateShareLink}
                className="w-full py-5 bg-white text-slate-900 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition active:scale-95 z-10 relative"
              >
                Try Sharing Now
              </button>
            </div>
          </section>

          {/* Section: AI */}
          <section className="space-y-6 pb-6">
            <div className="flex items-center space-x-3">
              <Sparkles className="text-amber-500" size={24} />
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">AI Insights</h3>
            </div>
            <div className="p-8 bg-amber-50/50 rounded-[2.5rem] border border-amber-100">
              <p className="text-sm text-slate-600 leading-relaxed font-medium">The "Smart Tips" feature uses Google's Gemini AI. It analyzes your recent activity to provide encouraging habits and financial advice. It only sees your last few transactions to help you stay motivated!</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 bg-emerald-50/20 border-t border-emerald-50 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Money Monitor • Version 2.1</p>
        </div>
      </div>
    </div>
  );
};

export default About;
