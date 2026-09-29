import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateQuantity,
    totalItemsCount,
    subtotal,
    savingsTotal,
    shippingFee,
    appliedCoupon,
    couponDiscount,
    finalTotal,
    applyCoupon,
    removeCoupon,
    setIsCheckoutOpen,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponStatus, setCouponStatus] = useState<string | null>(null);

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = (code: string) => {
    const res = applyCoupon(code);
    setCouponStatus(res.message);
    setTimeout(() => setCouponStatus(null), 3500);
  };

  const handleProceedToCheckout = () => {
    setIsCartDrawerOpen(false);
    setIsCheckoutOpen(true);
  };

  const freeDeliveryThreshold = 499;
  const isFreeDeliveryEligible = subtotal >= freeDeliveryThreshold;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const deliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={() => setIsCartDrawerOpen(false)}
    >
      <div
        className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">
              Shopping Cart ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})
            </h2>
          </div>
          <button
            onClick={() => setIsCartDrawerOpen(false)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Delivery Meter */}
        <div className="bg-amber-50/70 border-b border-amber-200/60 px-4 py-2.5 sm:px-6">
          {isFreeDeliveryEligible ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Your order qualifies for FREE Festival Delivery!</span>
            </div>
          ) : (
            <div>
              <p className="text-xs font-medium text-slate-700">
                Add <span className="font-bold text-slate-900">₹{amountNeededForFreeDelivery}</span> more of eligible items to get <span className="font-bold text-emerald-700">FREE Delivery</span>.
              </p>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${deliveryProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Your Cart is Empty</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-xs">
                Explore our festive deals starting at ₹199 and add your favorites.
              </p>
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  const el = document.getElementById('festival-tiles-banner');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-5 rounded-lg bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-sm"
              >
                Shop Festival Deals
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.product.id}-${item.selectedVariant || 'default'}`}
                className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3"
              >
                {/* Product Thumbnail */}
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h4 className="line-clamp-2 text-xs font-bold text-slate-900">
                      {item.product.name}
                    </h4>
                    {item.selectedVariant && (
                      <span className="mt-0.5 inline-block text-[11px] font-medium text-slate-500">
                        Variant: {item.selectedVariant}
                      </span>
                    )}
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-sm font-extrabold text-slate-900">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-slate-400 line-through">
                        ₹{(item.product.originalPrice * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white p-0.5 shadow-xs">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1, item.selectedVariant)
                        }
                        className="flex h-5 w-5 items-center justify-center rounded text-slate-600 hover:bg-slate-100"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-[16px] text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1, item.selectedVariant)
                        }
                        className="flex h-5 w-5 items-center justify-center rounded text-slate-600 hover:bg-slate-100"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedVariant)}
                      className="flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Coupon & Price Summary Footer */}
        {cart.length > 0 && (
          <div className="border-t border-slate-200 bg-white p-4 sm:p-6 shadow-lg">
            {/* Promo Code Box */}
            <div className="mb-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-amber-500" />
                Apply Coupon Code
              </label>

              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g. FESTIVAL10"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs uppercase font-semibold text-slate-800 focus:border-amber-400 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (couponInput) {
                      handleApplyCoupon(couponInput);
                      setCouponInput('');
                    }
                  }}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Apply
                </button>
              </div>

              {/* Quick Coupon Suggestions */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  onClick={() => handleApplyCoupon('FESTIVAL10')}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-all ${
                    appliedCoupon === 'FESTIVAL10'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  FESTIVAL10 (10% OFF)
                </button>
                <button
                  onClick={() => handleApplyCoupon('FREESHIP')}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-all ${
                    appliedCoupon === 'FREESHIP'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  FREESHIP (Free Delivery)
                </button>
              </div>

              {couponStatus && (
                <p className="mt-1.5 text-[11px] font-medium text-emerald-700">{couponStatus}</p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal ({totalItemsCount})</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Festival Savings</span>
                <span>-₹{savingsTotal.toLocaleString('en-IN')}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <div className="flex items-center gap-1">
                    <span>Coupon ({appliedCoupon})</span>
                    <button
                      onClick={removeCoupon}
                      className="text-[10px] text-slate-400 hover:text-rose-600 underline ml-1"
                    >
                      Remove
                    </button>
                  </div>
                  <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="font-bold text-emerald-600 uppercase">FREE</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                <span>Order Total</span>
                <span>₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Proceed to Buy CTA */}
            <button
              onClick={handleProceedToCheckout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-500 shadow-md active:scale-[0.98]"
            >
              <span>Proceed to Buy ({totalItemsCount} items)</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>100% Safe &amp; Secure Payment Gateway</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
