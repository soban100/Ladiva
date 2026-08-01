import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { motion, useInView, useAnimation } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { Category } from '../../types';

export interface CategorySliderProps {
  categories: Category[];
  className?: string;
}

const CategorySlider: React.FC<CategorySliderProps> = ({
  categories,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  // Calculate items per view based on screen size
  const getItemsPerView = useCallback(() => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width < 640) return 1;
    if (width < 1024) return 2;
    if (width < 1280) return 3;
    return 4;
  }, []);

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getItemsPerView]);

  // Trigger entry animation when section comes into view
  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    
    const slider = sliderRef.current;
    const cardWidth = slider.children[0]?.clientWidth || 0;
    const gap = 24; // Tailwind gap-6
    const scrollAmount = (cardWidth + gap) * itemsPerView;
    
    if (direction === 'left') {
      slider.scrollTo({
        left: Math.max(0, slider.scrollLeft - scrollAmount),
        behavior: 'smooth'
      });
    } else {
      slider.scrollTo({
        left: Math.min(
          slider.scrollWidth - slider.clientWidth,
          slider.scrollLeft + scrollAmount
        ),
        behavior: 'smooth'
      });
    }
  }, [itemsPerView]);

  // Mouse drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(sliderRef.current?.scrollLeft || 0);
    sliderRef.current?.classList.add('cursor-grabbing');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - (sliderRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    sliderRef.current?.classList.remove('cursor-grabbing');
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    sliderRef.current?.classList.remove('cursor-grabbing');
  };

  // Touch swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(sliderRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    const x = e.touches[0].pageX - (sliderRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  // Check if arrows should be shown
  useEffect(() => {
    const checkArrows = () => {
      if (!sliderRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setShowArrows(scrollLeft > 0 || scrollLeft < scrollWidth - clientWidth);
    };

    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', checkArrows);
      checkArrows(); // Initial check
      return () => slider.removeEventListener('scroll', checkArrows);
    }
  }, [categories.length, itemsPerView]);

  // Animation variants for staggered entry
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94], // cubic-bezier for smooth motion
      }
    },
  };

  return (
    <div 
      ref={containerRef}
      className={cn('relative group', className)}
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      {/* Navigation Arrows - Desktop Only */}
      {showArrows && (
        <>
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white"
            aria-label="Previous categories"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white"
            aria-label="Next categories"
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>
        </>
      )}

      {/* Slider Container */}
      <div className="relative overflow-hidden">
        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth cursor-grab"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitScrollbar: { display: 'none' }
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="flex gap-6"
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                variants={itemVariants}
                className="flex-shrink-0 w-[282px]"
              >
                <Link to={`/category/${category.slug}`}>
                  <Card variant="elevated" className="group cursor-pointer overflow-hidden max-w-[282px] w-full transition-all duration-300 hover:shadow-2xl hover:scale-105">
                    {/* Category Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={category.image_url || 'https://via.placeholder.com/400x400?text=No+Image'}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      
                      {/* Category Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                        <p className="text-sm opacity-90">Explore Collection</p>
                      </div>

                      {/* Quick Action Button */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                        <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg ring-4 ring-white/20">
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
                        className="mt-3 p-0 text-primary-600 hover:text-primary-700 transition-colors duration-200"
                        icon={<ArrowRight className="w-4 h-4" />}
                        iconPosition="right"
                      >
                        Shop Now
                      </Button>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicators - Mobile */}
      <div className="flex justify-center mt-6 gap-2 md:hidden">
        {categories.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (sliderRef.current) {
                const cardWidth = sliderRef.current.children[0]?.clientWidth || 0;
                const gap = 24;
                sliderRef.current.scrollTo({
                  left: index * (cardWidth + gap),
                  behavior: 'smooth'
                });
              }
            }}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              index === Math.floor(currentIndex / itemsPerView)
                ? 'bg-primary-600 w-6'
                : 'bg-gray-300'
            )}
          />
        ))}
      </div>
    </div>
  );
};

export { CategorySlider };
