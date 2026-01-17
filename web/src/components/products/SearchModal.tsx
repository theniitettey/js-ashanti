'use client';
import { useState,useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export function SearcModal({ 
    isOpen, 
    onClose, 
    placeholder = "Search products..." }: 
    {
        isOpen: boolean, 
        onClose: () => void,  
        placeholder?: string 
    }) {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState<Array<{ name: string; description: string; slug: string }>>([]);

    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!search.trim()) return;
      router.push(`/search?query=${encodeURIComponent(search.trim())}`);
        onClose();
        setSearch("");
    };

    useEffect(() => {
        try{
            const fetchProducts = async () => {
                const response = await fetch('/api/products');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data);
            };
            fetchProducts();
        } catch(error){
            console.error("Error fetching products:", error);
        }
    }, []);
  

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) || product.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <DialogHeader>
                <DialogTitle>Search Products</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
                    <Input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={placeholder}
                        className="w-full border p-2 rounded-md"
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
                        Search
                    </button>
                </form>

                <div className="max-h-80 overflow-y-auto mt-4 space-y-2">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                    <a
                        key={product.slug}
                        href={`/products/${product.slug}`}
                        className="block p-2 border rounded hover:bg-gray-100 transition"
                    >
                        <div className="font-semibold">{product.name}</div>
                        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                    </a>
                    ))
                ) : (
                    <p className="text-gray-400">No products found.</p>
                )}
                </div>
            </DialogContent>
    </Dialog>
    )
}

