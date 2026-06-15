import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('safebite_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('safebite_cart', JSON.stringify(cart));
  }, [cart]);

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [addingItems, setAddingItems] = useState(new Set());

  // Fetch orders from backend when authenticated
  const fetchOrders = async (page = 1, append = false) => {
    if (!isAuthenticated || !user) {
      console.log('[CartContext] Skip fetchOrders: Not authenticated or user missing');
      setOrders([]);
      return;
    }

    const uId = user.id || user._id;
    console.log(`[CartContext] Fetching orders for user: ${uId}, page: ${page}`);
    
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders?page=${page}&limit=10`, {
        headers: {
          'x-user-id': uId,
          'x-user-role': user?.role
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('[CartContext] Received orders data:', data);
        
        if (!data.orders || !Array.isArray(data.orders)) {
          console.error('[CartContext] Invalid data format received. Expected orders array.');
          return;
        }

        // Map backend data to frontend format
        const formattedOrders = data.orders.map(order => ({
          id: order._id,
          date: order.createdAt,
          items: order.items,
          total: order.totalAmount,
          deliveryFee: order.deliveryFee,
          status: order.status,
          deliveryAddress: order.deliveryAddress,
          phoneNumber: order.phoneNumber
        }));
        
        console.log(`[CartContext] Successfully formatted ${formattedOrders.length} orders`);

        if (append) {
          setOrders(prev => [...prev, ...formattedOrders]);
        } else {
          setOrders(formattedOrders);
        }
        setPagination(data.pagination);
      } else {
        const errorData = await response.json();
        console.error('[CartContext] Failed to fetch orders:', errorData.error);
      }
    } catch (error) {
      console.error('[CartContext] Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, false);
  }, [isAuthenticated, user]);

  const isAdding = (productId) => addingItems.has(productId);

  const addToCart = async (product) => {
    const productId = product._id || product.id;
    setAddingItems(prev => new Set(prev).add(productId));

    // Small delay for UX and to show the loading state
    await new Promise(resolve => setTimeout(resolve, 600));

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, {
        productId: productId,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl || product.image,
        quantity: 1,
        stock: product.stock,
        isAvailable: product.isAvailable
      }];
    });

    setAddingItems(prev => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const placeOrder = async (orderDetails) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to place an order');
    }

    try {
      // Use the latest grand total including delivery fee
      const currentDeliveryFee = Number(settings?.deliveryFee || 0);
      const currentCartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
      const finalTotal = currentCartTotal + currentDeliveryFee;

      // Place order with items from local cart
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || user?._id
        },
        body: JSON.stringify({
          ...orderDetails,
          items: cart,
          totalAmount: finalTotal // Ensure backend gets the total including delivery fee
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to place order');
      }

      const newOrderData = await response.json();
      const formattedNewOrder = {
        id: newOrderData._id,
        date: newOrderData.createdAt,
        items: newOrderData.items,
        total: newOrderData.totalAmount,
        status: newOrderData.status,
        deliveryAddress: newOrderData.deliveryAddress,
        phoneNumber: newOrderData.phoneNumber
      };

      setOrders(prev => [formattedNewOrder, ...prev]);
      clearCart();
      return formattedNewOrder;
    } catch (error) {
      throw error;
    }
  };

  const cancelOrder = async (orderId) => {
    if (!isAuthenticated || !user) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id || user._id,
          'x-user-role': user?.role
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('[CartContext] Error cancelling order:', error);
      throw error;
    }
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const deliveryFee = Number(settings?.deliveryFee || 0);
  const grandTotal = cartTotal + deliveryFee;

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      deliveryFee,
      grandTotal,
      orders,
      pagination,
      fetchOrders,
      placeOrder,
      loading,
      isAdding
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
