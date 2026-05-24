"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { PayPalButtons } from "@paypal/react-paypal-js";
import Image from "next/image";

export default function CheckoutPage() {
    const router = useRouter();

    // Database Hooks
    const cartItems = useQuery(api.cart.getCart);
    const createPendingOrder = useMutation(api.orders.createPendingOrder);
    const capturePayment = useAction(api.paypal.captureOrder);

    // Shipping Form State
    const [shipping, setShipping] = useState({
        line1: "",
        line2: "",
        city: "Kingston",
        state: "St. Andrew",
        postalCode: "",
        country: "JM"
    });

    const [error, setError] = useState("");

    if (cartItems === undefined) {
        return (
            <div className="min-h-screen bg-zinc-950 p-8 text-white flex items-center justify-center">
                Loading checkout...
            </div>
        )
    }

    const cartTotal = cartItems.reduce((total, item) => {
        return total + ((item.product?.price || 0) * item.quantity);
    }, 0);

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
                <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                <button onClick={() => router.push("/")} className="text-blue-400 hover:text-blue-300 transition-colors">
                    Return to Store
                </button>
            </div>
        );
    }

    // Basic validation to ensure they fill out the form before paying
    const isFormValid = shipping.line1 && shipping.city && shipping.state && shipping.country;

    return (
        <main className="min-h-screen bg-zinc-950 p-6 lg:p-12 text-white flex justify-center">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Order Summary */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
                        <p className="text-zinc-400 mt-2">Review your order before finalization.</p>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-6">
                        <h2 className="text-xl font-semibold mb-4 border-b border-zinc-800 pb-4">Order Summary</h2>

                        <div className="spce-y-4 max-h-[400px] overfow-y-auto pr-2 custom-scrollbar">
                            {cartItems.map((item) => item.product && (
                                <div key={item._id} className="flex gap-4 items-center bg-zinc-900 p-3 rounded-lg border border-zinc-800/50">
                                    <div className="w-16 h-16 bg-zinc-800 rouned-md overflow-hidden relative flex-shrink-0">
                                        <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-sm line-clamp-1">{item.product.title}</h3>
                                        <p className="text-zinc-400 text-xs mt-1">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-emerald-400 font-mono text-sm">
                                        ${((item.product.price * item.quantity) / 100).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-zinc-800 pt-4 flex justify-between items-center text-lg font-bold">
                            <span>Total USD</span>
                            <span className="text-blue-400">${(cartTotal / 100).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Shipping and Payment */}
                <div className="space-y-8">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-6">Shipping Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <input 
                                type="text" placeholder="Address Line 1"
                                className="cols-span-full bg-zinc-950 border border-zinc-800 
                                rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 
                                transition-colors"
                                value={shipping.line1} onChange={(e) => setShipping({...shipping, line1: e.target.value})}
                            />
                            <input
                                type="text" placeholder="Apt, Suite, etc. (Optional)"
                                className="col-span-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white 
                                focus:outline-none focus:border-blue-500 transition-colors"
                                value={shipping.line2} onChange={(e) => setShipping({...shipping, line2: e.target.value})}
                            />
                            <input
                                type="text" placeholder="City / Parish"
                                className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none 
                                focus:border-blue-500 transition-colors"
                                value={shipping.city} onChange={(e) => setShipping({...shipping, city: e.target.value})}
                            />
                            <input
                                type="text" placeholder="State / Province"
                                className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none
                                focus:border-blue-500 transition-colors"
                                value={shipping.state} onChange={(e) => setShipping({...shipping, state: e.target.value})}
                            />
                            <input
                                type="text" placeholder="Postal Code / Zip"
                                className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none 
                                focus:border-blue-500 transition-colors"
                                value={shipping.postalCode} onChange={(e) => setShipping({...shipping, postalCode: e.target.value})}
                            />
                            <input
                                type="text" placeholder="Country Code (e.g., JM, US)"
                                className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none 
                                focus:border-blue-500 transition-colors"
                                value={shipping.country} onChange={(e) => setShipping({...shipping, country: e.target.value})}
                            />
                        </div>

                        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                        {/* PayPal Integration */}
                        <div className={`transition-opacity duration-300 ${!isFormValid ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                            {!isFormValid && (
                                <p className="text-zinc-500 text-sm mb-4 text-center">
                                    Please fill out the required shipping fields to enable payment.
                                </p>
                            )}

                            <div className="relative z-0">
                                <PayPalButtons
                                    style={{layout: "vertical", color: "blue", shape: "rect"}}
                                    createOrder={async (data, actions) => {
                                        // Tell PayPal how much to authorize
                                        return actions.order.create({
                                            purchase_units: [{
                                                // @ts-expect-error: Currency code key/value pair missing
                                                amount: {value: (cartTotal / 100).toFixed(2)}
                                            }]
                                        });
                                    }}
                                    onApprove={async (data) => {
                                        try {
                                            // 1. Create the pending order in Convex using our form state
                                            const internalOrderId = await createPendingOrder({
                                                paypalOrderId: data.orderID,
                                                shippingAddress: shipping
                                            });

                                            // 2. Safely capture the funds on the backend
                                            const result = await capturePayment({
                                                paypalOrderId: data.orderID,
                                                internalOrderId: internalOrderId,
                                            });
                                            
                                            if (result.success) {
                                                router.push(`/checkout/success?orderId=${internalOrderId}`)
                                            }
                                            
                                        // eslint-disable-next-line
                                        } catch (err: any) {
                                            console.error("Payment Capture Failed", err);
                                            setError("Failed to process payment. Please try again.")
                                        }
                                    }}
                                    onError={(err) => {
                                        console.error("PayPal Frontend Eror", err);
                                        setError("An error occurred with PayPal.");
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}