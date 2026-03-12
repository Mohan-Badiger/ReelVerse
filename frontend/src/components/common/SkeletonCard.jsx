const SkeletonCard = () => {
    return (
        <div className="w-full aspect-2/3 rounded-lg overflow-hidden bg-base-900 border border-base-800 animate-pulse relative">
            <div className="absolute inset-0 bg-gradient-to-t from-base-950/80 to-transparent z-10"></div>
            <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col gap-2">
                <div className="h-4 bg-base-800 rounded w-3/4"></div>
                <div className="h-3 bg-base-800 rounded w-1/2"></div>
                <div className="h-8 bg-base-800 rounded w-full mt-2"></div>
            </div>
        </div>
    );
};

export default SkeletonCard;
