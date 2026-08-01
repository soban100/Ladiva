import React from 'react';

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden animate-pulse flex flex-col h-full">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
        {/* Badge skeletons */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
          <div className="w-16 h-5 bg-gray-300 rounded-full"></div>
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title skeleton - fixed height */}
        <div className="flex-1">
          <div className="h-14 mb-3 space-y-2">
            <div className="h-7 bg-gray-200 rounded-lg w-3/4"></div>
            <div className="h-7 bg-gray-200 rounded-lg w-1/2"></div>
          </div>
          
          {/* Rating skeleton - fixed height */}
          <div className="flex items-center h-5 mb-3">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-gray-200 rounded-sm"></div>
              ))}
            </div>
            <div className="w-8 h-4 bg-gray-200 rounded-sm ml-2"></div>
          </div>
        </div>
        
        {/* Price and button section */}
        <div className="space-y-3">
          {/* Price skeleton */}
          <div className="flex items-center space-x-2">
            <div className="h-6 bg-gray-200 rounded-lg w-16"></div>
            <div className="h-7 bg-gray-200 rounded-lg w-20"></div>
          </div>
          
          {/* Stock status skeleton - fixed height */}
          <div className="h-5">
            <div className="h-4 bg-gray-200 rounded-full w-24"></div>
          </div>
          
          {/* Button skeleton */}
          <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};
