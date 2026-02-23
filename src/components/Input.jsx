import React from 'react';

const Input = ({ label, type = "text", name, value, onChange, placeholder }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        // Force uppercase to maintain high-quality "strong data"
        onChange={(e) => onChange(name, e.target.value.toUpperCase())}
        className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white 
                   focus:ring-2 focus:ring-blue-500 outline-none transition-all 
                   placeholder:text-slate-700 font-bold"
        required
      />
    </div>
  );
};

export default Input;