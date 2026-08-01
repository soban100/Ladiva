import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Play } from 'lucide-react';
import { Button } from '../ui/Button';
import { Container } from '../layout/Container';
import { cn } from '../../lib/utils';

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  cta?: {
    text: string;
    link: string;
    variant?: 'primary' | 'secondary';
  };
  video?: string;
}

export interface HeroSectionProps {
  slides: HeroSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  showNavigation?: boolean;
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
  showIndicators = true,
  showNavigation = true,
  className,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPreviousSlide = () => {
    setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
  };

  const goToNextSlide = () => {
    setCurrentSlide((currentSlide + 1) % slides.length);
  };

  const handleCtaClick = (link: string) => {
    if (link.startsWith('/')) {
      navigate(link);
    } else {
      window.open(link, '_blank');
    }
  };

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const timer = setInterval(() => {
      goToNextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, slides.length, currentSlide]);

  if (slides.length === 0) return null;

  const currentSlideData = slides[currentSlide];

  return (
    <section className={cn('relative h-screen overflow-hidden', className)}>
      {/* Slides */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000',
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            )}
          >
            {/* Background Image or Video */}
            {slide.video ? (
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src={slide.video} type="video/mp4" />
              </video>
            ) : (
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                loading={index === currentSlide ? 'eager' : 'lazy'}
                decoding={index === currentSlide ? 'sync' : 'async' as 'async'}
              />
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
      </div>

      {/* Content */}
      <Container className="relative z-10 h-full flex items-center">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            {currentSlideData.title}
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-8 max-w-3xl mx-auto leading-relaxed">
            {currentSlideData.subtitle}
          </p>
          
          {currentSlideData.cta && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant={currentSlideData.cta.variant || 'primary'}
                size="xl"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
                onClick={() => handleCtaClick(currentSlideData.cta!.link)}
              >
                {currentSlideData.cta.text}
              </Button>
              
              {currentSlideData.video && (
                <Button
                  variant="secondary"
                  size="xl"
                  icon={<Play className="w-5 h-5" />}
                  onClick={() => handleCtaClick(currentSlideData.video)}
                >
                  Watch Video
                </Button>
              )}
            </div>
          )}
        </div>
      </Container>

      {/* Navigation */}
      {showNavigation && slides.length > 1 && (
        <>
          <button
            onClick={goToPreviousSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={goToNextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'transition-all duration-200 rounded-full',
                index === currentSlide
                  ? 'w-8 h-3 bg-white'
                  : 'w-3 h-3 bg-white/50 hover:bg-white/75'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export { HeroSection };
