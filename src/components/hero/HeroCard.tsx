import { HeroCardProps } from "@/interface/types";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export const HeroCard = ({
  id,
  title,
  description,
  imageUrl,
  slug,
  discount,
}: HeroCardProps) => {
  return (
    <div
      key={id}
      className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden rounded-xl"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/kitchenbackground.webp" // you can later make this dynamic
          alt="Kitchen background"
          fill
          className="object-cover brightness-50"
          priority
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl mx-auto px-6">
        {/* Left: Text */}
        <div className="w-full lg:w-1/2 text-center lg:text-left space-y-6">
          {discount > 0 && (
            <div className="inline-block bg-red-600 text-white px-4 py-1 rounded-full text-md font-semibold shadow-lg">
              {discount}% OFF
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-extrabold text-yellow-400 drop-shadow-lg">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-lg mx-auto lg:mx-0">
            {description}
          </p>
          <Button
            size="lg"
            className="rounded-full px-8 py-3 text-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-black transition"
          >
            <Link href={`/products/${slug}`}>Shop Now</Link>
          </Button>
        </div>

        {/* Right: Product Image */}
        <div className="w-full lg:w-1/2 flex justify-center mt-8 lg:mt-0 relative">
       {/*    <Image
            width={500}
            height={500}
            src={imageUrl || "/fallback-image.webp"}
            alt={title}
            className="drop-shadow-2xl transform hover:scale-105 transition duration-500 rounded-full"
            onError={(e) => {
              e.currentTarget.src = "/images/fallback.jpg";
            }}
            priority
          /> */}
        </div>
      </div>
    </div>
  );
};
