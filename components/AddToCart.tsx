"use client";

import { usePreloadedQuery, Preloaded, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

interface AddToCartProps {
    preloadedProduct: Preloaded<typeof api.products.getProductById>
}

export default function AddToCart({ preloadedProduct }: AddToCartProps) {
    const product = usePreloadedQuery(preloadedProduct);
    const addToCartMutation = useMutation(api.cart.addItem);

    // Safely fallback if the product is completely null
    if (!product) return null;

    const isOutOfStock = product.inventoryCount < 1;

    return (
        <div className="mt-6">
            <p className="text-sm text-gray-500 mb-2">
                {isOutOfStock ? "Out of stock" : `${product.inventoryCount} units available.`}
            </p>

            <button
                disabled={isOutOfStock}
                onClick={() => addToCartMutation({ productId: product._id, quantity: 1 })}
                className={`w-full py-3 px-8 rounded-md font-semibold text-white transition-colors
                    ${isOutOfStock 
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
            >
                {isOutOfStock ? "Sold Out" : "Add to Cart"}
            </button>
        </div>
    );
}