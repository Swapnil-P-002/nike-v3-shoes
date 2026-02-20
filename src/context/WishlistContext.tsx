import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Product } from "@/data/products";

interface WishlistContextType {
    items: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: number) => void;
    isInWishlist: (productId: number) => boolean;
    clearWishlist: () => void;
    totalItems: number;
    isWishlistOpen: boolean;
    setIsWishlistOpen: (open: boolean) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "nike_wishlist";

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<Product[]>([]);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);

    // Restore wishlist from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const wishlistData = JSON.parse(stored);
                setItems(wishlistData);
            }
        } catch (error) {
            console.error("Failed to restore wishlist:", error);
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    // Save to localStorage whenever items change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addToWishlist = useCallback((product: Product) => {
        setItems((prev) => {
            // Check if already in wishlist
            if (prev.some((item) => item.id === product.id)) {
                return prev;
            }
            return [...prev, product];
        });
    }, []);

    const removeFromWishlist = useCallback((productId: number) => {
        setItems((prev) => prev.filter((item) => item.id !== productId));
    }, []);

    const isInWishlist = useCallback(
        (productId: number): boolean => {
            return items.some((item) => item.id === productId);
        },
        [items]
    );

    const clearWishlist = useCallback(() => {
        setItems([]);
    }, []);

    const totalItems = items.length;

    return (
        <WishlistContext.Provider
            value={{
                items,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                clearWishlist,
                totalItems,
                isWishlistOpen,
                setIsWishlistOpen,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
};
