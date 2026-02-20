import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Product } from "@/data/products";
import { CheckCircle2, AlertTriangle, X, ArrowRight, RotateCcw, Edit } from "lucide-react";
import { useEffect } from "react";

interface ReviewChangesModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onVerify: (id: number) => Promise<void>;
    onReject: (id: number) => Promise<void>;
    onEdit: (product: Product) => void;
}

const ReviewChangesModal = ({ isOpen, onClose, product, onVerify, onReject, onEdit }: ReviewChangesModalProps) => {

    useEffect(() => {
        if (isOpen && product) {
            console.log("ReviewChangesModal: Opening for product", product.id);
        }
    }, [isOpen, product]);

    if (!product) return null;

    const isDelete = product.lastAction === "delete";
    const actionColor = isDelete ? "bg-red-500" : product.lastAction === "edit" ? "bg-amber-500" : "bg-green-500";
    const actionLabel = product.lastAction ? product.lastAction.toUpperCase() : "ADD";
    const prev = product.previousState;

    const handleVerify = async () => {
        if (product) {
            try {
                await onVerify(product.id);
                onClose();
            } catch (error: any) {
                console.error("Verification failed:", error);
                toast({
                    title: "Error",
                    description: error.message || "Failed to verify.",
                    variant: "destructive"
                });
            }
        }
    };

    const handleReject = () => {
        if (product) {
            if (confirm("Are you sure you want to reject these changes? Added products will be deleted, edits will be reverted.")) {
                onReject(product.id);
                onClose();
            }
        }
    };

    const renderDiff = (label: string, oldVal: any, newVal: any, type: "text" | "price" | "array" = "text") => {
        if (oldVal === newVal || !prev) return (
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase font-bold">{label}</Label>
                {type === "price" ? (
                    <p className="font-mono font-bold text-lg text-green-400">${newVal}</p>
                ) : (
                    <p className="text-sm font-bold">{newVal}</p>
                )}
            </div>
        );

        return (
            <div className="space-y-1 p-2 rounded-lg bg-white/5 border border-white/10">
                <Label className="text-xs text-muted-foreground uppercase font-bold flex items-center justify-between">
                    {label} <span className="text-[10px] text-amber-500 font-black">CHANGED</span>
                </Label>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm line-through text-muted-foreground opacity-50">
                        {type === "price" ? `$${oldVal}` : oldVal}
                    </span>
                    <ArrowRight className="w-3 h-3 text-amber-500" />
                    <span className="text-sm font-bold text-amber-400">
                        {type === "price" ? `$${newVal}` : newVal}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-foreground z-[9999]">
                <DialogHeader className="border-b border-white/10 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <DialogTitle className="font-heading text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                Review <span className="text-primary">Changes</span>
                            </DialogTitle>
                            <Button size="sm" variant="outline" className="h-7 text-xs border-amber-500/50 text-amber-500 hover:bg-amber-500/10" onClick={() => { onClose(); onEdit(product); }}>
                                <Edit className="w-3 h-3 mr-1" />
                                Edit Request
                            </Button>
                        </div>
                        <Badge className={`${actionColor} text-white font-black uppercase tracking-wider`}>
                            {actionLabel} REQUEST
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Warning for Delete Actions */}
                    {isDelete && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-red-500 text-sm uppercase">Deletion Request</h4>
                                <p className="text-xs text-red-300 mt-1">
                                    Verifying this will move the product to the backup (trash) bin.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Image Preview */}
                        <div className="w-full md:w-1/3 space-y-3">
                            <div className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-black relative">
                                <img
                                    src={product.images?.[0] || ""}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                                <Badge className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white border-white/10">
                                    New Version
                                </Badge>
                            </div>

                        </div>

                        {/* Details with Diff */}
                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {renderDiff("Product Name", prev?.name, product.name)}
                                {renderDiff("Price", prev?.price, product.price, "price")}
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase font-bold">Category</Label>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="border-white/10">
                                        {product.category}
                                    </Badge>
                                    {prev && prev.category !== product.category && (
                                        <span className="text-xs text-muted-foreground line-through opacity-50">Was: {prev.category}</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase font-bold">Description</Label>
                                {prev && prev.description !== product.description ? (
                                    <div className="grid gap-2">
                                        <p className="text-xs text-red-400/70 line-through bg-red-500/5 p-2 rounded">
                                            {prev.description}
                                        </p>
                                        <ArrowRight className="w-3 h-3 mx-auto text-muted-foreground" />
                                        <p className="text-sm text-green-400 bg-green-500/5 p-2 rounded">
                                            {product.description}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground leading-relaxed border border-white/5 rounded-lg p-3 bg-white/5">
                                        {product.description || "No description provided."}
                                    </p>
                                )}
                            </div>

                            {/* Simplified Colors/Sizes visualization for now */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground uppercase font-bold">Colors (Current)</Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {product.colors?.map((c, i) => (
                                            <div key={i} className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                                                <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground">{c.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground uppercase font-bold">Sizes (Current)</Label>
                                    <div className="flex flex-wrap gap-1">
                                        {product.sizes?.map((s) => (
                                            <span key={s} className="w-6 h-6 flex items-center justify-center text-[10px] font-bold bg-white/5 rounded border border-white/10 text-muted-foreground">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-3 sm:justify-between border-t border-white/10 pt-4">
                    <Button variant="outline" onClick={onClose} className="flex-1 border-white/10 hover:bg-white/5 hover:text-white">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleVerify}
                        className={`flex-[2] font-black tracking-wider text-white hover:shadow-glow ${isDelete ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                            }`}
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {isDelete ? "CONFIRM DELETION" : "VERIFY & PUBLISH"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReviewChangesModal;
