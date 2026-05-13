import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, Flame, Star, Clock, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import FoodCard from '../components/FoodCard';
import Marquee from '../components/Marquee';

const Home = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const categories = ['All', 'Burgers', 'Pizza', 'Asian', 'Salad', 'Dessert', 'Drinks'];
  
  const heroRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/foods`);
        const data = await response.json();
        // Map backend fields to frontend expectations
        const formattedData = data.map(item => ({
          ...item,
          id: item._id,
          image: item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
          category: item.category || 'All' // Fallback if category is not provided as a string
        }));
        setFoods(formattedData);
      } catch (error) {
        console.error('Error fetching foods:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const scrollToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredItems = useMemo(() => {
    return foods.filter(item => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, foods]);

  return (
    <div className="min-h-screen bg-stone-50 pb-20 overflow-x-hidden pt-16">
      <Navbar />

      <main className="mt-4">
        {/* Full-width Hero Section wrapper */}
        <div className="px-4 max-w-7xl mx-auto">
          <div ref={heroRef} className="relative h-[500px] mb-8 rounded-[3rem] overflow-hidden bg-orange-600 flex items-center justify-center shadow-2xl">
            <motion.div style={{ y: y1, opacity }} className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80" 
                className="w-full h-full object-cover opacity-40 scale-110" 
                alt="Hero background"
              />
            </motion.div>
            
            <div className="relative z-10 text-center text-white px-6">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h2 className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-none uppercase">
                  CRAVE IT.<br/>ORDER IT.
                </h2>
                <p className="text-xl md:text-2xl text-orange-100 mb-8 max-w-2xl mx-auto font-medium">
                  The fastest delivery in town, bringing your favorite flavors right to your doorstep.
                </p>
                <motion.button 
                  onClick={scrollToMenu}
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-orange-600 px-12 py-5 rounded-full font-black text-xl shadow-2xl hover:bg-orange-50 transition-colors uppercase tracking-widest"
                >
                  Discover Menu
                </motion.button>
              </motion.div>
            </div>

            <motion.div style={{ y: y2 }} className="absolute -bottom-12 -right-12 z-0 opacity-10">
              <Flame size={400} />
            </motion.div>
          </div>
        </div>

        {/* Full-width Marquee after Hero */}
        <Marquee 
          text="Flash Sale: 50% OFF on all Burgers! • Order Now and Get Free Delivery • Limited Time Offer" 
          className="mb-12 shadow-lg shadow-orange-100" 
        />

        {/* Centered Content Section */}
        <div className="max-w-7xl mx-auto px-4">
          {/* Interactive Search */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
            ref={menuRef}
          >
            <div className="relative group max-w-2xl mx-auto">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you craving today?" 
                className="w-full pl-16 pr-6 py-6 bg-white border-2 border-transparent rounded-[2rem] shadow-sm group-focus-within:shadow-xl group-focus-within:border-orange-500 transition-all outline-none text-lg font-medium"
              />
              <Search className="absolute left-6 top-6 text-stone-400 group-focus-within:text-orange-500 transition-colors" size={28} />
            </div>
          </motion.div>

          {/* Animated Categories */}
          <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-hide px-2">
            {categories.map((cat, i) => (
              <motion.button
                key={cat}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-2xl whitespace-nowrap font-bold text-lg transition-all ${
                  activeCategory === cat 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-105' 
                    : 'bg-white text-stone-600 hover:bg-orange-50 hover:shadow-md'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          {/* Feature Grid with Pop Animations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: <Clock className="text-orange-500" />, title: "30 Min Delivery", desc: "Fastest in the city" },
              { icon: <Star className="text-orange-500" />, title: "Top Rated", desc: "4.8/5 Average Rating" },
              { icon: <Heart className="text-orange-500" />, title: "Best Quality", desc: "Made with fresh ingredients" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-8 rounded-[2.5rem] flex items-center space-x-4 shadow-sm hover:shadow-lg transition-all border border-stone-50"
              >
                <div className="p-4 bg-orange-100 rounded-2xl">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-stone-800">{feature.title}</h4>
                  <p className="text-stone-500 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dynamic Food Grid */}
          {loading ? (
            <div className="text-center py-20">
              <p className="text-2xl text-stone-400 font-bold">Loading delicious foods...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredItems.map(item => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-2xl text-stone-400 font-bold">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Full-width Marquee */}
      <Marquee 
        text="Support Local Restaurants • Safe & Clean Delivery • 100% Satisfaction Guaranteed • Join 10k+ Happy Foodies" 
        reverse={true} 
        className="mt-20"
      />
    </div>
  );
};

export default Home;
