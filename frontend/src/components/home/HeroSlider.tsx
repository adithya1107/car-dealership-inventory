import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buttonStyles } from '../ui/styles';

interface Slide {
  watermark: string;
  image: string;
  alt: string;
  headline: ReactNode;
}

const slides: Slide[] = [
  {
    watermark: 'AUDI',
    image: '/images/hero/audi.png',
    alt: 'Red Audi sedan',
    headline: (
      <>
        <span className="block text-3xl font-bold md:text-5xl">Find Your Dream</span>
        <span className="block text-6xl font-extrabold text-brand md:text-7xl">CAR</span>
      </>
    ),
  },
  {
    watermark: 'TOYOTA',
    image: '/images/hero/toyota.png',
    alt: 'Orange and black Toyota coupe',
    headline: (
      <span className="block text-3xl font-bold leading-tight md:text-5xl">
        Best <span className="text-brand">Dealer</span> For Your Four Wheeler
      </span>
    ),
  },
  {
    watermark: 'AUDI Q7',
    image: '/images/hero/suv.png',
    alt: 'Black Audi Q7 SUV',
    headline: (
      <span className="block text-3xl font-bold leading-tight md:text-5xl">
        Room For <span className="text-brand">Everyone</span>, Power For Anything
      </span>
    ),
  },
];

const AUTO_ADVANCE_MS = 6000;

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const go = useCallback((i: number) => setIndex((i + slides.length) % slides.length), []);

  // Depends on `index`, so the timer restarts after a manual change.
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [index]);

  const slide = slides[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured cars"
      className="relative mx-auto max-w-7xl overflow-hidden px-6 pb-10"
    >
      <p
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 select-none text-center text-[6rem] font-extrabold uppercase leading-none text-navy/5 md:text-[13rem]"
      >
        {slide.watermark}
      </p>

      <div className="relative grid min-h-[380px] items-center gap-6 md:grid-cols-2">
        <div className="animate-fade-in" key={`text-${index}`}>
          {slide.headline}
          <Link to="/inventory" className={buttonStyles('navy', 'mt-6')}>
            Order Now <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <img
          key={slide.image}
          src={slide.image}
          alt={slide.alt}
          className="animate-fade-in mx-auto max-h-[320px] w-full object-contain drop-shadow-2xl"
        />
      </div>

      {/* Slide dots (vertical, right edge, like the design) */}
      <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col gap-2 md:flex">
        {slides.map((s, i) => (
          <button
            key={s.watermark}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`size-2.5 rounded-full transition ${i === index ? 'bg-brand' : 'bg-slate-300 hover:bg-slate-400'}`}
          />
        ))}
      </div>

      <div className="relative mt-4 flex justify-end gap-3">
        {[
          { label: 'Previous slide', icon: ChevronLeft, delta: -1 },
          { label: 'Next slide', icon: ChevronRight, delta: 1 },
        ].map(({ label, icon: Icon, delta }) => (
          <button
            key={label}
            onClick={() => go(index + delta)}
            aria-label={label}
            className="grid size-10 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5 transition hover:bg-brand hover:text-white"
          >
            <Icon size={18} aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}