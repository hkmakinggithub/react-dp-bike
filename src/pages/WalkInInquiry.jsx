import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const WalkInInquiry = () => {
  const [formData, setFormData] = useState({
    customer_name: '',
    mobile_number: '',
    interested_model: '',
    follow_up_date: '',
    notes: ''
  });

  // Hardcoded models for now (you can change these to your actual bikes)
  const bikeModels = [
    "Honda Shine 125",
    "Hero Splendor Plus",
    "TVS Apache RTR 160",
    "Bajaj Pulsar 150",
    "Royal Enfield Classic 350",
    "Other / Undecided"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Grab the active branch from storage so the lead goes to the right shop
    const branchId = localStorage.getItem('activeBranch') || '1';
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${process.env.BACK}/api/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, branch_id: branchId })
      });

      if (res.ok) {
        toast.success("✅ Lead Saved Successfully!");
        setFormData({
          customer_name: '',
          mobile_number: '',
          interested_model: '',
          follow_up_date: '',
          notes: ''
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

      <div className="p-8 max-w-3xl mx-auto bg-white shadow-xl shadow-slate-200/50 rounded-[2rem] border border-slate-100 mt-10">
        <h2 className="text-2xl font-black mb-2 text-slate-800 uppercase italic">
          New Walk-In Inquiry
        </h2>
        <p className="text-slate-500 font-bold mb-6 border-b-2 border-slate-100 pb-4 text-sm">
          Save customer details to follow up and close the sale later.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Name and Mobile */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full">
              <label className="font-black text-slate-400 uppercase text-xs tracking-widest">Customer Name</label>
              <input 
                type="text" name="customer_name" placeholder="e.g. Rahul Bhai" 
                value={formData.customer_name} onChange={handleChange} required
                className="mt-1 border-2 border-slate-100 p-4 rounded-xl w-full font-bold text-slate-700 outline-none focus:border-red-500 uppercase"
              />
            </div>
            <div className="w-full">
              <label className="font-black text-slate-400 uppercase text-xs tracking-widest">Mobile Number</label>
              <input 
                type="tel" name="mobile_number" placeholder="10-digit number" 
                value={formData.mobile_number} onChange={handleChange} required maxLength="10"
                className="mt-1 border-2 border-slate-100 p-4 rounded-xl w-full font-bold text-slate-700 outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Row 2: Bike Model and Follow Up Date */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full">
              <label className="font-black text-slate-400 uppercase text-xs tracking-widest">Interested Model</label>
              <select 
                name="interested_model" value={formData.interested_model} onChange={handleChange} required
                className="mt-1 border-2 border-slate-100 p-4 rounded-xl w-full font-bold text-slate-700 outline-none focus:border-red-500 cursor-pointer appearance-none bg-slate-50"
              >
                <option value="" disabled>Select a bike...</option>
                {bikeModels.map((bike, index) => (
                  <option key={index} value={bike}>{bike}</option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <label className="font-black text-slate-400 uppercase text-xs tracking-widest">Follow-Up Date</label>
              <input 
                type="date" name="follow_up_date" 
                value={formData.follow_up_date} onChange={handleChange} required
                className="mt-1 border-2 border-slate-100 p-4 rounded-xl w-full font-bold text-slate-700 outline-none focus:border-red-500 cursor-pointer text-sm"
              />
            </div>
          </div>

          {/* Row 3: Notes */}
          <div>
            <label className="font-black text-slate-400 uppercase text-xs tracking-widest">Staff Notes / Remarks</label>
            <textarea 
              name="notes" placeholder="What did they like? Are they checking finance? (Optional)" 
              value={formData.notes} onChange={handleChange} rows="3"
              className="mt-1 border-2 border-slate-100 p-4 rounded-xl w-full font-bold text-slate-700 outline-none focus:border-red-500"
            ></textarea>
          </div>

          <button type="submit" className="w-full bg-red-600 text-white font-black p-4 rounded-xl uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30">
            Save Customer Lead
          </button>
        </form>
      </div>
    </div>
  );
};

export default WalkInInquiry;