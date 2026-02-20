import { initializeApp } from "firebase/app";
import { getFirestore, collection, setDoc, doc, deleteField } from "firebase/firestore";
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

const nikeProducts = [
    {
        id: 201,
        name: "Nike Dunk Low 'Retro Series'",
        price: 115,
        rating: 4.9,
        reviews: 3400,
        category: "lifestyle",
        sizes: [7, 8, 9, 10, 11, 12],
        colors: [
            { name: "University Blue", hex: "#60a5fa" },
            { name: "Panda Black", hex: "#111111" }
        ],
        images: [
            "https://images.unsplash.com/photo-1628253747716-0c4f5c90f75c?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1618677603286-0ec56cb6e1b5?auto=format&fit=crop&q=80&w=800"
        ],
        description: "The Dunk Low returns with crisp material overlays and heritage-inspired color blocking. Each pair tells a story of the streets.",
        isNew: true,
        isVerified: true // OWNER WAY
    },
    {
        id: 202,
        name: "Nike Air Max 270 'Dynamic Air'",
        price: 160,
        rating: 4.8,
        reviews: 2150,
        category: "running",
        sizes: [6, 7, 8, 9, 10, 11, 12],
        colors: [
            { name: "Siren Red", hex: "#ef4444" },
            { name: "Anthracite Black", hex: "#111111" }
        ],
        images: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=800"
        ],
        description: "The Nike Air Max 270 delivers visible cushioning under every step. Updated for modern comfort, it nods to the original 180.",
        isNew: true,
        isVerified: true // OWNER WAY
    },
    {
        id: 203,
        name: "Nike Air Force 1 '07 'Heritage'",
        price: 110,
        rating: 4.7,
        reviews: 5800,
        category: "lifestyle",
        sizes: [6, 7, 8, 9, 10, 11, 12, 13],
        colors: [
            { name: "Triple White", hex: "#ffffff" },
            { name: "Triple Black", hex: "#111111" }
        ],
        images: [
            "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800"
        ],
        description: "The radiance lives on in the AF1 '07. A basketball icon that puts a fresh spin on what you know best.",
        isNew: false,
        isVerified: false, // STAFF WAY
        lastAction: "add"
    },
    {
        id: 204,
        name: "Nike Air Zoom Pegasus 40",
        price: 130,
        rating: 4.7,
        reviews: 920,
        category: "running",
        sizes: [8, 9, 10, 11, 12],
        colors: [
            { name: "Electric Volt", hex: "#ceff00" },
            { name: "Ocean Blue", hex: "#3b82f6" }
        ],
        images: [
            "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80&w=800"
        ],
        description: "A springy ride for every run, the Peg's familiar feel returns with vibrant accents and responsive cushioning.",
        isNew: true,
        isVerified: false, // STAFF WAY
        lastAction: "add"
    }
];

async function seed() {
    console.log("Seeding fresh Nike products...");
    for (const product of nikeProducts) {
        console.log(`Adding: ${product.name}`);
        const productRef = doc(db, "products", product.id.toString());
        await setDoc(productRef, {
            ...product,
            createdAt: new Date().toISOString()
        });
    }
    console.log("Seeding complete. Some products are pending owner verification.");
}

seed().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
