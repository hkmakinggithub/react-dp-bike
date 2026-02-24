import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { 
  ShoppingCart, ArrowUpRight, ArrowDownLeft, 
  Wrench, Receipt, Filter, FileText 
} from 'lucide-react';

const MasterReports = () => {
  // Default to Branch 1 if nothing selected
  const [selectedBranch, setSelectedBranch] = useState(localStorage.getItem('activeBranch') || '1');
  const [activeTab, setActiveTab] = useState('SALES');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [activeTab, selectedBranch]);

  const fetchReportData = async () => {
    setLoading(true);
    let endpoint = '';
    
    // MATCHING THE ROUTES
    switch (activeTab) {
      case 'SALES': endpoint = 'sales-history'; break;
      case 'JOB_PENDING': endpoint = 'pending-jobs'; break;
      case 'JOB_DONE': endpoint = 'completed-jobs'; break;
      case 'SUPP_PENDING': endpoint = 'supplier-pending'; break;
      case 'SUPP_DONE': endpoint = 'supplier-completed'; break;
      default: endpoint = 'sales-history';
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACK}/api/reports/${endpoint}`, {
        headers: { 'branch-id': selectedBranch }
      });
      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const renderHeaders = () => {
    const config = {
      SALES: ['Br.', 'Customer', 'Mobile', 'Model', 'Chassis', 'Amount', 'Payment'],
      JOB_PENDING: ['Br.', 'Job No', 'Date', 'Customer', 'Model', 'Status'],
      JOB_DONE: ['Br.', 'Bill No', 'Date', 'Customer', 'Total', 'Status'],
      SUPP_PENDING: ['Br.', 'Out No', 'Date', 'Supplier', 'Part', 'Fault'],
      SUPP_DONE: ['Br.', 'In No', 'Date', 'Supplier', 'Part', 'Resolution']
    };
    return config[activeTab].map((h, i) => (
      <th key={i} className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* HEADER */}
        <header className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full">
            <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
              <FileText className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 uppercase italic">Master Reports</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Audit Log</p>
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Filter By Branch</label>
            <select 
                value={selectedBranch} 
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full md:w-auto bg-white border-2 border-slate-200 p-2 rounded-xl font-bold text-xs outline-none focus:border-slate-800"
              >
                <option value="ALL">🏢 ALL BRANCHES</option>
                <option value="1">📍 Ahmedabad</option>
                <option value="2">📍 Gandhinagar</option>
                <option value="3">📍 Rajkot</option>
            </select>
          </div>
        </header>

        {/* TABS */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-4 no-scrollbar">
          {[
            { id: 'SALES', label: 'Vehicle Sales', icon: ShoppingCart },
            { id: 'JOB_PENDING', label: 'Open Jobs (Pending)', icon: Wrench },
            { id: 'JOB_DONE', label: 'Billed Jobs (Done)', icon: Receipt },
            { id: 'SUPP_PENDING', label: 'Returns (Pending)', icon: ArrowUpRight },
            { id: 'SUPP_DONE', label: 'Received (Done)', icon: ArrowDownLeft },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{renderHeaders()}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? <tr><td colSpan="8" className="p-12 text-center text-xs font-bold animate-pulse">LOADING DATA...</td></tr> : 
                 data.length === 0 ? <tr><td colSpan="8" className="p-12 text-center text-xs font-bold text-slate-400">NO RECORDS FOUND</td></tr> :
                 data.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-black text-indigo-600 text-xs">{item.branch_id}</td>
                    
                    {activeTab === 'SALES' && <>
                      <td className="p-4 font-bold text-slate-800 text-xs uppercase">{item.customer_name}</td>
                      <td className="p-4 text-xs font-bold text-slate-500">{item.mobile}</td>
                      <td className="p-4 text-xs text-slate-600">{item.model_name}</td>
                      <td className="p-4 text-[10px] font-mono text-slate-400">{item.chassis_no}</td>
                      <td className="p-4 font-black text-slate-900 text-xs">₹{item.price}</td>
                      <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[9px] font-black">{item.payment_method}</span></td>
                    </>}

                    {activeTab === 'JOB_PENDING' && <>
                      <td className="p-4 font-bold text-slate-700 text-xs">{item.job_no}</td>
                      <td className="p-4 text-xs text-slate-500">{item.job_date?.split('T')[0]}</td>
                      <td className="p-4 font-bold text-slate-800 text-xs uppercase">{item.customer_name}</td>
                      <td className="p-4 text-xs text-slate-600">{item.model_name}</td>
                      <td className="p-4"><span className="bg-amber-100 text-amber-600 px-2 py-1 rounded text-[9px] font-black uppercase">Pending</span></td>
                    </>}

                    {activeTab === 'JOB_DONE' && <>
                      <td className="p-4 font-bold text-violet-600 text-xs">{item.out_no}</td>
                      <td className="p-4 text-xs text-slate-500">{item.out_date?.split('T')[0]}</td>
                      <td className="p-4 font-bold text-slate-800 text-xs uppercase">{item.customer_name}</td>
                      <td className="p-4 font-black text-emerald-600 text-sm">₹{item.grand_total}</td>
                      <td className="p-4"><span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded text-[9px] font-black uppercase">Paid</span></td>
                    </>}

                    {activeTab === 'SUPP_PENDING' && <>
                      <td className="p-4 font-bold text-slate-700 text-xs">{item.outward_no}</td>
                      <td className="p-4 text-xs text-slate-500">{item.outward_date?.split('T')[0]}</td>
                      <td className="p-4 font-bold text-slate-800 text-xs uppercase">{item.supplier_name}</td>
                      <td className="p-4 text-xs text-slate-600">{item.part_name}</td>
                      <td className="p-4 text-[10px] text-red-500 font-bold italic truncate max-w-[150px]">"{item.fault}"</td>
                    </>}

                     {activeTab === 'SUPP_DONE' && <>
                      <td className="p-4 font-bold text-slate-700 text-xs">{item.outward_no}</td>
                      <td className="p-4 text-xs text-slate-500">{item.inward_date?.split('T')[0]}</td>
                      <td className="p-4 font-bold text-slate-800 text-xs uppercase">{item.supplier_name}</td>
                      <td className="p-4 text-xs text-slate-600">{item.part_name}</td>
                      <td className="p-4"><span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-[9px] font-black uppercase">{item.result_type}</span></td>
                    </>}
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

export default MasterReports;