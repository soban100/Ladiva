import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import type { Category } from '../../types';

export interface CategoryCardProps {
  category: Category;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  icon: Icon,
  className,
}) => {
  return (
    <Link to={`/category/${category.slug}`}>
      <Card variant="elevated" className={cn('group cursor-pointer overflow-hidden max-w-[282px] w-full', className)}>
        {/* Category Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={category.image_url || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            decoding="async"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          
          {/* Category Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            {Icon && (
              <div className="flex items-center space-x-2 mb-2">
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium uppercase tracking-wider opacity-90">
                  {category.name}
                </span>
              </div>
            )}
            <h3 className="text-xl font-bold mb-1">{category.name}</h3>
            <p className="text-sm opacity-90">Explore Collection</p>
          </div>

          {/* Quick Action Button */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <ArrowRight className="w-4 h-4 text-gray-800" />
            </div>
          </div>
        </div>

        {/* Category Description */}
        <div className="p-4 bg-white dark:bg-gray-800 transition-colors duration-300">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {category.description}
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-3 p-0 text-primary-600 hover:text-primary-700"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Shop Now
          </Button>
        </div>
      </Card>
    </Link>
  );
};

export { CategoryCard };
