import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, PickupSlot } from '../types';
import { getPickupSlots, getSystemSettings, subscribeDb } from '../services/db';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  special_instruction?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem, qty?: number, instruction?: string) => { success: boolean; error?: string };
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, qty: number) => void;
  updateInstruction: (itemId: string, instruction: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedSlot: PickupSlot | null;
  setSelectedSlot: (slot: PickupSlot | null) => void;
  availableSlots: PickupSlot[];
  subtotal: number;
  tax: number;
  total: number;
  totalItemsCount: number;
  estimatedPrepTimeMins: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'canteen_cart_state_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<PickupSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<PickupSlot | null>(null);

  const refreshSlots = () => {
    const slots = getPickupSlots();
    setAvailableSlots(slots);
    if (!selectedSlot && slots.length > 0) {
      // Pick first non-full slot, or ASAP
      const asap = slots.find((s) => s.slot_id === 'slot_asap') || slots[0];
      setSelectedSlot(asap);
    }
  };

  useEffect(() => {
    refreshSlots();
    const unsub = subscribeDb(refreshSlots);
    return unsub;
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const totalItemsCount = cart.reduce((acc, it) => acc + it.quantity, 0);

  const addToCart = (
    item: MenuItem,
    qty = 1,
    instruction = ''
  ): { success: boolean; error?: string } => {
    const settings = getSystemSettings();
    if (totalItemsCount + qty > settings.max_items_per_customer) {
      return {
        success: false,
        error: `Order limit reached: Maximum ${settings.max_items_per_customer} items allowed per customer order.`,
      };
    }

    if (item.status === 'Sold Out' || item.status === 'Temporarily Unavailable') {
      return { success: false, error: `${item.item_name} is currently ${item.status}.` };
    }

    setCart((prev) => {
      const existingIdx = prev.findIndex((ci) => ci.menuItem.item_id === item.item_id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + qty;
        if (newQty > item.available_quantity) {
          // cap to max available
          updated[existingIdx].quantity = item.available_quantity;
        } else {
          updated[existingIdx].quantity = newQty;
        }
        if (instruction) {
          updated[existingIdx].special_instruction = instruction;
        }
        return updated;
      }
      return [
        ...prev,
        {
          menuItem: item,
          quantity: Math.min(qty, item.available_quantity),
          special_instruction: instruction,
        },
      ];
    });

    return { success: true };
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.menuItem.item_id !== itemId));
  };

  const updateQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    const settings = getSystemSettings();
    const currentWithoutItem = cart
      .filter((ci) => ci.menuItem.item_id !== itemId)
      .reduce((acc, ci) => acc + ci.quantity, 0);

    if (currentWithoutItem + qty > settings.max_items_per_customer) {
      return;
    }

    setCart((prev) =>
      prev.map((ci) => {
        if (ci.menuItem.item_id === itemId) {
          return {
            ...ci,
            quantity: Math.min(qty, ci.menuItem.available_quantity),
          };
        }
        return ci;
      })
    );
  };

  const updateInstruction = (itemId: string, instruction: string) => {
    setCart((prev) =>
      prev.map((ci) => {
        if (ci.menuItem.item_id === itemId) {
          return { ...ci, special_instruction: instruction };
        }
        return ci;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = Number(
    cart.reduce((acc, ci) => acc + ci.menuItem.price * ci.quantity, 0).toFixed(2)
  );
  const tax = Number((subtotal * 0.05).toFixed(2)); // 5% campus dining tax
  const total = Number((subtotal + tax).toFixed(2));

  // Dynamic estimated prep calculation
  const maxItemPrep = cart.reduce((max, ci) => Math.max(max, ci.menuItem.preparation_time), 0);
  const totalItems = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const estimatedPrepTimeMins = totalItems === 0 ? 0 : Math.max(8, Math.round(maxItemPrep + totalItems * 1.5));

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateInstruction,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        selectedSlot,
        setSelectedSlot,
        availableSlots,
        subtotal,
        tax,
        total,
        totalItemsCount,
        estimatedPrepTimeMins,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return ctx;
}
