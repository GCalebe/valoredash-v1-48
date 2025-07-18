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
    dragFree: false,
    containScroll: 'trimSnaps'
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(false);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  console.log('KPICarousel render:', { cardsLength: cards.length, loading, emblaApi: !!emblaApi });

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      console.log('Scrolling prev');
      emblaApi.scrollPrev();
      // Pause auto-play when user interacts
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 10000); // Resume after 10s
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      console.log('Scrolling next');
      emblaApi.scrollNext();
      // Pause auto-play when user interacts
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 10000); // Resume after 10s
    }
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: any) => {
    const index = emblaApi.selectedScrollSnap();
    console.log('Embla onSelect:', { index, canScrollPrev: emblaApi.canScrollPrev(), canScrollNext: emblaApi.canScrollNext() });
    setSelectedIndex(index);
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  // Handle user drag interaction
  const onPointerDown = useCallback(() => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume after 10s
  }, []);

  useEffect(() => {
    if (!emblaApi) {
      console.log('KPICarousel: emblaApi not ready');
      return;
    }

    console.log('KPICarousel: setting up embla listeners');
    onSelect(emblaApi);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('pointerDown', onPointerDown);

    return () => {
      if (emblaApi) {
        emblaApi.off('select', onSelect);
        emblaApi.off('reInit', onSelect);
        emblaApi.off('pointerDown', onPointerDown);
      }
    };
  }, [emblaApi, onSelect, onPointerDown]);

  // Auto-play effect
  useEffect(() => {
    if (!emblaApi || !isAutoPlaying) return;

    const autoplay = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 4000); // Changed to 4 seconds for better UX

    return () => clearInterval(autoplay);
  }, [emblaApi, isAutoPlaying]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        console.log('Scrolling to index:', index);
        emblaApi.scrollTo(index);
        // Pause auto-play when user interacts
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000); // Resume after 10s
      }
    },
    [emblaApi]
  );

  if (!cards || cards.length === 0) {
    console.log('KPICarousel: No cards to display');
    return <div>Nenhum dado disponível</div>;
  }

  return (
    <div className="relative group">
      {/* Auto-play indicator */}
      <div className="absolute top-2 right-2 z-10">
        <div className={`w-2 h-2 rounded-full transition-colors ${isAutoPlaying ? 'bg-green-500' : 'bg-gray-400'}`} />
      </div>
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
          {cards.map((_, index) => (
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
      <div 
        className="overflow-hidden cursor-grab active:cursor-grabbing" 
        ref={emblaRef}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="flex">
          {cards.map((card, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 pl-4 first:pl-0"
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