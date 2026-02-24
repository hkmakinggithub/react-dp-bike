import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';

const OpenJobCard = () => {
  const [formData, setFormData] = useState({
    customer_name: '',
    mobile_number: '',
    vehicle_number: '',
    vehicle_model: '',
    kms_driven: '',
    fuel_level: '50%',
    customer_complaints: ''
  });

  const fuelOptions = ['Empty', '25%', '50%', '75%', 'Full'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const branchId = localStorage.getItem('activeBranch') || '1';
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${process.env.BACK}/api/jobcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, branch_id: branchId })
      });

      if (res.ok) {
        toast.success("✅ Job Card Opened Successfully!");
        setFormData({
          customer_name: '', mobile_number: '', vehicle_number: '', 
          vehicle_model: '', kms_driven: '', fuel_level: '50%', customer_complaints: ''
        });
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

      <div className="p-8 max-w-4xl mx-auto bg-white shadow-xl shadow-slate-200/50 rounded-[2rem] border border-slate-100 mt-10">
        <h2 className="text-2xl font-black mb-2 text-slate-800 uppercase italic">
          Open New Job Card
        </h2>
        <p className="text-slate-500 font-bold mb-6 border-b-2 border-slate-100 pb-4 text-sm">
          Intake a vehicle for service and record customer complaints.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-black text-slate-400 uppercase text-xs tracking-widest">Customer Name</label>
              <input type="text" name="customer_name" value={formData.customer_name} onChange={handleChange} required
                className="mt-1 border-2 border-slate-100 p-4 rounded-xl w-full font-bold text-slate-700 outline-none focus:border-indigo-500 uppercase" />
            </div>
            <div>
              <label className="font-black text-slate-400 uppercase text-xs tracking-widest">Mobile Number</label>
              <input type="tel" name="mobile_number" value={formData.mobile_number} onChange={handleChange} required maxLength="10"
                className="mt-1 border-2 border-slate-100 p-4 rounded-xl w-full font-bold text-slate-700 outline-none focus:border-indigo-500" />
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-black text-slate-400 uppercase text-xs tracking-widest">Vehicle Number</label>
              <input type="text" name="vehicle_number" placeholder="GJ-13-XX-1234" value={formData.vehicle_number} onChange={handleChange} required
                className="mt-1 border-2 border-slate-100 p-4 rounded-xl w-full font-bold text-slate-700 outline-none focus:border-indigo-500 uppercase" />
            </div>
            <div>
              <label className="font-black text-slate-400 uppercase text-xs tracking-widest">Model</label>
              <input type="text" name="vehicle_model" placeholder="e.g. Splendor Plus" value={formData.vehicle_model} onChange={handleChange} required
                className="mt-1 border-2 border-slate-100 p-4 rounded-xl w-full font-bold text-slate-700 outline-none focus:border-indigo-500 uppercase" />
            </div>
            <div>
              <label className="font-black text-slate-400 uppercase text-xs tracking-widest">KMs Driven</label>
              <input type="number" name="kms_driven" placeholder="e.g. 15000" value={formData.kms_driven} onChange={handleChange} required
                className="mt-1 border-2 border-slate-100 p-4 rounded-xl w-full font-bold text-slate-700 outline-none focus:border-indigo-500" />
            </div>
          </div>

          {/* Fuel Level & Complaints */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="font-black text-slate-400 uppercase text-xs tracking-widest">Fuel Level Indicator</label>
              <select name="fuel_level" value={formData.fuel_level} onChange={handleChange}
                className="mt-1 border-2 border-slate-100 p-4 rounded-xl w-full font-bold text-slate-700 outline-none focus:border-indigo-500 bg-slate-50 cursor-pointer">
                {fuelOptions.map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="font-black text-slate-400 uppercase text-xs tracking-widest">Customer Complaints / Work Required</label>
              <textarea name="customer_complaints" placeholder="e.g. Oil change, brakes making noise, wash..." value={formData.customer_complaints} onChange={handleChange} required rows="2"
                className="mt-1 border-2 border-slate-100 p-4 rounded-xl w-full font-bold text-slate-700 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white font-black p-4 rounded-xl uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30">
            Create Job Card
          </button>
        </form>
      </div>
    </div>
  );
};

export default OpenJobCard;