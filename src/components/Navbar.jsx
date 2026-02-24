import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role') || 'STAFF';
  
  // Get the current branch from storage, default to '1' (Main Branch)
  const [activeBranch, setActiveBranch] = useState(localStorage.getItem('activeBranch') || '1');

  // Hardcoded branches for now (Later you can fetch these from your database)
  const branches = [
    { id: '1', name: 'Dhrangadhra (Main)' },
    { id: '2', name: 'Halvad (Branch 2)' },
    { id: '3', name: 'Surendranagar (Branch 3)' }
  ];

  const handleBranchChange = (e) => {
    const newBranch = e.target.value;
    setActiveBranch(newBranch);
    localStorage.setItem('activeBranch', newBranch); // Save the new selection
    
    // Refresh the page so the Dashboard fetches the new branch data!
    window.location.reload(); 
  };

  const handleLogout = () => {
    localStorage.clear(); // Wipe all secure data
    navigate('/'); // Send back to login screen
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-100 px-6 py-4 flex justify-between items-center">
      {/* LEFT SIDE: Logo */}
      <div className="flex items-center gap-2">
        <div className="bg-red-600 p-2 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>  
        <Link to={'/dashboard'}>
        <h1 className="text-xl font-black italic tracking-widest text-slate-800 hidden sm:block">
          BAHUCHAR INFOCARE
        </h1>
        </Link>
      </div>

      {/* RIGHT SIDE: Controls */}
      <div className="flex items-center gap-4">
        
        {/* 🚨 THE BRANCH SELECTOR */}
        <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <MapPin size={16} className="text-slate-400 mr-2" />
          <select 
            value={activeBranch}
            onChange={handleBranchChange}
            // 👇 THIS IS THE MAGIC LOCK: Disables the dropdown for Staff!
            disabled={userRole !== 'ADMIN'} 
            className={`bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none pr-4 ${userRole !== 'ADMIN' ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* LOGOUT BUTTON */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-black text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors uppercase"
        >
          <LogOut size={16} />
          Exit
        </button>
      </div>
    </nav>
  );
};

export default Navbar;