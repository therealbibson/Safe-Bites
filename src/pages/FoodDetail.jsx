import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Star, Clock, Flame, ShieldCheck, Plus, Minus, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

const FoodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isAdding } = useCart();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const isItemAdding = item ? isAdding(item.id) : false;

  useEffect(() => {
    const fetchFoodDetail = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/foods/${id}`);
        if (!response.ok) throw new Error('Food item not found');
        const data = await response.json();
        
        // Map backend fields to frontend expectations
        const formattedItem = {
          ...data,
          id: data._id,
          image: data.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
          category: data.category || 'Food',
          calories: data.calories || 0,
          time: data.time || '15-20 min',
          rating: data.rating || 4.5
        };
        setItem(formattedItem);
      } catch (error) {
        console.error('Error fetching food detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodDetail();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-2xl text-stone-400 font-bold">Loading food details...</p>
    </div>
  );

  if (!item) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <p className="text-2xl text-stone-400 font-bold">Item not found</p>
      <button onClick={() => navigate('/')} className="text-orange-500 font-bold underline">Go back home</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-32">
      <Navbar />
      
      <div className="relative h-[300px] sm:h-[400px] md:h-[450px] w-full">
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          src={item.image} 
          className="h-full w-full object-cover"
        />
        <div className="absolute top-20 sm:top-24 left-4 sm:left-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 sm:p-3 bg-white/90 backdrop-blur rounded-full shadow-lg text-stone-800 hover:bg-orange-50 transition-colors"
          >
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative -mt-12 bg-white rounded-t-[2.5rem] sm:rounded-t-[3rem] px-4 sm:px-6 pt-8 sm:pt-10"
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-800 mb-2 tracking-tight">{item.name}</h1>
              <div className="flex items-center space-x-4 text-stone-500 font-medium">
                <div className="flex items-center text-orange-500">
                  <Star size={18} fill="currentColor" />
                  <span className="ml-1 text-stone-800">{item.rating}</span>
                </div>
                <span>•</span>
                <span>{item.category}</span>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-orange-600">₦{item.price.toFixed(2)}</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-10">
            <div className="bg-stone-50 p-3 sm:p-4 rounded-[1.5rem] sm:rounded-3xl text-center border border-stone-100">
              <Flame className="mx-auto text-orange-500 mb-1 sm:mb-2" size={20} className="sm:w-6 sm:h-6" />
              <span className="block text-[10px] sm:text-xs text-stone-400 font-bold uppercase tracking-wider">Calories</span>
              <span className="font-black text-stone-800 text-sm sm:text-base">{item.calories} kcal</span>
            </div>
            <div className="bg-stone-50 p-3 sm:p-4 rounded-[1.5rem] sm:rounded-3xl text-center border border-stone-100">
              <Clock className="mx-auto text-orange-500 mb-1 sm:mb-2" size={20} className="sm:w-6 sm:h-6" />
              <span className="block text-[10px] sm:text-xs text-stone-400 font-bold uppercase tracking-wider">Time</span>
              <span className="font-black text-stone-800 text-sm sm:text-base">{item.time}</span>
            </div>
            <div className="bg-stone-50 p-3 sm:p-4 rounded-[1.5rem] sm:rounded-3xl text-center border border-stone-100 col-span-2 sm:col-span-1">
              <ShieldCheck className="mx-auto text-orange-500 mb-1 sm:mb-2" size={20} className="sm:w-6 sm:h-6" />
              <span className="block text-[10px] sm:text-xs text-stone-400 font-bold uppercase tracking-wider">SafeBite</span>
              <span className="font-black text-stone-800 text-sm sm:text-base">Verified</span>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-lg sm:text-xl font-black text-stone-800 mb-3 sm:mb-4">Description</h3>
            <p className="text-stone-500 leading-relaxed text-base sm:text-lg">
              {item.description || `Our signature ${item.name} is prepared with the utmost care and precision. We use only organic, locally-sourced ingredients to ensure every bite is packed with flavor and nutrition. Perfectly seasoned and cooked to order, it's a guaranteed favorite for any occasion.`}
            </p>
          </div>

          <div className="mb-10">
            <h3 className="text-lg sm:text-xl font-black text-stone-800 mb-3 sm:mb-4">Ingredients</h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {['Premium Quality', 'Fresh Herbs', 'Organic Base', 'Signature Sauce', 'Hand-picked'].map((ing, i) => (
                <span key={i} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-stone-100 text-stone-600 rounded-full font-bold text-xs sm:text-sm">
                  {ing}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-white/80 backdrop-blur-xl border-t border-stone-100 z-50">
        <div className="max-w-3xl mx-auto flex items-center space-x-3 sm:space-x-6">
          <div className="flex items-center space-x-2 sm:space-x-4 bg-stone-100 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl">
            <button 
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              className="p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl shadow-sm text-stone-400 hover:text-orange-500 transition-colors"
            >
              <Minus size={18} className="sm:w-5 sm:h-5" />
            </button>
            <span className="text-lg sm:text-xl font-black text-stone-800 px-1 sm:px-2">{quantity}</span>
            <button 
              onClick={() => setQuantity(prev => prev + 1)}
              className="p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl shadow-sm text-stone-400 hover:text-orange-500 transition-colors"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
          <motion.button 
            disabled={isItemAdding}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              addToCart(item, quantity);
              // Navigation removed to show the 'Adding...' state before going to cart
              setTimeout(() => navigate('/cart'), 500); 
            }}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] font-black text-lg sm:text-xl shadow-xl shadow-orange-100 transition-all uppercase tracking-widest flex items-center justify-center space-x-2 sm:space-x-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isItemAdding && <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />}
            <span>{isItemAdding ? 'Adding...' : 'Add to Order'}</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default FoodDetail;
