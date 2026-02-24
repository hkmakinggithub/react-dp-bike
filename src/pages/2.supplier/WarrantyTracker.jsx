import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Search, Clock, CheckCircle, ArrowRightLeft } from 'lucide-react';

const WarrantyReport = () => {
  const [masterList, setMasterList] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const activeBranch = localStorage.getItem('activeBranch') || '1';

  useEffect(() => {
    fetchMasterData();
  }, [activeBranch]);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`${import.meta.env.VITE_BACK}/api/warranty-master`, {
        method: 'GET',
        headers: { 
          'branch-id': activeBranch,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Warranty Data:", data);
      setMasterList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching warranty report:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = masterList.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesSearch = 
      (item.supplier_name || '').toLowerCase().includes(q) || 
      (item.outward_no || '').toLowerCase().includes(q) ||
      (item.old_serial || '').toLowerCase().includes(q) ||
      (item.new_serial || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = masterList.filter(i => i.status === 'PENDING').length;
  const doneCount = masterList.filter(i => i.status === 'DONE').length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* --- TOP HEADER & FILTERS --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Warranty Tracking Report</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sent vs Received Reconciliation</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            {['ALL', 'PENDING', 'DONE'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                  filterStatus === status ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-300" size={20} />
            <input 
              type="text" 
              placeholder="Search by Supplier, Part, or Outward No..." 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-teal-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* --- ERROR MESSAGE --- */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* --- QUICK SUMMARY STATS --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Sent</p>
            <p className="text-2xl font-black text-slate-800">{masterList.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Pending</p>
            <p className="text-2xl font-black text-amber-500">{pendingCount}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Done</p>
            <p className="text-2xl font-black text-emerald-500">{doneCount}</p>
          </div>
        </div>

        {/* --- LOADING STATE --- */}
        {loading ? (
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="font-black text-slate-400 uppercase tracking-[0.2em] text-xs">Loading warranty data...</p>
          </div>
        ) : (
          /* --- MAIN REPORT TABLE --- */
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest">Sent (Outward)</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest">Part Description</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center">Live Status</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest">Back (Inward)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.length > 0 ? (
                    filteredData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-5">
                          <div className="text-teal-600 font-black text-xs">#{item.outward_no}</div>
                          <div className="text-slate-400 text-[10px] font-bold mt-1">
                            {item.outward_date ? new Date(item.outward_date).toLocaleDateString('en-IN') : '-'}
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="font-black text-slate-800 uppercase text-sm leading-tight">{item.supplier_name}</div>
                          <div className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-tight">
                            {item.part_name} <span className="text-slate-300 mx-1">|</span> SN: {item.old_serial}
                          </div>
                        </td>
                        <td className="p-5 text-center">
                          <span className={`px-4 py-2 rounded-full text-[10px] font-black tracking-[0.1em] flex items-center justify-center gap-2 mx-auto w-32 border-2 ${
                            item.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            {item.status === 'PENDING' ? <Clock size={12} /> : <CheckCircle size={12} />}
                            {item.status}
                          </span>
                        </td>
                        <td className="p-5">
                          {item.status === 'DONE' ? (
                            <div className="animate-in fade-in slide-in-from-right-2">
                              <div className="text-slate-800 font-black text-[10px] uppercase tracking-wider bg-slate-100 px-2 py-1 rounded inline-block mb-1">
                                {item.result_type || 'RECEIVED'}
                              </div>
                              <div className="text-slate-600 text-xs font-bold">New SN: {item.new_serial || 'SAME'}</div>
                              <div className="text-slate-400 text-[10px] font-medium italic mt-0.5">
                                Rec'd: {item.inward_date ? new Date(item.inward_date).toLocaleDateString('en-IN') : '-'}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-300 italic text-[10px] font-bold uppercase tracking-widest">
                              <ArrowRightLeft size={14} className="animate-pulse" /> Awaiting Part...
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-20 text-center font-black text-slate-300 uppercase tracking-[0.2em] text-xs">
                        No matching records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarrantyReport;