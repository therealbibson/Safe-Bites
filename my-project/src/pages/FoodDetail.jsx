import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Star, Clock, Flame, ShieldCheck, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

const FOOD_ITEMS = [
  { id: 1, name: 'Double Cheese Burger', price: 12.99, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80', category: 'Burgers', calories: 850, time: '15-20 min', rating: 4.8 },
  { id: 2, name: 'Pepperoni Pizza', price: 15.50, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=80', category: 'Pizza', calories: 1200, time: '20-25 min', rating: 4.9 },
  { id: 3, name: 'Spicy Ramen', price: 14.20, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', category: 'Asian', calories: 650, time: '10-15 min', rating: 4.7 },
  { id: 4, name: 'Garden Salad', price: 9.99, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80', category: 'Salad', calories: 320, time: '5-10 min', rating: 4.5 },
  { id: 5, name: 'Chocolate Lava Cake', price: 7.50, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&auto=format&fit=crop&q=80', category: 'Dessert', calories: 450, time: '10-12 min', rating: 4.9 },
  { id: 6, name: 'Mango Smoothie', price: 5.99, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&auto=format&fit=crop&q=80', category: 'Drinks', calories: 280, time: '5 min', rating: 4.6 },
];

const FoodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const item = FOOD_ITEMS.find(f => f.id === parseInt(id));

  if (!item) return <div className="p-20 text-center font-bold">Item not found</div>;

  return (
    <div className="min-h-screen bg-white pb-32">
      <Navbar />
      
      <div className="relative h-[450px] w-full">
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          src={item.image} 
          className="h-full w-full object-cover"
        />
        <div className="absolute top-24 left-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white/90 backdrop-blur rounded-full shadow-lg text-stone-800 hover:bg-orange-50 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative -mt-12 bg-white rounded-t-[3rem] px-6 pt-10"
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-black text-stone-800 mb-2 tracking-tight">{item.name}</h1>
              <div className="flex items-center space-x-4 text-stone-500 font-medium">
                <div className="flex items-center text-orange-500">
                  <Star size={18} fill="currentColor" />
                  <span className="ml-1 text-stone-800">{item.rating}</span>
                </div>
                <span>•</span>
                <span>{item.category}</span>
              </div>
            </div>
            <div className="text-3xl font-black text-orange-600">${item.price.toFixed(2)}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="bg-stone-50 p-4 rounded-3xl text-center border border-stone-100">
              <Flame className="mx-auto text-orange-500 mb-2" size={24} />
              <span className="block text-xs text-stone-400 font-bold uppercase tracking-wider">Calories</span>
              <span className="font-black text-stone-800">{item.calories} kcal</span>
            </div>
            <div className="bg-stone-50 p-4 rounded-3xl text-center border border-stone-100">
              <Clock className="mx-auto text-orange-500 mb-2" size={24} />
              <span className="block text-xs text-stone-400 font-bold uppercase tracking-wider">Time</span>
              <span className="font-black text-stone-800">{item.time}</span>
            </div>
            <div className="bg-stone-50 p-4 rounded-3xl text-center border border-stone-100">
              <ShieldCheck className="mx-auto text-orange-500 mb-2" size={24} />
              <span className="block text-xs text-stone-400 font-bold uppercase tracking-wider">SafeBite</span>
              <span className="font-black text-stone-800">Verified</span>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-xl font-black text-stone-800 mb-4">Description</h3>
            <p className="text-stone-500 leading-relaxed text-lg">
              Our signature {item.name} is prepared with the utmost care and precision. We use only organic, locally-sourced ingredients to ensure every bite is packed with flavor and nutrition. Perfectly seasoned and cooked to order, it's a guaranteed favorite for any occasion.
            </p>
          </div>

          <div className="mb-10">
            <h3 className="text-xl font-black text-stone-800 mb-4">Ingredients</h3>
            <div className="flex flex-wrap gap-3">
              {['Premium Quality', 'Fresh Herbs', 'Organic Base', 'Signature Sauce', 'Hand-picked'].map((ing, i) => (
                <span key={i} className="px-4 py-2 bg-stone-100 text-stone-600 rounded-full font-bold text-sm">
                  {ing}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-stone-100 z-50">
        <div className="max-w-3xl mx-auto flex items-center space-x-6">
          <div className="flex items-center space-x-4 bg-stone-100 p-2 rounded-2xl">
            <button className="p-3 bg-white rounded-xl shadow-sm text-stone-400 hover:text-orange-500 transition-colors">
              <Minus size={20} />
            </button>
            <span className="text-xl font-black text-stone-800 px-2">1</span>
            <button className="p-3 bg-white rounded-xl shadow-sm text-stone-400 hover:text-orange-500 transition-colors">
              <Plus size={20} />
            </button>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              addToCart(item);
              navigate('/cart');
            }}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-5 rounded-[2rem] font-black text-xl shadow-xl shadow-orange-100 transition-all uppercase tracking-widest"
          >
            Add to Order
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default FoodDetail;
