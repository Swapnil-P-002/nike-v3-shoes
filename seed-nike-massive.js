import { initializeApp } from "firebase/app";
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";
import fs from "fs";

const envContent = fs.readFileSync(".env", "utf8");
const env = {};
envContent.split("\n").forEach(line => {
    const firstEq = line.indexOf("=");
    if (firstEq !== -1) {
        const key = line.substring(0, firstEq).trim();
        const value = line.substring(firstEq + 1).trim().replace(/^["']|["']$/g, '');
        if (key && value) env[key] = value;
    }
});

console.log("Loaded ENV Keys:", Object.keys(env));

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
};

console.log("Initializing Firebase with:", {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey ? "***" : "MISSING"
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const massiveProducts = [
    {
        id: 501,
        name: "Air Jordan 1 Retro High OG",
        price: 180,
        rating: 5.0,
        reviews: 5100,
        category: "lifestyle",
        sizes: [7, 8, 9, 10, 11, 12, 13],
        colors: [
            { name: "University Blue", hex: "#60a5fa" },
            { name: "Chicago Red", hex: "#dc2626" }
        ],
        images: [
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&q=80&w=800"
        ],
        description: "The sneaker that started it all. The Air Jordan 1 Retro High OG combines premium leather with iconic style.",
        isNew: true,
        isVerified: true
    },
    {
        id: 502,
        name: "Air Jordan 4 'Crimson'",
        price: 210,
        rating: 4.9,
        reviews: 3200,
        category: "lifestyle",
        sizes: [7, 8, 9, 10, 11, 12],
        colors: [
            { name: "Crimson", hex: "#dc2626" },
            { name: "Black", hex: "#111111" }
        ],
        images: [
            "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1597044768515-31a2ceec81c4?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Premium nubuck and signature mesh panels define this modern masterpiece.",
        isNew: true,
        isVerified: true
    },
    {
        id: 503,
        name: "Nike Dunk Low 'Panda'",
        price: 115,
        rating: 4.8,
        reviews: 8400,
        category: "lifestyle",
        sizes: [6, 7, 8, 9, 10, 11, 12],
        colors: [
            { name: "Black/White", hex: "#111111" },
            { name: "Grey Fog", hex: "#9ca3af" }
        ],
        images: [
            "https://images.unsplash.com/photo-1618677603286-0ec56cb6e1b5?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1628253747716-0c4f5c90f75c?auto=format&fit=crop&q=80&w=800"
        ],
        description: "The street icon in its most versatile colorway.",
        isNew: false,
        isVerified: true
    },
    {
        id: 504,
        name: "Nike Air Force 1 '07",
        price: 115,
        rating: 4.9,
        reviews: 12000,
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
        description: "The legend lives on in this crisp hoops classic.",
        isNew: false,
        isVerified: true
    },
    {
        id: 505,
        name: "Nike Air Zoom Pegasus 40",
        price: 130,
        rating: 4.7,
        reviews: 920,
        category: "running",
        sizes: [8, 9, 10, 11, 12],
        colors: [
            { name: "Volt", hex: "#ceff00" },
            { name: "Ocean Blue", hex: "#3b82f6" }
        ],
        images: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Springy and responsive for every run.",
        isNew: true,
        isVerified: false,
        lastAction: "add"
    },
    {
        id: 506,
        name: "Nike Air Max 270",
        price: 160,
        rating: 4.8,
        reviews: 3200,
        category: "lifestyle",
        sizes: [7, 8, 9, 10, 11, 12],
        colors: [
            { name: "Siren Red", hex: "#ef4444" },
            { name: "Black", hex: "#111111" }
        ],
        images: [
            "https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1620138546344-7b2c0b0507ef?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Nike's first lifestyle Air Max delivers style and comfort.",
        isNew: true,
        isVerified: true
    },
    {
        id: 507,
        name: "Nike Air Max Plus",
        price: 180,
        rating: 4.9,
        reviews: 1400,
        category: "lifestyle",
        sizes: [7, 8, 9, 10, 11, 12],
        colors: [
            { name: "Sunset", hex: "#f97316" },
            { name: "Purple", hex: "#a855f7" }
        ],
        images: [
            "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Iconic tuned Air technology and wavy design lines.",
        isNew: true,
        isVerified: true
    },
    {
        id: 508,
        name: "Nike Metcon 9",
        price: 150,
        rating: 4.8,
        reviews: 430,
        category: "training",
        sizes: [8, 9, 10, 11, 12],
        colors: [
            { name: "Amber", hex: "#f59e0b" },
            { name: "Grey", hex: "#6b7280" }
        ],
        images: [
            "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=800"
        ],
        description: "The gold standard for training and lifting.",
        isNew: true,
        isVerified: false,
        lastAction: "add"
    },
    {
        id: 509,
        name: "Nike Blazer Mid '77",
        price: 105,
        rating: 4.7,
        reviews: 2100,
        category: "lifestyle",
        sizes: [6, 7, 8, 9, 10, 11],
        colors: [
            { name: "White/Black", hex: "#ffffff" },
            { name: "Emerald", hex: "#10b981" }
        ],
        images: [
            "https://images.unsplash.com/photo-1626379616459-b2ce1d9decbb?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Vintage hoops style for the modern street.",
        isNew: false,
        isVerified: true
    },
    {
        id: 510,
        name: "Nike Cortez",
        price: 90,
        rating: 4.7,
        reviews: 3100,
        category: "lifestyle",
        sizes: [6, 7, 8, 9, 10, 11, 12],
        colors: [
            { name: "White/Red", hex: "#ef4444" },
            { name: "Black/White", hex: "#111111" }
        ],
        images: [
            "https://images.unsplash.com/photo-1512374382149-433a72b9a5a5?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800"
        ],
        description: "The classic track shoe that became a culture icon.",
        isNew: true,
        isVerified: true
    },
    {
        id: 511,
        name: "Nike VaporMax Plus",
        price: 210,
        rating: 5.0,
        reviews: 1200,
        category: "lifestyle",
        sizes: [7, 8, 9, 10, 11, 12],
        colors: [
            { name: "Black", hex: "#111111" },
            { name: "Blue", hex: "#3b82f6" }
        ],
        images: [
            "https://images.unsplash.com/photo-1520316616391-51ca215a996f?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1582587310573-0604346ca922?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Gravity-defying comfort and futuristic style.",
        isNew: true,
        isVerified: true
    },
    {
        id: 512,
        name: "Nike Zoom Rival",
        price: 85,
        rating: 4.6,
        reviews: 320,
        category: "track",
        sizes: [6, 7, 8, 9, 10, 11],
        colors: [
            { name: "Volt", hex: "#ceff00" },
            { name: "Blue", hex: "#60a5fa" }
        ],
        images: [
            "https://images.unsplash.com/photo-1533682805518-48d1f5a8cb50?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1580931062319-38b47fb59f81?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Engineered for speed on the track.",
        isNew: false,
        isVerified: false,
        lastAction: "add"
    },
    {
        id: 513,
        name: "Nike React Vision",
        price: 140,
        rating: 4.8,
        reviews: 1100,
        category: "lifestyle",
        sizes: [6, 7, 8, 9, 10],
        colors: [
            { name: "Pink", hex: "#ec4899" },
            { name: "White", hex: "#ffffff" }
        ],
        images: [
            "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1595461135849-bf08893fdc2c?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Surreal comfort with layered textures.",
        isNew: true,
        isVerified: true
    },
    {
        id: 514,
        name: "Nike Structure 25",
        price: 140,
        rating: 4.7,
        reviews: 450,
        category: "running",
        sizes: [8, 9, 10, 11, 12],
        colors: [
            { name: "Grey", hex: "#9ca3af" },
            { name: "Black", hex: "#111111" }
        ],
        images: [
            "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Stable support for long distance runs.",
        isNew: false,
        isVerified: true
    },
    {
        id: 515,
        name: "Nike SuperRep Go 3",
        price: 110,
        rating: 4.7,
        reviews: 620,
        category: "training",
        sizes: [7, 8, 9, 10, 11, 12],
        colors: [
            { name: "Orange", hex: "#ea580c" },
            { name: "Black", hex: "#111111" }
        ],
        images: [
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Built for movement and modern training.",
        isNew: true,
        isVerified: true
    },
    {
        id: 516,
        name: "Nike Invincible 3",
        price: 180,
        rating: 4.9,
        reviews: 380,
        category: "running",
        sizes: [6, 7, 8, 9, 10, 11],
        colors: [
            { name: "Purple", hex: "#9333ea" },
            { name: "Cyan", hex: "#06b6d4" }
        ],
        images: [
            "https://images.unsplash.com/photo-1603787081207-3f9ba04da11e?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1606225457115-9b0de873c5db?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Maximalist cushion for your easiest runs.",
        isNew: true,
        isVerified: false,
        lastAction: "add"
    },
    {
        id: 517,
        name: "Nike Zoom Fly 5",
        price: 170,
        rating: 4.8,
        reviews: 540,
        category: "running",
        sizes: [7, 8, 9, 10, 11],
        colors: [
            { name: "Yellow", hex: "#facc15" },
            { name: "Orange", hex: "#f97316" }
        ],
        images: [
            "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Bridge the gap between training and racing.",
        isNew: true,
        isVerified: true
    },
    {
        id: 518,
        name: "Nike Air Max 90",
        price: 130,
        rating: 4.9,
        reviews: 4200,
        category: "lifestyle",
        sizes: [6, 7, 8, 9, 10, 11, 12],
        colors: [
            { name: "Infrared", hex: "#ef4444" },
            { name: "Blue", hex: "#3b82f6" }
        ],
        images: [
            "https://images.unsplash.com/photo-1502476508931-bdb13feba2e6?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1588117223087-59529397904e?auto=format&fit=crop&q=80&w=800"
        ],
        description: "A cultural icon with timeless design.",
        isNew: false,
        isVerified: true
    },
    {
        id: 519,
        name: "Nike Pegasus Turbo",
        price: 150,
        rating: 4.8,
        reviews: 670,
        category: "running",
        sizes: [8, 9, 10, 11, 12],
        colors: [
            { name: "Black/Gold", hex: "#fbbf24" },
            { name: "White/Blue", hex: "#60a5fa" }
        ],
        images: [
            "https://images.unsplash.com/photo-1579338908476-3a3a1d71a706?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1582260613203-d02996d9333a?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Lightweight and fast for daily speed work.",
        isNew: true,
        isVerified: true
    },
    {
        id: 520,
        name: "Nike React Miler 3",
        price: 130,
        rating: 4.7,
        reviews: 290,
        category: "running",
        sizes: [7, 8, 9, 10, 11],
        colors: [
            { name: "Black", hex: "#111111" },
            { name: "Grey", hex: "#9ca3af" }
        ],
        images: [
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Stability and cushion for long runs.",
        isNew: false,
        isVerified: true
    },
    {
        id: 521,
        name: "Nike Air Zoom Alphafly",
        price: 275,
        rating: 5.0,
        reviews: 120,
        category: "running",
        sizes: [7, 8, 9, 10, 11, 12],
        colors: [
            { name: "Electric Green", hex: "#4ade80" },
            { name: "Orange", hex: "#f97316" }
        ],
        images: [
            "https://images.unsplash.com/photo-1580931062319-38b47fb59f81?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1579338908476-3a3a1d71a706?auto=format&fit=crop&q=80&w=800"
        ],
        description: "The pinnacle of racing technology.",
        isNew: true,
        isVerified: true
    },
    {
        id: 522,
        name: "Nike Killshot 2",
        price: 90,
        rating: 4.9,
        reviews: 5800,
        category: "lifestyle",
        sizes: [6, 7, 8, 9, 10, 11, 12, 13],
        colors: [
            { name: "Navy", hex: "#1e3a8a" },
            { name: "Green", hex: "#166534" }
        ],
        images: [
            "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&q=80&w=800"
        ],
        description: "A low-profile tennis classic for everyday wear.",
        isNew: false,
        isVerified: true
    }
];

async function seed() {
    console.log("Seeding massive Nike collection (22 models)...");
    for (const product of massiveProducts) {
        console.log(`Adding: ${product.name}`);
        const productRef = doc(db, "products", product.id.toString());
        await setDoc(productRef, {
            ...product,
            createdAt: new Date().toISOString()
        });
    }
    console.log("Massive seeding complete.");
}

seed().then(() => process.exit(0)).catch(err => {
    console.error("SEEDING FAILED:");
    console.error(err);
    if (err.code) console.error("Error Code:", err.code);
    if (err.message) console.error("Error Message:", err.message);
    process.exit(1);
});
