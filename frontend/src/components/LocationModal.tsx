import React, { useState } from 'react';
import { X, MapPin, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const LocationModal: React.FC = () => {
  const { isLocationModalOpen, setIsLocationModalOpen, currentPincode, currentCity, updateDeliveryPincode } = useCart();
  const [inputPincode, setInputPincode] = useState(currentPincode);
  const [error, setError] = useState('');

  if (!isLocationModalOpen) return null;

  const popularCities = [
    { city: 'Hyderabad', pincode: '500062' },
    { city: 'Bengaluru', pincode: '560001' },
    { city: 'Mumbai', pincode: '400001' },
    { city: 'Delhi NCR', pincode: '110001' },
    { city: 'Chennai', pincode: '600001' },
    { city: 'Pune', pincode: '411001' },
  ];

  const handleApplyPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputPincode.trim();
    if (clean.length !== 6 || isNaN(Number(clean))) {
      setError('Please enter a valid 6-digit Indian PIN code');
      return;
    }
    setError('');
    // Look up popular city or default to Current Location
    const matched = popularCities.find((c) => c.pincode === clean);
    updateDeliveryPincode(clean, matched ? matched.city : 'Selected City');
    setIsLocationModalOpen(false);
  };

  const handleSelectCity = (c: { city: string; pincode: string }) => {
    updateDeliveryPincode(c.pincode, c.city);
    setIsLocationModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => setIsLocationModalOpen(false)}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">Choose Delivery Location</h3>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-500">
          Delivery options and product speeds may vary based on your postal location.
        </p>

        {/* Pincode Input Form */}
        <form onSubmit={handleApplyPincode} className="mt-4">
          <label className="text-xs font-semibold text-slate-700">Enter a 6-digit Indian PIN Code</label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={inputPincode}
              onChange={(e) => setInputPincode(e.target.value)}
              placeholder="e.g. 500062"
              className="flex-1 rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-xs"
            >
              Apply
            </button>
          </div>
          {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
        </form>

        <div className="my-4 flex items-center gap-2 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          <span>or select your city</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Popular Cities Grid */}
        <div className="grid grid-cols-2 gap-2">
          {popularCities.map((c) => {
            const isCurrent = currentCity === c.city && currentPincode === c.pincode;
            return (
              <button
                key={c.pincode}
                onClick={() => handleSelectCity(c)}
                className={`flex items-center justify-between rounded-lg border p-2.5 text-xs text-left transition-all ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-50/60 font-bold text-slate-900'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <span className="block">{c.city}</span>
                  <span className="text-[11px] font-mono text-slate-400">{c.pincode}</span>
                </div>
                {isCurrent && <Check className="h-4 w-4 text-amber-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
