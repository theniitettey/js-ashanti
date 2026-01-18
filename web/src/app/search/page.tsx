import { ProductsCardDetails } from "@/components/products/productsCard";
import Fuse from 'fuse.js';

export const dynamic = "force-dynamic";


const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";

async function getAllProducts() {
  const res = await fetch(`${BACKEND_URL}/api/products`, {
    next: { revalidate: 600 } // Cache for 10 minutes
  });
  if (!res.ok) return [];
  return res.json();
}

interface SearchPageProps {
  searchParams: Promise<{ query?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const products = await getAllProducts();
  
  const normalize = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();

  const params = await searchParams;

  const query = normalize(params.query || "");

  const fuseOptions = {
    keys: ["name", "description"],
    threshold: 0.4,
    includeScore: true,
  };

  const fuseSearch = new Fuse(products, fuseOptions);
  const fuseResults = fuseSearch.search(query);
  const filteredProducts = fuseResults.map((result) => result.item);

  return (
    <div className="md:max-w-7xl mx-auto px-4 py-10 mb-8 md:mb-24 pt-24">
      <form method="GET" action="/search">
        <input
          name="query"
          className="w-full border border-gray-300 rounded-full px-4 py-2 mb-4"
          placeholder="Search products..."
          defaultValue={params.query || ""}
        />
      </form>
      
      <h1 className="text-2xl font-bold mb-6">
        {query ? `Search Results for "${query}"` : "Browse Products"}
      </h1>
      
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xs:landscape:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product: any) => (
            <ProductsCardDetails
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              description={product.description}
              slug={product.slug}
              mainImage={product.images?.[0]}
            />
          ))}
        </div>
      ) : query ? (
        <p className="text-gray-500">No products found for "{query}".</p>
      ) : (
        <p className="text-gray-500">Start by searching for products above.</p>
      )}
    </div>
  );
}