import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Package, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

const Orders = () => {
  const { orders } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-24">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 mt-8">
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 text-stone-600">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-3xl font-black text-stone-800 tracking-tight">Order History</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm">
            <Package size={64} className="mx-auto text-stone-200 mb-6" />
            <p className="text-xl text-stone-400 font-bold">No orders yet</p>
            <button 
              onClick={() => navigate('/home')}
              className="mt-6 bg-orange-500 text-white px-8 py-3 rounded-full font-bold"
            >
              Start Ordering
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-stone-100"
              >
                <div className="flex justify-between items-start mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-stone-50">
                  <div>
                    <span className="text-[10px] sm:text-xs font-black text-orange-500 uppercase tracking-widest block mb-0.5 sm:mb-1">Order ID</span>
                    <h3 className="text-lg sm:text-xl font-black text-stone-800 tracking-tight">#{order.id.substring(0, 8)}...</h3>
                    <div className="flex items-center text-stone-400 text-[10px] sm:text-sm mt-1 font-medium">
                      <Clock size={12} className="mr-1 sm:w-3.5 sm:h-3.5" />
                      {new Date(order.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-2 sm:px-3 py-1 bg-orange-100 text-orange-600 text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider mb-1 sm:mb-2">
                      {order.status}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-stone-800">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <img src={item.imageUrl} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl object-cover" />
                        <span className="font-bold text-stone-700 text-sm sm:text-base">{item.name}</span>
                      </div>
                      <span className="text-stone-400 font-medium text-xs sm:text-sm">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-stone-50">
                  <div className="flex items-center text-green-600 font-bold text-xs sm:text-sm">
                    <CheckCircle2 size={14} className="mr-2 sm:w-4 sm:h-4" />
                    Safe Delivery Guaranteed
                  </div>
                  <button className="w-full sm:w-auto text-orange-600 font-black text-xs sm:text-sm uppercase tracking-widest hover:underline py-2 sm:py-0 border sm:border-0 border-orange-100 rounded-xl">
                    Reorder Items
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
