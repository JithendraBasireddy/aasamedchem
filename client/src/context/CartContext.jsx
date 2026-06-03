import React, { createContext, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { token } = useContext(AuthContext);

  // Add an item to the shopping cart
  const addToCart = (item) => {
    setCart((prevCart) => {
      // Find if item already exists in cart with matching product id and unit selection
      const existsIndex = prevCart.findIndex(
        (i) => i.productId === item.productId && i.unitSelected === item.unitSelected
      );

      if (existsIndex > -1) {
        const newCart = [...prevCart];
        newCart[existsIndex].quantityOrdered += item.quantityOrdered;
        newCart[existsIndex].baseQty += item.baseQty;
        newCart[existsIndex].subtotal += item.subtotal;
        return newCart;
      }

      return [...prevCart, item];
    });
  };

  // Remove item from shopping cart
  const removeFromCart = (productId, unitSelected) => {
    setCart((prevCart) => 
      prevCart.filter((item) => !(item.productId === productId && item.unitSelected === unitSelected))
    );
  };

  // Clear shopping cart
  const clearCart = () => {
    setCart([]);
  };

  // Submit Order checkout to backend API
  const placeOrder = async () => {
    if (cart.length === 0) throw new Error('Cart is empty');

    try {
      const items = cart.map((item) => ({
        product: item.productId,
        quantityOrdered: item.quantityOrdered,
        unitSelected: item.unitSelected
      }));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      clearCart();
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Submit Quotation check to backend API
  const placeQuotation = async () => {
    if (cart.length === 0) throw new Error('Cart is empty');

    try {
      const items = cart.map((item) => ({
        product: item.productId,
        quantityOrdered: item.quantityOrdered,
        unitSelected: item.unitSelected
      }));

      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create quotation');
      }

      clearCart();
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Sum total checkout amount
  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, placeOrder, placeQuotation, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
