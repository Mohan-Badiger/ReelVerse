import { motion } from 'framer-motion';

const MovieDetailsSkeleton = () => {
    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="box-panel flex flex-col md:flex-row gap-8 p-8 mb-16 relative overflow-hidden bg-base-900 border-base-800 animate-pulse"
            >
                {/* Poster Skeleton */}
                <div className="relative z-10 mx-auto md:mx-0 shrink-0">
                    <div className="w-full md:w-80 h-[450px] bg-base-800 rounded-sm shadow-sm"></div>
                </div>

                <div className="z-10 flex-1 flex flex-col justify-center">
                    {/* Tags Skeleton */}
                    <div className="flex gap-2 mb-4">
                        <div className="w-16 h-6 bg-base-800 rounded-sm"></div>
                        <div className="w-20 h-6 bg-base-800 rounded-sm"></div>
                    </div>

                    {/* Title Skeleton */}
                    <div className="w-3/4 h-12 bg-base-800 rounded-sm mb-4"></div>

                    {/* Rating/Actions Skeleton */}
                    <div className="flex gap-4 mb-8">
                        <div className="w-24 h-10 bg-base-800 rounded-sm"></div>
                        <div className="w-32 h-10 bg-base-800 rounded-sm"></div>
                        <div className="w-12 h-10 bg-base-800 rounded-sm"></div>
                    </div>

                    {/* Description Skeleton */}
                    <div className="space-y-3 mb-8">
                        <div className="w-full h-4 bg-base-800 rounded-sm"></div>
                        <div className="w-5/6 h-4 bg-base-800 rounded-sm"></div>
                        <div className="w-4/6 h-4 bg-base-800 rounded-sm"></div>
                    </div>

                    {/* Grid Info Skeleton */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-base-800">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i}>
                                <div className="w-16 h-3 bg-base-800 rounded-sm mb-2"></div>
                                <div className="w-24 h-5 bg-base-800 rounded-sm"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MovieDetailsSkeleton;
