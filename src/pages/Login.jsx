import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, Lock, Bike, KeyRound, ArrowLeft, RefreshCw } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [view, setView] = useState('login'); // 'login', 'forgot', 'reset'
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [otpData, setOtpData] = useState({ otp: '', newPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCreds({ 
      ...creds, 
      [name]: name === 'email' ? value.toLowerCase().trim() : value 
    });
  };

  const handleOtpChange = (e) => {
    setOtpData({ ...otpData, [e.target.name]: e.target.value });
  };

  // --- 1. LOGIN HANDLER ---
const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', creds);
      
      // 1. Save the basic info
      localStorage.setItem('token', response.data.token); 
      localStorage.setItem('role', response.data.user.role);
      localStorage.setItem('activeBranch', response.data.user.branchId);
      
      // 🚨 2. THIS IS THE MISSING LINE: You MUST save the permissions here!
      const userPerms = response.data.user.permissions || [];
      localStorage.setItem('permissions', JSON.stringify(userPerms));
      
      toast.success(`WELCOME ${response.data.user.role}`);
      navigate('/dashboard'); 
    } catch (error) {
      toast.error("Login Failed");
    }
  };
  // --- 2. FORGOT PASSWORD (SEND OTP) ---
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!creds.email) return toast.warn("Please enter your email first.");
    
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/forgot-password', { email: creds.email });
      toast.success(res.data.message || "OTP Sent to your email!");
      setView('reset'); // Move to step 3
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. RESET PASSWORD (VERIFY OTP) ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otpData.otp || !otpData.newPassword) return toast.warn("Please enter OTP and New Password.");

    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/reset-password', { 
        email: creds.email, 
        otp: otpData.otp, 
        newPassword: otpData.newPassword 
      });
      toast.success(res.data.message || "Password Reset! Please log in.");
      setView('login'); // Send back to login screen
      setCreds({ ...creds, password: '' }); // Clear old password
      setOtpData({ otp: '', newPassword: '' }); // Clear OTP data
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password. Invalid OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <ToastContainer theme="colored" position="top-center" autoClose={3000} />
      
      {/* Red Background Decorative Glows */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-500 rounded-full blur-[120px]"
      />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/5 blur-[120px] rounded-full"></div>

      {/* Main Glassmorphism Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-red-900/10 border border-white/20 overflow-hidden relative z-10 min-h-[600px]"
      >
        
        {/* Left Side: Animated Brand Area (Red) */}
        <div className="bg-red-600 p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="mb-8 z-20"
          >
            <div className="bg-white/10 p-8 rounded-[2rem] backdrop-blur-md border border-white/20 shadow-2xl">
                <Bike size={64} className="text-white" />
            </div>
          </motion.div>
          
          <h1 className="text-4xl font-black tracking-tighter text-center italic z-20">
            Bahuchar <br/> Infocare
          </h1>
          <p className="mt-4 text-red-100 text-[10px] font-black tracking-[0.4em] text-center opacity-80 z-20 ">
            Enterprise EV Management
          </p>

          <div className="absolute top-[-10%] left-[-10%] w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-[-5%] right-[-5%] w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
        </div>

        {/* Right Side: Dynamic Form Area */}
        <div className="p-12 flex flex-col justify-center bg-white/40 relative">
          <AnimatePresence mode="wait">
            
            {/* --- VIEW: LOGIN --- */}
            {view === 'login' && (
              <motion.div 
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <div className="mb-10">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tighter italic ">Secure Entry</h2>
                  <div className="h-1 w-12 bg-red-600 mt-1 rounded-full"></div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 tracking-widest ml-1 ">Admin/Staff Identity</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                      <input type="email" name="email" placeholder="EMAIL@BAHUCHAR.COM" value={creds.email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-red-500/10 focus:border-red-600 outline-none transition-all placeholder:text-slate-200 " required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 tracking-widest ml-1 ">Security Key</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                      <input type="password" name="password" placeholder="••••••••" value={creds.password} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-red-500/10 focus:border-red-600 outline-none transition-all placeholder:text-slate-200" required />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="button" onClick={() => setView('forgot')} className="text-[10px] font-black text-slate-400 hover:text-red-600 tracking-widest  transition-colors">
                      Forgot Password?
                    </button>
                  </div>

                  <motion.button whileHover={{ scale: 1.02, backgroundColor: '#b91c1c' }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="w-full bg-red-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-600/20 transition-all tracking-[0.2em] text-sm mt-4 flex items-center justify-center gap-2 ">
                    {isLoading ? "Authenticating..." : <>Initiate Access <LogIn size={18} /></>}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* --- VIEW: FORGOT PASSWORD (EMAIL) --- */}
            {view === 'forgot' && (
              <motion.div 
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <div className="mb-10">
                  <button type="button" onClick={() => setView('login')} className="text-[10px] font-black text-slate-400 hover:text-red-600 tracking-widest  flex items-center gap-1 mb-4 transition-colors">
                    <ArrowLeft size={12} /> Back to Login
                  </button>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tighter italic ">Reset Access</h2>
                  <div className="h-1 w-12 bg-red-600 mt-1 rounded-full"></div>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 tracking-widest ml-1 ">Enter your Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                      <input type="email" name="email" placeholder="EMAIL@BAHUCHAR.COM" value={creds.email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-red-500/10 focus:border-red-600 outline-none transition-all placeholder:text-slate-200 " required />
                    </div>
                  </div>

                  <motion.button whileHover={{ scale: 1.02, backgroundColor: '#b91c1c' }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="w-full bg-red-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-600/20 transition-all tracking-[0.2em] text-sm mt-4 flex items-center justify-center gap-2 ">
                    {isLoading ? "Sending..." : <>Send OTP <KeyRound size={18} /></>}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* --- VIEW: RESET PASSWORD (OTP) --- */}
            {view === 'reset' && (
              <motion.div 
                key="reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <div className="mb-10">
                  <button type="button" onClick={() => setView('login')} className="text-[10px] font-black text-slate-400 hover:text-red-600 tracking-widest  flex items-center gap-1 mb-4 transition-colors">
                    <ArrowLeft size={12} /> Cancel Reset
                  </button>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tighter italic ">Create New Key</h2>
                  <div className="h-1 w-12 bg-red-600 mt-1 rounded-full"></div>
                  <p className="text-xs font-bold text-slate-400 mt-2">OTP sent to {creds.email}</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 tracking-widest ml-1 ">6-Digit OTP</label>
                    <div className="relative group">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                      <input type="text" name="otp" placeholder="000000" maxLength="6" value={otpData.otp} onChange={handleOtpChange} className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-red-500/10 focus:border-red-600 outline-none transition-all placeholder:text-slate-200 tracking-[0.5em]" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 tracking-widest ml-1 ">New Security Key</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                      <input type="password" name="newPassword" placeholder="••••••••" value={otpData.newPassword} onChange={handleOtpChange} className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-red-500/10 focus:border-red-600 outline-none transition-all placeholder:text-slate-200" required />
                    </div>
                  </div>

                  <motion.button whileHover={{ scale: 1.02, backgroundColor: '#b91c1c' }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="w-full bg-red-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-600/20 transition-all tracking-[0.2em] text-sm mt-4 flex items-center justify-center gap-2 ">
                    {isLoading ? "Verifying..." : <>Reset Password <RefreshCw size={18} /></>}
                  </motion.button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>

          <p className="absolute bottom-6 left-0 w-full text-center text-slate-300 text-[9px] font-bold tracking-[0.3em] ">
            AES-256 JWT Encrypted Session
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;