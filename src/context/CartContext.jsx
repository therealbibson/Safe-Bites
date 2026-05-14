import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingItems, setAddingItems] = useState(new Set());
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('safebite_orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
        headers: {
          'x-user-id': user.id || user._id,
          'x-user-role': user.role
        }
      });
      const data = await response.json();
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, user]);

  useEffect(() => {
    localStorage.setItem('safebite_orders', JSON.stringify(orders));
  }, [orders]);

  const addToCart = async (product, quantity = 1) => {
    const productId = product.id || product._id;
    if (!isAuthenticated) {
      // Local fallback for guest users
      setCartItems(prev => {
        const existing = prev.find(item => item.productId === productId);
        if (existing) {
          return prev.map(item => 
            item.productId === productId 
              ? { ...item, quantity: item.quantity + quantity } 
              : item
          );
        }
        return [...prev, {
          productId: productId,
          name: product.name,
          price: product.price,
          imageUrl: product.image || product.imageUrl,
          quantity
        }];
      });
      return;
    }

    setAddingItems(prev => new Set(prev).add(productId));
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id || user._id,
          'x-user-role': user.role
        },
        body: JSON.stringify({ productId, quantity })
      });
      const data = await response.json();
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingItems(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) {
      setCartItems(prev => prev.filter(item => item.productId !== productId));
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/items/${productId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id || user._id,
          'x-user-role': user.role
        }
      });
      const data = await response.json();
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }

    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id || user._id,
          'x-user-role': user.role
        }
      });
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const placeOrder = (orderDetails) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to place an order');
    }

    const newOrder = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: user.id || user._id,
      date: new Date().toISOString(),
      items: [...cartItems],
      total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + 2.00,
      status: 'In Progress',
      ...orderDetails
    };
    setOrders([newOrder, ...orders]);
    clearCart();
    return newOrder;
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const isAdding = (productId) => addingItems.has(productId);

  return (
    <CartContext.Provider value={{ 
      cart: cartItems, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      cartCount, 
      cartTotal, 
      orders, 
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
