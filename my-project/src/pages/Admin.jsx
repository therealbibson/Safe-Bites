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
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
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
        setIsModalOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save food');
      }
    } catch (error) {
      console.error('Error saving food:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const headers = {
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        };

        const [foodsRes, ordersRes, usersRes, catsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/foods`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories`)
        ]);

        const [foodsData, ordersData, usersData, catsData] = await Promise.all([
          foodsRes.json(),
          ordersRes.json(),
          usersRes.json(),
          catsRes.json()
        ]);

        setFoods(foodsData);
        setOrders(ordersData);
        setUsers(usersData);
        setCategories(catsData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchData();
    }
  }, [isAuthenticated, user]);

  const stats = [
    { 
      label: 'Total Revenue', 
      value: `$${orders.reduce((acc, curr) => acc + curr.totalAmount, 0).toFixed(2)}`, 
      icon: LayoutDashboard, 
      color: 'bg-blue-500' 
    },
    { label: 'Orders', value: orders.length.toString(), icon: ShoppingBag, color: 'bg-orange-500' },
    { label: 'Products', value: foods.length.toString(), icon: Package, color: 'bg-green-500' },
    { label: 'Customers', value: users.length.toString(), icon: Users, color: 'bg-purple-500' },
  ];

  const handleDeleteFood = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
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
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-16">
      <Navbar />
      
      {loading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[150] flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
            <p className="font-bold text-stone-600">Syncing dashboard...</p>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-stone-600 hover:bg-orange-50'}`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'products' ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-stone-600 hover:bg-orange-50'}`}
            >
              <Package size={20} />
              <span>Products</span>
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-stone-600 hover:bg-orange-50'}`}
            >
              <ShoppingBag size={20} />
              <span>Orders</span>
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-stone-600 hover:bg-orange-50'}`}
            >
              <Users size={20} />
              <span>Users</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-stone-600 hover:bg-orange-50'}`}
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                      <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4`}>
                        <stat.icon size={24} />
                      </div>
                      <p className="text-stone-500 font-medium">{stat.label}</p>
                      <h3 className="text-2xl font-black text-stone-800">{stat.value}</h3>
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
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">Product Management</h3>
                  <button 
                    onClick={() => handleOpenModal()}
                    className="bg-orange-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center space-x-2 hover:bg-orange-700 transition-all shadow-md"
                  >
                    <Plus size={18} />
                    <span>Add New</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-100">
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Product</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Category</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Price</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Actions</th>
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
                          <td className="py-4 text-stone-600 text-sm">{product.category}</td>
                          <td className="py-4 font-bold text-stone-800">${product.price.toFixed(2)}</td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleOpenModal(product)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteFood(product._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} />
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
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight mb-6">Order Management</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-100">
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">ID</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Status</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Amount</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-4 font-bold text-stone-700">#{order._id.substring(18)}</td>
                          <td className="py-4">
                            <select 
                              value={order.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                try {
                                  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${order._id}/status`, {
                                    method: 'PATCH',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'x-user-id': user?.id || user?._id,
                                      'x-user-role': user?.role
                                    },
                                    body: JSON.stringify({ status: newStatus })
                                  });
                                  if (response.ok) {
                                    setOrders(orders.map(o => o._id === order._id ? { ...o, status: newStatus } : o));
                                  }
                                } catch (error) {
                                  console.error('Error updating status:', error);
                                }
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-bold outline-none border-none ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                              }`}
                            >
                              {["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-4 font-bold text-stone-800">${order.totalAmount.toFixed(2)}</td>
                          <td className="py-4">
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
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight mb-6">User Management</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-100">
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Name</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Email</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-4 font-bold text-stone-700">{u.name}</td>
                          <td className="py-4 text-stone-600">{u.email}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
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
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Image URL</label>
                <input 
                  type="text" 
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700"
                />
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
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-xl font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 transition-all uppercase tracking-widest text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-4 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 uppercase tracking-widest text-sm"
                >
                  {editingFood ? 'Update Product' : 'Create Product'}
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
