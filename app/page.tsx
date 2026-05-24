"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";

export default function Storefront() {
  // Fetch products in real-time
  const products = useQuery(api.products.getActiveProducts);
  // Hook up the cart mutation
  const addToCart = useMutation(api.cart.addToCart);

  if (products === undefined) {
    return (
      <div className="p-8 text-white">Loading catalog...</div>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div 
            key={product._id}
            className="bg-zinc-900 vorder border-zinc-800 rounded-xl p-6 flex flex-col"
          >
            {/* Placeholder for product image  */}
            <div className="aspect-square bg-zinc-800 rounded-lg mb-4 w-full relative overflow-hidden">
              {product.images[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-semibold text-white">{product.title}</h2>
              <span className="text-emerald-400 font-mono">
                ${(product.price / 100).toFixed(2)}
              </span>
            </div>

            <p className="text-zinc-400 text-sm mb-6 grow line-clamp-2">
              {product.description}
            </p>

            <button
              onClick={() => {
                addToCart({ productId: product._id, quantity: 1 })
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}