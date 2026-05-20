import React from 'react';
import { Settings, Hammer, Clock } from 'lucide-react';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-8 animate-pulse">
        <Settings size={48} className="animate-spin-slow" />
      </div>
      
      <h1 className="text-4xl sm:text-5xl font-black text-stone-800 uppercase tracking-tight mb-4">
        Under <span className="text-orange-600">Maintenance</span>
      </h1>
      
      <p className="text-xl text-stone-500 font-bold mb-12 max-w-md mx-auto">
        We're currently updating our kitchen to serve you better. We'll be back shortly!
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-stone-100">
          <Clock className="text-orange-500" size={20} />
          <span className="font-bold text-stone-700">Back in: 30 mins</span>
        </div>
        <div className="flex items-center space-x-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-stone-100">
          <Hammer className="text-orange-500" size={20} />
          <span className="font-bold text-stone-700">Status: Updating</span>
        </div>
      </div>
      
      <div className="mt-16 text-stone-300 font-black uppercase tracking-[0.2em] text-xs">
        SafeBite • Quality Food Fast
      </div>
    </div>
  );
};

export default Maintenance;
