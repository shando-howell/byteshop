"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";

export default function InventoryManager() {
    const products = useQuery(api.products.getActiveProducts);
    const addProduct = useMutation(api.admin.addProduct);
    const deleteProduct = useMutation(api.admin.deleteProduct);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Base string inputs
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        brand: "",
        // eslint-disable-next-line
        category: "" as any,
        description: "",
        price: "",
        inventoryCount: "10",
        images: "", // Comma-separated
        tags: "", // Comma-separated
        compatibility: "", // Comma-separated
    });

    const [isActive, setIsActive] = useState(true);

    // Dynamic specs state
    const [specs, setSpecs] = useState<Record<string, string>>({});
    const [specKey, setSpecKey] = useState("");
    const [specValue, setSpecValue] = useState("");

    const handleAddSpec = () => {
        if (specKey && specValue) {
            setSpecs({...specs, [specKey]: specValue });
            setSpecKey("");
            setSpecValue("");
        }
    };

    const removeSpec = (keyToRemove: string) => {
        const newSpecs = {...specs};
        delete newSpecs[keyToRemove];
        setSpecs(newSpecs);
    };

    // eslint-disable-next-line
    const handleDelete = async (id: any) => {
        // Standard browser confirmation dialog as a safety net
        if (window.confirm("Are you sure you want to delete this product? This cannot be undone.")) {
            try {
                await deleteProduct({ id });
                // eslint-disable-next-line
            } catch (error: any) {
                alert(`Failed to delete product: ${error}`);
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Data transformations
            const priceInCents = Math.round(parseFloat(formData.price) * 100);
            const inventory = parseInt(formData.inventoryCount, 10);
            const imageArray = formData.images.split(",").map(s => s.trim()).filter(Boolean);
            const tagsArray = formData.tags.split(",").map(s => s.trim()).filter(Boolean);
            const compatibilityArray = formData.compatibility.split(",").map(s => s.trim()).filter(Boolean);

            await addProduct({
                title: formData.title,
                slug: formData.slug,
                brand: formData.brand,
                category: formData.category,
                description: formData.description,
                price: priceInCents,
                inventoryCount: inventory,
                images: imageArray,
                tags: tagsArray,
                compatibility: compatibilityArray,
                specs: specs,
                isActive: isActive,
            });

            // Reset everything on success
            setFormData({
                title: "", slug: "", brand: "", category: "", description: "",
                price: "", inventoryCount: "10", images: "", tags: "", compatibility: "",
            });
            setSpecs({});
            setIsActive(true);
            alert("Product successfully added to the catalog!");
            // eslint-disable-next-line
        } catch (error: any) {
            alert(`Failed to add product: ${error}`);
        } finally {
            setIsSubmitting(false);
        };
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Inventory Manager</h1>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl mb-10">
                <h2 className="text-xl font-semibold text-white mb-6">Add New Product</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Row 1: Basic Identifiers */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input 
                            required 
                            type="text" 
                            placeholder="Title (e.g. MX Master 3S)" 
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="col-span-2 bg-zinc-950 border border-zinc-800 rounded-lg p-3 
                            text-white focus:border-blue-500 outline-none"
                        />
                        <input 
                            required 
                            type="text" 
                            placeholder="Slug (mx-master-3s" 
                            value={formData.slug}
                            onChange={(e) => setFormData({...formData, slug: e.target.value})}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 
                            text-white focus:border-blue-500 outline-none"
                        />
                        <input 
                            required 
                            type="text" 
                            placeholder="Brand" 
                            value={formData.brand}
                            onChange={(e) => setFormData({...formData, brand: e.target.value})}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 
                            text-white focus:border-blue-500 outline-none"
                        />
                    </div>

                    {/* Row 2: Categorization and Stock */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white
                                focus:border-blue-500 outline-none appearance-none"
                            >
                                <option value="" disabled>Select a Category</option>
                                <option value="gadget">Gadget</option>
                                <option value="accessory">Accessory</option>
                            </select>

                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                        <input 
                            required 
                            type="number" 
                            step="0.01"
                            placeholder="Price (USD)"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
                        />

                        <input 
                            required 
                            type="number" 
                            placeholder="Inventory Count"
                            value={formData.inventoryCount}
                            onChange={(e) => setFormData({...formData, inventoryCount: e.target.value})}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
                        />
                        <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                            <input 
                                type="checkbox" 
                                id="isActive" 
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="w-5 h-5 accent-blue-600"
                            />
                            <label htmlFor="isActive" className="text-zinc-400">Listed as Active</label>
                        </div>
                    </div>

                    {/* Row 3: Arrays and Media (Comma Separated) */}
                    <div className="grid grid-cols-1 mg:grid-cols-3 gap-4">
                        <input 
                            required 
                            type="text" 
                            placeholder="Image URLs (comma separated)"
                            value={formData.images}
                            onChange={(e) => setFormData({...formData, images: e.target.value})}
                            className="col-span-2 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
                        />
                        <input 
                            type="text" 
                            placeholder="Tags (e.g. wireless, ergonomic)"
                            value={formData.tags}
                            onChange={(e) => setFormData({...formData, tags: e.target.value})}
                            className="col-span-2 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
                        />
                        <input 
                            type="text" 
                            placeholder="Compatibility (e.g. Mac, PC)"
                            value={formData.compatibility}
                            onChange={(e) => setFormData({...formData, compatibility: e.target.value})}
                            className="col-span-2 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
                        />
                    </div>

                    {/* Row 4: Description */}
                    <textarea 
                        required 
                        placeholder="Detailed Product Description"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                    />

                    {/* Technical Specifications Builder */}
                    <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-950">
                        <h3 className="text-sm font-medium text-zinc-400 mb-3">Technical Specifications</h3>

                        <div className="flex gap-2 mb-4">
                            <input 
                                type="text" 
                                placeholder="Spec Name (e.g. Memory)"
                                value={specKey}
                                onChange={(e) => setSpecKey(e.target.value)}
                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white outline-none" 
                            />
                            <input 
                                type="text" 
                                placeholder="Value (e.g. 16 GB)"
                                value={specValue}
                                onChange={(e) => setSpecValue(e.target.value)}
                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white outline-none" 
                            />
                            <button 
                                type="button" 
                                onClick={handleAddSpec} 
                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg 
                                transition-colors text-sm"
                            >
                                Add
                            </button>
                        </div>

                        {Object.keys(specs).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(specs).map(([k, v]) => (
                                    <span 
                                        key={k} 
                                        className="inline-flex items-center gap-2 px-3 py-1 
                                        bg-blue-900/30 border border-blue-800/50 text-blue-300 
                                        text-xs rounded-full"
                                    >
                                        {k}: {v}
                                        <button
                                            type="button"
                                            onClick={() => removeSpec(k)}
                                            className="hover:text-white"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700
                        text-white font-medium py-4 rounded-lg transition-colors mt-4"
                    >
                        {isSubmitting ? "Syncing to Database..." : "Add Product to Database"}
                    </button>
                </form>
            </div>

            {/* Bottom Section: Current Cataglog Table */}
            <div className="bg-zinc-900 border border-zinc800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-semibold text-white">
                        Current Catalog
                    </h2>
                </div>

                {products === undefined ? (
                    <div className="p-8 text-center text-zinc-400 animate-pulse">
                        Loading inventory...
                    </div>
                ) : products.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">
                        No products found. Add some gear above!
                    </div>
                ) : (
                    <div className="overfow-x-auto">
                        <table className="w-full text-left text-sm text-zinc-400">
                            <thead className="bg-zinc-950 text-zinc-500">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Product</th>
                                    <th className="px-6 py-4 font-medium">Price (USD)</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">ID</th>
                                    <th className="px-6 py-4 font-medium"/>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-4">
                                            <div className="w-10 h-10 bg-zinc-800 rounded overflow-hidden relative flex-shrink-0">
                                                {product.images?.[0] && (
                                                    <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                                                )}
                                            </div>
                                            <span className="font-medium text-white">{product.title}</span>
                                        </td>
                                        <td className="px-6 py-4 text-emerald-400 font-mono">
                                            ${(product.price / 100).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium 
                                            bg-emerald-400/10 text-emerald-400">
                                                {product.isActive ? "Active" : "Draft"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-xs text-zinc-500">
                                            ...{product._id.slice(-6)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="text-zinc-500 hover:text-red-400 transition-colors p-2"
                                                title="Delete Product"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}