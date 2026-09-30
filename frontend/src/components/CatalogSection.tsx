import React, { useState, useMemo } from 'react';
import { Tag, Sparkles, SlidersHorizontal, ArrowUpDown, Check } from 'lucide-react';
import { PRODUCTS, Product } from '../data/products';
import { ProductCard } from './ProductCard';

interface CatalogSectionProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  selectedCategory,
  setSelectedCategory,
  searchQuery,
}) => {
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const [onlyPrime, setOnlyPrime] = useState(false);
  const [onlyGiTagged, setOnlyGiTagged] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('all');

  const categories = [
    { id: 'all-deals', label: 'All Festival Deals', count: PRODUCTS.length },
    { id: 'state-crafts', label: '🇮🇳 State Famous Crafts', count: PRODUCTS.filter((p) => p.category === 'state-crafts').length },
    { id: 'home-essentials', label: 'Home Essentials (₹199+)', count: PRODUCTS.filter((p) => p.category === 'home-essentials').length },
    { id: 'sneakers', label: 'Trendy Sneakers (Under ₹499)', count: PRODUCTS.filter((p) => p.category === 'sneakers').length },
    { id: 'bedsheets', label: 'Bedsheets & More (₹199+)', count: PRODUCTS.filter((p) => p.category === 'bedsheets').length },
    { id: 'electronics', label: 'Electronics & Mobiles', count: PRODUCTS.filter((p) => p.category === 'electronics').length },
    { id: 'kitchen', label: 'Festive Kitchen', count: PRODUCTS.filter((p) => p.category === 'kitchen').length },
  ];

  const states = [
    'all',
    'Jammu & Kashmir',
    'Rajasthan',
    'Maharashtra',
    'Assam',
    'West Bengal',
    'Telangana',
    'Tamil Nadu',
    'Gujarat',
    'Delhi NCR',
    'Karnataka',
  ];

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // Category match
      const matchesCategory = selectedCategory === 'all-deals' || p.category === selectedCategory;

      // State match
      const matchesState = selectedState === 'all' || p.state === selectedState;

      // GI Tag match
      const matchesGi = !onlyGiTagged || p.giTag;

      // Search match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.state.toLowerCase().includes(query) ||
        (p.originCity && p.originCity.toLowerCase().includes(query)) ||
        p.categoryLabel.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query);

      // Prime filter
      const matchesPrime = !onlyPrime || p.prime;

      return matchesCategory && matchesState && matchesGi && matchesSearch && matchesPrime;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'discount') return b.discountPercentage - a.discountPercentage;
      return 0; // featured default
    });
  }, [selectedCategory, selectedState, onlyGiTagged, searchQuery, onlyPrime, sortBy]);

  return (
    <section id="catalog-section" className="mx-auto max-w-7xl px-3 sm:px-4 py-8">
      {/* Category Pills & Controls Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {categories.find((c) => c.id === selectedCategory)?.label || 'Festival Deals'}
            </h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'deal' : 'deals'}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Authentic state treasures with verified GI tags, up to 70% off &amp; instant bank discount.
          </p>
        </div>

        {/* Sort & Filter controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* GI Tag toggle */}
          <button
            onClick={() => setOnlyGiTagged(!onlyGiTagged)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-bold transition-all ${
              onlyGiTagged
                ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
            }`}
          >
            <span>GI Tagged Only</span>
            {onlyGiTagged && <Check className="h-3.5 w-3.5 text-emerald-700" />}
          </button>

          {/* Prime toggle */}
          <button
            onClick={() => setOnlyPrime(!onlyPrime)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-bold transition-all ${
              onlyPrime
                ? 'border-sky-500 bg-sky-50 text-sky-800'
                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
            }`}
          >
            <span className="font-black italic text-sky-600">prime</span>
            <span>Only</span>
            {onlyPrime && <Check className="h-3.5 w-3.5 text-sky-700" />}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-700">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured Deals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter Buttons Row */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((c) => {
          const isSelected = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCategory(c.id);
                if (c.id === 'state-crafts') {
                  setSelectedState('all');
                }
              }}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>{c.label}</span>
              <span className={`ml-1 text-[11px] font-normal ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                ({c.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary State-Wise Filter Strip */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="shrink-0 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
          Filter by State:
        </span>
        {states.map((st) => {
          const isStSelected = selectedState === st;
          return (
            <button
              key={st}
              onClick={() => setSelectedState(st)}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                isStSelected
                  ? 'bg-amber-400 font-bold text-slate-950 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All States (Pan-India)' : st}
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="my-16 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-base font-bold text-slate-800">No festival products found</p>
          <p className="mt-1 text-xs text-slate-500">
            Try adjusting your search query or reset category filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all-deals');
            }}
            className="mt-4 rounded-lg bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-500"
          >
            Show All Deals
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};
