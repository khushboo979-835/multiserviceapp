import { BookingFormConfig, Category, FormFieldType, Product, ProductTypeCategory, Subcategory } from "../types";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://multiserviceapp-4pdw.onrender.com/api";

export const catalogKeys = {
  categories: ["catalog", "categories"] as const,
  products: ["catalog", "products"] as const,
  banners: ["catalog", "banners"] as const,
  offers: ["catalog", "offers"] as const,
};

export interface CatalogBanner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  imageUrl: string;
  targetCategory: string;
  isActive: boolean;
  order: number;
}

const fetchJson = async (path: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 50000);
  try {
    const response = await fetch(`${API_URL}${path}`, { signal: controller.signal });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || `Catalog request failed (${response.status})`);
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
};

const asList = (data: any, key: string): any[] =>
  Array.isArray(data) ? data : Array.isArray(data?.[key]) ? data[key] : [];

const nonEmptyString = (value: unknown, fallback: string): string =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const numberOr = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const fieldTypes: FormFieldType[] = ["TEXT", "NUMBER", "SELECT", "MULTI_SELECT", "DATE", "TIME_SLOT", "ADDRESS_GPS", "IMAGE"];

const normalizeFormConfig = (value: any): BookingFormConfig => ({
  fields: (Array.isArray(value?.fields) ? value.fields : [])
    .filter((field: any) => field && typeof field === "object")
    .map((field: any, index: number) => ({
      id: nonEmptyString(field.id, `field-${index}`),
      label: nonEmptyString(field.label, "Requirement"),
      type: fieldTypes.includes(field.type) ? field.type : "TEXT",
      placeholder: typeof field.placeholder === "string" ? field.placeholder : undefined,
      options: Array.isArray(field.options)
        ? field.options.filter((option: any) => option && typeof option === "object").map((option: any) => ({
            label: nonEmptyString(option.label, "Option"),
            value: nonEmptyString(option.value, option.label || "option"),
            priceModifier: numberOr(option.priceModifier, 0),
          }))
        : undefined,
      validation: {
        required: field.validation?.required === true || field.required === true,
        min: Number.isFinite(Number(field.validation?.min)) ? Number(field.validation.min) : undefined,
        max: Number.isFinite(Number(field.validation?.max)) ? Number(field.validation.max) : undefined,
      },
      priceModifierField: field.priceModifierField === true,
    })),
});

export const fetchCatalogCategories = async (): Promise<Category[]> => {
  const list = asList(await fetchJson("/categories"), "categories");
  return list.filter((item) => item && item.isActive !== false).map((item, index) => {
    const id = nonEmptyString(item.id || item.categoryId, `category-${index}`);
    const subcategories: Subcategory[] = (Array.isArray(item.subcategories) ? item.subcategories : []).map(
      (sub: any, subIndex: number) => ({
        id: nonEmptyString(sub?.id, `${id}-service-${subIndex}`),
        categoryId: id,
        name: nonEmptyString(sub?.name, nonEmptyString(item.name, "Service")),
        slug: nonEmptyString(sub?.slug, id),
        description: nonEmptyString(sub?.description, nonEmptyString(item.description, "")),
        basePrice: numberOr(sub?.basePrice, 0),
        imageUrl: nonEmptyString(sub?.imageUrl, nonEmptyString(item.imageUrl, "")),
        formConfig: normalizeFormConfig(sub?.formConfig),
      })
    );

    return {
      id,
      name: nonEmptyString(item.name, "Service"),
      slug: nonEmptyString(item.slug, id),
      description: nonEmptyString(item.description, ""),
      imageUrl: nonEmptyString(item.imageUrl, ""),
      subcategories,
      isActive: item.isActive !== false,
    };
  });
};

