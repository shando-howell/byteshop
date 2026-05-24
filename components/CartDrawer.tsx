"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from  "@/convex/_generated/api";
import Image from "next/image";

export default function CartDrawer() {
    const [isOpen, setIsOpen] = useState(false);

    // Fetch the cart data
    const cartItems = useQuery(api.cart.getCart) || [];
    const removeFromCart = useMutation(api.cart.removeFromCart);

    // Calculate the total cart value
    const cartTotal = cartItems.reduce((total, item) => {
        return total + ((item.product?.price || 0) * item.quantity);
    }, 0);

    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <>
            {/* Floating Cart Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 text-zinc-400 hover:text-white transition-colors"
            >
                Cart
                {cartCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 pu-0.5 text-[10px] font-bold leading-none text-white transform translate-z-1/4 bg-blue-600 rounded-full">
                        {cartCount}
                    </span>
                )}
            </button>

            {/* Backdrop Overlay */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-poacity duration-300 
                ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Slide-out Drawer Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-zinc-950 border-l border-zinc-800 z-50 transform transition-transform duration-300 ease-in-out flex flex-col
                    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Drawer Header */}
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Your Cart</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-zinc-400 hover:text-white transition-colors p-2"
                    >
                        X
                    </button>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cartItems.length ===0 ? (
                        <p className="text-zinc-500 text-center mt-12">Your cart is empty.</p>
                    ) : (
                        cartItems.map((item) => (
                            item.product && (
                                <div key={item._id} className="flex gap-4 items-center">
                                    <div className="w-20 h-20 bg-zinc-900 rounded-md relative overflow-hidden flex-shrink-0">
                                        <Image
                                            src={item.product.images[0]}
                                            alt={item.product.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-white font-medium text-sm line-clamp-1">{item.product.title}</h3>
                                        <p className="text-emerald-400 text-sm mt-1">
                                            ${(item.product.price / 100).toFixed(2)}
                                        </p>
                                        <p className="text-zinc-500 text-xs mt-1">Qty: {item.quantity}</p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart({ cartItemId: item._id })}
                                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )
                        ))
                    )}
                </div>

                {/* Drawer Footer / Checkout */}
                {cartItems.length > 0 && (
                    <div className="p-6 border-t border-zinc-800 bg-zinc-950">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-zinc-400">Total</span>
                            <span className="text-white font-bold text-xl">
                                ${(cartTotal / 100).toFixed(2)}
                            </span>
                        </div>
                        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-4 rounded-lg transition-colors">
                            Continue to Checkout
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};