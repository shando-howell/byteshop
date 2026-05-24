import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addToCart = mutation({
    args: {
        productId: v.id("products"),
        quantity: v.number()
    },
    handler: async (ctx, args) => {
        // 1. Verify the user is logged in via Clerk
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("You must be logged in to add items cart.")
        }

        // 2. Find the user's internal database ID using their Clerk token
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!user) {
            throw new Error("User record not found.");
        }

        // 3. Check if the product is already in the user's cart
        const existingCartItem = await ctx.db
            .query("cartItems")
            .withIndex("by_user_and_product", (q) => (
                q.eq("userId", user._id).eq("productId", args.productId)
            ))
            .first();

        if (existingCartItem) {
            // If it exists, just update the quantity
            await ctx.db.patch(existingCartItem._id, {
                quantity: existingCartItem.quantity + args.quantity,
            });
        } else {
            // Otherwise, create a new cart entry
            await ctx.db.insert("cartItems", {
                userId: user._id,
                productId: args.productId,
                quantity: args.quantity
            });
        }
    },
});

export const removeFromCart  = mutation({
    args: {cartItemId: v.id("cartItems")},
    handler: async (ctx, args) => {
        // To Do: Verify this cart item actually belongs to the logged-in user.
        await ctx.db.delete(args.cartItemId);
    }
});

export const getCart = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        // Return an empty array if not logged in
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!user) return [];

        const cartItems = await ctx.db
            .query("cartItems")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        // Map over cart items and fetch the corresponding product details
        const populatedCart = await Promise.all(
            cartItems.map(async (item) => {
                const product = await ctx.db.get(item.productId);
                return {
                    ...item,
                    product,
                };
            })
        );

        // Filter out any items where the product might have been deleted
        return populatedCart.filter((item) => item.product !== null);
    },
});