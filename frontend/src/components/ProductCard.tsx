import React from 'react';
import { Star, ShoppingCart, Zap, Check, Eye } from 'lucide-react';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, updateQuantity, setIsCheckoutOpen, setViewingProduct } = useCart();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleQuickBuy = () => {
    if (quantity === 0) {
      addToCart(product, 1);
    }
    setIsCheckoutOpen(true);
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg">
      {/* Product Image Area */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Top Badges & State Origin */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start max-w-[80%]">
          {product.state && (
            <span className="rounded bg-slate-900/90 backdrop-blur px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300 shadow-sm flex items-center gap-1 border border-amber-400/40">
              <span>📍 {product.state}</span>
              {product.originCity && <span className="text-slate-300">({product.originCity})</span>}
            </span>
          )}
          {product.giTag && (
            <span className="rounded bg-emerald-700/90 px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-sm">
              GI Tagged Craft
            </span>
          )}
          {product.badge && (
            <span className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              {product.badge}
            </span>
          )}
          {product.discountPercentage >= 50 && (
            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-950 shadow-sm">
              {product.discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Quick View Button */}
        <button
          onClick={() => setViewingProduct(product)}
          className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur transition-all hover:bg-amber-400 hover:text-slate-900 active:scale-95"
          title="Quick preview"
          aria-label="View product details"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      {/* Product Details */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          {/* Brand, State Origin & Category */}
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-slate-700">
              {product.brand}
            </span>
            <span className="font-medium text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/50">
              {product.state}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => setViewingProduct(product)}
            className="mt-1 line-clamp-2 cursor-pointer text-sm font-semibold text-slate-900 transition-colors hover:text-amber-600"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Ratings */}
          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
            <div className="flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 font-bold text-amber-800 border border-amber-200">
              <span>{product.rating}</span>
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            </div>
            <span className="text-[11px] text-slate-500">
              ({product.reviewsCount.toLocaleString('en-IN')})
            </span>
          </div>

          {/* Price & Savings */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-slate-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 line-through">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-emerald-600">
              Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
            </span>
          </div>

          {/* Prime Delivery tag */}
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-slate-600">
            <span className="font-black italic text-sky-600">prime</span>
            <span>· FREE Delivery Tomorrow</span>
          </div>
        </div>

        {/* Action Buttons: Add to Cart / Stepper + Quick Buy */}
        <div className="mt-3.5 flex flex-col gap-2 pt-2 border-t border-slate-100">
          {quantity === 0 ? (
            <button
              onClick={() => addToCart(product, 1)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-500 active:scale-[0.98]"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center justify-between rounded-lg bg-amber-50 p-1 border border-amber-200">
              <span className="pl-2 text-xs font-semibold text-amber-900">In Cart</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="flex h-6 w-6 items-center justify-center rounded bg-white text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100"
                >
                  -
                </button>
                <span className="min-w-[16px] text-center text-xs font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="flex h-6 w-6 items-center justify-center rounded bg-amber-400 text-xs font-bold text-slate-900 shadow-sm hover:bg-amber-500"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleQuickBuy}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-orange-400 bg-orange-500 py-1.5 text-xs font-bold text-white transition-colors hover:bg-orange-600 active:scale-[0.98]"
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};
