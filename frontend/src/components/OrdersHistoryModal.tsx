import React from 'react';
import { X, Package, Calendar, MapPin, CreditCard, ChevronRight, CheckCircle2, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const OrdersHistoryModal: React.FC = () => {
  const { isOrdersModalOpen, setIsOrdersModalOpen, orders, addToCart, setIsCartDrawerOpen } = useCart();

  if (!isOrdersModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => setIsOrdersModalOpen(false)}
    >
      <div
        className="relative flex max-h-[88vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Your Orders &amp; Tracking</h2>
          </div>
          <button
            onClick={() => setIsOrdersModalOpen(false)}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close orders modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {orders.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Package className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">No Orders Placed Yet</h3>
              <p className="mt-1 text-xs text-slate-500">
                Your completed festival orders will appear here for easy real-time tracking.
              </p>
              <button
                onClick={() => setIsOrdersModalOpen(false)}
                className="mt-4 rounded-lg bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-500"
              >
                Browse Festival Deals
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-shadow hover:shadow-md"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Order Placed</span>
                      <span className="font-semibold text-slate-900">{order.date}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Total</span>
                      <span className="font-bold text-slate-900">₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="hidden sm:block">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Ship To</span>
                      <span className="font-semibold text-slate-900">{order.deliveryAddress.fullName}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Order #</span>
                    <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-4">
                  <div className="flex items-center justify-between pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-900">
                        Status: {order.status}
                      </span>
                      <span className="text-xs text-slate-500">· Arriving {order.deliveryDate}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Paid via {order.paymentMethod}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-3 divide-y divide-slate-100 border-t border-slate-100 pt-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded-lg border object-cover"
                          />
                          <div>
                            <p className="line-clamp-1 text-xs font-bold text-slate-900 max-w-sm">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Qty: {item.quantity} {item.variant ? `(${item.variant})` : ''} · ₹
                              {item.price.toLocaleString('en-IN')} each
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-slate-900">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Tracking Milestones Preview */}
                  <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-2">
                      <Truck className="h-3.5 w-3.5 text-amber-500" />
                      <span>Tracking Details</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <div>
                        <span className="text-slate-400">Delivery Address: </span>
                        <span>{order.deliveryAddress.houseFlat}, {order.deliveryAddress.streetArea}, {order.deliveryAddress.city}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Latest Event: </span>
                        <span className="font-semibold text-emerald-700">Order Confirmed &amp; Dispatched to Hub</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
