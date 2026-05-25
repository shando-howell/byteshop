"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function OrdersDashboard() {
    // Fetch gated orders
    const orders = useQuery(api.admin.getOrders);

    // Helper to color-code the payment status
    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "paid":
            case "completed":
                return (
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 
                    text-xs rounded font-medium border border-emerald-500/20">
                        Paid
                    </span>
                )
            case "pending":
                return (
                    <span className="px-2 py-1 bg-amber-500/10 text-amber-400 
                    text-xs rounded font-medium border border-amber-500/20">
                        Pending
                    </span>
                )
            case "refunded":
                return (
                    <span className="px-2 py-1 bg-red-500/10 text-red-400 
                    text-xs rounded font-medium border border-red-500/20">
                        Refunded
                    </span>
                )
            default:
                return (
                    <span className="px-2 py-1 bg-zinc-800 text-zinc-400 
                    text-xs rounded font-medium border border-zinc-700">
                        {status}
                    </span>
                )
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Order Management</h1>
                <button
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg
                    transition-colors text-sm font-medium"
                >
                    Export CSV
                </button>
            </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
                    </div>

                    {orders === undefined ? (
                        <div className="p-8 text-center text-zinc-400 animate-pulse">
                            Decrypting order history...
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-zinc-600 mb-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                            <p className="text-zinc-400 font-medium text-lg">No orders yet</p>
                            <p className="text-zinc-500 text-sm mt-1">When customers checkout, their orders will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-zinc-400">
                                <thead className="bg-zinc-950 text-zinc-500 border-b border-zinc-800">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Order ID</th>
                                        <th className="px-6 py-4 font-medium">Date</th>
                                        <th className="px-6 py-4 font-medium">Customer</th>
                                        <th className="px-6 py-4 font-medium">Total</th>
                                        <th className="px-6 py-4 font-medium">Payment</th>
                                        <th className="px-6 py-4 font-medium">Fulfillment</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-white">
                                                {/* Truncate PayPal ID for a cleaner UI */}
                                                {order.paypalOrderId ? order.paypalOrderId.slice(0, 12) + "..." : "..." + order._id.slice(-8)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(order._creationTime).toLocaleDateString(undefined, {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-medium">{order.customerName || "Guest User"}</span>
                                                    <span className="text-xs text-zinc-500">{order.customerEmail}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-white font-medium">
                                                ${(order.totalAmount / 100).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    className="bg-zinc-950 border border-zinc-700 
                                                    text-zinc-300 text-xs rounded px-2 py-1 focus:border-blue-500 
                                                    outline-none"
                                                    defaultValue={order.fulfillmentStatus || "unfulfilled"}
                                                >
                                                    <option value="unfulfilled">Unfilfilled</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
        </div>
    );
}