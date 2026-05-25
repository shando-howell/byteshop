"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AdminDashboard() {
    const stats = useQuery(api.admin.getDashboardOverview);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-8">System Overview</h1>

            {stats === undefined ? (
                <div className="text-zinc-400 animate-pulse">Decrypting vault data...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                        <h3 className="text-zinc-400 text-sm font-medium mb-2">Total Invetory Items</h3>
                        <p className="text-3xl font-bold text-white">{stats.totalInventory}</p>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                        <h3 className="text-zinc-400 text-sm font-medium mb-2">Total Orders Logged</h3>
                        <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                        <h3 className="text-zinc-400 text-sm font-medium mb-2">Successful Payments</h3>
                        <p className="text-3xl font-bold text-emerald-400">{stats.successfulPayments}</p>
                    </div>
                </div>
            )}
        </div>
    );
}