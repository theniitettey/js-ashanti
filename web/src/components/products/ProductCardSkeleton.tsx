export const ProductCardSkeleton = () => {
    return (
      <div className="flex flex-col rounded-lg shadow-md border animate-pulse">
        <div className="h-32 lg:h-52 bg-gray-200 w-full" />
        <div className="p-4 space-y-2">
          <div className="h-4 bg-gray-200 w-3/4 rounded" />
          <div className="h-4 bg-gray-200 w-1/2 rounded" />
          <div className="h-4 bg-gray-100 w-full rounded mt-4" />
          <div className="flex gap-4 mt-2">
            <div className="h-6 w-20 bg-gray-200 rounded" />
            <div className="h-6 w-16 bg-gray-100 rounded" />
          </div>
          <div className="h-8 bg-gray-300 rounded mt-4" />
        </div>
      </div>
    );
  };