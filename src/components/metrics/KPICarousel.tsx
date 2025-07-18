import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatCard from './StatCard';

interface KPICarouselProps {
  cards: Array<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend: string;
    iconBgClass: string;
    iconTextClass: string;
  }>;
  loading: boolean;
}

const KPICarousel: React.FC<KPICarouselProps> = ({ cards, loading }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { slidesToScroll: 3 },
      '(min-width: 1280px)': { slidesToScroll: 4 },
    }
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(false);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onInit = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);

    // Auto-play functionality
    const autoplay = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000);

    return () => {
      clearInterval(autoplay);
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
      emblaApi.off('reInit', onInit);
    };
  }, [emblaApi, onInit, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={scrollPrev}
          disabled={prevBtnDisabled}
          className="h-8 w-8 p-0 rounded-full shadow-sm hover:shadow-md transition-shadow"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Dots indicator */}
        <div className="flex gap-2">
          {Array.from({ length: cards.length }).map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index === selectedIndex 
                  ? 'bg-primary scale-125' 
                  : 'bg-muted hover:bg-muted-foreground/50'
              }`}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={scrollNext}
          disabled={nextBtnDisabled}
          className="h-8 w-8 p-0 rounded-full shadow-sm hover:shadow-md transition-shadow"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {cards.map((card, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] pr-4"
            >
              <div className="transform transition-transform duration-300 hover:scale-105">
                <StatCard
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  trend={card.trend}
                  loading={loading}
                  iconBgClass={card.iconBgClass}
                  iconTextClass={card.iconTextClass}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 bg-muted rounded-full h-1 overflow-hidden">
        <div 
          className="bg-primary h-full transition-all duration-300 ease-out"
          style={{ 
            width: `${((selectedIndex + 1) / cards.length) * 100}%` 
          }}
        />
      </div>
    </div>
  );
};

export default KPICarousel;