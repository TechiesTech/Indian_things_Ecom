import React, { useState } from 'react';
import { X, Star, ShoppingCart, Zap, ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductDetailModal: React.FC = () => {
  const { viewingProduct, setViewingProduct, addToCart, setIsCheckoutOpen } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<string>('');

  if (!viewingProduct) return null;

  const currentVariant =
    selectedVariant || (viewingProduct.variants ? viewingProduct.variants.options[0] : '');

  const handleAddToCart = () => {
    addToCart(viewingProduct, 1, currentVariant);
  };

  const handleBuyNow = () => {
    addToCart(viewingProduct, 1, currentVariant);
    setViewingProduct(null);
    setIsCheckoutOpen(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => setViewingProduct(null)}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 sm:p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setViewingProduct(null)}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Product Image Column */}
          <div className="flex flex-col items-center">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
              <img
                src={viewingProduct.image}
                alt={viewingProduct.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                <span className="rounded bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow">
                  Festival Deal · {viewingProduct.discountPercentage}% OFF
                </span>
                {viewingProduct.state && (
                  <span className="rounded bg-slate-950/90 px-2 py-0.5 text-[10px] font-bold text-amber-300 shadow flex items-center gap-1 border border-amber-400/40">
                    <span>📍 {viewingProduct.state}</span>
                    {viewingProduct.originCity && <span className="text-slate-300">({viewingProduct.originCity})</span>}
                  </span>
                )}
                {viewingProduct.giTag && (
                  <span className="rounded bg-emerald-700 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                    Official GI Tagged Craft
                  </span>
                )}
              </div>
            </div>

            {/* Trust Badges under image */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-600 w-full">
              <div className="flex flex-col items-center rounded-lg bg-slate-50 p-2">
                <Truck className="h-4 w-4 text-emerald-600 mb-1" />
                <span className="font-semibold">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-slate-50 p-2">
                <RotateCcw className="h-4 w-4 text-sky-600 mb-1" />
                <span className="font-semibold">7 Days Return</span>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-slate-50 p-2">
                <ShieldCheck className="h-4 w-4 text-amber-600 mb-1" />
                <span className="font-semibold">Top Brand</span>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Brand, State Origin and Category */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <span>{viewingProduct.brand}</span>
                <span>·</span>
                <span className="text-amber-800 font-bold bg-amber-100/70 px-1.5 py-0.5 rounded">
                  {viewingProduct.state}
                </span>
                <span>·</span>
                <span>{viewingProduct.categoryLabel}</span>
              </div>

              {/* Title */}
              <h2 className="mt-1 text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {viewingProduct.name}
              </h2>

              {/* Rating */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                  <span>{viewingProduct.rating}</span>
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                </div>
                <span className="text-xs text-slate-500">
                  {viewingProduct.reviewsCount.toLocaleString('en-IN')} ratings &amp; reviews
                </span>
              </div>

              <div className="my-3 h-px bg-slate-100" />

              {/* Pricing Area */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-black text-slate-900">
                    ₹{viewingProduct.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-slate-400 line-through">
                    M.R.P.: ₹{viewingProduct.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-700">
                    Save ₹{(viewingProduct.originalPrice - viewingProduct.price).toLocaleString('en-IN')} ({viewingProduct.discountPercentage}%)
                  </span>
                </div>
                <p className="text-xs text-slate-500">Inclusive of all taxes</p>

                {/* Instant Bank Discount Highlight */}
                <div className="mt-2 rounded-lg bg-sky-50 border border-sky-200 p-2.5 text-xs text-sky-900">
                  <div className="flex items-center gap-1 font-bold">
                    <Award className="h-4 w-4 text-sky-700" />
                    <span>Bank Offer: Flat 10% Instant Discount on SBI Cards</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-sky-800">
                    Get extra ₹{Math.min(500, Math.round(viewingProduct.price * 0.1))} discount at checkout when paying with SBI Card.
                  </p>
                </div>
              </div>

              {/* Variant Selector */}
              {viewingProduct.variants && (
                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-800">
                    Select {viewingProduct.variants.label}:
                  </label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {viewingProduct.variants.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => setSelectedVariant(option)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          currentVariant === option
                            ? 'bg-amber-400 font-bold text-slate-950 ring-2 ring-amber-400 ring-offset-1'
                            : 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights */}
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  About this item
                </h4>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                  {viewingProduct.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold mt-0.5">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-slate-100 sm:flex-row">
              <button
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-500 active:scale-[0.98]"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600 active:scale-[0.98]"
              >
                <Zap className="h-4 w-4 fill-current" />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
