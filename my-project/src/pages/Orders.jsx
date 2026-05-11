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
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100"
              >
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-stone-50">
                  <div>
                    <span className="text-xs font-black text-orange-500 uppercase tracking-widest block mb-1">Order ID</span>
                    <h3 className="text-xl font-black text-stone-800 tracking-tight">{order.id}</h3>
                    <div className="flex items-center text-stone-400 text-sm mt-1 font-medium">
                      <Clock size={14} className="mr-1" />
                      {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                      {order.status}
                    </span>
                    <span className="text-2xl font-black text-stone-800">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={item.image} className="w-12 h-12 rounded-xl object-cover" />
                        <span className="font-bold text-stone-700">{item.name}</span>
                      </div>
                      <span className="text-stone-400 font-medium">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between pt-6 border-t border-stone-50">
                  <div className="flex items-center text-green-600 font-bold text-sm">
                    <CheckCircle2 size={16} className="mr-2" />
                    Safe Delivery Guaranteed
                  </div>
                  <button className="text-orange-600 font-black text-sm uppercase tracking-widest hover:underline">
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
