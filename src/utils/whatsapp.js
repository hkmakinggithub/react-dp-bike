export const sendWhatsAppMessage = (mobile, customerName, billNo, amount, type = 'BILL') => {
  if (!mobile || mobile.length < 10) {
    alert("Invalid Mobile Number! Cannot send WhatsApp.");
    return;
  }

  // Remove spaces or special chars from number
  const cleanNumber = mobile.replace(/\D/g, ''); 
  // Ensure it has country code (Assuming India +91)
  const finalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

  let message = "";

  if (type === 'BILL') {
    message = `Hello ${customerName},%0a%0aYour Service Bill is generated successfully! ✅%0a%0a📄 *Bill No:* ${billNo}%0a💰 *Total Amount:* ₹${amount}%0a%0aPlease collect your vehicle.%0a%0aRegards,%0a*Bahuchar Infocare*`;
  } else if (type === 'REMINDER') {
    message = `Hello ${customerName},%0a%0aThis is a reminder for your E-Bike Service.%0aPlease visit our showroom.%0a%0a- Bahuchar Infocare`;
  }

  // Open WhatsApp
  const url = `https://wa.me/${finalNumber}?text=${message}`;
  window.open(url, '_blank');
};