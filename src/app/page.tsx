import { Hero } from "@/components/hero/Hero";
import Products from "@/components/products/product";
export default function Home() {
  return (
    <div className="min-h-screen p-4 md:p-0 pb-20 gap-16 font-[family-name:var(--font-lato)] mx-auto" 
    >
      {/* Main Content */}
      <main className="mx-auto">
        <Hero />
        <Products />
      </main>
    </div>
  );
}