const productCategory = (value: unknown): ProductTypeCategory => {
  const category = String(value || "").toLowerCase();
  if (category.includes("foot") || category.includes("slipper") || category.includes("sandal") || category.includes("shoe")) return "FOOTWEAR";
  if (category.includes("saree") || category.includes("women") || category.includes("kurti") || category.includes("dress")) return "WOMENS_FASHION";
  if (category.includes("men") || category.includes("shirt") || category.includes("sock") || category.includes("t-shirt") || category.includes("pant")) return "MENS_FASHION";
  if (category.includes("groc") || category.includes("staple") || category.includes("dairy")) return "GROCERY";
  if (category.includes("accessor")) return "MOBILE_ACCESSORIES";
  if (category.includes("phone") || category.includes("mobile")) return "MOBILE_PHONES";
  if (category.includes("beauty") || category.includes("salon") || category.includes("parlour")) return "BEAUTY_PARLOUR";
  if (category.includes("elec")) return "ELECTRONICS";
  if (category.includes("home")) return "HOME_NEEDS";
  return "MOBILE_ACCESSORIES";
};

export const normalizeProduct = (item: any, index = 0): Product => {
  const price = numberOr(item.price, 0);
  const originalPrice = numberOr(item.originalPrice ?? item.mrp, price);
  const imageUrl = nonEmptyString(item.imageUrl || (Array.isArray(item.images) && item.images[0]), "");
  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images.filter((img: any) => typeof img === "string" && img.trim())
    : imageUrl ? [imageUrl] : [];

  const variants = Array.isArray(item.variants)
    ? item.variants.map((v: any) => ({
        name: nonEmptyString(v.name, "Option"),
        options: Array.isArray(v.options) ? v.options.map((o: any) => String(o)) : [],
        price: v.price !== undefined ? numberOr(v.price, price) : undefined,
        mrp: v.mrp !== undefined ? numberOr(v.mrp, originalPrice) : undefined,
        image: typeof v.image === "string" ? v.image : undefined,
      }))
    : undefined;

  const specifications = Array.isArray(item.specifications)
    ? item.specifications.map((s: any) => ({
        label: nonEmptyString(s.label, ""),
        value: nonEmptyString(s.value, ""),
      })).filter((s: any) => s.label && s.value)
    : undefined;

  const catType = productCategory(item.categoryName || item.category);
  const nameLower = String(item.name || "").toLowerCase();
  let finalImg = images[0] || imageUrl;

  // Protect against mismatched or placeholder photos on fashion & grocery products
  if (
    !finalImg ||
    (finalImg.includes("581578731548") && (catType === "WOMENS_FASHION" || nameLower.includes("kurti") || nameLower.includes("saree") || nameLower.includes("suit")))
  ) {
    if (catType === "WOMENS_FASHION" || nameLower.includes("kurti") || nameLower.includes("saree")) {
      finalImg = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80";
    } else if (catType === "GROCERY" || nameLower.includes("fruit") || nameLower.includes("veg") || nameLower.includes("atta")) {
      finalImg = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80";
    }
  }

  const resolvedImages = images.length > 0 && images[0] === finalImg ? images : [finalImg];

  return {
    id: nonEmptyString(item.id || item._id, `product-${index}`),
    name: nonEmptyString(item.name, "Product"),
    category: catType,
    categoryName: nonEmptyString(item.categoryName || item.category, "General"),
    description: nonEmptyString(item.description, ""),
    price,
    originalPrice,
    mrp: originalPrice,
    discountPercentage: numberOr(
      item.discountPercentage,
      originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0
    ),
    unit: nonEmptyString(item.unit, "1 Unit"),
    imageUrl: finalImg,
    images: resolvedImages,
    inStock: item.inStock !== false && !(typeof item.stock === "number" && item.stock <= 0),
    stock: numberOr(item.stock, 100),
    rating: numberOr(item.rating, 4.8),
    ratingsCount: numberOr(item.ratingsCount, 120),
    deliveryTimeMins: numberOr(item.deliveryTimeMins, 30),
    sellerName: nonEmptyString(item.sellerName, "Inisha Verified Partner"),
    brand: typeof item.brand === "string" ? item.brand : undefined,
    offerTitle: typeof item.offerTitle === "string" ? item.offerTitle : undefined,
    couponCode: typeof item.couponCode === "string" ? item.couponCode : undefined,
    offerDescription: typeof item.offerDescription === "string" ? item.offerDescription : undefined,
    badgeText: typeof item.badgeText === "string" ? item.badgeText : undefined,
    variants,
    specifications,
  };
};

