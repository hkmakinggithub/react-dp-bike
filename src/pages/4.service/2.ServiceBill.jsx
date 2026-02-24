import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Save, Search, Receipt, Printer, MessageCircle } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Ensure these utility files exist in your project!
import { generateInvoicePDF } from '../../utils/invoiceGenerator'; 
import { sendWhatsAppMessage } from '../../utils/whatsapp'; 

const ServiceJobOut = () => {
  const activeBranch = localStorage.getItem('activeBranch') || '1';

  const [outNo, setOutNo] = useState('LOADING...');
  const [pendingList, setPendingList] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    outNo: '', 
    date: new Date().toISOString().split('T')[0], 
    jobNo: '', 
    customerName: '', 
    mobile: '', 
    modelName: '', 
    serviceType: '', 
    serviceAmount: 0, 
    partsAmount: 0, 
    grandTotal: 0
  });

  useEffect(() => {
    fetchData();
  }, [activeBranch]);

  const fetchData = async () => {
    try {
      const headers = { 
        'branch-id': activeBranch, 
        'Content-Type': 'application/json' 
      };

      const numRes = await fetch(`${import.meta.env.VITE_BACK}/api/service-out-no`, { headers });
      const numData = await numRes.json();
      setOutNo(numData.outNo);

      const pendRes = await fetch(`${import.meta.env.VITE_BACK}/api/pending-service-jobs`, { headers });
      const data = await pendRes.json();
      setPendingList(Array.isArray(data) ? data : []);

    } catch (err) { 
      console.error("Fetch failed", err); 
      toast.error("Failed to load billing data");
    }
  };

  const handleSelectJob = (e) => {
    const jNo = e.target.value;
    const job = pendingList.find(j => j.job_no === jNo);
    
    if (job) {
      setSelectedJob(job);
      const serviceCharge = Number(job.total_amount || 0);
      setFormData({
        ...formData,
        outNo: outNo,
        jobNo: jNo,
        customerName: job.customer_name,
        mobile: job.mobile, 
        modelName: job.model_name,
        serviceType: job.service_type,
        serviceAmount: serviceCharge,
        partsAmount: 0,
        grandTotal: serviceCharge 
      });
    } else {
      setSelectedJob(null);
      setFormData({ ...formData, jobNo: '', mobile: '', grandTotal: 0, partsAmount: 0 }); 
    }
  };

  const handlePartsChange = (e) => {
    const pAmount = Number(e.target.value);
    const sAmount = Number(selectedJob?.total_amount || 0);
    setFormData({
      ...formData,
      partsAmount: pAmount,
      grandTotal: sAmount + pAmount 
    });
  };

  const handleSave = async () => {
    if (!formData.jobNo) return toast.warn("Please select a Pending Job first");

    setIsSaving(true);

    const payload = {
      outNo,
      date: formData.date,
      jobNo: formData.jobNo,
      customerName: selectedJob.customer_name,
      modelName: selectedJob.model_name,
      serviceType: selectedJob.service_type,
      serviceAmount: selectedJob.total_amount,
      partsAmount: formData.partsAmount,
      grandTotal: formData.grandTotal,
      branchId: activeBranch
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_BACK}/api/save-service-bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'branch-id': activeBranch },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Bill Saved to Database!");

        try {
          const pdfData = {
            invoiceNo: outNo,
            customerName: selectedJob.customer_name,
            vehicleModel: selectedJob.model_name,
            serviceAmount: selectedJob.total_amount,
            partsAmount: formData.partsAmount,
            grandTotal: formData.grandTotal
          };
          if(typeof generateInvoicePDF === 'function') {
            generateInvoicePDF(pdfData);
          }
        } catch (pdfErr) {
          console.error("PDF Error:", pdfErr);
          toast.warning("Bill Saved, but PDF failed to download.");
        }

        setFormData({ 
          outNo: '', date: new Date().toISOString().split('T')[0], 
          jobNo: '', customerName: '', mobile: '', modelName: '', 
          serviceType: '', serviceAmount: 0, partsAmount: 0, grandTotal: 0 
        });
        setSelectedJob(null);
        fetchData(); 

      } else {
        toast.error("Save Failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Server Error. Check Backend.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-violet-50 font-sans pb-12">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="max-w-4xl mx-auto p-6 mt-4">
        <header className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-violet-900 uppercase italic">Service Bill (Job Out)</h1>
            <p className="text-violet-600/60 text-sm font-bold uppercase">Branch ID: {activeBranch}</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill No</div>
            <div className="text-2xl font-black text-violet-600">{outNo}</div>
          </div>
        </header>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-violet-100">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Out Date</label>
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold text-slate-600 outline-none focus:border-violet-500" />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Select Pending Job</label>
              <div className="relative">
                <select value={formData.jobNo} onChange={handleSelectJob} className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-violet-500 bg-white appearance-none">
                  <option value="">-- SELECT PENDING JOB --</option>
                  {pendingList.map(j => (
                    <option key={j.id} value={j.job_no}>
                      {j.job_no} - {j.customer_name} ({j.model_name})
                    </option>
                  ))}
                </select>
                <Search className="absolute right-4 top-4 text-slate-300 pointer-events-none" size={18} />
              </div>
            </div>
          </div>

          {selectedJob && (
            <div className="bg-violet-50/50 p-6 rounded-2xl border border-violet-100 mb-8 animate-in fade-in slide-in-from-top-4">
              <h3 className="font-black text-violet-800/40 uppercase text-xs tracking-widest mb-4">Job Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Customer</div>
                  <div className="font-bold text-slate-800">{selectedJob.customer_name}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Model</div>
                  <div className="font-bold text-slate-800">{selectedJob.model_name}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Warranty</div>
                  <div className={`font-bold ${selectedJob.is_warranty === 'YES' ? 'text-green-600' : 'text-slate-800'}`}>{selectedJob.is_warranty}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Type</div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${selectedJob.service_type === 'FREE' ? 'bg-green-500' : 'bg-orange-500'}`}>
                    {selectedJob.service_type}
                  </span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-violet-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Services Performed</div>
                <div className="text-sm font-medium text-slate-600">{selectedJob.selected_services}</div>
              </div>
            </div>
          )}

          {selectedJob && (
            <div className="space-y-4">
              <h3 className="font-black text-slate-800 uppercase italic">Final Calculation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                   <div className="text-[10px] font-bold text-slate-400 uppercase">Service Charges</div>
                   <div className="text-xl font-black text-slate-700">₹{selectedJob.total_amount}</div>
                </div>
                <div className="relative">
                   <div className="text-[10px] font-bold text-violet-600 uppercase mb-1">New Parts / Repair Cost</div>
                   <input type="number" autoFocus placeholder="0" value={formData.partsAmount || ''} onChange={handlePartsChange} className="w-full border-2 border-violet-200 bg-violet-50 p-3 rounded-xl font-black text-xl text-violet-800 outline-none focus:border-violet-500" />
                </div>
                <div className="p-4 rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/30">
                   <div className="text-[10px] font-bold text-violet-200 uppercase">Grand Total to Pay</div>
                   <div className="text-3xl font-black">₹{formData.grandTotal}</div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button onClick={handleSave} disabled={isSaving} className="flex-1 py-4 bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all flex justify-center items-center gap-2">
                  {isSaving ? "GENERATING..." : <><Receipt size={20}/> GENERATE FINAL BILL</>}
                </button>
                <button onClick={() => {
                  let customerMobile = formData.mobile;
                  if (!customerMobile || customerMobile.length < 10) {
                    customerMobile = window.prompt(`No mobile number found. Please enter a 10-digit WhatsApp number:`);
                  }
                  if (customerMobile && customerMobile.length >= 10) {
                    if (typeof sendWhatsAppMessage === 'function') {
                      sendWhatsAppMessage(customerMobile, formData.customerName, outNo, formData.grandTotal);
                    } else {
                      toast.info("WhatsApp module not connected yet!");
                    }
                  }
                }} className="px-6 py-4 bg-green-500 text-white rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-green-600 transition-all flex justify-center items-center gap-2">
                  <MessageCircle size={24} /> WHATSAPP
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 🧾 THE HIDDEN INVOICE */}
        <div id="printable-bill" className="hidden print:block p-8 bg-white text-black">
           <div className="text-center border-b-2 border-black pb-4 mb-4">
              <h1 className="text-4xl font-black uppercase">Bahuchar Infocare</h1>
              <p className="font-bold">Branch ID: {activeBranch}</p>
              <p className="text-sm">Professional E-Bike Service & Sales</p>
           </div>
           <div className="flex justify-between mb-6 text-sm font-bold uppercase">
              <div>
                 <p>Bill No: {formData.outNo}</p>
                 <p>Date: {formData.date}</p>
              </div>
              <div className="text-right">
                 <p>Job No: {formData.jobNo}</p>
                 <p>Customer: {formData.customerName}</p>
              </div>
           </div>
           <table className="w-full border-collapse border border-black mb-6">
              <thead>
                 <tr className="bg-gray-200">
                    <th className="border border-black p-3 text-left">Description</th>
                    <th className="border border-black p-3 text-right">Amount (₹)</th>
                 </tr>
              </thead>
              <tbody>
                 <tr>
                    <td className="border border-black p-3">Service Charges <span className="text-xs ml-2">({formData.serviceType})</span></td>
                    <td className="border border-black p-3 text-right">{formData.serviceAmount}</td>
                 </tr>
                 <tr>
                    <td className="border border-black p-3">Parts / Spares Used</td>
                    <td className="border border-black p-3 text-right">{formData.partsAmount}</td>
                 </tr>
                 <tr className="font-black text-xl">
                    <td className="border border-black p-3 text-right">GRAND TOTAL</td>
                    <td className="border border-black p-3 text-right">₹{formData.grandTotal}</td>
                 </tr>
              </tbody>
           </table>
           <div className="flex justify-between items-end mt-12 pt-4 border-t border-black">
              <div className="text-xs font-bold">
                 <p>Terms & Conditions:</p>
                 <p>1. Subject to Local Jurisdiction.</p>
                 <p>2. Warranty as per company policy.</p>
              </div>
              <div className="text-center">
                 <p className="font-bold mb-8">For, Bahuchar Infocare</p>
                 <p className="text-xs">(Authorized Signatory)</p>
              </div>
           </div>
           <div className="text-center mt-8 text-xs font-bold">THANK YOU FOR YOUR BUSINESS!</div>
        </div>
      </div>
    </div>
  );
};

export default ServiceJobOut;