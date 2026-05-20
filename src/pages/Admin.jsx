import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
<<<<<<< HEAD
import { LayoutDashboard, Package, Users, ShoppingBag, Settings, Plus, Edit, Trash2, Loader2, CheckCircle2, Clock, Truck, XCircle, Search } from 'lucide-react';
=======
import { 
  LayoutDashboard, Package, Users, ShoppingBag, Settings, Plus, Edit, 
  Trash2, Loader2, CheckCircle2, Clock, Truck, XCircle, User, Phone, 
  MapPin, CreditCard, Save, Store, Mail, DollarSign, Power, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
>>>>>>> c426b1220887992b23f85ea65b68d05aec8de9b6

const Admin = () => {
  const { user, isAuthenticated, settings: globalSettings, refreshSettings } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [searchFoodQuery, setSearchFoodQuery] = useState('');
  const [categories, setCategories] = useState([]);
  
  const [appSettings, setAppSettings] = useState({
    storeName: '',
    contactEmail: '',
    contactPhone: '',
    currency: '₦',
    deliveryFee: 0,
    minimumOrder: 0,
    isOpen: true,
    openingHours: '',
    maintenanceMode: false
  });

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
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
<<<<<<< HEAD
=======
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
>>>>>>> c426b1220887992b23f85ea65b68d05aec8de9b6
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingFood, setEditingFood] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'All',
    imageUrl: '',
    description: '',
    stock: 0,
    isAvailable: true,
    calories: 0,
    time: '15-20 min'
  });

  // Sync local appSettings with global settings when tab is active or global settings change
  useEffect(() => {
    if (activeTab === 'settings' && globalSettings) {
      setAppSettings({
        storeName: globalSettings.storeName || '',
        contactEmail: globalSettings.contactEmail || '',
        contactPhone: globalSettings.contactPhone || '',
        currency: globalSettings.currency || '₦',
        deliveryFee: globalSettings.deliveryFee || 0,
        minimumOrder: globalSettings.minimumOrder || 0,
        isOpen: globalSettings.isOpen !== undefined ? globalSettings.isOpen : true,
        openingHours: globalSettings.openingHours || '',
        maintenanceMode: globalSettings.maintenanceMode || false
      });
    }
  }, [activeTab, globalSettings]);

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
        isAvailable: food.isAvailable !== undefined ? food.isAvailable : true,
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
        isAvailable: true,
        calories: 0,
        time: '15-20 min'
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenOrderModal = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
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

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setAdminStats(statsData.stats);
          setOrders(statsData.recentOrders);
        }
        
        if (catsRes.ok) {
          const catsData = await catsRes.json();
          setCategories(catsData);
        }
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
      if (activeTab === 'dashboard' || activeTab === 'settings' || !isAuthenticated || user?.role !== 'admin') return;
      
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
          if (res.ok) {
            const data = await res.json();
            if (activeTab === 'products') setFoods(data);
            if (activeTab === 'orders') setOrders(data);
            if (activeTab === 'users') setUsers(data);
          }
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
    { label: 'Total Revenue', value: `₦${adminStats.totalRevenue.toFixed(2)}`, icon: LayoutDashboard, color: 'bg-blue-500' },
    { label: 'Orders', value: adminStats.totalOrders.toString(), icon: ShoppingBag, color: 'bg-orange-500' },
    { label: 'Products', value: adminStats.totalFoods.toString(), icon: Package, color: 'bg-green-500' },
    { label: 'Customers', value: adminStats.totalUsers.toString(), icon: Users, color: 'bg-purple-500' },
  ];

  const handleDeleteFood = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeletingId(id);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/foods/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        }
      });
      if (response.ok) setFoods(foods.filter(f => f._id !== id));
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
        if (selectedOrder?._id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

<<<<<<< HEAD
  const handleUpdateUserRole = async (targetUserId, newRole) => {
    if (targetUserId === (user.id || user._id) && newRole !== 'admin') {
      alert("You cannot demote yourself from admin status.");
      return;
    }

    setUpdatingUserId(targetUserId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${targetUserId}`, {
        method: 'PUT',
=======
  const handleUpdateUserRole = async (userId, newRole) => {
    if (userId === user?.id || userId === user?._id) return alert("You cannot change your own role.");
    setUpdatingUserId(userId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${userId}/role`, {
        method: 'PATCH',
>>>>>>> c426b1220887992b23f85ea65b68d05aec8de9b6
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        },
        body: JSON.stringify({ role: newRole })
      });
<<<<<<< HEAD

      if (response.ok) {
        setUsers(users.map(u => u._id === targetUserId ? { ...u, role: newRole } : u));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('An error occurred while updating user role');
=======
      if (response.ok) setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error updating user role:', error);
>>>>>>> c426b1220887992b23f85ea65b68d05aec8de9b6
    } finally {
      setUpdatingUserId(null);
    }
  };

