import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Tag, ArrowRight, ShieldCheck } from 'lucide-react';
import { FESTIVAL_TILES, FestivalTile } from '../data/products';

interface FestivalTilesBannerProps {
  onSelectCategory: (categoryKey: string) => void;
  selectedCategory: string;
}

export const FestivalTilesBanner: React.FC<FestivalTilesBannerProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 380;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleTileClick = (catKey: string) => {
    onSelectCategory(catKey);
    const element = document.getElementById('catalog-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="festival-tiles-banner" className="relative w-full overflow-hidden bg-[#0d131a] py-4 sm:py-6">
      {/* Decorative festive ambient background */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Top Banner Sub-header */}
      <div className="mx-auto mb-3 flex max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-slate-950">
            <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <h2 className="text-sm font-bold tracking-wide uppercase text-amber-400 sm:text-base">
            Great Indian Festival · Early Deals Live
          </h2>
          <span className="hidden rounded bg-red-600/90 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white md:inline">
            Limited Time Offers
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-slate-400 sm:inline">Click any deal tile to filter</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-all hover:bg-white/20 active:scale-95"
              aria-label="Previous tiles"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-all hover:bg-white/20 active:scale-95"
              aria-label="Next tiles"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative mx-auto max-w-7xl px-2 sm:px-4">
        {/* Carousel Next Arrow overlay */}
        <button
          onClick={() => scroll('right')}
          className="group absolute -right-1 sm:right-2 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center justify-center rounded-l-lg bg-white/95 px-2 py-8 text-slate-900 shadow-2xl transition-all hover:bg-amber-400 hover:scale-105 md:flex"
          aria-label="Slide next tiles"
        >
          <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-0.5" />
        </button>

        {/* Carousel Prev Arrow overlay */}
        <button
          onClick={() => scroll('left')}
          className="group absolute -left-1 sm:left-2 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center justify-center rounded-r-lg bg-white/95 px-2 py-8 text-slate-900 shadow-2xl transition-all hover:bg-amber-400 hover:scale-105 md:flex"
          aria-label="Slide previous tiles"
        >
          <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-0.5" />
        </button>

        {/* Tiles Flex / Grid */}
        <div
          ref={scrollContainerRef}
          className="no-scrollbar flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth px-2 pb-2 pt-1"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {FESTIVAL_TILES.map((tile, idx) => {
            const isSelected = selectedCategory === tile.categoryKey;

            return (
              <div
                key={tile.id}
                onClick={() => handleTileClick(tile.categoryKey)}
                style={{ scrollSnapAlign: 'start' }}
                className={`group relative flex h-[480px] w-[275px] sm:w-[305px] shrink-0 cursor-pointer flex-col justify-between overflow-hidden rounded-xl border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl ${
                  isSelected
                    ? 'border-amber-400 ring-4 ring-amber-400/40 shadow-amber-500/20'
                    : 'border-white/20 hover:border-amber-300'
                }`}
              >
                {/* Decorative festive string lights border overlay */}
                <div className="pointer-events-none absolute inset-0 z-10 rounded-xl border border-dashed border-amber-200/50" />
                <div className="pointer-events-none absolute top-1 left-2 right-2 z-10 flex justify-between">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-200 shadow-[0_0_6px_#fef08a]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-300 shadow-[0_0_6px_#fde047]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-200 shadow-[0_0_6px_#fef08a]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-300 shadow-[0_0_6px_#fdba74]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-200 shadow-[0_0_6px_#fef08a]" />
                </div>

                {/* Card Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-b ${tile.bgGradient} opacity-95`} />

                {/* TOP HEADER SECTION OF TILE */}
                <div className="relative z-10 p-3 sm:p-4 text-white">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-md">
                      {tile.headerPreText}
                    </span>
                    <span className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-md">
                      {tile.headerMainText}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-white/90 drop-shadow">
                    {tile.headerSubText}
                  </p>
                </div>

                {/* MIDDLE HERO IMAGE CONTAINER */}
                <div className="relative z-10 mx-2 flex-1 overflow-hidden rounded-lg bg-black/10 shadow-inner">
                  <img
                    src={tile.image}
                    alt={tile.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Prime / Offer Badge Overlay on Image */}
                  {tile.badgeText && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex flex-col items-center justify-center rounded-md bg-white/95 py-1 px-2 text-center shadow-lg backdrop-blur">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">
                          Shop early deals now
                        </span>
                        <span className="font-['Syne',sans-serif] text-xs font-black text-slate-900">
                          Great Indian Festival
                        </span>
                        <span className="text-[9px] font-bold text-slate-600">
                          Starts 8th Oct
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Hover indicator button */}
                  <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>

                {/* BOTTOM BANK DISCOUNT STRIP (SBI CARD OFFER) */}
                <div className="relative z-10 mt-2 bg-white px-2.5 py-2 text-slate-900">
                  <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-1">
                    <div className="flex items-center gap-1">
                      <span className="rounded bg-sky-700 px-1 py-0.5 text-[8px] font-extrabold text-white">
                        SBI
                      </span>
                      <span className="text-[9px] font-black text-sky-800 tracking-tight">
                        Debit Card | Card
                      </span>
                    </div>
                    <span className="text-[8px] font-bold text-slate-500">*T&amp;C apply</span>
                  </div>

                  <div className="mt-1 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black leading-tight text-slate-900">
                        10% Instant Discount*
                      </p>
                      <p className="text-[8px] text-slate-600">
                        on Debit/Credit Card &amp; EMI
                      </p>
                    </div>

                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 transition-colors group-hover:bg-amber-400 group-hover:text-slate-950">
                      Explore &gt;
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
