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

async function findProducts() {
    const q = collection(db, "products");
    const querySnapshot = await getDocs(q);
    console.log(`Total documents: ${querySnapshot.size}`);

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const name = data.name || "";
        console.log(`ID="${doc.id}" Name="${name}"`);
    });
}

findProducts().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
