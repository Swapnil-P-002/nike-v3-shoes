import { initializeApp } from "firebase/app";
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";
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

const atoZNikeProducts = [
    {
        id: 301,
        name: "Air Jordan 4 'Crimson Legacy'",
        price: 210,
        rating: 5.0,
        reviews: 4200,
        category: "lifestyle",
        sizes: [7, 8, 9, 10, 11, 12, 13],
        colors: [
            { name: "Crimson Red", hex: "#dc2626" },
            { name: "Midnight Black", hex: "#0a0a0a" }
        ],
        images: [
            "https://images.unsplash.com/photo-1597044768515-31a2ceec81c4?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&q=80&w=800"
        ],
        description: "The iconic AJ4 returns in a striking Crimson colorway. Premium nubuck meets classic mesh for an unmatched legacy look.",
        isNew: true,
        isVerified: true
    },
    {
        id: 302,
        name: "Nike Blazer Mid '77 Vintage",
        price: 105,
        rating: 4.8,
        reviews: 1850,
        category: "lifestyle",
        sizes: [6, 7, 8, 9, 10, 11, 12],
        colors: [
            { name: "Classic White", hex: "#ffffff" },
            { name: "Emerald Green", hex: "#059669" }
        ],
        images: [
            "https://images.unsplash.com/photo-1626379616459-b2ce1d9decbb?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Old-school style meets modern comfort. The Blazer Mid '77 stays true to its basketball roots with a clean, vintage finish.",
        isNew: false,
        isVerified: true
    },
    {
        id: 303,
        name: "Nike Cortez 'Timeless Classic'",
        price: 90,
        rating: 4.7,
        reviews: 2900,
        category: "lifestyle",
        sizes: [5, 6, 7, 8, 9, 10, 11],
        colors: [
            { name: "Varsity Red", hex: "#ef4444" },
            { name: "Classic Black", hex: "#111111" }
        ],
        images: [
            "https://images.unsplash.com/photo-1512374382149-433a72b9a5a5?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800"
        ],
        description: "The shoe that defined a decade. The Nike Cortez brings the 1972 track star into the modern lifestyle arena.",
        isNew: true,
        isVerified: false,
        lastAction: "add"
    },
    {
        id: 304,
        name: "Nike Metcon 9 'Elite Trainer'",
        price: 150,
        rating: 4.9,
        reviews: 750,
        category: "training",
        sizes: [8, 9, 10, 11, 12, 13],
        colors: [
            { name: "Amber Inferno", hex: "#f59e0b" },
            { name: "Cool Grey", hex: "#6b7280" }
        ],
        images: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Stability and durability for the hardest workouts. The Metcon 9 features a larger Hyperlift plate and rubber rope wrap.",
        isNew: true,
        isVerified: false,
        lastAction: "add"
    },
    {
        id: 305,
        name: "Nike VaporMax Plus 'Sunset Rise'",
        price: 210,
        rating: 4.8,
        reviews: 1300,
        category: "lifestyle",
        sizes: [7, 8, 9, 10, 11, 12],
        colors: [
            { name: "Sunset Orange", hex: "#fb923c" },
            { name: "Deep Purple", hex: "#7e22ce" }
        ],
        images: [
            "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800"
        ],
        description: "A hybrid masterpiece. The VaporMax Plus combines the floating cage of the '98 Air Max Plus with modern VaporMax cushioning.",
        isNew: true,
        isVerified: true
    },
    {
        id: 306,
        name: "Nike Zoom Rival 'Track Star'",
        price: 85,
        rating: 4.6,
        reviews: 420,
        category: "track",
        sizes: [6, 7, 8, 9, 10, 11, 12],
        colors: [
            { name: "Electric Volt", hex: "#d9f99d" },
            { name: "Hyper Blue", hex: "#2563eb" }
        ],
        images: [
            "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1582587310573-0604346ca922?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Dominate the track with the Zoom Rival. Lightweight, breathable, and built for speed.",
        isNew: false,
        isVerified: false,
        lastAction: "add"
    }
];

async function seed() {
    console.log("Seeding A-Z Nike collection...");
    for (const product of atoZNikeProducts) {
        console.log(`Adding: ${product.name}`);
        const productRef = doc(db, "products", product.id.toString());
        await setDoc(productRef, {
            ...product,
            createdAt: new Date().toISOString()
        });
    }
    console.log("Seeding complete. Products added with multiple colorways.");
}

seed().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
