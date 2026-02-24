  import React, { useState, useEffect } from 'react';
  import Navbar from '../../components/Navbar';
  import { Save, Plus, User, Wrench, List, ChevronDown, ChevronUp, Search } from 'lucide-react';
  import { ToastContainer, toast } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';

  const CustomerInward = () => {
    const activeBranch = localStorage.getItem('activeBranch') || '1';

    // --- JOB HISTORY STATES ---
    const [showJobHistory, setShowJobHistory] = useState(false);
    const [jobList, setJobList] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [searchJobQuery, setSearchJobQuery] = useState('');
    const [searchJobDate, setSearchJobDate] = useState('');

    // --- FORM STATES ---
    const [customers, setCustomers] = useState([]);
    const [parts, setParts] = useState([]);
    const [inwardNo, setInwardNo] = useState('LOADING...');
    const [isSaving, setIsSaving] = useState(false);
    
    // ✅ NEW: Smart Search State
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const [formData, setFormData] = useState({
      date: new Date().toISOString().split('T')[0],
      customerName: '',
      warranty: 'NO',
      purchaseDate: '',
      purchaseInvoice: '',
      partName: '',
      partSerial: '',
      fault: ''
    });

    const [showCustModal, setShowCustModal] = useState(false);
    const [showPartModal, setShowPartModal] = useState(false);
    const [newItemName, setNewItemName] = useState('');
useEffect(() => {
  const getNextNo = async () => {
    const res = await fetch(`${process.env.BACK}/api/cust-inward-no`, {
      headers: { 'branch-id': activeBranch }
    });
    const data = await res.json();
    setFormData(prev => ({ ...prev, inwardNo: data.inwardNo }));
  };
  getNextNo();
}, [activeBranch]);
    // --- INITIAL LOAD ---
    useEffect(() => {
      fetchData();
    }, [activeBranch]);

  const fetchData = async () => {
      try {
        // 1. Get Job Card Number
        const numRes = await fetch(`${process.env.BACK}/api/cust-inward-no`, {
          headers: { 'branch-id': activeBranch }
        });
        const numData = await numRes.json();
        setInwardNo(numData.inwardNo);

        // 2. Fetch Basic Customers (for people who didn't buy bikes here but came for service)
        const custRes = await fetch(`${process.env.BACK}/api/customers-list`, {
          headers: { 'branch-id': activeBranch }
        });
        const basicCustomers = await custRes.json();

        // 3. 🚨 THE FIX: Fetch Sales Data (to get Model & Chassis No for existing buyers)
        const salesRes = await fetch(`${process.env.BACK}/api/sales/list`, {
          headers: { 'branch-id': activeBranch }
        });
        const salesCustomers = await salesRes.json();

        // Combine both lists together safely!
        const combinedCustomers = [
          ...(Array.isArray(salesCustomers) ? salesCustomers : []),
          ...(Array.isArray(basicCustomers) ? basicCustomers : [])
        ];
        setCustomers(combinedCustomers);

        // 4. Get Parts List
        const partRes = await fetch(`${process.env.BACK}/api/parts`, {
          headers: { 'branch-id': activeBranch }
        });
        const partData = await partRes.json();
        setParts(Array.isArray(partData) ? partData : []);
        
      } catch (err) { 
        console.error("Error loading data"); 
      }
    };

    const fetchJobHistory = async () => {
      setLoadingJobs(true);
      try {
        const res = await fetch(`${process.env.BACK}/api/service/list`, {
          headers: { 'branch-id': activeBranch }
        });
        const data = await res.json();
        setJobList(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error("Failed to load job history");
      } finally {
        setLoadingJobs(false);
      }
    };

    // --- HANDLERS ---
    const handleInput = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value.toUpperCase() });
    };

    // ✅ NEW: Handles the Smart Customer Selection
    const handleSelectCustomer = (u) => {
      const cName = u.name || u.customer_name;
      setFormData({ ...formData, customerName: cName });
      setCustomerSearch(cName); // Put name in the search box
      setSelectedCustomer(u);   // Save all details to show in the box below
    };

    const toggleJobHistory = () => {
      if (!showJobHistory && jobList.length === 0) {
        fetchJobHistory(); 
      }
      setShowJobHistory(!showJobHistory);
    };

