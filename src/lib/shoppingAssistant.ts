export type Intent = "PRODUCT_SEARCH" | "BUDGET_FILTER" | "RECOMMENDATION" | "STYLE_PREFERENCE" | "UNKNOWN";

export interface Entities {
    productType: string | null;
    category: string | null;
    maxPrice: number | null;
    gender: string | null;
    size: string | null;
    style: string | null;
}

export interface SearchFilter {
    productType: string | null;
    category: string | null;
    maxPrice: number | null;
    gender: string | null;
    size: string | null;
    style: string | null;
}

export class ShoppingAssistant {
    private context: Entities;

    constructor() {
        this.context = {
            productType: null,
            category: null,
            maxPrice: null,
            gender: null,
            size: null,
            style: null,
        };
    }

    // 1. Detect Intent
    public detectIntent(message: string): Intent {
        const lowerMsg = message.toLowerCase();

        // Recommendation keywords
        if (
            lowerMsg.includes("suggest") ||
            lowerMsg.includes("recommend") ||
            lowerMsg.includes("what should i") ||
            lowerMsg.includes("best for")
        ) {
            return "RECOMMENDATION";
        }

        // Budget keywords
        if (
            lowerMsg.includes("under") ||
            lowerMsg.includes("below") ||
            lowerMsg.includes("cheap") ||
            lowerMsg.includes("budget") ||
            lowerMsg.includes("price") ||
            /\d+/.test(lowerMsg) && (lowerMsg.includes("rs") || lowerMsg.includes("rupees") || lowerMsg.includes("₹"))
        ) {
            // If it also contains product identifiers, it might be a search, but usually user refining price is a filter
            // However, "Show me shoes under 2000" is PRODUCT_SEARCH with a budget entity.
            // But per prompt classification:
            // "Show me running shoes" -> SEARCH
            // "Under 3000" -> BUDGET_FILTER
            if (!this.hasProductKeywords(lowerMsg) && !this.hasCategoryKeywords(lowerMsg)) {
                return "BUDGET_FILTER";
            }
        }

        // Style keywords
        if (
            lowerMsg.includes("style") ||
            lowerMsg.includes("stylish") ||
            lowerMsg.includes("trendy") ||
            lowerMsg.includes("fashion") ||
            lowerMsg.includes("look")
        ) {
            // "Trendy but budget" -> STYLE_PREFERENCE (matches example)
            return "STYLE_PREFERENCE";
        }

        // Default to PRODUCT_SEARCH if it has identifying nouns or if unclear
        if (
            this.hasProductKeywords(lowerMsg) ||
            this.hasCategoryKeywords(lowerMsg) ||
            lowerMsg.includes("show") ||
            lowerMsg.includes("want") ||
            lowerMsg.includes("looking for")
        ) {
            return "PRODUCT_SEARCH";
        }

        // Fallback if we really don't know, but likely search if they are typing in a shopping bot
        return "PRODUCT_SEARCH";
    }

    // Helper: Check for basic product keywords
    private hasProductKeywords(msg: string): boolean {
        const keywords = ["shoe", "shoes", "hoodie", "jacket", "t-shirt", "top", "tee", "wear", "pants"];
        return keywords.some(k => msg.includes(k));
    }

    private hasCategoryKeywords(msg: string): boolean {
        const keywords = ["running", "gym", "casual", "sports", "training", "basketball", "walking"];
        return keywords.some(k => msg.includes(k));
    }

