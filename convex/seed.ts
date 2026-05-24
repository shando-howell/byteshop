import { mutation } from "./_generated/server";

const sampleProducts = [
  {
    title: "Keychron Q1 Pro Mechanical Keyboard",
    slug: "keychron-q1-pro",
    description: "A premium 75% layout custom wireless mechanical keyboard with QMK/VIA support and an all-metal CNC machined body.",
    price: 19900, // $199.00
    inventoryCount: 45,
    images: ["https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop"],
    category: "accessory" as const,
    tags: ["wireless", "mechanical", "ergonomic", "rgb"],
    brand: "Keychron",
    compatibility: ["Mac", "Windows", "Linux"],
    specs: {
      "Switches": "Keychron K Pro Red",
      "Connectivity": "Bluetooth 5.1 / Type-C",
      "Battery": "4000 mAh"
    },
    isActive: true,
  },
  {
    title: "Sony WH-1000XM5 Noise Cancelling Headphones",
    slug: "sony-wh-1000xm5",
    description: "Industry leading noise canceling with two processors controlling 8 microphones for unprecedented noise cancellation.",
    price: 39800, // $398.00
    inventoryCount: 12,
    images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop"],
    category: "gadget" as const,
    tags: ["audio", "wireless", "anc"],
    brand: "Sony",
    compatibility: ["iOS", "Android", "Mac", "Windows"],
    specs: {
      "Battery Life": "Up to 30 hours",
      "Charging": "3 min charge for 3 hours playback",
      "Weight": "250g"
    },
    isActive: true,
  },
  {
    title: "Logitech MX Master 3S Wireless Mouse",
    slug: "logitech-mx-master-3s",
    description: "An iconic remastered mouse with Quiet Clicks and an 8K DPI track-on-glass sensor for extreme precision.",
    price: 9999, // $99.99
    inventoryCount: 80,
    images: ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800&auto=format&fit=crop"],
    category: "accessory" as const,
    tags: ["wireless", "productivity", "ergonomic"],
    brand: "Logitech",
    compatibility: ["Mac", "Windows", "iPadOS"],
    specs: {
      "Sensor": "8000 DPI Darkfield",
      "Buttons": "7 buttons",
      "Connectivity": "Logi Bolt / Bluetooth"
    },
    isActive: true,
  }
];

export const seedProducts = mutation({
  handler: async (ctx) => {
    // 1. Check if we already have products to avoid duplicating
    const existing = await ctx.db.query("products").first();
    if (existing) {
      return "Database already has products. Skipping seed.";
    }

    // 2. Insert all sample products
    let count = 0;
    for (const product of sampleProducts) {
      // @ts-expect-error: Type mismatch
      await ctx.db.insert("products", product);
      count++;
    }

    return `Successfully seeded ${count} products!`;
  },
});