import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/context/OrderContext";

const COLLECTION_NAME = "orders";

export const orderService = {
    // Add new order to Firestore
    async addOrder(order: Order): Promise<string> {
        try {
            // Sanitize for Firestore
            const sanitizedOrder = JSON.parse(JSON.stringify({
                ...order,
                createdAt: new Date().toISOString()
            }));

            const docRef = await addDoc(collection(db, COLLECTION_NAME), sanitizedOrder);
            console.log("Order saved to Firestore with ID:", docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("Error saving order to Firestore:", error);
            throw error;
        }
    },

    // Fetch orders (limited to recent for optimization)
    async getOrders(): Promise<Order[]> {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                orderBy("date", "desc"),
                limit(50)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => doc.data() as Order);
        } catch (error) {
            console.error("Error fetching orders from Firestore:", error);
            return [];
        }
    }
};
