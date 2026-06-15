import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Navbar from '../components/Navbar';
import { 
  MessageSquare, Send, Clock, CheckCircle, ChevronRight, 
  AlertCircle, Plus, Loader2, ArrowLeft, User, Shield 
} from 'lucide-react';

const Support = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [showSentFeedback, setShowSentFeedback] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/support/my-tickets`, {
        headers: {
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const markTicketAsRead = async (ticketId) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/support/${ticketId}/read`, {
        method: 'PATCH',
        headers: {
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        }
      });
      setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, userHasUnread: false } : t));
    } catch (error) {
      console.error('Error marking ticket as read:', error);
    }
  };

  useEffect(() => {
    if (selectedTicket && selectedTicket.userHasUnread) {
      markTicketAsRead(selectedTicket._id);
    }
  }, [selectedTicket]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
    }
  }, [isAuthenticated, user]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        },
        body: JSON.stringify(newTicket)
      });

      if (response.ok) {
        const data = await response.json();
        setTickets([data, ...tickets]);
        setShowNewTicketModal(false);
        setNewTicket({ subject: '', message: '', priority: 'medium' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/support/${selectedTicket._id}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        },
        body: JSON.stringify({ message: replyMessage })
      });

      if (response.ok) {
        const updatedTicket = await response.json();
        // Update both local states
        setSelectedTicket(updatedTicket);
        setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t));
        setReplyMessage('');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-600';
      case 'in-progress': return 'bg-orange-100 text-orange-600';
      case 'resolved': return 'bg-green-100 text-green-600';
      case 'closed': return 'bg-stone-100 text-stone-500';
      default: return 'bg-stone-100 text-stone-500';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-12">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4">
        <button 
          onClick={() => navigate('/user')}
          className="flex items-center space-x-2 text-stone-400 font-bold uppercase tracking-widest text-[10px] mb-6 hover:text-orange-600 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Profile</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-stone-800 uppercase tracking-tight">Support Center</h1>
            <p className="text-stone-500 font-bold text-sm uppercase tracking-widest mt-1">We're here to help you</p>
          </div>
          <button 
            onClick={() => setShowNewTicketModal(true)}
            className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center space-x-2 hover:bg-orange-700 transition-all shadow-lg active:scale-95"
          >
            <Plus size={16} />
            <span>New Ticket</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-stone-100">
            <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-4" />
            <p className="font-bold text-stone-400">Loading your tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center border border-stone-100 shadow-sm">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mx-auto mb-6">
              <MessageSquare size={40} />
            </div>
            <h2 className="text-xl font-black text-stone-800 uppercase tracking-tight mb-2">No active tickets</h2>
            <p className="text-stone-500 font-medium max-w-xs mx-auto mb-8">Have a question or an issue? Create a support ticket and our team will get back to you.</p>
            <button 
              onClick={() => setShowNewTicketModal(true)}
              className="inline-flex items-center space-x-2 text-orange-600 font-black uppercase tracking-widest text-xs hover:underline"
            >
              <span>Create your first ticket</span>
              <ChevronRight size={14} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Ticket List */}
            <div className="md:col-span-1 space-y-4">
              {tickets.map((ticket) => (
                <div 
                  key={ticket._id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                    selectedTicket?._id === ticket._id 
                      ? 'bg-orange-600 border-orange-600 text-white shadow-lg' 
                      : 'bg-white border-stone-100 hover:border-orange-200'
                  }`}
                >
                  {ticket.userHasUnread && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-orange-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(234,88,12,0.6)]" />
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      selectedTicket?._id === ticket._id ? 'bg-white/20 text-white' : getStatusColor(ticket.status)
                    }`}>
                      {ticket.status}
                    </span>
                    <span className={`text-[9px] font-bold ${selectedTicket?._id === ticket._id ? 'text-white/60' : 'text-stone-400'}`}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className={`font-bold text-sm mb-1 truncate ${selectedTicket?._id === ticket._id ? 'text-white' : 'text-stone-800'}`}>
                    {ticket.subject}
                  </h4>
                  <p className={`text-xs truncate ${selectedTicket?._id === ticket._id ? 'text-white/70' : 'text-stone-500'}`}>
                    {ticket.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Conversation View */}
            <div className="md:col-span-2">
              <AnimatePresence mode="wait">
                {selectedTicket ? (
                  <motion.div 
                    key={selectedTicket._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden flex flex-col h-[600px]"
                  >
                    {/* Header */}
                    <div className="p-6 border-b border-stone-50 bg-stone-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-black text-stone-800 tracking-tight uppercase">{selectedTicket.subject}</h3>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(selectedTicket.status)}`}>
                          {selectedTicket.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-stone-400 text-xs font-bold uppercase">
                        <Clock size={12} />
                        <span>Created on {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {/* Original Message */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="bg-orange-50 p-4 rounded-2xl rounded-tl-none border border-orange-100">
                            <p className="text-sm text-stone-700 leading-relaxed">{selectedTicket.message}</p>
                          </div>
                          <span className="text-[10px] font-bold text-stone-400 uppercase mt-2 inline-flex items-center">
                            You • {new Date(selectedTicket.createdAt).toLocaleTimeString()}
                            <CheckCircle size={12} className="ml-1.5 text-green-500" />
                            <span className="ml-1 text-[9px] text-green-600 lowercase font-black">Sent</span>
                          </span>
                        </div>
                      </div>

                      {/* Responses */}
                      {selectedTicket.responses.map((res, i) => {
                        const isAdmin = res.senderId?.role === 'admin' || res.senderId?.role === 'super-admin' || (res.senderId && typeof res.senderId === 'object' && (res.senderId.role === 'admin' || res.senderId.role === 'super-admin'));
                        return (
                          <div key={i} className={`flex items-start space-x-3 ${isAdmin ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              isAdmin ? 'bg-stone-800 text-white' : 'bg-orange-100 text-orange-600'
                            }`}>
                              {isAdmin ? <Shield size={14} /> : <User size={14} />}
                            </div>
                            <div className={`flex-1 ${isAdmin ? 'text-right' : ''}`}>
                              <div className={`p-4 rounded-2xl border ${
                                isAdmin 
                                  ? 'bg-stone-800 text-stone-100 border-stone-800 rounded-tr-none' 
                                  : 'bg-orange-50 text-stone-700 border-orange-100 rounded-tl-none'
                              }`}>
                                <p className="text-sm leading-relaxed">{res.message}</p>
                              </div>
                              <span className="text-[10px] font-bold text-stone-400 uppercase mt-2 inline-flex items-center">
                                {isAdmin ? 'Support Agent' : 'You'} • {new Date(res.createdAt).toLocaleTimeString()}
                                {!isAdmin && <CheckCircle size={12} className="ml-1.5 text-green-500" />}
                                {!isAdmin && <span className="ml-1 text-[9px] text-green-600 lowercase font-black">Sent</span>}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer / Reply Input */}
                    {selectedTicket.status !== 'closed' && (
                      <div className="p-4 border-t border-stone-50 bg-stone-50/50">
                        <form onSubmit={handleSendReply} className="relative">
                          <input 
                            type="text" 
                            placeholder="Type your message here..." 
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            className="w-full bg-white border border-stone-200 pl-4 pr-12 py-3 rounded-xl outline-none focus:border-orange-500 font-medium text-stone-700 text-sm shadow-sm"
                          />
                          <button 
                            disabled={isSubmitting || !replyMessage.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all disabled:opacity-50 active:scale-95"
                          >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          </button>
                        </form>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-12 text-center h-[600px] flex flex-col items-center justify-center">
                    <AlertCircle size={48} className="text-stone-200 mb-4" />
                    <p className="text-stone-400 font-bold">Select a ticket to view the conversation</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* New Ticket Modal */}
        <AnimatePresence>
          {showNewTicketModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl overflow-hidden relative"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-stone-800 uppercase tracking-tight">Create Support Ticket</h3>
                  <button onClick={() => setShowNewTicketModal(false)} className="text-stone-300 hover:text-stone-600 transition-colors">
                    <Plus className="rotate-45" size={24} />
                  </button>
                </div>
                <form onSubmit={handleCreateTicket} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-400 uppercase tracking-widest px-1">Subject</label>
                    <input 
                      type="text" 
                      placeholder="What can we help you with?"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 px-5 py-4 rounded-2xl outline-none focus:border-orange-500 font-bold text-stone-700 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-400 uppercase tracking-widest px-1">Priority</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['low', 'medium', 'high'].map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setNewTicket({...newTicket, priority: p})}
                          className={`py-3 rounded-xl border font-black uppercase tracking-widest text-[10px] transition-all ${
                            newTicket.priority === p 
                              ? 'bg-orange-600 border-orange-600 text-white shadow-md' 
                              : 'bg-stone-50 border-stone-100 text-stone-400 hover:border-orange-200'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-400 uppercase tracking-widest px-1">Message</label>
                    <textarea 
                      placeholder="Describe your issue in detail..."
                      value={newTicket.message}
                      onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 px-5 py-4 rounded-2xl outline-none focus:border-orange-500 font-bold text-stone-700 h-32 resize-none transition-all"
                      required
                    />
                  </div>
                  <div className="flex space-x-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setShowNewTicketModal(false)} 
                      className="flex-1 px-8 py-4 rounded-2xl font-black text-stone-400 bg-stone-50 uppercase tracking-widest text-xs hover:bg-stone-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-1 px-8 py-4 rounded-2xl font-black text-white bg-orange-600 uppercase tracking-widest text-xs hover:bg-orange-700 transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      <span>Submit Ticket</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Support;
