// Speech Recognition and Text-to-Speech Service
// Uses Web Speech API (browser built-in, no external dependencies)

export interface SpeechServiceCallbacks {
    onResult?: (transcript: string) => void;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
}

class SpeechService {
    private recognition: SpeechRecognition | null = null;
    private synthesis: SpeechSynthesis | null = null;
    private isListening: boolean = false;
    private callbacks: SpeechServiceCallbacks = {};
    private currentLang: string = "en-US";
    private voices: SpeechSynthesisVoice[] = [];
    private preferredGender: "male" | "female" = "female";

    constructor() {
        // ... (constructor code remains same but including it for context)
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = false;
                this.recognition.interimResults = false;
                this.recognition.lang = this.currentLang;

                this.recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    this.callbacks.onResult?.(transcript);
                };

                this.recognition.onstart = () => {
                    this.isListening = true;
                    this.callbacks.onStart?.();
                };

                this.recognition.onend = () => {
                    this.isListening = false;
                    this.callbacks.onEnd?.();
                };

                this.recognition.onerror = (event) => {
                    this.isListening = false;
                    this.callbacks.onError?.(event.error);
                };
            }

            this.synthesis = window.speechSynthesis;

            // Pre-load voices
            if (this.synthesis) {
                this.loadVoices();
                if (this.synthesis.onvoiceschanged !== undefined) {
                    this.synthesis.onvoiceschanged = () => this.loadVoices();
                }
            }

            // Load saved gender preference
            const savedGender = localStorage.getItem("storm_ai_voice_gender");
            if (savedGender === "male" || savedGender === "female") {
                this.preferredGender = savedGender;
            }
        }
    }

    private loadVoices() {
        if (!this.synthesis) return;
        this.voices = this.synthesis.getVoices();
        if (this.voices.length > 0) {
            console.log(`[Speech] ${this.voices.length} voices loaded.`);
            const enVoices = this.voices.filter(v => v.lang.includes("en"));
            console.log("[Speech] English voices available:", enVoices.map(v => v.name));
        }
    }

    setVoiceGender(gender: "male" | "female") {
        this.preferredGender = gender;
        localStorage.setItem("storm_ai_voice_gender", gender);
        console.log(`[Speech] Voice gender set to: ${gender}`);
    }

    getVoiceGender(): "male" | "female" {
        return this.preferredGender;
    }

    // Set language for speech recognition and synthesis
    setLanguage(langCode: string) {
        this.currentLang = langCode;
        if (this.recognition) {
            this.recognition.lang = langCode;
        }
        console.log("[Speech] Language set to:", langCode);
    }

    getLanguage(): string {
        return this.currentLang;
    }

    // Check if speech recognition is supported
    isRecognitionSupported(): boolean {
        return this.recognition !== null;
    }

    // Check if text-to-speech is supported
    isSynthesisSupported(): boolean {
        return this.synthesis !== null;
    }

    // Set callbacks for speech events
    setCallbacks(callbacks: SpeechServiceCallbacks) {
        this.callbacks = callbacks;
    }

    // Start listening for voice input
    startListening(): boolean {
        if (!this.recognition) {
            console.error("Speech recognition not supported");
            return false;
        }

        if (this.isListening) {
            return false;
        }

        try {
            this.recognition.start();
            return true;
        } catch (error) {
            console.error("Failed to start speech recognition:", error);
            return false;
        }
    }

    // Stop listening
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    // Get current listening state
    getIsListening(): boolean {
        return this.isListening;
    }

    // Speak text aloud
    speak(text: string, onEnd?: () => void): boolean {
        if (!this.synthesis) {
            console.error("Speech synthesis not supported");
            return false;
        }

        // Cancel any ongoing speech
        this.synthesis.cancel();

        // If voices aren't loaded yet, try one last time
        if (this.voices.length === 0) {
            this.voices = this.synthesis.getVoices();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.45; // Slightly faster for responsiveness
        utterance.pitch = this.preferredGender === "female" ? 1.1 : 0.95; // Tune pitch based on gender
        utterance.volume = 1.0;
        utterance.lang = this.currentLang;

        const langPrefix = this.currentLang.split("-")[0].toLowerCase();
        const langVoices = this.voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix));

        // 1. Known high-quality Female names
        const femaleNames = [
            "Samantha", "Zira", "Heera", "Kalpana", "Aria", "Jenny", "Linda",
            "Google US English", "Google UK English Female", "Premium", "Neural", "Natural", "Assistant", "Siri", "Sora"
        ];

        // 2. Explicitly MALE names to EXCLUDE or INCLUDE
        const maleNames = ["David", "Mark", "Pawan", "Ravi", "Hemant", "Microsoft David", "Microsoft Mark", "Google UK English Male", "Guy", "Man"];

        let preferredVoice;

        if (this.preferredGender === "female") {
            // Search for HIGH QUALITY Female
            preferredVoice = langVoices.find(v =>
                femaleNames.some(name => v.name.includes(name)) &&
                !maleNames.some(name => v.name.includes(name))
            );

            // Fallback to any non-male
            if (!preferredVoice) {
                preferredVoice = langVoices.find(v => !maleNames.some(name => v.name.includes(name)));
            }
        } else {
            // Search for HIGH QUALITY Male
            preferredVoice = langVoices.find(v =>
                maleNames.some(name => v.name.includes(name))
            );

            // Fallback to anything that isn't specifically female
            if (!preferredVoice) {
                preferredVoice = langVoices.find(v => !femaleNames.some(name => v.name.includes(name)));
            }
        }

        // Extreme fallback (First available voice for that language)
        if (!preferredVoice && langVoices.length > 0) {
            preferredVoice = langVoices[0];
        }

        if (preferredVoice) {
            console.log(`[Speech] Speaking with: ${preferredVoice.name} (${preferredVoice.lang}) - Gender: ${this.preferredGender}`);
            utterance.voice = preferredVoice;
        }

        if (onEnd) {
            utterance.onend = onEnd;
        }

        this.synthesis.speak(utterance);
        return true;
    }

    // Stop speaking
    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }

    // Check if currently speaking
    isSpeaking(): boolean {
        return this.synthesis?.speaking || false;
    }
}

// Singleton instance
export const speechService = new SpeechService();
