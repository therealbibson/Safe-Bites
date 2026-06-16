import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  LayoutDashboard, Package, Users, ShoppingBag, Settings, Plus, Edit, 
  Trash2, Loader2, XCircle, Search, User, Star, Bell, Menu, X, MoreVertical,
  Filter, ArrowUpDown, MessageSquare, Send, Clock, Shield, CheckCircle, ChevronLeft
} from 'lucide-react';
import ErrorBoundary from '../components/ErrorBoundary';

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const { refreshSettings } = useSettings();
  const { notifications: adminNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersPagination, setOrdersPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReply, setTicketReply] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [recentUsers, setRecentUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [searchFoodQuery, setSearchFoodQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });
  const [settings, setSettings] = useState({
    storeName: 'SafeBite',
    contactEmail: 'support@safebite.com',
    contactPhone: '+234 800 SAFEBITE',
    currency: '₦',
    deliveryFee: 2.0,
    minimumOrderQuantity: 1,
    minimumOrderPrice: 0,
    isOpen: true,
    openingHours: '08:00 AM - 10:00 PM',
    maintenanceMode: false,
    foodSortBy: 'default'
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

  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...users]
    .filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchUserQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (u.status || 'pending') === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      // Handle nulls
      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const sortedFoods = useMemo(() => {
    return [...foods]
      .filter(product => 
        product.name.toLowerCase().includes(searchFoodQuery.toLowerCase()) || 
        product.category.toLowerCase().includes(searchFoodQuery.toLowerCase())
      )
      .sort((a, b) => {
        // Always put out of stock items at the bottom
        if (a.isAvailable !== b.isAvailable) {
          return a.isAvailable ? -1 : 1;
        }

        const sortBy = settings?.foodSortBy || 'default';
        
        switch (sortBy) {
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'category-asc':
            return a.category.localeCompare(b.category);
          case 'category-desc':
            return b.category.localeCompare(a.category);
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'newest':
            return new Date(b.createdAt) - new Date(a.createdAt);
          case 'order-asc':
            return (a.sortOrder || 0) - (b.sortOrder || 0);
          case 'order-desc':
            return (b.sortOrder || 0) - (a.sortOrder || 0);
          case 'default':
          default:
            const orderA = a.sortOrder || 0;
            const orderB = b.sortOrder || 0;
            if (orderA !== orderB) return orderA - orderB;
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
  }, [foods, searchFoodQuery, settings?.foodSortBy]);

  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryFormData({ name: cat.name, description: cat.description || '' });
    } else {
      setEditingCategory(null);
      setCategoryFormData({ name: '', description: '' });
    }
    setIsCategoryOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': user?.id || user?._id,
        'x-user-role': user?.role
      };
      
      const url = editingCategory 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/categories/${editingCategory._id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/categories`;
      
      const method = editingCategory ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(categoryFormData)
      });
      
      if (response.ok) {
        const savedCat = await response.json();
        if (editingCategory) {
          setCategories(categories.map(c => c._id === savedCat._id ? savedCat : c));
        } else {
          setCategories([...categories, savedCat]);
        }
        setIsCategoryOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure? This will not delete products in this category but may affect filtering.')) return;
    try {
      const headers = {
        'x-user-id': user?.id || user?._id,
        'x-user-role': user?.role
      };
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers
      });
      if (response.ok) setCategories(categories.filter(c => c._id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.size === 0) {
      alert('Cannot upload an empty file');
      return;
    }

    if (file.size > MAX_SIZE) {
      alert('File size must be less than 5MB');
      return;
    }

    if (!VALID_TYPES.includes(file.type)) {
      alert('Only JPEG, PNG, and WEBP images are allowed');
      return;
    }

    console.log('[Admin] Starting image upload:', file.name, file.size, file.type);

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    setIsUploading(true);
    try {
      const uId = user?.id || user?._id;
      if (!uId) {
        throw new Error('You must be logged in to upload images.');
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'x-user-id': uId,
          'x-user-role': user?.role || 'admin'
        },
        body: uploadFormData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Admin] Image upload successful:', data.imageUrl);
        setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
        alert('Image uploaded successfully!');
      } else {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[Admin] Image upload failed:', error);
        alert(error.error || error.details || 'Failed to upload image');
      }
    } catch (error) {
      console.error('[Admin] Error uploading image:', error);
      alert(error.message || 'Error uploading image');
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
        const uId = user?.id || user?._id;
        if (!uId) {
          console.warn('[Admin] User ID missing, skipping fetch');
          return;
        }

        const headers = {
          'x-user-id': uId,
          'x-user-role': user?.role || 'admin'
        };

        console.log('[Admin] Fetching initial data with headers:', headers);

        const [statsRes, catsRes, settingsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stats`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/categories`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/settings?t=${Date.now()}`, { headers })
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setAdminStats(statsData.stats);
          
          // Use a consistent source for all order views
          const initialOrders = statsData.recentOrders || [];
          setOrders(initialOrders);
          
          setRecentUsers(statsData.recentUsers || []);
        }

        if (catsRes.ok) {
          const catsData = await catsRes.json();
          setCategories(catsData);
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          console.log('[Admin] Received settings:', settingsData);
          if (settingsData && !settingsData.error) {
            setSettings(settingsData);
          }
        } else {
          console.error('[Admin] Failed to fetch settings:', settingsRes.status);
        }

      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'super-admin')) {
      fetchInitialData();
    } else if (isAuthenticated && (user?.role !== 'admin' && user?.role !== 'super-admin')) {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (activeTab !== 'dashboard' || !isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super-admin')) return;
      
      try {
        const headers = {
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role || 'admin'
        };

        const statsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stats`, { headers });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setAdminStats(statsData.stats);
          setOrders(statsData.recentOrders || []);
          setRecentUsers(statsData.recentUsers || []);
        }
      } catch (error) {
        console.error('Error refreshing dashboard:', error);
      }
    };

    fetchDashboardData();
  }, [activeTab, isAuthenticated, user]);

  useEffect(() => {
    const fetchTabData = async () => {
      if (activeTab === 'dashboard' || activeTab === 'settings' || !isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super-admin')) return;
      
      setTabLoading(true);
      try {
        const headers = {
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role || 'admin'
        };

        let endpoint = '';
        if (activeTab === 'products') endpoint = 'foods';
        if (activeTab === 'orders') endpoint = `orders?page=${ordersPagination.page}&limit=50&adminView=true`;
        if (activeTab === 'users') endpoint = 'users';
        if (activeTab === 'reviews') endpoint = 'reviews';
        if (activeTab === 'support') endpoint = 'support/all';

        if (endpoint) {
          const url = `${import.meta.env.VITE_API_BASE_URL}/api/${endpoint}`;
            
          const res = await fetch(url, { headers });
          const data = await res.json();
          
          if (activeTab === 'products') setFoods(data);
          if (activeTab === 'orders') {
            console.log('[Admin] Orders response:', data);
            const ordersList = data.orders || (Array.isArray(data) ? data : []);
            setOrders(ordersList);
            if (data.pagination) setOrdersPagination(data.pagination);
          }
          if (activeTab === 'users') setUsers(data);
          if (activeTab === 'reviews') setReviews(data);
          if (activeTab === 'support') setTickets(data);
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab} data:`, error);
      } finally {
        setTabLoading(false);
      }
    };

    fetchTabData();
  }, [activeTab, isAuthenticated, user, ordersPagination.page]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesPaymentStatus = paymentStatusFilter === 'all' || order.paymentStatus === paymentStatusFilter;
      const matchesOrderStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
      
      const searchLower = orderSearchQuery.toLowerCase();
      const matchesSearch = 
        (order.userId?.name || '').toLowerCase().includes(searchLower) ||
        (order.userId?.email || '').toLowerCase().includes(searchLower) ||
        order._id.toLowerCase().includes(searchLower) ||
        (order.phoneNumber || '').includes(orderSearchQuery);

      return matchesPaymentStatus && matchesOrderStatus && matchesSearch;
    });
  }, [orders, paymentStatusFilter, orderStatusFilter, orderSearchQuery]);

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
      if (response.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      }
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

  const handleUpdateUserStatus = async (targetUserId, newStatus) => {
    if (targetUserId === (user.id || user._id) && newStatus !== 'active') {
      alert("You cannot suspend yourself.");
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
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setUsers(users.map(u => {
          if (u._id === targetUserId) {
            const updatedUser = { ...u, status: newStatus };
            if (newStatus === 'active') {
              updatedUser.isVerified = true;
            } else if (newStatus === 'pending') {
              updatedUser.isVerified = false;
            }
            return updatedUser;
          }
          return u;
        }));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Ensure numeric fields are numbers
      const payload = {
        ...settings,
        deliveryFee: parseFloat(settings.deliveryFee) || 0,
        minimumOrderQuantity: parseInt(settings.minimumOrderQuantity) || 1,
        minimumOrderPrice: parseFloat(settings.minimumOrderPrice) || 0
      };

      console.log('Saving settings:', payload);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        console.log('Settings updated successfully:', updatedSettings);
        setSettings(updatedSettings);
        if (refreshSettings) refreshSettings(); // Sync global settings context
        alert('Settings updated successfully!');
      } else {
        const error = await response.json();
        console.error('Failed to update settings:', error);
        alert(error.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('An error occurred while saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGlobalSortChange = async (newSort) => {
    try {
      const payload = { ...settings, foodSortBy: newSort };
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        if (refreshSettings) refreshSettings();
      }
    } catch (error) {
      console.error('Error updating global sort:', error);
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
      setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, adminHasUnread: false } : t));
    } catch (error) {
      console.error('Error marking ticket as read:', error);
    }
  };

  useEffect(() => {
    if (selectedTicket && selectedTicket.adminHasUnread) {
      markTicketAsRead(selectedTicket._id);
    }
  }, [selectedTicket]);

  const handleAdminReply = async (e) => {
    e.preventDefault();
    if (!ticketReply.trim()) return;
    setIsReplying(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/support/${selectedTicket._id}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        },
        body: JSON.stringify({ message: ticketReply, status: selectedTicket.status })
      });

      if (response.ok) {
        const updatedTicket = await response.json();
        setSelectedTicket(updatedTicket);
        setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t));
        setTicketReply('');
      }
    } catch (error) {
      console.error('Error replying to ticket:', error);
    } finally {
      setIsReplying(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/support/${ticketId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || user?._id,
          'x-user-role': user?.role
        },
        body: JSON.stringify({ message: `Status updated to ${newStatus}`, status: newStatus })
      });

      if (response.ok) {
        const updatedTicket = await response.json();
        if (selectedTicket?._id === ticketId) setSelectedTicket(updatedTicket);
        setTickets(tickets.map(t => t._id === ticketId ? updatedTicket : t));
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  if (isAuthenticated && ((user?.role !== 'admin' && user?.role !== 'super-admin') && user?.role !== 'super-admin')) {
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
    <ErrorBoundary>
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
        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-6 right-6 z-50 bg-orange-600/20 backdrop-blur-lg text-orange-600 p-4 rounded-2xl shadow-xl border border-orange-600/20 active:scale-95 transition-all"
        >
          {sidebarOpen ? <X size={24} /> : <MoreVertical size={24} />}
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Overlay for Mobile */}
          {sidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside className={`
            fixed lg:sticky top-0 lg:top-24 left-0 h-full lg:h-[calc(100vh-6rem)] w-64 lg:w-64 
            bg-white lg:bg-transparent z-40 lg:z-20 p-6 lg:p-0 border-r lg:border-none
            transition-transform duration-300 ease-in-out overflow-y-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            flex flex-col gap-2
          `}>
            <div className="lg:hidden mb-8">
              <h2 className="text-2xl font-black text-orange-600 tracking-tighter">SAFEBITE</h2>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Admin Control Panel</p>
            </div>

            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'products', icon: Package, label: 'Products' },
              { id: 'categories', icon: Menu, label: 'Categories' },
              { id: 'orders', icon: ShoppingBag, label: 'Orders' },
              { id: 'reviews', icon: Star, label: 'Reviews' },
              { id: 'users', icon: Users, label: 'Users' },
              { 
                id: 'support', 
                icon: MessageSquare, 
                label: 'Support',
                hasBadge: tickets.some(t => t.adminHasUnread)
              },
              { 
                id: 'notifications', 
                icon: Bell, 
                label: 'Notifications',
                hasBadge: adminNotifications.some(n => !n.isRead && n.type === 'admin_alert')
              },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all text-base ${
                  activeTab === tab.id 
                    ? 'bg-orange-600 text-white shadow-lg' 
                    : 'bg-white lg:bg-transparent text-stone-600 hover:bg-orange-50 border border-stone-100 lg:border-stone-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                </div>
                {tab.hasBadge && (
                  <div className={`w-2 h-2 rounded-full ${activeTab === tab.id ? 'bg-white' : 'bg-orange-600'} animate-pulse`} />
                )}
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
                {/* Dashboard Search */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Quick search customers by name or email..." 
                      className="w-full bg-stone-50 border border-stone-100 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setSearchUserQuery(e.target.value);
                          setActiveTab('users');
                        }
                      }}
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Quick search customers by name or email..."]');
                      setSearchUserQuery(input.value);
                      setActiveTab('users');
                    }}
                    className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-orange-700 transition-all shadow-md active:scale-95 w-full sm:w-auto"
                  >
                    Search Users
                  </button>
                </div>

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
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                  {/* Recent Orders */}
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
                          {orders.slice(0, 10).map((order) => (
                            <tr key={order._id} className="hover:bg-stone-50 transition-colors">
                              <td className="py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold text-xs overflow-hidden">
                                    {order.userId?.avatar ? (
                                      <img src={order.userId.avatar.startsWith('http') || order.userId.avatar.startsWith('data:') ? order.userId.avatar : `${import.meta.env.VITE_API_BASE_URL}${order.userId.avatar}`} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <User size={14} />
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-stone-700 text-sm">{order.userId?.name || 'Guest User'}</span>
                                    <span className="text-[10px] text-stone-400 font-bold uppercase">#{order._id.substring(18)}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                                  order.status === 'failed' ? 'bg-red-100 text-red-700' : 
                                  'bg-orange-100 text-orange-700'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-4 font-black text-stone-800 text-sm">{settings?.currency || '₦'}{order.totalAmount.toFixed(2)}</td>
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

                  {/* Recent Users */}
                  <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">Recent Users</h3>
                      <button onClick={() => setActiveTab('users')} className="text-orange-600 font-bold text-sm hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-stone-100">
                            <th className="pb-4 font-bold text-stone-400 uppercase text-xs">User</th>
                            <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Status</th>
                            <th className="pb-4 font-bold text-stone-400 uppercase text-xs text-right">Joined</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                          {recentUsers.map((u) => (
                            <tr key={u._id} className="hover:bg-stone-50 transition-colors">
                              <td className="py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs overflow-hidden">
                                    {u.avatar ? (
                                      <img src={u.avatar.startsWith('http') || u.avatar.startsWith('data:') ? u.avatar : `${import.meta.env.VITE_API_BASE_URL}${u.avatar}`} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      u.name.charAt(0).toUpperCase()
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-stone-700 text-sm">{u.name}</span>
                                    <span className="text-[10px] text-stone-400 font-bold">{u.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  u.status === 'suspended' ? 'bg-red-100 text-red-700' : 
                                  u.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {u.status || 'pending'}
                                </span>
                              </td>
                              <td className="py-4 text-right text-xs font-bold text-stone-500">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                          {recentUsers.length === 0 && (
                            <tr>
                              <td colSpan="3" className="py-8 text-center text-stone-400 font-bold">No recent users</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
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
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Min. Order Quantity (Items)</label>
                    <input type="number" value={settings.minimumOrderQuantity} onChange={(e) => setSettings({...settings, minimumOrderQuantity: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Min. Order Price ({settings.currency})</label>
                    <input type="number" step="0.01" value={settings.minimumOrderPrice} onChange={(e) => setSettings({...settings, minimumOrderPrice: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Opening Hours</label>
                    <input type="text" value={settings.openingHours} onChange={(e) => setSettings({...settings, openingHours: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Food Display Sorting (Home)</label>
                    <select value={settings.foodSortBy || 'default'} onChange={(e) => setSettings({...settings, foodSortBy: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700">
                      <option value="default">Default (Manual Sort Order)</option>
                      <option value="name-asc">Alphabetical (A-Z)</option>
                      <option value="name-desc">Alphabetical (Z-A)</option>
                      <option value="category-asc">By Category (A-Z)</option>
                      <option value="category-desc">By Category (Z-A)</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest First</option>
                      <option value="order-asc">Sort Order (0-9)</option>
                      <option value="order-desc">Sort Order (9-0)</option>
                    </select>
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
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                        <input 
                          type="text"
                          placeholder="Search products..."
                          value={searchFoodQuery}
                          onChange={(e) => setSearchFoodQuery(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-100 pl-10 pr-4 py-2 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700 text-sm"
                        />
                      </div>
                      
                      {/* Global Sort Selector - Visible on both Mobile and Desktop */}
                      <div className="relative group">
                        <div className="flex items-center bg-stone-50 border border-stone-100 rounded-xl px-3 py-2 hover:border-orange-500 transition-all cursor-pointer">
                          <ArrowUpDown size={16} className="text-stone-400 mr-2" />
                          <select 
                            value={settings.foodSortBy || 'default'}
                            onChange={(e) => handleGlobalSortChange(e.target.value)}
                            className="appearance-none bg-transparent outline-none font-bold text-stone-700 text-xs pr-4 cursor-pointer"
                          >
                            <option value="default">Default Sort</option>
                            <option value="name-asc">Name A-Z</option>
                            <option value="name-desc">Name Z-A</option>
                            <option value="category-asc">Category A-Z</option>
                            <option value="category-desc">Category Z-A</option>
                            <option value="price-low">Price Low-High</option>
                            <option value="price-high">Price High-Low</option>
                            <option value="newest">Newest First</option>
                            <option value="order-asc">Sort Order Asc</option>
                            <option value="order-desc">Sort Order Desc</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleOpenModal()} className="bg-orange-600 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 hover:bg-orange-700 transition-all shadow-md active:scale-95 self-start sm:self-center">
                    <Plus size={18} />
                    <span>Add New Product</span>
                  </button>
                </div>
                
                <div className="block sm:hidden space-y-3">
                  {sortedFoods.map((product) => (
                    <div key={product._id} className="border border-stone-100 rounded-xl p-3 flex items-center space-x-3 bg-stone-50/50">
                      <div className="w-14 h-14 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={product.imageUrl?.startsWith('http') || product.imageUrl?.startsWith('data:') ? product.imageUrl : `${import.meta.env.VITE_API_BASE_URL}${product.imageUrl}`} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-stone-800 truncate text-sm">{product.name}</h4>
                          {!product.isAvailable && <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black uppercase">Out</span>}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-bold uppercase">{product.category}</span>
                          <span className="font-black text-orange-600 text-sm">{settings?.currency || '₦'}{product.price.toFixed(2)}</span>
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
                        <th 
                          className="pb-4 font-bold text-stone-400 uppercase text-xs cursor-pointer hover:text-orange-600 transition-colors"
                          onClick={() => handleGlobalSortChange(settings.foodSortBy === 'name-asc' ? 'name-desc' : 'name-asc')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Product</span>
                            <ArrowUpDown size={12} className={settings.foodSortBy?.startsWith('name') ? 'text-orange-500' : ''} />
                          </div>
                        </th>
                        <th 
                          className="pb-4 font-bold text-stone-400 uppercase text-xs cursor-pointer hover:text-orange-600 transition-colors"
                          onClick={() => handleGlobalSortChange(settings.foodSortBy === 'category-asc' ? 'category-desc' : 'category-asc')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Category</span>
                            <ArrowUpDown size={12} className={settings.foodSortBy?.startsWith('category') ? 'text-orange-500' : ''} />
                          </div>
                        </th>
                        <th 
                          className="pb-4 font-bold text-stone-400 uppercase text-xs cursor-pointer hover:text-orange-600 transition-colors"
                          onClick={() => handleGlobalSortChange(settings.foodSortBy === 'order-asc' ? 'order-desc' : 'order-asc')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Order</span>
                            <ArrowUpDown size={12} className={settings.foodSortBy?.startsWith('order') ? 'text-orange-500' : ''} />
                          </div>
                        </th>
                        <th 
                          className="pb-4 font-bold text-stone-400 uppercase text-xs cursor-pointer hover:text-orange-600 transition-colors"
                          onClick={() => handleGlobalSortChange(settings.foodSortBy === 'price-low' ? 'price-high' : 'price-low')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Price</span>
                            <ArrowUpDown size={12} className={settings.foodSortBy?.startsWith('price') ? 'text-orange-500' : ''} />
                          </div>
                        </th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {sortedFoods.map((product) => (
                        <tr key={product._id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-4 flex items-center space-x-3">
                            <div className="w-10 h-10 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={product.imageUrl?.startsWith('http') || product.imageUrl?.startsWith('data:') ? product.imageUrl : `${import.meta.env.VITE_API_BASE_URL}${product.imageUrl}`} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-stone-700">{product.name}</span>
                              <span className={`text-[8px] font-black uppercase tracking-widest w-fit px-1.5 py-0.5 rounded ${product.isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 text-stone-600 text-sm font-medium">{product.category}</td>
                          <td className="py-4 text-stone-600 text-sm font-black">{product.sortOrder || 0}</td>
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

            {activeTab === 'categories' && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">Category Management</h3>
                  <button onClick={() => handleOpenCategoryModal()} className="bg-orange-600 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 hover:bg-orange-700 transition-all shadow-md active:scale-95 self-start sm:self-center">
                    <Plus size={18} />
                    <span>Add New Category</span>
                  </button>
                </div>
                <div className="block sm:hidden space-y-3">
                  {categories.map((cat) => (
                    <div key={cat._id} className="border border-stone-100 rounded-xl p-4 bg-stone-50/50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-stone-800 text-base">{cat.name}</h4>
                        <div className="flex items-center space-x-1">
                          <button onClick={() => handleOpenCategoryModal(cat)} className="p-2 text-blue-600 bg-blue-50 rounded-lg active:scale-90"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteCategory(cat._id)} className="p-2 text-red-600 bg-red-50 rounded-lg active:scale-90"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <p className="text-stone-500 text-xs leading-relaxed">{cat.description || 'No description provided'}</p>
                    </div>
                  ))}
                </div>

                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-100">
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Category Name</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Description</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {categories.map((cat) => (
                        <tr key={cat._id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-4 font-bold text-stone-700">{cat.name}</td>
                          <td className="py-4 text-stone-500 text-sm">{cat.description || 'No description'}</td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button onClick={() => handleOpenCategoryModal(cat)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"><Edit size={18} /></button>
                              <button onClick={() => handleDeleteCategory(cat._id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={18} /></button>
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
                <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-6 gap-4">
                  <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">Order Management</h3>
                  
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    {/* Order Search */}
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input 
                        type="text"
                        placeholder="Search by name, email or ID..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-100 pl-10 pr-4 py-2 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700 text-xs"
                      />
                    </div>

                    {/* Order Status Filter */}
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                      <Filter size={14} className="text-stone-400" />
                      <select 
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        className="appearance-none bg-stone-50 border border-stone-100 px-3 py-2 rounded-xl outline-none font-bold text-stone-700 text-[10px] flex-1 md:flex-none"
                      >
                        <option value="all">All Order Status</option>
                        {["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled", "failed"].map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="block sm:hidden space-y-3">
                  {filteredOrders.map((order) => (
                    <div key={order._id} className="border border-stone-100 rounded-xl p-4 bg-stone-50/50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                          <span className="font-black text-stone-800 text-sm">{order.userId?.name || 'Guest User'}</span>
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">#{order._id.substring(18)}</span>
                        </div>
                        <button onClick={() => setSelectedOrder(order)} className="text-orange-600 font-bold text-xs uppercase tracking-widest hover:underline">Details</button>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-stone-400 font-bold uppercase">Date</span>
                          <span className="text-xs font-medium text-stone-600">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-stone-400 font-bold uppercase">Payment</span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 
                            order.paymentStatus === 'cancelled' || order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' : 
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-stone-400 font-bold uppercase">Total</span>
                          <span className="text-sm font-black text-stone-800">{settings?.currency || '₦'}{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select 
                          disabled={updatingOrderId === order._id} 
                          value={order.status} 
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)} 
                          className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider outline-none border-none disabled:opacity-50 ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                            order.status === 'failed' ? 'bg-red-100 text-red-700' : 
                            'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled", "failed"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-100">
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Order / Customer</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Date & Time</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Payment</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Status</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Amount</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {filteredOrders.map((order) => (
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
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 
                              order.paymentStatus === 'cancelled' || order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' : 
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {order.paymentStatus || 'pending'}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <select disabled={updatingOrderId === order._id} value={order.status} onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none border-none disabled:opacity-50 ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' || order.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                {["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled", "failed"].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                          </td>
                          <td className="py-4 font-black text-stone-800">{settings?.currency || '₦'}{order.totalAmount.toFixed(2)}</td>
                          <td className="py-4 text-right">
                            <button onClick={() => setSelectedOrder(order)} className="text-orange-600 font-bold text-sm hover:underline">Details</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {ordersPagination.pages > 1 && (
                  <div className="mt-8 flex items-center justify-between border-t border-stone-100 pt-6">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                      Page {ordersPagination.page} of {ordersPagination.pages} ({ordersPagination.total} Total)
                    </p>
                    <div className="flex items-center space-x-2">
                      <button 
                        disabled={ordersPagination.page === 1}
                        onClick={() => setOrdersPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        className="px-4 py-2 bg-stone-50 border border-stone-100 rounded-lg font-bold text-stone-600 text-xs disabled:opacity-30 hover:bg-orange-50 hover:text-orange-600 transition-all"
                      >
                        Previous
                      </button>
                      <button 
                        disabled={ordersPagination.page === ordersPagination.pages}
                        onClick={() => setOrdersPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        className="px-4 py-2 bg-stone-50 border border-stone-100 rounded-lg font-bold text-stone-600 text-xs disabled:opacity-30 hover:bg-orange-50 hover:text-orange-600 transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">User Management</h3>
                  <div className="flex items-center gap-3">
                    {/* Sort Icon */}
                    <div className="relative group">
                      <div className="flex items-center bg-stone-50 border border-stone-100 rounded-xl px-3 py-2 hover:border-orange-500 transition-all cursor-pointer">
                        <ArrowUpDown size={16} className="text-stone-400 mr-2" />
                        <select 
                          value={`${sortConfig.key}-${sortConfig.direction}`}
                          onChange={(e) => {
                            const [key, direction] = e.target.value.split('-');
                            setSortConfig({ key, direction });
                          }}
                          className="appearance-none bg-transparent outline-none font-bold text-stone-700 text-xs pr-4 cursor-pointer"
                        >
                          <option value="createdAt-desc">Newest</option>
                          <option value="createdAt-asc">Oldest</option>
                          <option value="name-asc">Name A-Z</option>
                          <option value="name-desc">Name Z-A</option>
                        </select>
                      </div>
                    </div>

                    {/* Filter Icon */}
                    <div className="relative group">
                      <div className="flex items-center bg-stone-50 border border-stone-100 rounded-xl px-3 py-2 hover:border-orange-500 transition-all cursor-pointer">
                        <Filter size={16} className="text-stone-400 mr-2" />
                        <select 
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="appearance-none bg-transparent outline-none font-bold text-stone-700 text-xs pr-4 cursor-pointer"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active Only</option>
                          <option value="pending">Pending Only</option>
                          <option value="suspended">Suspended Only</option>
                        </select>
                      </div>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input type="text" placeholder="Search users..." value={searchUserQuery} onChange={(e) => setSearchUserQuery(e.target.value)} className="w-full bg-stone-50 border border-stone-100 pl-10 pr-4 py-2 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700 text-sm" />
                    </div>
                  </div>
                </div>
                <div className="block sm:hidden space-y-3">
                  {sortedUsers.map((u) => (
                    <div key={u._id} className="border border-stone-100 rounded-xl p-4 bg-stone-50/50">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm overflow-hidden">
                          {u.avatar ? (
                            <img src={u.avatar.startsWith('http') || u.avatar.startsWith('data:') ? u.avatar : `${import.meta.env.VITE_API_BASE_URL}${u.avatar}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            u.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-stone-700 text-sm truncate">{u.name}</span>
                          <span className="text-xs text-stone-400 truncate">{u.email}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-stone-400 font-bold uppercase">Status</span>
                          <select 
                            disabled={updatingUserId === u._id} 
                            value={u.status || 'pending'} 
                            onChange={(e) => handleUpdateUserStatus(u._id, e.target.value)} 
                            className={`mt-1 px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider outline-none border-none disabled:opacity-50 ${
                              u.status === 'suspended' ? 'bg-red-100 text-red-700' : 
                              u.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                              'bg-green-100 text-green-700'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-stone-400 font-bold uppercase">Role</span>
                          <select 
                            disabled={updatingUserId === u._id || user?.role !== 'super-admin'} 
                            value={u.role} 
                            onChange={(e) => handleUpdateUserRole(u._id, e.target.value)} 
                            className={`mt-1 px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider outline-none border-none disabled:opacity-50 ${
                              u.role === 'super-admin' ? 'bg-orange-100 text-orange-700' :
                              u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            {user?.role === 'super-admin' && <option value="super-admin">Super Admin</option>}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                        {u.isVerified && <span className="text-[8px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Verified</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-100">
                        <th 
                          className="pb-4 font-bold text-stone-400 uppercase text-xs cursor-pointer hover:text-orange-600 transition-colors"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>User</span>
                            {sortConfig.key === 'name' && (
                              <span className="text-[10px]">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="pb-4 font-bold text-stone-400 uppercase text-xs cursor-pointer hover:text-orange-600 transition-colors"
                          onClick={() => handleSort('createdAt')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Joined</span>
                            {sortConfig.key === 'createdAt' && (
                              <span className="text-[10px]">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                            )}
                          </div>
                        </th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Last Login</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Verified</th>
                        <th 
                          className="pb-4 font-bold text-stone-400 uppercase text-xs cursor-pointer hover:text-orange-600 transition-colors"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Status</span>
                            {sortConfig.key === 'status' && (
                              <span className="text-[10px]">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                            )}
                          </div>
                        </th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs text-right">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {sortedUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs overflow-hidden">
                                {u.avatar ? (
                                  <img 
                                    src={u.avatar.startsWith('http') || u.avatar.startsWith('data:') ? u.avatar : `${import.meta.env.VITE_API_BASE_URL}${u.avatar}`} 
                                    alt="" 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  u.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="flex flex-col"><span className="font-bold text-stone-700 text-sm">{u.name}</span><span className="text-xs text-stone-400">{u.email}</span></div>
                            </div>
                          </td>
                          <td className="py-4 text-xs font-bold text-stone-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 text-xs font-bold text-stone-500">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                          </td>
                          <td className="py-4">
                            {u.status === 'suspended' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 border border-red-200">
                                Suspended
                              </span>
                            ) : (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${u.isVerified ? 'bg-blue-50 text-blue-600' : 'bg-stone-100 text-stone-400'}`}>
                                {u.isVerified ? 'Verified' : 'Unverified'}
                              </span>
                            )}
                          </td>
                          <td className="py-4">
                            <select 
                              disabled={updatingUserId === u._id} 
                              value={u.status || 'pending'} 
                              onChange={(e) => handleUpdateUserStatus(u._id, e.target.value)} 
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none border-none disabled:opacity-50 ${
                                u.status === 'suspended' ? 'bg-red-100 text-red-700' : 
                                u.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                'bg-green-100 text-green-700'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="active">Active</option>
                              <option value="suspended">Suspended</option>
                            </select>
                          </td>
                          <td className="py-4 text-right">
                            <select 
                              disabled={updatingUserId === u._id || user?.role !== 'super-admin'} 
                              value={u.role} 
                              onChange={(e) => handleUpdateUserRole(u._id, e.target.value)} 
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none border-none disabled:opacity-50 ${
                                u.role === 'super-admin' ? 'bg-orange-100 text-orange-700' :
                                u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                              {user?.role === 'super-admin' && <option value="super-admin">Super Admin</option>}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 sm:p-6">
                <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight mb-6">User Reviews</h3>
                <div className="block sm:hidden space-y-3">
                  {Array.isArray(reviews) && reviews.map((review) => (
                    <div key={review._id} className="border border-stone-100 rounded-xl p-4 bg-stone-50/50">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold text-xs overflow-hidden">
                          {review.userId?.avatar ? (
                            <img src={review.userId.avatar.startsWith('http') || review.userId.avatar.startsWith('data:') ? review.userId.avatar : `${import.meta.env.VITE_API_BASE_URL}${review.userId.avatar}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={16} />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-stone-700 text-sm truncate">{review.userId?.name || 'Unknown User'}</span>
                          <div className="flex items-center space-x-1 mt-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star 
                                key={s} 
                                size={10} 
                                fill={s <= review.rating ? '#EA580C' : 'transparent'} 
                                className={s <= review.rating ? 'text-orange-600' : 'text-stone-200'}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-stone-600 italic bg-white p-3 rounded-lg border border-stone-50 mb-3 line-clamp-3">
                        {review.comment || 'No comment provided'}
                      </p>
                      <div className="flex justify-between items-center text-[10px] font-bold text-stone-400 uppercase tracking-tight">
                        <span>Order: #{review.orderId?._id?.substring(18) || 'N/A'}</span>
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-100">
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Customer</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Order ID</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Rating</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs">Comment</th>
                        <th className="pb-4 font-bold text-stone-400 uppercase text-xs text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {Array.isArray(reviews) && reviews.map((review) => (
                        <tr key={review._id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold text-xs overflow-hidden">
                                {review.userId?.avatar ? (
                                  <img src={review.userId.avatar.startsWith('http') || review.userId.avatar.startsWith('data:') ? review.userId.avatar : `${import.meta.env.VITE_API_BASE_URL}${review.userId.avatar}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <User size={14} />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-stone-700 text-sm">{review.userId?.name || 'Unknown User'}</span>
                                <span className="text-[10px] text-stone-400">{review.userId?.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-xs font-bold text-stone-500">
                            #{review.orderId?._id?.substring(18) || 'N/A'}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star 
                                  key={s} 
                                  size={12} 
                                  fill={s <= review.rating ? '#EA580C' : 'transparent'} 
                                  className={s <= review.rating ? 'text-orange-600' : 'text-stone-200'}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="py-4">
                            <p className="text-sm text-stone-600 max-w-xs truncate" title={review.comment}>
                              {review.comment || <span className="text-stone-300 italic">No comment</span>}
                            </p>
                          </td>
                          <td className="py-4 text-right text-xs font-bold text-stone-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {reviews.length === 0 && (
                        <tr>
                          <td colSpan="5" className="py-10 text-center text-stone-400 font-bold">No reviews found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 sm:p-6 h-[700px] flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">Support Management</h3>
                  <div className="flex items-center space-x-2">
                    <Filter size={16} className="text-stone-400" />
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none bg-stone-50 border border-stone-100 px-4 py-2 rounded-xl outline-none font-bold text-stone-700 text-xs"
                    >
                      <option value="all">All Tickets</option>
                      <option value="open">Open</option>
                      <option value="in-progress">In-Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 flex gap-6 overflow-hidden relative">
                  {/* Ticket List */}
                  <div className={`w-full md:w-1/3 border-r border-stone-100 md:pr-4 overflow-y-auto space-y-3 ${selectedTicket ? 'hidden md:block' : 'block'}`}>
                    {tickets
                      .filter(t => statusFilter === 'all' || t.status === statusFilter)
                      .map((ticket) => (
                      <div 
                        key={ticket._id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                          selectedTicket?._id === ticket._id 
                            ? 'bg-orange-600 border-orange-600 text-white shadow-md' 
                            : 'bg-white border-stone-50 hover:border-orange-200'
                        }`}
                      >
                        {ticket.adminHasUnread && selectedTicket?._id !== ticket._id && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                        )}
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            selectedTicket?._id === ticket._id ? 'bg-white/20 text-white' : 
                            ticket.status === 'open' ? 'bg-blue-100 text-blue-600' :
                            ticket.status === 'resolved' ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-500'
                          }`}>
                            {ticket.status}
                          </span>
                          <span className={`text-[8px] font-bold ${selectedTicket?._id === ticket._id ? 'text-white/60' : 'text-stone-400'}`}>
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm truncate">{ticket.subject}</h4>
                        <p className={`text-[10px] font-bold truncate ${selectedTicket?._id === ticket._id ? 'text-white/70' : 'text-stone-400'}`}>
                          {ticket.userId?.name || 'Unknown User'}
                        </p>
                      </div>
                    ))}
                    {tickets.length === 0 && (
                      <div className="py-10 text-center opacity-30">
                        <MessageSquare size={32} className="mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase">No tickets found</p>
                      </div>
                    )}
                  </div>

                  {/* Conversation View */}
                  <div className={`${selectedTicket ? 'flex' : 'hidden'} md:flex flex-1 flex-col overflow-hidden bg-white md:bg-transparent absolute md:relative inset-0 z-10 md:z-0`}>
                    {selectedTicket ? (
                      <>
                        {/* Selected Ticket Header */}
                        <div className="pb-4 border-b border-stone-50 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button 
                              onClick={() => setSelectedTicket(null)}
                              className="md:hidden p-2 text-stone-400 hover:text-orange-600"
                            >
                              <ChevronLeft size={24} />
                            </button>
                            <div>
                              <h4 className="font-black text-stone-800 uppercase tracking-tight text-sm sm:text-base truncate max-w-[150px] sm:max-w-xs">{selectedTicket.subject}</h4>
                              <p className="text-[10px] text-stone-400 font-bold uppercase truncate max-w-[150px] sm:max-w-xs">{selectedTicket.userId?.name}</p>
                            </div>
                          </div>
                          <select 
                            value={selectedTicket.status}
                            onChange={(e) => handleUpdateTicketStatus(selectedTicket._id, e.target.value)}
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest outline-none border ${
                              selectedTicket.status === 'open' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                              selectedTicket.status === 'resolved' ? 'bg-green-50 border-green-100 text-green-600' :
                              'bg-stone-50 border-stone-100 text-stone-500'
                            }`}
                          >
                            <option value="open">Open</option>
                            <option value="in-progress">In-Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto py-6 space-y-4">
                          {/* Initial Message */}
                          <div className="flex flex-col items-start max-w-[80%]">
                            <div className="bg-orange-50 p-4 rounded-2xl rounded-tl-none border border-orange-100">
                              <p className="text-sm text-stone-700">{selectedTicket.message}</p>
                            </div>
                            <span className="text-[9px] font-bold text-stone-400 uppercase mt-1 px-1">Customer • {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                          </div>

                          {/* Replies */}
                          {selectedTicket.responses.map((res, i) => {
                            const isAdmin = res.senderId?.role === 'admin' || res.senderId === user.id || res.senderId === user._id || (res.senderId && res.senderId._id === (user.id || user._id));
                            return (
                              <div key={i} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} w-full`}>
                                <div className={`p-4 rounded-2xl max-w-[80%] border ${
                                  isAdmin 
                                    ? 'bg-stone-800 text-white border-stone-800 rounded-tr-none' 
                                    : 'bg-orange-50 text-stone-700 border-orange-100 rounded-tl-none'
                                }`}>
                                  <p className="text-sm">{res.message}</p>
                                </div>
                                <div className={`flex items-center space-x-1 mt-1 px-1 ${isAdmin ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                  <span className="text-[9px] font-bold text-stone-400 uppercase flex items-center gap-1">
                                    {isAdmin ? 'You (Support)' : 'Customer'} • {new Date(res.createdAt).toLocaleString()}
                                    {isAdmin && <CheckCircle size={10} className="text-green-500" />}
                                    {isAdmin && <span className="text-green-500 lowercase font-black">Sent</span>}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Admin Input Area */}
                        <form onSubmit={handleAdminReply} className="pt-4 border-t border-stone-50">
                          <div className="relative">
                            <textarea 
                              placeholder="Type your response to the customer..."
                              value={ticketReply}
                              onChange={(e) => setTicketReply(e.target.value)}
                              className="w-full bg-stone-50 border border-stone-100 px-4 py-3 pr-12 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700 text-sm h-20 resize-none"
                            />
                            <button 
                              type="submit"
                              disabled={isReplying || !ticketReply.trim()}
                              className="absolute right-3 bottom-3 p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-all active:scale-95"
                            >
                              {isReplying ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                          </div>
                        </form>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                        <MessageSquare size={64} className="mb-4" />
                        <p className="font-black uppercase tracking-widest text-xs">Select a ticket to manage the conversation</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">Admin Notifications</h3>
                  <button 
                    onClick={markAllAsRead}
                    className="text-orange-600 font-bold text-sm hover:underline"
                  >
                    Mark All as Read
                  </button>
                </div>
                <div className="space-y-4">
                  {adminNotifications.filter(n => n.type === 'admin_alert').length === 0 ? (
                    <div className="py-20 text-center">
                      <Bell className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                      <p className="text-stone-400 font-bold">No admin alerts yet</p>
                    </div>
                  ) : (
                    adminNotifications
                      .filter(n => n.type === 'admin_alert')
                      .map((n) => (
                      <div 
                        key={n._id}
                        className={`p-4 rounded-xl border transition-all ${
                          !n.isRead 
                            ? 'bg-orange-50 border-orange-100 shadow-sm' 
                            : 'bg-white border-stone-100'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${!n.isRead ? 'bg-orange-600' : 'bg-transparent'}`} />
                            <h4 className="font-bold text-stone-800">{n.title}</h4>
                          </div>
                          <span className="text-[10px] font-bold text-stone-400 uppercase">
                            {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-stone-600 mb-3">{n.message}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {n.orderId && (
                              <button 
                                onClick={() => {
                                  const targetOrder = orders.find(o => o._id === n.orderId);
                                  if (targetOrder) {
                                    setSelectedOrder(targetOrder);
                                  } else {
                                    // If not in recent orders, we might need to fetch it
                                    setActiveTab('orders');
                                  }
                                }}
                                className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-orange-100 hover:bg-orange-600 hover:text-white transition-all"
                              >
                                View Order
                              </button>
                            )}
                          </div>
                          {!n.isRead && (
                            <button 
                              onClick={() => markAsRead(n._id)}
                              className="text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-stone-800"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
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
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="text-orange-500 animate-spin" size={32} />
                        <span className="text-[10px] font-bold text-stone-400 mt-2">Uploading...</span>
                      </div>
                    ) : formData.imageUrl ? (
                      <img src={formData.imageUrl?.startsWith('http') || formData.imageUrl?.startsWith('data:') ? formData.imageUrl : `${import.meta.env.VITE_API_BASE_URL}${formData.imageUrl}`} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Plus className="text-stone-300 group-hover:text-orange-500 transition-colors" size={32} />
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input type="text" placeholder="Or enter image URL" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700 text-sm" />
                    <p className="text-[10px] text-stone-400 font-bold uppercase px-1">Max 5MB. Format: JPG, PNG, WEBP</p>
                  </div>
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
                      <div className="w-10 h-10 bg-white rounded-lg overflow-hidden"><img src={item.imageUrl?.startsWith('http') || item.imageUrl?.startsWith('data:') ? item.imageUrl : `${import.meta.env.VITE_API_BASE_URL}${item.imageUrl}`} alt="" className="w-full h-full object-cover" /></div>
                      <div><p className="font-bold text-stone-700 text-sm">{item.name}</p><p className="text-[10px] text-stone-400 font-bold uppercase">Qty: {item.quantity}</p></div>
                    </div>
                    <span className="text-stone-700 font-black text-sm">{settings?.currency || '₦'}{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-4 border-t border-stone-200 mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-bold uppercase text-[10px]">Subtotal</span>
                    <span className="text-stone-700 font-black text-sm">{settings?.currency || '₦'}{(selectedOrder.totalAmount - (selectedOrder.deliveryFee || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-bold uppercase text-[10px]">Delivery Fee</span>
                    <span className="text-stone-700 font-black text-sm">{settings?.currency || '₦'}{(selectedOrder.deliveryFee || 0).toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-stone-100 flex justify-between items-center">
                    <span className="font-black text-stone-800 uppercase text-xs">Total</span>
                    <span className="text-xl font-black text-orange-600">{settings?.currency || '₦'}{selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
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

      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-stone-800 mb-6 uppercase tracking-tight">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
            <form onSubmit={handleSaveCategory} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Category Name</label>
                <input type="text" value={categoryFormData.name} onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Description (Optional)</label>
                <textarea value={categoryFormData.description} onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})} className="w-full bg-stone-50 border border-stone-100 px-4 py-3 rounded-xl outline-none focus:border-orange-500 font-bold text-stone-700 h-24 resize-none" />
              </div>
              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setIsCategoryOpen(false)} className="flex-1 px-6 py-4 rounded-xl font-bold text-stone-500 bg-stone-100 uppercase tracking-widest text-sm">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 px-6 py-4 rounded-xl font-bold text-white bg-orange-600 uppercase tracking-widest text-sm flex items-center justify-center space-x-2">
                  {isSaving && <Loader2 size={18} className="animate-spin" />}
                  <span>{editingCategory ? 'Update' : 'Create'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
};

export default Admin;
