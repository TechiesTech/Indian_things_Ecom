import React from 'react';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Toast: React.FC = () => {
  const { toast, dismissToast, setIsCartDrawerOpen } = useCart();

  if (!toast) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xl transition-all animate-in slide-in-from-bottom-5">
      {toast.image ? (
        <img
          src={toast.image}
          alt={toast.title}
          className="h-11 w-11 shrink-0 rounded-lg border object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      )}

      <div className="flex-1 pr-1">
        <h4 className="text-xs font-bold text-slate-900">{toast.title}</h4>
        <p className="line-clamp-1 text-[11px] text-slate-500">{toast.description}</p>
        <button
          onClick={() => {
            dismissToast();
            setIsCartDrawerOpen(true);
          }}
          className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700"
        >
          <ShoppingBag className="h-3 w-3" />
          <span>View Cart &amp; Checkout &gt;</span>
        </button>
      </div>

      <button
        onClick={dismissToast}
        className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
