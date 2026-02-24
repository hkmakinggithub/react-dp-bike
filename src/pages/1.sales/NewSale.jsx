import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Plus, Save, ShieldCheck, Search } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Printer, List, ChevronDown, ChevronUp } from 'lucide-react';

// 👇 1. ADD THIS IMPORT
import { useNavigate } from 'react-router-dom'; 

const ClientMaster = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const activeBranch = localStorage.getItem('activeBranch') || '1';
  
  // 👇 2. INITIALIZE NAVIGATE
  const navigate = useNavigate(); 

  const [showHistory, setShowHistory] = useState(false);
  const [salesList, setSalesList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 🚨 3. THE STRICT SECURITY SHIELD 🚨
  // Checks for token BEFORE anything else happens!
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === 'null') {
      toast.error("❌ Session Expired! Please log in again.");
      navigate('/'); // Kicks you to login page
    }
  }, [navigate]);

  const filteredSales = salesList.filter((sale) => {
    const query = searchQuery.toLowerCase();
    const name = (sale.customer_name || sale.customerName || '').toLowerCase();
    const phone = (sale.mobile || sale.phone || '').toLowerCase();
    return name.includes(query) || phone.includes(query);
  });

  const [searchDate, setSearchDate] = useState(''); 

  // 🛡️ SECURED FETCH SALES HISTORY
  const fetchSalesHistory = async () => {
    setLoadingHistory(true);  
    try {
      const token = localStorage.getItem('token'); 
      if (!token) return; // 👈 SAFETY CHECK: Stop if no token

      const res = await fetch(`${process.env.BACK}/api/sales/list`, {
        headers: { 
          'branch-id': activeBranch,
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await res.json();
      setSalesList(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load sales history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleHistory = () => {
    if (!showHistory && salesList.length === 0) {
      fetchSalesHistory(); 
    }
    setShowHistory(!showHistory);
  };

  const [modelList, setModelList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [newCust, setNewCust] = useState({ name: '', mobile: '', city: '' });

  const [formData, setFormData] = useState({
    customerName: '', mobile: '', city: '',
    modelName: '', branch: '', chassisNo: '', motorNo: '',
    controllerNo: '', chargerNo: '', batteryType: '', batterySerialNo: '',
    price: '', paymentMethod: 'CASH',
    financeCompany: '', financeId: '', financeDate: '', 
    downpayment: '', installmentCount: '', installmentAmount: ''
  });

  useEffect(() => {
    fetchModels();
    fetchCustomers();
  }, [activeBranch]);

  // 🛡️ SECURED FETCH MODELS
  const fetchModels = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // 👈 SAFETY CHECK: Stop if no token

      const res = await fetch(`${process.env.BACK}/api/models`, {
        headers: { 
          'branch-id': activeBranch,
          'Authorization': `Bearer ${token}` 
        } 
      });
      const data = await res.json();
      if (Array.isArray(data)) setModelList(data);
    } catch (err) { console.error("Model Error:", err); }
  };

  // 🛡️ SECURED FETCH CUSTOMERS
  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // 👈 SAFETY CHECK: Stop if no token

      const res = await fetch(`${process.env.BACK}/api/customers-list`, {
        headers: { 
          'branch-id': activeBranch,
          'Authorization': `Bearer ${token}` 
        } 
      });
      const data = await res.json();
      
      if (res.ok && Array.isArray(data)) {
        const formatted = data.map(c => ({
          id: c.id,
          name: c.name || '', 
          mobile: c.mobile || '',
          city: c.city || ''
        }));
        setCustomerList(formatted);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  const handleInput = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSelectUser = (u) => {
    setFormData(p => ({ ...p, customerName: u.name, mobile: u.mobile, city: u.city }));
    setCustomerSearch(u.name);
  };

  const handleSelectModel = (m) => {
    setFormData(p => ({ ...p, modelName: m.model_name }));
    setModelSearch(m.model_name);
  };

  // 🛡️ 4. SECURED ADD MODEL
  const handleAddModel = async () => {
    if (!newModelName) return toast.warn("Enter model name");
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.BACK}/api/add-model`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'branch-id': activeBranch,
            'Authorization': `Bearer ${token}` // 👈 SHOW BADGE
        },
        body: JSON.stringify({ modelName: newModelName })
      });
      if (res.ok) {
        toast.success("Model Added");
        setShowModelModal(false);
        setNewModelName('');
        fetchModels();
      }
    } catch (err) { toast.error("Server Error"); }
  };

  // 🛡️ 5. SECURED ADD CUSTOMER
  const handleAddCustomer = async () => {
    if (!newCust.name || !newCust.mobile) {
      return toast.warn("Please enter Name and Mobile");
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.BACK}/api/add-customer`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'branch-id': activeBranch,
            'Authorization': `Bearer ${token}` // 👈 SHOW BADGE
        },
        body: JSON.stringify({
          name: newCust.name.toUpperCase(),
          mobile: newCust.mobile,
          city: newCust.city ? newCust.city.toUpperCase() : ''
        })
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("✅ Customer Saved!");
        setShowCustomerModal(false);
        setNewCust({ name: '', mobile: '', city: '' });
        fetchCustomers(); 
        handleSelectUser({ name: newCust.name, mobile: newCust.mobile, city: newCust.city });
      } else {
        toast.error("❌ Error: " + result.message);
      }
    } catch (err) {
      toast.error("Server Connection Failed");
    }
  };

  // 🛡️ 6. SECURED SAVE SALE
  const handleSaveSale = async () => {
    if (!formData.customerName || !formData.modelName || !formData.chassisNo) {
      return toast.warn("DETAILS MISSING (Name, Model, or Chassis)");
    }
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token'); 

      const res = await fetch(`${process.env.BACK}/api/save-sale`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'branch-id': activeBranch,
          'Authorization': `Bearer ${token}` // 👈 FIXED! Added the word "Bearer"
        },
        body: JSON.stringify({ ...formData, paymentMethod })
      });
      
      if (res.ok) {
        toast.success("✅ SALE SAVED!");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const errorData = await res.json();
        if (res.status === 401 || res.status === 403) {
            toast.error("Session Expired or Access Denied.");
        } else {
            toast.error(errorData.message || "Save Failed");
        }
      }
    } catch (err) { 
        toast.error("Server Error"); 
    } finally { 
        setIsSaving(false); 
    }
  };

  const filteredUsers = customerList.filter(user => {
    const q = customerSearch.toLowerCase();
    return (user.name || '').toLowerCase().includes(q) || (user.mobile || '').includes(q);
  });

  const filteredModels = modelList.filter(m => 
    m.model_name?.toLowerCase().includes(modelSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10">
      <Navbar />
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        
 <div className="mt-3 max-w-[95%] mx-auto">
          <button 
            type="button"
            onClick={toggleHistory}
            className="w-full py-3 mb-2.5  bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all flex justify-center items-center gap-3"
          >
            <List size={20} />
            {showHistory ? "HIDE SALES DATA" : "VIEW ALL RECENT SALES DATA"}
            {showHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
 
          {showHistory && (
            <div className="mt-6 mb-6 bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 animate-fade-in-up w-full">
              
              <div className="mb-6 relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={20} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by Name or Mobile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="w-full overflow-x-auto overflow-y-auto max-h-[240px] rounded-xl border border-slate-100 shadow-inner">
                <table className="w-full text-left whitespace-nowrap min-w-max">
                  
                  <thead className="bg-slate-900 text-white sticky top-0 z-10 shadow-md">
                    <tr>
                     
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest">Customer Name</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest">Mobile</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest">Model</th>
                    
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest">Chassis No</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest">Motor No</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-right">Price (₹)</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-slate-100">
                    {loadingHistory ? (
                      <tr><td colSpan="8" className="p-10 text-center font-bold text-slate-400 animate-pulse">Loading Sales Data...</td></tr>
                    ) : filteredSales.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-10 text-center font-bold text-slate-400">
                          {searchQuery ? "No matching customers found." : "No recent sales found."}
                        </td>
                      </tr>
                    ) : (
                      filteredSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-sm font-black text-slate-800 uppercase">
                            {sale.customer_name || sale.customerName}
                          </td>
                          <td className="p-4 text-xs font-bold text-slate-500">
                            {sale.mobile || sale.phone || '-'}
                          </td>
                          <td className="p-4 text-xs font-bold text-slate-500">
                            {sale.model_name || sale.modelName || '-'}
                          </td>
                     
                          <td className="p-4 text-xs font-black text-slate-600">
                            {sale.chassis_no || sale.chassisNo || '-'}
                          </td>
                          <td className="p-4 text-xs font-black text-slate-600">
                            {sale.motor_no || sale.motorNo || '-'}
                          </td>
                          <td className="p-4 text-sm font-black text-emerald-600 text-right">
                            ₹{sale.price || sale.amount || '0'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}
         
        </div>
        {/* CUSTOMER SECTION */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-slate-700">Customer Details</h2>
            <button onClick={() => setShowCustomerModal(true)} className="text-xs font-bold text-teal-600 flex items-center gap-1 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-600 hover:text-white transition-all">
              <Plus size={14} /> Add New
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="relative z-20">
              <input 
                type="text" 
                placeholder="Search Customer by Name or Mobile..." 
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 font-bold text-slate-700" 
              />
              
              {customerSearch && customerSearch !== formData.customerName && (
                <div className="absolute top-full left-0 w-full bg-white border border-slate-200 mt-2 rounded-xl shadow-2xl max-h-52 overflow-y-auto z-50">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(u => (
                      <div key={u.id} onClick={() => handleSelectUser(u)} className="p-4 hover:bg-teal-50 cursor-pointer border-b border-slate-100 flex justify-between items-center group">
                        <span className="font-bold text-sm text-slate-700">{u.name}</span>
                        <span className="text-slate-400 text-xs font-semibold">{u.mobile}</span>
                      </div>
                    ))
                  ) : (
                     <div className="p-4 text-center text-slate-400 text-xs font-bold">No customer found.</div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label className="text-[10px] font-bold text-slate-400 absolute top-2 left-3 uppercase">Selected Name</label>
                <input readOnly value={formData.customerName} className="w-full bg-slate-50 border border-slate-200 pt-6 pb-2 px-3 rounded-xl font-bold text-slate-600" />
              </div>
              <div className="relative">
                <label className="text-[10px] font-bold text-slate-400 absolute top-2 left-3 uppercase">Mobile</label>
                <input readOnly value={formData.mobile} className="w-full bg-slate-50 border border-slate-200 pt-6 pb-2 px-3 rounded-xl font-bold text-slate-600" />
              </div>
              <div className="relative">
                <label className="text-[10px] font-bold text-slate-400 absolute top-2 left-3 uppercase">City</label>
                <input readOnly value={formData.city} className="w-full bg-slate-50 border border-slate-200 pt-6 pb-2 px-3 rounded-xl font-bold text-slate-600 uppercase" />
              </div>
            </div>
          </div>
        </section>

        {/* VEHICLE SECTION */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-slate-700">Vehicle Details</h2>
            <button onClick={() => setShowModelModal(true)} className="text-xs font-bold text-teal-600 flex items-center gap-1">
              <Plus size={14} /> Add Model
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 relative">
              <input 
                type="text" placeholder="Select Model..." 
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                className="w-full border border-slate-200 p-3 rounded-lg outline-none focus:border-teal-500" 
              />
              {modelSearch && modelSearch !== formData.modelName && (
                <div className="absolute z-50 w-full bg-white border border-slate-200 mt-1 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                  {filteredModels.map(m => (
                    <div key={m.id} onClick={() => handleSelectModel(m)} className="p-3 hover:bg-slate-50 cursor-pointer border-b font-bold text-sm text-slate-700">
                      {m.model_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input name="chassisNo" placeholder="Chassis No" onChange={handleInput} className="border border-slate-200 p-3 rounded-lg outline-none focus:border-teal-500" />
            <input name="motorNo" placeholder="Motor No" onChange={handleInput} className="border border-slate-200 p-3 rounded-lg outline-none focus:border-teal-500" />
            <input name="controllerNo" placeholder="Controller No" onChange={handleInput} className="border border-slate-200 p-3 rounded-lg outline-none focus:border-teal-500" />
            <input name="chargerNo" placeholder="Charger No" onChange={handleInput} className="border border-slate-200 p-3 rounded-lg outline-none focus:border-teal-500" />
            <select name="batteryType" onChange={handleInput} className="border border-slate-200 p-3 rounded-lg bg-white outline-none">
               <option value="">Battery Type</option>
               <option value="Lithium 60V24AH">Lithium 60V24AH</option>
               <option value="Lead Acid 12V32AH">Lead Acid 12V32AH</option>
            </select>
            <input name="batterySerialNo" placeholder="Battery Serial No" onChange={handleInput} className="border border-slate-200 p-3 rounded-lg outline-none focus:border-teal-500" />
          </div>
        </section>

        {/* PAYMENT SECTION */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <h2 className="font-bold text-slate-700 mb-4">Payment & Finance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Grand Price</label>
              <input name="price" type="number" onChange={handleInput} className="w-full border border-slate-200 p-3 rounded-lg font-bold text-lg text-teal-600 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Method</label>
              <div className="flex gap-2">
                {['CASH', 'GPAY', 'FINANCE'].map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m)} className={`flex-1 py-3 rounded-lg text-xs font-bold border ${paymentMethod === m ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {paymentMethod === 'FINANCE' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
              <input name="financeCompany" placeholder="Finance Company" onChange={handleInput} className="border border-slate-200 p-2 rounded bg-white text-sm" />
              <input name="financeId" placeholder="Finance ID" onChange={handleInput} className="border border-slate-200 p-2 rounded bg-white text-sm" />
              <input name="financeDate" type="date" onChange={handleInput} className="border border-slate-200 p-2 rounded bg-white text-sm text-slate-500" />
              <input name="downpayment" placeholder="Downpayment" type="number" onChange={handleInput} className="border border-slate-200 p-2 rounded bg-white text-sm" />
              <input name="installmentCount" placeholder="Installments" type="number" onChange={handleInput} className="border border-slate-200 p-2 rounded bg-white text-sm" />
              <input name="installmentAmount" placeholder="EMI Amount" type="number" onChange={handleInput} className="border border-slate-200 p-2 rounded bg-white text-sm font-bold text-teal-600" />
            </div>
          )}
        </section>

        {/* SAVE BUTTON */}
        <button onClick={handleSaveSale} disabled={isSaving} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:bg-slate-300 flex justify-center items-center gap-2">
          {isSaving ? "Saving..." : <><Save size={20}/> Save Record</>}
        </button>

      </div>

      {/* MODALS */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl">
            <h3 className="font-bold mb-4">New Customer</h3>
            <input placeholder="Name" className="w-full border p-3 rounded-lg mb-2" onChange={e => setNewCust({...newCust, name: e.target.value})} />
            <input placeholder="Mobile" className="w-full border p-3 rounded-lg mb-2" onChange={e => setNewCust({...newCust, mobile: e.target.value})} />
            <input placeholder="City" className="w-full border p-3 rounded-lg mb-4" onChange={e => setNewCust({...newCust, city: e.target.value})} />
            <div className="flex gap-2">
              <button onClick={handleAddCustomer} className="flex-1 bg-teal-600 text-white py-2 rounded-lg font-bold">Save</button>
              <button onClick={() => setShowCustomerModal(false)} className="px-4 bg-slate-100 rounded-lg font-bold text-slate-500">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showModelModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl">
            <h3 className="font-bold mb-4">Add Model</h3>
            <input autoFocus placeholder="Model Name" className="w-full border p-3 rounded-lg mb-4" onChange={e => setNewModelName(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={handleAddModel} className="flex-1 bg-teal-600 text-white py-2 rounded-lg font-bold">Save</button>
              <button onClick={() => setShowModelModal(false)} className="px-4 bg-slate-100 rounded-lg font-bold text-slate-500">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientMaster;