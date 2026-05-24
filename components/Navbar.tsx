"use client"

import { useState } from "react";
import Link from "next/link";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import CartDrawer from "./CartDrawer"

export default function Navbar() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { isLoaded, userId } = useAuth();

    // Fetch cart data
    const cartItems = useQuery(api.cart.getCart) || [];
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <>
            <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

                    {/* Left side - Logo */}
                    <div className="shrink-0 flex items-center">
                        <Link href="/" className="text-xl font-bold text-white tracking-tight">
                            ByteShop
                        </Link>
                    </div>

                    {/* Right side - Auth & Cart */}
                    <div className="flex items-center gap-4 sm:gap-6">

                        {/* Show loading state to prevent layout shift */}
                        {!isLoaded ? (
                            <div className="w-6 h-8 bg-zinc-800 animate-pulse rounded"></div>
                        ) : !userId ? (
                            // User is not logged in
                            <SignInButton mode="modal">
                                <button className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                                    Sign In
                                </button>
                            </SignInButton>
                        ) : (
                            // User is logged in
                            <div className="flex items-center">
                                <UserButton
                                    appearance={{
                                        elements: {
                                            avatarBox: "w-8 h-8 rounded-md"
                                        }
                                    }}
                                />
                            </div>
                        )}

                        <div className="h-5 w-px bg-zinc-800" aria-hidden="true" />

                        {/* Cart Button */}
                        <div className="flex items-center">
                            <button 
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-blue-600 rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
                                
            {/* Cart Drawer */}
            <CartDrawer
                isOpen={isCartOpen}
                setIsOpen={setIsCartOpen}
                cartItems={cartItems}
            />
        </>
    );
}