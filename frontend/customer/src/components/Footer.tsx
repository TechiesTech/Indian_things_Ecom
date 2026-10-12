import React from 'react';
import { ArrowUp, ShieldCheck, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Footer: React.FC = () => {
  const { setIsOrdersModalOpen, setIsLocationModalOpen } = useCart();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-16 bg-[#232f3e] text-white">
      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className="flex w-full items-center justify-center gap-1.5 bg-[#37475a] py-3 text-xs font-semibold text-slate-200 transition-colors hover:bg-[#485769]"
      >
        <span>Back to top</span>
        <ArrowUp className="h-3.5 w-3.5" />
      </button>

      {/* Main Links */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-xs text-slate-300">
          <div>
            <h4 className="font-bold text-white mb-3">Get to Know Us</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="hover:text-amber-400">About Indian Things</a></li>
              <li><a href="#careers" className="hover:text-amber-400">Careers</a></li>
              <li><a href="#press" className="hover:text-amber-400">Press Releases</a></li>
              <li><a href="#science" className="hover:text-amber-400">Indian Things Stories</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Connect with Us</h4>
            <ul className="space-y-2">
              <li><a href="#facebook" className="hover:text-amber-400">Facebook</a></li>
              <li><a href="#twitter" className="hover:text-amber-400">Twitter (X)</a></li>
              <li><a href="#instagram" className="hover:text-amber-400">Instagram</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Make Money with Us</h4>
            <ul className="space-y-2">
              <li><a href="#sell" className="hover:text-amber-400">Sell on Indian Things</a></li>
              <li><a href="#accelerator" className="hover:text-amber-400">Indian Things Global</a></li>
              <li><a href="#affiliate" className="hover:text-amber-400">Become an Affiliate</a></li>
              <li><a href="#fulfilment" className="hover:text-amber-400">Fulfilment by Indian Things</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Let Us Help You</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setIsOrdersModalOpen(true)} className="hover:text-amber-400 text-left">
                  Your Account &amp; Orders
                </button>
              </li>
              <li>
                <button onClick={() => setIsOrdersModalOpen(true)} className="hover:text-amber-400 text-left">
                  Returns Centre &amp; Tracking
                </button>
              </li>
              <li>
                <button onClick={() => setIsLocationModalOpen(true)} className="hover:text-amber-400 text-left">
                  Delivery Rates &amp; Policies
                </button>
              </li>
              <li><a href="#help" className="hover:text-amber-400">100% Purchase Protection</a></li>
            </ul>
          </div>
        </div>

        <div className="my-8 h-px bg-slate-700" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-['Syne',sans-serif] text-lg font-black tracking-tight text-white">
              Indian <span className="text-amber-400">Things</span>
            </span>
            <span className="text-[11px] text-slate-500">· Great Indian Festival Edition</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span>Conditions of Use &amp; Sale</span>
            <span>Privacy Notice</span>
            <span>Interest-Based Ads</span>
            <span>© 2026, Indian Things, Inc. or its affiliates</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
