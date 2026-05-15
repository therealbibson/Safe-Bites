import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, Users, ShoppingBag, Settings, Plus, Edit, Trash2, Loader2, CheckCircle2, Clock, Truck, XCircle } from 'lucide-react';

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalFoods: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'All',
    imageUrl: '',
    description: '',
    stock: 0,
    calories: 0,
    time: '15-20 min'
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    setIsUploading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        },
        body: uploadFormData
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, imageUrl: `${import.meta.env.VITE_API_BASE_URL}${data.imageUrl}` }));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('An error occurred during image upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenModal = (food = null) => {
    if (food) {
      setEditingFood(food);
      setFormData({
        name: food.name,
        price: food.price,
        category: food.category,
        imageUrl: food.imageUrl || '',
        description: food.description || '',
        stock: food.stock || 0,
        calories: food.calories || 0,
        time: food.time || '15-20 min'
      });
    } else {
      setEditingFood(null);
      setFormData({
        name: '',
        price: '',
        category: 'All',
        imageUrl: '',
        description: '',
        stock: 0,
        calories: 0,
        time: '15-20 min'
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveFood = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': user?.id || user?._id,
        'x-user-role': user?.role
      };
      
      const url = editingFood 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/foods/${editingFood._id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/foods`;
      
      const method = editingFood ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const savedFood = await response.json();
        if (editingFood) {
          setFoods(foods.map(f => f._id === savedFood._id ? savedFood : f));
        } else {
          setFoods([savedFood, ...foods]);
        }
        // Update stats
        setAdminStats(prev => ({ ...prev, totalFoods: prev.totalFoods + (editingFood ? 0 : 1) }));
        setIsModalOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save food');
      }
    } catch (error) {
      console.error('Error saving food:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const headers = {
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        };

        const [statsRes, catsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stats`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories`)
        ]);

        const statsData = await statsRes.json();
        const catsData = await catsRes.json();

        setAdminStats(statsData.stats);
        setOrders(statsData.recentOrders);
        setCategories(catsData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchInitialData();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchTabData = async () => {
      if (activeTab === 'dashboard' || !isAuthenticated || user?.role !== 'admin') return;
      
      setTabLoading(true);
      try {
        const headers = {
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        };

        let endpoint = '';
        if (activeTab === 'products') endpoint = 'foods';
        if (activeTab === 'orders') endpoint = 'orders';
        if (activeTab === 'users') endpoint = 'users';

        if (endpoint) {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/${endpoint}`, { headers });
          const data = await res.json();
          if (activeTab === 'products') setFoods(data);
          if (activeTab === 'orders') setOrders(data);
          if (activeTab === 'users') setUsers(data);
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab} data:`, error);
      } finally {
        setTabLoading(false);
      }
    };

    fetchTabData();
  }, [activeTab, isAuthenticated, user]);

  const stats = [
    { 
      label: 'Total Revenue', 
      value: `$${adminStats.totalRevenue.toFixed(2)}`, 
      icon: LayoutDashboard, 
      color: 'bg-blue-500' 
    },
    { label: 'Orders', value: adminStats.totalOrders.toString(), icon: ShoppingBag, color: 'bg-orange-500' },
    { label: 'Products', value: adminStats.totalFoods.toString(), icon: Package, color: 'bg-green-500' },
    { label: 'Customers', value: adminStats.totalUsers.toString(), icon: Users, color: 'bg-purple-500' },
  ];

  const handleDeleteFood = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    setDeletingId(id);
    try {
      const headers = {
        'x-user-id': user?.id || user?._id,
        'x-user-role': user?.role
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/foods/${id}`, {
        method: 'DELETE',
        headers
      });
      
      if (response.ok) {
        setFoods(foods.filter(f => f._id !== id));
      } else {
        alert('Failed to delete food');
      }
    } catch (error) {
      console.error('Error deleting food:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-16">
      <Navbar />
      
      {loading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[150] flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
            <p className="font-bold text-stone-600">Initializing Workspace...</p>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Horizontal on mobile, vertical on desktop */}
          <aside className="w-full lg:w-64 flex lg:flex-col overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 gap-2 scrollbar-hide sticky top-16 lg:top-24 bg-stone-50 z-20">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'products', icon: Package, label: 'Products' },
              { id: 'orders', icon: ShoppingBag, label: 'Orders' },
              { id: 'users', icon: Users, label: 'Users' },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 lg:w-full flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 lg:px-4 py-2.5 sm:py-3 rounded-xl font-bold transition-all text-sm sm:text-base ${
                  activeTab === tab.id 
                    ? 'bg-orange-600 text-white shadow-lg' 
                    : 'bg-white text-stone-600 hover:bg-orange-50 border border-stone-100'
                }`}
              >
                <tab.icon size={18} className="sm:w-5 sm:h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {tabLoading && (
              <div className="flex flex-col items-center justify-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-100 mb-8 z-10">
                <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-4" />
                <p className="font-bold text-stone-400">Updating Workspace...</p>
              </div>
            )}

            {!tabLoading && activeTab === 'dashboard' && (
              <div className="space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-stone-100">
                      <div className={`${stat.color} w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white mb-3 sm:mb-4`}>
                        <stat.icon size={20} className="sm:w-6 sm:h-6" />
                      </div>
                      <p className="text-stone-500 font-medium text-xs sm:text-sm uppercase tracking-wider">{stat.label}</p>
                      <h3 className="text-xl sm:text-2xl font-black text-stone-800">{stat.value}</h3>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">Recent Orders</h3>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="text-orange-600 font-bold text-sm hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-stone-100">
                          <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Order ID</th>
                          <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Status</th>
                          <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order._id} className="hover:bg-stone-50 transition-colors">
                            <td className="py-4 font-bold text-stone-700">{order._id.substring(0, 8)}...</td>
                            <td className="py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-4 font-bold text-stone-800">${order.totalAmount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">Product Management</h3>
                  <button 
                    onClick={() => handleOpenModal()}
                    className="bg-orange-600 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 hover:bg-orange-700 transition-all shadow-md active:scale-95"
                  >
                    <Plus size={18} />
                    <span>Add New Product</span>
                  </button>
                </div>
                
                {/* Mobile: Card View | Desktop: Table View */}
                <div className="block sm:hidden space-y-3">
                  {foods.map((product) => (
                    <div key={product._id} className="border border-stone-100 rounded-xl p-3 flex items-center space-x-3 bg-stone-50/50">
                      <div className="w-14 h-14 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={product.imageUrl || `https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop`} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-stone-800 truncate text-sm">{product.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-bold uppercase">{product.category}</span>
                          <span className="font-black text-orange-600 text-sm">${product.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleOpenModal(product)}
                          className="p-2 text-blue-600 bg-blue-50 rounded-lg active:scale-90"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          disabled={deletingId === product._id}
                          onClick={() => handleDeleteFood(product._id)}
                          className="p-2 text-red-600 bg-red-50 rounded-lg active:scale-90 disabled:opacity-50"
                        >
                          {deletingId === product._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-100">
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Product</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Category</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Price</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {foods.map((product) => (
                        <tr key={product._id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-4 flex items-center space-x-3">
                            <div className="w-10 h-10 bg-stone-100 rounded-lg overflow-hidden">
                              <img src={product.imageUrl || `https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=50&h=50&fit=crop`} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-stone-700">{product.name}</span>
                          </td>
                          <td className="py-4 text-stone-600 text-sm font-medium">{product.category}</td>
                          <td className="py-4 font-black text-stone-800">${product.price.toFixed(2)}</td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button 
                                onClick={() => handleOpenModal(product)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                disabled={deletingId === product._id}
                                onClick={() => handleDeleteFood(product._id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {deletingId === product._id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 sm:p-6">
                <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight mb-6">Order Management</h3>
                
                {/* Mobile: Card View */}
                <div className="block sm:hidden space-y-3">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-stone-100 rounded-xl p-4 bg-stone-50/50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Order ID</span>
                          <h4 className="font-bold text-stone-800 text-sm">#{order._id.substring(18)}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Amount</span>
                          <span className="font-black text-orange-600 text-sm">${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-stone-100">
                        <div className="flex-1 relative">
                          <select 
                            disabled={updatingOrderId === order._id}
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg text-xs font-bold outline-none border-none shadow-sm disabled:opacity-50 ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          {updatingOrderId === order._id && <Loader2 size={12} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-stone-400" />}
                        </div>
                        <button className="px-4 py-2 bg-white border border-stone-200 text-stone-600 text-xs font-bold rounded-lg active:bg-stone-50">Details</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-100">
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">ID</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Status</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Amount</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-4 font-bold text-stone-700">#{order._id.substring(18)}</td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <select 
                                disabled={updatingOrderId === order._id}
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                className={`px-3 py-1 rounded-full text-xs font-bold outline-none border-none disabled:opacity-50 ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                }`}
                              >
                                {["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              {updatingOrderId === order._id && <Loader2 size={14} className="animate-spin text-orange-600" />}
                            </div>
                          </td>
                          <td className="py-4 font-black text-stone-800">${order.totalAmount.toFixed(2)}</td>
                          <td className="py-4 text-right">
                            <button className="text-orange-600 font-bold text-sm hover:underline">Details</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 sm:p-6">
                <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight mb-6">User Management</h3>
                
                {/* Mobile: Card View */}
                <div className="block sm:hidden space-y-3">
                  {users.map((u) => (
                    <div key={u._id} className="border border-stone-100 rounded-xl p-4 bg-stone-50/50">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-stone-800 truncate text-sm">{u.name}</h4>
                          <p className="text-xs text-stone-400 truncate">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {u.role}
                        </span>
                        <button className="text-stone-400 hover:text-orange-600 transition-colors">
                          <Settings size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-100">
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Name</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Email</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs text-right">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-4 font-bold text-stone-700">{u.name}</td>
                          <td className="py-4 text-stone-600 text-sm">{u.email}</td>
                          <td className="py-4 text-right">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {u.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {['settings'].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-stone-200">
                <div className="bg-stone-50 p-4 rounded-full mb-4 text-stone-400">
                  <Settings size={40} />
                </div>
                <h3 className="text-lg font-bold text-stone-600 uppercase tracking-widest">Section under development</h3>
                <p className="text-stone-400 text-sm">This module will be available in the next update.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-stone-800 mb-6 uppercase tracking-tight">
              {editingFood ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSaveFood} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Product Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700"
                >
                  <option value="All">All</option>
                  {categories.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Product Image</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-32 h-32 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl overflow-hidden flex items-center justify-center group">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Plus className="text-stone-300 group-hover:text-orange-500 transition-colors" size={32} />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="text-orange-600 animate-spin" size={24} />
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Upload from device or enter URL</p>
                    <input 
                      type="text" 
                      placeholder="https://example.com/image.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700 text-sm"
                    />
                    <p className="text-[10px] text-stone-400">Supported formats: JPG, PNG, WEBP (Max 5MB)</p>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700 h-24 resize-none"
                />
              </div>
              <div className="flex space-x-4 md:col-span-2 pt-4">
                <button 
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-xl font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 transition-all uppercase tracking-widest text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-6 py-4 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 uppercase tracking-widest text-sm flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  {isSaving && <Loader2 size={18} className="animate-spin" />}
                  <span>{editingFood ? (isSaving ? 'Updating...' : 'Update Product') : (isSaving ? 'Creating...' : 'Create Product')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
