import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getStorage, ref, listAll, deleteObject } from "firebase/storage";
import fs from "fs";

const envContent = fs.readFileSync(".env", "utf8");
const env = {};
envContent.split("\n").forEach(line => {
    const [key, value] = line.split("=");
    if (key && value) env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
});

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

async function clearFirestore() {
    console.log("Clearing Firestore 'products' collection...");
    const querySnapshot = await getDocs(collection(db, "products"));
    console.log(`Found ${querySnapshot.size} documents.`);

    const deletePromises = querySnapshot.docs.map(d => {
        console.log(`Deleting doc: ${d.id}`);
        return deleteDoc(doc(db, "products", d.id));
    });

    await Promise.all(deletePromises);
    console.log("Firestore cleanup complete.");
}

async function clearStorage(path = "products") {
    console.log(`Clearing Storage '${path}' folder...`);
    const storageRef = ref(storage, path);

    try {
        const result = await listAll(storageRef);

        // Delete files
        const fileDeletes = result.items.map(itemRef => {
            console.log(`Deleting file: ${itemRef.fullPath}`);
            return deleteObject(itemRef);
        });

        // Recurse into folders
        const folderDeletes = result.prefixes.map(prefixRef => clearStorage(prefixRef.fullPath));

        await Promise.all([...fileDeletes, ...folderDeletes]);
        console.log(`Storage cleanup for '${path}' complete.`);
    } catch (error) {
        if (error.code === 'storage/object-not-found') {
            console.log(`Folder '${path}' not found or empty.`);
        } else {
            console.error(`Error clearing storage path '${path}':`, error);
        }
    }
}

async function main() {
    try {
        await clearFirestore();
        await clearStorage();
        console.log("Full data cleanup successful.");
        process.exit(0);
    } catch (error) {
        console.error("Cleanup failed:", error);
        process.exit(1);
    }
}

main();
