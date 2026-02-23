import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Search, ClipboardList, Clock, CheckCircle2, ListFilter } from 'lucide-react';

const ServiceJobList = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // NEW: Filter State
  const activeBranch = localStorage.getItem('activeBranch') || '1';

  useEffect(() => { fetchJobs(); }, [activeBranch]);

  const fetchJobs = async () => { 
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/service-jobs', {
        headers: { 'branch-id': activeBranch,Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Fetch error:", err); }
  };

  // 🔍 COMBINED FILTER: Search + Status Toggle
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
                         (job.job_no || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || job.job_status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-12 font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tighter">
              <ClipboardList className="text-blue-600" size={36} /> SERVICE MASTER REPORT
            </h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Real-time Job Tracking System</p>
          </div>

          {/* 🔘 FILTER BUTTON GROUP */}
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            {['ALL', 'PENDING', 'DONE'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2 rounded-lg text-[10px] font-black transition-all tracking-widest ${
                  filterStatus === status 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </header>

        {/* 🔍 Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="SEARCH BY NAME OR JOB ID..." 
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold uppercase text-xs tracking-wider"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
          <table className="w-full text-left">
            <thead className="bg-[#0f172a] text-white text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="p-6">Job Identifiers</th>
                <th className="p-6">Customer Details</th>
                <th className="p-6">Current Status</th>
                <th className="p-6 text-right">Final Billing</th>
              </tr>
            </thead>
           

<tbody className="divide-y divide-slate-100">
  {filteredJobs.map((job) => (
    <tr key={job.job_no} className="hover:bg-slate-50/50 transition-colors group">
      <td className="p-6">
        <div className="font-black text-blue-600 text-sm group-hover:scale-105 transition-transform origin-left inline-block">
          {job.job_no}
        </div>
        <div className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-tighter">
          Registered: {new Date(job.job_date).toLocaleDateString('en-GB')}
        </div>
      </td>

      <td className="p-6">
        <div className="font-black text-slate-800 uppercase text-sm">{job.customer_name}</div>
        <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">
           {job.model_name} <span className="mx-1">|</span> {job.mobile}
        </div>
        {/* 📟 SERIAL NUMBER DISPLAY */}
        <div className="mt-2 space-y-1">
          <div className="text-[9px] font-bold text-slate-400">
            OLD SN: <span className="text-red-500">{job.part_serial || 'N/A'}</span>
          </div>
          {job.job_status === 'DONE' && job.result_type === 'REPLACE' && (
            <div className="text-[9px] font-bold text-slate-400">
              NEW SN: <span className="text-emerald-600">{job.final_serial_no || 'N/A'}</span>
            </div>
          )}
        </div>
      </td>

      <td className="p-6">
        <div className="flex items-center gap-2">
          {job.job_status === 'DONE' ? (
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 border border-emerald-200">
              <CheckCircle2 size={12}/> COMPLETED
            </span>
          ) : (
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 border border-amber-200">
              <Clock size={12}/> IN-PROGRESS
            </span>
          )}
          {job.is_warranty === 'YES' && (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-[8px] font-black">WARRANTY</span>
          )}
        </div>
        <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter truncate max-w-[180px]">
          {job.selected_services}
        </div>
        {/* Display Resolution Type if Done */}
        {job.job_status === 'DONE' && (
           <div className="mt-1 text-[9px] font-black text-blue-500 uppercase tracking-widest">
             Result: {job.result_type}
           </div>
        )}
      </td>

      <td className="p-6 text-right">
        <div className="text-[9px] font-black text-slate-300 uppercase mb-1">Grand Total</div>
        <div className="text-lg font-black text-slate-900 tracking-tighter">
          ₹{job.job_status === 'DONE' ? job.outward_charges : job.total_amount}
        </div>
      </td>
    </tr>
  ))}
</tbody>
          </table>
          
          {filteredJobs.length === 0 && (
            <div className="p-20 text-center bg-white">
              <ListFilter size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No matching jobs found in this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceJobList;