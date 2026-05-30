import { fetchQuery, preloadQuery, preloadedQueryResult } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import AddToCart from "@/components/AddToCart";
import { notFound } from "next/navigation";
import Image from "next/image";

interface PageProps {
    params: {
        id: Id<"products">;
    };
}

// The SEO layer
export async function generateMetadata({ params }: PageProps) {
    const resolvedParams = await params;
    const productId = resolvedParams.id as Id<"products">;

    const product = await fetchQuery(api.products.getProductById, {id: productId});

    if (!product) {
        return {title: "Product Not Found"};
    }

    return {
        title: `${product.title} | ByteShop`,
        description: product.description,
    };
}

// The Server Component
export default async function ProductPage({ params }: PageProps) {
    const resolvedParams = await params;
    const productId = resolvedParams.id as Id<"products">;
    
    // Prepare the reactive data payload for the client
    const preloadedProduct = await preloadQuery(api.products.getProductById, { id: productId });

    // Unwrap the payload to check the data on the server
    const productData = preloadedQueryResult(preloadedProduct);

    if (!productData) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Static Server-Rendered UI */}
            <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
                {/* Placeholder for Next.js Image component */}
                <div className="aspect-square bg-zinc-800 rounded-lg mb-4 w-full relative overflow-hidden">
                    {productData.images[0] && (
                        <Image
                            src={productData.images[0]}
                            alt={productData.title}
                            fill
                            className="object-cover"
                        />
                    )}
                </div>
            </div>

            <div className="flex flex-col justify-center">
                <h1 className="text-4xl font-bold mb-4">{productData.title}</h1>
                <p className="text-2xl text-gray-900 mb-6">${productData.price.toFixed(2)}</p>
                <p className="text-gray-600 leading-relaxed">{productData.description}</p>

                {/* The client island */}
                <AddToCart
                    preloadedProduct={preloadedProduct}
                />
            </div>
        </div>
    );
}