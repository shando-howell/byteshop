import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createProduct = mutation({
    args: {
        title: v.string(),
        slug: v.string(),
        description: v.string(),
        price: v.number(),
        inventoryCount: v.number(),
        images: v.array(v.string()),
        category: v.union(
            v.literal("gadget"),
            v.literal("accessory")
        ),
        tags: v.array(v.string()),
        brand: v.string(),
        compatibility: v.optional(v.array(v.string())),
        specs: v.optional(v.record(v.string(), v.string())),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        // Insert the product and return its new ID
        const productId = await ctx.db.insert("products", args);
        return productId;
    },
});

export const getActiveProducts = query({
    handler: async (ctx) => {
        // Fetch all products, but filter to only show active ones
        const products = await ctx.db
            .query("products")
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();

        return products;
    },
});