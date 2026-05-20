<<<<<<< HEAD
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Bell, Shield, LogOut, ChevronRight, MapPin, CreditCard, ShoppingBag, Camera, Loader2, Star } from 'lucide-react';
=======
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, Settings, Bell, Shield, LogOut, ChevronRight, 
  MapPin, CreditCard, ShoppingBag, ChevronLeft, Plus, 
  Trash2, Edit2, CheckCircle2, Globe, Moon, Languages,
  Lock, Key, Eye, EyeOff, Smartphone
} from 'lucide-react';
>>>>>>> c426b1220887992b23f85ea65b68d05aec8de9b6
import Navbar from '../components/Navbar';

const UserPage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
<<<<<<< HEAD
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState({ orderCount: 0, reviewCount: 0 });

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
=======
  const [activeSection, setActiveSection] = useState('menu');
>>>>>>> c426b1220887992b23f85ea65b68d05aec8de9b6

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
      // 1. Upload the image
      const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token || ''}` // Assuming token might be needed if requireAuth is on
        },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Failed to upload image');
      const { imageUrl } = await uploadRes.json();

      // 2. Update user profile with the new avatar URL
      const updateRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token || ''}`
        },
        body: JSON.stringify({ avatar: imageUrl }),
      });

      if (!updateRes.ok) throw new Error('Failed to update profile');
      const updatedUser = await updateRes.json();

      // 3. Update local state
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

  const renderAddresses = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      {renderSectionHeader('Delivery Addresses')}
      <div className="space-y-4">
        {[
          { type: 'Home', address: '123 Lekki Phase 1, Lagos, Nigeria', isDefault: true },
          { type: 'Office', address: '456 Victoria Island, Lagos, Nigeria', isDefault: false }
        ].map((addr, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                <MapPin size={24} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-stone-800">{addr.type}</h3>
                  {addr.isDefault && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[8px] font-black uppercase rounded-full">Default</span>}
                </div>
                <p className="text-stone-500 text-sm mt-1">{addr.address}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-stone-400 hover:text-orange-600 transition-colors"><Edit2 size={18} /></button>
              <button className="p-2 text-stone-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
        <button className="w-full py-4 border-2 border-dashed border-stone-200 rounded-[2rem] text-stone-400 font-bold flex items-center justify-center space-x-2 hover:border-orange-200 hover:text-orange-500 transition-all">
          <Plus size={20} />
          <span>Add New Address</span>
        </button>
      </div>
    </motion.div>
  );

  const renderPayments = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      {renderSectionHeader('Payment Methods')}
      <div className="space-y-4">
        {[
          { type: 'Visa', last4: '4242', expiry: '12/24', isDefault: true },
          { type: 'Mastercard', last4: '8888', expiry: '09/25', isDefault: false }
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <CreditCard size={24} />
              </div>
              <div>
                <h3 className="font-bold text-stone-800">{card.type} •••• {card.last4}</h3>
                <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">Expires {card.expiry}</p>
              </div>
            </div>
            {card.isDefault ? (
              <span className="text-green-600"><CheckCircle2 size={24} /></span>
            ) : (
              <button className="text-stone-300 hover:text-stone-400"><Trash2 size={20} /></button>
            )}
          </div>
        ))}
        <button className="w-full py-4 border-2 border-dashed border-stone-200 rounded-[2rem] text-stone-400 font-bold flex items-center justify-center space-x-2 hover:border-orange-200 hover:text-orange-500 transition-all">
          <Plus size={20} />
          <span>Add New Card</span>
        </button>
      </div>
    </motion.div>
  );

  const renderNotifications = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      {renderSectionHeader('Notifications')}
      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
        {[
          { label: 'Order Updates', desc: 'Get notified about your order status', enabled: true },
          { label: 'Promotions', desc: 'Best deals and discounts', enabled: false },
          { label: 'System Alerts', desc: 'Account security and app updates', enabled: true },
          { label: 'Newsletter', desc: 'Weekly food trends and stories', enabled: false }
        ].map((item, idx) => (
          <div key={idx} className={`p-6 flex items-center justify-between ${idx !== 0 ? 'border-t border-stone-50' : ''}`}>
            <div>
              <h3 className="font-bold text-stone-800">{item.label}</h3>
              <p className="text-stone-400 text-sm">{item.desc}</p>
            </div>
            <button className={`w-12 h-6 rounded-full transition-all relative ${item.enabled ? 'bg-orange-500' : 'bg-stone-200'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.enabled ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderSecurity = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      {renderSectionHeader('Privacy & Security')}
      <div className="space-y-6">
        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-50">
            <h3 className="font-black text-stone-800 uppercase tracking-tight text-sm mb-4">Password Management</h3>
            <button className="w-full flex items-center justify-between p-4 bg-stone-50 rounded-2xl hover:bg-orange-50 transition-colors group">
              <div className="flex items-center space-x-3 text-stone-600 group-hover:text-orange-600">
                <Key size={18} />
                <span className="font-bold">Change Password</span>
              </div>
              <ChevronRight size={18} className="text-stone-300 group-hover:text-orange-500" />
            </button>
          </div>
          <div className="p-6">
            <h3 className="font-black text-stone-800 uppercase tracking-tight text-sm mb-4">Two-Factor Authentication</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Smartphone size={20} />
                </div>
                <div>
                  <p className="font-bold text-stone-800">Phone Verification</p>
                  <p className="text-xs text-stone-400">Add an extra layer of security</p>
                </div>
              </div>
              <button className="text-orange-600 font-bold text-sm">Enable</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-6">
          <h3 className="font-black text-stone-800 uppercase tracking-tight text-sm mb-4 text-red-600">Danger Zone</h3>
          <button className="w-full flex items-center justify-between p-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors group">
            <div className="flex items-center space-x-3 text-red-600">
              <Trash2 size={18} />
              <span className="font-bold">Delete Account</span>
            </div>
            <ChevronRight size={18} className="text-red-300" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      {renderSectionHeader('General Settings')}
      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b border-stone-50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-stone-50 text-stone-600 rounded-2xl">
              <Languages size={24} />
            </div>
            <div>
              <h3 className="font-bold text-stone-800">Language</h3>
              <p className="text-stone-400 text-sm">Select your preferred language</p>
            </div>
          </div>
          <select className="bg-stone-50 border-none rounded-xl px-4 py-2 font-bold text-stone-600 text-sm outline-none">
            <option>English</option>
            <option>French</option>
            <option>Spanish</option>
          </select>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-stone-50 text-stone-600 rounded-2xl">
              <Moon size={24} />
            </div>
            <div>
              <h3 className="font-bold text-stone-800">Dark Mode</h3>
              <p className="text-stone-400 text-sm">Easier on the eyes at night</p>
            </div>
          </div>
          <button className="w-12 h-6 bg-stone-200 rounded-full relative">
            <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-24">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 mt-8">
<<<<<<< HEAD
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-stone-100 mb-6 sm:mb-8"
        >
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
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <div className="pt-2">
              <h1 className="text-2xl sm:text-3xl font-black text-stone-800 tracking-tight">{user?.name || 'SafeBite User'}</h1>
              <p className="text-stone-500 font-medium text-sm sm:text-base">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-4">
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
        </motion.div>

        <div className="space-y-3 sm:space-y-4">
          {menuItems.map((item, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 8 }}
              onClick={() => item.path && navigate(item.path)}
              className="w-full bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm hover:shadow-md transition-all border border-stone-50 flex items-center justify-between group"
=======
        <AnimatePresence mode="wait">
          {activeSection === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
>>>>>>> c426b1220887992b23f85ea65b68d05aec8de9b6
            >
              <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-stone-100 mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="bg-orange-100 p-4 sm:p-6 rounded-full text-orange-600">
                    <User size={32} className="sm:w-12 sm:h-12" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-stone-800 tracking-tight">{user?.name || 'SafeBite User'}</h1>
                    <p className="text-stone-500 font-medium text-sm sm:text-base">{user?.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider">
                      Gold Member
                    </span>
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

          {activeSection === 'addresses' && renderAddresses()}
          {activeSection === 'payments' && renderPayments()}
          {activeSection === 'notifications' && renderNotifications()}
          {activeSection === 'security' && renderSecurity()}
          {activeSection === 'settings' && renderSettings()}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default UserPage;
