import React from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-orange-500 flex flex-col items-center justify-center text-white px-6">
      <div className="mb-8 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </div>
      <h1 className="text-5xl font-bold mb-4 tracking-tighter">SafeBite</h1>
      <p className="text-xl text-orange-100 mb-12 text-center">Delicious meals delivered safely to your doorstep.</p>
      <button 
        onClick={() => navigate('/signin')}
        className="bg-white text-orange-600 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-orange-50 transition-all active:scale-95"
      >
        Get Started
      </button>
    </div>
  );
};

export default SplashScreen;
