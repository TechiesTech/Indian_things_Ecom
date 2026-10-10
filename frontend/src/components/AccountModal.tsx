import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Package,
  MapPin,
  Headphones,
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Clock,
  PhoneCall,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  CreditCard,
  Smartphone,
  Building2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Address, PaymentMethod, UserProfile } from '../data/products';
import { apiClient } from '../api/apiClient';

export const AccountModal: React.FC = () => {
  const {
    isAccountModalOpen,
    setIsAccountModalOpen,
    accountActiveTab,
    setAccountActiveTab,
    orders,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    requestOrderReturn,
    paymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    userProfile,
    updateUserProfile,
  } = useCart();

  // Address editing state
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [addrForm, setAddrForm] = useState<Omit<Address, 'id'>>({
    fullName: '',
    phone: '',
    pincode: '500062',
    houseFlat: '',
    streetArea: '',
    landmark: '',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'Home',
    isDefault: false,
  });
  const [addrError, setAddrError] = useState('');

  // Support Ticket Form State
  const [supportCategory, setSupportCategory] = useState('Order Tracking');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSuccessMsg, setSupportSuccessMsg] = useState('');

  // Return request modal state
  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState('Damaged during transit / Item mismatch');

  // Payment method form state
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
  const [editingPaymentMethodId, setEditingPaymentMethodId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    type: 'card' as 'card' | 'upi' | 'netbanking',
    isDefault: false,
    cardNumber: '',
    cardHolder: '',
    cardExpiry: '',
    cardType: 'visa' as 'visa' | 'mastercard' | 'rupay' | 'amex',
    upiId: '',
    upiApp: 'gpay' as 'gpay' | 'phonepe' | 'paytm',
    bankName: 'sbi',
    accountLast4: '',
  });
  const [paymentFormError, setPaymentFormError] = useState('');

  // User Profile form state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [profileForm, setProfileForm] = useState({
    fullName: userProfile.fullName,
    email: userProfile.email,
    phone: userProfile.phone,
    dateOfBirth: userProfile.dateOfBirth || '',
    gender: userProfile.gender || 'male',
  });
  const [preferencesForm, setPreferencesForm] = useState(userProfile.preferences);

  // Sync profile from backend whenever Account modal opens
  useEffect(() => {
    const token = sessionStorage.getItem('it_user_token') || localStorage.getItem('it_user_token');
    if (token && isAccountModalOpen) {
      apiClient.get('/users/getUserProfile')
        .then((res) => {
          if (res.data?.success && res.data?.user) {
            const user = res.data.user;
            let dob = '';
            if (user.dateOfBirth) {
              dob = new Date(user.dateOfBirth).toISOString().split('T')[0];
            }
            const updatedProfile = {
              fullName: user.name || userProfile.fullName,
              email: user.email || userProfile.email,
              phone: user.phone || userProfile.phone,
              dateOfBirth: dob || '',
              gender: (user.gender || userProfile.gender || 'male') as 'male' | 'female' | 'other',
            };
            setProfileForm(updatedProfile);
            if (user.preferences) {
              setPreferencesForm({
                emailNotifications: user.preferences.emailNotifications ?? true,
                smsNotifications: user.preferences.smsNotifications ?? true,
                promotionalOffers: user.preferences.promotionalOffers ?? true,
                orderUpdates: user.preferences.orderUpdates ?? true,
              });
            }
            updateUserProfile({
              fullName: updatedProfile.fullName,
              email: updatedProfile.email,
              phone: updatedProfile.phone,
              dateOfBirth: updatedProfile.dateOfBirth,
              gender: updatedProfile.gender,
              preferences: user.preferences || userProfile.preferences,
            });
          }
        })
        .catch((err) => {
          console.warn('Could not fetch user profile from API:', err);
        });
    }
  }, [isAccountModalOpen]);

  if (!isAccountModalOpen) return null;

  const handleStartEdit = (addr: Address) => {
    setEditingAddressId(addr.id);
    setIsAddingNew(false);
    setAddrForm({
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
    setAddrError('');
  };

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setEditingAddressId(null);
    setAddrForm({
      fullName: '',
      phone: '9876543210',
      pincode: '500062',
      houseFlat: '',
      streetArea: '',
      landmark: '',
      city: 'Hyderabad',
      state: 'Telangana',
      type: 'Home',
      isDefault: addresses.length === 0,
    });
    setAddrError('');
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrForm.fullName.trim() || !addrForm.phone.trim() || !addrForm.houseFlat.trim() || !addrForm.streetArea.trim()) {
      setAddrError('Please provide all required address details.');
      return;
    }
    if (addrForm.phone.replace(/\D/g, '').length < 10) {
      setAddrError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (editingAddressId) {
      updateAddress(editingAddressId, addrForm);
      setEditingAddressId(null);
    } else if (isAddingNew) {
      addAddress(addrForm);
      setIsAddingNew(false);
    }
    setAddrError('');
  };

  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportSuccessMsg(
      `Support Ticket #IT-${Math.floor(100000 + Math.random() * 900000)} created. An Indian Things customer executive will call back on +91 9876543210 within 15 minutes.`
    );
    setSupportMessage('');
    setTimeout(() => setSupportSuccessMsg(''), 7000);
  };

  const handleConfirmReturn = (orderId: string) => {
    requestOrderReturn(orderId, returnReason);
    setReturnOrderId(null);
  };

  // Payment method handlers
  const handleStartAddPaymentMethod = () => {
    setIsAddingPaymentMethod(true);
    setEditingPaymentMethodId(null);
    setPaymentForm({
      type: 'card',
      isDefault: paymentMethods.length === 0,
      cardNumber: '',
      cardHolder: '',
      cardExpiry: '',
      cardType: 'visa',
      upiId: '',
      upiApp: 'gpay',
      bankName: 'sbi',
      accountLast4: '',
    });
    setPaymentFormError('');
  };

  const handleStartEditPaymentMethod = (method: PaymentMethod) => {
    setIsAddingPaymentMethod(true);
    setEditingPaymentMethodId(method.id);
    setPaymentForm({
      type: method.type,
      isDefault: method.isDefault,
      cardNumber: method.cardNumber || '',
      cardHolder: method.cardHolder || '',
      cardExpiry: method.cardExpiry || '',
      cardType: method.cardType || 'visa',
      upiId: method.upiId || '',
      upiApp: method.upiApp || 'gpay',
      bankName: method.bankName || 'sbi',
      accountLast4: method.accountLast4 || '',
    });
    setPaymentFormError('');
  };

  const handleSavePaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentForm.type === 'card') {
      if (!paymentForm.cardNumber.trim() || !paymentForm.cardHolder.trim() || !paymentForm.cardExpiry.trim()) {
        setPaymentFormError('Please fill in all card details.');
        return;
      }
      if (paymentForm.cardNumber.replace(/\D/g, '').length < 16) {
        setPaymentFormError('Please enter a valid 16-digit card number.');
        return;
      }
    } else if (paymentForm.type === 'upi') {
      if (!paymentForm.upiId.trim() || !paymentForm.upiId.includes('@')) {
        setPaymentFormError('Please enter a valid UPI ID (e.g., name@bank).');
        return;
      }
    } else if (paymentForm.type === 'netbanking') {
      if (!paymentForm.bankName || !paymentForm.accountLast4) {
        setPaymentFormError('Please select bank and enter account details.');
        return;
      }
    }

    if (editingPaymentMethodId) {
      // Update existing payment method
      // For simplicity, we'll delete and re-add
      deletePaymentMethod(editingPaymentMethodId);
    }
    
    addPaymentMethod(paymentForm);
    setIsAddingPaymentMethod(false);
    setEditingPaymentMethodId(null);
    setPaymentFormError('');
  };

  // User Profile handlers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setIsSavingProfile(true);

    const payload: {
      name: string;
      phone: string;
      dateOfBirth?: string;
      gender: 'male' | 'female' | 'other';
      preferences: {
        emailNotifications: boolean;
        smsNotifications: boolean;
        promotionalOffers: boolean;
        orderUpdates: boolean;
      };
    } = {
      name: profileForm.fullName.trim(),
      phone: profileForm.phone.trim(),
      gender: profileForm.gender as 'male' | 'female' | 'other',
      preferences: preferencesForm,
    };

    if (profileForm.dateOfBirth && profileForm.dateOfBirth.trim() !== '') {
      payload.dateOfBirth = profileForm.dateOfBirth.trim();
    }

    try {
      const { data: response } = await apiClient.patch('/users/updateUserProfile', payload);

      if (response.success) {
        updateUserProfile({
          fullName: payload.name,
          phone: payload.phone,
          dateOfBirth: payload.dateOfBirth,
          gender: payload.gender,
          preferences: payload.preferences,
        });
        setProfileSuccess(response.message || 'Profile updated successfully!');
        setTimeout(() => {
          setIsEditingProfile(false);
          setProfileSuccess('');
        }, 1200);
      } else {
        setProfileError(response.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to update profile. Please verify you are logged in and backend is running.';
      setProfileError(errorMessage);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelProfileEdit = () => {
    setProfileForm({
      fullName: userProfile.fullName,
      email: userProfile.email,
      phone: userProfile.phone,
      dateOfBirth: userProfile.dateOfBirth || '',
      gender: userProfile.gender || 'male',
    });
    setPreferencesForm(userProfile.preferences);
    setProfileError('');
    setProfileSuccess('');
    setIsEditingProfile(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm"
      onClick={() => setIsAccountModalOpen(false)}
    >
      <div
        className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & User Profile Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 bg-[#131921] px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 font-bold text-slate-950 text-base shadow">
              {userProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{userProfile.fullName}</h3>
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                  userProfile.membershipLevel === 'prime' 
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' 
                    : userProfile.membershipLevel === 'premium'
                    ? 'bg-purple-400/20 text-purple-300 border-purple-400/40'
                    : 'bg-slate-400/20 text-slate-300 border-slate-400/40'
                }`}>
                  {userProfile.membershipLevel === 'prime' ? 'Prime Member' : userProfile.membershipLevel === 'premium' ? 'Premium' : 'Standard'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {userProfile.email} · +91 {userProfile.phone} · Member since {userProfile.memberSince}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
            </button>
            <button
              onClick={() => setIsAccountModalOpen(false)}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Profile Edit Form (shows when editing) */}
        {isEditingProfile && (
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Email (Registered)</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 p-2 text-xs text-slate-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400">Email cannot be changed</span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Phone</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Date of Birth</label>
                  <input
                    type="date"
                    value={profileForm.dateOfBirth}
                    onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Gender</label>
                <div className="mt-1 flex gap-4">
                  {['male', 'female', 'other'].map((gender) => (
                    <label key={gender} className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={profileForm.gender === gender}
                        onChange={() => setProfileForm({ ...profileForm, gender: gender as any })}
                      />
                      <span className="capitalize">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold text-slate-900 mb-3">Notification Preferences</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferencesForm.emailNotifications}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, emailNotifications: e.target.checked })}
                    />
                    <span>Email Notifications</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferencesForm.smsNotifications}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, smsNotifications: e.target.checked })}
                    />
                    <span>SMS Notifications</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferencesForm.promotionalOffers}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, promotionalOffers: e.target.checked })}
                    />
                    <span>Promotional Offers</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferencesForm.orderUpdates}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, orderUpdates: e.target.checked })}
                    />
                    <span>Order Updates</span>
                  </label>
                </div>
              </div>

              {profileError && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs font-semibold text-rose-700">
                  {profileError}
                </p>
              )}
              {profileSuccess && (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-700">
                  {profileSuccess}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="rounded-lg bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-wait shadow-xs flex items-center gap-1.5"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  disabled={isSavingProfile}
                  onClick={handleCancelProfileEdit}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Navigation Ribbon */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-600 no-scrollbar">
          <button
            onClick={() => setAccountActiveTab('orders')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 transition-colors shrink-0 ${
              accountActiveTab === 'orders'
                ? 'border-amber-500 text-amber-900 bg-white font-black'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Package className="h-4 w-4 text-amber-500" />
            <span>Orders Placed So Far ({orders.length})</span>
          </button>

          <button
            onClick={() => setAccountActiveTab('addresses')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 transition-colors shrink-0 ${
              accountActiveTab === 'addresses'
                ? 'border-amber-500 text-amber-900 bg-white font-black'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span>Delivery Addresses ({addresses.length})</span>
          </button>

          <button
            onClick={() => setAccountActiveTab('support')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 transition-colors shrink-0 ${
              accountActiveTab === 'support'
                ? 'border-amber-500 text-amber-900 bg-white font-black'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Headphones className="h-4 w-4 text-sky-600" />
            <span>24/7 Customer Support</span>
          </button>

          <button
            onClick={() => setAccountActiveTab('returns')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 transition-colors shrink-0 ${
              accountActiveTab === 'returns'
                ? 'border-amber-500 text-amber-900 bg-white font-black'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <RotateCcw className="h-4 w-4 text-rose-600" />
            <span>Return Policy &amp; Replacement</span>
          </button>

          <button
            onClick={() => setAccountActiveTab('payments')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 transition-colors shrink-0 ${
              accountActiveTab === 'payments'
                ? 'border-amber-500 text-amber-900 bg-white font-black'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <CreditCard className="h-4 w-4 text-sky-600" />
            <span>Payment Methods ({paymentMethods.length})</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {/* ================= TAB 1: ORDERS PLACED SO FAR & TRACKING ================= */}
          {accountActiveTab === 'orders' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="text-sm font-bold text-slate-900">
                  Your Orders History ({orders.length})
                </h4>
                <span className="text-xs text-slate-500">Live Real-Time Tracking Enabled</span>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center bg-white rounded-xl border border-slate-200 p-8">
                  <Package className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-3 text-sm font-bold text-slate-800">No orders placed yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Explore GI tagged handicrafts and state treasures on Indian Things!
                  </p>
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs"
                  >
                    {/* Order header strip */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-xs">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-slate-400">Order Placed</span>
                          <span className="font-semibold text-slate-900">{ord.date}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-slate-400">Total</span>
                          <span className="font-bold text-slate-900">₹{ord.total.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-slate-400">Ship To</span>
                          <span className="font-semibold text-slate-900">{ord.deliveryAddress.fullName}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Order ID</span>
                        <span className="font-mono font-bold text-slate-900">{ord.orderNumber}</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${ord.status === 'Delivered' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                          <span className="text-xs font-extrabold text-slate-900">Status: {ord.status}</span>
                          <span className="text-xs text-slate-500">· {ord.deliveryDate}</span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setReturnOrderId(ord.id);
                              setAccountActiveTab('returns');
                            }}
                            className="rounded border border-slate-300 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                          >
                            Return / Replace
                          </button>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-slate-100">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between py-2 text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={it.image}
                                alt={it.name}
                                className="h-12 w-12 rounded-lg border object-cover"
                              />
                              <div>
                                <p className="font-bold text-slate-900 line-clamp-1 max-w-sm">{it.name}</p>
                                <p className="text-[11px] text-slate-500">
                                  Qty: {it.quantity} {it.variant ? `(${it.variant})` : ''} · ₹{it.price.toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-slate-900">
                              ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Live Tracking Timeline */}
                      <div className="rounded-lg bg-slate-50 p-3 text-xs border border-slate-100">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-2">
                          <Truck className="h-4 w-4 text-amber-500" />
                          <span>Delivery Progress Stepper</span>
                        </div>
                        <div className="space-y-2">
                          {ord.trackingSteps.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2.5">
                              <div className={`mt-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0 ${
                                step.completed ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                              }`}>
                                {step.completed && <CheckCircle2 className="h-3 w-3" />}
                              </div>
                              <div className="text-[11px]">
                                <span className={`font-bold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                                  {step.title}
                                </span>
                                <span className="text-slate-400 ml-1">({step.date})</span>
                                <p className="text-slate-500">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ================= TAB 2: ADDRESSES (ADD & EDIT OPTIONS) ================= */}
          {accountActiveTab === 'addresses' && (
            <div className="space-y-5 max-w-3xl mx-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Your Saved Delivery Addresses ({addresses.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Add new addresses or edit existing ones for speedy checkout.
                  </p>
                </div>
                {!isAddingNew && !editingAddressId && (
                  <button
                    onClick={handleStartAdd}
                    className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Add / Edit Form Modal Box */}
              {(isAddingNew || editingAddressId) && (
                <form
                  onSubmit={handleSaveAddress}
                  className="rounded-xl border-2 border-amber-400 bg-white p-5 shadow-md space-y-4"
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNew(false);
                        setEditingAddressId(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 underline"
                    >
                      Cancel
                    </button>
                  </div>

                  {addrError && (
                    <div className="rounded bg-rose-100 p-2 text-xs text-rose-800 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{addrError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={addrForm.fullName}
                        onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Phone Number (10 digits) *</label>
                      <input
                        type="tel"
                        required
                        value={addrForm.phone}
                        onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">PIN Code *</label>
                      <input
                        type="text"
                        required
                        value={addrForm.pincode}
                        onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">City *</label>
                      <input
                        type="text"
                        required
                        value={addrForm.city}
                        onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">State *</label>
                      <input
                        type="text"
                        required
                        value={addrForm.state}
                        onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Flat, House no., Building *</label>
                    <input
                      type="text"
                      required
                      value={addrForm.houseFlat}
                      onChange={(e) => setAddrForm({ ...addrForm, houseFlat: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Area, Colony, Street, Sector *</label>
                    <input
                      type="text"
                      required
                      value={addrForm.streetArea}
                      onChange={(e) => setAddrForm({ ...addrForm, streetArea: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={addrForm.landmark || ''}
                      onChange={(e) => setAddrForm({ ...addrForm, landmark: e.target.value })}
                      placeholder="e.g. Near Metro Station / Opposite Bank"
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-700">Type:</span>
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="accAddrType"
                          checked={addrForm.type === 'Home'}
                          onChange={() => setAddrForm({ ...addrForm, type: 'Home' })}
                        />
                        <span>Home</span>
                      </label>
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="accAddrType"
                          checked={addrForm.type === 'Work'}
                          onChange={() => setAddrForm({ ...addrForm, type: 'Work' })}
                        />
                        <span>Work / Office</span>
                      </label>
                    </div>

                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addrForm.isDefault}
                        onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                      />
                      <span>Make this my default address</span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-amber-400 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-xs"
                    >
                      {editingAddressId ? 'Save Changes' : 'Add Address'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNew(false);
                        setEditingAddressId(null);
                      }}
                      className="rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Addresses List with Edit & Delete Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-900">{addr.fullName}</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-600">
                            {addr.type}
                          </span>
                        </div>
                        {addr.isDefault && (
                          <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            Default Address
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-1">{addr.houseFlat}, {addr.streetArea}</p>
                      {addr.landmark && (
                        <p className="text-xs text-slate-500">Landmark: {addr.landmark}</p>
                      )}
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Phone: {addr.phone}</p>
                    </div>

                    {/* Edit, Set Default, and Delete buttons */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleStartEdit(addr)}
                          className="flex items-center gap-1 font-bold text-amber-600 hover:text-amber-700"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>

                        {!addr.isDefault && (
                          <button
                            onClick={() => setDefaultAddress(addr.id)}
                            className="text-slate-600 hover:text-slate-900 underline"
                          >
                            Set as default
                          </button>
                        )}
                      </div>

                      {addresses.length > 1 && (
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="flex items-center gap-1 text-rose-600 hover:text-rose-700"
                          title="Delete address"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: CUSTOMER SUPPORT ================= */}
          {accountActiveTab === 'support' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
                <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
                  <Headphones className="h-5 w-5 text-sky-700" />
                  <span>Indian Things Customer Assistance Hub</span>
                </div>
                <p className="text-xs text-sky-800 mt-1">
                  We are here 24/7 during the Great Indian Festival to assist with your orders, artisanal craft verification, and payments.
                </p>

                <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-sky-950">
                  <div className="flex items-center gap-1.5">
                    <PhoneCall className="h-3.5 w-3.5 text-sky-600" />
                    <span>Toll Free: 1800-209-INDIAN (4634)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-sky-600" />
                    <span>Response Time: &lt; 5 minutes</span>
                  </div>
                </div>
              </div>

              {/* Submit a Support Request */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 mb-2">Raise a Quick Support Query</h4>

                {supportSuccessMsg && (
                  <div className="mb-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{supportSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitSupport} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Query Category</label>
                    <select
                      value={supportCategory}
                      onChange={(e) => setSupportCategory(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold text-slate-800"
                    >
                      <option value="Order Tracking">Where is my order? (Tracking &amp; ETA)</option>
                      <option value="Bank Discount">SBI Card 10% Instant Discount inquiry</option>
                      <option value="Address Change">Change Delivery Address for open order</option>
                      <option value="GI Certification">Artisan GI Tag verification inquiry</option>
                      <option value="Damaged Item">Damaged item / Return request</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Describe your issue / question</label>
                    <textarea
                      rows={3}
                      required
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="e.g. Please help me check expedited delivery status for my order..."
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-lg bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-xs"
                  >
                    Request Instant Agent Callback
                  </button>
                </form>
              </div>

              {/* FAQs */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-amber-500" />
                  <span>Frequently Asked Questions</span>
                </h4>
                <div className="space-y-3 text-xs text-slate-600 divide-y divide-slate-100">
                  <div className="pt-2">
                    <p className="font-bold text-slate-900">How do I track my order in real-time?</p>
                    <p className="mt-0.5 text-slate-500">
                      Click the &ldquo;Orders Placed So Far&rdquo; tab or the top bar &ldquo;Returns &amp; Orders&rdquo; button to view the step-by-step dispatch status.
                    </p>
                  </div>
                  <div className="pt-2">
                    <p className="font-bold text-slate-900">How is the SBI Card 10% instant discount applied?</p>
                    <p className="mt-0.5 text-slate-500">
                      Simply select the SBI Credit/Debit Card option at checkout. The 10% discount (up to ₹500) will be deducted automatically from your bill before payment.
                    </p>
                  </div>
                  <div className="pt-2">
                    <p className="font-bold text-slate-900">Are the state-wise craft items genuine and authentic?</p>
                    <p className="mt-0.5 text-slate-500">
                      Yes! All state specialty treasures (Kashmiri Pashmina, Jaipur Blue Pottery, Kolhapuri Leather, Assam Tea) are sourced directly from certified artisan guilds holding official GI tags.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: RETURN POLICY & REPLACEMENT ================= */}
          {accountActiveTab === 'returns' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <RotateCcw className="h-5 w-5 text-rose-600" />
                  <span>Indian Things 7-Day Hassle-Free Return &amp; Replacement Policy</span>
                </div>
                <p className="text-xs text-rose-800 mt-1">
                  Enjoy complete peace of mind with 100% money-back guarantee or free replacement on any authentic state craft or festival purchase within 7 days of delivery.
                </p>
              </div>

              {/* 3 Steps of Return */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-900 font-bold mb-2">
                    1
                  </div>
                  <h5 className="font-bold text-slate-900">1-Click Request</h5>
                  <p className="text-slate-500 mt-1">
                    Select your order below and choose return or replacement reason.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-900 font-bold mb-2">
                    2
                  </div>
                  <h5 className="font-bold text-slate-900">Free Doorstep Pickup</h5>
                  <p className="text-slate-500 mt-1">
                    Our logistics partner picks up the package right from your doorstep at zero cost.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-900 font-bold mb-2">
                    3
                  </div>
                  <h5 className="font-bold text-slate-900">Instant Refund</h5>
                  <p className="text-slate-500 mt-1">
                    Refund is credited directly back to your original payment card or UPI immediately upon pickup.
                  </p>
                </div>
              </div>

              {/* Return Eligible Orders */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 mb-3">
                  Initiate Return for Eligible Delivered Orders
                </h4>

                <div className="space-y-3">
                  {orders.map((ord) => {
                    const isReturnRequested = ord.status === 'Return Requested';
                    return (
                      <div
                        key={ord.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">{ord.orderNumber}</span>
                            <span className="text-slate-400">· Delivered {ord.deliveryDate}</span>
                          </div>
                          <p className="text-slate-600 mt-0.5">
                            {ord.items.map((i) => i.name).join(', ')}
                          </p>
                        </div>

                        {isReturnRequested ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Pickup Scheduled (Refund in progress)</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleConfirmReturn(ord.id)}
                            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 shadow-xs"
                          >
                            Initiate Return / Refund &gt;
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: PAYMENT METHODS ================= */}
          {accountActiveTab === 'payments' && (
            <div className="space-y-5 max-w-3xl mx-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Saved Payment Methods ({paymentMethods.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Manage your cards, UPI IDs, and bank accounts for faster checkout.
                  </p>
                </div>
                {!isAddingPaymentMethod && (
                  <button
                    onClick={handleStartAddPaymentMethod}
                    className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-600 shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Payment Method</span>
                  </button>
                )}
              </div>

              {/* Add / Edit Payment Method Form */}
              {isAddingPaymentMethod && (
                <form
                  onSubmit={handleSavePaymentMethod}
                  className="rounded-xl border-2 border-sky-400 bg-sky-50/40 p-5 shadow-md space-y-4"
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-900">
                      {editingPaymentMethodId ? 'Edit Payment Method' : 'Add New Payment Method'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingPaymentMethod(false);
                        setEditingPaymentMethodId(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 underline"
                    >
                      Cancel
                    </button>
                  </div>

                  {paymentFormError && (
                    <div className="rounded bg-rose-100 p-2 text-xs text-rose-800 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{paymentFormError}</span>
                    </div>
                  )}

                  {/* Payment Type Selection */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Payment Type</label>
                    <div className="mt-2 flex gap-3">
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="paymentType"
                          checked={paymentForm.type === 'card'}
                          onChange={() => setPaymentForm({ ...paymentForm, type: 'card' })}
                        />
                        <CreditCard className="h-4 w-4 text-slate-600" />
                        <span>Credit/Debit Card</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="paymentType"
                          checked={paymentForm.type === 'upi'}
                          onChange={() => setPaymentForm({ ...paymentForm, type: 'upi' })}
                        />
                        <Smartphone className="h-4 w-4 text-slate-600" />
                        <span>UPI</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="paymentType"
                          checked={paymentForm.type === 'netbanking'}
                          onChange={() => setPaymentForm({ ...paymentForm, type: 'netbanking' })}
                        />
                        <Building2 className="h-4 w-4 text-slate-600" />
                        <span>Net Banking</span>
                      </label>
                    </div>
                  </div>

                  {/* Card Details */}
                  {paymentForm.type === 'card' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700">Card Number *</label>
                        <input
                          type="text"
                          required
                          value={paymentForm.cardNumber}
                          onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                          placeholder="1234 5678 9012 3456"
                          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-mono focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-700">Card Holder Name *</label>
                          <input
                            type="text"
                            required
                            value={paymentForm.cardHolder}
                            onChange={(e) => setPaymentForm({ ...paymentForm, cardHolder: e.target.value })}
                            placeholder="Name on card"
                            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-700">Expiry Date (MM/YY) *</label>
                          <input
                            type="text"
                            required
                            value={paymentForm.cardExpiry}
                            onChange={(e) => setPaymentForm({ ...paymentForm, cardExpiry: e.target.value })}
                            placeholder="MM/YY"
                            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-mono focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700">Card Type</label>
                        <select
                          value={paymentForm.cardType}
                          onChange={(e) => setPaymentForm({ ...paymentForm, cardType: e.target.value as any })}
                          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:outline-none"
                        >
                          <option value="visa">Visa</option>
                          <option value="mastercard">MasterCard</option>
                          <option value="rupay">RuPay</option>
                          <option value="amex">American Express</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* UPI Details */}
                  {paymentForm.type === 'upi' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700">UPI ID *</label>
                        <input
                          type="text"
                          required
                          value={paymentForm.upiId}
                          onChange={(e) => setPaymentForm({ ...paymentForm, upiId: e.target.value })}
                          placeholder="yourname@okhdfcbank"
                          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700">UPI App</label>
                        <div className="mt-2 flex gap-2">
                          {['gpay', 'phonepe', 'paytm'].map((app) => (
                            <label key={app} className="flex items-center gap-1.5 text-xs cursor-pointer">
                              <input
                                type="radio"
                                name="upiApp"
                                checked={paymentForm.upiApp === app}
                                onChange={() => setPaymentForm({ ...paymentForm, upiApp: app as any })}
                              />
                              <span className="capitalize">{app}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Net Banking Details */}
                  {paymentForm.type === 'netbanking' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700">Select Bank *</label>
                        <select
                          value={paymentForm.bankName}
                          onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:outline-none"
                        >
                          <option value="sbi">State Bank of India</option>
                          <option value="hdfc">HDFC Bank</option>
                          <option value="icici">ICICI Bank</option>
                          <option value="axis">Axis Bank</option>
                          <option value="kotak">Kotak Mahindra Bank</option>
                          <option value="pnb">Punjab National Bank</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700">Account Last 4 Digits *</label>
                        <input
                          type="text"
                          required
                          value={paymentForm.accountLast4}
                          onChange={(e) => setPaymentForm({ ...paymentForm, accountLast4: e.target.value })}
                          placeholder="1234"
                          maxLength={4}
                          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-mono focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentForm.isDefault}
                        onChange={(e) => setPaymentForm({ ...paymentForm, isDefault: e.target.checked })}
                      />
                      <span>Set as default payment method</span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-sky-500 py-2.5 text-xs font-bold text-white hover:bg-sky-600 shadow-xs"
                    >
                      {editingPaymentMethodId ? 'Update Payment Method' : 'Add Payment Method'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingPaymentMethod(false);
                        setEditingPaymentMethodId(null);
                      }}
                      className="rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Payment Methods List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2">
                        <div className="flex items-center gap-2">
                          {method.type === 'card' && <CreditCard className="h-4 w-4 text-slate-600" />}
                          {method.type === 'upi' && <Smartphone className="h-4 w-4 text-slate-600" />}
                          {method.type === 'netbanking' && <Building2 className="h-4 w-4 text-slate-600" />}
                          <span className="font-bold text-sm text-slate-900 capitalize">
                            {method.type === 'card' ? 'Credit/Debit Card' : method.type === 'upi' ? 'UPI' : 'Net Banking'}
                          </span>
                        </div>
                        {method.isDefault && (
                          <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200">
                            Default
                          </span>
                        )}
                      </div>

                      {method.type === 'card' && (
                        <div className="space-y-1">
                          <p className="text-xs font-mono text-slate-900">•••• {method.cardNumber?.slice(-4)}</p>
                          <p className="text-xs text-slate-600">{method.cardHolder}</p>
                          <p className="text-xs text-slate-500">Expires: {method.cardExpiry}</p>
                        </div>
                      )}

                      {method.type === 'upi' && (
                        <div className="space-y-1">
                          <p className="text-xs font-mono text-slate-900">{method.upiId}</p>
                          <p className="text-xs text-slate-500 capitalize">{method.upiApp}</p>
                        </div>
                      )}

                      {method.type === 'netbanking' && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-900 capitalize">{method.bankName}</p>
                          <p className="text-xs text-slate-600">Account ending in •••• {method.accountLast4}</p>
                        </div>
                      )}
                    </div>

                    {/* Edit, Set Default, and Delete buttons */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleStartEditPaymentMethod(method)}
                          className="flex items-center gap-1 font-bold text-sky-600 hover:text-sky-700"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>

                        {!method.isDefault && (
                          <button
                            onClick={() => setDefaultPaymentMethod(method.id)}
                            className="text-slate-600 hover:text-slate-900 underline"
                          >
                            Set as default
                          </button>
                        )}
                      </div>

                      {paymentMethods.length > 1 && (
                        <button
                          onClick={() => deletePaymentMethod(method.id)}
                          className="flex items-center gap-1 text-rose-600 hover:text-rose-700"
                          title="Delete payment method"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
