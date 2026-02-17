
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, LayoutDashboard, History, FileText, TrendingUp, CheckCircle, Share2, X, Info, Settings2, Menu, Sparkles, RefreshCcw, BookOpen, HelpCircle } from 'lucide-react';
import { Transaction, AccountType, TransactionType, DEFAULT_CATEGORIES } from './types';
import Dashboard from './components/Dashboard';
import Ledger from './components/Ledger';
import TransactionForm from './components/TransactionForm';
import Report from './components/Report';
import About from './components/About';
import { getFinancialInsights } from './geminiService';

/**
 * Main application component.
 * Manages state for transactions, categories, and UI views.
 */
const App: React.FC = () => {
  // Persistence State - Using sanitized generic keys
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('money-monitor-v2-data');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('money-monitor-v2-categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [startingBalance, setStartingBalance] = useState<number>(() => {
    const saved = localStorage.getItem('money-monitor-v2-start');
    return saved ? parseFloat(saved) : 0;
  });
  
  // App UI State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isSharedMode, setIsSharedMode] = useState(false);
  const [tempStartBalance, setTempStartBalance] = useState<string>(startingBalance.toString());
  
  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const mainRef = useRef<HTMLElement>(null);

  // Initialize from shared link if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('share');
    const startParam = params.get('start');
    if (dataParam) {
      try {
        const decodedData = JSON.parse(atob(decodeURIComponent(dataParam)));
        if (Array.isArray(decodedData)) {
          setIsSharedMode(true);
          setTransactions(decodedData);
          if (startParam) setStartingBalance(parseFloat(startParam));
        }
      } catch (err) {
        console.error("Failed to decode shared data", err);
      }
    }

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsDrawerOpen(false);
      }
      setPullDistance(0);
      setIsPulling(false);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (!isSharedMode) {
      localStorage.setItem('money-monitor-v2-data', JSON.stringify(transactions));
      localStorage.setItem('money-monitor-v2-categories', JSON.stringify(categories));
      localStorage.setItem('money-monitor-v2-start', startingBalance.toString());
      setShowSavedToast(true);
      const timer = setTimeout(() => setShowSavedToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [transactions, categories, startingBalance, isSharedMode]);

  const totalBalance = useMemo(() => {
    return startingBalance + transactions.reduce((acc, t) => {
      const amount = t.type === TransactionType.DEPOSIT ? t.amount : -t.amount;
      return acc + amount;
    }, 0);
  }, [transactions, startingBalance]);

  // Pull to refresh logic for fetching insights
  const handleTouchStart = (e: React.TouchEvent) => {
    if (mainRef.current && mainRef.current.scrollTop === 0) {
      startY.current = e.touches[0].pageY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return;
    const currentY = e.touches[0].pageY;
    const diff = currentY - startY.current;
    
    if (diff > 0 && mainRef.current && mainRef.current.scrollTop === 0) {
      const resistedDiff = Math.pow(diff, 0.8);
      setPullDistance(Math.min(resistedDiff, 80));
      if (diff > 10) e.preventDefault();
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 55) {
      fetchInsights();
    }
    setIsPulling(false);
    setPullDistance(0);
  };

  const handleAddOrEditTransaction = (transaction: Transaction) => {
    if (isSharedMode) return;
    if (!categories.includes(transaction.category)) {
      setCategories(prev => [...prev, transaction.category]);
    }
    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
    } else {
      setTransactions(prev => [...prev, transaction]);
    }
    setEditingTransaction(null);
    setIsFormOpen(false);
  };

  const handleSaveStartingBalance = () => {
    const val = parseFloat(tempStartBalance);
    if (!isNaN(val)) {
      setStartingBalance(val);
      setIsSettingsOpen(false);
    }
  };

  const handleDeleteCategory = (cat: string) => {
    if (window.confirm(`Remove "${cat}" from your shortcuts?`)) {
      setCategories(prev => prev.filter(c => c !== cat));
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (isSharedMode) return;
    if (window.confirm('Delete this entry forever?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleEditRequest = (transaction: Transaction) => {
    if (isSharedMode) return;
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const fetchInsights = async () => {
    if (transactions.length === 0) return;
    setIsLoadingInsight(true);
    const insight = await getFinancialInsights(transactions);
    setAiInsight(insight);
    setIsLoadingInsight(false);
  };

  const generateShareLink = () => {
    try {
      const sharedSubset = transactions.slice(-100);
      const encoded = btoa(JSON.stringify(sharedSubset));
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(encoded)}&start=${startingBalance}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert("Link copied! Share it to show your progress.");
      });
    } catch (e) {
      alert("Error sharing. Try a manual backup.");
    }
  };

  const exitSharedMode = () => {
    const saved = localStorage.getItem('money-monitor-v2-data');
    const start = localStorage.getItem('money-monitor-v2-start');
    setTransactions(saved ? JSON.parse(saved) : []);
    setStartingBalance(start ? parseFloat(start) : 0);
    setIsSharedMode(false);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return (
    <div className="h-full w-full flex flex-col md:flex-row bg-slate-50 text-slate-900 overflow-hidden select-none">
      {isSharedMode && (
        <div className="fixed top-0 left-0 right-0 z-[120] bg-emerald-600 text-white pt-10 pb-3 px-4 flex items-center justify-between shadow-xl safe-top">
          <div className="flex items-center space-x-2">
            <Info size={16} />
            <span className="text-xs font-black uppercase tracking-tighter">Shared View</span>
          </div>
          <button onClick={exitSharedMode} className="px-4 py-2 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest ios-tap">
            Exit
          </button>
        </div>
      )}

      {/* Pull-to-refresh Indicator */}
      <div 
        className="fixed top-0 left-0 right-0 z-[110] flex items-center justify-center pointer-events-none transition-all duration-200"
        style={{ 
          height: `${pullDistance}px`, 
          opacity: pullDistance / 50,
          transform: `translateY(${pullDistance > 20 ? 0 : -20}px)` 
        }}
      >
        <div className={`p-2 bg-white rounded-full shadow-lg border border-slate-100 ${isLoadingInsight ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullDistance * 3}deg)` }}>
          <RefreshCcw size={20} className="text-emerald-600" />
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <div 
        className={`fixed inset-0 z-[200] transition-opacity duration-300 md:hidden ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
        <aside 
          className={`absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl p-6 flex flex-col transition-transform duration-300 transform ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <TrendingUp size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase">Money Monitor</h1>
          </div>
          
          <nav className="space-y-2 flex-1">
            <button 
              onClick={() => { setActiveTab('dashboard'); setIsDrawerOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => { setActiveTab('ledger'); setIsDrawerOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'ledger' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <History size={20} />
              <span>History</span>
            </button>
            <button 
              onClick={() => { setIsReportOpen(true); setIsDrawerOpen(false); }}
              className="w-full flex items-center space-x-3 px-4 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
            >
              <FileText size={20} />
              <span>Statement</span>
            </button>
          </nav>

          <div className="space-y-2 pt-6 border-t border-slate-100">
            <button onClick={() => { setIsSettingsOpen(true); setIsDrawerOpen(false); }} className="w-full flex items-center space-x-3 px-4 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
              <Settings2 size={20} />
              <span>Settings</span>
            </button>
            <button onClick={() => { setIsAboutOpen(true); setIsDrawerOpen(false); }} className="w-full flex items-center space-x-3 px-4 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
              <HelpCircle size={20} />
              <span>Help</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 p-8 h-full shrink-0">
        <div className="flex items-center space-x-3 mb-12">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-100">
            <TrendingUp size={28} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase leading-tight">Money Monitor</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Build Wealth</p>
          </div>
        </div>

        <nav className="space-y-3 flex-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-4 px-6 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`w-full flex items-center space-x-4 px-6 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'ledger' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <History size={20} />
            <span>History</span>
          </button>
          <button 
            onClick={() => setIsReportOpen(true)}
            className="w-full flex items-center space-x-4 px-6 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
          >
            <FileText size={20} />
            <span>Statement</span>
          </button>
        </nav>

        <div className="space-y-3 pt-8 border-t border-slate-50">
          <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center space-x-4 px-6 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
            <Settings2 size={20} />
            <span>Settings</span>
          </button>
          <button onClick={() => setIsAboutOpen(true)} className="w-full flex items-center space-x-4 px-6 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
            <HelpCircle size={20} />
            <span>Help</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main ref={mainRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="flex-1 h-full overflow-y-auto bg-slate-50 p-6 md:p-12 md:pb-24 pb-32 relative">
        <header className="flex items-center justify-between mb-10 md:mb-16">
          <div className="md:hidden">
            <button onClick={() => setIsDrawerOpen(true)} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
              <Menu size={24} className="text-slate-600" />
            </button>
          </div>
          <div className="hidden md:block">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight capitalize">
              {activeTab === 'dashboard' ? 'Overview' : 'Record Book'}
            </h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Funds</p>
              <p className="text-xl font-black text-emerald-600">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            {!isSharedMode && (
              <button 
                onClick={() => setIsFormOpen(true)}
                className="p-4 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-100 hover:scale-105 transition-transform active:scale-95"
              >
                <Plus size={24} strokeWidth={3} />
              </button>
            )}
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <Dashboard 
            transactions={transactions} 
            balance={totalBalance} 
            startingBalance={startingBalance}
            aiInsight={aiInsight}
            onRefreshInsight={fetchInsights}
            isLoadingInsight={isLoadingInsight}
            onShowInfo={() => setIsAboutOpen(true)}
          />
        ) : (
          <Ledger 
            transactions={transactions} 
            onEdit={handleEditRequest} 
            onDelete={handleDeleteTransaction}
            isReadOnly={isSharedMode}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex items-center justify-around z-50 safe-bottom">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-300'}`}
        >
          <LayoutDashboard size={24} strokeWidth={activeTab === 'dashboard' ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Home</span>
        </button>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200 -mt-10 border-4 border-slate-50"
        >
          <Plus size={28} strokeWidth={3} />
        </button>
        <button 
          onClick={() => setActiveTab('ledger')}
          className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'ledger' ? 'text-emerald-600' : 'text-slate-300'}`}
        >
          <History size={24} strokeWidth={activeTab === 'ledger' ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-tighter">History</span>
        </button>
      </nav>

      {/* Overlays */}
      {isFormOpen && (
        <TransactionForm 
          onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }} 
          onSubmit={handleAddOrEditTransaction}
          onDeleteCategory={handleDeleteCategory}
          categories={categories}
          initialData={editingTransaction}
        />
      )}

      {isReportOpen && (
        <Report 
          transactions={transactions} 
          balance={totalBalance} 
          startingBalance={startingBalance} 
          onClose={() => setIsReportOpen(false)} 
        />
      )}

      {isAboutOpen && (
        <About 
          onClose={() => setIsAboutOpen(false)} 
          generateShareLink={generateShareLink}
        />
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Settings</h3>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Starting Fund</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                       <input 
                         type="number" 
                         value={tempStartBalance} 
                         onChange={(e) => setTempStartBalance(e.target.value)}
                         className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none font-bold text-lg transition-all"
                       />
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 leading-relaxed px-1">How much money did you have before you started using the app?</p>
                 </div>

                 <button 
                   onClick={handleSaveStartingBalance}
                   className="w-full bg-slate-900 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl hover:bg-slate-800 transition active:scale-95"
                 >
                   Update Settings
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Success Toast */}
      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 shadow-2xl transition-all duration-500 ${showSavedToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <CheckCircle size={14} className="text-emerald-400" />
        <span>Data Secured</span>
      </div>
    </div>
  );
};

export default App;
