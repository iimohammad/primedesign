import type { Product } from '@primedesign/commerce';
export const products: Product[] = [
  {
    id: 'headphones',
    title: 'هدفون بی‌سیم نوا پرو',
    subtitle: 'Nova Pro · Wireless Headphones',
    brand: 'NOVA AUDIO',
    category: 'صوتی',
    price: 3490000,
    originalPrice: 4200000,
    stock: 8,
    rating: 4.8,
    reviewCount: 128,
    image: './products/headphones.svg',
    freeShipping: true,
    badges: ['پرفروش'],
    description:
      'صدای شفاف، حذف نویز فعال و طراحی سبک برای تمام روز. تا ۴۰ ساعت پخش موسیقی با یک بار شارژ.',
    variants: [
      { id: 'purple', label: 'بنفش', color: '#7e71ca', stock: 8 },
      { id: 'black', label: 'مشکی', color: '#292b39', stock: 12 },
      { id: 'cream', label: 'کرم', color: '#e1d7c9', stock: 0 },
    ],
    specifications: { اتصال: 'بلوتوث ۵.۳', 'عمر باتری': '۴۰ ساعت', وزن: '۲۴۰ گرم' },
  },
  {
    id: 'watch',
    title: 'ساعت هوشمند پالس',
    subtitle: 'Pulse S2 · Smart Watch',
    brand: 'PULSE',
    category: 'پوشیدنی',
    price: 2790000,
    originalPrice: 3190000,
    stock: 3,
    rating: 4.6,
    reviewCount: 86,
    image: './products/watch.svg',
    freeShipping: true,
    variants: [
      { id: 'sage', label: 'سبز', color: '#93ad9e', stock: 3 },
      { id: 'black', label: 'مشکی', color: '#30323b', stock: 7 },
    ],
    specifications: { نمایشگر: 'AMOLED', 'عمر باتری': '۷ روز', وزن: '۳۶ گرم' },
  },
  {
    id: 'speaker',
    title: 'اسپیکر قابل حمل اکو مینی',
    subtitle: 'Echo Mini · Portable Speaker',
    brand: 'ECHO',
    category: 'صوتی',
    price: 1590000,
    stock: 24,
    rating: 4.9,
    reviewCount: 214,
    image: './products/speaker.svg',
    variants: [
      { id: 'cream', label: 'کرم', color: '#d5c4b0', stock: 24 },
      { id: 'green', label: 'سبز', color: '#586e61', stock: 12 },
    ],
    specifications: { اتصال: 'بلوتوث ۵.۲', 'عمر باتری': '۱۲ ساعت', وزن: '۴۱۰ گرم' },
  },
  {
    id: 'camera',
    title: 'دوربین فوری مومنت',
    subtitle: 'Moment One · Instant Camera',
    brand: 'MOMENT',
    category: 'دوربین',
    price: 6250000,
    originalPrice: 6900000,
    stock: 6,
    rating: 4.7,
    reviewCount: 42,
    image: './products/camera.svg',
    freeShipping: true,
    badges: ['جدید'],
    specifications: { لنز: '۶۰ میلی‌متر', وزن: '۳۰۰ گرم', باتری: 'دو عدد AA' },
  },
  {
    id: 'keyboard',
    title: 'کیبورد مکانیکی تایپ ۷۵',
    subtitle: 'Type 75 · Mechanical Keyboard',
    brand: 'TYPE STUDIO',
    category: 'لوازم جانبی',
    price: 3890000,
    stock: 0,
    rating: 4.8,
    reviewCount: 67,
    image: './products/keyboard.svg',
    specifications: { اتصال: 'USB-C', کلیدها: '۷۵ درصد', وزن: '۸۰۰ گرم' },
  },
  {
    id: 'bag',
    title: 'کوله‌پشتی روزمره تریل',
    subtitle: 'Trail Everyday · Backpack',
    brand: 'TRAIL',
    category: 'سبک زندگی',
    price: 1890000,
    originalPrice: 2400000,
    stock: 15,
    rating: 4.5,
    reviewCount: 59,
    image: './products/bag.svg',
    variants: [
      { id: 'terracotta', label: 'آجری', color: '#b97d66', stock: 15 },
      { id: 'navy', label: 'سرمه‌ای', color: '#404d6a', stock: 9 },
    ],
    specifications: { حجم: '۲۰ لیتر', جنس: 'پارچه ضدآب', وزن: '۶۵۰ گرم' },
  },
];
export const initialTickets = [
  {
    id: '1042',
    title: 'راهنمای اتصال فروشگاه',
    preview: 'سلام، برای اتصال فروشگاه به پنل به راهنمایی نیاز دارم.',
    status: 'open' as const,
    priority: 'high' as const,
    date: '۱۰ دقیقه پیش',
    unread: 2,
    customer: 'سارا احمدی',
  },
  {
    id: '1041',
    title: 'پیگیری وضعیت پرداخت',
    preview: 'پرداخت انجام شده ولی سفارش هنوز در انتظار پرداخت است.',
    status: 'pending' as const,
    date: 'یک ساعت پیش',
    customer: 'علی رضایی',
  },
  {
    id: '1038',
    title: 'تغییر اطلاعات حساب',
    preview: 'خیلی ممنون از پشتیبانی سریع شما.',
    status: 'closed' as const,
    date: 'دیروز',
    customer: 'مریم نادری',
  },
];
export interface DemoOrder {
  id: string;
  customer: string;
  email: string;
  product: string;
  amount: number;
  status: string;
  date: string;
}
export const orders: DemoOrder[] = Array.from({ length: 137 }, (_, i) => ({
  id: String(1042 + i),
  customer: ['سارا احمدی', 'علی رضایی', 'مریم نادری', 'محمد بهرامی', 'نگار کریمی', 'رضا موسوی'][
    i % 6
  ],
  email: ['sara', 'ali', 'maryam', 'mohammad', 'negar', 'reza'][i % 6] + '@example.com',
  product: products[i % products.length].title,
  amount: products[i % products.length].price,
  status: ['پرداخت شده', 'در حال پردازش', 'ارسال شده', 'لغو شده'][i % 4],
  date: `۱۴۰۵/۰۸/${String((i % 30) + 1).padStart(2, '0')}`,
}));
