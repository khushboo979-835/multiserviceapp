import { create } from "zustand";
import { Product, CartItem, Coupon, StoreOrder, StoreOrderStatus } from "../types";
import { MOCK_COUPONS } from "../constants/mockData";

export interface AddItemResult {
  success: boolean;
  conflict: boolean;
  existingShopName?: string;
}

interface CartStore {
  items: CartItem[];
  currentShopId: string | null;
  currentShopName: string | null;
  isGift: boolean;
  giftRecipientName: string;
  giftMessage: string;
  appliedCoupon: Coupon | null;
  orders: StoreOrder[];

  // Actions
  addItem: (product: Product, shopId?: string, shopName?: string) => AddItemResult;
  forceAddItem: (product: Product, shopId?: string, shopName?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setGiftOptions: (isGift: boolean, recipientName?: string, message?: string) => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  placeOrder: (deliveryAddress: string, paymentMethod: string, backendOrder?: any) => StoreOrder;
  updateOrderStatus: (orderId: string, status: StoreOrderStatus) => void;

  // Computed / Helpers
  getItemCount: () => number;
  getItemQuantity: (productId: string) => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getGiftWrapFee: () => number;
  getDeliveryFee: () => number;
  getFinalTotal: () => number;
}

const INITIAL_ORDERS: StoreOrder[] = [
  {
    id: "ord_inisha_101",
    orderNumber: "IN-2026-9812",
    items: [
      {
        product: {
          id: "prod_acc_1",
          name: "65W SuperVOOC Fast Charger Type-C",
          category: "MOBILE_ACCESSORIES",
          categoryName: "Mobile Accessories",
          description: "Ultra-fast charging for OnePlus, Realme, Oppo, Samsung, Xiaomi.",
          price: 699,
          originalPrice: 1499,
          discountPercentage: 53,
          unit: "1 Pack",
          imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80",
          inStock: true,
          rating: 4.9,
          deliveryTimeMins: 15,
        },
        quantity: 1,
      },
    ],
    itemTotal: 699,
    deliveryFee: 0,
    discountAmount: 0,
    giftWrapFee: 0,
    totalAmount: 699,
    status: "DELIVERED",
    otp: "7482",
    isGift: false,
    deliveryAddress: "Kidwaipuri, Boring Road, Patna, Bihar - 800001",
    paymentMethod: "UPI Online (Paid)",
    paymentStatus: "PAID",
    placedAt: "Yesterday",
    estimatedDeliveryTime: "Delivered",
  },
];

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  currentShopId: null,
  currentShopName: null,
  isGift: false,
  giftRecipientName: "",
  giftMessage: "",
  appliedCoupon: null,
  orders: INITIAL_ORDERS,

