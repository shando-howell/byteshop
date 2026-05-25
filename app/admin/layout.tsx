import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // 1. Fetch the full user object directly from Clerk
    const user = await currentUser();

    // 2. Check the publicMetadata directly
    if (user?.publicMetadata?.role !== "admin") {
        redirect("/");
    }

    // 3. If they are an admin, render the dashboard UI
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                        </svg>
                    </div>
                    <h2 className="text-white font-bold text-xl tracking-tight">Admin Center</h2>
                </div>

                <nav className="flex-1 space-y-2">
                    <Link href="/admin" className="block px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors font-medium">
                        Dashboard
                    </Link>
                    <Link href="/admin/inventory" className="block px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors font-medium">
                        Inventory
                    </Link>
                    <Link href="/admin/orders" className="block px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors font-medium">
                        Orders
                    </Link>
                </nav>

                {/* Admin Profile Footer */}
                <div className="mt-auto pt-6 border-t border-zinc-800 flex items-center gap-3">
                    <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" }}} />
                    <div className="flex flex-col">
                        <span className="text-sm text-white font-medium">Admin User</span>
                        <span className="text-xs text-emerald-400 font-mono">Verified</span>
                    </div>
                </div>
            </aside>

            {/* Main Content Area (Where the specific page will render) */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}