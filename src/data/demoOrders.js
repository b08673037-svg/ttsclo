export const demoOrders = [
  {
    id: "order-1",
    orderId: "TTS-2026-ABC12345",
    phone: "+923001234567",
    customerName: "Ahmed Khan",
    status: "Shipped", // Order Placed, Confirmed, Processing, Shipped, Out for Delivery, Delivered
    createdAt: "2026-10-20",
    estimatedDelivery: "2026-10-25",
    total: 4500,
    items: [
      { name: "Premium Brown Peshawari Chappal", qty: 1, price: 4500 },
    ],
  },
  {
    id: "order-2",
    orderId: "TTS-2026-XYZ98765",
    phone: "+923001234567",
    customerName: "Ahmed Khan",
    status: "Delivered",
    createdAt: "2026-10-10",
    estimatedDelivery: "2026-10-15",
    total: 1000,
    items: [
      { name: "Premium Casual Footwear", qty: 2, price: 500 },
    ],
  },
  {
    id: "order-3",
    orderId: "TTS-2026-DEF45678",
    phone: "+923009876543",
    customerName: "Sana Rehman",
    status: "Processing",
    createdAt: "2026-10-23",
    estimatedDelivery: "2026-10-28",
    total: 2000,
    items: [
      { name: "Cotton Undergarments Pack", qty: 1, price: 2000 },
    ],
  },
];