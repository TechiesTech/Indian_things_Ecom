import React, { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { FestivalTilesBanner } from './components/FestivalTilesBanner';
import { BankOfferBanner } from './components/BankOfferBanner';
import { CatalogSection } from './components/CatalogSection';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { OrdersHistoryModal } from './components/OrdersHistoryModal';
import { LocationModal } from './components/LocationModal';
import { AccountModal } from './components/AccountModal';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';

export function DashboardContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all-deals');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 selection:bg-amber-300 selection:text-slate-950">
      {/* Top Header & Subnav */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <main className="flex-1">
        {/* Multi-tile Festival Hero Banner (Mirrors the attached screenshot) */}
        <FestivalTilesBanner
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* Bank & Trust Offer Highlight Strip */}
        <BankOfferBanner />

        {/* Dynamic Products Catalog Grid with sorting and filters */}
        <CatalogSection
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Interactive Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal />
      <ProductDetailModal />
      <OrdersHistoryModal />
      <AccountModal />
      <LocationModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <DashboardContent />
    </CartProvider>
  );
}
