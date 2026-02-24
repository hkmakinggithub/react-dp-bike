import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Save, Plus, Wrench, User, Bike } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ServiceJobIn = () => {
  // --- 1. BRANCH CONTEXT ---
  const activeBranch = localStorage.getItem('activeBranch') || '1';

  // --- STATE ---
  const [jobNo, setJobNo] = useState('LOADING...');
  const [customers, setCustomers] = useState([]);
  const [models, setModels] = useState([]);
  const [serviceMenu, setServiceMenu] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    mobile: '',       // 🚨 ADDED: Missing from your original
    modelName: '',
    partSerial: '',   // 🚨 ADDED: Chassis / Serial No
    warranty: 'NO',
    purchaseDate: '',
    invoiceNo: '',
    serviceType: 'PAID',
    selectedServices: [],
    totalAmount: 0
  });

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newService, setNewService] = useState({ name: '', price: '' });

  // --- 2. INITIAL LOAD ---
  useEffect(() => {
    fetchData();
  }, [activeBranch]);

  const fetchData = async () => {
    try {
      const headers = { 
        'branch-id': activeBranch,
        'Content-Type': 'application/json' 
      };

      // 🚨 FIXED URL: changed from /service-job-no to /cust-inward-no
      const jobRes = await fetch(`${import.meta.env.VITE_BACK}/api/cust-inward-no`, { headers });
      const jobData = await jobRes.json();
      setJobNo(jobData.inwardNo);

      const custRes = await fetch(`${import.meta.env.VITE_BACK}/api/customers-list`, { headers });
      setCustomers(await custRes.json());

      const modRes = await fetch(`${import.meta.env.VITE_BACK}/api/models`, { headers });
      setModels(await modRes.json());

      const menuRes = await fetch(`${import.meta.env.VITE_BACK}/api/service-menu`, { headers });
      setServiceMenu(await menuRes.json());

    } catch (err) { 
      console.error("❌ Fetch Error:", err); 
      toast.error("Failed to load data");
    }
  };

  // --- LOGIC ---
  const handleToggleService = (item) => {
    const exists = formData.selectedServices.find(s => s.id === item.id);
    let updatedList;
    if (exists) {
      updatedList = formData.selectedServices.filter(s => s.id !== item.id);
    } else {
      updatedList = [...formData.selectedServices, item];
    }
    const newTotal = formData.serviceType === 'FREE' ? 0 : updatedList.reduce((sum, s) => sum + Number(s.price), 0);
    setFormData({ ...formData, selectedServices: updatedList, totalAmount: newTotal });
  };

  const handleTypeChange = (type) => {
    const newTotal = type === 'FREE' ? 0 : formData.selectedServices.reduce((sum, s) => sum + Number(s.price), 0);
    setFormData({ ...formData, serviceType: type, totalAmount: newTotal });
  };

  const handleSave = async () => {
    if (!formData.customerName || !formData.modelName) return toast.warn("⚠️ CUSTOMER & MODEL REQUIRED");
    
    setIsSaving(true);
    
    // 🚨 FIXED: Convert the array of selected services to a comma-separated string for MySQL
    const servicesString = formData.selectedServices.map(s => s.service_name).join(', ');

    const payload = {
        jobNo: jobNo,
        jobDate: formData.date,
        customerName: formData.customerName,
        mobile: formData.mobile,
        modelName: formData.modelName,
        partSerial: formData.partSerial,
        isWarranty: formData.warranty,
        purchaseDate: formData.purchaseDate,
        invoiceNo: formData.invoiceNo,
        serviceType: formData.serviceType,
        selectedServices: servicesString, // Passed as a clean string!
        totalAmount: formData.totalAmount
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_BACK}/api/save-service-job`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'branch-id': activeBranch 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("✅ JOB CARD CREATED!");
        setFormData({
          date: new Date().toISOString().split('T')[0],
          customerName: '', mobile: '', modelName: '', partSerial: '', warranty: 'NO', 
          purchaseDate: '', invoiceNo: '', serviceType: 'PAID', selectedServices: [], totalAmount: 0
        });
        fetchData(); // Refresh the Job No
      } else {
        const err = await res.json();
        toast.error("Save Failed: " + (err.error || err.message));
      }
    } catch (err) { toast.error("Server Error"); }
    finally { setIsSaving(false); }
  };

  const handleAddServiceItem = async () => {
    if (!newService.name || !newService.price) return toast.warn("Enter name and price");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACK}/api/add-service-item`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'branch-id': activeBranch 
          },
          body: JSON.stringify(newService)
      });
      if(res.ok) {
          toast.success("Service Added to Menu");
          setShowServiceModal(false);
          setNewService({ name: '', price: '' });
          fetchData();
      }
    } catch (error) {
      toast.error("Failed to add service item");
    }
  };

  // Populate Mobile if Customer is selected
  const handleCustomerSelect = (e) => {
      const name = e.target.value;
      const cust = customers.find(c => (c.name || c.customer_name) === name);
      setFormData({ 
          ...formData, 
          customerName: name, 
          mobile: cust ? (cust.mobile || '') : formData.mobile 
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* 🚨 UNCOMMENTED & FIXED HEADER */}
        <header className="mb-8 flex justify-between items-end border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 italic uppercase">Service Job In</h1>
            <p className="text-gray-500 font-bold tracking-tight">Create new customer job card</p>
          </div>
          <div className="bg-indigo-50 px-6 py-3 rounded-xl border border-indigo-100 text-center shadow-sm">
            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Job No</div>
            <div className="text-2xl font-black text-indigo-700 tracking-tighter">{jobNo}</div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: CUSTOMER & BIKE DETAILS */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Inward Date</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full border-2 border-gray-100 p-3 rounded-xl text-gray-700 font-bold focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Customer Name</label>
                  <select className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-gray-700 bg-white outline-none focus:border-indigo-500" value={formData.customerName} onChange={handleCustomerSelect}>
                    <option value="">-- Select Customer --</option>
                    {customers.map(c => <option key={c.id} value={c.name || c.customer_name}>{c.name || c.customer_name}</option>)}
                  </select>
                </div>
              </div>

              {/* 🚨 ADDED MISSING INPUTS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Mobile No</label>
                  <input type="text" placeholder="10-DIGIT MOBILE" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-gray-700 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Vehicle Model</label>
                  <select className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-gray-700 bg-white outline-none focus:border-indigo-500" value={formData.modelName} onChange={(e) => setFormData({...formData, modelName: e.target.value})}>
                    <option value="">-- Select Model --</option>
                    {models.map(m => <option key={m.id} value={m.model_name}>{m.model_name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Chassis / Serial No</label>
                  <input type="text" placeholder="CHASSIS NUMBER" value={formData.partSerial} onChange={(e) => setFormData({...formData, partSerial: e.target.value.toUpperCase()})} className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-gray-700 uppercase focus:border-indigo-500 outline-none" />
                </div>
              </div>

              {/* WARRANTY BOX */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                  <label className="text-xs font-black text-gray-600 uppercase tracking-widest">Under Warranty?</label>
                  <div className="flex bg-white p-1 rounded-xl border border-gray-200">
                    {['YES', 'NO'].map(opt => (
                      <button key={opt} onClick={() => setFormData({...formData, warranty: opt})} className={`px-6 py-2 text-xs font-black rounded-lg transition-all ${formData.warranty === opt ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>{opt}</button>
                    ))}
                  </div>
                </div>
                
                {formData.warranty === 'YES' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in pt-2">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Purchase Date</label>
                        <input type="date" value={formData.purchaseDate} className="w-full p-3 rounded-xl border-2 border-white bg-white text-sm font-bold text-gray-700 outline-none focus:border-indigo-500" onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Invoice Number</label>
                        <input type="text" value={formData.invoiceNo} placeholder="INV-0000" className="w-full p-3 rounded-xl border-2 border-white bg-white text-sm font-bold uppercase outline-none focus:border-indigo-500" onChange={(e) => setFormData({...formData, invoiceNo: e.target.value.toUpperCase()})} />
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT: SERVICE MENU */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-gray-800 uppercase text-sm tracking-wider flex items-center gap-2"><Wrench size={16}/> Service Menu</h3>
              <button onClick={() => setShowServiceModal(true)} className="text-[10px] font-black text-indigo-600 flex items-center gap-1 hover:underline uppercase">
                <Plus size={14} strokeWidth={3}/> Add New
              </button>
            </div>
            
            <div className="flex gap-2 mb-6 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
              {['PAID', 'FREE'].map(type => (
                <button key={type} onClick={() => handleTypeChange(type)} className={`flex-1 py-2 rounded-lg font-black text-xs transition-all ${formData.serviceType === type ? 'bg-white text-indigo-700 shadow-sm border border-gray-200' : 'text-gray-400 hover:bg-gray-100'}`}>
                  {type} SERVICE
                </button>
              ))}
            </div>

            {/* SCROLLABLE MENU LIST */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-2 custom-scrollbar">
              {serviceMenu.length === 0 ? (
                  <div className="text-center text-gray-400 font-bold text-sm mt-10">No services added to menu yet.</div>
              ) : (
                  serviceMenu.map(item => {
                    const isSelected = formData.selectedServices.find(s => s.id === item.id);
                    return (
                      <div key={item.id} onClick={() => handleToggleService(item)} 
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${isSelected ? 'border-indigo-600 bg-indigo-50' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}>
                        <span className={`text-xs font-black uppercase ${isSelected ? 'text-indigo-800' : 'text-gray-600'}`}>{item.service_name}</span>
                        <span className={`text-sm font-black ${isSelected ? 'text-indigo-600' : 'text-gray-800'}`}>₹{item.price}</span>
                      </div>
                    );
                  })
              )}
            </div>

            <div className="border-t-2 border-gray-100 pt-6 mt-auto">
              <div className="flex justify-between items-center mb-6">
                <span className="font-black text-gray-400 text-xs uppercase tracking-widest">Total Charges</span>
                <span className="font-black text-3xl text-gray-900 tracking-tighter">₹{formData.totalAmount}</span>
              </div>
              <button onClick={handleSave} disabled={isSaving} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30 disabled:bg-gray-300 disabled:shadow-none">
                {isSaving ? "SAVING..." : "CREATE JOB CARD"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-6" />
            <h3 className="font-black text-gray-800 mb-6 text-xl text-center uppercase italic">New Service</h3>
            <div className="space-y-4">
              <input autoFocus type="text" placeholder="SERVICE NAME" className="w-full border-2 border-gray-100 p-4 rounded-xl outline-none focus:border-indigo-500 font-bold uppercase text-center" onChange={(e) => setNewService({...newService, name: e.target.value.toUpperCase()})} />
              <input type="number" placeholder="PRICE (₹)" className="w-full border-2 border-gray-100 p-4 rounded-xl outline-none focus:border-indigo-500 font-black text-center text-indigo-600" onChange={(e) => setNewService({...newService, price: e.target.value})} />
              
              <div className="pt-4 flex flex-col gap-3">
                <button onClick={handleAddServiceItem} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">Save Service</button>
                <button onClick={() => setShowServiceModal(false)} className="w-full py-3 text-gray-400 text-xs font-black uppercase tracking-widest">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceJobIn;