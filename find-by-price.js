
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const envContent = fs.readFileSync(".env", "utf8");
const env = {};
envContent.split("\n").forEach(line => {
    const [key, value] = line.split("=");
    if (key && value) env[key.trim()] = value.trim();
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

async function findByPrice() {
    console.log("Searching for products with price 210 or 90 or name match...");
    const querySnapshot = await getDocs(collection(db, "products"));
    let found = false;
    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const name = data.name || "";
        const price = data.price;
        if (price === 210 || price === 90 ||
            name.toLowerCase().includes("crimson") ||
            name.toLowerCase().includes("rival") ||
            name.toLowerCase().includes("legacy") ||
            name.toLowerCase().includes("track star")) {
            console.log(`FOUND: ID="${docSnap.id}" Name="${name}" Price=${price}`);
            found = true;
        }
    });
    if (!found) {
        console.log("No matching products found in 'products' collection.");
    }
}

findByPrice().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
