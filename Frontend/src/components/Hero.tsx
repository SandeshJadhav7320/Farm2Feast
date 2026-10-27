import { useEffect, useState } from 'react';
import { Flame, Wheat, Leaf } from 'lucide-react';
import { useScrollPosition } from '@/hooks/useScrollAnimations';

const heroImages = [
  {
    src: 'https://images.pexels.com/photos/7051132/pexels-photo-7051132.jpeg?auto=compress&cs=tinysrgb&h=900&w=900',
    alt: 'Premium roasted makhana in a rustic bowl',
  },
  {
    src: 'https://images.pexels.com/photos/10111993/pexels-photo-10111993.jpeg?auto=compress&cs=tinysrgb&h=900&w=900',
    alt: 'Assorted roasted nuts prepared for healthy snacking',
  },
  {
    src: 'https://images.pexels.com/photos/8817793/pexels-photo-8817793.jpeg?auto=compress&cs=tinysrgb&h=900&w=900',
    alt: 'A colorful selection of wholesome roasted snacks',
  },
  {
    src: 'https://images.pexels.com/photos/5472169/pexels-photo-5472169.jpeg?auto=compress&cs=tinysrgb&h=900&w=900',
    alt: 'Premium mixed nuts in a serving bowl',
  },
] as const;
const pondImage = 'https://images.pexels.com/photos/19224053/pexels-photo-19224053.jpeg?auto=compress&cs=tinysrgb&h=900&w=1200';

export default function Hero() {
  const scrollY = useScrollPosition();
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeroImageIndex((current) => (current + 1) % heroImages.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const heroImage = heroImages[heroImageIndex];

  return (
    <section id="home" className="relative min-h-screen overflow-hidden bg-cream-50">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-hero-radial" />
      <div className="absolute inset-0 bg-gradient-to-b from-cream-100 via-cream-50 to-cream-50" />

      {/* Decorative blurred circles */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-primary-200/40 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-10 -right-10 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl animate-float-delayed" />

      {/* Floating decorative elements */}
      <div
        className="absolute top-32 right-[15%] w-16 h-16 rounded-full bg-primary-300/20 blur-xl animate-float"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      />
      <div
        className="absolute bottom-40 left-[10%] w-20 h-20 rounded-full bg-secondary-300/20 blur-xl animate-float-delayed"
        style={{ transform: `translateY(${scrollY * -0.2}px)` }}
      />

      <div className="relative max-w-7xl mx-auto px-6 pt-12 lg:pt-20 pb-16 grid lg:grid-cols-2 gap-12 items-center min-h-[90vh]">
        {/* Left content */}
        <div className="space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium animate-fade-up">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            Straight from the ponds of Mithila, Bihar
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-ink-900 leading-[1.1] text-balance animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Bihar\u2019s Finest
            <br />
            <span className="shimmer-text">Roasted Makhana</span>
          </h1>

          <p className="text-lg text-ink-600 max-w-lg leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Premium fox nuts, <strong className="text-ink-800">baked not fried</strong> and packed
            fresh in Darbhanga. Protein-rich, gluten-free and 100% natural \u2014 the superfood
            snack from the heart of Mithila.
          </p>

          <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <a
              href="#products"
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-8 py-4 rounded-full overflow-hidden shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 hover:-translate-y-1 transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Flame className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Shop Makhana</span>
            </a>
            <a
              href="#b2b"
              className="inline-flex items-center gap-2 bg-white text-ink-800 font-semibold px-8 py-4 rounded-full border-2 border-ink-200 hover:border-primary-400 hover:text-primary-600 hover:-translate-y-1 transition-all duration-300"
            >
              Bulk / B2B Orders
            </a>
          </div>

          {/* Mini badges */}
          <div className="flex flex-wrap gap-6 pt-4 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {[
              { icon: Flame, label: 'Baked, not fried' },
              { icon: Wheat, label: 'High protein' },
              { icon: Leaf, label: 'Gluten free' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-ink-600">
                <span className="w-8 h-8 rounded-full bg-secondary-100 text-secondary-700 flex items-center justify-center">
                  <item.icon className="w-4 h-4" />
                </span>
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right visual */}
        <div className="relative animate-scale-in" style={{ animationDelay: '0.2s' }}>
          {/* Main image circle */}
          <div className="relative mx-auto w-full max-w-md aspect-square">
            {/* Rotating ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary-300/40 animate-spin-slow" />
            <div className="absolute inset-4 rounded-full border border-primary-200/50 animate-spin-reverse-slow" />

            {/* Image */}
            <div className="absolute inset-8 rounded-full overflow-hidden shadow-2xl shadow-primary-900/20 ring-4 ring-white">
              <img
                key={heroImage.src}
                src={heroImage.src}
                alt={heroImage.alt}
                className="w-full h-full object-cover animate-fade-in animate-float"
                style={{ transform: `scale(${1 + scrollY * 0.0003})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent" />
            </div>

            {/* Floating price tag */}
            <div className="absolute top-4 -right-2 lg:right-0 bg-white rounded-2xl shadow-xl p-4 animate-float-delayed z-20">
              <p className="text-xs text-ink-400 font-medium">Starting from</p>
              <p className="text-2xl font-display font-bold text-primary-600">\u20b9249</p>
              <p className="text-xs text-ink-400 line-through">\u20b9379</p>
            </div>

            {/* Floating rating badge */}
            <div className="absolute bottom-8 -left-2 lg:left-0 bg-white rounded-2xl shadow-xl px-4 py-3 animate-float z-20">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['bg-primary-400', 'bg-secondary-400', 'bg-accent-400'].map((c, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white`} />
                  ))}
                </div>
                <div>
                  <div className="flex text-warning-400 text-xs">
                    {'\u2605'.repeat(5)}
                  </div>
                  <p className="text-[10px] text-ink-500 font-medium">100,000+ happy customers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pond image accent */}
          <div className="hidden lg:block absolute -bottom-6 -right-6 w-44 h-32 rounded-2xl overflow-hidden shadow-xl ring-4 ring-cream-50 animate-float-slow">
            <img src={pondImage} alt="Lotus pond in Mithila" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto" preserveAspectRatio="none">
          <path
            d="M0,60 C240,100 480,20 720,50 C960,80 1200,40 1440,70 L1440,120 L0,120 Z"
            fill="#fdfbf7"
          />
        </svg>
      </div>
    </section>
  );
}
