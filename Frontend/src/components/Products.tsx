import { useState } from 'react';
import { ShoppingCart, Star, Plus } from 'lucide-react';
import { products, type Product } from '@/data/products';
import { useReveal } from '@/hooks/useScrollAnimations';

const categories = ['All', 'Makhana', 'Cookies', 'Combo'] as const;

function ProductCard({ product, delay }: { product: Product; delay: number }) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'in-view' : ''} group relative bg-white rounded-3xl overflow-hidden shadow-lg shadow-ink-900/5 border border-cream-200 hover:shadow-2xl hover:shadow-primary-900/10 hover:-translate-y-2 transition-all duration-500`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-cream-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Discount badge */}
        <div className="absolute top-4 left-4 bg-gradient-to-br from-accent-500 to-accent-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
          {discount}% OFF
        </div>

        {/* Category tag */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-ink-700 text-xs font-medium px-3 py-1.5 rounded-full">
          {product.category}
        </div>

        {/* Quick add */}
        <button className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-primary-600 hover:scale-110 transition-all duration-300">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-1 text-warning-400 text-xs">
          {'\u2605'.repeat(5)}
          <span className="text-ink-400 ml-1">(4.9)</span>
        </div>

        <h3 className="font-display text-lg font-bold text-ink-900 leading-snug group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex flex-wrap gap-1.5">
          {product.badges.slice(0, 2).map((badge) => (
            <span key={badge} className="text-[10px] bg-secondary-50 text-secondary-700 px-2 py-1 rounded-full font-medium">
              {badge}
            </span>
          ))}
        </div>

        <div className="flex items-end justify-between pt-2">
          <div>
            <p className="text-xs text-ink-400">{product.weight}</p>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold text-primary-600">
                \u20b9{product.price}
              </span>
              <span className="text-sm text-ink-300 line-through">
                \u20b9{product.mrp}
              </span>
            </div>
          </div>
          <button className="inline-flex items-center gap-1.5 bg-ink-900 text-white text-sm font-medium px-4 py-2.5 rounded-full hover:bg-primary-600 transition-colors duration-300">
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [active, setActive] = useState<(typeof categories)[number]>('All');
  const filtered = active === 'All' ? products : products.filter((p) => p.category === active);
  const { ref, inView } = useReveal<HTMLDivElement>();

  return (
    <section id="products" className="py-24 bg-cream-50 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-20 right-0 w-80 h-80 bg-primary-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-72 h-72 bg-secondary-100/40 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div
          ref={ref}
          className={`reveal ${inView ? 'in-view' : ''} text-center mb-12 space-y-3`}
        >
          <span className="inline-block text-sm font-semibold tracking-[0.2em] uppercase text-primary-600">
            Our Collection
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-ink-900">
            Premium Makhana, Crafted with Care
          </h2>
          <p className="text-ink-500 max-w-xl mx-auto">
            From classic roasted to exciting new flavours \u2014 every batch is baked, not fried,
            and packed fresh from Darbhanga.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                active === cat
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white text-ink-600 border border-cream-200 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} delay={i * 0.08} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <a
            href="#b2b"
            className="inline-flex items-center gap-2 bg-ink-900 text-white font-semibold px-8 py-4 rounded-full hover:bg-primary-600 hover:-translate-y-1 transition-all duration-300 shadow-lg"
          >
            <Star className="w-4 h-4 text-primary-400" />
            View All 31+ Products
          </a>
        </div>
      </div>
    </section>
  );
}
