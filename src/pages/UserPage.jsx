import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, Settings, Bell, Shield, LogOut, ChevronRight, 
  MapPin, CreditCard, ShoppingBag, Camera, Loader2, Star,
  ChevronLeft, Plus, Trash2, Edit2, CheckCircle2, Smartphone, Key
} from 'lucide-react';
import Navbar from '../components/Navbar';

const UserPage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState({ orderCount: 0, reviewCount: 0 });
  const [activeSection, setActiveSection] = useState('menu');

  React.useEffect(() => {
    const fetchStats = async () => {
      if (!user?._id && !user?.id) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user._id || user.id}/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };
    fetchStats();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Failed to upload image');
      const { imageUrl } = await uploadRes.json();

      const updateRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user._id || user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        },
        body: JSON.stringify({ avatar: imageUrl }),
      });

      if (!updateRes.ok) throw new Error('Failed to update profile');
      const updatedUser = await updateRes.json();
      updateUser({ avatar: updatedUser.avatar });
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert('Failed to update avatar. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const menuItems = [
    { id: 'orders', icon: <ShoppingBag size={20} />, label: 'Order History', desc: 'View your previous orders and receipts', path: '/orders' },
    { id: 'addresses', icon: <MapPin size={20} />, label: 'Delivery Addresses', desc: 'Manage your home and office locations' },
    { id: 'payments', icon: <CreditCard size={20} />, label: 'Payment Methods', desc: 'Update your cards and digital wallets' },
    { id: 'notifications', icon: <Bell size={20} />, label: 'Notifications', desc: 'Preferences for alerts and offers' },
    { id: 'security', icon: <Shield size={20} />, label: 'Privacy & Security', desc: 'Password and account security' },
    { id: 'settings', icon: <Settings size={20} />, label: 'General Settings', desc: 'App theme and language' },
  ];

  const renderSectionHeader = (title) => (
    <div className="flex items-center mb-8">
      <button 
        onClick={() => setActiveSection('menu')}
        className="p-2 mr-4 bg-white rounded-full shadow-sm text-stone-600 hover:bg-orange-50 hover:text-orange-600 transition-all"
      >
        <ChevronLeft size={24} />
      </button>
      <h1 className="text-2xl sm:text-3xl font-black text-stone-800 tracking-tight uppercase">{title}</h1>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-24">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 mt-8">
        <AnimatePresence mode="wait">
          {activeSection === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-stone-100 mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative group">
                    <div 
                      onClick={handleAvatarClick}
                      className="w-24 h-24 sm:w-32 sm:h-32 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 overflow-hidden cursor-pointer border-4 border-white shadow-md relative"
                    >
                      {isUploading ? (
                        <Loader2 size={32} className="animate-spin" />
                      ) : user?.avatar ? (
                        <img 
                          src={`${import.meta.env.VITE_API_BASE_URL}${user.avatar}`} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={32} className="sm:w-12 sm:h-12" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Camera size={24} />
                      </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  </div>
                  <div className="pt-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-stone-800 tracking-tight">{user?.name || 'SafeBite User'}</h1>
                    <p className="text-stone-500 font-medium text-sm sm:text-base">{user?.email}</p>
                    <div className="flex items-center space-x-2 mt-4 justify-center sm:justify-start">
                      <div className="flex items-center space-x-2 bg-orange-600 px-4 py-2 rounded-xl shadow-lg shadow-orange-100">
                        <ShoppingBag size={14} className="text-white" />
                        <span className="text-white font-black text-sm">{stats.orderCount}</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-amber-500 px-4 py-2 rounded-xl shadow-lg shadow-amber-100">
                        <Star size={14} className="text-white" />
                        <span className="text-white font-black text-sm">{stats.reviewCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 8 }}
                    onClick={() => item.path ? navigate(item.path) : setActiveSection(item.id)}
                    className="w-full bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm hover:shadow-md transition-all border border-stone-50 flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="p-2.5 sm:p-3 bg-stone-50 rounded-xl text-stone-400 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                        {React.cloneElement(item.icon, { size: 20, className: "sm:w-5 sm:h-5" })}
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-stone-800 text-sm sm:text-base">{item.label}</h3>
                        <p className="text-stone-400 text-xs sm:text-sm">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-stone-300 group-hover:text-orange-500 transition-colors sm:w-5 sm:h-5" />
                  </motion.button>
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={handleLogout}
                className="w-full mt-8 sm:mt-12 bg-red-50 text-red-600 py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] font-black flex items-center justify-center space-x-2 sm:space-x-3 hover:bg-red-100 transition-all border border-red-100 text-sm sm:text-base"
              >
                <LogOut size={20} className="sm:w-6 sm:h-6" />
                <span>Log Out of Account</span>
              </motion.button>
            </motion.div>
          )}

          {activeSection !== 'menu' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              {renderSectionHeader(menuItems.find(m => m.id === activeSection)?.label)}
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-stone-200">
                <div className="bg-stone-50 p-4 rounded-full mb-4 text-stone-300">
                  {menuItems.find(m => m.id === activeSection)?.icon}
                </div>
                <h3 className="text-lg font-bold text-stone-600 uppercase tracking-widest">Section under development</h3>
                <p className="text-stone-400 text-sm">This module will be available in the next update.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default UserPage;
