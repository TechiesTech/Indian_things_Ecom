import React from 'react';
import { ShieldCheck, Truck, RotateCcw, CreditCard, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const BankOfferBanner: React.FC = () => {
  const { applyCoupon, setIsCartDrawerOpen } = useCart();

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 pt-4">
      {/* SBI Bank Offer Strip */}
      <div className="overflow-hidden rounded-xl border border-sky-300 bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 p-4 text-white shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white font-black text-sm shadow">
              SBI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-sky-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-200">
                  Bank Special
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  State Bank of India
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                10% Instant Discount* on SBI Credit / Debit Card &amp; EMI Transactions
              </h3>
              <p className="text-xs text-sky-200/80">
                Valid on orders during Great Indian Festival. Instant discount auto-applied at checkout payment gateway.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => {
                applyCoupon('FESTIVAL10');
                setIsCartDrawerOpen(true);
              }}
              className="rounded-lg bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-500 transition-colors shadow-sm"
            >
              Apply FESTIVAL10 &gt;
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pillars of Trust */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
        <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
          <Truck className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <p className="font-bold text-slate-900">Free Delivery</p>
            <p className="text-[11px] text-slate-500">On all orders above ₹499</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
          <CreditCard className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold text-slate-900">Simple Gateways</p>
            <p className="text-[11px] text-slate-500">UPI, Cards, COD &amp; NetBanking</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
          <RotateCcw className="h-5 w-5 text-sky-600 shrink-0" />
          <div>
            <p className="font-bold text-slate-900">Easy Returns</p>
            <p className="text-[11px] text-slate-500">7-day replacement guarantee</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
          <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0" />
          <div>
            <p className="font-bold text-slate-900">100% Genuine</p>
            <p className="text-[11px] text-slate-500">Directly from verified brands</p>
          </div>
        </div>
      </div>
    </div>
  );
};
