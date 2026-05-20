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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingItems, setAddingItems] = useState(new Set());

  useEffect(() => {
    localStorage.setItem('safebite_cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch orders from backend when authenticated
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) {
        setOrders([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, {
          headers: {
            'x-user-id': user?.id || user?._id,
            'x-user-role': user?.role
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Map backend data to frontend format
          const formattedOrders = data.map(order => ({
            id: order._id,
            date: order.createdAt,
            items: order.items,
            total: order.totalAmount,
            status: order.status,
            deliveryAddress: order.deliveryAddress,
            phoneNumber: order.phoneNumber
          }));
          setOrders(formattedOrders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
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
