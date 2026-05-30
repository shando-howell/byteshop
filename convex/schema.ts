import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Users synced from Clerk
    users: defineTable({
        clerkId: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
        // Implementing default shipping info in order to save time at the PayPal checkout step
        defaultShippingAddress: v.optional(
            v.object({
                line1: v.string(),
                line2: v.optional(v.string()),
                city: v.string(),
                state: v.string(),
                postalCode: v.string(),
                country: v.string()
            })
        ),
    }).index("by_clerkId", ["clerkId"]),

    // Tech Gadgets and Accessories
    products: defineTable({
        id: v.optional(v.string()),
        title: v.string(),
        slug: v.string(), // For clean urls (example: "mechanical-keyboard-k8")
        description: v.string(),
        price: v.number(), // Always store in cents (e.g., $49.99 = 4999)
        inventoryCount: v.number(),
        images: v.array(v.string()),

        category: v.union(
            v.literal("gadget"),
            v.literal("accessory")
        ),
        tags: v.array(v.string()), // e.g., ["usb-c", "wireless", "ergonomic"]

        // Tech-specific data
        brand: v.string(),
        compatibility: v.optional(v.array(v.string())), // e.g. ["Mac", "Windows", "Linux"]
        specs: v.optional(
            v.record(v.string(), v.string()) // e.g., {"Connectivity": "Bluetooth 5.0", "Battery": "40 hours"}
        ),

        isActive: v.boolean(), // Toggle visibility without deleting the product
    })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"]),

    // Shopping Cart (Database-backed for cross-device sync)
    cartItems: defineTable({
        userId: v.id("users"),
        productId: v.id("products"),
        quantity: v.number(),
        addedAt: v.optional(v.number())
    })
    .index("by_user", ["userId"])
    .index("by_user_and_product", ["userId", "productId"]),

    // Orders linked to PayPal
    orders: defineTable({
        userId: v.id("users"),

        // PayPal Specific Inentifiers
        paypalOrderId: v.string(),
        paypalCaptureId: v.optional(v.string()),

        status: v.union(
            v.literal("pending"), // Waiting for PayPal approval
            v.literal("paid"),    // Funds captured
            v.literal("processing"), // Packing in warehouse
            v.literal("shipped"),  // On the way
            v.literal("delivered"),
            v.literal("cancelled")
        ),

        totalAmount: v.number(), // In cents
        shippingAddress: v.object({
            line1: v.string(),
            line2: v.optional(v.string()),
            city: v.string(),
            state: v.string(),
            postalCode: v.string(),
            country: v.string(),
        }),

        customerName: v.optional(v.string()),
        customerEmail: v.optional(v.string()),

        fulfillmentStatus: v.optional(v.union(
            v.literal("unfulfilled"),
            v.literal("processing"),
            v.literal("shipped"),
            v.literal("delivered")
        )),

        // Snapshot of the items at the time of purchase
        items: v.array(
            v.object({
                productId: v.id("products"),
                title: v.string(),
                quantity: v.number(),
                priceAtPurchase: v.number(), // Protects past receipts if you change product prices later
            })
        ),
    })
    .index("by_user", ["userId"])
    .index("by_paypal_order", ["paypalOrderId"]),

    // Product Reviews for social proof
    reviews: defineTable({
        productId: v.id("products"),
        userId: v.id("users"),
        rating: v.number(), // 1 to 5
        comment: v.string(),
        isVerifiedPurchase: v.boolean(), // True is the user actually bought the item
    }).index("by_product", ["productId"]),
});