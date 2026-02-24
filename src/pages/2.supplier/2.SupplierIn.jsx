import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Save, Search, CheckCircle, Clock, ArrowLeftRight, List, ChevronDown, ChevronUp } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SupplierInward = () => {
  // --- 1. BRANCH CONTEXT ---
  const activeBranch = localStorage.getItem('activeBranch') || '1';

  // --- HISTORY STATES ---
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('');

  // --- FORM STATES ---
  const [pendingList, setPendingList] = useState([]);
  const [selectedOutward, setSelectedOutward] = useState(null); 
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    outwardNo: '',
    resultType: 'REPAIR', 
    newSerialNo: ''
  });

  // --- 2. LOAD PENDING ITEMS ---
  useEffect(() => {
    fetchPending();
  }, [activeBranch]);

  const fetchPending = async () => {
    try {
      // 🚨 FIXED URL to match apiRoutes.js
      const res = await fetch(`${import.meta.env.VITE_BACK}/api/pending-supplier-outwards`, {
        headers: { 'branch-id': activeBranch }
      });
      const data = await res.json();
      setPendingList(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error("Error loading pending list"); 
      toast.error("Failed to load pending returns");
    }
  };

  // --- 3. FETCH HISTORY REPORT ---
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      // 🚨 FIXED URL: Used warranty-master as it has the joined inward/outward data
      const res = await fetch(`${import.meta.env.VITE_BACK}/api/warranty-master`, {
        headers: { 'branch-id': activeBranch }
      });
      const data = await res.json();
      setHistoryList(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleHistory = () => {
    if (!showHistory && historyList.length === 0) fetchHistory(); 
    setShowHistory(!showHistory);
  };

  // --- 4. HANDLERS ---
  const handleSelectOutward = (e) => {
    const outNo = e.target.value;
    const fullData = pendingList.find(item => item.outward_no === outNo);
    
    setFormData({ ...formData, outwardNo: outNo, newSerialNo: '' });
    setSelectedOutward(fullData || null); 
  };

  const handleSave = async () => {
    if (!formData.outwardNo) return toast.warn("⚠️ SELECT OUTWARD NO");
    
    const finalSerial = formData.resultType === 'REPLACE' 
      ? formData.newSerialNo 
      : selectedOutward?.part_serial; 

    if (formData.resultType === 'REPLACE' && !finalSerial) {
      return toast.warn("⚠️ ENTER NEW SERIAL NUMBER");
    }

    setIsSaving(true);
    try {
      const payload = {
        date: formData.date,
        outwardNo: formData.outwardNo,
        supplierName: selectedOutward.supplier_name,
        partName: selectedOutward.part_name,
        resultType: formData.resultType,
        finalSerialNo: finalSerial
      };

      // 🚨 FIXED URL to match apiRoutes.js
      const res = await fetch(`${import.meta.env.VITE_BACK}/api/save-supplier-inward`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'branch-id': activeBranch 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("✅ INWARD SAVED! CASE CLOSED.");
        setFormData({ ...formData, outwardNo: '', newSerialNo: '', resultType: 'REPAIR' });
        setSelectedOutward(null);
        fetchPending(); 
        if (showHistory) fetchHistory(); 
      } else {
        const errData = await res.json();
        toast.error("Save Failed: " + (errData.error || errData.message));
      }
    } catch (err) { 
        toast.error("Server Connection Failed"); 
    } finally { 
        setIsSaving(false); 
    }
  };

  // --- 5. HISTORY FILTERS ---
  const filteredHistory = historyList.filter((item) => {
    const query = searchQuery.toLowerCase();
    const supplier = (item.supplier_name || '').toLowerCase();
    const part = (item.part_name || '').toLowerCase();
    const outNo = (item.outward_no || '').toString().toLowerCase();
    
    const matchesText = supplier.includes(query) || part.includes(query) || outNo.includes(query);

    let matchesDate = true;
    if (searchDate) {
      const rawDate = item.inward_date || item.outward_date;
      const dateStr = rawDate ? rawDate.toString().split('T')[0] : '';
      matchesDate = (dateStr === searchDate);
    }

    return matchesText && matchesDate;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
        
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 italic uppercase">Supplier Inward</h1>
            <p className="text-slate-500 font-bold flex items-center gap-2">
              <ArrowLeftRight size={16} /> Receive parts back from company
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200 mt-4 md:mt-0 font-black">
            <Clock size={18} /> {pendingList.length} Pending
          </div>
        </header>

        {/* --- MAIN FORM CARD --- */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 mb-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Receive Date</label>
              <input 
                type="date" name="date" value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})} 
                className="w-full border-2 border-slate-100 p-3 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-700 font-bold transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Pending Outward</label>
              <select 
                name="outwardNo" value={formData.outwardNo} onChange={handleSelectOutward} 
                className="w-full border-2 border-slate-100 p-3 rounded-xl bg-slate-50 focus:outline-none focus:border-emerald-500 text-slate-700 font-bold transition-all appearance-none cursor-pointer"
              >
                <option value="">-- SELECT PENDING RECORD --</option>
                {pendingList.map((item) => (
                  <option key={item.id} value={item.outward_no}>
                    {item.outward_no} - {item.supplier_name} ({item.part_name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DYNAMIC SELECTED DATA DISPLAY */}
          {selectedOutward && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Outward Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Part Name</p>
                  <p className="font-black text-slate-800">{selectedOutward.part_name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Sent Serial</p>
                  <p className="font-black text-slate-800">{selectedOutward.part_serial || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Sent Date</p>
                  <p className="font-black text-slate-800">{new Date(selectedOutward.outward_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Customer Job Ref</p>
                  <p className="font-black text-emerald-600">{selectedOutward.job_card_ref || 'N/A'}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Reported Fault</p>
                  <p className="font-bold text-slate-600 text-sm">{selectedOutward.fault || 'No fault description'}</p>
              </div>
            </div>
          )}

          <div className="space-y-6 mb-10">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Resolution from Company</label>
              <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                {['REPAIR', 'REPLACE', 'REJECT'].map((opt) => (
                  <button 
                    key={opt} 
                    onClick={() => setFormData({ ...formData, resultType: opt })} 
                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
                      formData.resultType === opt 
                        ? opt === 'REJECT' ? 'bg-red-500 text-white shadow-lg' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                        : 'text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {opt === 'REPAIR' ? 'REPAIRED' : opt === 'REPLACE' ? 'REPLACED (NEW)' : 'REJECTED'}
                  </button>
                ))}
              </div>
            </div>

            {formData.resultType === 'REPLACE' && (
              <div className="space-y-2 animate-in zoom-in-95 duration-200">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">New Part Serial No</label>
                <input 
                  type="text" name="newSerialNo" value={formData.newSerialNo} 
                  onChange={(e) => setFormData({...formData, newSerialNo: e.target.value.toUpperCase()})} 
                  placeholder="ENTER NEW SERIAL NUMBER..." 
                  className="w-full border-2 border-emerald-100 p-4 rounded-xl text-emerald-900 font-black focus:outline-none focus:border-emerald-500 bg-emerald-50 uppercase placeholder:text-emerald-300" 
                />
              </div>
            )}
          </div>

          <button 
            onClick={handleSave} 
            disabled={isSaving || !formData.outwardNo} 
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg ${
              isSaving || !formData.outwardNo ? 'bg-slate-300 cursor-not-allowed text-white' : 'bg-slate-900 text-white hover:bg-black shadow-slate-900/20'
            }`}
          >
            {isSaving ? "Closing Case..." : <><CheckCircle size={20} /> Mark as Received</>}
          </button>
        </div>

        {/* ========================================= */}
        {/* --- FOOTER: VIEW INWARD REPORT TABLE ---- */}
        {/* ========================================= */}
        <div className="max-w-full mx-auto">
          <button 
            type="button" onClick={toggleHistory}
            className="w-full py-4 bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-slate-900 transition-all flex justify-center items-center gap-3"
          >
            <List size={20} />
            {showHistory ? "HIDE REPORT" : "VIEW COMPANY WARRANTY REPORT"}
            {showHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showHistory && (
            <div className="mt-6 bg-white p-6 rounded-[2rem] shadow-xl border border-slate-200 animate-fade-in-up w-full">
              
              <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={20} className="text-slate-400" />
                  </div>
                  <input
                    type="text" placeholder="Search Supplier, Part, or Outward No..."
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="relative md:w-64">
                  <input
                    type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-emerald-500 transition-colors"
                  />
                  {searchDate && (
                    <button 
                      onClick={() => setSearchDate('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-colors"
                    >Clear</button>
                  )}
                </div>
              </div>

              <div className="w-full overflow-x-auto overflow-y-auto max-h-[400px] rounded-xl border border-slate-100 shadow-inner">
                <table className="w-full text-left whitespace-nowrap min-w-max">
                  <thead className="bg-slate-900 text-white sticky top-0 z-10 shadow-md">
                    <tr>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest">Outward No</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest">Supplier</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest">Part Name</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest">Old Serial</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest">Status</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest">Resolution</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest">New Serial</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-slate-100">
                    {loadingHistory ? (
                      <tr><td colSpan="7" className="p-10 text-center font-bold text-slate-400 animate-pulse">Loading Report...</td></tr>
                    ) : filteredHistory.length === 0 ? (
                      <tr><td colSpan="7" className="p-10 text-center font-bold text-slate-400">No records found.</td></tr>
                    ) : (
                      filteredHistory.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-xs font-black text-slate-700">{item.outward_no || '-'}</td>
                        <td className="p-4 text-xs font-bold text-slate-800 uppercase">{item.supplier_name || '-'}</td>
                        <td className="p-4 text-xs font-bold text-slate-500">{item.part_name || '-'}</td>
                        <td className="p-4 text-xs font-medium text-slate-500">{item.old_serial || '-'}</td>
                        <td className="p-4 text-xs font-bold">
                           <span className={item.status === 'DONE' ? 'text-emerald-600 bg-emerald-50 px-2 py-1 rounded' : 'text-orange-500 bg-orange-50 px-2 py-1 rounded'}>
                              {item.status || 'PENDING'}
                           </span>
                        </td>
                        <td className="p-4 text-xs font-black text-slate-700">{item.result_type || '-'}</td>
                        <td className="p-4 text-xs font-black text-emerald-600">{item.new_serial || '-'}</td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SupplierInward;