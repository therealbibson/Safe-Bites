import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Bell, Shield, LogOut, ChevronRight, MapPin, CreditCard, ShoppingBag } from 'lucide-react';
import Navbar from '../components/Navbar';

const UserPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const menuItems = [
    { icon: <ShoppingBag size={20} />, label: 'Order History', desc: 'View your previous orders and receipts', path: '/orders' },
    { icon: <MapPin size={20} />, label: 'Delivery Addresses', desc: 'Manage your home and office locations' },
    { icon: <CreditCard size={20} />, label: 'Payment Methods', desc: 'Update your cards and digital wallets' },
    { icon: <Bell size={20} />, label: 'Notifications', desc: 'Preferences for alerts and offers' },
    { icon: <Shield size={20} />, label: 'Privacy & Security', desc: 'Password and account security' },
    { icon: <Settings size={20} />, label: 'General Settings', desc: 'App theme and language' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-24">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100 mb-8"
        >
          <div className="flex items-center space-x-6">
            <div className="bg-orange-100 p-6 rounded-full text-orange-600">
              <User size={48} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-stone-800 tracking-tight">{user?.name || 'SafeBite User'}</h1>
              <p className="text-stone-500 font-medium">{user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                Gold Member
              </span>
            </div>
          </div>
        </motion.div>

        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 8 }}
              onClick={() => item.path && navigate(item.path)}
              className="w-full bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all border border-stone-50 flex items-center justify-between group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-stone-50 rounded-xl text-stone-400 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                  {item.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-stone-800">{item.label}</h3>
                  <p className="text-stone-400 text-sm">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="text-stone-300 group-hover:text-orange-500 transition-colors" />
            </motion.button>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={handleLogout}
          className="w-full mt-12 bg-red-50 text-red-600 py-5 rounded-[2rem] font-black flex items-center justify-center space-x-3 hover:bg-red-100 transition-all border border-red-100"
        >
          <LogOut size={24} />
          <span>Log Out of Account</span>
        </motion.button>
      </main>
    </div>
  );
};

export default UserPage;
