import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, X, Mic, MicOff, Volume2, VolumeX, MessageSquare, Loader2, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { geminiService, SupportedLanguage, LANGUAGE_CONFIG } from "@/services/geminiService";
import { speechService } from "@/services/speechService";

interface Message {
    id: string;
    sender: "user" | "bot";
    text: string;
    timestamp: Date;
}

type ChatMode = "text" | "voice";

// Memoized Message Component to prevent lag during typing
const ChatMessage = memo(({ msg }: { msg: Message }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
    >
        <div
            className={`max-w-[90%] md:max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.sender === "user"
                ? "bg-violet-600 text-white rounded-br-none"
                : "bg-zinc-900 md:bg-zinc-800 text-zinc-100 rounded-bl-none border border-zinc-800 md:border-zinc-700/50"
                }`}
        >
            {msg.text}
        </div>
    </motion.div>
));

ChatMessage.displayName = "ChatMessage";

export function ChatBot({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // State
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<ChatMode>("text");
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [language, setLanguage] = useState<SupportedLanguage>("en");
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [retryStatus, setRetryStatus] = useState<{ attempt: number; total: number } | null>(null);
    const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
    const [pendingFilter, setPendingFilter] = useState<any>(null);
    const [voiceGender, setVoiceGender] = useState<"male" | "female">("female");

    // Initialize gender preference
    useEffect(() => {
        setVoiceGender(speechService.getVoiceGender());
    }, []);

    // Initialize with greeting if empty
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            geminiService.resetConversation();
            geminiService.setLanguage(language);
            speechService.setLanguage(LANGUAGE_CONFIG[language].speechCode);
            setMessages([{
                id: "1",
                sender: "bot",
                text: geminiService.getGreeting(),
                timestamp: new Date(),
            }]);
        }
    }, [isOpen, language, messages.length]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (isOpen && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [messages, isOpen]);

    // Memoized Intent Detection
    const isAffirmative = useCallback((text: string) => {
        const cleanText = text.toLowerCase().trim()
            .replace(/[^a-z0-9\u0900-\u097F\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        const keywords = [
            "yes", "yeah", "yep", "yup", "sure", "show", "show me", "show them", "them", "go", "proceed", "okay", "ok", "done", "please", "cool", "fine", "let s",
            "ha", "haan", "han", "dikhao", "dekhao", "theek", "theek hai", "chalega", "dikhav", "dekho", "dekhao mujhe", "hau",
            "ho", "dakhva", "baghaycha", "daakhva", "daakhiv", "disav", "kar", "dakhiv", "bagha", " दाखवा"
        ];

        const words = cleanText.split(" ");
        return keywords.some(keyword => {
            const lowerKeyword = keyword.toLowerCase().trim();
            return cleanText === lowerKeyword ||
                words.includes(lowerKeyword) ||
                (lowerKeyword.includes(" ") && cleanText.includes(lowerKeyword));
        });
    }, []);

    // Memoized Message Sender
    const handleSendMessage = useCallback(async (text?: string) => {
        const messageText = text || inputValue.trim();
        if (!messageText || isLoading) return;

        const isManualRetry = !!text && messages.length > 0 && messages[messages.length - 1].sender === "bot";

        if (!isManualRetry) {
            setMessages((prev) => [...prev, {
                id: Date.now().toString(),
                sender: "user",
                text: messageText,
                timestamp: new Date(),
            }]);
            setInputValue("");
        }

        // Focus back on input immediately after sending
        inputRef.current?.focus();

        // Navigation Check
        if (pendingFilter && isAffirmative(messageText)) {
            const filter = pendingFilter;
            const params = new URLSearchParams();
            params.set("q", "shoes");
            if (filter.category) params.set("category", filter.category);
            if (filter.maxPrice) params.set("maxPrice", filter.maxPrice.toString());
            if (filter.gender) params.set("gender", filter.gender);
            if (filter.color) params.set("color", Array.isArray(filter.color) ? filter.color.join(",") : filter.color);

            navigate(`/shop?${params.toString()}`);
            window.scrollTo({ top: 0, behavior: "smooth" });
            setPendingFilter(null);
            onClose();
            return;
        }

        if (!isManualRetry && !isAffirmative(messageText)) {
            setPendingFilter(null);
        }

        setIsLoading(true);
        try {
            const { response, filter } = await geminiService.chat(
                messageText,
                (attempt, total) => setRetryStatus({ attempt, total })
            );

            if (filter && Object.keys(filter).length > 0) setPendingFilter(filter);
            else setPendingFilter(null);

            setMessages((prev) => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: "bot",
                text: response,
                timestamp: new Date(),
            }]);

            if (mode === "voice") {
                speechService.speak(response, () => setIsSpeaking(false));
                setIsSpeaking(true);
            }
        } catch (error: any) {
            setLastFailedMessage(messageText);
            setMessages((prev) => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: "bot",
                text: error.message || "Sorry, I had trouble processing that.",
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
            setRetryStatus(null);
            // Ensure focus after loading finishes too
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [inputValue, isLoading, messages, mode, pendingFilter, isAffirmative, navigate, onClose]);

    // Use latest handler ref for speech callbacks
    const handleSendMessageRef = useRef(handleSendMessage);
    useEffect(() => { handleSendMessageRef.current = handleSendMessage; }, [handleSendMessage]);

    const handleLanguageChange = useCallback((newLang: SupportedLanguage) => {
        setLanguage(newLang);
        geminiService.setLanguage(newLang);
        speechService.setLanguage(LANGUAGE_CONFIG[newLang].speechCode);
        setShowLanguageMenu(false);
        geminiService.resetConversation();
        setMessages([{
            id: Date.now().toString(),
            sender: "bot",
            text: geminiService.getGreeting(),
            timestamp: new Date(),
        }]);
    }, []);

    const handleGenderChange = useCallback((gender: "male" | "female") => {
        setVoiceGender(gender);
        speechService.setVoiceGender(gender);
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) speechService.stopListening();
        else speechService.startListening();
    }, [isListening]);

    const toggleSpeaking = useCallback(() => {
        if (isSpeaking) {
            speechService.stopSpeaking();
            setIsSpeaking(false);
        }
    }, [isSpeaking]);

    const speakLastMessage = () => {
        const lastBotMessage = [...messages].reverse().find(m => m.sender === "bot");
        if (lastBotMessage) {
            speechService.speak(lastBotMessage.text, () => setIsSpeaking(false));
            setIsSpeaking(true);
        }
    };

    // Effects
    useEffect(() => {
        speechService.setCallbacks({
            onResult: (transcript) => {
                const sanitized = transcript.replace(/\.$/, "").trim();
                setInputValue(sanitized);
                if (mode === "voice") handleSendMessageRef.current(sanitized);
            },
            onStart: () => setIsListening(true),
            onEnd: () => setIsListening(false),
            onError: (err) => { setIsListening(false); console.error(err); }
        });
        return () => { speechService.stopSpeaking(); speechService.stopListening(); };
    }, [mode]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        e.stopPropagation();
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none"
                    />

                    <motion.div
                        ref={panelRef}
                        initial={{ opacity: 0, y: 30, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.98 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onKeyDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        className="fixed top-0 left-0 w-full h-[calc(100dvh-230px)] md:h-[85vh]
                                   md:inset-auto md:top-8 md:right-8
                                   md:w-[450px] md:max-h-[800px]
                                   bg-zinc-950 md:bg-zinc-900
                                   border-x-0 border-t-0 md:border border-zinc-800
                                   rounded-b-[3.5rem] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-[100]"
                    >
                        {/* Header */}
                        <div className="relative z-20 flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-xl">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-heading font-extrabold text-xs tracking-tight text-white">STORM AI</h3>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                                        className="h-8 px-2.5 gap-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 rounded-lg"
                                    >
                                        <Globe className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase">{language}</span>
                                    </Button>

                                    <AnimatePresence>
                                        {showLanguageMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 top-full mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-[110] min-w-[140px]"
                                            >
                                                {(Object.keys(LANGUAGE_CONFIG) as SupportedLanguage[]).map((lang) => (
                                                    <button
                                                        key={lang}
                                                        onClick={() => handleLanguageChange(lang)}
                                                        className={`w-full px-4 py-3 text-left text-[10px] font-black tracking-widest transition-colors flex items-center justify-between
                                                            ${language === lang ? "bg-violet-600 text-white" : "text-zinc-300 hover:bg-zinc-700"}`}
                                                    >
                                                        {LANGUAGE_CONFIG[lang].nativeName.toUpperCase()}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="flex items-center bg-zinc-800 border border-zinc-800 rounded-lg p-0.5">
                                    <button
                                        onClick={() => handleGenderChange("female")}
                                        className={`px-2 py-1 text-[9px] uppercase font-black rounded-md transition-all ${voiceGender === "female" ? "bg-violet-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                                    >
                                        F
                                    </button>
                                    <button
                                        onClick={() => handleGenderChange("male")}
                                        className={`px-2 py-1 text-[9px] uppercase font-black rounded-md transition-all ${voiceGender === "male" ? "bg-violet-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                                    >
                                        M
                                    </button>
                                </div>

                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={onClose}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Mode Select */}
                        <div className="flex p-2 gap-2 bg-zinc-950/50 border-b border-zinc-900">
                            <button
                                onClick={() => setMode("text")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${mode === "text" ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"}`}
                            >
                                <MessageSquare className="w-3.5 h-3.5" /> TEXT
                            </button>
                            <button
                                onClick={() => setMode("voice")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${mode === "voice" ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"}`}
                            >
                                <Mic className="w-3.5 h-3.5" /> VOICE
                            </button>
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="flex flex-col gap-4">
                                {messages.map((msg) => (
                                    <ChatMessage key={msg.id} msg={msg} />
                                ))}
                                {isLoading && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                        <div className="bg-zinc-900 text-zinc-500 rounded-2xl px-4 py-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-zinc-800">
                                            <Loader2 className="w-3 h-3 animate-spin text-violet-500" />
                                            {retryStatus ? `Retrying...` : "Thinking..."}
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 border-t border-zinc-900 bg-zinc-950/95 backdrop-blur-xl">
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-2 items-center">
                                    <div className="flex-1 relative">
                                        <Input
                                            ref={inputRef}
                                            placeholder="Type a message..."
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            disabled={isLoading}
                                            className="bg-zinc-900 border-zinc-800 text-white h-11 px-4 rounded-xl focus-visible:ring-violet-600 pr-10 text-xs"
                                        />
                                        <button
                                            onClick={isSpeaking ? toggleSpeaking : speakLastMessage}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-violet-500 transition-colors"
                                        >
                                            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <Button
                                        size="icon"
                                        onClick={() => handleSendMessage()}
                                        disabled={!inputValue.trim() || isLoading}
                                        className="h-11 w-11 rounded-xl bg-violet-600 hover:bg-violet-700 shrink-0 shadow-lg shadow-violet-600/20"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>

                                {mode === "voice" && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center pt-2">
                                        <div className="flex items-center gap-4">
                                            {isSpeaking && (
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={toggleSpeaking}
                                                    className="h-12 w-12 rounded-full border-zinc-800 text-zinc-500 hover:text-white"
                                                >
                                                    <VolumeX className="w-5 h-5" />
                                                </Button>
                                            )}
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={toggleListening}
                                                disabled={isLoading}
                                                className={`h-16 w-16 rounded-full flex items-center justify-center transition-all shadow-xl ${isListening ? "bg-red-500 animate-pulse shadow-red-500/20" : "bg-violet-600 shadow-violet-500/20"}`}
                                            >
                                                {isListening ? <MicOff className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-white" />}
                                            </motion.button>
                                        </div>
                                        <span className="mt-3 text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] leading-none">
                                            {isListening ? "Listening" : "Tap Mic"}
                                        </span>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