export const fetchCatalogProducts = async (category?: string): Promise<Product[]> => {
  const queryParam = category && category !== "ALL" ? `?category=${encodeURIComponent(category)}` : "";
  const list = asList(await fetchJson(`/ecommerce/products${queryParam}`), "products");
  return list
    .filter((item) => item && typeof item === "object" && (Number(item.price) > 0 || Number(item.mrp) > 0))
    .map((item, index) => normalizeProduct(item, index));
};

export const fetchProductDetails = async (id: string): Promise<Product> => {
  const data = await fetchJson(`/ecommerce/products/${encodeURIComponent(id)}`);
  return normalizeProduct(data);
};

export const DEFAULT_CATALOG_BANNERS: CatalogBanner[] = [
  {
    id: "banner_default_1",
    title: "Flat 50% Off on Doorstep Mobile Repair",
    subtitle: "Certified technicians with 15 days warranty",
    tag: "MEGA OFFER",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    targetCategory: "Mobile Repair",
    isActive: true,
    order: 1,
  },
  {
    id: "banner_default_2",
    title: "30-Min Instant Food & Restaurant Delivery",
    subtitle: "Hot Biryani, Burgers & Local Delicacies",
    tag: "FOOD FEST",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    targetCategory: "Food",
    isActive: true,
    order: 2,
  },
  {
    id: "banner_default_3",
    title: "Fresh Groceries & Daily Essentials in 10 Mins",
    subtitle: "Fresh vegetables, dairy & staples at wholesale rates",
    tag: "EXPRESS",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    targetCategory: "Grocery",
    isActive: true,
    order: 3,
  },
  {
    id: "banner_default_4",
    title: "AC Deep Cleaning & Gas Refill from ₹499",
    subtitle: "Beat the heat with 100% cooling guarantee",
    tag: "SUMMER SPECIAL",
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
    targetCategory: "AC Repair",
    isActive: true,
    order: 4,
  },
];

export const fetchCatalogBanners = async (): Promise<CatalogBanner[]> => {
  try {
    const list = asList(await fetchJson("/banners"), "banners");
    if (!list || list.length === 0) return DEFAULT_CATALOG_BANNERS;
    const filtered = list.filter((item) => item && item.isActive !== false).map((item, index) => ({
      id: nonEmptyString(item.id || item._id, `banner-${index}`),
      title: nonEmptyString(item.title, "Special offer"),
      subtitle: nonEmptyString(item.subtitle, ""),
      tag: nonEmptyString(item.tag, "OFFER"),
      imageUrl: nonEmptyString(item.imageUrl, "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80"),
      targetCategory: nonEmptyString(item.targetCategory, "All Services"),
      isActive: item.isActive !== false,
      order: numberOr(item.order, index),
    }));
    return filtered.length > 0 ? filtered : DEFAULT_CATALOG_BANNERS;
  } catch (error) {
    return DEFAULT_CATALOG_BANNERS;
  }
};

export const fetchCatalogOffers = async (): Promise<CatalogBanner[]> => {
  try {
    const data = await fetchJson("/offers");
    const rawList = asList(data, "offers").length > 0 ? asList(data, "offers") : asList(data, "banners");
    if (!rawList || rawList.length === 0) return fetchCatalogBanners();
    const filtered = rawList.filter((item) => item && item.isActive !== false).map((item, index) => ({
      id: nonEmptyString(item.id || item._id, `offer-${index}`),
      title: nonEmptyString(item.title, "Special Offer"),
      subtitle: nonEmptyString(item.subtitle, ""),
      tag: nonEmptyString(item.tag, "SPECIAL OFFER"),
      imageUrl: nonEmptyString(item.imageUrl, "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80"),
      targetCategory: nonEmptyString(item.targetCategory, "All Services"),
      isActive: item.isActive !== false,
      order: numberOr(item.order, index),
    }));
    return filtered.length > 0 ? filtered : DEFAULT_CATALOG_BANNERS;
  } catch {
    return fetchCatalogBanners();
  }
};
