import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    setDoc,
    deleteField
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, products as initialProducts } from "@/data/products";

const COLLECTION_NAME = "products";

export const productService = {
    _cache: null as Product[] | null,
    _cacheTimestamp: 0,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

    // Helper to invalidate cache
    invalidateCache() {
        this._cache = null;
    },

    // Fetch all products from Firestore
    async getProducts(): Promise<Product[]> {
        // Return cached if valid
        if (this._cache && (Date.now() - this._cacheTimestamp < this.CACHE_DURATION)) {
            return this._cache;
        }

        try {
            // FORCE LOCAL MODE if API key is missing
            // Removed orderBy to avoid missing index errors on new Firebase projects
            const q = query(collection(db, COLLECTION_NAME));
            console.log("Fetching products from Firestore...");
            const querySnapshot = await getDocs(q);
            console.log(`Firestore returned ${querySnapshot.size} documents.`);

            if (querySnapshot.empty) {
                console.log("Firestore is empty.");
                return [];
            }

            // 1. Map Firestore documents
            const firestoreProducts = querySnapshot.docs.map(doc => {
                const data = doc.data() as Product;
                return {
                    ...data,
                    id: data.id || Number(doc.id) || Number(Date.now().toString().slice(-6))
                };
            });

            // 2. Identify missing initial products - REMOVED AUTO-SYNC TO TRUST DB STATE
            // This prevents "resurrection" of deleted products.
            // Seeding is now handled only in App.tsx or Manual Reset.

            // 3. Filter and Sort for UI (Newest first) - TRUST DATABASE IDs
            const activeProducts = firestoreProducts.filter(p => !p.isSoftDeleted);
            const result = activeProducts.sort((a, b) => b.id - a.id);

            // Update Cache
            this._cache = result;
            this._cacheTimestamp = Date.now();

            return result;
        } catch (error) {
            console.error("Error fetching products:", error);
            // Return empty array on error to avoid showing stale local data
            return [];
        }
    },

    // Add a new product to Firestore
    async addProduct(product: Omit<Product, "id">, isAdmin: boolean, isOwner: boolean): Promise<void> {
        if (!isAdmin) {
            console.error("Unauthorized attempt to add product.");
            throw new Error("Missing admin privileges.");
        }

        try {
            const numericId = Date.now();
            const newProduct: any = {
                ...product,
                id: numericId,
                isVerified: isOwner,
                createdAt: new Date().toISOString()
            };

            if (!isOwner) {
                newProduct.lastAction = "add";
            }

            // Auto-feature if rating is high
            if (newProduct.rating > 4.5) {
                newProduct.isFeatured = true;
            }

            // Sanitize undefined values (Firestore crashes on undefined)
            const sanitizedProduct = JSON.parse(JSON.stringify(newProduct));

            await setDoc(doc(db, COLLECTION_NAME, numericId.toString()), sanitizedProduct);
            this.invalidateCache();
        } catch (error) {
            console.error("Error adding product:", error);
            throw error;
        }
    },

    // Update a product (Staff version creates pending edit, Owner version updates directly)
    async updateProduct(product: Product, isAdmin: boolean, isOwner: boolean): Promise<void> {
        if (!isAdmin) throw new Error("Unauthorized.");

        try {
            const productData: any = {
                ...product,
                isVerified: isOwner,
                isPendingDelete: false
            };

            if (isOwner) {
                productData.lastAction = deleteField();
                productData.previousState = deleteField(); // Clear history on owner edit
            } else {
                productData.lastAction = "edit";
                productData.isVerified = false;

                // Capture PREVIOUS state before overwriting
                const currentDoc = await getDoc(doc(db, COLLECTION_NAME, product.id.toString()));
                if (currentDoc.exists()) {
                    const currentData = currentDoc.data() as Product;
                    // Only save previous state if it's currently verified (don't overwrite history with intermediate drafts if possible, or do we want chain?)
                    // Simplest: Save the state that is being overwritten.
                    // If there was already a pending edit, currentData is that pending edit.
                    // We ideally want the LAST VERIFIED state.
                    // If currentData.isVerified is true, save it.
                    // If currentData.isVerified is false, KEEP the existing previousState (if any), don't overwrite it with a draft.

                    if (currentData.isVerified) {
                        productData.previousState = currentData;
                    } else {
                        // Keep existing previousState if we are editing a draft
                        productData.previousState = currentData.previousState || currentData;
                    }
                }
            }

            // Auto-feature if rating is high on update too
            if (productData.rating > 4.5) {
                productData.isFeatured = true;
            }

            // Sanitize undefined values
            const sanitizedData = JSON.parse(JSON.stringify(productData));

            await setDoc(doc(db, COLLECTION_NAME, product.id.toString()), sanitizedData, { merge: true });
            this.invalidateCache();
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        }
    },

    // Delete a product (Staff creates request, Owner moves to Backup)
    async deleteProduct(numericId: number, isAdmin: boolean, isOwner: boolean): Promise<void> {
        if (!isAdmin) throw new Error("Unauthorized.");

        try {
            const productRef = doc(db, COLLECTION_NAME, numericId.toString());
            if (isOwner) {
                // Owner: Soft delete (Move to Backup)
                await setDoc(productRef, {
                    isSoftDeleted: true,
                    deletedAt: new Date().toISOString(),
                    isVerified: false,
                    lastAction: deleteField(),
                    isPendingDelete: false
                }, { merge: true });
            } else {
                // Staff marks for deletion
                await setDoc(productRef, {
                    isPendingDelete: true,
                    isVerified: false,
                    lastAction: "delete"
                }, { merge: true });
            }
            this.invalidateCache();
        } catch (error) {
            console.error("Error deleting product:", error);
            throw error;
        }
    },

    // NEW: Owner verifies a pending action
    async verifyProductAction(numericId: number, isOwner: boolean): Promise<void> {
        if (!isOwner) throw new Error("Verification failed: Only owners have this privilege.");

        console.log(`Attempting to verify document with ID: ${numericId}`);

        try {
            const productRef = doc(db, COLLECTION_NAME, numericId.toString());
            const productSnap = await getDoc(productRef);

            if (!productSnap.exists()) {
                console.error(`Document with ID ${numericId} does not exist in Firestore.`);
                throw new Error(`Product not found (ID: ${numericId})`);
            }

            const docData = productSnap.data();
            console.log("Found pending document data:", docData);

            if (docData?.lastAction === "delete") {
                console.log(`Executing soft deletion for ID: ${numericId} after verification`);
                await setDoc(productRef, {
                    isSoftDeleted: true,
                    deletedAt: new Date().toISOString(),
                    isVerified: false,
                    lastAction: deleteField(),
                    isPendingDelete: false
                }, { merge: true });
            } else {
                console.log(`Setting isVerified=true for ID: ${numericId}`);
                await setDoc(productRef, {
                    isVerified: true,
                    lastAction: deleteField(),
                    previousState: deleteField(), // Clear history
                    isPendingDelete: false
                }, { merge: true });
            }
            console.log("Verification successful.");
            this.invalidateCache();
        } catch (error) {
            console.error("Critical error in verifyProductAction:", error);
            throw error;
        }
    },

    // NEW: Reject a pending action (Revert edit or Delete new add)
    async rejectProductAction(numericId: number): Promise<void> {
        const productRef = doc(db, COLLECTION_NAME, numericId.toString());
        const snap = await getDoc(productRef);

        if (!snap.exists()) return;

        const data = snap.data() as Product;

        if (data.lastAction === "add") {
            // If it was a new add, just delete it
            await deleteDoc(productRef);
        } else if (data.lastAction === "edit" || data.lastAction === "delete") {
            // If it was an edit or delete request, revert to previous state if available
            if (data.previousState) {
                // Sanitize undefined values which Firestore hates
                try {
                    const cleanPrevious = JSON.parse(JSON.stringify(data.previousState));
                    await setDoc(productRef, {
                        ...cleanPrevious,
                        isVerified: true, // Revert to verified state
                        lastAction: deleteField(),
                        previousState: deleteField(),
                        isPendingDelete: false
                    });
                } catch (revertError) {
                    console.error("Revert failed, falling back to clear pending flags:", revertError);
                    // Fallback: Just mark as verified to clear the pending state
                    await setDoc(productRef, {
                        isVerified: true,
                        lastAction: deleteField(),
                        isPendingDelete: false
                    }, { merge: true });
                }
            } else {
                // Fallback if no history: Just mark as verified (keep changes) OR force delete?
                // Logic: If we reject an edit but have no history, we can't revert. 
                // But logically we shouldn't have edits without history now.
                // Fallback: Clear the pending flags.
                await setDoc(productRef, {
                    isVerified: true,
                    lastAction: deleteField(),
                    isPendingDelete: false
                }, { merge: true });
            }
            this.invalidateCache();
        }
    },

    // Get all backup products (soft-deleted)
    async getBackupProducts(): Promise<Product[]> {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy("deletedAt", "desc"));
            const querySnapshot = await getDocs(q);
            const all = querySnapshot.docs.map(doc => ({ ...doc.data() } as Product));

            // Clean up: Auto-delete items older than 3 days
            const now = Date.now();
            const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
            const validItems: Product[] = [];

            for (const item of all) {
                if (item.isSoftDeleted) {
                    const deletedTime = new Date(item.deletedAt || 0).getTime();
                    if (now - deletedTime > threeDaysMs) {
                        await deleteDoc(doc(db, COLLECTION_NAME, item.id.toString()));
                    } else {
                        validItems.push(item);
                    }
                }
            }
            return validItems;
        } catch (error) {
            console.error("Error fetching backup products:", error);
            return [];
        }
    },

    async restoreProduct(productId: number): Promise<void> {
        const productRef = doc(db, COLLECTION_NAME, productId.toString());
        await setDoc(productRef, {
            isSoftDeleted: false,
            deletedAt: deleteField(),
            isVerified: true,
            lastAction: deleteField()
        }, { merge: true });
        this.invalidateCache();
    },

    async permanentDeleteProduct(productId: number): Promise<void> {
        await deleteDoc(doc(db, COLLECTION_NAME, productId.toString()));
        this.invalidateCache();
    },

    async deleteAllBackupProducts(): Promise<void> {
        try {
            const q = query(collection(db, COLLECTION_NAME), where("isSoftDeleted", "==", true));
            const querySnapshot = await getDocs(q);
            const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            console.log("All backup products cleared.");
            this.invalidateCache();
        } catch (error) {
            console.error("Error clearing backup:", error);
            throw error;
        }
    },

    // Seed initial data to Firestore
    async seedInitialProducts(): Promise<void> {
        console.warn("Auto-seeding is permanently disabled.");
        return;
        /* 
        try {
            for (const product of initialProducts) {
                await setDoc(doc(db, COLLECTION_NAME, product.id.toString()), {
                    ...product,
                    isVerified: true // Defaults are verified
                });
            }
            console.log("Seeded with unique IDs!");
            this.invalidateCache();
        } catch (error) {
            console.error("Error seeding products:", error);
        }
        */
    },

    // NEW: Clear ALL products from Firestore
    async clearAllProducts(): Promise<void> {
        try {
            const q = query(collection(db, COLLECTION_NAME));
            const querySnapshot = await getDocs(q);
            const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            console.log("All products cleared from Firestore.");
            this.invalidateCache();
        } catch (error) {
            console.error("Error clearing products:", error);
            throw error;
        }
    },

    // NEW: Reset Database (Clear + Seed)
    async resetDatabase(): Promise<void> {
        console.warn("Database reset is disabled.");
        /*
        await this.clearAllProducts();
        await this.seedInitialProducts();
        console.log("Database reset successfully with new initial products.");
        */
    }
};
