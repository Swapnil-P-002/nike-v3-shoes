import React, { createContext, useContext, useState, useCallback } from "react";
import { Product } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: number;
  selectedColor: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: number, color: string) => void;
  removeFromCart: (productId: number, size?: number, color?: string) => void;
  updateQuantity: (productId: number, size: number, color: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "nike_cart";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Restore cart from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to restore cart:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Save to localStorage whenever items change
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product: Product, size: number, color: string) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [...prev, { product, quantity: 1, selectedSize: size, selectedColor: color }];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: number, size?: number, color?: string) => {
    setItems((prev) => prev.filter((item) => {
      // If size/color provided, remove specific item
      if (size !== undefined && color !== undefined) {
        return !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color);
      }
      // Fallback: Remove all by ID (legacy behavior, or if you want to clear a product entirely)
      return item.product.id !== productId;
    }));
  }, []);

  const updateQuantity = useCallback((productId: number, size: number, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        (item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
