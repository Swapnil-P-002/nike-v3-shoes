import { Link } from "react-router-dom";
import { Package, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import WishlistSidebar from "@/components/wishlist/WishlistSidebar";
import { useWishlist } from "@/context/WishlistContext";
import { useOrders } from "@/context/OrderContext";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

const Orders = () => {
    const { isWishlistOpen, setIsWishlistOpen } = useWishlist();
    const { orders } = useOrders();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <CartSidebar />
            <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />

            <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">My Orders</h1>
                        <p className="text-muted-foreground">Track and manage your orders</p>
                    </div>

                    {/* Orders List or Empty State */}
                    {orders.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
                                    <Package className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
                                <p className="text-muted-foreground mb-6 max-w-md">
                                    You haven't placed any orders yet. Start shopping to see your orders here!
                                </p>
                                <Link to="/shop">
                                    <Button className="gap-2">
                                        <ShoppingBag className="h-4 w-4" />
                                        Start Shopping
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <Card key={order.id} className="overflow-hidden">
                                    <div className="bg-secondary/30 p-4 md:p-6 border-b border-border flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex gap-4 md:gap-8 flex-wrap">
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Order Placed</p>
                                                <p className="font-semibold">{new Date(order.date).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Total</p>
                                                <p className="font-semibold">${order.totalPrice.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Order ID</p>
                                                <p className="font-semibold">{order.id}</p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                                            {order.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <CardContent className="p-4 md:p-6">
                                        <div className="space-y-6">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex gap-4">
                                                    <div className="w-20 h-20 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg">{item.name}</h3>
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                                                        </p>
                                                        <p className="font-bold text-accent">${item.price}</p>
                                                    </div>
                                                    <div className="hidden md:block">
                                                        <Link to="/shop">
                                                            <Button variant="outline" size="sm">Buy it again</Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Orders;
