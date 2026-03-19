import { useState, useEffect, useCallback } from "react";

export interface FPCartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  is_perishable: boolean;
  shipping_class: string;
  image: string;
  prep_time_days: number;
}

export interface FPEventDetails {
  event_type: string;
  custom_event_name: string;
  event_date: string;
  delivery_date: string;
}

const CART_KEY = "fp_cart_v1";
const EVENT_KEY = "fp_event_v1";

export function useFleuristCart() {
  const [items, setItems] = useState<FPCartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [eventDetails, setEventDetailsState] = useState<FPEventDetails>(() => {
    try {
      return JSON.parse(localStorage.getItem(EVENT_KEY) || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(EVENT_KEY, JSON.stringify(eventDetails));
  }, [eventDetails]);

  const addItem = useCallback((product: Omit<FPCartItem, "quantity"> & { quantity?: number }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.product_id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.product_id
            ? { ...i, quantity: i.quantity + (product.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  }, []);

  const removeItem = useCallback((product_id: string) => {
    setItems((prev) => prev.filter((i) => i.product_id !== product_id));
  }, []);

  const updateQuantity = useCallback((product_id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(product_id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product_id === product_id ? { ...i, quantity } : i))
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const setEventDetails = useCallback((details: Partial<FPEventDetails>) => {
    setEventDetailsState((prev) => ({ ...prev, ...details }));
  }, []);

  const perishableItems = items.filter((i) => i.is_perishable);
  const nonPerishableItems = items.filter((i) => !i.is_perishable);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const hasPerishable = perishableItems.length > 0;
  const hasNonPerishable = nonPerishableItems.length > 0;
  const isMixedCart = hasPerishable && hasNonPerishable;
  const maxPrepDays = items.reduce((max, i) => Math.max(max, i.prep_time_days), 0);

  return {
    items,
    eventDetails,
    perishableItems,
    nonPerishableItems,
    subtotal,
    totalItems,
    hasPerishable,
    hasNonPerishable,
    isMixedCart,
    maxPrepDays,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setEventDetails,
  };
}
