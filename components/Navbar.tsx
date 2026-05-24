"use server";

import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import CartDrawer from "./CartDrawer"
import { auth } from "@clerk/nextjs/server"

export default async function Navbar() {
    const { userId } = await auth();

    return (
        <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

                    {/* Left side - Logo */}
                    <div className="shrink-0">
                        <Link href="/" className="text-xl font-bold text-white tracking-tight">
                            ByteShop
                        </Link>
                    </div>

                        {/* Right side - Auth & Cart */}
                        <div className="flex items-center gap-4 sm:gap-6">

                            {!userId && (
                                <SignInButton mode="modal">
                                    <button className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                                        Sign In
                                    </button>
                                </SignInButton>
                            )}

                            {!!userId && (
                                <UserButton
                                    appearance={{
                                        elements: {
                                            avatarBox: "w-8 h-8 rounded-md"
                                        }
                                    }}
                                />
                            )}
                            
                            {/* Veritical divider */}
                            <div className="h-6 w-px bg-zinc-800"></div>
                            <CartDrawer />
                        </div>

                </div>
        </nav>
    )
}