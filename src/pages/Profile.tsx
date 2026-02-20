import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import WishlistSidebar from "@/components/wishlist/WishlistSidebar";
import { useWishlist } from "@/context/WishlistContext";
import UserAvatar from "@/components/profile/UserAvatar";
import { Camera, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
    const { user, updateProfile, logout } = useAuth();
    const { isWishlistOpen, setIsWishlistOpen } = useWishlist();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
    });
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        try {
            await updateProfile(formData);
            setIsEditing(false);
            toast({
                title: "Profile updated",
                description: "Your profile has been successfully updated.",
            });
        } catch (error) {
            toast({
                title: "Update failed",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            address: user?.address || "",
        });
        setIsEditing(false);
    };

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    await updateProfile({ profilePicture: reader.result as string });
                    toast({
                        title: "Profile picture updated",
                        description: "Your profile picture has been successfully updated.",
                    });
                } catch (error) {
                    toast({
                        title: "Upload failed",
                        description: "Failed to update profile picture.",
                        variant: "destructive",
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <CartSidebar />
            <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />

            <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">My Profile</h1>
                        <p className="text-muted-foreground">Manage your personal information and preferences</p>
                    </div>

                    {/* Profile Card */}
                    <Card className="mb-6">
                        <CardHeader>
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                                {/* Profile Picture */}
                                <div className="relative">
                                    <UserAvatar size="lg" />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center hover:bg-accent/90 transition-colors shadow-lg"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleProfilePictureChange}
                                    />
                                </div>

                                {/* Name and Email */}
                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                                    <p className="text-muted-foreground mb-4">{user.email}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Member since {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Edit Button */}
                                {!isEditing && (
                                    <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                                        <Edit className="h-4 w-4" />
                                        Edit Profile
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Information Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    {isEditing ? (
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-sm text-foreground py-2">{user.name || "Not provided"}</p>
                                    )}
                                </div>

                                <Separator />

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    {isEditing ? (
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-sm text-foreground py-2">{user.email}</p>
                                    )}
                                </div>

                                <Separator />

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    {isEditing ? (
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="(123) 456-7890"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-sm text-foreground py-2">{user.phone || "Not provided"}</p>
                                    )}
                                </div>

                                <Separator />

                                {/* Address */}
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    {isEditing ? (
                                        <Input
                                            id="address"
                                            placeholder="123 Main St, City, State, ZIP"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-sm text-foreground py-2">{user.address || "Not provided"}</p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {isEditing && (
                                <div className="flex gap-3 pt-4">
                                    <Button onClick={handleSave} className="flex-1 gap-2">
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </Button>
                                    <Button onClick={handleCancel} variant="outline" className="flex-1 gap-2">
                                        <X className="h-4 w-4" />
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Logout Button */}
                    <div className="mt-8 text-center">
                        <Button
                            onClick={logout}
                            variant="destructive"
                            className="min-w-[200px]"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Profile;
