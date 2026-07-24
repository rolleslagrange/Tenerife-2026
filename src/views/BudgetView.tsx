import { Plus, Trash2, Wallet, ArrowRightLeft } from "lucide-react";
import { useState, FormEvent } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Expense } from "../types";
import { cn, generateId } from "../lib/utils";

export default function BudgetView() {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('tenerife_expenses', []);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState<'Sergio' | 'Nerea'>('Sergio');

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const sergioSpent = expenses.filter(e => e.payer === 'Sergio' || !e.payer).reduce((sum, e) => sum + e.amount, 0);
  const nereaSpent = expenses.filter(e => e.payer === 'Nerea').reduce((sum, e) => sum + e.amount, 0);
  
  const halfTotal = totalSpent / 2;
  const sergioOwes = halfTotal - sergioSpent;
  const nereaOwes = halfTotal - nereaSpent;

  let debtMessage = "Cuentas saldadas";
  if (sergioOwes > 0.01) {
    debtMessage = `Sergio debe ${sergioOwes.toFixed(2)}€ a Nerea`;
  } else if (nereaOwes > 0.01) {
    debtMessage = `Nerea debe ${nereaOwes.toFixed(2)}€ a Sergio`;
  }

  const handleAddExpense = (e: FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    const newExpense: Expense = {
      id: generateId(),
      desc,
      amount: parseFloat(amount),
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      payer
    };

    setExpenses([newExpense, ...expenses]);
    setDesc('');
    setAmount('');
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mt-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">Presupuesto</h1>
        <p className="text-sm font-medium text-slate-500">Control de gastos durante el viaje</p>
      </div>

      {/* Budget Summary Card */}
      <div className="bg-[#1A1C1E] p-6 rounded-[2rem] text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div className="absolute -right-4 -top-4 opacity-5">
          <Wallet className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-4">Total Gastado</h3>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-5xl font-bold tracking-tighter text-white">
              {totalSpent.toFixed(2)}€
            </span>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur-sm border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <ArrowRightLeft className="w-5 h-5 text-orange-400" />
              <h4 className="text-sm font-bold text-slate-300">Balance de Cuentas</h4>
            </div>
            <p className="text-lg font-semibold text-white">
              {debtMessage}
            </p>
            <div className="flex justify-between mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-400">
              <span>Sergio: {sergioSpent.toFixed(2)}€</span>
              <span>Nerea: {nereaSpent.toFixed(2)}€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Expense */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
        <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-4">Añadir Gasto</h3>
        <form onSubmit={handleAddExpense} className="flex flex-col gap-4">
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setPayer('Sergio')}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-xl transition-all",
                payer === 'Sergio' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Sergio
            </button>
            <button
              type="button"
              onClick={() => setPayer('Nerea')}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-xl transition-all",
                payer === 'Nerea' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Nerea
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Concepto..." 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
            <div className="flex gap-3">
              <input 
                type="number" 
                placeholder="€" 
                step="0.01"
                className="w-full sm:w-28 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-bold text-slate-900"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
              <button type="submit" className="bg-orange-500 text-white rounded-2xl w-14 sm:w-12 flex items-center justify-center shrink-0 hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-200">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Expenses List */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
        <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-4">Historial</h3>
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              <p className="text-sm font-medium text-slate-400">Sin gastos registrados aún.</p>
            </div>
          ) : (
            expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{expense.desc}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      expense.payer === 'Sergio' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                    )}>
                      {expense.payer || 'Sergio'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{expense.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-red-500">-{expense.amount.toFixed(2)}€</span>
                  <button onClick={() => removeExpense(expense.id)} className="text-slate-300 hover:text-red-500 p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
    </div>
  );
}
