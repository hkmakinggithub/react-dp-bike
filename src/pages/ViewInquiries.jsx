import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ViewInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // This runs automatically when the page opens
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token');
      const branchId = localStorage.getItem('activeBranch') || '1';

      const res = await fetch('http://localhost:5000/api/inquiries', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'branch-id': branchId // 👈 Keeps data secure by branch!
        }
      });

      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      } else {
        toast.error("Failed to load leads from server.");
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to make dates look pretty (e.g., "15 Mar 2026")
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };
const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/inquiries/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        toast.success(`✅ Status updated to ${newStatus}`);
        fetchLeads(); // Refresh the table to show the new colors!
      } else {
        toast.error("❌ Failed to update status");
      }
    } catch (error) {
      toast.error("❌ Network error");
    }
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="p-8 max-w-7xl mx-auto mt-6">
        <div className="flex justify-between items-center mb-6 border-b-2 border-slate-200 pb-4">
          <h2 className="text-2xl font-black text-slate-800 uppercase italic">
            Sales Leads & Follow-Ups
          </h2>
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold text-sm">
            Total Leads: {inquiries.length}
          </div>
        </div>

        {loading ? (
          <div className="text-center font-bold text-slate-500 animate-pulse mt-20">Loading Leads...</div>
        ) : inquiries.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-2xl border border-slate-200 shadow-sm">
            <p className="font-black text-slate-400 uppercase text-lg">No inquiries found for this branch.</p>
          </div>
        ) : (
          <div className="bg-white shadow-xl shadow-slate-200/50 rounded-[2rem] border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase tracking-widest">
                    <th className="p-4 font-black">Date</th>
                    <th className="p-4 font-black">Customer Name</th>
                    <th className="p-4 font-black">Mobile</th>
                    <th className="p-4 font-black">Interested In</th>
                    <th className="p-4 font-black bg-red-600">Call On</th>
                    <th className="p-4 font-black">Status</th>
                       <th className="p-4 font-black">work</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-semibold text-slate-700">
                  {inquiries.map((lead) => (
                    <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">{formatDate(lead.visit_date)}</td>
                      <td className="p-4 text-slate-900 font-black">{lead.customer_name}</td>
                      <td className="p-4 text-indigo-600">{lead.mobile_number}</td>
                      <td className="p-4">{lead.interested_model}</td>
                      <td className="p-4 text-red-600 font-black">{formatDate(lead.follow_up_date)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                          lead.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {lead.status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-4">
    <select
      value={lead.status || 'Pending'}
      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
      className={`px-3 py-1 rounded-full text-xs font-black uppercase cursor-pointer outline-none border-2 transition-all ${
        lead.status === 'Sold' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
        lead.status === 'Not Interested' ? 'bg-slate-100 text-slate-500 border-slate-200' :
        'bg-yellow-100 text-yellow-700 border-yellow-200 hover:border-yellow-400'
      }`}
    >
      <option value="Pending">Pending</option>
      <option value="Sold">Sold</option>
      <option value="Not Interested">Not Interested</option>
    </select>
  </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewInquiries;