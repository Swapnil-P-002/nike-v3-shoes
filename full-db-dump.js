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

async function dump() {
    const q = collection(db, "products");
    const querySnapshot = await getDocs(q);
    const products = [];
    querySnapshot.forEach((doc) => {
        products.push({ docId: doc.id, ...doc.data() });
    });
    fs.writeFileSync("db_dump_full.json", JSON.stringify(products, null, 2), "utf8");
}

dump().then(() => {
    console.log("Dump complete. Check db_dump_full.json");
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
