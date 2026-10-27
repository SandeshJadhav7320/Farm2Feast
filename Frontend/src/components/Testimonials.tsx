import { useState, useEffect, useCallback } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { testimonials } from '@/data/products';
import { useReveal } from '@/hooks/useScrollAnimations';

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const { ref, inView } = useReveal<HTMLDivElement>();

  const next = useCallback(() => setCurrent((p) => (p + 1) % testimonials.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section id="testimonials" className="py-24 bg-ink-900 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto px-6">
        <div
          ref={ref}
          className={`reveal ${inView ? 'in-view' : ''} text-center mb-12 space-y-3`}
        >
          <span className="inline-block text-sm font-semibold tracking-[0.2em] uppercase text-primary-400">
            Customer Love
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream-50">
            What Our Customers Say
          </h2>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {testimonials.map((t) => (
                <div key={t.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-gradient-to-br from-ink-800 to-ink-900 rounded-3xl p-8 lg:p-10 border border-ink-700 relative">
                    <Quote className="absolute top-6 right-6 w-16 h-16 text-primary-500/10" />

                    <div className="flex text-warning-400 mb-4">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>

                    <p className="text-cream-100 text-lg lg:text-xl leading-relaxed font-light mb-6 relative z-10">
                      \u201c{t.text}\u201d
                    </p>

                    <div className="flex items-center gap-4 pt-4 border-t border-ink-700">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-display font-bold text-lg">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-cream-50">{t.name}</p>
                        <p className="text-sm text-ink-300">{t.location}</p>
                      </div>
                      <div className="ml-auto text-right hidden sm:block">
                        <p className="text-xs text-ink-400">Purchased</p>
                        <p className="text-sm text-primary-400 font-medium">{t.product}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <button
            onClick={prev}
            className="absolute top-1/2 -translate-y-1/2 -left-2 lg:-left-6 w-11 h-11 rounded-full bg-ink-800 text-cream-100 flex items-center justify-center hover:bg-primary-500 transition-colors border border-ink-700"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute top-1/2 -translate-y-1/2 -right-2 lg:-right-6 w-11 h-11 rounded-full bg-ink-800 text-cream-100 flex items-center justify-center hover:bg-primary-500 transition-colors border border-ink-700"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? 'w-8 bg-primary-500' : 'w-2 bg-ink-600 hover:bg-ink-500'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
