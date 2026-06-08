import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, Settings, Bell, Shield, LogOut, ChevronRight, 
  MapPin, CreditCard, ShoppingBag, Camera, Loader2, Star,
  ChevronLeft, Plus, Trash2, Edit2, CheckCircle2, Smartphone, Key,
  Check
} from 'lucide-react';
import Navbar from '../components/Navbar';

const UserPage = () => {
  const { user, logout, updateUser } = useAuth();
  const { notifications, markAsRead, markAllAsRead, loading: notificationsLoading } = useNotifications();
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

  const handleUpdatePaymentMethods = async (updatedMethods) => {
    try {
      const uId = user?._id || user?.id;
      if (!uId) throw new Error('Authentication required');

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${uId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': uId,
          'x-user-role': user?.role
        },
        body: JSON.stringify({ paymentMethods: updatedMethods }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update payment methods');
      }

      const updatedUser = await response.json();
      updateUser({ paymentMethods: updatedUser.paymentMethods });
    } catch (error) {
      console.error('Error updating payment methods:', error);
      alert(error.message || 'Failed to update payment methods. Please try again.');
    }
  };

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
      const uId = user?._id || user?.id;
      if (!uId) throw new Error('Authentication required');

      console.log('[UserPage] Uploading avatar for user:', uId);

      const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'x-user-id': uId,
          'x-user-role': user?.role || 'user'
        },
        body: formData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.error || error.details || 'Failed to upload image');
      }
      
      const { imageUrl } = await uploadRes.json();
      console.log('[UserPage] Avatar upload successful:', imageUrl);

      const updateRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${uId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': uId,
          'x-user-role': user?.role
        },
        body: JSON.stringify({ avatar: imageUrl }),
      });

      if (!updateRes.ok) {
        const error = await updateRes.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      const updatedUser = await updateRes.json();
      updateUser({ avatar: updatedUser.avatar });
      alert('Avatar updated successfully!');
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert(error.message || 'Failed to update avatar. Please try again.');
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
                          src={user.avatar.startsWith('http') || user.avatar.startsWith('data:') ? user.avatar : `${import.meta.env.VITE_API_BASE_URL}${user.avatar}`} 
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
                    <div className="flex flex-col sm:flex-row items-center sm:items-end sm:space-x-3 mb-1">
                      <h1 className="text-2xl sm:text-3xl font-black text-stone-800 tracking-tight">{user?.name || 'SafeBite User'}</h1>
                      <div className="flex items-center space-x-1.5 mt-1 sm:mt-0 mb-1">
                        {user?.isVerified ? (
                          <div className="flex items-center space-x-1 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                            <CheckCircle2 size={10} />
                            <span>Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1 bg-stone-100 text-stone-500 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-stone-200">
                              <Shield size={10} />
                              <span>Unverified</span>
                            </div>
                            <button 
                              onClick={() => {
                                sessionStorage.setItem('signupEmail', user.email);
                                navigate('/verify-otp');
                              }}
                              className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline"
                            >
                              Verify Now
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
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
            <motion.div key={activeSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              {renderSectionHeader(menuItems.find(m => m.id === activeSection)?.label)}
              
              {activeSection === 'notifications' ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6 px-2">
                    <p className="text-stone-400 font-bold text-xs sm:text-sm">You have {notifications.filter(n => !n.isRead).length} unread notifications</p>
                    <button 
                      onClick={markAllAsRead}
                      className="text-orange-600 font-black text-[10px] sm:text-xs uppercase tracking-widest hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-stone-200">
                      <Bell className="text-stone-200 mb-4" size={48} />
                      <p className="text-stone-400 font-bold">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <div 
                          key={n._id}
                          onClick={() => !n.isRead && markAsRead(n._id)}
                          className={`bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-stone-100 flex items-start space-x-4 relative overflow-hidden transition-all ${!n.isRead ? 'border-l-4 border-l-orange-500 bg-orange-50/10' : ''}`}
                        >
                          <div className={`p-2.5 sm:p-3 rounded-xl ${!n.isRead ? 'bg-orange-100 text-orange-600' : 'bg-stone-50 text-stone-400'}`}>
                            <Bell size={18} className="sm:w-5 sm:h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className={`font-black text-sm sm:text-base truncate ${!n.isRead ? 'text-stone-800' : 'text-stone-500'}`}>{n.title}</h3>
                              <span className="text-[9px] sm:text-[10px] text-stone-400 font-bold uppercase whitespace-nowrap ml-2">{new Date(n.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">{n.message}</p>
                            {n.title === "Order Delivered!" && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/orders');
                                }}
                                className="mt-3 flex items-center space-x-1.5 bg-orange-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-md shadow-orange-100"
                              >
                                <Star size={10} fill="currentColor" />
                                <span>Review Now</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : activeSection === 'payments' ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-2 px-2">
                    <p className="text-stone-400 font-bold text-xs sm:text-sm">Manage your saved cards and wallets</p>
                    <button 
                      onClick={() => {
                        const type = prompt("Enter card type (visa, mastercard):", "visa");
                        const last4 = prompt("Enter last 4 digits:", "4242");
                        const expiry = prompt("Enter expiry date (MM/YY):", "12/25");
                        if (type && last4 && expiry) {
                          const newMethod = {
                            id: Math.random().toString(36).substr(2, 9),
                            type: type.toLowerCase(),
                            last4,
                            expiry,
                            isDefault: (user.paymentMethods || []).length === 0
                          };
                          const updatedMethods = [...(user.paymentMethods || []), newMethod];
                          handleUpdatePaymentMethods(updatedMethods);
                        }
                      }}
                      className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-100"
                    >
                      <Plus size={14} />
                      <span>Add New</span>
                    </button>
                  </div>

                  {(!user.paymentMethods || user.paymentMethods.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-stone-200">
                      <CreditCard className="text-stone-200 mb-4" size={48} />
                      <p className="text-stone-400 font-bold">No payment methods saved</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {user.paymentMethods.map((method) => (
                        <div 
                          key={method.id}
                          className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400 uppercase font-black text-[10px]">
                              {method.type === 'visa' ? (
                                <span className="text-blue-600 text-lg italic">VISA</span>
                              ) : method.type === 'mastercard' ? (
                                <span className="text-red-500 text-lg font-serif">MC</span>
                              ) : (
                                <CreditCard size={20} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-bold text-stone-800">•••• •••• •••• {method.last4}</h3>
                                {method.isDefault && (
                                  <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">Default</span>
                                )}
                              </div>
                              <p className="text-stone-400 text-xs font-medium">Expires {method.expiry}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!method.isDefault && (
                              <button 
                                onClick={() => {
                                  const updated = user.paymentMethods.map(m => ({
                                    ...m,
                                    isDefault: m.id === method.id
                                  }));
                                  handleUpdatePaymentMethods(updated);
                                }}
                                className="p-2 text-stone-300 hover:text-green-500 transition-colors"
                                title="Set as default"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                if (confirm("Are you sure you want to remove this payment method?")) {
                                  const updated = user.paymentMethods.filter(m => m.id !== method.id);
                                  handleUpdatePaymentMethods(updated);
                                }
                              }}
                              className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-stone-200">
                  <div className="bg-stone-50 p-4 rounded-full mb-4 text-stone-300">
                    {menuItems.find(m => m.id === activeSection)?.icon}
                  </div>
                  <h3 className="text-lg font-bold text-stone-600 uppercase tracking-widest">Section under development</h3>
                  <p className="text-stone-400 text-sm">This module will be available in the next update.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default UserPage;
