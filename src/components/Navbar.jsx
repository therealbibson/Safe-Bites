import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { ShoppingCart, User, ShieldCheck, Bell, Check, Trash2, Star, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
        <Link to="/home" className="text-xl sm:text-2xl font-black text-orange-600 tracking-tighter uppercase">
          SafeBite
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {(user?.role === 'admin' || user?.role === 'super-admin') && isAuthenticated && (
            <Link 
              to="/admin" 
              className="flex items-center justify-center sm:space-x-2 bg-orange-600 text-white p-2 sm:px-4 sm:py-2 rounded-full font-bold text-sm hover:bg-orange-700 transition-all shadow-md shadow-orange-100"
            >
              <ShieldCheck size={18} />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {isAuthenticated && (
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 bg-stone-100 rounded-full text-stone-600 hover:bg-stone-200 transition-colors flex items-center justify-center"
              >
                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.span 
                      key={unreadCount}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border-2 border-white"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden flex flex-col"
                  >
                    <div className="p-4 border-b border-stone-50 flex items-center justify-between">
                      <h3 className="font-black text-stone-800 uppercase tracking-tight">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-stone-400 font-bold text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n._id} 
                            onClick={() => {
                              if (!n.isRead) markAsRead(n._id);
                            }}
                            className={`p-4 border-b border-stone-50 hover:bg-stone-50 transition-colors cursor-pointer relative ${!n.isRead ? 'bg-orange-50/30' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm font-bold ${!n.isRead ? 'text-stone-800' : 'text-stone-500'}`}>{n.title}</h4>
                              <span className="text-[10px] text-stone-400 font-medium">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 leading-relaxed">{n.message}</p>
                            {n.title === "Order Delivered!" && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!n.isRead) markAsRead(n._id);
                                  setShowNotifications(false);
                                  navigate('/orders');
                                }}
                                className="mt-2 flex items-center space-x-1 bg-orange-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-md shadow-orange-100"
                              >
                                <Star size={8} fill="currentColor" />
                                <span>Review Now</span>
                              </button>
                            )}
                            {!n.isRead && (
                              <div className="absolute right-4 bottom-4 w-1.5 h-1.5 bg-orange-600 rounded-full shadow-[0_0_8px_rgba(234,88,12,0.6)]" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/user');
                        }}
                        className="p-3 bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-orange-600 transition-all font-bold text-[10px] uppercase tracking-widest flex items-center justify-center space-x-1"
                      >
                        <span>View All Notifications</span>
                        <ChevronRight size={12} />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          <Link to="/cart" className="relative p-2 bg-orange-100 rounded-full text-orange-600 hover:bg-orange-200 transition-colors flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span 
                  key={cartCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border-2 border-white"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          
          {isAuthenticated ? (
            <Link 
              to="/user"
              className="flex items-center justify-center sm:space-x-2 bg-stone-100 p-1 sm:px-3 sm:py-1.5 rounded-full border border-stone-200 hover:bg-orange-50 hover:border-orange-200 transition-all group"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex items-center justify-center bg-stone-200">
                {user?.avatar ? (
                  <img 
                    src={user.avatar.startsWith('http') || user.avatar.startsWith('data:') ? user.avatar : `${import.meta.env.VITE_API_BASE_URL}${user.avatar}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-stone-500 group-hover:text-orange-600" />
                )}
              </div>
              <span className="hidden sm:inline text-sm font-bold text-stone-700 group-hover:text-orange-600 truncate max-w-[100px]">
                {user.name || user.email.split('@')[0]}
              </span>
            </Link>
          ) : (
            <Link 
              to="/signin" 
              className="bg-orange-600 text-white px-4 sm:px-6 py-2 rounded-full font-bold text-sm hover:bg-orange-700 transition-all shadow-md shadow-orange-100"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
