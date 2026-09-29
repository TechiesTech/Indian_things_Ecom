export interface Product {
  id: string;
  name: string;
  category: 'state-crafts' | 'home-essentials' | 'sneakers' | 'bedsheets' | 'electronics' | 'kitchen' | 'all-deals';
  categoryLabel: string;
  brand: string;
  state: string;
  originCity: string;
  giTag?: boolean;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  highlights: string[];
  inStock: boolean;
  prime: boolean;
  badge?: string;
  variants?: {
    type: 'size' | 'color' | 'pack';
    label: string;
    options: string[];
  };
}

export interface FestivalTile {
  id: string;
  categoryKey: string;
  headerPreText: string;
  headerMainText: string;
  headerSubText: string;
  bgGradient: string;
  borderColor: string;
  badgeText: string;
  image: string;
  title: string;
  offerFooter: string;
  bankDiscountText: string;
  stateLabel?: string;
}

export const FESTIVAL_TILES: FestivalTile[] = [
  {
    id: 'tile-state-heritage',
    categoryKey: 'state-crafts',
    headerPreText: 'GI Tagged Heritage',
    headerMainText: 'State Famous Treasures',
    headerSubText: 'Pashmina, Blue Pottery, Kolhapuri & Tea',
    bgGradient: 'from-amber-600 via-orange-600 to-rose-700',
    borderColor: 'border-amber-400',
    badgeText: 'Shop authentic state handicrafts',
    image: '/src/assets/images/state_kashmiri_pashmina_1790340488152.jpg',
    title: 'Indian Things Heritage Collection',
    offerFooter: '100% Genuine Handcrafted by Certified Artisans',
    bankDiscountText: '10% Instant Discount* on Debit/Credit Card & EMI',
    stateLabel: 'All 28 States & UTs',
  },
  {
    id: 'tile-hero-deals',
    categoryKey: 'all-deals',
    headerPreText: 'Shop early',
    headerMainText: 'deals now',
    headerSubText: 'Great Indian Festival',
    bgGradient: 'from-amber-500 via-orange-600 to-amber-700',
    borderColor: 'border-amber-400',
    badgeText: 'Up to 10% Extra only for Prime members',
    image: '/src/assets/images/tile_festival_hero_1790340009092.jpg',
    title: 'Great Indian Festival · Starts 8th Oct',
    offerFooter: 'Powered by Samsung Galaxy | Co-Powered by Intel Core Ultra',
    bankDiscountText: '10% Instant Discount* on Debit/Credit Card & EMI',
  },
  {
    id: 'tile-home-essentials',
    categoryKey: 'home-essentials',
    headerPreText: 'Starting ₹199',
    headerMainText: 'Home essentials',
    headerSubText: 'Free delivery on first order',
    bgGradient: 'from-emerald-500 via-teal-600 to-emerald-700',
    borderColor: 'border-emerald-400',
    badgeText: 'Shop early deals now',
    image: '/src/assets/images/tile_home_essentials_1790339965592.jpg',
    title: 'Great Indian Festival · Starts 8th Oct',
    offerFooter: 'Mops, detergents, sprayers & storage',
    bankDiscountText: '10% Instant Discount* on Debit/Credit Card & EMI',
  },
  {
    id: 'tile-trendy-sneakers',
    categoryKey: 'sneakers',
    headerPreText: 'Under ₹499',
    headerMainText: 'Trendy sneakers',
    headerSubText: 'Top brands | Latest trends',
    bgGradient: 'from-red-600 via-rose-600 to-red-800',
    borderColor: 'border-rose-400',
    badgeText: 'Shop early deals now',
    image: '/src/assets/images/tile_trendy_sneakers_1790339982691.jpg',
    title: 'Great Indian Festival · Starts 8th Oct',
    offerFooter: 'Campus, Puma, Sparx & Red Tape',
    bankDiscountText: '10% Instant Discount* on Debit/Credit Card & EMI',
  },
  {
    id: 'tile-bedsheets',
    categoryKey: 'bedsheets',
    headerPreText: 'Starting ₹199',
    headerMainText: 'Bedsheets & more',
    headerSubText: 'Free delivery on first order',
    bgGradient: 'from-emerald-600 via-green-700 to-teal-800',
    borderColor: 'border-teal-400',
    badgeText: 'Shop early deals now',
    image: '/src/assets/images/tile_bedsheets_decor_1790339997595.jpg',
    title: 'Great Indian Festival · Starts 8th Oct',
    offerFooter: '100% Glace Cotton & Festive Prints',
    bankDiscountText: '10% Instant Discount* on Debit/Credit Card & EMI',
  },
];

