import { Users, Package, Leaf, Award } from 'lucide-react';
import { useReveal, useCountUp } from '@/hooks/useScrollAnimations';

const stats = [
  { icon: Users, value: 100000, suffix: '+', label: 'Happy Customers' },
  { icon: Package, value: 31, suffix: '+', label: 'Products' },
  { icon: Leaf, value: 100, suffix: '%', label: 'Natural' },
  { icon: Award, value: 15, suffix: '+', label: 'Years of Trust' },
];

function StatCard({ icon: Icon, value, suffix, label, delay }: {
  icon: typeof Users;
  value: number;
  suffix: string;
  label: string;
  delay: number;
}) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  const count = useCountUp(value, inView);

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'in-view' : ''} text-center group`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
        <Icon className="w-6 h-6" />
      </div>
      <p className="font-display text-4xl font-bold text-ink-900">
        {count.toLocaleString('en-IN')}{suffix}
      </p>
      <p className="text-sm text-ink-500 font-medium mt-1">{label}</p>
    </div>
  );
}

export default function Stats() {
  return (
    <section className="relative -mt-8 z-10 bg-cream-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-ink-900/5 p-8 lg:p-12 border border-cream-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <StatCard key={stat.label} {...stat} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
