import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, User, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/home" className="text-2xl font-bold text-orange-600 tracking-tighter">
          SafeBite
        </Link>
        <div className="flex items-center space-x-4">
          {isAuthenticated && user?.role === 'admin' && (
            <Link 
              to="/admin" 
              className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-orange-700 transition-all shadow-md shadow-orange-100"
            >
              <ShieldCheck size={18} />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
          
          <Link to="/cart" className="relative p-2 bg-orange-100 rounded-full text-orange-600 hover:bg-orange-200 transition-colors">
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>
          
          {isAuthenticated ? (
            <Link 
              to="/user"
              className="flex items-center space-x-2 bg-stone-100 px-4 py-2 rounded-full border border-stone-200 hover:bg-orange-50 hover:border-orange-200 transition-all group"
            >
              <User size={18} className="text-stone-500 group-hover:text-orange-600" />
              <span className="text-sm font-bold text-stone-700 group-hover:text-orange-600">
                {user.name || user.email.split('@')[0]}
              </span>
            </Link>
          ) : (
            <Link 
              to="/signin" 
              className="bg-orange-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-orange-700 transition-all shadow-md shadow-orange-100"
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
