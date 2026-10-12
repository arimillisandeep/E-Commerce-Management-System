import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) return setCart(null);
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setCart(data.data.cart);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addItem = async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/items', {
      product_id: productId,
      quantity,
    });
    setCart(data.data.cart);
  };

  const updateItem = async (cartItemId, quantity) => {
    const { data } = await api.put(`/cart/items/${cartItemId}`, { quantity });
    setCart(data.data.cart);
  };

  const removeItem = async (cartItemId) => {
    const { data } = await api.delete(`/cart/items/${cartItemId}`);
    setCart(data.data.cart);
  };

  const itemCount = cart
    ? cart.items.reduce((sum, i) => sum + i.quantity, 0)
    : 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, fetchCart, addItem, updateItem, removeItem, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
