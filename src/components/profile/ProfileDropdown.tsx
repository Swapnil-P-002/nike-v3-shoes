import { Link } from "react-router-dom";
import { User, Package, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";

interface ProfileDropdownProps {
    onClose: () => void;
}

const ProfileDropdown = ({ onClose }: ProfileDropdownProps) => {
    const { logout, user } = useAuth();
    const { theme, setTheme } = useTheme();

    const handleLogout = () => {
        logout();
        onClose();
    };

    const menuItems = [
        {
            icon: User,
            label: "My Profile",
            to: "/profile",
        },
        {
            icon: Package,
            label: "My Orders",
            to: "/orders",
        },
    ];

    return (
        <div className="absolute right-0 top-full mt-2 w-56 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl animate-fade-in overflow-hidden z-50">
            {/* User Info */}
            {user && (
                <div className="px-5 py-4 border-b border-border bg-secondary/30">
                    <p className="font-bold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
            )}

            {/* Menu Items */}
            <div className="py-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-secondary transition-all duration-200 group"
                    >
                        <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                        <span className="text-sm font-semibold">{item.label}</span>
                    </Link>
                ))}
            </div>

            {/* Theme Selection - Added below Orders */}
            <div className="px-2 pb-2">
                <div className="p-1 bg-secondary/50 rounded-lg flex gap-1">
                    <button
                        onClick={() => setTheme("light")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all duration-300 ${theme === "light"
                            ? "bg-background text-foreground shadow-sm scale-[1.02]"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            }`}
                    >
                        <Sun className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Light</span>
                    </button>
                    <button
                        onClick={() => setTheme("dark")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all duration-300 ${theme === "dark"
                            ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/20"
                            }`}
                    >
                        <Moon className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Dark</span>
                    </button>
                </div>
            </div>

            {/* Logout */}
            <div className="border-t border-border">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 text-left group"
                >
                    <LogOut className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                    <span className="text-sm font-bold">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default ProfileDropdown;
