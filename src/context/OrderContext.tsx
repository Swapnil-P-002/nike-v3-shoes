import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { orderService } from "@/services/orderService";

export interface OrderItem {
    id: string;
    productId: number;
    name: string;
    price: number;
    quantity: number;
    size: number;
    color: string;
    image: string;
}

export interface Order {
    id: string;
    date: string;
    items: OrderItem[];
    totalPrice: number;
    status: "pending" | "completed" | "shipped" | "delivered";
}

interface OrderContextType {
    orders: Order[];
    addOrder: (cartItems: any[], totalAmount: number) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const STORAGE_KEY = "nike_orders";

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [orders, setOrders] = useState<Order[]>([]);

    // Restore orders from Firestore + localStorage on mount
    useEffect(() => {
        const loadOrders = async () => {
            try {
                // 1. Try Firestore first
                const fbOrders = await orderService.getOrders();
                if (fbOrders.length > 0) {
                    setOrders(fbOrders);
                    return;
                }

                // 2. Fallback to localStorage
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    setOrders(JSON.parse(stored));
                }
            } catch (error) {
                console.error("Failed to restore orders:", error);
            }
        };
        loadOrders();
    }, []);

    // Save to localStorage whenever orders change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }, [orders]);

    const addOrder = useCallback(async (cartItems: any[], totalAmount: number) => {
        const newOrder: Order = {
            id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            date: new Date().toISOString(),
            items: cartItems.map((item) => ({
                id: `${item.product.id}-${item.selectedSize}-${item.selectedColor}`,
                productId: item.product.id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                size: item.selectedSize,
                color: item.selectedColor,
                image: item.product.images[0],
            })),
            totalPrice: totalAmount,
            status: "completed",
        };

        // 1. Update UI immediately
        setOrders((prev) => [newOrder, ...prev]);

        // 2. Persist to Firestore in background
        try {
            await orderService.addOrder(newOrder);
        } catch (error) {
            console.error("Delayed Firestore sync failed for order", newOrder.id);
        }
    }, []);

    return (
        <OrderContext.Provider value={{ orders, addOrder }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error("useOrders must be used within an OrderProvider");
    }
    return context;
};