<<<<<<< HEAD
=======
  const handleUpdateSettings = async (e) => {
    if (e) e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        },
        body: JSON.stringify(appSettings)
      });
      if (response.ok) {
        await refreshSettings();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

>>>>>>> c426b1220887992b23f85ea65b68d05aec8de9b6
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
          <aside className="w-full lg:w-64 flex lg:flex-col overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 gap-2 sticky top-16 lg:top-24 bg-stone-50 z-20">
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
                {/* Recent Orders table - omitted for brevity but remains same */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-orange-600 font-bold text-sm hover:underline">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-stone-100">
                          <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Customer / Order</th>
                          <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Date & Time</th>
                          <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Status</th>
                          <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order._id} className="hover:bg-stone-50 transition-colors">
                            <td className="py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-stone-700 text-sm">{order.userId?.name || 'Guest User'}</span>
                                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">#{order._id.substring(18)}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex flex-col text-stone-600">
                                <span className="text-[10px] font-bold">{new Date(order.createdAt).toLocaleDateString()}</span>
                                <span className="text-[10px] text-stone-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                              }`}>
                                {order.status}
                              </span>
                            </td>
<<<<<<< HEAD
                            <td className="py-4 font-black text-stone-800 text-sm">${order.totalAmount.toFixed(2)}</td>
=======
                            <td className="py-4 font-bold text-stone-800">₦{order.totalAmount.toFixed(2)}</td>
>>>>>>> c426b1220887992b23f85ea65b68d05aec8de9b6
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
<<<<<<< HEAD
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">Product Management</h3>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input 
                        type="text"
                        placeholder="Search products..."
                        value={searchFoodQuery}
                        onChange={(e) => setSearchFoodQuery(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-100 pl-10 pr-4 py-2 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700 text-sm"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => handleOpenModal()}
                    className="bg-orange-600 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 hover:bg-orange-700 transition-all shadow-md active:scale-95 self-start sm:self-center"
                  >
=======
                  <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">Product Management</h3>
                  <button onClick={() => handleOpenModal()} className="bg-orange-600 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 hover:bg-orange-700 transition-all shadow-md active:scale-95">
>>>>>>> c426b1220887992b23f85ea65b68d05aec8de9b6
                    <Plus size={18} />
                    <span>Add New Product</span>
                  </button>
                </div>
                {/* Product list omitted for brevity */}
                <div className="block sm:hidden space-y-3">
                  {foods
                    .filter(product => 
                      product.name.toLowerCase().includes(searchFoodQuery.toLowerCase()) ||
                      product.category.toLowerCase().includes(searchFoodQuery.toLowerCase())
                    )
                    .map((product) => (
                    <div key={product._id} className="border border-stone-100 rounded-xl p-3 flex items-center space-x-3 bg-stone-50/50">
                      <div className="w-14 h-14 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                          <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-stone-800 truncate text-sm">{product.name}</h4>
                          {!product.isAvailable && <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black uppercase">Out</span>}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-bold uppercase">{product.category}</span>
                          <span className="font-black text-orange-600 text-sm">₦{product.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button onClick={() => handleOpenModal(product)} className="p-2 text-blue-600 bg-blue-50 rounded-lg active:scale-90"><Edit size={16} /></button>
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
                      {foods
                        .filter(product => 
                          product.name.toLowerCase().includes(searchFoodQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchFoodQuery.toLowerCase())
                        )
                        .map((product) => (
                        <tr key={product._id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-4 flex items-center space-x-3">
<<<<<<< HEAD
                            <div className="w-10 h-10 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={product.imageUrl || `https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=50&h=50&fit=crop`} alt={product.name} className="w-full h-full object-cover" />
=======
                            <div className="w-10 h-10 bg-stone-100 rounded-lg overflow-hidden">
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
>>>>>>> c426b1220887992b23f85ea65b68d05aec8de9b6
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-stone-700">{product.name}</span>
                              <span className={`text-[8px] font-black uppercase tracking-widest w-fit px-1.5 py-0.5 rounded ${
                                product.isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 text-stone-600 text-sm font-medium">{product.category}</td>
                          <td className="py-4 font-black text-stone-800">₦{product.price.toFixed(2)}</td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button onClick={() => handleOpenModal(product)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"><Edit size={18} /></button>
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
<<<<<<< HEAD
                
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
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 bg-white border border-stone-200 text-stone-600 text-xs font-bold rounded-lg active:bg-stone-50"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Table View */}
=======
                {/* Order list omitted for brevity */}
>>>>>>> c426b1220887992b23f85ea65b68d05aec8de9b6
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-100">
<<<<<<< HEAD
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Order / Customer</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Date & Time</th>
=======
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">ID</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Customer</th>
>>>>>>> c426b1220887992b23f85ea65b68d05aec8de9b6
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Status</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Amount</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-4">
                            <div className="flex flex-col">
                              <span className="font-black text-stone-800 text-sm">{order.userId?.name || 'Guest User'}</span>
                              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">#{order._id.substring(18)}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex flex-col text-stone-600">
                              <span className="text-xs font-bold">{new Date(order.createdAt).toLocaleDateString()}</span>
                              <span className="text-[10px] text-stone-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-stone-800 text-sm">{order.userId?.name || 'Unknown'}</span>
                              <span className="text-[10px] text-stone-400">{order.userId?.email || 'No email'}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
<<<<<<< HEAD
                              <select 
                                disabled={updatingOrderId === order._id}
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none border-none disabled:opacity-50 ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                }`}
                              >
                                {["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
=======
                              <select disabled={updatingOrderId === order._id} value={order.status} onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)} className={`px-3 py-1 rounded-full text-xs font-bold outline-none border-none disabled:opacity-50 ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                {["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
>>>>>>> c426b1220887992b23f85ea65b68d05aec8de9b6
                              </select>
                              {updatingOrderId === order._id && <Loader2 size={14} className="animate-spin text-orange-600" />}
                            </div>
                          </td>
                          <td className="py-4 font-black text-stone-800">₦{order.totalAmount.toFixed(2)}</td>
                          <td className="py-4 text-right">
<<<<<<< HEAD
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="text-orange-600 font-bold text-sm hover:underline"
                            >
                              Details
                            </button>
=======
                            <button onClick={() => handleOpenOrderModal(order)} className="text-orange-600 font-bold text-sm hover:underline">Details</button>
>>>>>>> c426b1220887992b23f85ea65b68d05aec8de9b6
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
<<<<<<< HEAD
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">User Management</h3>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input 
                      type="text"
                      placeholder="Search users..."
                      value={searchUserQuery}
                      onChange={(e) => setSearchUserQuery(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-100 pl-10 pr-4 py-2 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700 text-sm"
                    />
                  </div>
                </div>
                
                {/* Mobile: Card View */}
                <div className="block sm:hidden space-y-3">
                  {users
                    .filter(u => 
                      u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) || 
                      u.email.toLowerCase().includes(searchUserQuery.toLowerCase())
                    )
                    .map((u) => (
                    <div key={u._id} className="border border-stone-100 rounded-xl p-4 bg-stone-50/50">
                      <div className="flex items-center space-x-3 mb-3 pb-3 border-b border-stone-100">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-stone-800 truncate text-sm">{u.name}</h4>
                          <p className="text-xs text-stone-400 truncate">{u.email}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Joined</p>
                          <p className="text-[10px] font-bold text-stone-600">
                            {new Date(u.createdAt).toLocaleDateString()}<br/>
                            {new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Last Login</p>
                          <p className="text-[10px] font-bold text-stone-600">
                            {u.lastLogin ? (
                              <>
                                {new Date(u.lastLogin).toLocaleDateString()}<br/>
                                {new Date(u.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </>
                            ) : 'Never'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                        <div className="flex items-center space-x-2">
                          <select 
                            disabled={updatingUserId === u._id}
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none border-none disabled:opacity-50 ${
                              u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          {updatingUserId === u._id && <Loader2 size={12} className="animate-spin text-orange-600" />}
                        </div>
                        <button className="text-stone-400 hover:text-orange-600 transition-colors">
                          <Settings size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Table View */}
=======
                <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight mb-6">User Management</h3>
                {/* User list omitted for brevity */}
>>>>>>> c426b1220887992b23f85ea65b68d05aec8de9b6
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-100">
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">User</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Joined</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Last Login</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs text-right">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {users
                        .filter(u => 
                          u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchUserQuery.toLowerCase())
                        )
                        .map((u) => (
                        <tr key={u._id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-stone-700 text-sm">{u.name}</span>
                                <span className="text-xs text-stone-400">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex flex-col text-stone-500">
                              <span className="text-xs font-bold">{new Date(u.createdAt).toLocaleDateString()}</span>
                              <span className="text-[10px] font-medium">{new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex flex-col text-stone-500">
                              {u.lastLogin ? (
                                <>
                                  <span className="text-xs font-bold">{new Date(u.lastLogin).toLocaleDateString()}</span>
                                  <span className="text-[10px] font-medium">{new Date(u.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </>
                              ) : (
                                <span className="text-xs font-bold text-stone-300 italic">Never</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
<<<<<<< HEAD
                              {updatingUserId === u._id && <Loader2 size={14} className="animate-spin text-orange-600" />}
                              <select 
                                disabled={updatingUserId === u._id}
                                value={u.role}
                                onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none border-none disabled:opacity-50 ${
                                  u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
=======
                              <select disabled={updatingUserId === u._id || (u._id === (user?.id || user?._id))} value={u.role} onChange={(e) => handleUpdateUserRole(u._id, e.target.value)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none border-none disabled:opacity-50 ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                              {updatingUserId === u._id && <Loader2 size={14} className="animate-spin text-orange-600" />}
>>>>>>> c426b1220887992b23f85ea65b68d05aec8de9b6
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-orange-50 p-4 rounded-2xl border border-orange-100">
                  <div className="flex items-center space-x-3 text-orange-800">
                    <RefreshCw size={20} className="animate-spin" />
                    <span className="font-bold text-sm">Site settings are synced with global configuration.</span>
                  </div>
                  <button onClick={() => refreshSettings()} className="px-4 py-2 bg-white text-orange-600 font-bold text-xs rounded-xl shadow-sm hover:bg-orange-100 transition-all">Manual Sync</button>
                </div>

                <form onSubmit={handleUpdateSettings} className="space-y-6">
                  {/* Store Information */}
                  <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 sm:p-8">
                    <div className="flex items-center space-x-3 mb-8">
                      <div className="p-2 bg-orange-100 text-orange-600 rounded-xl"><Store size={20} /></div>
                      <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">Store Profile</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Store Name</label>
                        <div className="relative">
                          <input type="text" value={appSettings.storeName} onChange={(e) => setAppSettings({...appSettings, storeName: e.target.value})} className="w-full bg-stone-50 border border-stone-100 pl-11 pr-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700" />
                          <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Store Email</label>
                        <div className="relative">
                          <input type="email" value={appSettings.contactEmail} onChange={(e) => setAppSettings({...appSettings, contactEmail: e.target.value})} className="w-full bg-stone-50 border border-stone-100 pl-11 pr-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700" />
                          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Contact Phone</label>
                        <div className="relative">
                          <input type="text" value={appSettings.contactPhone} onChange={(e) => setAppSettings({...appSettings, contactPhone: e.target.value})} className="w-full bg-stone-50 border border-stone-100 pl-11 pr-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700" />
                          <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Business Hours</label>
                        <div className="relative">
                          <input type="text" value={appSettings.openingHours} onChange={(e) => setAppSettings({...appSettings, openingHours: e.target.value})} className="w-full bg-stone-50 border border-stone-100 pl-11 pr-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700" />
                          <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 sm:p-8">
                    <div className="flex items-center space-x-3 mb-8">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><DollarSign size={20} /></div>
                      <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">Operations & Fees</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Delivery Fee (₦)</label>
                        <div className="relative">
                          <input type="number" value={appSettings.deliveryFee} onChange={(e) => setAppSettings({...appSettings, deliveryFee: parseFloat(e.target.value) || 0})} className="w-full bg-stone-50 border border-stone-100 pl-11 pr-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700" />
                          <Truck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Min. Order Value (₦)</label>
                        <div className="relative">
                          <input type="number" value={appSettings.minimumOrder} onChange={(e) => setAppSettings({...appSettings, minimumOrder: parseFloat(e.target.value) || 0})} className="w-full bg-stone-50 border border-stone-100 pl-11 pr-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700" />
                          <ShoppingBag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 sm:p-8">
                    <div className="flex items-center space-x-3 mb-8">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Power size={20} /></div>
                      <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">System Status</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                        <div>
                          <p className="font-bold text-stone-800">Store Status</p>
                          <p className="text-xs text-stone-400">{appSettings.isOpen ? 'Currently accepting orders' : 'Currently closed'}</p>
                        </div>
                        <button type="button" onClick={() => setAppSettings({...appSettings, isOpen: !appSettings.isOpen})} className={`w-12 h-6 rounded-full transition-all relative ${appSettings.isOpen ? 'bg-green-500' : 'bg-stone-300'}`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${appSettings.isOpen ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                        <div>
                          <p className="font-bold text-stone-800">Maintenance Mode</p>
                          <p className="text-xs text-stone-400">Lock site for updates</p>
                        </div>
                        <button type="button" onClick={() => setAppSettings({...appSettings, maintenanceMode: !appSettings.maintenanceMode})} className={`w-12 h-6 rounded-full transition-all relative ${appSettings.maintenanceMode ? 'bg-orange-500' : 'bg-stone-300'}`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${appSettings.maintenanceMode ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-4 sticky bottom-4 z-30">
                    <AnimatePresence>
                      {saveSuccess && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center space-x-2 shadow-lg">
                          <CheckCircle2 size={16} />
                          <span>Settings Saved!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button type="submit" disabled={isSaving} className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-3 hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 disabled:opacity-70 active:scale-95">
                      {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                      <span>{isSaving ? 'Saving Changes...' : 'Save Configuration'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Product and Order Modals omitted for brevity */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-stone-800 uppercase tracking-tight">{editingFood ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><XCircle className="text-stone-400" /></button>
            </div>
            <form onSubmit={handleSaveFood} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Product Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Price (₦)</label>
                <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700">
                  <option value="All">All</option>
                  {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Stock Status</label>
                <div 
                  onClick={() => setFormData({...formData, isAvailable: !formData.isAvailable})}
                  className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all h-[50px] ${
                    formData.isAvailable ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                  }`}
                >
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isAvailable ? 'left-6' : 'left-1'}`} />
                  </div>
                  <span className={`ml-3 text-sm font-bold uppercase tracking-wider ${formData.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Product Image</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-32 h-32 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl overflow-hidden flex items-center justify-center group">
                    {formData.imageUrl ? <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" /> : <Plus className="text-stone-300 group-hover:text-orange-500 transition-colors" size={32} />}
                    {isUploading && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center"><Loader2 className="text-orange-600 animate-spin" size={24} /></div>}
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Upload from device or enter URL</p>
                    <input type="text" placeholder="https://example.com/image.jpg" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700 text-sm" />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700 h-24 resize-none" />
              </div>
              <div className="flex space-x-4 md:col-span-2 pt-4">
                <button type="button" disabled={isSaving} onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-xl font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 transition-all uppercase tracking-widest text-sm disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 px-6 py-4 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 uppercase tracking-widest text-sm flex items-center justify-center space-x-2 disabled:opacity-70">
                  {isSaving && <Loader2 size={18} className="animate-spin" />}
                  <span>{editingFood ? (isSaving ? 'Updating...' : 'Update Product') : (isSaving ? 'Creating...' : 'Create Product')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
<<<<<<< HEAD

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <XCircle size={24} />
            </button>
            
            <div className="mb-8">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block mb-1">Order Details</span>
              <h3 className="text-2xl font-black text-stone-800 tracking-tight uppercase">Order #{selectedOrder._id.substring(18)}</h3>
              <div className="flex items-center text-stone-400 text-sm mt-1 font-medium space-x-3">
                <div className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  {new Date(selectedOrder.createdAt).toLocaleDateString()} • {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                  selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4">Ordered Items</h4>
                <div className="space-y-3 bg-stone-50 rounded-2xl p-4 sm:p-6">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-stone-700 text-sm">{item.name}</p>
                          <p className="text-[10px] text-stone-400 font-bold uppercase">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-stone-700 font-black text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-stone-200 flex justify-between items-center">
                    <span className="font-black text-stone-800 uppercase text-xs tracking-widest">Total Amount</span>
                    <span className="text-xl font-black text-orange-600">${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3">Customer Profile</h4>
                  <div className="flex items-center space-x-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold overflow-hidden border-2 border-white shadow-sm">
                      {selectedOrder.userId?.avatar ? (
                        <img src={`${import.meta.env.VITE_API_BASE_URL}${selectedOrder.userId.avatar}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        selectedOrder.userId?.name?.charAt(0).toUpperCase() || <User size={18} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-stone-700 truncate">{selectedOrder.userId?.name || 'Guest User'}</p>
                      <p className="text-[10px] text-stone-400 font-medium truncate">{selectedOrder.userId?.email || 'No email provided'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3">Contact Details</h4>
                  <div className="flex items-center space-x-2 text-stone-600 p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <Users size={16} className="text-stone-400 flex-shrink-0" />
                    <p className="text-sm font-bold tracking-tight">{selectedOrder.phoneNumber}</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3">Delivery Information</h4>
                  <div className="flex items-start space-x-2 text-stone-600 p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <Truck size={16} className="mt-0.5 text-stone-400 flex-shrink-0" />
                    <p className="text-sm font-medium leading-relaxed">{selectedOrder.deliveryAddress}</p>
=======
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-stone-800 uppercase tracking-tight">Order Details</h3>
                <p className="text-sm font-bold text-stone-400">#{selectedOrder._id}</p>
              </div>
              <button onClick={() => setIsOrderModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><XCircle className="text-stone-400" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 p-3 rounded-2xl text-orange-600"><User size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Customer</p>
                    <p className="font-bold text-stone-800">{selectedOrder.userId?.name || 'Unknown'}</p>
                    <p className="text-xs text-stone-500 font-medium">{selectedOrder.userId?.email || 'No email'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 p-3 rounded-2xl text-orange-600"><Phone size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Phone Number</p>
                    <p className="font-bold text-stone-800">{selectedOrder.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 p-3 rounded-2xl text-orange-600"><MapPin size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Delivery Address</p>
                    <p className="font-bold text-stone-800 text-sm leading-relaxed">{selectedOrder.deliveryAddress || 'No address'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 p-3 rounded-2xl text-orange-600"><CreditCard size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Payment</p>
                    <p className="font-bold text-stone-800 capitalize">{selectedOrder.paymentMethod?.replace(/_/g, ' ') || 'Cash on Delivery'}</p>
>>>>>>> c426b1220887992b23f85ea65b68d05aec8de9b6
                  </div>
                </div>
              </div>
            </div>
<<<<<<< HEAD

            <div className="mt-10 pt-6 border-t border-stone-100 flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-8 py-3 bg-stone-100 text-stone-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-stone-200 transition-all"
              >
                Close Details
              </button>
=======
            <div className="bg-stone-50 rounded-3xl p-6 mb-8">
              <h4 className="text-sm font-black text-stone-800 uppercase tracking-wider mb-4">Items Order</h4>
              <div className="space-y-4">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-stone-100"><img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /></div>
                      <div>
                        <p className="font-bold text-stone-800 text-sm">{item.name}</p>
                        <p className="text-[10px] text-stone-400 font-bold">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-black text-stone-800 text-sm">₦{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="h-px bg-stone-200 my-4"></div>
              <div className="flex justify-between items-center">
                <span className="text-base font-black text-stone-800">Total Amount</span>
                <span className="text-xl font-black text-orange-600">₦{selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-2 ml-1">Update Status</p>
                <select disabled={updatingOrderId === selectedOrder._id} value={selectedOrder.status} onChange={(e) => handleUpdateOrderStatus(selectedOrder._id, e.target.value)} className={`w-full px-4 py-4 rounded-2xl text-sm font-bold outline-none border-2 transition-all ${selectedOrder.status === 'delivered' ? 'border-green-100 bg-green-50 text-green-700' : selectedOrder.status === 'cancelled' ? 'border-red-100 bg-red-50 text-red-700' : 'border-orange-100 bg-orange-50 text-orange-700'}`}>
                  {["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>)}
                </select>
              </div>
              <button onClick={() => setIsOrderModalOpen(false)} className="px-8 py-4 bg-stone-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-stone-900 transition-all self-end h-[56px]">Close</button>
>>>>>>> c426b1220887992b23f85ea65b68d05aec8de9b6
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
