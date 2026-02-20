// Language configuration
export type SupportedLanguage = "en" | "hi" | "mr";

export const LANGUAGE_CONFIG: Record<SupportedLanguage, { name: string; nativeName: string; speechCode: string }> = {
    en: { name: "English", nativeName: "English", speechCode: "en-US" },
    hi: { name: "Hindi", nativeName: "हिंदी", speechCode: "hi-IN" },
    mr: { name: "Marathi", nativeName: "मराठी", speechCode: "mr-IN" }
};

// Current language state
let currentLanguage: SupportedLanguage = "en";

// Shopping assistant system prompts by language
const SYSTEM_PROMPTS: Record<SupportedLanguage, string> = {
    en: `You are STORM AI, a highly sophisticated, warm, and helpful shopping assistant for a premium footwear store, inspired by the conversational excellence of ChatGPT.

PERSONALITY:
- Warm, professional, and extremely helpful.
- Forgiving of typos—if the user writes "shos", "shoo", "blu", "runin", etc., understand their intent perfectly without correcting them unless necessary.
- High empathy: "I understand!", "Great choice!", "I'd love to help you find that!"

GUIDELINES:
- Greet users warmly.
- EXTREMELY BRIEF: Use only 1-2 sentences maximum. No long paragraphs.
- If the user makes a NEW request (e.g., "blue shoes" then "red shoes"), COMPLETELY OVERRIDE the old filters. Fresh intent = fresh search.
- When intent is clear:
  1. Ask "May I show you these options?" (or "Show me?")
  2. Proactively suggest refining by category (Running/Casual/Basketball), gender, or price range.
  Example: "I've found some stylish red sneakers! May I show them to you?"

PRODUCT DATA:
- Category: "running", "basketball", "casual"
- Price: $50 - $300
- AVAILABLE COLORS: "Black", "White", "Red", "Blue", "Gray", "Purple", "Green".
- NOT IN STOCK: "Orange", "Yellow", "Pink", "Gold", "Silver", "Brown", "Navy".

FILTER FORMAT (at the end of response if intent found):
###FILTER###{"category":"running","maxPrice":200,"color":["Red"]}###END###`,

    hi: `आप STORM AI हैं, जो एक प्रीमियम फुटवियर स्टोर के लिए एक अत्यंत परिष्कृत, शॉपिंग असिस्टेंट हैं।

व्यक्तित्व:
- मिलनसार और बहुत मददगार।
- टाइपिंग की गलतियों को माफ करें।

दिशानिर्देश:
- अत्यंत संक्षिप्त रहें: केवल 1-2 वाक्य ही बोलें।
- यदि उपयोगकर्ता कोई नया अनुरोध करता है, तो पुराने फ़िल्टर हटा दें।
- जब इरादा स्पष्ट हो: "क्या मैं आपको ये विकल्प दिखाऊँ?" पूछें।

फ़िल्टर प्रारूप:
###FILTER###{"category":"running","maxPrice":200,"color":["Red"]}###END###`,

    mr: `तुम्ही STORM AI आहात, एका प्रीमियम फुटवेअर स्टोअरसाठी शॉपिंग असिस्टंट आहात.

व्यक्तिमत्व:
- मैत्रीपूर्ण आणि अत्यंत उपयुक्त.
- टायपिंगमधील चुकांकडे दुर्लक्ष करा.

मार्गदर्शक तत्त्वे:
- अत्यंत थोडक्यात बोला: जास्तीत जास्त 1-2 वाक्येच बोला.
- जर युजरने नवीन विनंती केली, तर जुने फिल्टर काढून टाका.
- जेव्हा हेतू स्पष्ट असेल: "मी तुम्हाला हे पर्याय दाखवू का?" विचारा.

फिल्टर स्वरूप:
###FILTER###{"category":"running","maxPrice":200,"color":["Red"]}###END###`
};

// Greeting messages by language
const GREETING_MESSAGES: Record<SupportedLanguage, string> = {
    en: "Hey there! 👋 I'm your personal shopping assistant. Tell me what kind of shoes you're looking for, and I'll help you find the perfect pair!",
    hi: "नमस्ते! 👋 मैं आपका पर्सनल शॉपिंग असिस्टेंट हूं। मुझे बताइए कि आप किस तरह के जूते खोज रहे हैं, और मैं आपको सही जोड़ी खोजने में मदद करूंगा!",
    mr: "नमस्कार! 👋 मी तुमचा पर्सनल शॉपिंग असिस्टंट आहे. तुम्हाला कोणत्या प्रकारचे बूट हवे आहेत ते सांगा, आणि मी तुम्हाला योग्य जोडी शोधण्यात मदत करीन!"
};

