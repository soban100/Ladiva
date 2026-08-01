import React from 'react';
import { cn } from '../../lib/utils';
import type { Category } from '../../types';

export interface CategoryFilterBarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  className?: string;
}

const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  className,
}) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {/* All Products Button */}
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            'px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200',
            'border-2 flex items-center gap-2',
            selectedCategory === null
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-transparent shadow-lg shadow-primary-500/20'
              : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:text-primary-600'
          )}
        >
          All Products
        </button>

        {/* Category Buttons */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              'px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200',
              'border-2 flex items-center gap-2',
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-transparent shadow-lg shadow-primary-500/20'
                : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:text-primary-600'
            )}
          >
            {category.image_url && (
              <img
                src={category.image_url}
                alt=""
                className="w-5 h-5 rounded-full object-cover"
              />
            )}
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export { CategoryFilterBar };