  addItem: (product: Product, shopId?: string, shopName?: string): AddItemResult => {
    const state = get();
    const targetShopId = shopId || product.shopId || "inisha_official";
    const targetShopName = shopName || product.shopName || product.sellerName || "Inisha Store";

    // Single-Shop Cart Enforcement Check
    if (state.items.length > 0 && state.currentShopId && state.currentShopId !== targetShopId) {
      return {
        success: false,
        conflict: true,
        existingShopName: state.currentShopName || "Another Store",
      };
    }

    set((s) => {
      const existingIndex = s.items.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...s.items];
        updated[existingIndex].quantity += 1;
        return { items: updated, currentShopId: targetShopId, currentShopName: targetShopName };
      }
      return {
        items: [...s.items, { product, quantity: 1 }],
        currentShopId: targetShopId,
        currentShopName: targetShopName,
      };
    });

    return { success: true, conflict: false };
  },

  forceAddItem: (product: Product, shopId?: string, shopName?: string) => {
    const targetShopId = shopId || product.shopId || "inisha_official";
    const targetShopName = shopName || product.shopName || product.sellerName || "Inisha Store";

    set({
      items: [{ product, quantity: 1 }],
      currentShopId: targetShopId,
      currentShopName: targetShopName,
      appliedCoupon: null,
    });
  },

  removeItem: (productId: string) => {
    set((state) => {
      const remaining = state.items.filter((item) => item.product.id !== productId);
      return {
        items: remaining,
        currentShopId: remaining.length === 0 ? null : state.currentShopId,
        currentShopName: remaining.length === 0 ? null : state.currentShopName,
      };
    });
  },

  updateQuantity: (productId: string, quantity: number) => {
    set((state) => {
      if (quantity <= 0) {
        const remaining = state.items.filter((item) => item.product.id !== productId);
        return {
          items: remaining,
          currentShopId: remaining.length === 0 ? null : state.currentShopId,
          currentShopName: remaining.length === 0 ? null : state.currentShopName,
        };
      }
      return {
        items: state.items.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        ),
      };
    });
  },

  clearCart: () => {
    set({
      items: [],
      currentShopId: null,
      currentShopName: null,
      appliedCoupon: null,
      isGift: false,
      giftRecipientName: "",
      giftMessage: "",
    });
  },

  setGiftOptions: (isGift: boolean, recipientName?: string, message?: string) => {
    set((state) => ({
      isGift,
      giftRecipientName: recipientName !== undefined ? recipientName : state.giftRecipientName,
      giftMessage: message !== undefined ? message : state.giftMessage,
    }));
  },

  applyCoupon: (coupon: Coupon) => {
    set({ appliedCoupon: coupon });
  },

  removeCoupon: () => {
    set({ appliedCoupon: null });
  },

  getItemCount: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getItemQuantity: (productId: string) => {
    const item = get().items.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  },

  getSubtotal: () => {
    return get().items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  },

  getDiscount: () => {
    const subtotal = get().getSubtotal();
    const coupon = get().appliedCoupon;
    if (!coupon || subtotal < coupon.minOrderValue) return 0;
    if (coupon.discountType === "FLAT") {
      return Math.min(coupon.discountValue, subtotal);
    }
    const pctDiscount = Math.round((subtotal * coupon.discountValue) / 100);
    return coupon.maxDiscount ? Math.min(pctDiscount, coupon.maxDiscount) : pctDiscount;
  },

  getGiftWrapFee: () => {
    return get().isGift ? 30 : 0;
  },

  getDeliveryFee: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= 299 ? 0 : 25;
  },

  getFinalTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscount();
    const giftFee = get().getGiftWrapFee();
    const delivery = get().getDeliveryFee();
    return Math.max(0, subtotal - discount + giftFee + delivery);
  },

  placeOrder: (deliveryAddress: string, paymentMethod: string, backendOrder?: any) => {
    const state = get();
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const orderNum = backendOrder?.orderNumber || `IN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = state.getSubtotal();
    const discount = state.getDiscount();
    const giftWrap = state.getGiftWrapFee();
    const delivery = state.getDeliveryFee();
    const total = state.getFinalTotal();

    const newOrder: StoreOrder = {
      id: backendOrder?.orderId || `ord_${Date.now()}`,
      orderNumber: orderNum,
      shopId: state.currentShopId || "inisha_official",
      shopName: state.currentShopName || "Inisha Store",
      items: [...state.items],
      itemTotal: subtotal,
      deliveryFee: delivery,
      discountAmount: discount,
      giftWrapFee: giftWrap,
      totalAmount: total,
      status: "PLACED",
      otp: backendOrder?.deliveryInfo?.deliveryOtp || randomOtp,
      pickupOtp: backendOrder?.deliveryInfo?.pickupOtp,
      deliveryOtp: backendOrder?.deliveryInfo?.deliveryOtp || randomOtp,
      isGift: state.isGift,
      giftRecipientName: state.isGift ? state.giftRecipientName : undefined,
      giftMessage: state.isGift ? state.giftMessage : undefined,
      deliveryAddress: deliveryAddress || "Home - Kidwaipuri, Boring Road, Patna",
      paymentMethod,
      paymentStatus: paymentMethod.includes("COD") ? "PENDING_COD" : "PAID",
      deliveryPartner: {
        name: "Vikash Sharma (Inisha Express)",
        phone: "+91 91234 56789",
        vehicleNumber: "BR 01 EV 9081",
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
        rating: 4.95,
      },
      placedAt: "Just now",
      estimatedDeliveryTime: "15-20 mins",
    };

    set((s) => ({
      orders: [newOrder, ...s.orders],
      items: [],
      currentShopId: null,
      currentShopName: null,
      appliedCoupon: null,
      isGift: false,
      giftRecipientName: "",
      giftMessage: "",
    }));

    return newOrder;
  },

  updateOrderStatus: (orderId: string, status: StoreOrderStatus) => {
    set((state) => ({
      orders: state.orders.map((ord) =>
        ord.id === orderId ? { ...ord, status } : ord
      ),
    }));
  },
}));
