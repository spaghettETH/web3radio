import React from 'react';

const LoaderSkeleton = () => {
    return (
        <div className="w-full h-full bg-black p-6">
            <div className="flex flex-row items-center gap-2">
                <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                <p className="text-white text-sm uppercase">Loading...</p>
            </div>
        </div>)
}

export default LoaderSkeleton;