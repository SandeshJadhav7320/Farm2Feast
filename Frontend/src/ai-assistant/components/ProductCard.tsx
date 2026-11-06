
import { useState } from "react";
import { ShoppingBag, Package } from "lucide-react";
import type { Product } from "../types/chat";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({
  product,
  index = 0,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(product.price);

  return (
    <article
      className="product-card-enter group overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-300 hover:shadow-lg"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-36 overflow-hidden bg-green-50">
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-green-700">
            <Package size={38} strokeWidth={1.5} />
            <span className="text-xs font-medium">
              Product image unavailable
            </span>
          </div>
        )}

        {product.category && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold text-green-800 shadow-sm backdrop-blur">
            {product.category}
          </span>
        )}
      </div>

      <div className="p-3">
        <h4 className="line-clamp-2 min-h-10 text-sm font-bold text-gray-800">
          {product.name}
        </h4>

        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
            {product.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-lg font-extrabold text-green-700">
            {formattedPrice}
          </span>

          {product.quantity != null && (
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                product.quantity > 0
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {product.quantity > 0
                ? `${product.quantity} in stock`
                : "Out of stock"}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-green-700 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-green-800">
          <ShoppingBag size={14} />
          Product details
        </div>
      </div>
    </article>
  );
}