export const PRODUCTS: Product[] = [
  // --- STATE WISE FAMOUS ITEMS ---
  {
    id: 'prod-state-kashmir-1',
    name: 'Kashmiri Handcrafted Pure Pashmina Wool Shawl with Sozni Needle Embroidery',
    category: 'state-crafts',
    categoryLabel: 'Kashmir Famous',
    brand: 'Kashmir Loom Craft',
    state: 'Jammu & Kashmir',
    originCity: 'Srinagar',
    giTag: true,
    price: 1899,
    originalPrice: 4999,
    discountPercentage: 62,
    rating: 4.8,
    reviewsCount: 3420,
    image: '/src/assets/images/state_kashmiri_pashmina_1790340488152.jpg',
    description: 'Authentic 100% pure Himalayan Pashmina certified GI wool shawl featuring delicate sozni needlework handcrafted by veteran Srinagar artisans. Ultra-light, heavenly soft, and naturally insulating.',
    highlights: [
      'Certified GI Tagged authentic Pashmina wool',
      'Intricate floral sozni hand needlework borders',
      'Feather-light 190 grams yet exceptionally warm',
      'Comes in handcrafted Kashmiri walnut gift packaging',
    ],
    inStock: true,
    prime: true,
    badge: 'GI Tagged · Kashmir Pride',
    variants: {
      type: 'color',
      label: 'Embroidery Tone',
      options: ['Natural Ivory & Floral', 'Royal Navy & Silver', 'Ruby Crimson & Gold'],
    },
  },
  {
    id: 'prod-state-rajasthan-1',
    name: 'Jaipur Blue Pottery Handcrafted Ceramic Jar & Decorative Vase Set (Set of 2)',
    category: 'state-crafts',
    categoryLabel: 'Rajasthan Famous',
    brand: 'Jaipur Karigar',
    state: 'Rajasthan',
    originCity: 'Jaipur',
    giTag: true,
    price: 699,
    originalPrice: 1799,
    discountPercentage: 61,
    rating: 4.7,
    reviewsCount: 2840,
    image: '/src/assets/images/state_jaipur_blue_pottery_1790340501420.jpg',
    description: 'Renowned Jaipur Blue Pottery crafted from quartz stone powder, Fuller’s earth, and natural gum, hand-painted with cobalt blue Persian floral motifs. Perfect for kitchen spices or living room aesthetics.',
    highlights: [
      'Authentic GI tagged Jaipur ceramic craftsmanship',
      'Lead-free, food-grade glazed storage containers',
      'Artisanal hand-painted Persian cobalt blue motifs',
      'Includes 1 storage jar with lid + 1 decorative vase',
    ],
    inStock: true,
    prime: true,
    badge: 'GI Tagged · Rajasthan Pride',
    variants: {
      type: 'color',
      label: 'Motif Style',
      options: ['Cobalt Royal Floral', 'Turquoise Peacock', 'Persian Indigo'],
    },
  },
  {
    id: 'prod-state-maharashtra-1',
    name: 'Authentic Kolhapuri Handcrafted Pure Leather Chappals with Braided Cord',
    category: 'state-crafts',
    categoryLabel: 'Maharashtra Famous',
    brand: 'Kolhapur Heritage Footwear',
    state: 'Maharashtra',
    originCity: 'Kolhapur',
    giTag: true,
    price: 599,
    originalPrice: 1499,
    discountPercentage: 60,
    rating: 4.6,
    reviewsCount: 4120,
    image: '/src/assets/images/state_kolhapuri_chappal_1790340514050.jpg',
    description: 'Genuine hand-dyed vegetable-tanned leather sandals constructed with hand-twisted leather cord and signature festive red thread tassel. Conforms naturally to foot shape for decades of comfort.',
    highlights: [
      'Official GI tagged Kolhapuri leather certification',
      '100% vegetable-tanned genuine buff leather',
      'Traditional hand-stitched sole with non-slip grooving',
      'Tasselled braided vamp for ethnic and casual outfits',
    ],
    inStock: true,
    prime: true,
    badge: 'GI Tagged · Maharashtra Pride',
    variants: {
      type: 'size',
      label: 'UK/India Shoe Size',
      options: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
    },
  },
  {
    id: 'prod-state-assam-1',
    name: 'Assam Golden Tips Single-Estate Orthodox Black Tea & Spices (250g Festive Tin)',
    category: 'state-crafts',
    categoryLabel: 'Assam Famous',
    brand: 'Brahmaputra Valley Tea',
    state: 'Assam',
    originCity: 'Jorhat',
    giTag: true,
    price: 349,
    originalPrice: 850,
    discountPercentage: 59,
    rating: 4.9,
    reviewsCount: 5210,
    image: '/src/assets/images/state_assam_tea_spices_1790340524957.jpg',
    description: 'Harvested from lush upper Assam single-estate gardens during second flush. Full-bodied malty orthodox whole leaves with rare golden tips, accompanied by authentic Malabar whole green cardamom.',
    highlights: [
      'GI Certified 100% Pure Orthodox Assam tea',
      'Rich golden tips with distinct malty aromatic profile',
      'Packed in embossed airtight festive metal tin',
      'Includes complimentary whole cardamom spice pouch',
    ],
    inStock: true,
    prime: true,
    badge: 'GI Tagged · Assam Pride',
    variants: {
      type: 'pack',
      label: 'Tin Size',
      options: ['250g Festive Tin', '500g Value Pack (Save ₹100)'],
    },
  },
  {
    id: 'prod-state-telangana-1',
    name: 'Bidriware Handcrafted Silver Inlay Brass Keepsake & Jewellery Box',
    category: 'state-crafts',
    categoryLabel: 'Telangana Famous',
    brand: 'Deccan Bidri Crafts',
    state: 'Telangana',
    originCity: 'Hyderabad',
    giTag: true,
    price: 849,
    originalPrice: 2200,
    discountPercentage: 61,
    rating: 4.7,
    reviewsCount: 1980,
    image: '/src/assets/images/tile_festival_hero_1790340009092.jpg',
    description: 'Iconic 500-year-old Deccan metallic craft featuring pure silver sheet wire hand-inlaid into blackened zinc and copper alloy. Velveteen lined interior for precious jewels.',
    highlights: [
      'Centuries-old Bidri silver inlay artform',
      'Jet black oxidized finish with radiant silver motifs',
      'Velvet padded storage compartment',
    ],
    inStock: true,
    prime: true,
    badge: 'GI Heritage · Telangana',
  },
  {
    id: 'prod-state-bengal-1',
    name: 'West Bengal Terracotta Bankura Horse & Shantiniketan Leather Wallet Set',
    category: 'state-crafts',
    categoryLabel: 'Bengal Famous',
    brand: 'Bishnupur Clay Works',
    state: 'West Bengal',
    originCity: 'Bishnupur',
    giTag: true,
    price: 499,
    originalPrice: 1250,
    discountPercentage: 60,
    rating: 4.5,
    reviewsCount: 1670,
    image: '/src/assets/images/state_jaipur_blue_pottery_1790340501420.jpg',
    description: 'Pair of handcrafted terracotta auspicious Bankura horses fired in traditional kilns, paired with an embossed Shantiniketan genuine leather cardholder wallet.',
    highlights: [
      'National award-winning Bishnupur terracotta figurine',
      'Natural terracotta clay with rich earthy burnt tones',
      'Shantiniketan hand-batik embossed leather accessory',
    ],
    inStock: true,
    prime: true,
    badge: 'GI Tagged · Bengal Heritage',
  },

  // Home Essentials
  {
    id: 'prod-he-1',
    name: 'Gala Twin Bucket 360° Spin Mop with 2 Microfiber Refills',
    category: 'home-essentials',
    categoryLabel: 'Home Essentials',
    brand: 'Gala Clean',
    state: 'Maharashtra',
    originCity: 'Mumbai',
    price: 699,
    originalPrice: 1499,
    discountPercentage: 53,
    rating: 4.4,
    reviewsCount: 14320,
    image: '/src/assets/images/tile_home_essentials_1790339965592.jpg',
    description: 'Effortless deep home floor cleaning with steel wringer basket, extendable stainless steel handle, and ultra-absorbent microfiber heads suitable for tiles, marble, and hardwood.',
    highlights: [
      'Twin bucket system with separate wash and dry chambers',
      'Stainless steel 360-degree rotating handle',
      'Includes 2 washable micro-fiber mop refill heads',
      'One year manufacturer replacement warranty',
    ],
    inStock: true,
    prime: true,
    badge: 'Festival Deal',
    variants: {
      type: 'color',
      label: 'Bucket Color',
      options: ['Teal & Lime', 'Royal Blue', 'Festive Magenta'],
    },
  },
  {
    id: 'prod-he-2',
    name: 'Scotch-Brite Multipurpose Scrub Pad & Kitchen Sponge (Pack of 6)',
    category: 'home-essentials',
    categoryLabel: 'Home Essentials',
    brand: 'Scotch-Brite',
    state: 'Karnataka',
    originCity: 'Bengaluru',
    price: 199,
    originalPrice: 350,
    discountPercentage: 43,
    rating: 4.6,
    reviewsCount: 8940,
    image: '/src/assets/images/tile_home_essentials_1790339965592.jpg',
    description: 'Thick scrub pads infused with stain-cutting minerals that tackle oily cookware without scratching non-stick coatings.',
    highlights: [
      'Heavy-duty grease removal formula',
      'Odor-resistant breathable foam core',
      'Pack of 6 durable pads',
    ],
    inStock: true,
    prime: true,
    badge: 'Starting ₹199',
    variants: {
      type: 'pack',
      label: 'Pack Quantity',
      options: ['Pack of 6', 'Pack of 12 (Save 20%)'],
    },
  },
  {
    id: 'prod-he-3',
    name: 'Lizol Floral Surface Disinfectant Cleaner (2 Litre Bottle)',
    category: 'home-essentials',
    categoryLabel: 'Home Essentials',
    brand: 'Lizol',
    state: 'Delhi NCR',
    originCity: 'Gurugram',
    price: 349,
    originalPrice: 520,
    discountPercentage: 33,
    rating: 4.7,
    reviewsCount: 22100,
    image: '/src/assets/images/tile_home_essentials_1790339965592.jpg',
    description: 'Kills 99.9% germs and bacteria while leaving a long-lasting pleasant citrus & floral aroma across floors and surfaces.',
    highlights: [
      'Triple action formula against stubborn stains',
      'Safe for pets and children when diluted as per instructions',
      'Hospital grade antibacterial effectiveness',
    ],
    inStock: true,
    prime: true,
  },

  // Trendy Sneakers
  {
    id: 'prod-sn-1',
    name: 'Campus Men North Retro Chunky Streetwear Sneakers',
    category: 'sneakers',
    categoryLabel: 'Trendy Sneakers',
    brand: 'Campus',
    state: 'Delhi NCR',
    originCity: 'Delhi',
    price: 499,
    originalPrice: 1299,
    discountPercentage: 62,
    rating: 4.3,
    reviewsCount: 9480,
    image: '/src/assets/images/tile_trendy_sneakers_1790339982691.jpg',
    description: 'Lightweight everyday low-top sneakers featuring shock-absorbing Phylon soles, breathable mesh upper, and high-traction rubber outsole.',
    highlights: [
      'Padded memory foam insole for all-day cushioning',
      'Anti-skid textured traction outsole',
      'Modern two-tone design with lace-up closure',
      'Breathable knitted upper mesh',
    ],
    inStock: true,
    prime: true,
    badge: 'Under ₹499',
    variants: {
      type: 'size',
      label: 'UK/India Shoe Size',
      options: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
    },
  },
  {
    id: 'prod-sn-2',
    name: 'Red Tape Men Off-White Casual Athleisure Lace-Up Sneakers',
    category: 'sneakers',
    categoryLabel: 'Trendy Sneakers',
    brand: 'Red Tape',
    state: 'Uttar Pradesh',
    originCity: 'Kanpur',
    price: 899,
    originalPrice: 3899,
    discountPercentage: 77,
    rating: 4.5,
    reviewsCount: 18230,
    image: '/src/assets/images/tile_trendy_sneakers_1790339982691.jpg',
    description: 'Premium synthetic leather sneakers designed for contemporary casual aesthetics with comfortable cushioned arch support.',
    highlights: [
      'Clean minimalist cupsole silhouette',
      'Stitch-reinforced toe box for enhanced longevity',
      'Perforated vamp for continuous airflow',
    ],
    inStock: true,
    prime: true,
    badge: 'Top Rated',
    variants: {
      type: 'size',
      label: 'UK/India Shoe Size',
      options: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    },
  },

  // Bedsheets & Home Decor
  {
    id: 'prod-bs-1',
    name: 'Solimo 100% Pure Cotton King Size Bedsheet with 2 Pillow Covers',
    category: 'bedsheets',
    categoryLabel: 'Bedsheets & More',
    brand: 'Solimo',
    state: 'Gujarat',
    originCity: 'Ahmedabad',
    price: 499,
    originalPrice: 1199,
    discountPercentage: 58,
    rating: 4.5,
    reviewsCount: 11500,
    image: '/src/assets/images/tile_bedsheets_decor_1790339997595.jpg',
    description: 'Woven with 180 thread count breathable long-staple cotton for a smooth luxurious hand-feel and vibrant color retention after every wash.',
    highlights: [
      'King bedsheet size: 275 cm x 275 cm (108 x 108 inches)',
      '2 matching envelope closure pillow covers: 46 cm x 69 cm',
      'Color-fast and shrink-resistant fabric',
      'Tested for harmful substances with OEKO-TEX standard',
    ],
    inStock: true,
    prime: true,
    badge: 'Deal of the Day',
    variants: {
      type: 'color',
      label: 'Festive Pattern',
      options: ['Royal Purple Mandala', 'Midnight Navy Floral', 'Emerald Botanical'],
    },
  },
  {
    id: 'prod-bs-2',
    name: 'Story@Home Glace Cotton Double Bedsheet with 2 Pillow Covers',
    category: 'bedsheets',
    categoryLabel: 'Bedsheets & More',
    brand: 'Story@Home',
    state: 'Rajasthan',
    originCity: 'Sanganer',
    price: 199,
    originalPrice: 599,
    discountPercentage: 67,
    rating: 4.2,
    reviewsCount: 6840,
    image: '/src/assets/images/tile_bedsheets_decor_1790339997595.jpg',
    description: 'Silky smooth glace cotton fabric with festive geometric prints that brighten up guest rooms and master bedrooms effortlessly.',
    highlights: [
      'Wrinkle-free quick dry material',
      'Bright reactive dye prints',
      'Great for festival gifting',
    ],
    inStock: true,
    prime: true,
    badge: 'Starting ₹199',
    variants: {
      type: 'color',
      label: 'Color Variant',
      options: ['Violet Wave', 'Maroon Paisley', 'Sapphire Grid'],
    },
  },

  // Electronics & Mobiles
  {
    id: 'prod-el-1',
    name: 'boAt Airdopes 141 ANC True Wireless Earbuds (42H Playtime)',
    category: 'electronics',
    categoryLabel: 'Electronics & Mobiles',
    brand: 'boAt',
    state: 'Delhi NCR',
    originCity: 'New Delhi',
    price: 999,
    originalPrice: 4490,
    discountPercentage: 78,
    rating: 4.4,
    reviewsCount: 38200,
    image: '/src/assets/images/tile_festival_hero_1790340009092.jpg',
    description: 'Active Noise Cancellation up to 32dB with dual ENx microphones, beast mode low latency for gaming, and ASAP fast charging.',
    highlights: [
      '32dB Active Noise Cancellation',
      '42 hours total battery backup with pocket case',
      'ASAP Charge: 5 mins = 60 mins playback',
      'IPX5 water & sweat resistant',
    ],
    inStock: true,
    prime: true,
    badge: '78% Off',
    variants: {
      type: 'color',
      label: 'Color',
      options: ['Midnight Black', 'Bold Blue', 'Gunmetal Grey'],
    },
  },
  {
    id: 'prod-el-2',
    name: 'Noise ColorFit Pulse 3 Smartwatch (1.96" TFT Display)',
    category: 'electronics',
    categoryLabel: 'Electronics & Mobiles',
    brand: 'Noise',
    state: 'Haryana',
    originCity: 'Gurugram',
    price: 1299,
    originalPrice: 4999,
    discountPercentage: 74,
    rating: 4.3,
    reviewsCount: 19800,
    image: '/src/assets/images/tile_festival_hero_1790340009092.jpg',
    description: 'Vibrant 1.96-inch curved HD display with Bluetooth calling, dial pad, heart rate, SpO2 sensor, and 100+ sports modes.',
    highlights: [
      'Single-chip stable Bluetooth calling',
      'Up to 7-day battery life on standard use',
      '150+ customizable watch faces',
      'Health suite with sleep and stress tracking',
    ],
    inStock: true,
    prime: true,
    variants: {
      type: 'color',
      label: 'Strap Color',
      options: ['Jet Black', 'Rose Gold', 'Silver Grey'],
    },
  },

  // Festive Kitchenware
  {
    id: 'prod-kt-1',
    name: 'Prestige Iris 750 Watt Mixer Grinder with 3 Stainless Steel Jars',
    category: 'kitchen',
    categoryLabel: 'Festive Kitchen',
    brand: 'Prestige',
    state: 'Tamil Nadu',
    originCity: 'Hosur',
    price: 2499,
    originalPrice: 4795,
    discountPercentage: 48,
    rating: 4.3,
    reviewsCount: 28900,
    image: '/src/assets/images/tile_home_essentials_1790339965592.jpg',
    description: 'Heavy duty 750W copper motor equipped with stainless steel multipurpose blades for wet batters, dry spices, and festival chutneys.',
    highlights: [
      '3 stainless steel jars (1.5L wet, 1.0L dry, 300ml chutney)',
      'Overload safety protection switch',
      'Ergonomic jar handles for firm grip',
    ],
    inStock: true,
    prime: true,
    badge: 'Festival Special',
  },
];

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  pincode: string;
  houseFlat: string;
  streetArea: string;
  landmark?: string;
  city: string;
  state: string;
  type: 'Home' | 'Work';
  isDefault: boolean;
}

export const INITIAL_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    fullName: 'Rahul Sharma',
    phone: '9876543210',
    pincode: '500062',
    houseFlat: 'Flat 402, Sai Residency',
    streetArea: 'Near ECIL Cross Roads, A.S. Rao Nagar',
    landmark: 'Opposite Heritage Supermarket',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'Home',
    isDefault: true,
  },
  {
    id: 'addr-2',
    fullName: 'Rahul Sharma (Office)',
    phone: '9876543210',
    pincode: '500081',
    houseFlat: 'Tower B, 7th Floor, Mindspace Tech Park',
    streetArea: 'Madhapur, Hitech City',
    landmark: 'Behind Inorbit Mall',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'Work',
    isDefault: false,
  },
];

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
}

export interface PlacedOrder {
  id: string;
  orderNumber: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  deliveryAddress: Address;
  deliveryDate: string;
  status: 'Confirmed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Return Requested' | 'Refund Completed';
  returnDetails?: {
    reason: string;
    requestedAt: string;
    status: 'Pending Pickup' | 'Refund Approved';
  };
  trackingSteps: {
    title: string;
    description: string;
    completed: boolean;
    date: string;
  }[];
}
