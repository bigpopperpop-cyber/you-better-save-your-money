
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { X, Printer, Calendar, Filter, PiggyBank } from 'lucide-react';

interface ReportProps {
  transactions: Transaction[];
  balance: number;
  startingBalance: number;
  onClose: () => void;
  isPrintView?: boolean;
}

type TimeframeOption = 'all' | '7days' | '30days' | 'thisMonth' | 'custom';

const Report: React.FC<ReportProps> = ({ transactions, balance, startingBalance, onClose, isPrintView = false }) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startLimit: Date | null = null;
    let endLimit: Date | null = null;

    if (timeframe === '7days') {
      startLimit = new Date();
      startLimit.setDate(now.getDate() - 7);
    } else if (timeframe === '30days') {
      startLimit = new Date();
      startLimit.setDate(now.getDate() - 30);
    } else if (timeframe === 'thisMonth') {
      startLimit = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeframe === 'custom') {
      if (startDate) startLimit = new Date(startDate);
      if (endDate) endLimit = new Date(endDate);
    }

    return transactions
      .filter(t => {
        const tDate = new Date(t.date);
        if (startLimit && tDate < startLimit) return false;
        if (endLimit && tDate > endLimit) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, timeframe, startDate, endDate]);

  const timeframeLabel = useMemo(() => {
    switch (timeframe) {
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case 'thisMonth': return 'This Month';
      case 'custom': return `From ${startDate || '...'} to ${endDate || '...'}`;
      default: return 'Full History';
    }
  }, [timeframe, startDate, endDate]);

  if (isPrintView) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center border-b-2 border-slate-900 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">Ryan's Savings Statement</h1>
            <p className="text-slate-500 font-bold mt-2">Period: {timeframeLabel}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase mr-4">Total Wealth</span>
            <span className="text-3xl font-black text-indigo-600">${balance.toFixed(2)}</span>
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-3 text-left border text-xs font-bold uppercase">Date</th>
              <th className="p-3 text-left border text-xs font-bold uppercase">Category</th>
              <th className="p-3 text-left border text-xs font-bold uppercase">Description</th>
              <th className="p-3 text-right border text-xs font-bold uppercase">Amount</th>
            </tr>
          </thead>
          <tbody>
            {timeframe === 'all' && (
              <tr className="bg-slate-50 font-bold">
                <td className="p-3 border text-sm italic">Initial</td>
                <td className="p-3 border text-sm">System</td>
                <td className="p-3 border text-sm">Starting Fund</td>
                <td className="p-3 border text-sm text-right text-indigo-600">${startingBalance.toFixed(2)}</td>
              </tr>
            )}
            {filteredTransactions.map(t => (
              <tr key={t.id}>
                <td className="p-3 border text-sm">{t.date}</td>
                <td className="p-3 border text-sm">{t.category}</td>
                <td className="p-3 border text-sm italic">{t.comment}</td>
                <td className={`p-3 border text-sm font-bold text-right ${t.type === TransactionType.DEPOSIT ? 'text-green-600' : 'text-rose-600'}`}>
                  {t.type === TransactionType.DEPOSIT ? '+' : '-'} ${t.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-6 bg-slate-900/90 backdrop-blur-lg no-print animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl h-full md:h-[92vh] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-white gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Statement Builder</h3>
            <p className="text-sm font-medium text-slate-500">Review your savings progress</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => window.print()} 
              className="flex-1 md:flex-none px-8 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95 flex items-center justify-center space-x-3"
            >
              <Printer size={20} strokeWidth={3} />
              <span>Print</span>
            </button>
            <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition">
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-slate-50 p-6 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
             <div className="flex items-center space-x-3 shrink-0">
               <Filter size={18} className="text-indigo-600" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeframe:</span>
             </div>
             
             <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Time' },
                  { id: '7days', label: 'Last 7d' },
                  { id: '30days', label: 'Last 30d' },
                  { id: 'thisMonth', label: 'This Month' },
                  { id: 'custom', label: 'Custom' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTimeframe(opt.id as TimeframeOption)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      timeframe === opt.id 
                      ? 'bg-slate-900 text-white shadow-lg' 
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-slate-100/50 flex justify-center hide-scrollbar">
          <div className="bg-white p-8 md:p-16 rounded-[2.5rem] shadow-sm border border-slate-200 w-full max-w-4xl h-fit min-h-[11in]">
             
             <div className="flex flex-col md:flex-row justify-between items-start border-b-4 border-slate-900 pb-10 mb-12 gap-8">
              <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">Ryan's Savings</h1>
                <p className="text-slate-500 font-black text-xs uppercase tracking-widest mt-2">{timeframeLabel}</p>
              </div>
              <div className="bg-indigo-600 px-8 py-6 rounded-[2rem] shadow-xl shadow-indigo-100 min-w-[200px]">
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-1">Total Wealth</p>
                <p className="text-4xl font-black text-white">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="py-4 px-2 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                  <th className="py-4 px-2 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</th>
                  <th className="py-4 px-2 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</th>
                  <th className="py-4 px-2 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {timeframe === 'all' && (
                  <tr className="bg-indigo-50/30">
                    <td className="py-5 px-2 text-sm text-indigo-400 font-black uppercase italic">Initial</td>
                    <td className="py-5 px-2">
                      <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter bg-indigo-600 text-white">
                        SETUP
                      </span>
                    </td>
                    <td className="py-5 px-2 text-sm font-bold text-slate-900 flex items-center space-x-2">
                      <PiggyBank size={14} className="text-indigo-600" />
                      <span>Starting Fund</span>
                    </td>
                    <td className="py-5 px-2 text-base font-black text-right text-indigo-600">
                      ${startingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
                {filteredTransactions.map(t => (
                  <tr key={t.id}>
                    <td className="py-5 px-2 text-sm text-slate-500 font-medium">{t.date}</td>
                    <td className="py-5 px-2">
                      <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter bg-slate-100 text-slate-600">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-5 px-2 text-sm font-bold text-slate-900">{t.comment}</td>
                    <td className={`py-5 px-2 text-base font-black text-right ${t.type === TransactionType.DEPOSIT ? 'text-green-600' : 'text-rose-600'}`}>
                      {t.type === TransactionType.DEPOSIT ? '+' : '-'} ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
