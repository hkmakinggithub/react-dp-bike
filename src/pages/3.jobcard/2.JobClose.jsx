import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Save, Search, CheckCircle, DollarSign } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomerOutward = () => {
  const activeBranch = localStorage.getItem('activeBranch') || '1';

  const [pendingList, setPendingList] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null); 
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    inwardNo: '',
    resultType: 'REPAIR',
    newSerialNo: '',
    charges: ''
  });

  useEffect(() => {
    fetchPending();
  }, [activeBranch]);

  const fetchPending = async () => {
    try {
      const res = await fetch(`${process.env.BACK}/api/pending-jobcards`, {
        method: 'GET',
        headers: { 
          'branch-id': activeBranch,
          'Content-Type': 'application/json'
        }
      }); 
      const data = await res.json();
      // Ensure we are getting an array
      setPendingList(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error("Error loading pending jobs"); 
      toast.error("Could not load pending jobs");
    }
  };

  const handleSelectJob = (e) => {
    const inNo = e.target.value;
    // Search by the correct field name coming from backend
    const fullData = pendingList.find(item => item.inward_no === inNo);
    
    setFormData({ ...formData, inwardNo: inNo });
    setSelectedJob(fullData || null); 
  };

  const handleSave = async () => {
    if (!formData.inwardNo) return toast.warn("PLEASE SELECT A PENDING JOB");
    
    // Use part_serial if it exists, otherwise use 'SAME'
    const finalSerial = formData.resultType === 'REPLACE' 
      ? formData.newSerialNo 
      : (selectedJob?.part_serial || 'N/A'); 

    if (formData.resultType === 'REPLACE' && !formData.newSerialNo) {
      return toast.warn("ENTER NEW SERIAL NUMBER");
    }

    setIsSaving(true);
    try {
      const payload = {
        date: formData.date,
        inwardNo: formData.inwardNo,
        customerName: selectedJob.customer_name,
        partName: selectedJob.part_name, // This is your 'selected_services' from backend
        resultType: formData.resultType,
        partSerial: formData.partSerial,
        finalSerialNo: finalSerial,
        charges: formData.charges || 0
      };

      const res = await fetch(`${process.env.BACK}/api/save-cust-outward`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'branch-id': activeBranch
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("✅ JOB CLOSED & DELIVERED!");
        setFormData({ 
          date: new Date().toISOString().split('T')[0],
          inwardNo: '', resultType: 'REPAIR', newSerialNo: '', charges: '' 
        });
        setSelectedJob(null);
        fetchPending(); // Refresh the dropdown
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Save Failed");
      }
    } catch (err) { 
      toast.error("Server Connection Error"); 
    } finally { 
      setIsSaving(false); 
    }
  };

  return (
    <div className="min-h-screen bg-green-50 font-sans pb-12">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="max-w-4xl mx-auto p-6 mt-4">
        <header className="mb-6 flex justify-between items-end">
          <div className="bg-green-100 px-4 py-1 rounded-full text-[10px] font-black text-green-700 uppercase tracking-tighter border border-green-200">
            Branch ID: {activeBranch}
          </div>
        </header>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-green-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Closing Date</label>
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold text-slate-600 outline-none focus:border-green-500 transition-all" />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Pending Job</label>
              <div className="relative">
                <select 
                  value={formData.inwardNo} 
                  onChange={handleSelectJob} 
                  className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-green-500 bg-white appearance-none"
                >
                  <option value="">-- SELECT PENDING JOB --</option>
                  {pendingList.map((item, index) => (
                    <option key={item.inward_no || index} value={item.inward_no}>
                      {item.inward_no} - {item.customer_name}
                    </option>
                  ))}
                </select>
                <Search className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>
          </div>

          {selectedJob && (
            <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100 mb-8 animate-in fade-in slide-in-from-top-4">
              <h3 className="font-black text-green-800/40 uppercase text-[10px] tracking-widest mb-4">Verification Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Name</div>
                  <div className="font-bold text-slate-800 uppercase">{selectedJob.customer_name}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service / Part</div>
                  <div className="font-bold text-slate-800 uppercase">{selectedJob.part_name}</div>
                </div>
              </div>
            </div>
          )}

          {selectedJob && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Resolution Result</label>
                <div className="grid grid-cols-3 gap-3">
                  {['REPAIR', 'REPLACE', 'RETURN'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({...formData, resultType: type})}
                      className={`py-3 rounded-xl font-black text-xs transition-all border-2 ${
                        formData.resultType === type 
                        ? 'border-green-600 bg-green-600 text-white shadow-md' 
                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {type === 'RETURN' ? 'NOT REPAIRED' : type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                {formData.resultType === 'REPLACE' ? (
                  <div className="w-full">
                    <label className="text-[10px] font-black text-yellow-600 uppercase mb-2 block tracking-widest">Enter NEW Serial No</label>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="NEW SERIAL..." 
                      className="w-full p-3 font-bold uppercase rounded-lg border-2 border-yellow-200 outline-none focus:border-yellow-500"
                      onChange={(e) => setFormData({...formData, newSerialNo: e.target.value.toUpperCase()})}
                    />
                  </div>
                ) : (
                  <div className="w-full flex items-center gap-3 text-slate-500 font-bold text-sm">
                    <CheckCircle size={20} className="text-green-500"/>
                    Item will be marked as {formData.resultType === 'REPAIR' ? 'Repaired' : 'Returned'}.
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Charges (₹)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={formData.charges} 
                    placeholder="0.00" 
                    onChange={(e) => setFormData({...formData, charges: e.target.value})} 
                    className="w-full border-2 border-slate-100 p-3 pl-10 rounded-xl font-black text-green-700 text-lg outline-none focus:border-green-500" 
                  />
                  <DollarSign className="absolute left-3 top-3.5 text-green-600" size={20}/>
                </div>
              </div>

              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-green-700 transition-all flex justify-center items-center gap-2"
              >
                {isSaving ? "SAVING..." : <><Save size={20}/> CLOSE & DELIVER</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerOutward;