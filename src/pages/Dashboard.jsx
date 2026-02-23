
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Navbar from '../components/Navbar';
import {
  Bike, Truck, Users, Wrench, MapPin, 
  ArrowRightCircle, ArrowLeftCircle, FileText,
  UserPlus, LogOut, ShieldCheck, ShieldAlert, ClipboardList
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole] = useState(localStorage.getItem('role') || '');
  const [permissions] = useState(() => JSON.parse(localStorage.getItem('permissions') || '[]'));

  // 🔐 Security Helper
  const hasAccess = (title) => {
    if (userRole === 'ADMIN') return true; 
    return permissions.some(p => p.toString().toLowerCase().replace(/\s/g, '') === title.toString().toLowerCase().replace(/\s/g, ''));
  };

  // 📋 Your Exact Modules & Routes
  const modules = [
    { title: 'New Sale Entry', icon: <Bike />, color: 'text-slate-600', bg: 'bg-slate-100', path: '/master/client' },
    { title: 'Walk-In Inquiry', icon: <UserPlus />, color: 'text-blue-600', bg: 'bg-blue-50', path: '/inquiries' },
    { title: 'View Inquiries', icon: <ClipboardList />, color: 'text-indigo-600', bg: 'bg-indigo-50', path: '/view-inquiries' },
    { title: 'Open Job Card', icon: <Users />, color: 'text-indigo-600', bg: 'bg-indigo-50', path: '/master/customer2' },
    { title: 'New Service Job', icon: <Wrench />, color: 'text-violet-600', bg: 'bg-violet-50', path: '/master/service2' },
    { title: 'Generate Bill', icon: <FileText />, color: 'text-violet-500', bg: 'bg-violet-50', path: '/master/service' },
    { title: 'Close Job Card', icon: <ArrowRightCircle />, color: 'text-indigo-500', bg: 'bg-indigo-50', path: '/master/customer' },
    { title: 'Supplier Receive', icon: <ArrowLeftCircle />, color: 'text-emerald-500', bg: 'bg-emerald-50', path: '/master/supplier2' },
    { title: 'Supplier Return', icon: <Truck />, color: 'text-red-600', bg: 'bg-red-50', path: '/master/supplier' },
    { title: 'Warranty Tracker', icon: <ShieldCheck />, color: 'text-orange-600', bg: 'bg-orange-50', path: '/warranty' },
    { title: 'Customer Master', icon: <Users />, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/warranty2' },
    { title: 'Staff Management', icon: <ShieldAlert />, color: 'text-red-600', bg: 'bg-red-50', path: '/staff' },
    { title: 'Master Reports', icon: <MapPin />, color: 'text-slate-900', bg: 'bg-slate-200', path: '/master/Reports' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <ToastContainer autoClose={2000} />

      <main className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
        
      

        {/* The Grid - Simple & Clean */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {modules
            .filter(m => hasAccess(m.title))
            .map((item, i) => (
              <Link to={item.path} key={i} className="no-underline group">
                <div className="p-6 border rounded-2xl flex flex-col items-center text-center gap-3 hover:border-black hover:shadow-lg transition-all active:scale-95">
                  <div className={`${item.bg} ${item.color} p-4 rounded-xl group-hover:scale-110 transition-transform`}>
                    {React.cloneElement(item.icon, { size: 28 })}
                  </div>
                  <span className="font-black text-[10px] sm:text-xs uppercase text-slate-700 tracking-tight">
                    {item.title}
                  </span>
                </div>
              </Link>
            ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;