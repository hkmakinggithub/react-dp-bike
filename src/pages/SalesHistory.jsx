import React, { useState, useEffect } from 'react';
import { Printer, Search, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import Navbar from '../components/Navbar'; // Adjust path if needed

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const activeBranch = localStorage.getItem('activeBranch') || '1';

  // 1. Fetch all sales from your database
  useEffect(() => {
    const fetchSales = async () => {
      try {
        // Make sure this matches your actual backend API route for getting sales!
        const res = await fetch(`${process.env.BACK}/api/sales/list`, {
          headers: { 'branch-id': activeBranch }
        });
        const data = await res.json();
        setSales(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch sales");
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [activeBranch]);

  // 2. The Print Function (Grabs data from the specific row)
  const handlePrint = (sale) => {
    const doc = new jsPDF();

    // --- Header ---
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38); // Red color for Bahuchar
    doc.text("BAHUCHAR INFOCARE", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("EV Bike Sales & Service | Dhrangadhra, Gujarat", 105, 26, { align: "center" });
    doc.line(10, 30, 200, 30); 

    // --- Receipt Title ---
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("VEHICLE SALE RECEIPT", 105, 42, { align: "center" });

    // --- Customer Details ---
    doc.setFontSize(12);
    // Format the date safely
    const saleDate = sale.date || sale.created_at ? sale.date.split('T')[0] : 'N/A';
    doc.text(`Date: ${saleDate}`, 150, 55);
    doc.text(`Invoice No: INV-${sale.id}`, 150, 62);
    
    doc.text("Customer Information:", 15, 60);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${sale.customer_name || 'N/A'}`, 20, 70);
    doc.text(`Mobile: ${sale.mobile || sale.phone || 'N/A'}`, 20, 80);

    // --- Vehicle Details ---
    doc.setFont("helvetica", "bold");
    doc.text("Vehicle Details:", 15, 100);
    doc.setFont("helvetica", "normal");
    doc.text(`Model Name: ${sale.model_name || 'N/A'}`, 20, 110);
    doc.text(`Color: ${sale.color || 'N/A'}`, 20, 120);
    doc.text(`Chassis No: ${sale.chassis_no || 'N/A'}`, 20, 130);
    doc.text(`Motor No: ${sale.motor_no || 'N/A'}`, 20, 140);

    // --- Payment Details ---
    doc.line(10, 160, 200, 160); 
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount Paid: Rs. ${sale.price || sale.amount || '0'}`, 130, 175);
    
    // --- Footer ---
    doc.setFontSize(10);
    doc.text("Customer Signature", 30, 240);
    doc.text("Authorized Signatory", 140, 240);

    // Open PDF in a new tab to print
    window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-4 md:p-6 mt-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-800 uppercase italic flex items-center gap-2">
              <FileText className="text-indigo-600"/> Sales Record & Printing
            </h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest">Date</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest">Customer Name</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest">Mobile</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest">Model</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest">Price</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="6" className="p-10 text-center font-bold text-slate-400">Loading data...</td></tr>
                ) : sales.length === 0 ? (
                  <tr><td colSpan="6" className="p-10 text-center font-bold text-slate-400">No sales found for this branch.</td></tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                      {/* Adjust these column names if your database uses different names! */}
                      <td className="p-4 text-xs font-bold text-slate-500">{sale.date ? sale.date.split('T')[0] : 'N/A'}</td>
                      <td className="p-4 text-sm font-black text-slate-800 uppercase">{sale.customer_name}</td>
                      <td className="p-4 text-xs font-bold text-slate-500">{sale.mobile || sale.phone || 'N/A'}</td>
                      <td className="p-4 text-xs font-bold text-slate-500">{sale.model_name}</td>
                      <td className="p-4 text-sm font-black text-emerald-600">₹{sale.price}</td>
                      <td className="p-4 text-center">
                        
                        {/* 🖨️ THE PRINT BUTTON FOR THIS SPECIFIC ROW */}
                        <button 
                          onClick={() => handlePrint(sale)}
                          className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 mx-auto"
                        >
                          <Printer size={14} /> Print Receipt
                        </button>

                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SalesHistory;
