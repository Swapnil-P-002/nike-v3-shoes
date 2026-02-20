import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface SocialLink {
    iconName: string;
    href: string;
    label: string;
}

export const settingsService = {
    async getSocialLinks() {
        try {
            const docRef = doc(db, "settings", "socials");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data().links as SocialLink[];
            }
            return null;
        } catch (error) {
            console.error("Error fetching social links:", error);
            return null;
        }
    },

    async updateSocialLinks(links: SocialLink[]) {
        try {
            const docRef = doc(db, "settings", "socials");
            await setDoc(docRef, { links }, { merge: true });
            return true;
        } catch (error) {
            console.error("Error updating social links:", error);
            return false;
        }
    }
};
