import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
        <Link to="/home" className="text-xl sm:text-2xl font-black text-orange-600 tracking-tighter uppercase">
          SafeBite
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isAuthenticated && user?.role === 'admin' && (
            <Link 
              to="/admin" 
              className="flex items-center justify-center sm:space-x-2 bg-orange-600 text-white p-2 sm:px-4 sm:py-2 rounded-full font-bold text-sm hover:bg-orange-700 transition-all shadow-md shadow-orange-100"
            >
              <ShieldCheck size={18} />
              <span className="hidden sm:inline">Admin</span>
            </Link>
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
                    src={`${import.meta.env.VITE_API_BASE_URL}${user.avatar}`} 
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
