
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { Edit3, Trash2, Search, Calendar, Star } from 'lucide-react';

interface LedgerProps {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}

const Ledger: React.FC<LedgerProps> = ({ transactions, onEdit, onDelete, isReadOnly = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = t.comment.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getCategoryColor = (cat: string) => {
    const normalized = cat.toLowerCase();
    if (normalized.includes('food')) return 'bg-orange-100 text-orange-700';
    if (normalized.includes('game')) return 'bg-purple-100 text-purple-700';
    if (normalized.includes('save') || normalized.includes('goal')) return 'bg-green-100 text-green-700';
    if (normalized.includes('allowance')) return 'bg-indigo-100 text-indigo-700';
    if (normalized.includes('gift')) return 'bg-pink-100 text-pink-700';
    if (normalized.includes('chore')) return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-600 border border-slate-200';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none w-full text-base font-medium"
            />
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
             {['all', TransactionType.DEPOSIT, TransactionType.WITHDRAWAL].map((opt) => (
               <button 
                 key={opt}
                 onClick={() => setFilterType(opt)}
                 className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ios-tap ${filterType === opt ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
               >
                 {opt === 'all' ? 'All' : opt === TransactionType.DEPOSIT ? 'Income' : 'Spent'}
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
          <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col space-y-2">
                <span className={`w-fit px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${getCategoryColor(t.category)}`}>
                  {t.category}
                </span>
                <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none">{t.comment}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t.date}</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-black tracking-tighter ${t.type === TransactionType.DEPOSIT ? 'text-green-600' : 'text-rose-600'}`}>
                  {t.type === TransactionType.DEPOSIT ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            {!isReadOnly && (
              <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                <button 
                  onClick={() => onEdit(t)}
                  className="flex-1 flex items-center justify-center space-x-2 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest ios-tap border border-slate-100"
                >
                  <Edit3 size={16} />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => onDelete(t.id)}
                  className="flex-1 flex items-center justify-center space-x-2 py-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest ios-tap border border-rose-100"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )) : (
          <div className="py-20 text-center space-y-4">
            <div className="inline-flex p-8 bg-slate-100 rounded-full">
              <Search size={32} className="text-slate-200" />
            </div>
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Nothing found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ledger;
