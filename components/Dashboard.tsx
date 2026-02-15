
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType, ChartDataPoint } from '../types';
import { Sparkles, RefreshCw, ArrowUpRight } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  balance: number;
  startingBalance: number;
  aiInsight: string;
  onRefreshInsight: () => void;
  isLoadingInsight: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, balance, startingBalance, aiInsight, onRefreshInsight, isLoadingInsight }) => {
  const chartData = useMemo(() => {
    // If no transactions, still show the starting balance line
    if (transactions.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      return [
        { date: yesterday, balance: startingBalance },
        { date: today, balance: startingBalance }
      ];
    }

    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = startingBalance;
    const data: ChartDataPoint[] = [];

    // Map by date
    const dailyMap = new Map<string, number>();
    sortedTransactions.forEach(t => {
      const amount = t.type === TransactionType.DEPOSIT ? t.amount : -t.amount;
      dailyMap.set(t.date, (dailyMap.get(t.date) || 0) + amount);
    });

    const sortedDates = Array.from(dailyMap.keys()).sort();
    
    // Initial starting point (day before first transaction)
    const firstDate = new Date(sortedDates[0]);
    const prevDate = new Date(firstDate);
    prevDate.setDate(firstDate.getDate() - 1);
    data.push({ 
      date: prevDate.toISOString().split('T')[0], 
      balance: startingBalance 
    });

    sortedDates.forEach(date => {
      runningBalance += dailyMap.get(date)!;
      data.push({ date, balance: runningBalance });
    });

    return data;
  }, [transactions, startingBalance]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Visual Progress Card */}
      <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Total Progress</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Savings over time</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-2xl">
            <ArrowUpRight size={20} className="text-indigo-600" />
          </div>
        </div>
        
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15}/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#cbd5e1', fontSize: 10, fontWeight: 700}}
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#cbd5e1', fontSize: 10, fontWeight: 700}}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip 
                contentStyle={{
                  borderRadius: '24px', 
                  border: 'none', 
                  padding: '16px',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                  fontWeight: 800
                }}
                itemStyle={{ color: '#4f46e5' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Wealth']}
              />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#4f46e5" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorBalance)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Intelligence Section */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] flex flex-col justify-between text-white shadow-2xl shadow-slate-900/20">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Sparkles size={16} fill="white" />
              </div>
              <h3 className="text-lg font-black tracking-tight uppercase">Smart Tips</h3>
            </div>
            <button 
              onClick={onRefreshInsight} 
              disabled={isLoadingInsight || transactions.length === 0}
              className={`p-2.5 rounded-full transition-all ${isLoadingInsight ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'} disabled:opacity-20`}
            >
              <RefreshCw size={18} className={isLoadingInsight ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="min-h-[160px] relative">
            {aiInsight ? (
              <div className="text-sm font-medium leading-relaxed text-slate-300 bg-slate-800/50 p-6 rounded-3xl border border-white/5 whitespace-pre-wrap">
                {aiInsight}
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <p className="text-slate-500 text-sm font-bold">Needs more activity to build your financial profile.</p>
                <button 
                  onClick={onRefreshInsight}
                  disabled={transactions.length === 0}
                  className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg transition active:scale-95 disabled:bg-slate-800 disabled:text-slate-600"
                >
                  Analyze Habits
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800">
           <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mastery Progress</p>
              <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-md uppercase">Novice</span>
           </div>
           <div className="flex justify-between items-end mb-3">
              <span className="text-2xl font-black">${balance.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-500">Next Milestone: $1k</span>
           </div>
           <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                style={{ width: `${Math.min((balance / 1000) * 100, 100)}%` }}
              ></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
