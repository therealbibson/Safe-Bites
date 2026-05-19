import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const FoodCard = ({ item }) => {
  const { addToCart, isAdding } = useCart();
  const navigate = useNavigate();

  const isItemAdding = isAdding(item.id);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-stone-100 cursor-pointer"
      onClick={() => navigate(`/food/${item.id}`)}
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <motion.img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover" 
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/90 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-lg border border-white/20">
          <span className="text-orange-600 font-black text-xs sm:text-sm">₦{item.price.toFixed(2)}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-1 sm:mb-2">
          <h3 className="text-lg sm:text-xl font-bold text-stone-800 group-hover:text-orange-600 transition-colors truncate w-full">{item.name}</h3>
        </div>
        <p className="text-stone-500 text-xs sm:text-sm mb-4 sm:mb-6 line-clamp-2 leading-relaxed">
          Savor the taste of our freshly prepared {item.name.toLowerCase()}, made with the finest local ingredients.
        </p>
        <motion.button 
          disabled={isItemAdding}
          onClick={(e) => {
            e.stopPropagation();
            addToCart(item);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-all shadow-lg shadow-orange-100 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {isItemAdding ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
          <span>{isItemAdding ? 'Adding...' : 'Add to Cart'}</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FoodCard;
