import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateStaff = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  
  // 🚨 NEW: Added Branch State and List
  const [branchId, setBranchId] = useState('1'); 
  const branches = [
    { id: '1', name: 'Dhrangadhra (Main)' },
    { id: '2', name: 'Halvad (Branch 2)' },
    { id: '3', name: 'Surendranagar (Branch 3)' }
  ];

  const availablePages = [
    "New Sale Entry",
    "Supplier Return (Out)",
    "Supplier Receive (In)",
    "Open Job Card (In)",
    "Close Job Card (Out)",
    "New Service Job",
    "Generate Bill",
    "Master Reports",
    "Warranty Tracker",
    "Customer Master",
    "Staff Management",
    "Walk-In Inquiry",
    "View Inquiries"
  ];

  const handleCheckbox = (page) => {
    if (selectedPermissions.includes(page)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== page));
    } else {
      setSelectedPermissions([...selectedPermissions, page]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) return toast.warn("Email and Password are required!");
    if (selectedPermissions.length === 0) return toast.warn("Select at least one permission!");

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch('http://localhost:5000/api/create-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email,
          password,
          permissions: selectedPermissions,
          branchId // 🚨 NEW: Sending the selected branch to the backend!
        })
      });
      
      if (res.ok) {
        toast.success("✅ Staff Account Created Successfully!");
        setEmail('');
        setPassword('');
        setSelectedPermissions([]);
        setBranchId('1'); // Reset dropdown to main branch
      } else {
        const data = await res.json();
        toast.error("❌ Failed: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      toast.error("❌ Server Connection Failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="p-8 max-w-2xl mx-auto bg-white shadow-xl shadow-slate-200/50 rounded-[2rem] border border-slate-100 mt-10">
        <h2 className="text-2xl font-black mb-6 border-b-2 border-slate-100 pb-4 text-slate-800 uppercase italic">
          Create New Staff Access
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email and Password Row */}
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="email" placeholder="STAFF EMAIL" value={email} 
              onChange={(e) => setEmail(e.target.value)} required
              className="border-2 border-slate-100 p-4 rounded-xl w-full font-bold text-slate-700 outline-none focus:border-red-500 uppercase"
            />
            <input 
              type="password" placeholder="TEMPORARY PASSWORD" value={password} 
              onChange={(e) => setPassword(e.target.value)} required
              className="border-2 border-slate-100 p-4 rounded-xl w-full font-bold text-slate-700 outline-none focus:border-red-500"
            />
          </div>

          {/* 🚨 NEW: Branch Selection Dropdown */}
          <div>
             <h3 className="font-black text-slate-400 uppercase text-xs tracking-widest mb-3">Assign to Branch:</h3>
             <select 
               value={branchId}
               onChange={(e) => setBranchId(e.target.value)}
               className="border-2 border-slate-100 p-4 rounded-xl w-full font-bold text-slate-700 outline-none focus:border-red-500 cursor-pointer appearance-none bg-slate-50"
             >
               {branches.map(b => (
                 <option key={b.id} value={b.id}>{b.name}</option>
               ))}
             </select>
          </div>

          {/* Permissions Selection */}
          <div>
            <h3 className="font-black text-slate-400 uppercase text-xs tracking-widest mb-3">Select Allowed Pages:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              {availablePages.map((page) => (
                <label key={page} className="flex items-center space-x-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${selectedPermissions.includes(page) ? 'bg-red-600 border-red-600' : 'border-slate-300 bg-white group-hover:border-red-400'}`}>
                    {selectedPermissions.includes(page) && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                  </div>
                  <input 
                    type="checkbox" 
                    checked={selectedPermissions.includes(page)}
                    onChange={() => handleCheckbox(page)}
                    className="hidden"
                  />
                  <span className="font-bold text-slate-700 text-sm">{page}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-red-600 text-white font-black p-4 rounded-xl uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30">
            Create Staff Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateStaff;