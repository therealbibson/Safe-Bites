import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { ChevronLeft, MapPin, CreditCard, ShoppingBag, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { usePaystackPayment } from 'react-paystack';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, deliveryFee, grandTotal, placeOrder, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { settings } = useSettings();
  const [isOrdered, setIsOrdered] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Cash on Delivery');
  const [orderId, setOrderId] = useState(null);

  const currency = settings?.currency || '₦';

  // Paystack Config
  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: user?.email,
    amount: Math.round(grandTotal * 100), // Paystack expects amount in kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin?redirect=checkout');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user?.paymentMethods?.length > 0) {
      const defaultMethod = user.paymentMethods.find(m => m.isDefault) || user.paymentMethods[0];
      setSelectedPaymentMethod(`Card ending in ${defaultMethod.last4}`);
    }
  }, [user]);

  useEffect(() => {
    if (cart.length === 0 && !isOrdered) {
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
  }, [cart, cartTotal, settings, navigate, isOrdered]);

  const verifyPaymentOnBackend = async (reference, orderId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || user?._id
        },
        body: JSON.stringify({ reference, orderId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment verification failed');
      }

      setIsOrdered(true);
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
    } catch (error) {
      alert(`Verification Error: ${error.message}`);
    }
  };

  const onSuccess = (reference) => {
    console.log('Payment Successful', reference);
    verifyPaymentOnBackend(reference.reference, orderId);
  };

  const onClose = () => {
    console.log('Payment Closed');
    setIsPlacingOrder(false);
    alert('Payment was cancelled. You can try again from the orders page.');
    navigate('/orders');
  };

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
      paymentMethod: selectedPaymentMethod,
      totalAmount: grandTotal
    };
    
    try {
      const newOrder = await placeOrder(orderDetails);
      
      const isCardPayment = selectedPaymentMethod !== 'Cash on Delivery';

      if (isCardPayment) {
        setOrderId(newOrder.id);
        // Trigger Paystack
        initializePayment(onSuccess, onClose);
      } else {
        setIsOrdered(true);
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      }
    } catch (error) {
      alert(error.message);
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
              <div className="space-y-3">
                <div 
                  onClick={() => setSelectedPaymentMethod('Cash on Delivery')}
                  className={`p-4 sm:p-6 border-2 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-between cursor-pointer transition-all ${selectedPaymentMethod === 'Cash on Delivery' ? 'border-orange-500 bg-orange-50' : 'border-stone-100 bg-white hover:border-orange-200'}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedPaymentMethod === 'Cash on Delivery' ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
                      <span className="font-black text-xs">{currency}</span>
                    </div>
                    <span className={`text-sm font-black uppercase tracking-wider ${selectedPaymentMethod === 'Cash on Delivery' ? 'text-orange-600' : 'text-stone-500'}`}>Cash on Delivery</span>
                  </div>
                  {selectedPaymentMethod === 'Cash on Delivery' && <div className="w-3 h-3 bg-orange-600 rounded-full"></div>}
                </div>

                <div 
                  onClick={() => setSelectedPaymentMethod('Pay with Card')}
                  className={`p-4 sm:p-6 border-2 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-between cursor-pointer transition-all ${selectedPaymentMethod === 'Pay with Card' ? 'border-orange-500 bg-orange-50' : 'border-stone-100 bg-white hover:border-orange-200'}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedPaymentMethod === 'Pay with Card' ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
                      <CreditCard size={20} />
                    </div>
                    <span className={`text-sm font-black uppercase tracking-wider ${selectedPaymentMethod === 'Pay with Card' ? 'text-orange-600' : 'text-stone-500'}`}>Pay with Paystack</span>
                  </div>
                  {selectedPaymentMethod === 'Pay with Card' && <div className="w-3 h-3 bg-orange-600 rounded-full"></div>}
                </div>

                {user?.paymentMethods?.map((method) => (
                  <div 
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(`Card ending in ${method.last4}`)}
                    className={`p-4 sm:p-6 border-2 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-between cursor-pointer transition-all ${selectedPaymentMethod === `Card ending in ${method.last4}` ? 'border-orange-500 bg-orange-50' : 'border-stone-100 bg-white hover:border-orange-200'}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center uppercase font-black text-[10px] ${selectedPaymentMethod === `Card ending in ${method.last4}` ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
                        {method.type === 'visa' ? 'VISA' : method.type === 'mastercard' ? 'MC' : <CreditCard size={16} />}
                      </div>
                      <div>
                        <span className={`text-sm font-black uppercase tracking-wider block ${selectedPaymentMethod === `Card ending in ${method.last4}` ? 'text-orange-600' : 'text-stone-500'}`}>Card ending in {method.last4}</span>
                        <span className="text-[10px] text-stone-400 font-bold">Expires {method.expiry}</span>
                      </div>
                    </div>
                    {selectedPaymentMethod === `Card ending in ${method.last4}` && <div className="w-3 h-3 bg-orange-600 rounded-full"></div>}
                  </div>
                ))}
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
