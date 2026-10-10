import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  MapPin,
  CreditCard,
  Smartphone,
  Building2,
  Banknote,
  ShieldCheck,
  Truck,
  Plus,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Lock,
  Download,
  Check,
  Calendar,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { Address, PlacedOrder } from '../data/products';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    totalItemsCount,
    subtotal,
    savingsTotal,
    shippingFee,
    appliedCoupon,
    couponDiscount,
    sbiCardDiscount,
    finalTotal,
    addresses,
    activeAddress,
    setActiveAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    placeOrder,
    setIsOrdersModalOpen,
    paymentMethods,
  } = useCart();

  // Step state: 1 = Address Gateway, 2 = Payment Gateway, 3 = Order Confirmed
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Address Form state for adding/editing address
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    phone: '',
    pincode: '',
    houseFlat: '',
    streetArea: '',
    landmark: '',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'Home' as Address['type'],
    isDefault: false,
  });
  const [addrFormError, setAddrFormError] = useState('');
  const [isSavingAddr, setIsSavingAddr] = useState(false);

  // Delivery Speed Option
  const [deliverySpeed, setDeliverySpeed] = useState<'express' | 'standard'>('express');

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<'sbi_card' | 'upi' | 'card' | 'netbanking' | 'cod' | 'saved'>('sbi_card');
  const [selectedSavedPaymentId, setSelectedSavedPaymentId] = useState<string | null>(null);

  // Specific payment inputs
  const [upiId, setUpiId] = useState('rahul.sharma@okaxis');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'id'>('gpay');
  const [selectedBank, setSelectedBank] = useState('sbi');
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 6789');
  const [cardHolder, setCardHolder] = useState('Rahul Sharma');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('423');

  // Loading state during payment simulation
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Confirmed order data
  const [confirmedOrder, setConfirmedOrder] = useState<PlacedOrder | null>(null);

  if (!isCheckoutOpen) return null;

  // Calculation with Bank Discount if SBI Card is chosen
  const isSbiDiscountActive = paymentMethod === 'sbi_card';
  const effectiveTotal = Math.max(
    0,
    finalTotal - (isSbiDiscountActive ? sbiCardDiscount : 0)
  );

  // Get default saved payment method for pre-selection
  const defaultSavedPayment = paymentMethods.find(m => m.isDefault);
  if (defaultSavedPayment && !selectedSavedPaymentId && paymentMethod === 'saved') {
    setSelectedSavedPaymentId(defaultSavedPayment.id);
  }

  const handleAddNewAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.fullName.trim() || !newAddr.phone.trim() || !newAddr.houseFlat.trim() || !newAddr.streetArea.trim()) {
      setAddrFormError('Please fill in all required delivery fields.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(newAddr.phone.trim())) {
      setAddrFormError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!/^[1-9]\d{5}$/.test(newAddr.pincode.trim())) {
      setAddrFormError('Please enter a valid 6-digit PIN code.');
      return;
    }

    setAddrFormError('');
    setIsSavingAddr(true);
    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, newAddr);
        setEditingAddressId(null);
      } else {
        await addAddress(newAddr);
      }
      setIsAddingNewAddress(false);
    } catch (err) {
      setAddrFormError(err instanceof Error ? err.message : 'Failed to save address.');
    } finally {
      setIsSavingAddr(false);
    }
  };

  const handleStartEditInCheckout = (addr: Address) => {
    setEditingAddressId(addr.id);
    setIsAddingNewAddress(true);
    setNewAddr({
      fullName: addr.fullName,
      phone: addr.phone,
      pincode: addr.pincode,
      houseFlat: addr.houseFlat,
      streetArea: addr.streetArea,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      type: addr.type,
      isDefault: addr.isDefault,
    });
    setAddrFormError('');
  };

  const handleProceedToPayment = () => {
    if (!activeAddress) {
      alert('Please select or add a delivery address to proceed.');
      return;
    }
    setCurrentStep(2);
  };

  const handlePlaceOrderAndPay = () => {
    if (!activeAddress) return;
    setIsProcessingPayment(true);

    let methodLabel = 'SBI Credit Card (10% Discount Applied)';
    if (paymentMethod === 'saved' && selectedSavedPaymentId) {
      const savedMethod = paymentMethods.find(m => m.id === selectedSavedPaymentId);
      if (savedMethod) {
        if (savedMethod.type === 'card') {
          methodLabel = `Saved Card (•••• ${savedMethod.cardNumber?.slice(-4)})`;
        } else if (savedMethod.type === 'upi') {
          methodLabel = `Saved UPI (${savedMethod.upiId})`;
        } else if (savedMethod.type === 'netbanking') {
          methodLabel = `Saved Net Banking (${savedMethod.bankName})`;
        }
      }
    } else if (paymentMethod === 'upi') {
      methodLabel = `UPI (${selectedUpiApp === 'id' ? upiId : selectedUpiApp.toUpperCase()})`;
    } else if (paymentMethod === 'card') {
      methodLabel = `Credit/Debit Card (ending in ${cardNumber.slice(-4)})`;
    } else if (paymentMethod === 'netbanking') {
      methodLabel = `Net Banking (${selectedBank.toUpperCase()})`;
    } else if (paymentMethod === 'cod') {
      methodLabel = 'Cash on Delivery (Pay at Doorstep)';
    }

    // Simulate safe payment authorization
    setTimeout(() => {
      const order = placeOrder(methodLabel, activeAddress);
      setConfirmedOrder(order);
      setIsProcessingPayment(false);
      setCurrentStep(3);

      // Trigger festive celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#ec4899'],
        });
      } catch (err) {
        console.error(err);
      }
    }, 1200);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setCurrentStep(1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <span className="font-['Syne',sans-serif] text-lg font-black tracking-tight text-white sm:text-xl">
              Indian <span className="text-amber-400">Things</span>
            </span>
            <span className="hidden sm:inline text-xs text-slate-400">|</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              Safe &amp; Secure Checkout Gateway
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <Lock className="h-3.5 w-3.5" />
              <span>256-bit SSL Encrypted</span>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Close checkout"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stepper Indicator (Step 1 -> Step 2 -> Step 3) */}
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-8">
          <div className="mx-auto flex max-w-lg items-center justify-between">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${currentStep >= 1
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                    : 'bg-slate-200 text-slate-600'
                  }`}
              >
                {currentStep > 1 ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <span
                className={`text-xs font-bold ${currentStep >= 1 ? 'text-slate-900' : 'text-slate-400'
                  }`}
              >
                Delivery Address
              </span>
            </div>

            <div className={`h-0.5 flex-1 mx-3 ${currentStep >= 2 ? 'bg-amber-400' : 'bg-slate-200'}`} />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${currentStep >= 2
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                    : 'bg-slate-200 text-slate-600'
                  }`}
              >
                {currentStep > 2 ? <Check className="h-4 w-4" /> : '2'}
              </div>
              <span
                className={`text-xs font-bold ${currentStep >= 2 ? 'text-slate-900' : 'text-slate-400'
                  }`}
              >
                Payment Gateway
              </span>
            </div>

            <div className={`h-0.5 flex-1 mx-3 ${currentStep >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

            {/* Step 3 */}
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${currentStep === 3
                    ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                    : 'bg-slate-200 text-slate-600'
                  }`}
              >
                3
              </div>
              <span
                className={`text-xs font-bold ${currentStep === 3 ? 'text-emerald-700' : 'text-slate-400'
                  }`}
              >
                Order Placed
              </span>
            </div>
          </div>
        </div>

        {/* Modal Main Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* ================= STEP 1: ADDRESS GATEWAY ================= */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">
                    Select a Delivery Address
                  </h3>
                  {!isAddingNewAddress && (
                    <button
                      onClick={() => setIsAddingNewAddress(true)}
                      className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add New Address
                    </button>
                  )}
                </div>

                {/* New Address Form */}
                {isAddingNewAddress ? (
                  <form
                    onSubmit={handleAddNewAddressSubmit}
                    className="rounded-xl border border-amber-300 bg-amber-50/40 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                        {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewAddress(false);
                          setEditingAddressId(null);
                        }}
                        className="text-xs text-slate-500 hover:text-slate-700 underline"
                      >
                        Cancel
                      </button>
                    </div>

                    {addrFormError && (
                      <div className="rounded bg-rose-100 p-2 text-xs text-rose-800 flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{addrFormError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={newAddr.fullName}
                          onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                          placeholder="e.g. Rahul Sharma"
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700">Mobile Number (10 digits) *</label>
                        <input
                          type="tel"
                          required
                          value={newAddr.phone}
                          onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                          placeholder="9876543210"
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700">PIN Code *</label>
                        <input
                          type="text"
                          required
                          value={newAddr.pincode}
                          onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700">City *</label>
                        <input
                          type="text"
                          required
                          value={newAddr.city}
                          onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700">State *</label>
                        <input
                          type="text"
                          required
                          value={newAddr.state}
                          onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700">
                        Flat, House no., Building, Company, Apartment *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddr.houseFlat}
                        onChange={(e) => setNewAddr({ ...newAddr, houseFlat: e.target.value })}
                        placeholder="Flat 402, Sai Residency"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700">
                        Area, Street, Sector, Village *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddr.streetArea}
                        onChange={(e) => setNewAddr({ ...newAddr, streetArea: e.target.value })}
                        placeholder="Near ECIL Cross Roads, A.S. Rao Nagar"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700">Landmark (Optional)</label>
                      <input
                        type="text"
                        value={newAddr.landmark}
                        onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                        placeholder="e.g. Opposite Heritage Supermarket"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                      <label className="text-xs font-semibold text-slate-700">Address Type:</label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="addrType"
                          checked={newAddr.type === 'Home'}
                          onChange={() => setNewAddr({ ...newAddr, type: 'Home' })}
                        />
                        <span>Home (All day delivery)</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="addrType"
                          checked={newAddr.type === 'Work'}
                          onChange={() => setNewAddr({ ...newAddr, type: 'Work' })}
                        />
                         <span>Work (10 AM - 6 PM delivery)</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="addrType"
                          checked={newAddr.type === 'Other'}
                          onChange={() => setNewAddr({ ...newAddr, type: 'Other' })}
                        />
                        <span>Other</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingAddr}
                      className="mt-2 w-full rounded-lg bg-amber-400 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-sm disabled:opacity-50 disabled:cursor-wait"
                    >
                      {isSavingAddr ? 'Saving...' : 'Save & Use this Address'}
                    </button>
                  </form>
                ) : (
                  /* Saved Addresses List */
                  <div className="space-y-3">
                    {addresses.map((addr) => {
                      const isSelected = activeAddress?.id === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setActiveAddress(addr)}
                          className={`relative cursor-pointer rounded-xl border p-4 transition-all ${isSelected
                              ? 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-400/50 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="selectedAddress"
                                checked={isSelected}
                                onChange={() => setActiveAddress(addr)}
                                className="mt-1 h-4 w-4 text-amber-500 accent-amber-500"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-slate-900">
                                    {addr.fullName}
                                  </span>
                                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                    {addr.type}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="text-[10px] font-semibold text-emerald-700">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-slate-600">
                                  {addr.houseFlat}, {addr.streetArea}
                                </p>
                                {addr.landmark && (
                                  <p className="text-xs text-slate-500">
                                    Landmark: {addr.landmark}
                                  </p>
                                )}
                                <p className="mt-0.5 text-xs font-semibold text-slate-800">
                                  {addr.city}, {addr.state} - {addr.pincode}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  Phone: <span className="font-mono text-slate-700">{addr.phone}</span>
                                </p>
                              </div>
                            </div>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditInCheckout(addr);
                              }}
                              className="rounded px-2.5 py-1 text-xs font-bold text-amber-600 hover:bg-amber-100/70 border border-amber-300"
                            >
                              Edit Address
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Delivery Speed / Option */}
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Choose Delivery Speed
                  </h4>
                  <div className="mt-2.5 space-y-2">
                    <label
                      onClick={() => setDeliverySpeed('express')}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-xs transition-all ${deliverySpeed === 'express'
                          ? 'border-amber-400 bg-amber-50/40 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="deliverySpeed"
                          checked={deliverySpeed === 'express'}
                          onChange={() => setDeliverySpeed('express')}
                          className="accent-amber-500"
                        />
                        <div>
                          <span className="font-bold text-slate-900">
                            FREE Prime Express Delivery — Tomorrow by 2:00 PM
                          </span>
                          <span className="block text-[11px] text-slate-500">
                            Fastest festival priority dispatch with tracking
                          </span>
                        </div>
                      </div>
                      <span className="font-extrabold text-emerald-600 uppercase">FREE</span>
                    </label>

                    <label
                      onClick={() => setDeliverySpeed('standard')}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-xs transition-all ${deliverySpeed === 'standard'
                          ? 'border-amber-400 bg-amber-50/40 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="deliverySpeed"
                          checked={deliverySpeed === 'standard'}
                          onChange={() => setDeliverySpeed('standard')}
                          className="accent-amber-500"
                        />
                        <div>
                          <span className="font-bold text-slate-900">
                            Standard Delivery — Within 2 to 3 Days
                          </span>
                          <span className="block text-[11px] text-slate-500">
                            Eco-friendly consolidated dispatch
                          </span>
                        </div>
                      </div>
                      <span className="font-extrabold text-emerald-600 uppercase">FREE</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Order Summary Sidebar for Step 1 */}
              <div className="lg:col-span-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sticky top-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Order Summary ({totalItemsCount} items)
                  </h4>

                  {/* Thumbnail previews */}
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                    {cart.slice(0, 4).map((c) => (
                      <div
                        key={c.product.id}
                        className="relative h-14 w-14 shrink-0 rounded-lg border border-slate-200 bg-white overflow-hidden"
                      >
                        <img
                          src={c.product.image}
                          alt={c.product.name}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 rounded-tl bg-slate-900 px-1 text-[9px] font-bold text-white">
                          x{c.quantity}
                        </span>
                      </div>
                    ))}
                    {cart.length > 4 && (
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs font-bold text-slate-500">
                        +{cart.length - 4}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-1.5 border-t border-slate-200 pt-3 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Items Subtotal:</span>
                      <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Festival Discount:</span>
                      <span>-₹{savingsTotal.toLocaleString('en-IN')}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-amber-700 font-semibold">
                        <span>Coupon ({appliedCoupon}):</span>
                        <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span className="font-bold text-emerald-600">FREE</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                      <span>Order Total:</span>
                      <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToPayment}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-sm font-bold text-slate-950 hover:bg-amber-500 shadow-md transition-all active:scale-95"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: PAYMENT GATEWAY ================= */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Delivery Address</span>
                  </button>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    Payment is 100% Encrypted
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  Select a Payment Gateway Method
                </h3>

                {/* Saved Payment Methods Section */}
                {paymentMethods.length > 0 && (
                  <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-4 w-4 text-sky-600" />
                      <span className="text-xs font-bold text-slate-900">Your Saved Payment Methods</span>
                    </div>
                    <div className="space-y-2">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          onClick={() => {
                            setPaymentMethod('saved');
                            setSelectedSavedPaymentId(method.id);
                          }}
                          className={`cursor-pointer rounded-lg border p-3 text-xs transition-all ${paymentMethod === 'saved' && selectedSavedPaymentId === method.id
                              ? 'border-sky-500 bg-sky-100/50 ring-2 ring-sky-400/50'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="savedPayment"
                                checked={paymentMethod === 'saved' && selectedSavedPaymentId === method.id}
                                onChange={() => {
                                  setPaymentMethod('saved');
                                  setSelectedSavedPaymentId(method.id);
                                }}
                                className="accent-sky-600"
                              />
                              <div className="flex items-center gap-2">
                                {method.type === 'card' && <CreditCard className="h-4 w-4 text-slate-600" />}
                                {method.type === 'upi' && <Smartphone className="h-4 w-4 text-slate-600" />}
                                {method.type === 'netbanking' && <Building2 className="h-4 w-4 text-slate-600" />}
                                <span className="font-semibold text-slate-900">
                                  {method.type === 'card'
                                    ? `•••• ${method.cardNumber?.slice(-4)}`
                                    : method.type === 'upi'
                                      ? method.upiId
                                      : `${method.bankName} •••• ${method.accountLast4}`}
                                </span>
                              </div>
                            </div>
                            {method.isDefault && (
                              <span className="text-[10px] font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">Default</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Option 1: SBI Card (Promotional & Recommended) */}
                <div
                  onClick={() => setPaymentMethod('sbi_card')}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${paymentMethod === 'sbi_card'
                      ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-400/50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'sbi_card'}
                        onChange={() => setPaymentMethod('sbi_card')}
                        className="mt-1 h-4 w-4 accent-sky-600"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-sky-700 px-1.5 py-0.5 text-[10px] font-black text-white">
                            SBI Card
                          </span>
                          <span className="font-bold text-sm text-slate-900">
                            SBI Credit / Debit Card
                          </span>
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black text-emerald-800 animate-pulse">
                            10% Instant Discount Applied
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-medium text-slate-600">
                          Special Festival Offer: Instant ₹{sbiCardDiscount} savings on this order!
                        </p>
                      </div>
                    </div>
                  </div>

                  {paymentMethod === 'sbi_card' && (
                    <div className="mt-4 pt-3 border-t border-sky-200/70 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-xs font-mono font-bold text-slate-800"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-xs font-mono text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700">CVV</label>
                          <input
                            type="password"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-xs font-mono text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Option 2: UPI (Google Pay, PhonePe, Paytm) */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${paymentMethod === 'upi'
                      ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                        className="mt-1 h-4 w-4 accent-amber-500"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-emerald-600" />
                          <span className="font-bold text-sm text-slate-900">
                            UPI (Google Pay, PhonePe, Paytm, QR)
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            Instant &amp; Zero Fees
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Approve the request on your UPI app or scan QR code
                        </p>
                      </div>
                    </div>
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="mt-3 pt-3 border-t border-amber-200/70 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp('gpay')}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${selectedUpiApp === 'gpay'
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-white border border-slate-200 text-slate-700'
                            }`}
                        >
                          <span>Google Pay</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp('phonepe')}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${selectedUpiApp === 'phonepe'
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-white border border-slate-200 text-slate-700'
                            }`}
                        >
                          <span>PhonePe</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp('paytm')}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${selectedUpiApp === 'paytm'
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-white border border-slate-200 text-slate-700'
                            }`}
                        >
                          <span>Paytm</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp('id')}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${selectedUpiApp === 'id'
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-white border border-slate-200 text-slate-700'
                            }`}
                        >
                          <span>Enter UPI ID</span>
                        </button>
                      </div>

                      {selectedUpiApp === 'id' && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. yourname@okhdfcbank"
                            className="flex-1 rounded-lg border border-slate-300 p-2 text-xs font-semibold focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                          />
                          <button
                            type="button"
                            className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white"
                          >
                            Verify
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Payment Option 3: Other Credit / Debit Cards */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${paymentMethod === 'card'
                      ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="mt-1 h-4 w-4 accent-amber-500"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-slate-700" />
                          <span className="font-bold text-sm text-slate-900">
                            Other Credit or Debit Cards
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Visa, MasterCard, RuPay, Maestro, Diners Club
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Option 4: Net Banking */}
                <div
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${paymentMethod === 'netbanking'
                      ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'netbanking'}
                        onChange={() => setPaymentMethod('netbanking')}
                        className="mt-1 h-4 w-4 accent-amber-500"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-700" />
                          <span className="font-bold text-sm text-slate-900">
                            Net Banking
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          All Indian banks supported (SBI, HDFC, ICICI, Axis, Kotak)
                        </p>
                      </div>
                    </div>
                  </div>

                  {paymentMethod === 'netbanking' && (
                    <div className="mt-3 pt-3 border-t border-amber-200/70">
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-800"
                      >
                        <option value="sbi">State Bank of India</option>
                        <option value="hdfc">HDFC Bank</option>
                        <option value="icici">ICICI Bank</option>
                        <option value="axis">Axis Bank</option>
                        <option value="kotak">Kotak Mahindra Bank</option>
                        <option value="pnb">Punjab National Bank</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Payment Option 5: Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${paymentMethod === 'cod'
                      ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-1 h-4 w-4 accent-amber-500"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4 text-emerald-700" />
                          <span className="font-bold text-sm text-slate-900">
                            Cash on Delivery (Pay at Doorstep)
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Pay with cash or scan delivery agent QR code on arrival
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 Review & Pay Column */}
              <div className="lg:col-span-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sticky top-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Payment Review
                  </h4>

                  {/* Delivery address preview */}
                  {activeAddress && (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Delivering to:</span>
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="text-[11px] font-bold text-amber-600 hover:text-amber-700 underline"
                        >
                          Change
                        </button>
                      </div>
                      <p className="mt-1 font-semibold text-slate-900">{activeAddress.fullName}</p>
                      <p className="text-slate-600 truncate">{activeAddress.houseFlat}, {activeAddress.streetArea}</p>
                      <p className="text-slate-600">{activeAddress.city} - {activeAddress.pincode}</p>
                      <p className="mt-1 text-emerald-700 font-semibold flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        <span>Arriving Tomorrow by 2 PM</span>
                      </p>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="mt-4 space-y-1.5 border-t border-slate-200 pt-3 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Items Subtotal:</span>
                      <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Festival Deal Savings:</span>
                      <span>-₹{savingsTotal.toLocaleString('en-IN')}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-amber-700 font-semibold">
                        <span>Coupon Discount ({appliedCoupon}):</span>
                        <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {isSbiDiscountActive && (
                      <div className="flex justify-between text-sky-700 font-bold bg-sky-100/60 p-1.5 rounded">
                        <span>SBI 10% Instant Discount:</span>
                        <span>-₹{sbiCardDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Delivery:</span>
                      <span className="font-bold text-emerald-600">FREE</span>
                    </div>

                    <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-black text-slate-900">
                      <span>Amount Payable:</span>
                      <span className="text-amber-600 font-['Plus_Jakarta_Sans']">
                        ₹{effectiveTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={handlePlaceOrderAndPay}
                    disabled={isProcessingPayment}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 text-sm font-bold text-slate-950 hover:bg-amber-500 shadow-md transition-all active:scale-95 disabled:opacity-75 cursor-pointer"
                  >
                    {isProcessingPayment ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                        <span>Authorizing Payment...</span>
                      </div>
                    ) : (
                      <span>Place Your Order and Pay ₹{effectiveTotal.toLocaleString('en-IN')}</span>
                    )}
                  </button>

                  <div className="mt-3 flex items-center justify-center gap-1 text-[11px] text-slate-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Safe 256-bit encryption · RBI Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: ORDER CONFIRMED & TRACKING ================= */}
          {currentStep === 3 && confirmedOrder && (
            <div className="mx-auto max-w-2xl py-4 space-y-6">
              {/* Success Badge */}
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                  <Check className="h-8 w-8 stroke-[3]" />
                </div>
                <h3 className="mt-3 text-xl font-black text-slate-900">
                  Thank you! Your order has been placed.
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  Confirmation SMS &amp; Email has been dispatched to{' '}
                  <span className="font-semibold text-slate-800">{confirmedOrder.deliveryAddress.phone}</span>
                </p>

                <div className="mt-4 inline-flex items-center gap-3 rounded-lg bg-white px-4 py-2 border border-emerald-200 text-xs shadow-xs">
                  <div>
                    <span className="text-slate-500">Order ID: </span>
                    <span className="font-mono font-bold text-slate-900">{confirmedOrder.orderNumber}</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <div>
                    <span className="text-slate-500">Total Paid: </span>
                    <span className="font-bold text-emerald-700">₹{confirmedOrder.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Tracker Stepper */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Estimated Delivery
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-4 w-4 text-amber-500" />
                      <span>{confirmedOrder.deliveryDate}</span>
                    </h4>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                    On Schedule
                  </span>
                </div>

                {/* Steps */}
                <div className="mt-5 space-y-4">
                  {confirmedOrder.trackingSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step.completed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 text-slate-500'
                            }`}
                        >
                          {step.completed ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : idx + 1}
                        </div>
                        {idx < confirmedOrder.trackingSteps.length - 1 && (
                          <div
                            className={`w-0.5 h-8 my-1 ${step.completed ? 'bg-emerald-500' : 'bg-slate-200'
                              }`}
                          />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-xs font-bold ${step.completed ? 'text-slate-900' : 'text-slate-500'
                              }`}
                          >
                            {step.title}
                          </p>
                          <span className="text-[10px] text-slate-400">· {step.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items in this order */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Items Ordered ({confirmedOrder.items.length})
                </h4>
                <div className="divide-y divide-slate-100">
                  {confirmedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={it.image}
                          alt={it.name}
                          className="h-10 w-10 rounded object-cover border"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 line-clamp-1 max-w-xs">{it.name}</p>
                          <p className="text-[11px] text-slate-500">Qty: {it.quantity} {it.variant ? `(${it.variant})` : ''}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">
                        ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    handleClose();
                    setIsOrdersModalOpen(true);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  <span>View All Past Orders</span>
                </button>
                <button
                  onClick={handleClose}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-xs font-bold text-slate-950 hover:bg-amber-500 transition-colors shadow-sm"
                >
                  <span>Continue Shopping Festival Deals</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
