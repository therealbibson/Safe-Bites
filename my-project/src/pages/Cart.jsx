import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ChevronLeft, Trash2, ShoppingBag } from 'lucide-react';
import Navbar from '../components/Navbar';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, cartTotal } = useCart();

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-24">
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 mr-4 text-stone-600">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-black text-stone-800 tracking-tight uppercase">Your Cart</h1>
        </div>
      </header>

      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-stone-100 mt-8">
            <div className="mb-6 flex justify-center text-stone-200">
              <ShoppingBag size={80} />
            </div>
            <p className="text-2xl text-stone-400 font-bold mb-8 tracking-tight">Your cart is empty</p>
            <Link to="/home" className="bg-orange-500 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-sm shadow-lg shadow-orange-100">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4 mt-8">
            {cart.map((item) => (
              <div key={item.cartId} className="bg-white p-5 rounded-[2rem] flex items-center shadow-sm border border-stone-50 hover:shadow-md transition-all">
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-2xl mr-6" />
                <div className="flex-1">
                  <h3 className="font-black text-stone-800 text-lg leading-tight">{item.name}</h3>
                  <p className="text-orange-600 font-black mt-1">${item.price.toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.cartId)}
                  className="p-4 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            ))}

            <div className="mt-12 bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
              <div className="flex justify-between mb-4">
                <span className="text-stone-500 font-bold">Subtotal</span>
                <span className="font-black text-stone-800">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-stone-500 font-bold">Delivery Fee</span>
                <span className="font-black text-stone-800">$2.00</span>
              </div>
              <div className="h-px bg-stone-100 my-6"></div>
              <div className="flex justify-between items-center mb-10">
                <span className="text-xl font-black text-stone-800">Grand Total</span>
                <span className="text-4xl font-black text-orange-600">${(cartTotal + 2).toFixed(2)}</span>
              </div>
              <Link to="/checkout" className="block text-center w-full bg-orange-500 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all uppercase tracking-widest">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
