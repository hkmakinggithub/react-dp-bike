import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { IndianRupee, PlusCircle, Coffee, Flashlight, Users, Truck, Wrench } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';

const Expenses = () => {
  const activeBranch = localStorage.getItem('activeBranch') || '1';
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    amount: '',
    description: ''
  });

  const categories = [
    { name: 'Shop Rent', icon: <Users size={14}/> },
    { name: 'Electricity Bill', icon: <Flashlight size={14}/> },
    { name: 'Staff Salary', icon: <Users size={14}/> },
    { name: 'Tea & Snacks', icon: <Coffee size={14}/> },
    { name: 'Transport / Freight', icon: <Truck size={14}/> },
    { name: 'Shop Maintenance', icon: <Wrench size={14}/> },
    { name: 'Other', icon: <PlusCircle size={14}/> },
  ];

  useEffect(() => {
    fetchExpenses();
  }, [activeBranch]);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${process.env.BACK}/api/expenses/list`, {
        headers: { 'branch-id': activeBranch }
      });
      const data = await res.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) { toast.error("Failed to load expenses"); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.amount) return toast.warn("Fill all required fields!");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.BACK}/api/expenses/add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'branch-id': activeBranch
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success("Expense Recorded! 💸");
        setFormData({ ...formData, amount: '', description: '', category: '' });
        fetchExpenses(); // Refresh List
      } else {
        toast.error("Failed to save expense.");
      }
    } catch (err) { toast.error("Server Error"); }
    finally { setLoading(false); }
  };

  // ✅ CALCULATE TOTAL EXPENSES HERE
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="max-w-6xl mx-auto p-4 md:p-6 mt-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- ADD EXPENSE FORM --- */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 h-fit">
          <h2 className="text-xl font-black text-slate-800 uppercase italic mb-6 flex items-center gap-2">
            <IndianRupee className="text-red-500"/> Log Expense
          </h2>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-red-500" required />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-red-500" required>
                <option value="">-- Select --</option>
                {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (₹)</label>
              <input type="number" placeholder="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-red-50 border-2 border-red-100 p-3 rounded-xl font-black text-xl text-red-600 outline-none focus:border-red-500" required />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Details / Note</label>
              <textarea placeholder="e.g., Snacks for customers..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl font-medium text-sm text-slate-700 outline-none focus:border-red-500" rows="3"></textarea>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-red-700 transition-all mt-4">
              {loading ? "SAVING..." : "SAVE EXPENSE"}
            </button>
          </form>
        </div>

        {/* --- EXPENSE HISTORY TABLE --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
          
          {/* ✅ HEADER WITH TOTAL BADGE */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Recent Expenses</h2>
            <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-xl flex items-center gap-3">
              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Total Spent</span>
              <span className="text-xl font-black text-red-600">₹{totalExpenses.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Note</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {expenses.length === 0 ? (
                  <tr><td colSpan="4" className="p-10 text-center text-xs font-bold text-slate-400 uppercase">No Expenses Found</td></tr>
                ) : (
                  expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-xs font-bold text-slate-500">{exp.expense_date.split('T')[0]}</td>
                      <td className="p-4 text-xs font-black text-slate-700 uppercase">{exp.category}</td>
                      <td className="p-4 text-xs font-medium text-slate-500 max-w-[200px] truncate">{exp.description || '-'}</td>
                      <td className="p-4 text-sm font-black text-red-600 text-right">₹{exp.amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {/* ✅ GRAND TOTAL ROW AT BOTTOM */}
              {expenses.length > 0 && (
                <tfoot className="bg-slate-800 text-white">
                  <tr>
                    <td colSpan="3" className="p-4 text-xs font-black uppercase tracking-widest text-right">
                      Grand Total:
                    </td>
                    <td className="p-4 text-lg font-black text-red-400 text-right">
                      ₹{totalExpenses.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Expenses;