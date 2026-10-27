import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, ArrowRight } from 'lucide-react';

const footerLinks = {
  Shop: ['All Products', 'Makhana', 'Cookies', 'Combo Packs', 'Best Sellers'],
  Company: ['Our Story', 'About Mithila', 'Quality Promise', 'Blog', 'Careers'],
  Support: ['Track Order', 'Shipping Policy', 'Returns & Refunds', 'FAQs', 'Contact Us'],
};

export default function Footer() {
  return (
    <footer className="bg-ink-950 text-cream-200/70 relative overflow-hidden">
      {/* Newsletter strip */}
      <div className="border-b border-ink-800">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl font-bold text-cream-50 mb-1">
              Join the Makhana Movement
            </h3>
            <p className="text-sm text-cream-300/60">
              Get exclusive offers, new product alerts and healthy snack tips.
            </p>
          </div>
          <div className="flex w-full lg:w-auto gap-3 max-w-md">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-ink-800 border border-ink-700 rounded-full px-5 py-3 text-cream-50 placeholder-cream-300/40 text-sm focus:outline-none focus:border-primary-400 transition-colors"
            />
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-6 py-3 rounded-full hover:from-primary-600 hover:to-primary-700 transition-all duration-300 group flex-shrink-0">
              Subscribe
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-5 gap-10">
        {/* Brand */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="font-display font-bold text-white text-lg">F2F</span>
            </div>
            <div className="leading-none">
              <span className="font-display text-2xl font-bold text-cream-50 block">Farm2Feast</span>
              <span className="text-[10px] tracking-[0.2em] text-primary-400 uppercase">Makhana</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed max-w-sm">
            Bihar\u2019s finest roasted makhana \u2014 baked, not fried. Sourced from the ponds of
            Mithila and packed fresh in Darbhanga. 100% natural, protein-rich and gluten-free.
          </p>
          <div className="space-y-2 text-sm">
            <a href="tel:+917479656531" className="flex items-center gap-2 hover:text-primary-400 transition-colors">
              <Phone className="w-4 h-4" /> +91 7479 656531
            </a>
            <a href="mailto:care@shhefood.com" className="flex items-center gap-2 hover:text-primary-400 transition-colors">
              <Mail className="w-4 h-4" /> care@shhefood.com
            </a>
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Darbhanga, Bihar 846001, India
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            {[Instagram, Facebook, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 rounded-full bg-ink-800 flex items-center justify-center text-cream-300 hover:bg-primary-500 hover:text-white transition-all duration-300 hover:scale-110"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="font-display text-lg font-semibold text-cream-50 mb-4">{title}</h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm hover:text-primary-400 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ink-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream-300/50">
          <p>\u00a9 2026 ShheFood. All rights reserved. Made with care in Mithila, Bihar.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
