"use client";

import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";

export default function Storefront() {
  // Fetch products in real-time
  const products = useQuery(api.products.getActiveProducts);
  // Hook up the cart mutation
  const addToCart = useMutation(api.cart.addToCart);

  // Fetch the precise Convex auth state
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (products === undefined) {
    return (
      <div className="p-8 text-zinc-950 animate-pulse">Loading catalog...</div>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <Link
              href={`/products/${product._id}`}
              key={product._id}
              className="group block rounded-lg transition-shadow hover:shadow-lg"
            >
              <div 
                className="flex flex-col"
              >
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
              </div>
            </Link>
            <button
                  onClick={async () => {
                    if (!isAuthenticated) {
                      alert("Please sign in to add items to your cart!");
                      return;
                    }

                    try {
                      await addToCart({ productId: product._id, quantity: 1 })
                      console.log("Successfully added to cart!")
                    } catch (error) {
                      console.error("Cart Error:", error);
                      alert(`Failed to add to cart: ${error}`);
                    }
                  }}
                  // Disable the button while the auth state is still resolving
                  disabled={isLoading || !isAuthenticated}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 my-2 rounded-lg transition-colors"
                >
                  {isLoading ? "Loading..." : isAuthenticated ? "Add to Cart" : "Sign in to Buy"}
                </button>
            </div>
          ))}
        </div>
    </main>
  );
}