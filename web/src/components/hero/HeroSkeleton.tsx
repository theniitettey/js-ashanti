export default function HeroSkeleton(){
    return(
        <div className="w-full h-auto flex flex-col landscape:flex-row md:flex-row items-center justify-between px-4 animate-pulse">
        {/* Left: Text Skeleton */}
        <div className="w-full text-center md:text-left space-y-6 mt-24 md:mt-0">
            <div className="h-8 md:h-12 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto md:mx-0" />
            <div className="h-4 md:h-6 bg-gray-300 dark:bg-gray-700 rounded w-full md:w-3/5 mx-auto md:mx-0" />
            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-40 mx-auto md:mx-0" />
        </div>

        {/* Right: Image Skeleton */}
        <div className="w-full md:w-1/2 mt-8 md:mt-0 flex items-center justify-center">
            <div className="w-full h-[30vh] md:h-[60vh] bg-gray-300 dark:bg-gray-700 rounded-md" />
        </div>
        </div>
    )
}