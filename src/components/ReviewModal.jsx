import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ReviewModal = ({ isOpen, onClose, order, onReviewSubmitted }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || user?._id
        },
        body: JSON.stringify({
          orderId: order.id || order._id,
          rating,
          comment
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        if (onReviewSubmitted) onReviewSubmitted(order.id || order._id);
        setTimeout(() => {
          onClose();
          // Reset state
          setRating(0);
          setComment('');
          setIsSuccess(false);
        }, 2000);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl"
          >
            {isSuccess ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-stone-800 uppercase tracking-tight mb-2">Thank You!</h3>
                <p className="text-stone-500 font-bold">Your review has been submitted successfully.</p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-stone-50 flex items-center justify-between">
                  <h3 className="font-black text-stone-800 uppercase tracking-tight">Review Order</h3>
                  <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-orange-100 flex items-center justify-center text-orange-600">
                      <Star size={32} fill="currentColor" />
                    </div>
                    <div>
                      <h4 className="font-black text-stone-800 uppercase">Order #{ (order.id || order._id).substring(0, 8) }</h4>
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">
                        {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-2 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform active:scale-90"
                      >
                        <Star 
                          size={36} 
                          fill={(hoverRating || rating) >= star ? '#EA580C' : 'transparent'} 
                          className={(hoverRating || rating) >= star ? 'text-orange-600' : 'text-stone-200'}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 mb-8">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Your Experience</label>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="How was the food and delivery service?"
                      className="w-full bg-stone-50 border border-stone-100 px-5 py-4 rounded-[1.5rem] outline-none focus:border-orange-500 focus:bg-white transition-all text-stone-700 font-medium h-32 resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="w-full bg-orange-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting && <Loader2 size={20} className="animate-spin" />}
                    <span>Submit Review</span>
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;
