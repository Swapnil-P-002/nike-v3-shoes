import { User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface UserAvatarProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const UserAvatar = ({ size = "md", className = "" }: UserAvatarProps) => {
    const { user, isAuthenticated } = useAuth();

    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-9 h-9 text-sm",
        lg: "w-16 h-16 text-2xl",
    };

    const getInitials = (name: string): string => {
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getAvatarColor = (name: string): string => {
        const colors = [
            "bg-gradient-to-br from-blue-500 to-blue-600",
            "bg-gradient-to-br from-purple-500 to-purple-600",
            "bg-gradient-to-br from-green-500 to-green-600",
            "bg-gradient-to-br from-orange-500 to-orange-600",
            "bg-gradient-to-br from-pink-500 to-pink-600",
            "bg-gradient-to-br from-red-500 to-red-600",
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    if (!isAuthenticated || !user) {
        // Default placeholder icon
        return (
            <div
                className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center ${className}`}
            >
                <img
                    src="/assets/images/user-image.png"
                    alt="User"
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    // User is logged in
    if (user.profilePicture) {
        // Show profile picture
        return (
            <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
                <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    // Show initials with colored background
    return (
        <div
            className={`${sizeClasses[size]} rounded-full ${getAvatarColor(
                user.name
            )} flex items-center justify-center text-white font-semibold ${className}`}
        >
            {getInitials(user.name)}
        </div>
    );
};

export default UserAvatar;
