import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // 👈 1. Import it as a variable, not just a side-effect

export const generateInvoicePDF = (billData) => {
  try {
    const doc = new jsPDF();

    // --- 1. HEADER SECTION ---
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("BAHUCHAR INFOCARE", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Professional E-Bike Sales & Service", 14, 26);
    doc.text("Dhrangadhra, Gujarat - 363310", 14, 31);
    doc.text("GSTIN: 24ABCDE1234F1Z5 | Mo: +91 98765 43210", 14, 36);

    // Divider Line
    doc.setLineWidth(0.5);
    doc.setDrawColor(200);
    doc.line(14, 42, 196, 42);

    // --- 2. INVOICE META & CUSTOMER ---
    doc.setFontSize(10);
    doc.setTextColor(0);

    // Right Side: Invoice Details
    doc.text(`INVOICE NO:`, 140, 50);
    doc.text(`${billData.invoiceNo || 'N/A'}`, 170, 50);
    
    doc.text(`DATE:`, 140, 55);
    doc.text(`${new Date().toLocaleDateString()}`, 170, 55);

    // Left Side: Customer Details
    doc.text("BILL TO:", 14, 50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${billData.customerName || 'Guest Customer'}`, 14, 56);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Mobile: ${billData.mobile || 'N/A'}`, 14, 62);
    doc.text(`Vehicle: ${billData.vehicleModel || 'N/A'}`, 14, 67);

    // --- 3. ITEMS TABLE ---
    const tableColumn = ["#", "Description", "Type", "Amount (Rs)"];
    const tableRows = [];

    // Add Service Charge Row
    if (Number(billData.serviceAmount) > 0) {
      tableRows.push([1, "Service / Labour Charges", "Service", billData.serviceAmount]);
    }

    // Add Parts Row
    if (Number(billData.partsAmount) > 0) {
      tableRows.push([2, "Spare Parts & Consumables", "Parts", billData.partsAmount]);
    }

    // 👈 2. USE THIS FUNCTION SYNTAX INSTEAD OF doc.autoTable
    autoTable(doc, {
      startY: 75,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' }, // Indigo Color
      styles: { fontSize: 10, cellPadding: 4 },
    });

    // --- 4. TOTALS SECTION ---
    // Get the Y position where the table ended
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 80;
    
    doc.setFontSize(10);
    doc.text("Sub Total:", 140, finalY);
    doc.text(`${billData.total || 0}`, 170, finalY);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("GRAND TOTAL:", 140, finalY + 10);
    doc.text(`Rs. ${billData.grandTotal || 0}`, 180, finalY + 10, { align: 'left' });

    // --- 5. FOOTER & TERMS ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100);
    
    const termsY = 250;
    doc.text("TERMS & CONDITIONS:", 14, termsY);
    doc.text("1. Goods once sold will not be taken back.", 14, termsY + 5);
    doc.text("2. Warranty as per manufacturer policy only.", 14, termsY + 10);
    doc.text("3. Subject to Dhrangadhra Jurisdiction.", 14, termsY + 15);

    doc.text("Authorized Signatory", 150, termsY + 20);
    doc.line(150, termsY + 18, 190, termsY + 18); // Signature Line

    // Save the PDF
    doc.save(`Invoice_${billData.invoiceNo || 'Draft'}.pdf`);

  } catch (error) {
    console.error("PDF Generation Failed:", error);
    alert("Could not generate PDF. Please check console for details.");
  }
};

export const sendWhatsAppMessage = (mobile, customerName, billNo, amount, type = 'BILL') => {
  if (!mobile || mobile.length < 10) {
    alert("Invalid Mobile Number! Cannot send WhatsApp.");
    return;
  }

  // 1. Clean the number (remove spaces, +, -, etc.)
  const cleanNumber = mobile.toString().replace(/\D/g, ''); 
  
  // 2. Ensure it has the India country code (91)
  const finalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

  // 3. Create the message
  let message = "";
  if (type === 'BILL') {
    message = `Hello ${customerName},%0a%0aYour Service Bill is generated successfully! ✅%0a%0a📄 *Bill No:* ${billNo}%0a💰 *Total Amount:* ₹${amount}%0a%0aPlease collect your vehicle.%0a%0aRegards,%0a*Bahuchar Infocare*`;
  }

  // 4. USE THE OFFICIAL API LINK (Better for unsaved numbers!)
  const url = `https://api.whatsapp.com/send?phone=${finalNumber}&text=${message}`;
  
  // 5. Open in new tab
  window.open(url, '_blank');
};