const handleSave = async () => {
  if (!formData.customerName) return toast.warn("Customer Name is required");

  setIsSaving(true);
  try {
    // 🚨 PAYLOAD MAPPING: We match the names to the saveServiceJobMaster function
    const payload = {
      jobNo: formData.inwardNo,         // matches 'jobNo' in backend
      jobDate: formData.date,           // matches 'jobDate'
      customerName: formData.customerName,
      mobile: formData.mobile || '',    // ensure these exist in your state
      modelName: formData.modelName || 'BIKE', 
      isWarranty: formData.warranty || 'NO',
      purchaseDate: formData.purchaseDate || null,
      invoiceNo: formData.purchaseInvoice || null,
      serviceType: 'REPAIR',
      partSerial: formData.partSerial,
      selectedServices: formData.partName, // matches 'selectedServices'
      totalAmount: 0
    };

    const res = await fetch(`${process.env.BACK}/api/save-service-job`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'branch-id': activeBranch 
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      toast.success("✅ Job Card Created!");
      // Reset logic here...
    } else {
      const errData = await res.json();
      toast.error(errData.error || "Save Failed");
    }
  } catch (err) {
    toast.error("Server Connection Error");
  } finally {
    setIsSaving(false);
  }
};

    const handleQuickAdd = async (type) => {
      if (!newItemName) return toast.warn("ENTER NAME");
      const upperName = newItemName.toUpperCase();
      const url = type === 'CUSTOMER' 
        ? `${process.env.BACK}/api/add-customer` 
        : `${process.env.BACK}/api/add-part`;

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'branch-id': activeBranch
          },
          body: JSON.stringify({ name: upperName })
        });
        if (res.ok) {
          toast.success(`✅ ${type} ADDED`);
          fetchData(); 
          setShowPartModal(false);
          setShowCustModal(false);
          setNewItemName('');
        }
      } catch (error) { toast.error("Failed to add item"); }
    };

    // --- FILTERS ---
    const filteredJobs = jobList.filter((job) => {
      const query = searchJobQuery.toLowerCase();
      const name = (job.customer_name || job.customerName || '').toLowerCase();
      const phone = (job.mobile || job.phone || '').toLowerCase();
      const jobNo = (job.inward_no || job.job_no || job.id || '').toString().toLowerCase();
      
      const matchesText = name.includes(query) || phone.includes(query) || jobNo.includes(query);

      let matchesDate = true;
      if (searchJobDate) {
        const rawDate = job.date || job.created_at;
        const jobDateStr = rawDate ? rawDate.toString().split('T')[0] : '';
        matchesDate = (jobDateStr === searchJobDate);
      }

      return matchesText && matchesDate;
    });

    // ✅ SMART SEARCH FILTER FOR CUSTOMERS
    const filteredCustomers = customers.filter(user => {
      const q = customerSearch.toLowerCase();
      const name = (user.name || user.customer_name || '').toLowerCase();
      const phone = (user.mobile || user.phone || '').toLowerCase();
      return name.includes(q) || phone.includes(q);
    });

    return (
      <div className="min-h-screen bg-gray-50 font-sans pb-12">
        <Navbar />
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />

        <div className="max-w-4xl mx-auto px-4 py-8">
          <header className="mb-6 border-b border-gray-200 pb-4 flex justify-between items-end">
            <div className="text-right">
              <div className="text-xl font-bold text-orange-600">{inwardNo}</div>
            </div>
          </header>

          {/* MAIN FORM CARD */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Date</label>
                <input 
                  type="date" name="date" 
                  value={formData.date} onChange={handleInput} 
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none text-gray-700" 
                />
              </div>

              {/* ✅ SMART CUSTOMER SEARCH FIELD */}
              <div className="space-y-1 relative z-20">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-500">Search Customer</label>
                  <button onClick={() => setShowCustModal(true)} className="text-xs font-medium text-orange-600 flex items-center gap-1 hover:text-orange-700">
                    <Plus size={14}/> Add New
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search by Name or Mobile..." 
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      if(formData.customerName) setFormData({...formData, customerName: ''});
                      if(selectedCustomer) setSelectedCustomer(null);
                    }}
                    className="w-full border border-gray-300 p-2 rounded bg-white text-gray-700 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  
                  {/* 🔍 SEARCH DROPDOWN MENU */}
                  {customerSearch && !formData.customerName && (
                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-xl max-h-52 overflow-y-auto z-50">
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(u => (
                          <div key={u.id} onClick={() => handleSelectCustomer(u)} className="p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 flex justify-between items-center group">
                            <span className="font-bold text-sm text-gray-700">{u.name || u.customer_name}</span>
                            <span className="text-gray-400 text-xs font-semibold">{u.mobile || u.phone}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-gray-400 text-xs font-bold">No customer found.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ EXPANDED CUSTOMER DETAILS BOX */}
          {/* ✅ EXPANDED CUSTOMER DETAILS BOX (SHOWING ALL SALES DATA) */}
              {selectedCustomer && (
                <div className="md:col-span-2 bg-slate-800 border border-slate-700 p-5 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-4 animate-in fade-in shadow-inner">
                  
                  {/* ROW 1: Basics */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</p>
                    <p className="font-bold text-white">{selectedCustomer.mobile || selectedCustomer.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City</p>
                    <p className="font-bold text-white uppercase">{selectedCustomer.city || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model</p>
                    <p className="font-bold text-white uppercase">{selectedCustomer.model_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch ID</p>
                    <p className="font-bold text-white">{selectedCustomer.branch || selectedCustomer.branch_id || 'N/A'}</p>
                  </div>

                  {/* ROW 2: Vehicle Hardware */}
                  <div>
                    {/* Changed the label so it says Sale Date instead of Chassis No! */}
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sale Date</p>
                    
                    {/* Safely formats the date to DD/MM/YYYY */}
                    <p className="font-bold text-emerald-400 text-xs">
                      {(() => {
                        const rawDate = selectedCustomer.sale_date || selectedCustomer.date || selectedCustomer.created_at;
                        if (!rawDate) return 'N/A';
                        try {
                          const datePart = rawDate.toString().split('T')[0];
                          const [year, month, day] = datePart.split('-');
                          return `${day}/${month}/${year}`;
                        } catch (e) { 
                          return rawDate; 
                        }
                      })()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chassis No</p>
                    <p className="font-bold text-orange-400 text-xs">{selectedCustomer.chassis_no || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Motor No</p>
                    <p className="font-bold text-orange-400 text-xs">{selectedCustomer.motor_no || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Controller No</p>
                    <p className="font-bold text-orange-400 text-xs">{selectedCustomer.controller_no || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Charger No</p>
                    <p className="font-bold text-orange-400 text-xs">{selectedCustomer.charger_no || 'N/A'}</p>
                  </div>

                  {/* ROW 3: Battery & Pricing */}
                  <div className="md:col-span-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Battery Type & Serial</p>
                    <p className="font-bold text-white text-xs">
                      {selectedCustomer.battery_type || 'N/A'} <span className="text-slate-500 mx-2">|</span> {selectedCustomer.battery_serial_no || 'N/A'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Original Sale Price</p>
                    <p className="font-black text-emerald-400 text-lg tracking-wider">
                      {selectedCustomer.price ? `₹${selectedCustomer.price}` : 'N/A'}
                    </p>
                  </div>

                </div>
              )}
              
            </div>

            <div className="bg-orange-50/40 p-4 rounded-lg border border-orange-100 mb-6 z-0">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-semibold text-gray-700">Is Warranty Claim?</label>
                <div className="flex bg-white rounded border border-gray-300 overflow-hidden">
                  {['YES', 'NO'].map(opt => (
                    <button 
                      key={opt} 
                      onClick={() => setFormData({...formData, warranty: opt})}
                      className={`px-6 py-1 text-xs font-medium transition-colors ${
                        formData.warranty === opt ? 'bg-orange-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {formData.warranty === 'YES' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">Purchase Date</label>
                    <input type="date" name="purchaseDate" onChange={handleInput} className="w-full border border-gray-300 p-2 rounded text-gray-700 focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">Invoice No</label>
                    <input type="text" name="purchaseInvoice" placeholder="Invoice No" onChange={handleInput} className="w-full border border-gray-300 p-2 rounded text-gray-700 focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-500">Part Name</label>
                    <button onClick={() => setShowPartModal(true)} className="text-xs font-medium text-orange-600 flex items-center gap-1 hover:text-orange-700">
                      <Plus size={14}/> Add New
                    </button>
                  </div>
                  <select 
                    name="partName" value={formData.partName} onChange={handleInput} 
                    className="w-full border border-gray-300 p-2 rounded bg-white text-gray-700 outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Part...</option>
                    {parts.map(p => <option key={p.id} value={p.part_name}>{p.part_name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Serial No</label>
                  <input type="text" name="partSerial" value={formData.partSerial} placeholder="Enter Serial" onChange={handleInput} className="w-full border border-gray-300 p-2 rounded text-gray-700 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Fault Description</label>
                <textarea name="fault" value={formData.fault} rows="3" placeholder="Describe the issue..." onChange={handleInput} className="w-full border border-gray-300 p-2 rounded text-gray-700 focus:ring-2 focus:ring-orange-500 outline-none resize-none"></textarea>
              </div>
            </div>

            <button 
              onClick={handleSave} disabled={isSaving} 
              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
                isSaving ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-orange-600 text-white hover:bg-orange-700 shadow-sm'
              }`}
            >
              {isSaving ? "Saving..." : <><Wrench size={18}/> Open Job Card</>}
            </button>
          </div>


        </div>

        {/* --- MODALS --- */}
        {(showCustModal || showPartModal) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-xl">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">New {showCustModal ? 'Customer' : 'Part'}</h3>
              <input 
                autoFocus type="text" placeholder="Enter Name" 
                className="w-full border border-gray-300 p-2 rounded mb-4 focus:ring-2 focus:ring-orange-500 outline-none" 
                onChange={(e) => setNewItemName(e.target.value)} 
              />
              <div className="flex gap-2">
                <button onClick={() => handleQuickAdd(showCustModal ? 'CUSTOMER' : 'PART')} className="flex-1 bg-orange-600 text-white py-2 rounded font-medium hover:bg-orange-700">
                  Save
                </button>
                <button onClick={() => {setShowCustModal(false); setShowPartModal(false);}} className="px-4 bg-gray-100 text-gray-600 rounded font-medium hover:bg-gray-200">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default CustomerInward;