import { Flame, Wheat, Leaf, ShieldCheck, Sparkles, HeartPulse } from 'lucide-react';
import { useReveal } from '@/hooks/useScrollAnimations';

const features = [
  {
    icon: Flame,
    title: 'Baked, Not Fried',
    description: 'Slow-baked at controlled temperatures to preserve nutrients. Zero oil, zero guilt \u2014 just pure crunch.',
    color: 'from-primary-400 to-primary-600',
    bg: 'bg-primary-50',
  },
  {
    icon: Wheat,
    title: 'High in Protein',
    description: 'Makhana is naturally rich in protein and calcium. A superfood snack that fuels your body right.',
    color: 'from-secondary-400 to-secondary-600',
    bg: 'bg-secondary-50',
  },
  {
    icon: Leaf,
    title: 'Naturally Gluten-Free',
    description: '100% gluten-free and vegan. Safe for everyone, perfect for fasting days and clean eating.',
    color: 'from-accent-400 to-accent-600',
    bg: 'bg-accent-50',
  },
  {
    icon: ShieldCheck,
    title: 'No Artificial Colours',
    description: 'No preservatives, no artificial flavours, no shortcuts. Just real ingredients from nature.',
    color: 'from-ink-600 to-ink-800',
    bg: 'bg-ink-50',
  },
  {
    icon: Sparkles,
    title: 'Packed Fresh in Darbhanga',
    description: 'Sourced and packed at our facility in the heart of Mithila. From pond to pack, we control every step.',
    color: 'from-primary-500 to-accent-500',
    bg: 'bg-cream-100',
  },
  {
    icon: HeartPulse,
    title: 'Perfect for Healthy Living',
    description: 'Low in calories, high in fibre. Recommended by nutritionists for weight management and heart health.',
    color: 'from-secondary-500 to-primary-500',
    bg: 'bg-secondary-50',
  },
];

function FeatureCard({ icon: Icon, title, description, color, bg, delay }: {
  icon: typeof Flame;
  title: string;
  description: string;
  color: string;
  bg: string;
  delay: number;
}) {
  const { ref, inView } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'in-view' : ''} group relative bg-white rounded-3xl p-7 border border-cream-200 hover:shadow-2xl hover:shadow-ink-900/5 hover:-translate-y-2 transition-all duration-500 overflow-hidden`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Hover gradient bg */}
      <div className={`absolute inset-0 ${bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative">
        <div className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${color} text-white items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-lg`}>
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="font-display text-xl font-bold text-ink-900 mb-2 group-hover:text-ink-900">
          {title}
        </h3>
        <p className="text-sm text-ink-500 leading-relaxed group-hover:text-ink-600">
          {description}
        </p>
      </div>

      {/* Corner accent */}
      <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-700`} />
    </div>
  );
}

export default function Features() {
  const { ref, inView } = useReveal<HTMLDivElement>();

  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, #ee8512 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      <div className="relative max-w-7xl mx-auto px-6">
        <div
          ref={ref}
          className={`reveal ${inView ? 'in-view' : ''} text-center mb-14 space-y-3`}
        >
          <span className="inline-block text-sm font-semibold tracking-[0.2em] uppercase text-primary-600">
            Why Choose ShheFood
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-ink-900">
            Superfood Snacking, Done Right
          </h2>
          <p className="text-ink-500 max-w-xl mx-auto">
            We don\u2019t just sell makhana \u2014 we\u2019re on a mission to bring the cleanest,
            healthiest snack from Mithila to the rest of India.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}
