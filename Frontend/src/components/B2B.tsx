import { Building2, Phone, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useReveal } from '@/hooks/useScrollAnimations';

const benefits = [
  'Competitive wholesale pricing',
  'Bulk orders from 50kg+',
  'Custom packaging available',
  'Pan-India logistics support',
  'GST invoice provided',
  'Dedicated account manager',
];

export default function B2B() {
  const { ref, inView } = useReveal<HTMLDivElement>();

  return (
    <section id="b2b" className="py-24 bg-cream-50 relative overflow-hidden">
      <div className="absolute top-10 right-0 w-80 h-80 bg-primary-100/40 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6">
        <div
          ref={ref}
          className={`reveal ${inView ? 'in-view' : ''} bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 rounded-[2.5rem] p-8 lg:p-14 overflow-hidden relative shadow-2xl shadow-ink-900/20`}
        >
          {/* Decorative gradient orb */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary-500/10 rounded-full blur-3xl" />

          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary-500/20 text-primary-300 px-4 py-2 rounded-full text-sm font-medium">
                <Building2 className="w-4 h-4" />
                Bulk / B2B Orders
              </div>

              <h2 className="font-display text-4xl lg:text-5xl font-bold text-cream-50 leading-tight">
                Looking to Stock
                <br />
                <span className="shimmer-text">Farm2Feast Makhana?</span>
              </h2>

              <p className="text-cream-200/80 leading-relaxed max-w-md">
                We partner with retailers, distributors, HoReCa businesses and corporates across
                India. Get premium makhana at wholesale prices with reliable supply.
              </p>

              <ul className="grid sm:grid-cols-2 gap-3">
                {benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-cream-200/90 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right - Contact card */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
              <h3 className="font-display text-2xl font-bold text-cream-50 mb-6">
                Get a Wholesale Quote
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-cream-300 mb-1.5">
                    Business Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your company / store name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream-50 placeholder-cream-300/40 text-sm focus:outline-none focus:border-primary-400 focus:bg-white/10 transition-all"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-cream-300 mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 ..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream-50 placeholder-cream-300/40 text-sm focus:outline-none focus:border-primary-400 focus:bg-white/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cream-300 mb-1.5">
                      Quantity (kg)
                    </label>
                    <input
                      type="number"
                      placeholder="50+"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream-50 placeholder-cream-300/40 text-sm focus:outline-none focus:border-primary-400 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <button className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3.5 rounded-xl hover:from-primary-600 hover:to-primary-700 hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300 group">
                  Request Quote
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-white/10">
                  <a href="tel:+917479656531" className="flex items-center gap-2 text-cream-300 text-sm hover:text-primary-300 transition-colors">
                    <Phone className="w-4 h-4" />
                    +91 7479 656531
                  </a>
                  <a href="mailto:care@shhefood.com" className="flex items-center gap-2 text-cream-300 text-sm hover:text-primary-300 transition-colors">
                    <Mail className="w-4 h-4" />
                    care@shhefood.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
