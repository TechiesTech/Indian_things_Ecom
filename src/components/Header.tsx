import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  MapPin,
  Menu,
  ChevronDown,
  Sparkles,
  Package,
  Heart,
  Globe,
  X
} from 'lucide-react';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}) => {
  const {
    totalItemsCount,
    setIsCartDrawerOpen,
    setIsLocationModalOpen,
    setIsOrdersModalOpen,
    setIsAccountModalOpen,
    setAccountActiveTab,
    currentCity,
    currentPincode,
    orders,
  } = useCart();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuHover, setAccountMenuHover] = useState(false);

  const categories = [
    { id: 'all-deals', label: 'All Categories' },
    { id: 'state-crafts', label: 'State Famous Crafts' },
    { id: 'home-essentials', label: 'Home Essentials' },
    { id: 'sneakers', label: 'Trendy Sneakers' },
    { id: 'bedsheets', label: 'Bedsheets & More' },
    { id: 'electronics', label: 'Electronics & Mobiles' },
    { id: 'kitchen', label: 'Festive Kitchen' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#131921] text-white shadow-md">
      {/* Primary Top Bar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-3 sm:px-4">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded border border-transparent text-slate-300 hover:border-slate-500 hover:text-white md:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            onClick={() => {
              setSelectedCategory('all-deals');
              setSearchQuery('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex flex-col items-start rounded border border-transparent p-1.5 transition-colors hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-['Syne',sans-serif] text-xl font-black tracking-tight text-white sm:text-2xl">
                Indian <span className="text-amber-400">Things</span>
              </span>
              <span className="rounded bg-gradient-to-r from-amber-500 to-orange-500 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-950">
                Festival
              </span>
            </div>
            <span className="-mt-1 text-[10px] font-semibold text-slate-300">
              Great Indian Festival
            </span>
          </button>
        </div>

        {/* Delivering Location Selector */}
        <button
          onClick={() => setIsLocationModalOpen(true)}
          className="hidden items-center gap-1.5 rounded border border-transparent p-1.5 text-left text-xs transition-colors hover:border-slate-500 sm:flex"
          title="Change delivery location"
        >
          <MapPin className="h-4 w-4 shrink-0 text-amber-400" />
          <div className="leading-tight">
            <span className="block text-[11px] text-slate-400">Delivering to {currentCity}</span>
            <span className="block font-bold text-white truncate max-w-[120px]">
              {currentPincode} · Update
            </span>
          </div>
        </button>

        {/* Global Search Bar */}
        <div className="flex flex-1 max-w-2xl items-center">
          <div
            className={`flex w-full overflow-hidden rounded-md bg-white transition-shadow ${
              isSearchFocused ? 'ring-2 ring-amber-500 ring-offset-1' : ''
            }`}
          >
            {/* Category Dropdown */}
            <div className="relative hidden sm:block">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 cursor-pointer border-r border-slate-200 bg-slate-100 pl-3 pr-7 text-xs font-medium text-slate-700 hover:bg-slate-200 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 top-3.5 h-3 w-3 text-slate-500" />
            </div>

            {/* Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search Indian Things deals, sneakers, home essentials..."
              className="w-full px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:outline-none"
            />

            {/* Clear button if text */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-2 text-slate-400 hover:text-slate-600"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Search Submit */}
            <button
              onClick={() => {
                const element = document.getElementById('catalog-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex h-10 w-11 items-center justify-center bg-amber-400 text-slate-900 transition-colors hover:bg-amber-500 shrink-0"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Language Flag (India EN) */}
          <div className="hidden items-center gap-1 rounded border border-transparent p-1.5 text-xs font-bold hover:border-slate-500 lg:flex">
            <span className="text-base leading-none">🇮🇳</span>
            <span>EN</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </div>

          {/* Account / Hello Sign in with Dropdown & Click to Open Account Modal */}
          <div
            className="relative hidden md:block"
            onMouseEnter={() => setAccountMenuHover(true)}
            onMouseLeave={() => setAccountMenuHover(false)}
          >
            <button
              onClick={() => {
                setAccountActiveTab('orders');
                setIsAccountModalOpen(true);
              }}
              className="rounded border border-transparent p-1.5 text-left text-xs leading-tight transition-colors hover:border-slate-500 focus:outline-none"
            >
              <span className="block text-[11px] text-slate-400">Hello, Rahul</span>
              <span className="flex items-center gap-0.5 font-bold text-white">
                Account &amp; Lists <ChevronDown className="h-3 w-3 text-slate-400" />
              </span>
            </button>

            {/* Quick Dropdown Menu */}
            {accountMenuHover && (
              <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-2xl animate-in fade-in-50">
                <div className="border-b border-slate-100 pb-2 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Your Account</span>
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                      Prime
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">rahul.sharma@example.com</p>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setAccountActiveTab('orders');
                      setIsAccountModalOpen(true);
                      setAccountMenuHover(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-100 text-left font-medium"
                  >
                    <span>Orders Placed So Far ({orders.length})</span>
                    <span className="text-[10px] text-amber-600 font-bold">&gt;</span>
                  </button>

                  <button
                    onClick={() => {
                      setAccountActiveTab('orders');
                      setIsAccountModalOpen(true);
                      setAccountMenuHover(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-100 text-left font-medium"
                  >
                    <span>Order Tracking &amp; ETA</span>
                    <span className="text-[10px] text-amber-600 font-bold">&gt;</span>
                  </button>

                  <button
                    onClick={() => {
                      setAccountActiveTab('addresses');
                      setIsAccountModalOpen(true);
                      setAccountMenuHover(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-100 text-left font-medium"
                  >
                    <span>Edit &amp; Add Delivery Addresses</span>
                    <span className="text-[10px] text-amber-600 font-bold">&gt;</span>
                  </button>

                  <button
                    onClick={() => {
                      setAccountActiveTab('support');
                      setIsAccountModalOpen(true);
                      setAccountMenuHover(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-100 text-left font-medium"
                  >
                    <span>24/7 Customer Support</span>
                    <span className="text-[10px] text-amber-600 font-bold">&gt;</span>
                  </button>

                  <button
                    onClick={() => {
                      setAccountActiveTab('returns');
                      setIsAccountModalOpen(true);
                      setAccountMenuHover(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-100 text-left font-medium text-rose-700"
                  >
                    <span>7-Day Return Policy &amp; Refund</span>
                    <span className="text-[10px] font-bold">&gt;</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Returns & Orders */}
          <button
            onClick={() => setIsOrdersModalOpen(true)}
            className="relative rounded border border-transparent p-1.5 text-left text-xs leading-tight transition-colors hover:border-slate-500"
            title="View placed orders & status"
          >
            <span className="block text-[11px] text-slate-400">Returns</span>
            <span className="block font-bold text-white">&amp; Orders</span>
            {orders.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-900">
                {orders.length}
              </span>
            )}
          </button>

          {/* Cart Icon & Counter */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="flex items-center gap-1 rounded border border-transparent p-1.5 text-white transition-colors hover:border-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            aria-label={`Shopping Cart with ${totalItemsCount} items`}
          >
            <div className="relative">
              <ShoppingCart className="h-7 w-7 text-white" />
              <span className="absolute -top-1.5 left-3 flex min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-xs font-black text-slate-950 shadow">
                {totalItemsCount}
              </span>
            </div>
            <span className="hidden font-bold sm:inline text-sm">Cart</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation Ribbon with Festive Deals Banner */}
      <div className="flex h-10 items-center justify-between overflow-x-auto bg-[#232f3e] px-3 sm:px-4 text-xs font-medium text-slate-200">
        <div className="flex shrink-0 items-center gap-4">
          <button
            onClick={() => setSelectedCategory('all-deals')}
            className="flex items-center gap-1 rounded px-1.5 py-1 text-white hover:text-amber-400 focus:outline-none"
          >
            <Menu className="h-4 w-4" />
            <span className="font-bold">All</span>
          </button>

          <button
            onClick={() => setSelectedCategory('state-crafts')}
            className={`whitespace-nowrap transition-colors hover:text-white flex items-center gap-1 ${
              selectedCategory === 'state-crafts' ? 'text-amber-400 font-bold' : ''
            }`}
          >
            <span className="rounded bg-amber-400 px-1 text-[9px] font-black text-slate-950">GI</span>
            <span>State Famous Crafts</span>
          </button>

          <button
            onClick={() => setSelectedCategory('home-essentials')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              selectedCategory === 'home-essentials' ? 'text-amber-400 font-bold' : ''
            }`}
          >
            Home Essentials
          </button>
          <button
            onClick={() => setSelectedCategory('sneakers')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              selectedCategory === 'sneakers' ? 'text-amber-400 font-bold' : ''
            }`}
          >
            Trendy Sneakers
          </button>
          <button
            onClick={() => setSelectedCategory('bedsheets')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              selectedCategory === 'bedsheets' ? 'text-amber-400 font-bold' : ''
            }`}
          >
            Bedsheets &amp; Decor
          </button>
          <button
            onClick={() => setSelectedCategory('electronics')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              selectedCategory === 'electronics' ? 'text-amber-400 font-bold' : ''
            }`}
          >
            Mobiles &amp; Tech
          </button>
          <button
            onClick={() => setSelectedCategory('kitchen')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              selectedCategory === 'kitchen' ? 'text-amber-400 font-bold' : ''
            }`}
          >
            Kitchenware
          </button>
          <button
            onClick={() => setSelectedCategory('all-deals')}
            className="hidden sm:inline whitespace-nowrap hover:text-white"
          >
            Today&apos;s Deals
          </button>
          <button
            onClick={() => {
              setAccountActiveTab('support');
              setIsAccountModalOpen(true);
            }}
            className="hidden md:inline whitespace-nowrap hover:text-amber-400 transition-colors"
          >
            Customer Support
          </button>
          <button
            onClick={() => {
              setAccountActiveTab('returns');
              setIsAccountModalOpen(true);
            }}
            className="hidden lg:inline whitespace-nowrap hover:text-amber-400 transition-colors"
          >
            7-Day Return Policy
          </button>
        </div>

        {/* Right side Festival Teaser */}
        <div
          onClick={() => {
            setSelectedCategory('all-deals');
            const el = document.getElementById('festival-tiles-banner');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 pl-4 text-xs font-bold text-amber-300 transition-colors hover:text-amber-200"
        >
          <Sparkles className="h-4 w-4 animate-pulse text-amber-400" />
          <span>Great Indian Festival | Shop early deals now &gt;</span>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="h-full w-4/5 max-w-xs bg-white text-slate-800 p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900">Great Indian Festival</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Shop by Category</p>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.id);
                    setMobileMenuOpen(false);
                    const el = document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`block w-full text-left py-2 px-3 rounded text-sm ${
                    selectedCategory === c.id ? 'bg-amber-100 font-bold text-amber-900' : 'hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}

              <div className="border-t pt-3 mt-4 space-y-2">
                <button
                  onClick={() => {
                    setIsOrdersModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left py-2 px-3 rounded text-sm hover:bg-slate-100"
                >
                  <Package className="h-4 w-4 text-slate-600" />
                  Your Orders ({orders.length})
                </button>
                <button
                  onClick={() => {
                    setIsLocationModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left py-2 px-3 rounded text-sm hover:bg-slate-100"
                >
                  <MapPin className="h-4 w-4 text-slate-600" />
                  Delivering to: {currentCity} ({currentPincode})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
