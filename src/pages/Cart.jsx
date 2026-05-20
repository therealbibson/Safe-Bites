import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, cartTotal, loading } = useCart();
  const { isAuthenticated } = useAuth();

  const hasOutOfStockItems = cart.some(item => item.isAvailable === false);

  const handleProceedToCheckout = () => {
    if (hasOutOfStockItems) return;
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/signin?redirect=checkout');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-16">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate(-1)} className="p-2 mr-4 bg-white rounded-full shadow-sm text-stone-600 hover:bg-orange-50 hover:text-orange-600 transition-all">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-3xl font-black text-stone-800 tracking-tight uppercase">Your Cart</h1>
        </div>

        {loading ? (
          <div className="text-center py-16 sm:py-20">
            <p className="text-xl sm:text-2xl text-stone-400 font-bold">Loading your cart...</p>
          </div>
        ) : cart.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-stone-100 px-6">
            <div className="mb-6 flex justify-center text-stone-200">
              <ShoppingBag size={64} className="sm:w-20 sm:h-20" />
            </div>
            <p className="text-xl sm:text-2xl text-stone-400 font-bold mb-6 sm:mb-8 tracking-tight">Your cart is empty</p>
            <Link to="/home" className="bg-orange-500 text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-black uppercase tracking-widest text-xs sm:text-sm shadow-lg shadow-orange-100">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {cart.map((item) => (
              <div key={item.productId} className="bg-white p-3.5 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] flex items-center shadow-sm border border-stone-50 hover:shadow-md transition-all">
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-xl sm:rounded-2xl mr-3 sm:mr-6" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-stone-800 text-sm sm:text-lg leading-tight truncate">{item.name}</h3>
                  <div className="flex items-center space-x-3 mt-1 sm:mt-2">
                    <button 
                      onClick={() => item.quantity > 1 ? updateQuantity(item.productId, item.quantity - 1) : removeFromCart(item.productId)}
                      className="p-1 sm:p-1.5 bg-stone-100 rounded-lg text-stone-600 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                    >
                      <Minus size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <span className="text-stone-800 font-black text-sm sm:text-base w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 sm:p-1.5 bg-stone-100 rounded-lg text-stone-600 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                    >
                      <Plus size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  <p className="text-orange-600 font-black text-sm sm:text-base mt-1 sm:mt-2">₦{item.price.toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.productId)}
                  className="p-2.5 sm:p-4 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl sm:rounded-2xl transition-all ml-1 sm:ml-2"
                >
                  <Trash2 size={18} className="sm:w-6 sm:h-6" />
                </button>
              </div>
            ))}

            <div className="mt-8 sm:mt-12 bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-stone-100">
              <div className="flex justify-between mb-3 sm:mb-4 text-sm sm:text-base">
                <span className="text-stone-500 font-bold">Subtotal</span>
                <span className="font-black text-stone-800">₦{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-3 sm:mb-4 text-sm sm:text-base">
                <span className="text-stone-500 font-bold">Delivery Fee</span>
                <span className="font-black text-stone-800">₦2.00</span>
              </div>
              <div className="h-px bg-stone-100 my-4 sm:my-6"></div>
              <div className="flex justify-between items-center mb-8 sm:mb-10">
                <span className="text-lg sm:text-xl font-black text-stone-800">Grand Total</span>
                <span className="text-2xl sm:text-4xl font-black text-orange-600">₦{(cartTotal + 2).toFixed(2)}</span>
              </div>
              <button 
                onClick={handleProceedToCheckout}
                disabled={hasOutOfStockItems}
                className={`block text-center w-full py-4 sm:py-6 rounded-[1.5rem] sm:rounded-[2rem] font-black text-lg sm:text-xl shadow-xl transition-all uppercase tracking-widest ${
                  hasOutOfStockItems 
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none' 
                    : 'bg-orange-500 text-white shadow-orange-200 hover:bg-orange-600'
                }`}
              >
                {hasOutOfStockItems ? 'Items Out of Stock' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
