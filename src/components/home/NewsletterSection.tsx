import { Mail, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "subscribers"), {
        email: email.toLowerCase(),
        subscribedAt: serverTimestamp(),
        source: "NewsletterSection"
      });

      setIsSubscribed(true);
      toast({
        title: "Successfully subscribed!",
        description: "You'll be the first to know about new drops.",
      });
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-accent-foreground" />
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            BE THE FIRST TO KNOW
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Get exclusive access to new drops, special offers, and insider-only content
            delivered straight to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 bg-background border-border"
              required
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`h-12 px-8 font-semibold transition-all ${isSubscribed
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-primary hover:bg-primary/90"
                }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSubscribed ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  SUBSCRIBED
                </>
              ) : (
                "SUBSCRIBE"
              )}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive updates.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
