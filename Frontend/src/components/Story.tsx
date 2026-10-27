import { MapPin, Sprout, Factory, Truck } from 'lucide-react';
import { useReveal } from '@/hooks/useScrollAnimations';

const pondImage = 'https://images.pexels.com/photos/19224053/pexels-photo-19224053.jpeg?auto=compress&cs=tinysrgb&h=900&w=800';
const lotusImage = 'https://images.pexels.com/photos/9743362/pexels-photo-9743362.jpeg?auto=compress&cs=tinysrgb&h=600&w=600';

const journey = [
  {
    icon: Sprout,
    title: 'Cultivated in Mithila',
    text: 'Our makhana grows in the natural ponds of Darbhanga and Madhubani \u2014 the traditional heartland of fox nut farming.',
  },
  {
    icon: Factory,
    title: 'Baked & Packed Fresh',
    text: 'Each batch is slow-baked, seasoned with natural spices, and packed at our Darbhanga facility within hours.',
  },
  {
    icon: Truck,
    title: 'Delivered Pan-India',
    text: 'From Bihar to your doorstep \u2014 we ship across India so you can enjoy authentic Mithila makhana anywhere.',
  },
];

export default function Story() {
  const { ref, inView } = useReveal<HTMLDivElement>();
  const { ref: ref2, inView: inView2 } = useReveal<HTMLDivElement>();

  return (
    <section id="story" className="py-24 bg-gradient-to-b from-cream-50 to-cream-100 relative overflow-hidden">
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* Visuals */}
        <div ref={ref} className={`reveal ${inView ? 'in-view' : ''} relative`}>
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-ink-900/10 aspect-[4/5]">
            <img src={pondImage} alt="Lotus pond in Mithila, Bihar" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span className="text-sm font-medium">Darbhanga, Bihar</span>
              </div>
              <p className="font-display text-2xl font-bold">The Ponds of Mithila</p>
            </div>
          </div>

          {/* Floating accent image */}
          <div className="absolute -top-6 -right-6 w-40 h-40 rounded-3xl overflow-hidden shadow-xl ring-4 ring-cream-50 animate-float hidden lg:block">
            <img src={lotusImage} alt="Pink lotus flower" className="w-full h-full object-cover" />
          </div>

          {/* Floating stat */}
          <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 animate-float-delayed hidden lg:block">
            <p className="font-display text-3xl font-bold text-primary-600">100%</p>
            <p className="text-xs text-ink-500 font-medium">Naturally Cultivated</p>
          </div>
        </div>

        {/* Content */}
        <div ref={ref2} className={`reveal ${inView2 ? 'in-view' : ''} space-y-6`}>
          <span className="inline-block text-sm font-semibold tracking-[0.2em] uppercase text-primary-600">
            Our Story
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-ink-900 leading-tight">
            From the Ponds of Mithila to Your Snack Bowl
          </h2>
          <p className="text-ink-600 leading-relaxed">
            ShheFood was born in Darbhanga, Bihar \u2014 a region with centuries of makhana
            cultivation heritage. We work directly with local farmers who harvest fox nuts from
            natural ponds using traditional methods passed down through generations.
          </p>
          <p className="text-ink-600 leading-relaxed">
            Every pack of ShheFood makhana carries the soul of Mithila. We bake instead of fry,
            use only natural seasonings, and pack everything fresh so you get the same quality
            our families have enjoyed for years.
          </p>

          {/* Journey steps */}
          <div className="space-y-5 pt-4">
            {journey.map((step, i) => (
              <div
                key={step.title}
                className={`reveal ${inView2 ? 'in-view' : ''} flex gap-4 group`}
                style={{ animationDelay: `${0.3 + i * 0.15}s` }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-primary-500 group-hover:to-primary-600 group-hover:text-white transition-all duration-300">
                  <step.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink-900 mb-0.5">
                    {step.title}
                  </h3>
                  <p className="text-sm text-ink-500 leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
