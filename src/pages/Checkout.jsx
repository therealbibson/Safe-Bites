import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { ChevronLeft, MapPin, CreditCard, ShoppingBag, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, deliveryFee, grandTotal, placeOrder } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { settings } = useSettings();
  const [isOrdered, setIsOrdered] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const currency = settings?.currency || '₦';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin?redirect=checkout');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // If cart is empty or below minimums, go back
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }

    const minQty = settings?.minimumOrderQuantity || 1;
    const minPrice = settings?.minimumOrderPrice || 0;
    const cartQty = cart.reduce((total, item) => total + item.quantity, 0);

    if (cartQty < minQty || cartTotal < minPrice) {
      console.warn('[Checkout] Minimum requirements not met, redirecting to cart');
      navigate('/cart');
    }
  }, [cart, cartTotal, settings, navigate]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || isPlacingOrder) return;

    if (!settings.isOpen) {
      alert(`Sorry, our store is currently closed. Opening hours: ${settings.openingHours}`);
      return;
    }
    
    setIsPlacingOrder(true);
    const formData = new FormData(e.target);
    const orderDetails = {
      deliveryAddress: `${formData.get('address')}, ${formData.get('city')}, ${formData.get('zip')}`,
      phoneNumber: formData.get('phone'),
      paymentMethod: 'Cash on Delivery',
      totalAmount: grandTotal // Use centralized grand total
    };
    
    try {
      await placeOrder(orderDetails);
      setIsOrdered(true);
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-orange-500 flex flex-col items-center justify-center text-white px-6 text-center">
        <div className="bg-white p-6 rounded-full mb-8 text-orange-600 shadow-2xl">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-4xl font-black mb-4 tracking-tight">ORDER SUCCESSFUL!</h2>
        <p className="text-xl text-orange-100 mb-12 max-w-xs font-medium">Your delicious meal is being prepared and will be with you shortly.</p>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="mt-8 text-sm opacity-60 font-bold tracking-widest uppercase">Redirecting to History</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-16">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6 sm:mb-8">
          <button onClick={() => navigate(-1)} className="p-2 mr-3 sm:mr-4 bg-white rounded-full shadow-sm text-stone-600 hover:bg-orange-50 hover:text-orange-600 transition-all">
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-800 tracking-tight uppercase">Checkout</h1>
        </div>

        {!settings.isOpen && (
          <div className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl mb-6 text-red-600 font-bold text-center">
            Store is currently CLOSED. Opening Hours: {settings.openingHours}
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="space-y-4 sm:space-y-6">
            <section className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm border border-stone-100">
              <h2 className="text-lg sm:text-xl font-black text-stone-800 mb-4 sm:mb-6 flex items-center">
                <MapPin className="text-orange-500 mr-2 sm:mr-3" size={20} className="sm:w-6 sm:h-6" />
                Delivery Address
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <input name="address" type="text" placeholder="Street Address" required className="w-full px-4 sm:px-6 py-3.5 sm:py-4 bg-stone-50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-medium text-sm sm:text-base" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input name="city" type="text" placeholder="City" required className="px-4 sm:px-6 py-3.5 sm:py-4 bg-stone-50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-medium text-sm sm:text-base" />
                  <input name="zip" type="text" placeholder="Zip Code" required className="px-4 sm:px-6 py-3.5 sm:py-4 bg-stone-50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-medium text-sm sm:text-base" />
                </div>
                <input name="phone" type="tel" placeholder="Phone Number" required className="w-full px-4 sm:px-6 py-3.5 sm:py-4 bg-stone-50 border-2 border-transparent rounded-xl sm:rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-medium text-sm sm:text-base" />
              </div>
            </section>

            <section className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm border border-stone-100">
              <h2 className="text-lg sm:text-xl font-black text-stone-800 mb-4 sm:mb-6 flex items-center">
                <CreditCard className="text-orange-500 mr-2 sm:mr-3" size={20} className="sm:w-6 sm:h-6" />
                Payment Method
              </h2>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex-1 p-4 sm:p-6 border-2 border-orange-500 bg-orange-50 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col items-center">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                    <span className="font-black text-orange-600 text-sm sm:text-base">{currency}</span>
                  </div>
                  <span className="text-[10px] sm:text-sm font-black text-orange-600 uppercase tracking-wider text-center">Cash on Delivery</span>
                </div>
                <div className="flex-1 p-4 sm:p-6 border-2 border-stone-100 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col items-center opacity-40">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-stone-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                    <CreditCard size={18} className="text-stone-400 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[10px] sm:text-sm font-black text-stone-400 uppercase tracking-wider text-center">Credit Card</span>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm border border-stone-100">
              <div className="flex justify-between items-center py-2 sm:py-3 border-b border-stone-50">
                <span className="text-stone-500 font-bold text-sm sm:text-base">{cart.length} items</span>
                <span className="font-black text-stone-800 text-sm sm:text-base">{currency}{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 sm:py-3 border-b border-stone-50">
                <span className="text-stone-500 font-bold text-sm sm:text-base">Delivery</span>
                <span className="font-black text-stone-800 text-sm sm:text-base">{currency}{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 sm:pt-6">
                <span className="text-lg sm:text-xl font-black text-stone-800">Total Amount</span>
                <span className="text-2xl sm:text-3xl font-black text-orange-600">{currency}{grandTotal.toFixed(2)}</span>
              </div>
            </section>

            <button 
              type="submit" 
              disabled={isPlacingOrder || !settings.isOpen}
              className="w-full bg-orange-500 text-white py-4 sm:py-6 rounded-[1.5rem] sm:rounded-[2rem] font-black text-lg sm:text-xl shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all uppercase tracking-widest flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPlacingOrder && <Loader2 className="w-6 h-6 animate-spin" />}
              <span>{isPlacingOrder ? 'Processing...' : 'Confirm Order'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Checkout;