// Conversation history for context
let conversationHistory: { role: "user" | "assistant" | "system"; content: string }[] = [];

// Helper for retries with exponential backoff
async function callWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 5,
    initialDelay: number = 2000,
    onRetry?: (attempt: number, total: number, delay: number) => void
): Promise<T> {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            // Log full error for debugging in browser console
            console.error(`[AI] Attempt ${i + 1} failed:`, {
                message: error.message,
                status: error.status,
                name: error.name
            });

            const isRateLimit = error.status === 429 ||
                error.message?.toLowerCase().includes("rate limit") ||
                error.message?.toLowerCase().includes("too many requests");

            const isServiceUnavailable = error.status === 503 ||
                error.status === 504 ||
                error.message?.toLowerCase().includes("overloaded") ||
                error.message?.toLowerCase().includes("unavailable");

            if ((isRateLimit || isServiceUnavailable) && i < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, i);
                console.warn(`[AI] ${isRateLimit ? 'Rate Limit' : 'Service Overloaded'}. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);

                if (onRetry) onRetry(i + 1, maxRetries, delay);

                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            throw error;
        }
    }

    throw lastError;
}

export const geminiService = {
    // Get/Set current language
    getLanguage(): SupportedLanguage {
        return currentLanguage;
    },

    setLanguage(lang: SupportedLanguage) {
        currentLanguage = lang;
        console.log("[AI] Language set to:", lang);
    },

    getLanguageConfig() {
        return LANGUAGE_CONFIG;
    },

    getGreeting(): string {
        return GREETING_MESSAGES[currentLanguage];
    },

    // Reset conversation
    resetConversation() {
        conversationHistory = [];
    },

    // Check if API key is configured (always returns true now — key lives on server)
    isConfigured(): boolean {
        return true;
    },

    // Send message to AI and get response
    async chat(userMessage: string, onRetry?: (attempt: number, total: number) => void): Promise<{ response: string; filter: any | null }> {
        try {
            console.log("[AI] Sending message via secure backend proxy...");

            const systemPrompt = SYSTEM_PROMPTS[currentLanguage];

            // Build full message set for Groq
            const messages = [
                { role: "system", content: systemPrompt },
                ...conversationHistory,
                { role: "user", content: userMessage }
            ];

            // Send to our secure backend
            const res = await callWithRetry(
                async () => {
                    const r = await fetch("/api/chat", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ messages }),
                    });
                    if (!r.ok) {
                        const err = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
                        const e: any = new Error(err.error || `HTTP ${r.status}`);
                        e.status = r.status;
                        throw e;
                    }
                    return r.json();
                },
                3,
                1000,
                (attempt, total) => { if (onRetry) onRetry(attempt, total); }
            );

            const responseText: string = res.response || "";
            console.log("[AI] Received response from proxy.");

            // Update conversation history
            conversationHistory.push({ role: "user", content: userMessage });
            conversationHistory.push({ role: "assistant", content: responseText });

            // Keep history manageable
            if (conversationHistory.length > 20) {
                conversationHistory = conversationHistory.slice(-20);
            }

            // Parse filter from response if present
            let filter = null;
            let cleanResponse = responseText;

            const filterMatch = responseText.match(/###FILTER###(.+?)###END###/);
            if (filterMatch) {
                try {
                    filter = JSON.parse(filterMatch[1]);
                    cleanResponse = responseText.replace(/###FILTER###.+?###END###/g, "").trim();
                    console.log("[AI] Extracted filter:", filter);
                } catch (e) {
                    console.log("[AI] Could not parse filter JSON");
                }
            }

            return { response: cleanResponse, filter };

        } catch (error: any) {
            console.error("[AI] Error:", error);

            if (error.status === 401 || error.message?.toLowerCase().includes("invalid api key")) {
                throw new Error("Invalid Groq API key. Please check your VITE_GROQ_API_KEY in the .env file.");
            }

            if (error.status === 429) {
                throw new Error("Groq API rate limit reached. Please try again in a few seconds.");
            }

            throw new Error(`I'm having trouble connecting right now. ${error.message || "Unknown error"}. Please try again.`);
        }
    }
};
