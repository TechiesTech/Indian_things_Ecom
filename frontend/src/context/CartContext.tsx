import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Address, INITIAL_ADDRESSES, PlacedOrder, OrderItem, PaymentMethod, INITIAL_PAYMENT_METHODS, UserProfile, INITIAL_USER_PROFILE } from '../data/products';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

interface ToastMessage {
  id: string;
  title: string;
  description: string;
  image?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: string) => void;
  removeFromCart: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  savingsTotal: number;
  shippingFee: number;
  appliedCoupon: string | null;
  couponDiscount: number;
  sbiCardDiscount: number;
  finalTotal: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  
  // Checkout & Drawers
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  isOrdersModalOpen: boolean;
  setIsOrdersModalOpen: (open: boolean) => void;
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;
  accountActiveTab: 'orders' | 'addresses' | 'support' | 'returns' | 'payments';
  setAccountActiveTab: (tab: 'orders' | 'addresses' | 'support' | 'returns' | 'payments') => void;

  // Selected Product Detail Modal
  viewingProduct: Product | null;
  setViewingProduct: (product: Product | null) => void;

  // Addresses CRUD
  addresses: Address[];
  activeAddress: Address | null;
  setActiveAddress: (addr: Address) => void;
  addAddress: (addr: Omit<Address, 'id'>) => Address;
  updateAddress: (id: string, updated: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  editingAddress: Address | null;
  setEditingAddress: (addr: Address | null) => void;

  // Delivery Location / Pincode
  currentPincode: string;
  currentCity: string;
  updateDeliveryPincode: (pincode: string, city: string) => void;

  // Orders & Returns
  orders: PlacedOrder[];
  placeOrder: (paymentMethod: string, address: Address) => PlacedOrder;
  requestOrderReturn: (orderId: string, reason: string) => void;

  // Payment Methods
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => PaymentMethod;
  deletePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  editingPaymentMethod: PaymentMethod | null;
  setEditingPaymentMethod: (method: PaymentMethod | null) => void;

  // User Profile
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  // Toasts
  toast: ToastMessage | null;
  dismissToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize cart from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('it_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>(() => {
    try {
      const saved = localStorage.getItem('it_addresses');
      return saved ? JSON.parse(saved) : INITIAL_ADDRESSES;
    } catch {
      return INITIAL_ADDRESSES;
    }
  });

  const [activeAddress, setActiveAddress] = useState<Address | null>(() => {
    return addresses.find((a) => a.isDefault) || addresses[0] || null;
  });

  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    try {
      const saved = localStorage.getItem('it_payment_methods');
      return saved ? JSON.parse(saved) : INITIAL_PAYMENT_METHODS;
    } catch {
      return INITIAL_PAYMENT_METHODS;
    }
  });
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('it_user_profile');
      return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  // Current Pincode & City
  const [currentPincode, setCurrentPincode] = useState<string>('500062');
  const [currentCity, setCurrentCity] = useState<string>('Hyderabad');

  // Orders
  const [orders, setOrders] = useState<PlacedOrder[]>(() => {
    try {
      const saved = localStorage.getItem('it_orders');
      if (saved) {
        return JSON.parse(saved);
      }
      // Provide 1 realistic demo historical order so Account & Lists shows order history immediately!
      return [
        {
          id: 'ord-demo-1',
          orderNumber: 'IT-IND-90214-4820',
          date: '21 Sep 2026',
          items: [
            {
              productId: 'prod-state-rajasthan-1',
              name: 'Jaipur Blue Pottery Handcrafted Ceramic Jar & Decorative Vase Set',
              price: 699,
              image: '/assets/images/state_jaipur_blue_pottery_1790340501420.jpg',
              quantity: 1,
              variant: 'Cobalt Royal Floral',
            },
            {
              productId: 'prod-state-assam-1',
              name: 'Assam Golden Tips Single-Estate Orthodox Black Tea & Spices',
              price: 349,
              image: '/assets/images/state_assam_tea_spices_1790340524957.jpg',
              quantity: 1,
              variant: '250g Festive Tin',
            },
          ],
          subtotal: 1048,
          discount: 105,
          shipping: 0,
          total: 943,
          paymentMethod: 'UPI (Google Pay)',
          deliveryAddress: INITIAL_ADDRESSES[0],
          deliveryDate: '23 Sep 2026',
          status: 'Delivered',
          trackingSteps: [
            {
              title: 'Order Confirmed',
              description: 'Payment verified & order booked with artisan guild.',
              completed: true,
              date: '21 Sep 2026, 11:20 AM',
            },
            {
              title: 'Packed in Festive Gift Wrapping',
              description: 'Jaipur & Assam artisan hubs prepared package.',
              completed: true,
              date: '21 Sep 2026, 4:45 PM',
            },
            {
              title: 'Dispatched with Priority Air Express',
              description: 'Airway Bill: IT-AIR-782194',
              completed: true,
              date: '22 Sep 2026, 8:10 AM',
            },
            {
              title: 'Delivered to Recipient',
              description: 'Package handed over to Rahul Sharma at Hyderabad.',
              completed: true,
              date: '23 Sep 2026, 2:15 PM',
            },
          ],
        },
      ];
    } catch {
      return [];
    }
  });

  // Modals & Drawers
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountActiveTab, setAccountActiveTab] = useState<'orders' | 'addresses' | 'support' | 'returns' | 'payments'>('orders');
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Coupons
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('FESTIVAL10');

  // Toasts
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('it_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Sync addresses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('it_addresses', JSON.stringify(addresses));
    } catch (e) {
      console.error(e);
    }
  }, [addresses]);

  // Sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('it_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  // Sync payment methods to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('it_payment_methods', JSON.stringify(paymentMethods));
    } catch (e) {
      console.error(e);
    }
  }, [paymentMethods]);

  // Sync user profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('it_user_profile', JSON.stringify(userProfile));
    } catch (e) {
      console.error(e);
    }
  }, [userProfile]);

  const showToast = (title: string, description: string, image?: string) => {
    const id = Date.now().toString();
    setToast({ id, title, description, image });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3800);
  };

  const dismissToast = () => {
    setToast(null);
  };

  const addToCart = (product: Product, quantity = 1, variant?: string) => {
    const chosenVariant = variant || (product.variants ? product.variants.options[0] : undefined);
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedVariant === chosenVariant
      );
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prevCart, { product, quantity, selectedVariant: chosenVariant }];
      }
    });

    showToast('Added to Cart', `${product.name.slice(0, 40)}...`, product.image);
  };

  const removeFromCart = (productId: string, variant?: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.selectedVariant === variant))
    );
  };

  const updateQuantity = (productId: string, quantity: number, variant?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variant);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.selectedVariant === variant) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const savingsTotal = cart.reduce(
    (acc, item) =>
      acc + (item.product.originalPrice - item.product.price) * item.quantity,
    0
  );

  // Free shipping above ₹499
  const shippingFee = subtotal === 0 || subtotal >= 499 ? 0 : 49;

  // Coupon discount
  let couponDiscount = 0;
  if (appliedCoupon === 'FESTIVAL10') {
    couponDiscount = Math.round(subtotal * 0.1);
  } else if (appliedCoupon === 'FREESHIP') {
    couponDiscount = shippingFee;
  } else if (appliedCoupon === 'BIGDEAL20') {
    couponDiscount = Math.round(subtotal * 0.2);
  }

  // SBI Card 10% instant discount (max ₹500)
  const sbiCardDiscount = Math.min(500, Math.round(subtotal * 0.1));

  const finalTotal = Math.max(0, subtotal - couponDiscount + shippingFee);

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'FESTIVAL10') {
      setAppliedCoupon('FESTIVAL10');
      return { success: true, message: '🎉 FESTIVAL10 applied! 10% instant savings.' };
    }
    if (clean === 'BIGDEAL20') {
      if (subtotal < 1000) {
        return { success: false, message: 'BIGDEAL20 requires minimum order of ₹1000.' };
      }
      setAppliedCoupon('BIGDEAL20');
      return { success: true, message: '💥 BIGDEAL20 applied! 20% festival bonus savings.' };
    }
    if (clean === 'FREESHIP') {
      setAppliedCoupon('FREESHIP');
      return { success: true, message: '🚚 FREESHIP applied! Free Delivery on your order.' };
    }
    return { success: false, message: 'Invalid coupon code. Try FESTIVAL10 or BIGDEAL20' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Addresses CRUD
  const addAddress = (newAddrData: Omit<Address, 'id'>) => {
    const id = `addr-${Date.now()}`;
    const newAddr: Address = { ...newAddrData, id };
    const updated = [newAddr, ...addresses.map((a) => (newAddr.isDefault ? { ...a, isDefault: false } : a))];
    setAddresses(updated);
    setActiveAddress(newAddr);
    showToast('Address Added', `${newAddr.fullName} · ${newAddr.city}`);
    return newAddr;
  };

  const updateAddress = (id: string, updatedData: Partial<Address>) => {
    setAddresses((prev) =>
      prev.map((addr) => {
        if (addr.id === id) {
          const merged = { ...addr, ...updatedData };
          if (activeAddress?.id === id) {
            setActiveAddress(merged);
          }
          return merged;
        }
        if (updatedData.isDefault) {
          return { ...addr, isDefault: false };
        }
        return addr;
      })
    );
    showToast('Address Updated', 'Delivery address details modified successfully');
  };

  const deleteAddress = (id: string) => {
    if (addresses.length <= 1) {
      showToast('Action Denied', 'At least one address must be kept for deliveries');
      return;
    }
    const filtered = addresses.filter((a) => a.id !== id);
    setAddresses(filtered);
    if (activeAddress?.id === id) {
      setActiveAddress(filtered[0] || null);
    }
    showToast('Address Removed', 'Delivery address deleted');
  };

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
    const found = addresses.find((a) => a.id === id);
    if (found) {
      setActiveAddress(found);
      showToast('Default Address Set', `${found.fullName} (${found.type})`);
    }
  };

  const updateDeliveryPincode = (pincode: string, city: string) => {
    setCurrentPincode(pincode);
    setCurrentCity(city);
    showToast('Delivery Location Updated', `Delivering to ${city} (${pincode})`);
  };

  const placeOrder = (paymentMethod: string, address: Address): PlacedOrder => {
    const orderItems: OrderItem[] = cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity,
      variant: item.selectedVariant,
    }));

    const orderNumber = `IT-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: PlacedOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      items: orderItems,
      subtotal,
      discount: couponDiscount,
      shipping: shippingFee,
      total: finalTotal,
      paymentMethod,
      deliveryAddress: address,
      deliveryDate: 'Tomorrow, by 2:00 PM',
      status: 'Confirmed',
      trackingSteps: [
        {
          title: 'Order Confirmed',
          description: 'Payment authorized & order placed successfully.',
          completed: true,
          date: 'Today, Just now',
        },
        {
          title: 'Packing at Hyderabad Hub',
          description: 'State treasures gathered & packed with festival care.',
          completed: false,
          date: 'Expected Today, 6:00 PM',
        },
        {
          title: 'Dispatched with Express Logistics',
          description: 'Tracking ID: EXP-IND-8849204',
          completed: false,
          date: 'Expected Tomorrow, 6:00 AM',
        },
        {
          title: 'Delivered',
          description: `Handing over to ${address.fullName} at ${address.city}`,
          completed: false,
          date: 'Expected Tomorrow, by 2:00 PM',
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const requestOrderReturn = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: 'Return Requested',
            returnDetails: {
              reason,
              requestedAt: new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }),
              status: 'Pending Pickup',
            },
          };
        }
        return order;
      })
    );
    showToast('Return Initiated', 'Courier pickup scheduled within 48 hours with full refund');
  };

  // Payment Methods CRUD
  const addPaymentMethod = (newMethodData: Omit<PaymentMethod, 'id'>) => {
    const id = `pm-${Date.now()}`;
    const newMethod: PaymentMethod = { ...newMethodData, id };
    const updated = [newMethod, ...paymentMethods.map((m) => (newMethod.isDefault ? { ...m, isDefault: false } : m))];
    setPaymentMethods(updated);
    showToast('Payment Method Added', `${newMethod.type === 'card' ? 'Card' : newMethod.type === 'upi' ? 'UPI' : 'Net Banking'} saved successfully`);
    return newMethod;
  };

  const deletePaymentMethod = (id: string) => {
    if (paymentMethods.length <= 1) {
      showToast('Action Denied', 'At least one payment method must be kept');
      return;
    }
    const filtered = paymentMethods.filter((m) => m.id !== id);
    setPaymentMethods(filtered);
    showToast('Payment Method Removed', 'Payment method deleted successfully');
  };

  const setDefaultPaymentMethod = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }))
    );
    const found = paymentMethods.find((m) => m.id === id);
    if (found) {
      showToast('Default Payment Set', `${found.type === 'card' ? 'Card' : found.type === 'upi' ? 'UPI' : 'Net Banking'} set as default`);
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
    showToast('Profile Updated', 'Your profile information has been updated successfully');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        subtotal,
        savingsTotal,
        shippingFee,
        appliedCoupon,
        couponDiscount,
        sbiCardDiscount,
        finalTotal,
        applyCoupon,
        removeCoupon,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isLocationModalOpen,
        setIsLocationModalOpen,
        isOrdersModalOpen,
        setIsOrdersModalOpen,
        isAccountModalOpen,
        setIsAccountModalOpen,
        accountActiveTab,
        setAccountActiveTab,
        viewingProduct,
        setViewingProduct,
        addresses,
        activeAddress,
        setActiveAddress,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        editingAddress,
        setEditingAddress,
        currentPincode,
        currentCity,
        updateDeliveryPincode,
        orders,
        placeOrder,
        requestOrderReturn,
        paymentMethods,
        addPaymentMethod,
        deletePaymentMethod,
        setDefaultPaymentMethod,
        editingPaymentMethod,
        setEditingPaymentMethod,
        userProfile,
        updateUserProfile,
        toast,
        dismissToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