    // 2. Extract Entities
    public extractEntities(message: string): Entities {
        const lowerMsg = message.toLowerCase();
        const entities: Entities = {
            productType: null,
            category: null,
            maxPrice: null,
            gender: null,
            size: null,
            style: null,
        };

        // Product Type
        if (lowerMsg.includes("hoodie")) entities.productType = "hoodie";
        else if (lowerMsg.includes("jacket")) entities.productType = "jacket";
        else if (lowerMsg.includes("t-shirt") || lowerMsg.includes("tee")) entities.productType = "t-shirt";
        else if (lowerMsg.includes("shoe") || lowerMsg.includes("sneaker")) entities.productType = "shoes";

        // Category
        if (lowerMsg.includes("run")) entities.category = "running";
        else if (lowerMsg.includes("gym") || lowerMsg.includes("workout") || lowerMsg.includes("train")) entities.category = "gym";
        else if (lowerMsg.includes("casual")) entities.category = "casual";
        else if (lowerMsg.includes("sport") || lowerMsg.includes("basketball")) entities.category = "sports";

        // Max Price
        // Regex to find numbers after "under", "below" or just numbers with currency symbols
        // Matches: "under 2000", "below 500", "< 3000"
        const priceMatch = lowerMsg.match(/(?:under|below|less than|<\s*)\s?₹?(\d+)/);
        if (priceMatch) {
            entities.maxPrice = parseInt(priceMatch[1]);
        } else if (lowerMsg.includes("cheap")) {
            entities.maxPrice = 1500; // Assumed threshold for "cheap"
        }

        // Gender
        if (lowerMsg.includes("men") && !lowerMsg.includes("women")) entities.gender = "men";
        else if (lowerMsg.includes("women") || lowerMsg.includes("ladies")) entities.gender = "women";
        else if (lowerMsg.includes("unisex")) entities.gender = "unisex";
        // "man" / "woman" singular
        else if (lowerMsg.includes("man")) entities.gender = "men";
        else if (lowerMsg.includes("woman")) entities.gender = "women";

        // Size
        // Matches "size 8", "size 9.5", or standalone "8" if clearly in that range?
        // Let's stick to explicit "size X" or common size strings
        const sizeMatch = lowerMsg.match(/size\s?(\d+(?:\.\d+)?|m|l|xl|xxl|s)/);
        if (sizeMatch) {
            entities.size = sizeMatch[1].toUpperCase();
        } else {
            // standalone sizes S/M/L/XL check (careful with 'a' 'I' etc)
            const discreteSizeMatch = lowerMsg.match(/\b(small|medium|large|xl|xxl)\b/);
            if (discreteSizeMatch) {
                const map: Record<string, string> = { small: "S", medium: "M", large: "L" };
                entities.size = map[discreteSizeMatch[1]] || discreteSizeMatch[1].toUpperCase();
            }
        }

        // Style
        if (lowerMsg.includes("stylish")) entities.style = "stylish";
        else if (lowerMsg.includes("trendy")) entities.style = "trendy";
        else if (lowerMsg.includes("simple") || lowerMsg.includes("minimal")) entities.style = "simple";
        else if (lowerMsg.includes("sporty")) entities.style = "sporty";

        return entities;
    }

    // 3. Update Context & 4. Build Filter
    public processMessage(message: string): { intent: Intent; filter: SearchFilter; response: string } {
        const intent = this.detectIntent(message);
        const extracted = this.extractEntities(message);

        // Merge extracted entities into context
        // Only update fields that are present (not null) in the new message
        (Object.keys(extracted) as (keyof Entities)[]).forEach((key) => {
            if (extracted[key] !== null) {
                // @ts-ignore
                this.context[key] = extracted[key];
            }
        });

        const filter = this.buildSearchFilter();
        const response = this.generateResponse(intent, extracted);

        return { intent, filter, response };
    }

    public buildSearchFilter(): SearchFilter {
        return { ...this.context };
    }

