import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, MapPin, CreditCard, ShoppingBag } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, placeOrder } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isOrdered, setIsOrdered] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin?redirect=checkout');
    }
  }, [isAuthenticated, navigate]);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    
    const formData = new FormData(e.target);
    const orderDetails = {
      address: formData.get('address'),
      city: formData.get('city'),
      zip: formData.get('zip'),
      paymentMethod: 'Cash on Delivery',
      userName: user.name,
      userEmail: user.email
    };
    
    try {
      placeOrder(orderDetails);
      setIsOrdered(true);
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
    } catch (error) {
      alert(error.message);
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
    <div className="min-h-screen bg-stone-50 pb-20 pt-24">
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 mr-4 text-stone-600">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-black text-stone-800 tracking-tight uppercase">Checkout</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handlePlaceOrder}>
          <div className="space-y-6">
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
              <h2 className="text-xl font-black text-stone-800 mb-6 flex items-center">
                <MapPin className="text-orange-500 mr-3" size={24} />
                Delivery Address
              </h2>
              <div className="space-y-4">
                <input name="address" type="text" placeholder="Street Address" required className="w-full px-6 py-4 bg-stone-50 border-2 border-transparent rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-medium" />
                <div className="grid grid-cols-2 gap-4">
                  <input name="city" type="text" placeholder="City" required className="px-6 py-4 bg-stone-50 border-2 border-transparent rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-medium" />
                  <input name="zip" type="text" placeholder="Zip Code" required className="px-6 py-4 bg-stone-50 border-2 border-transparent rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-medium" />
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
              <h2 className="text-xl font-black text-stone-800 mb-6 flex items-center">
                <CreditCard className="text-orange-500 mr-3" size={24} />
                Payment Method
              </h2>
              <div className="flex space-x-4">
                <div className="flex-1 p-6 border-2 border-orange-500 bg-orange-50 rounded-[2rem] flex flex-col items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                    <span className="font-black text-orange-600">$</span>
                  </div>
                  <span className="text-sm font-black text-orange-600 uppercase tracking-wider">Cash on Delivery</span>
                </div>
                <div className="flex-1 p-6 border-2 border-stone-100 rounded-[2rem] flex flex-col items-center opacity-40">
                  <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-3">
                    <CreditCard size={24} className="text-stone-400" />
                  </div>
                  <span className="text-sm font-black text-stone-400 uppercase tracking-wider">Credit Card</span>
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
              <div className="flex justify-between items-center py-3 border-b border-stone-50">
                <span className="text-stone-500 font-bold">{cart.length} items</span>
                <span className="font-black text-stone-800">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-stone-50">
                <span className="text-stone-500 font-bold">Delivery</span>
                <span className="font-black text-stone-800">$2.00</span>
              </div>
              <div className="flex justify-between items-center pt-6">
                <span className="text-xl font-black text-stone-800">Total Amount</span>
                <span className="text-3xl font-black text-orange-600">${(cartTotal + 2).toFixed(2)}</span>
              </div>
            </section>

            <button type="submit" className="w-full bg-orange-500 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all uppercase tracking-widest">
              Confirm Order
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Checkout;
