import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { 
  LayoutDashboard, Package, Users, ShoppingBag, Settings, Plus, Edit, 
  Trash2, Loader2, CheckCircle2, Clock, Truck, XCircle, Search, User, Phone, MapPin, CreditCard
} from 'lucide-react';

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const { refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [searchFoodQuery, setSearchFoodQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({
    storeName: 'SafeBite',
    contactEmail: 'support@safebite.com',
    contactPhone: '+234 800 SAFEBITE',
    currency: '₦',
    deliveryFee: 2.0,
    minimumOrder: 0,
    isOpen: true,
    openingHours: '08:00 AM - 10:00 PM',
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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingFood, setEditingFood] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
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

        const [statsRes, catsRes, settingsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stats`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/settings?t=${Date.now()}`)
        ]);

        const statsData = await statsRes.json();
        const catsData = await catsRes.json();
        const settingsData = await settingsRes.json();

        setAdminStats(statsData.stats);
        setOrders(statsData.recentOrders || []);
        setCategories(catsData);
        if (settingsData && !settingsData.error) setSettings(settingsData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchInitialData();
    } else if (isAuthenticated && user?.role !== 'admin') {
      setLoading(false);
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
    { label: 'Total Revenue', value: `${settings?.currency || '₦'}${(adminStats?.totalRevenue || 0).toFixed(2)}`, icon: LayoutDashboard, color: 'bg-blue-500' },
    { label: 'Orders', value: (adminStats?.totalOrders || 0).toString(), icon: ShoppingBag, color: 'bg-orange-500' },
    { label: 'Products', value: (adminStats?.totalFoods || 0).toString(), icon: Package, color: 'bg-green-500' },
    { label: 'Customers', value: (adminStats?.totalUsers || 0).toString(), icon: Users, color: 'bg-purple-500' },
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
      if (response.ok) setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUpdateUserRole = async (targetUserId, newRole) => {
    if (targetUserId === (user.id || user._id) && newRole !== 'admin') {
      alert("You cannot demote yourself from admin status.");
      return;
    }

    setUpdatingUserId(targetUserId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${targetUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        setUsers(users.map(u => u._id === targetUserId ? { ...u, role: newRole } : u));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        refreshSettings(); // Sync global settings context
        alert('Settings updated successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthenticated && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-stone-50 pt-16 flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-stone-800 uppercase">Access Denied</h2>
          <p className="text-stone-500 font-bold mt-2">You do not have permission to view this page.</p>
          <button onClick={() => window.location.href = '/home'} className="mt-6 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm">Return Home</button>
        </div>
      </div>
    );
  }

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
                
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-orange-600 font-bold text-sm hover:underline">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-stone-100">
                          <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Customer</th>
                          <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Status</th>
                          <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Amount</th>
                          <th className="pb-4 font-bold text-stone-400 uppercase text-xs text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order._id} className="hover:bg-stone-50 transition-colors">
                            <td className="py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-stone-700 text-sm">{order.userId?.name || 'Guest User'}</span>
                                <span className="text-[10px] text-stone-400 font-bold uppercase">#{order._id.substring(18)}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-4 font-black text-stone-800 text-sm">${order.totalAmount.toFixed(2)}</td>
                            <td className="py-4 text-right text-xs font-bold text-stone-500">
                              {new Date(order.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        {orders.length === 0 && (
                          <tr>
                            <td colSpan="4" className="py-8 text-center text-stone-400 font-bold">No recent orders</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 sm:p-6">
                <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight mb-6">Store Settings</h3>
                <form onSubmit={handleUpdateSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Store Name</label>
                    <input type="text" value={settings.storeName} onChange={(e) => setSettings({...settings, storeName: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Contact Email</label>
                    <input type="email" value={settings.contactEmail} onChange={(e) => setSettings({...settings, contactEmail: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Contact Phone</label>
                    <input type="text" value={settings.contactPhone} onChange={(e) => setSettings({...settings, contactPhone: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Currency Symbol</label>
                    <input type="text" value={settings.currency} onChange={(e) => setSettings({...settings, currency: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Delivery Fee</label>
                    <input type="number" step="0.01" value={settings.deliveryFee} onChange={(e) => setSettings({...settings, deliveryFee: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Opening Hours</label>
                    <input type="text" value={settings.openingHours} onChange={(e) => setSettings({...settings, openingHours: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700" />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div onClick={() => setSettings({...settings, isOpen: !settings.isOpen})} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all flex-1 h-[50px] ${settings.isOpen ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.isOpen ? 'left-6' : 'left-1'}`} />
                      </div>
                      <span className={`ml-3 text-sm font-bold uppercase tracking-wider ${settings.isOpen ? 'text-green-600' : 'text-red-600'}`}>{settings.isOpen ? 'Store Open' : 'Store Closed'}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all flex-1 h-[50px] ${!settings.maintenanceMode ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.maintenanceMode ? 'bg-orange-500' : 'bg-blue-500'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-6' : 'left-1'}`} />
                      </div>
                      <span className={`ml-3 text-sm font-bold uppercase tracking-wider ${settings.maintenanceMode ? 'text-orange-600' : 'text-blue-600'}`}>{settings.maintenanceMode ? 'Maintenance ON' : 'Normal Mode'}</span>
                    </div>
                  </div>
                  <div className="md:col-span-2 pt-4">
                    <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-orange-600 uppercase tracking-widest text-sm flex items-center justify-center space-x-2">
                      {isSaving && <Loader2 size={18} className="animate-spin" />}
                      <span>Save Settings</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
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
                  <button onClick={() => handleOpenModal()} className="bg-orange-600 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 hover:bg-orange-700 transition-all shadow-md active:scale-95 self-start sm:self-center">
                    <Plus size={18} />
                    <span>Add New Product</span>
                  </button>
                </div>
                
                <div className="block sm:hidden space-y-3">
                  {foods
                    .filter(product => product.name.toLowerCase().includes(searchFoodQuery.toLowerCase()) || product.category.toLowerCase().includes(searchFoodQuery.toLowerCase()))
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
                          <span className="font-black text-orange-600 text-sm">${product.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button onClick={() => handleOpenModal(product)} className="p-2 text-blue-600 bg-blue-50 rounded-lg active:scale-90"><Edit size={16} /></button>
                        <button disabled={deletingId === product._id} onClick={() => handleDeleteFood(product._id)} className="p-2 text-red-600 bg-red-50 rounded-lg active:scale-90 disabled:opacity-50">
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
                        .filter(product => product.name.toLowerCase().includes(searchFoodQuery.toLowerCase()) || product.category.toLowerCase().includes(searchFoodQuery.toLowerCase()))
                        .map((product) => (
                        <tr key={product._id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-4 flex items-center space-x-3">
                            <div className="w-10 h-10 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-stone-700">{product.name}</span>
                              <span className={`text-[8px] font-black uppercase tracking-widest w-fit px-1.5 py-0.5 rounded ${product.isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 text-stone-600 text-sm font-medium">{product.category}</td>
                          <td className="py-4 font-black text-stone-800">{settings?.currency || '₦'}{product.price.toFixed(2)}</td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button onClick={() => handleOpenModal(product)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"><Edit size={18} /></button>
                              <button disabled={deletingId === product._id} onClick={() => handleDeleteFood(product._id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50">
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
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-100">
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Order / Customer</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Date & Time</th>
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
                          <td className="py-4 text-xs font-bold text-stone-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <select disabled={updatingOrderId === order._id} value={order.status} onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none border-none disabled:opacity-50 ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                {["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                          </td>
                          <td className="py-4 font-black text-stone-800">${order.totalAmount.toFixed(2)}</td>
                          <td className="py-4 text-right">
                            <button onClick={() => setSelectedOrder(order)} className="text-orange-600 font-bold text-sm hover:underline">Details</button>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">User Management</h3>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input type="text" placeholder="Search users..." value={searchUserQuery} onChange={(e) => setSearchUserQuery(e.target.value)} className="w-full bg-stone-50 border border-stone-100 pl-10 pr-4 py-2 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700 text-sm" />
                  </div>
                </div>
                <div className="overflow-x-auto">
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
                      {users.filter(u => u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) || u.email.toLowerCase().includes(searchUserQuery.toLowerCase())).map((u) => (
                        <tr key={u._id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">{u.name.charAt(0).toUpperCase()}</div>
                              <div className="flex flex-col"><span className="font-bold text-stone-700 text-sm">{u.name}</span><span className="text-xs text-stone-400">{u.email}</span></div>
                            </div>
                          </td>
                          <td className="py-4 text-xs font-bold text-stone-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 text-xs font-bold text-stone-500">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                          </td>
                          <td className="py-4 text-right">
                            <select disabled={updatingUserId === u._id} value={u.role} onChange={(e) => handleUpdateUserRole(u._id, e.target.value)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none border-none disabled:opacity-50 ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              <option value="user">User</option><option value="admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-stone-800 mb-6 uppercase tracking-tight">{editingFood ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSaveFood} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Product Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Price ({settings?.currency || '₦'})</label>
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
                <div onClick={() => setFormData({...formData, isAvailable: !formData.isAvailable})} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all h-[50px] ${formData.isAvailable ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isAvailable ? 'left-6' : 'left-1'}`} />
                  </div>
                  <span className={`ml-3 text-sm font-bold uppercase tracking-wider ${formData.isAvailable ? 'text-green-600' : 'text-red-600'}`}>{formData.isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Product Image</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-32 h-32 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl overflow-hidden flex items-center justify-center group">
                    {formData.imageUrl ? <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" /> : <Plus className="text-stone-300 group-hover:text-orange-500 transition-colors" size={32} />}
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <input type="text" placeholder="Or enter image URL" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="flex-1 bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700 text-sm" />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700 h-24 resize-none" />
              </div>
              <div className="flex space-x-4 md:col-span-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-xl font-bold text-stone-500 bg-stone-100 uppercase tracking-widest text-sm">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 px-6 py-4 rounded-xl font-bold text-white bg-orange-600 uppercase tracking-widest text-sm flex items-center justify-center space-x-2">
                  {isSaving && <Loader2 size={18} className="animate-spin" />}
                  <span>{editingFood ? 'Update' : 'Create'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 p-2 text-stone-400"><XCircle size={24} /></button>
            <div className="mb-8">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block mb-1">Order Details • {new Date(selectedOrder.createdAt).toLocaleString()}</span>
              <h3 className="text-2xl font-black text-stone-800 tracking-tight uppercase">Order #{selectedOrder._id.substring(18)}</h3>
            </div>
            <div className="space-y-6">
              <div className="bg-stone-50 rounded-2xl p-4 sm:p-6">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between mb-3 last:mb-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white rounded-lg overflow-hidden"><img src={item.imageUrl} alt="" className="w-full h-full object-cover" /></div>
                      <div><p className="font-bold text-stone-700 text-sm">{item.name}</p><p className="text-[10px] text-stone-400 font-bold uppercase">Qty: {item.quantity}</p></div>
                    </div>
                    <span className="text-stone-700 font-black text-sm">{settings?.currency || '₦'}{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-4 border-t border-stone-200 mt-4 flex justify-between items-center">
                  <span className="font-black text-stone-800 uppercase text-xs">Total</span>
                  <span className="text-xl font-black text-orange-600">{settings?.currency || '₦'}{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100"><p className="text-[10px] font-black text-stone-400 uppercase mb-1">Customer</p><p className="text-sm font-bold text-stone-700">{selectedOrder.userId?.name || 'Guest'}</p></div>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100"><p className="text-[10px] font-black text-stone-400 uppercase mb-1">Phone</p><p className="text-sm font-bold text-stone-700">{selectedOrder.phoneNumber}</p></div>
                <div className="md:col-span-2 bg-stone-50 p-3 rounded-xl border border-stone-100"><p className="text-[10px] font-black text-stone-400 uppercase mb-1">Address</p><p className="text-sm font-medium">{selectedOrder.deliveryAddress}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
