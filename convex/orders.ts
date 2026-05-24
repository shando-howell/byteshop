import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const createPendingOrder = mutation({
    args: {
        paypalOrderId: v.string(),
        shippingAddress: v.object({
            line1: v.string(),
            line2: v.optional(v.string()),
            city: v.string(),
            state: v.string(),
            postalCode: v.string(),
            country: v.string()
        }),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!user) {
            throw new Error("User not found.");
        }

        // 1. Get everything currently in the user's cart
        const cartItems = await ctx.db
            .query("cartItems")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        if (cartItems.length === 0) {
            throw new Error("Cart is empty.")
        }

        // 2. Fetch the actual products to get their current prices
        let totalAmount = 0;
        const orderItems = [];

        for (const cartItem of cartItems) {
            const product = await ctx.db.get(cartItem.productId);
            if (!product) continue;

            totalAmount += product.price * cartItem.quantity;

            // Snapshot the product data
            orderItems.push({
                productId: product._id,
                title: product.title,
                quantity: cartItem.quantity,
                priceAtPurchase: product.price, // Lock in the price
            });
        }

        // 3. Create the pending order linked to the PayPal token
        const orderId = await ctx.db.insert("orders", {
            userId: user._id,
            paypalOrderId: args.paypalOrderId,
            status: "pending",
            totalAmount,
            shippingAddress: args.shippingAddress,
            items: orderItems,
        });

        // 4. Clear the user's cart now that the order is pending
        for (const item of cartItems) {
            await ctx.db.delete(item._id);
        }

        return orderId;
    },
});

// We use internalMutation so it can ONLY be triggered by our secure PayPal action,
// preventing users from manually calling it from the frontend to mark their own orders as paid.
export const markAsPaid = internalMutation({
    args: {orderId: v.id("orders")},
    handler: async (ctx, args) => {
        await ctx.db.patch(args.orderId, {
            status: "paid",
        });
    },
});