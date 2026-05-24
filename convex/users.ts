import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const createUser = internalMutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (existingUser) {
            // If they exist, update their details
            await ctx.db.patch(existingUser._id, {
                email: args.email,
                name: args.name,
            });
        } else {
            // New sign up
            await ctx.db.insert("users", {
                clerkId: args.clerkId,
                email: args.email,
                name: args.name,
            });
        }
    }
});