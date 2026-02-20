import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore";
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

const namesToDelete = [
    "AIR JORDAN 4 'CRIMSON LEGACY'",
    "NIKE ZOOM RIVAL 'TRACK STAR'",
    "Air Jordan 4 'Crimson Legacy'",
    "Nike Zoom Rival 'Track Star'"
];

async function cleanup() {
    const querySnapshot = await getDocs(collection(db, "products"));
    console.log(`Total documents found: ${querySnapshot.size}`);

    for (const d of querySnapshot.docs) {
        const data = d.data();
        const name = data.name;
        const docId = d.id;

        console.log(`Found: "${name}" (ID: ${docId})`);

        if (namesToDelete.some(n => n.toLowerCase() === (name || "").toLowerCase().trim())) {
            console.log(`MATCH FOUND: Deleting "${name}" (ID: ${docId})...`);
            await deleteDoc(doc(db, "products", docId));
            console.log(`Deleted "${name}"`);
        }
    }
}

cleanup().then(() => {
    console.log("Cleanup complete.");
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
