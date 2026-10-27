const items = [
  'Baked, Not Fried',
  'High in Protein',
  'Gluten-Free',
  '100% Natural',
  'No Artificial Colours',
  'Sourced from Mithila',
  'Perfect for Vrat',
  'No Preservatives',
  'Vegan Friendly',
  'Rich in Calcium',
];

export default function Marquee() {
  return (
    <div className="bg-ink-900 py-5 overflow-hidden relative">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center gap-3 mx-6 text-cream-100 font-medium text-sm tracking-wide">
            {item}
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
          </span>
        ))}
      </div>
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink-900 to-transparent z-10 pointer-events-none" />
    </div>
  );
}
