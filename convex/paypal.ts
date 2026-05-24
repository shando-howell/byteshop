import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const PAYPAL_API = process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// Helper function to get a PayPal OAuth2 token
async function getPayPalAccessToken() {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Missing PayPal API credentials.")
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
    });

    const data = await response.json();
    return data.access_token;
}

export const captureOrder = action({
    args: {
        paypalOrderId: v.string(),
        internalOrderId: v.id("orders")
    },
    handler: async (ctx, args) => {
        // 1. Authenticate with PayPal
        const accessToken = await getPayPalAccessToken();

        // 2. Capture the funds from the client's approved transaction
        const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${args.paypalOrderId}/capture`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (data.status === "COMPLETED") {
            // 3. Update the order to 'paid' in your database using an internal mutation
            await ctx.runMutation(internal.orders.markAsPaid, {
                orderId: args.internalOrderId,
            });
            return { success: true};
        }

        throw new Error("Paypal payment capture failed");
    },
});