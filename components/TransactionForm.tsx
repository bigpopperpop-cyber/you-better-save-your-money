
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, AccountType } from '../types';
import { X, Save, AlertCircle, DollarSign, Plus } from 'lucide-react';

interface TransactionFormProps {
  onClose: () => void;
  onSubmit: (t: Transaction) => void;
  onDeleteCategory: (cat: string) => void;
  categories: string[];
  initialData: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, onSubmit, onDeleteCategory, categories, initialData }) => {
  const [formData, setFormData] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    amount: undefined,
    type: TransactionType.DEPOSIT,
    account: AccountType.SAVINGS,
    comment: '',
    category: 'Other'
  });

  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = [];
    if (!formData.amount || formData.amount <= 0) newErrors.push("How much money?");
    if (!formData.comment?.trim()) newErrors.push("What was it for?");
    
    let finalCategory = formData.category;
    if (isCustomCategoryMode) {
      if (!customCategoryInput.trim()) {
        newErrors.push("Give your new category a name.");
      } else {
        finalCategory = customCategoryInput.trim();
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const transaction: Transaction = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      date: formData.date as string,
      amount: Number(formData.amount),
      type: formData.type as TransactionType,
      account: AccountType.SAVINGS,
      comment: (formData.comment as string).trim(),
      category: finalCategory as string,
    };

    onSubmit(transaction);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-xl md:rounded-t-[3rem] rounded-t-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full duration-500 ease-out pb-safe">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2"></div>

        <div className="relative px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
            {initialData ? 'Update Item' : 'Add to Savings'}
          </h3>
          <button onClick={onClose} className="p-3 bg-slate-100 text-slate-500 rounded-full ios-tap">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-10 space-y-8 max-h-[85vh] overflow-y-auto hide-scrollbar">
          {errors.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center space-x-3 text-rose-700 text-[11px] font-black uppercase">
              <AlertCircle size={20} />
              <span>{errors[0]}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-900 font-black text-4xl">$</span>
              <input 
                type="number" 
                inputMode="decimal"
                step="0.01" 
                value={formData.amount || ''} 
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})} 
                className="w-full pl-14 pr-6 py-8 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-indigo-500 focus:bg-white outline-none text-5xl font-black text-slate-900 transition-all placeholder:text-slate-200" 
                placeholder="0.00" 
              />
            </div>
          </div>

          <div className="flex bg-slate-100 p-2 rounded-[2rem] border border-slate-200">
            <button type="button" onClick={() => setFormData({...formData, type: TransactionType.DEPOSIT})} className={`flex-1 py-5 text-xs font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-300 ios-tap ${formData.type === TransactionType.DEPOSIT ? 'bg-white shadow-md text-green-600' : 'text-slate-400'}`}>Deposit (+)</button>
            <button type="button" onClick={() => setFormData({...formData, type: TransactionType.WITHDRAWAL})} className={`flex-1 py-5 text-xs font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-300 ios-tap ${formData.type === TransactionType.WITHDRAWAL ? 'bg-white shadow-md text-rose-600' : 'text-slate-400'}`}>Withdraw (-)</button>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category (Tap to select, 'X' to remove)</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <div key={cat} className="relative group">
                  <button 
                    type="button" 
                    onClick={() => { setIsCustomCategoryMode(false); setFormData({...formData, category: cat}); }} 
                    className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all border ios-tap h-full flex items-center justify-center text-center px-2 ${
                      !isCustomCategoryMode && formData.category === cat 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                      : 'bg-white border-slate-100 text-slate-500 shadow-sm'
                    }`}
                  >
                    {cat}
                  </button>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); onDeleteCategory(cat); }}
                    className={`absolute -top-1.5 -right-1.5 p-2 rounded-full shadow-lg ios-tap z-10 ${
                       !isCustomCategoryMode && formData.category === cat ? 'bg-indigo-800 text-white' : 'bg-rose-500 text-white'
                    }`}
                  >
                    <X size={10} strokeWidth={4} />
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => setIsCustomCategoryMode(true)} 
                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all border flex items-center justify-center space-x-1 ios-tap ${
                  isCustomCategoryMode ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <Plus size={14} strokeWidth={3} />
                <span>New</span>
              </button>
            </div>
            
            {isCustomCategoryMode && (
              <input 
                type="text" 
                value={customCategoryInput} 
                onChange={(e) => setCustomCategoryInput(e.target.value)} 
                className="w-full px-6 py-5 bg-white border-2 border-indigo-500 rounded-2xl outline-none font-bold text-base mt-2" 
                placeholder="Type new category..." 
                autoFocus 
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <input type="text" value={formData.comment} onChange={(e) => setFormData({...formData, comment: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-base transition-all" placeholder="e.g. Allowance from Grandma" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
            <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-base transition-all" />
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white font-black uppercase tracking-widest py-6 rounded-[2rem] flex items-center justify-center space-x-3 shadow-2xl shadow-slate-200 ios-tap">
            <Save size={24} strokeWidth={3} />
            <span>Save Entry</span>
          </button>
          
          <div className="h-6"></div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
