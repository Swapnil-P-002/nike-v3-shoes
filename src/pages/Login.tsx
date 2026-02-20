import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// Login schema
const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// Signup schema
const signupSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

const Login = () => {
    const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login, signup } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as { from?: string })?.from || "/";

    const loginForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const signupForm = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onLoginSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError(null);

        const result = await login(data.email, data.password);

        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.error || "Login failed");
        }

        setIsLoading(false);
    };

    const onSignupSubmit = async (data: SignupFormData) => {
        setIsLoading(true);
        setError(null);

        const result = await signup(data.name, data.email, data.password);

        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.error || "Signup failed");
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
                    <div className="w-12 h-12 bg-primary rounded-sm flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
                        <span className="text-primary-foreground font-heading font-bold text-2xl">S</span>
                    </div>
                    <span className="font-heading text-3xl font-bold tracking-tight">STORM</span>
                </Link>

                <Card className="backdrop-blur-md bg-background/95 border-border shadow-2xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
                        <CardDescription className="text-center">
                            Sign in to your account or create a new one
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            </TabsList>

                            {/* Login Form */}
                            <TabsContent value="login">
                                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                                    {error && (
                                        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">Email</Label>
                                        <Input
                                            id="login-email"
                                            type="email"
                                            placeholder="your@email.com"
                                            {...loginForm.register("email")}
                                        />
                                        {loginForm.formState.errors.email && (
                                            <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">Password</Label>
                                        <Input
                                            id="login-password"
                                            type="password"
                                            placeholder="••••••••"
                                            {...loginForm.register("password")}
                                        />
                                        {loginForm.formState.errors.password && (
                                            <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                                        )}
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Logging in...
                                            </>
                                        ) : (
                                            "Login"
                                        )}
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* Signup Form */}
                            <TabsContent value="signup">
                                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                                    {error && (
                                        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-name">Full Name</Label>
                                        <Input
                                            id="signup-name"
                                            type="text"
                                            placeholder="John Doe"
                                            {...signupForm.register("name")}
                                        />
                                        {signupForm.formState.errors.name && (
                                            <p className="text-sm text-destructive">{signupForm.formState.errors.name.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            placeholder="your@email.com"
                                            {...signupForm.register("email")}
                                        />
                                        {signupForm.formState.errors.email && (
                                            <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Password</Label>
                                        <Input
                                            id="signup-password"
                                            type="password"
                                            placeholder="••••••••"
                                            {...signupForm.register("password")}
                                        />
                                        {signupForm.formState.errors.password && (
                                            <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-confirm">Confirm Password</Label>
                                        <Input
                                            id="signup-confirm"
                                            type="password"
                                            placeholder="••••••••"
                                            {...signupForm.register("confirmPassword")}
                                        />
                                        {signupForm.formState.errors.confirmPassword && (
                                            <p className="text-sm text-destructive">
                                                {signupForm.formState.errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating account...
                                            </>
                                        ) : (
                                            "Sign Up"
                                        )}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground mt-4">
                    By continuing, you agree to our{" "}
                    <Link to="/about" className="underline hover:text-foreground">
                        Terms of Service
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