    // 5. Generate Response
    public generateResponse(intent: Intent, recentEntities: Entities): string {
        const { productType, category, maxPrice, style, gender } = this.context;

        // Construct a noun phrase describing current context, e.g. "stylish running shoes"
        const adjectives = [style, category, gender === "men" ? "men's" : (gender === "women" ? "women's" : "")].filter(Boolean).join(" ");
        const noun = productType || "items";
        const productPhrase = `${adjectives} ${noun}`.trim();

        switch (intent) {
            case "PRODUCT_SEARCH":
                if (maxPrice) {
                    return `Here are some ${productPhrase} under ₹${maxPrice}.`;
                }
                return `Showing you ${productPhrase}.`;

            case "BUDGET_FILTER":
                if (maxPrice) {
                    return `Got it! Filtering for ${productPhrase} under ₹${maxPrice}.`;
                }
                return `I've updated the price filter for you.`;

            case "RECOMMENDATION":
                if (category === "gym") return `For the gym, I recommend these stable and breathable ${productType || "shoes"}.`;
                if (category === "running") return `These ${productType || "shoes"} offer the best cushioning for your runs.`;
                return `Based on your request, here are top recommendations for ${productPhrase}.`;

            case "STYLE_PREFERENCE":
                return `I've found some ${style} options for you. Check these out!`;

            default:
                return "I'm not sure what you're looking for. Could you try asking for shoes, hoodies, or a specific activity?";
        }
    }

    // Debug: Reset
    public resetContext() {
        this.context = {
            productType: null,
            category: null,
            maxPrice: null,
            gender: null,
            size: null,
            style: null,
        };
    }
}

/*
====================================================
🧪 5 EXAMPLE USER CONVERSATIONS
====================================================

SCENARIO 1: Basic Search Flow
User: "Show me running shoes"
System:
  - Intent: PRODUCT_SEARCH
  - Extracted: { productType: "shoes", category: "running" }
  - Context: { productType: "shoes", category: "running", ... }
  - Response: "Showing you running shoes."

User: "Under 3000"
System:
  - Intent: BUDGET_FILTER
  - Extracted: { maxPrice: 3000 }
  - Context: { productType: "shoes", category: "running", maxPrice: 3000, ... }
  - Response: "Got it! Filtering for running shoes under ₹3000."


SCENARIO 2: Specific Recommendation
User: "Suggest something for gym"
System:
  - Intent: RECOMMENDATION
  - Extracted: { category: "gym" }
  - Context: { category: "gym", ... }
  - Response: "For the gym, I recommend these stable and breathable items."

User: "I want men's hoodies"
System:
  - Intent: PRODUCT_SEARCH
  - Extracted: { productType: "hoodie", gender: "men" }
  - Context: { category: "gym", productType: "hoodie", gender: "men", ... } (Context merged!)
  - Response: "Showing you men's gym hoodies."


SCENARIO 3: Style & Budget
User: "I want something stylish"
System:
  - Intent: STYLE_PREFERENCE
  - Extracted: { style: "stylish" }
  - Response: "I've found some stylish options for you. Check these out!"

User: "But cheap options please"
System:
  - Intent: BUDGET_FILTER
  - Extracted: { maxPrice: 1500 }
  - Context: { style: "stylish", maxPrice: 1500, ... }
  - Response: "Got it! Filtering for stylish items under ₹1500."


SCENARIO 4: Full Details at Once
User: "Show me women's running shoes size 8 under 5000"
System:
  - Intent: PRODUCT_SEARCH
  - Extracted: { gender: "women", category: "running", productType: "shoes", size: "8", maxPrice: 5000 }
  - Context: { gender: "women", category: "running", productType: "shoes", size: "8", maxPrice: 5000 }
  - Response: "Here are some women's running shoes under ₹5000."


SCENARIO 5: Changing Context
User: "Show me jackets"
System:
  - Intent: PRODUCT_SEARCH
  - Extracted: { productType: "jacket" }
  - Response: "Showing you jackets."

User: "Actually, I want shoes"
System:
  - Intent: PRODUCT_SEARCH
  - Extracted: { productType: "shoes" }
  - Context: { productType: "shoes", ... } (Overwrites 'jacket')
  - Response: "Showing you shoes."
*/
