import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { Save, Plus, Search, List, ChevronDown, ChevronUp } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const SupplierOutward = () => {
  // --- 1. BRANCH CONTEXT ---
  const activeBranch = localStorage.getItem('activeBranch') || '1'

  // --- HISTORY & FETCH STATES ---
  const [showHistory, setShowHistory] = useState(false)
  const [historyList, setHistoryList] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchDate, setSearchDate] = useState('')
  const [customerJobs, setCustomerJobs] = useState([])

  // --- FORM STATES ---
  const [suppliers, setSuppliers] = useState([])
  const [parts, setParts] = useState([])
  const [outwardNo, setOutwardNo] = useState('LOADING...')
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplierName: '',
    warranty: 'NO',
    purchaseDate: '',
    purchaseInvoice: '',
    partName: '',
    partSerial: '',
    fault: '',
    job_card_ref: '' // 👈 Added this to link to customer job
  })

  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [showPartModal, setShowPartModal] = useState(false)
  const [newItemName, setNewItemName] = useState('')

  // --- 2. LOAD INITIAL DATA ---
  useEffect(() => {
    fetchData()
  }, [activeBranch])

  const fetchData = async () => {
    try {
      const headers = { 'branch-id': activeBranch }

      // Get Outward No
      const numRes = await fetch('http://localhost:5000/api/outward-no', { headers })
      const numData = await numRes.json()
      setOutwardNo(numData.outwardNo)

      // Get Suppliers
      const supRes = await fetch('http://localhost:5000/api/suppliers', { headers })
      const supData = await supRes.json()
      setSuppliers(Array.isArray(supData) ? supData : [])

      // Get Parts
      const partRes = await fetch('http://localhost:5000/api/parts', { headers })
      const partData = await partRes.json()
      setParts(Array.isArray(partData) ? partData : [])

      // 🚨 FIXED: Now it actually fetches the pending jobs!
      const jobsRes = await fetch('http://localhost:5000/api/pending-customer-parts', { headers });
      const jobsData = await jobsRes.json();
      setCustomerJobs(Array.isArray(jobsData) ? jobsData : []);

    } catch (err) {
      console.error('Error loading initial data', err)
      toast.error('Failed to load branch data')
    }
  }

  // --- 3. AUTO-FILL FROM JOB CARD ---
  const handleSelectJob = (jobNo) => {
    if (!jobNo) {
        setFormData({ ...formData, job_card_ref: '', partName: '', partSerial: '', fault: '' });
        return;
    }
    const job = customerJobs.find(j => j.inward_no === jobNo);
    if (job) {
      setFormData({
        ...formData,
        job_card_ref: job.inward_no,
        partName: job.part_name || '',
        partSerial: job.part_serial || '',
        fault: job.fault || '',
        warranty: 'YES' // Usually warranty if sending to supplier
      });
      toast.info(`Auto-filled details for ${jobNo}`);
    }
  };

  // --- 4. FETCH HISTORY REPORT ---
  const fetchHistory = async () => {
    setLoadingHistory(true)
    try {
      const res = await fetch('http://localhost:5000/api/supplier-outward/list', {
        headers: { 'branch-id': activeBranch }
      })
      const data = await res.json()
      setHistoryList(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error('Failed to load history')
    } finally {
      setLoadingHistory(false)
    }
  }

  const toggleHistory = () => {
    if (!showHistory && historyList.length === 0) fetchHistory()
    setShowHistory(!showHistory)
  }

  // --- 5. HANDLE INPUTS & SAVING ---
  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.toUpperCase() })
  }

  const handleSave = async () => {
    if (!formData.supplierName || !formData.partName) {
      toast.warn('⚠️ SUPPLIER AND PART NAME REQUIRED')
      return
    }

    setIsSaving(true)

    try {
      const res = await fetch('http://localhost:5000/api/save-outward', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'branch-id': activeBranch 
        },
        body: JSON.stringify({ ...formData, outwardNo }),
      })

      const result = await res.json()

      if (res.ok) {
        toast.success('✅ OUTWARD SAVED!')
        // Reset Form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          supplierName: '', warranty: 'NO', purchaseDate: '',
          purchaseInvoice: '', partName: '', partSerial: '', fault: '', job_card_ref: ''
        })
        fetchData() 
        if (showHistory) fetchHistory()
      } else {
        toast.error('❌ ERROR: ' + (result.message || result.error))
      }
    } catch (err) {
      toast.error('Server Connection Failed')
    } finally {
      setIsSaving(false)
    }
  }

  // --- 6. QUICK ADD MODALS (Parts/Suppliers) ---
  const handleQuickAdd = async (type) => {
    if (!newItemName) return toast.warn('ENTER NAME')
    const upperName = newItemName.toUpperCase()
    const url = type === 'SUPPLIER' ? 'http://localhost:5000/api/add-supplier' : 'http://localhost:5000/api/add-part'

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'branch-id': activeBranch 
        },
        body: JSON.stringify({ name: upperName }),
      })

      if (res.ok) {
        toast.success(`✅ ${type} ADDED`)
        if (type === 'PART') {
          setParts((prev) => [{ id: Date.now(), part_name: upperName }, ...prev])
          setFormData((prev) => ({ ...prev, partName: upperName }))
          setShowPartModal(false)
        } else {
          setSuppliers((prev) => [{ id: Date.now(), supplier_name: upperName }, ...prev])
          setFormData((prev) => ({ ...prev, supplierName: upperName }))
          setShowSupplierModal(false)
        }
        setNewItemName('')
        fetchData() 
      }
    } catch (error) {
      toast.error('Failed to save item')
    }
  }

  // --- 7. HISTORY SEARCH FILTER ---
  const filteredHistory = historyList.filter((item) => {
    const query = searchQuery.toLowerCase();
    const supplier = (item.supplier_name || '').toLowerCase();
    const part = (item.part_name || '').toLowerCase();
    const outNo = (item.outward_no || '').toLowerCase();
    
    const matchesText = supplier.includes(query) || part.includes(query) || outNo.includes(query);

    let matchesDate = true;
    if (searchDate) {
      const rawDate = item.outward_date || item.created_at;
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
        
        <header className="mb-3 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 italic uppercase">Supplier Outward</h1>
            <p className="text-slate-500 font-bold">Send parts to company</p>
          </div>
          <div className="text-2xl font-black text-teal-600 bg-teal-50 px-4 py-2 rounded-xl border border-teal-100 mt-2 md:mt-0">{outwardNo}</div>
        </header>

        {/* --- MAIN FORM CARD --- */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 mb-10">
          
        

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
              <input 
                type="date" name="date" value={formData.date} onChange={handleInput} 
                className="w-full border-2 border-slate-100 p-3 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 text-slate-700 font-bold transition-all" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier Name</label>
                <button onClick={() => setShowSupplierModal(true)} className="text-[10px] font-black text-teal-600 flex items-center gap-1 hover:underline uppercase">
                  <Plus size={12} strokeWidth={3} /> Add New
                </button>
              </div>
              <select 
                name="supplierName" value={formData.supplierName} onChange={handleInput} 
                className="w-full border-2 border-slate-100 p-3 rounded-xl bg-slate-50 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 text-slate-700 font-bold transition-all appearance-none cursor-pointer"
              >
                <option value="">SELECT SUPPLIER...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.supplier_name}>{s.supplier_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Is Warranty Claim?</label>
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
                {['YES', 'NO'].map((opt) => (
                  <button 
                    key={opt} onClick={() => setFormData({ ...formData, warranty: opt })} 
                    className={`flex-1 sm:px-6 py-2 text-xs font-black rounded-lg transition-all ${formData.warranty === opt ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {formData.warranty === 'YES' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Purchase Date</label>
                  <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleInput} className="w-full border-2 border-white p-3 rounded-xl text-slate-700 font-bold focus:outline-none focus:border-teal-500 bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Invoice No</label>
                  <input type="text" name="purchaseInvoice" value={formData.purchaseInvoice} onChange={handleInput} placeholder="INV-0000" className="w-full border-2 border-white p-3 rounded-xl text-slate-700 font-bold focus:outline-none focus:border-teal-500 bg-white uppercase placeholder:text-slate-300" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Part Name</label>
                  <button onClick={() => setShowPartModal(true)} className="text-[10px] font-black text-teal-600 flex items-center gap-1 hover:underline uppercase">
                    <Plus size={12} strokeWidth={3} /> Add New
                  </button>
                </div>
                <select 
                  name="partName" value={formData.partName || ''} onChange={handleInput} 
                  className="w-full border-2 border-slate-100 p-3 rounded-xl bg-slate-50 focus:outline-none focus:border-teal-500 text-slate-700 font-bold transition-all appearance-none cursor-pointer"
                >
                  <option value="">SELECT PART...</option>
                  {parts.map((p) => (
                    <option key={p.id} value={p.part_name}>{p.part_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Serial No</label>
                <input type="text" name="partSerial" value={formData.partSerial} onChange={handleInput} placeholder="SN-XXXXX" className="w-full border-2 border-slate-100 p-3 rounded-xl text-slate-700 font-bold focus:outline-none focus:border-teal-500 bg-white uppercase placeholder:text-slate-300" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fault Description</label>
              <textarea name="fault" value={formData.fault} onChange={handleInput} placeholder="Describe the issue in detail..." className="w-full border-2 border-slate-100 p-4 rounded-2xl text-slate-700 font-medium focus:outline-none focus:border-teal-500 bg-white min-h-[120px] resize-none" />
            </div>
          </div>

          <button 
            onClick={handleSave} 
            disabled={isSaving} 
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg ${isSaving ? 'bg-slate-300 cursor-not-allowed text-white' : 'bg-slate-900 text-white hover:bg-black shadow-slate-900/20'}`}
          >
            {isSaving ? "Saving Data..." : <><Save size={20} /> Save Entry</>}
          </button>
        </div>

        {/* ========================================= */}
        {/* --- FOOTER: VIEW OUTWARD REPORT TABLE --- */}
        {/* ========================================= */}
        <div className="max-w-full mx-auto">
          <button 
            type="button" onClick={toggleHistory}
            className="w-full py-4 bg-teal-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-teal-700 transition-all flex justify-center items-center gap-3"
          >
            <List size={20} />
            {showHistory ? "HIDE REPORT" : "VIEW SUPPLIER OUTWARD REPORT"}
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
                    type="text" placeholder="Search by Supplier, Part, or Outward No..."
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                <div className="relative md:w-64">
                  <input
                    type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-teal-500 transition-colors"
                  />
                  {searchDate && (
                    <button 
                      onClick={() => setSearchDate('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full overflow-x-auto overflow-y-auto max-h-[300px] rounded-xl border border-slate-100 shadow-inner">
                <table className="w-full text-left whitespace-nowrap min-w-max">
                  <thead className="bg-slate-900 text-white sticky top-0 z-10 shadow-md">
                    <tr>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest">Date</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-teal-400">Outward No</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest">Supplier Name</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest">Part Name</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest">Serial No</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest">Warranty</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest">Fault</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-slate-100">
                    {loadingHistory ? (
                      <tr><td colSpan="7" className="p-10 text-center font-bold text-slate-400 animate-pulse">Loading Report Data...</td></tr>
                    ) : filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-10 text-center font-bold text-slate-400">
                          {searchQuery || searchDate ? "No matching records found." : "No outward records found."}
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-teal-50 transition-colors">
                        <td className="p-4 text-xs font-bold text-slate-500">
                          {(() => {
                            const rawDate = item.outward_date || item.created_at;
                            if (!rawDate) return '-';
                            try {
                              const datePart = rawDate.toString().split('T')[0];
                              const [year, month, day] = datePart.split('-');
                              return `${day}/${month}/${year}`;
                            } catch (e) { return rawDate; }
                          })()}
                        </td>
                        <td className="p-4 text-xs font-black text-teal-600">{item.outward_no || '-'}</td>
                        <td className="p-4 text-sm font-black text-slate-800 uppercase">{item.supplier_name || '-'}</td>
                        <td className="p-4 text-xs font-bold text-slate-500">{item.part_name || '-'}</td>
                        <td className="p-4 text-xs font-black text-slate-700">{item.part_serial || '-'}</td>
                        <td className="p-4 text-xs font-bold">
                          <span className={item.warranty === 'YES' ? 'text-green-600 bg-green-50 px-2 py-1 rounded' : 'text-slate-400'}>
                            {item.warranty || '-'}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-medium text-slate-500 truncate max-w-[200px]">{item.fault || '-'}</td>
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

      {/* --- MODALS --- */}
      {(showSupplierModal || showPartModal) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6" />
            <h3 className="font-black text-slate-800 mb-6 text-xl uppercase italic tracking-tight text-center">
              New {showSupplierModal ? 'Supplier' : 'Part'}
            </h3>
            <input 
              autoFocus type="text" placeholder={`ENTER ${showSupplierModal ? 'SUPPLIER' : 'PART'} NAME`} 
              className="w-full border-2 border-slate-100 p-4 rounded-xl mb-6 focus:outline-none focus:border-teal-500 font-bold text-center uppercase" 
              onChange={(e) => setNewItemName(e.target.value)} 
            />
            <div className="flex flex-col gap-3">
              <button onClick={() => handleQuickAdd(showSupplierModal ? 'SUPPLIER' : 'PART')} className="w-full bg-teal-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-teal-700 shadow-lg shadow-teal-600/20">Save Item</button>
              <button onClick={() => {setShowSupplierModal(false); setShowPartModal(false);}} className="w-full py-3 text-slate-400 font-bold uppercase tracking-widest text-xs">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupplierOutward