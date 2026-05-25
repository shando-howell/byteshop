import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// The Security Lock (used to verify admin status)
// eslint-disable-next-line
async function requireAdmin(ctx: any) {
    const identity = await ctx.auth.getUserIdentity();

    // Check 1: Are they logged in at all?
    if (!identity) {
        throw new Error("Unauthenticated call to admin API.");
    }

    // Check 2: Does their token have the admin badge?
    if (identity.role !== "admin") {
        throw new Error("Unauthorized access: Admin privileges required.");
    }

    return identity;
}

// Fetch high-level metrics for the dashboard
export const getDashboardOverview = query({
    args: {},
    handler: async (ctx) => {
        // 1. Run the security check first
        await requireAdmin(ctx);

        // 2. Fetch sensitive data
        const allProducts = await ctx.db.query("products").collect();
        const allOrders = await ctx.db.query("orders").collect();

        // Calculate some basic stats
        const totalInventory = allProducts.length;
        const paidOrders = allOrders.filter(order => order.status === "paid");

        return {
            totalInventory,
            totalOrders: allOrders.length,
            successfulPayments: paidOrders.length,
        };
    },
});

export const addProduct = mutation({
    args: {
        title: v.string(),
        slug: v.string(),
        description: v.string(),
        price: v.number(),
        inventoryCount: v.number(),
        images: v.array(v.string()),
        category: v.union(
            v.literal("gadget"), v.literal("accessory")
        ),
        brand: v.string(),
        tags: v.array(v.string()),
        compatibility: v.array(v.string()),
        specs: v.any(),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        // 1. Security check
        await requireAdmin(ctx);

        // 2. Insert new product in the DB
        const productId = await ctx.db.insert("products", {
            ...args,
        });

        return productId;
    },
});

export const deleteProduct = mutation({
    args: { id: v.id("products") },
    handler: async (ctx, args) => {
        // 1. Security check
        await requireAdmin(ctx);

        // Delete the product
        await ctx.db.delete(args.id)
    },
});

export const getOrders = query({
    args: {},
    handler: async (ctx) => {
        // 1. Security check
        await requireAdmin(ctx);

        // 2. Fetch all orders and order them by creation time (newest first)
        const orders = await ctx.db.query("orders").order("desc").collect();

        return orders;
    },
});