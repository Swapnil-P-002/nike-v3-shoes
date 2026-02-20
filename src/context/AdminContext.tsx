import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface AdminContextType {
    isAdmin: boolean;
    isOwner: boolean;
    verifyAdmin: (pass: string) => boolean;
    logoutAdmin: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    const verifyAdmin = (pass: string) => {
        const p = pass.trim().toLowerCase();
        if (p === "swapnilpatil") {
            setIsAdmin(true);
            setIsOwner(true);
            toast({
                title: "Login Successful",
                description: "Status: MASTER OWNER - All privileges granted."
            });
            return true;
        }
        if (p === "swapnil") {
            setIsAdmin(true);
            setIsOwner(false);
            toast({
                title: "Login Successful",
                description: "Status: STAFF ADMIN - Product creation only."
            });
            return true;
        }
        toast({
            title: "Access Denied",
            description: "Invalid passkey. Access block active.",
            variant: "destructive"
        });
        return false;
    };

    const logoutAdmin = () => {
        setIsAdmin(false);
        setIsOwner(false);
        toast({ title: "Session Ended", description: "Management privileges revoked." });
    };

    return (
        <AdminContext.Provider value={{ isAdmin, isOwner, verifyAdmin, logoutAdmin }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
};
