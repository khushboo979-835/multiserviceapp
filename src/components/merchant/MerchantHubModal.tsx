import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Store,
  X,
  Package,
  ShoppingBag,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  Key,
  DollarSign,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
} from "lucide-react-native";
import { apiClient } from "../../api/apiClient";
import { useAuthStore } from "../../store/useAuthStore";
import SafeImage from "../common/SafeImage";

interface MerchantHubModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function MerchantHubModal({ visible, onClose }: MerchantHubModalProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const shopId = user?.shopId || "shop_bihar_sweets_101";

  const [activeTab, setActiveTab] = useState<"ORDERS" | "MENU" | "STATS">("ORDERS");
  const [loading, setLoading] = useState(false);
  const [shopData, setShopData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayOrdersCount: 0,
    todaySales: 0,
    pendingOrdersCount: 0,
    totalProductsCount: 0,
  });

  const [isStoreOpen, setIsStoreOpen] = useState(true);

  // Add Item Modal
  const [addItemVisible, setAddItemVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Sweets");
  const [newItemUnit, setNewItemUnit] = useState("1 Unit");
  const [newItemImage, setNewItemImage] = useState("");
  const [newItemIsVeg, setNewItemIsVeg] = useState(true);
  const [savingItem, setSavingItem] = useState(false);

  const fetchMerchantData = async () => {
    try {
      setLoading(true);
      const [shopRes, ordersRes, statsRes] = await Promise.all([
        apiClient.get(`/shops/${shopId}`).catch(() => null),
        apiClient.get(`/orders/shop/${shopId}`).catch(() => null),
        apiClient.get(`/shops/${shopId}/dashboard`).catch(() => null),
      ]);

      if (shopRes?.data?.success) {
        setShopData(shopRes.data.shop);
        setProducts(shopRes.data.products || []);
        setIsStoreOpen(shopRes.data.shop?.openingHours?.isOpen ?? true);
      }

      if (ordersRes?.data?.success && Array.isArray(ordersRes.data.orders)) {
        setOrders(ordersRes.data.orders);
      }

      if (statsRes?.data?.success && statsRes.data.stats) {
        setStats(statsRes.data.stats);
      }
    } catch (err: any) {
      console.warn("Merchant fetch notice:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchMerchantData();
    }
  }, [visible, shopId]);

  const handleToggleStoreOpen = async (value: boolean) => {
    try {
      setIsStoreOpen(value);
      await apiClient.put(`/shops/${shopId}`, {
        "openingHours.isOpen": value,
      });
    } catch {
      Alert.alert("Notice", "Failed to update store hours");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
      );
      Alert.alert("Status Updated", `Order marked as ${newStatus}`);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to update order");
    }
  };

  const handleCreateProduct = async () => {
    if (!newItemName.trim() || !newItemPrice) {
      Alert.alert("Required", "Please provide a name and price for the item");
      return;
    }

    try {
      setSavingItem(true);
      const priceNum = parseFloat(newItemPrice) || 0;
      const res = await apiClient.post(`/shops/${shopId}/items`, {
        name: newItemName.trim(),
        price: priceNum,
        originalPrice: Math.round(priceNum * 1.2),
        category: newItemCategory,
        categoryName: newItemCategory,
        unit: newItemUnit,
        imageUrl:
          newItemImage ||
          "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=400&q=80",
        foodAttributes: {
          isVeg: newItemIsVeg,
          prepTimeMins: 20,
        },
      });

      if (res.data?.success && res.data.product) {
        setProducts((prev) => [res.data.product, ...prev]);
        setAddItemVisible(false);
        setNewItemName("");
        setNewItemPrice("");
        Alert.alert("Success! 🥗", "Item added to your store menu successfully.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to add item");
    } finally {
      setSavingItem(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.storeIconBox}>
              <Store size={22} color="#dc2626" />
            </View>
            <View>
              <Text style={styles.storeNameText}>{shopData?.name || "Merchant Store"}</Text>
              <Text style={styles.storeIdText}>ID: {shopId}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Store Live / Pause Toggle Bar */}
        <View style={styles.storeStatusBanner}>
          <View style={styles.statusIndicatorRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isStoreOpen ? "#16a34a" : "#dc2626" },
              ]}
            />
            <Text style={styles.statusBannerText}>
              {isStoreOpen ? "STORE IS OPEN • Accepting Orders" : "STORE PAUSED • Currently Closed"}
            </Text>
          </View>
          <Switch
            value={isStoreOpen}
            onValueChange={handleToggleStoreOpen}
            trackColor={{ false: "#cbd5e1", true: "#bbf7d0" }}
            thumbColor={isStoreOpen ? "#16a34a" : "#94a3b8"}
          />
        </View>

        {/* KPI Summary Cards */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <DollarSign size={16} color="#16a34a" />
            <Text style={styles.kpiValue}>₹{stats.todaySales || 0}</Text>
            <Text style={styles.kpiLabel}>Today's Sales</Text>
          </View>

          <View style={styles.kpiCard}>
            <ShoppingBag size={16} color="#ea580c" />
            <Text style={styles.kpiValue}>{stats.todayOrdersCount || orders.length}</Text>
            <Text style={styles.kpiLabel}>Today's Orders</Text>
          </View>

          <View style={styles.kpiCard}>
            <Clock size={16} color="#2563eb" />
            <Text style={styles.kpiValue}>{stats.pendingOrdersCount || 0}</Text>
            <Text style={styles.kpiLabel}>Active Prep</Text>
          </View>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === "ORDERS" && styles.tabItemActive]}
            onPress={() => setActiveTab("ORDERS")}
          >
            <Text style={[styles.tabText, activeTab === "ORDERS" && styles.tabTextActive]}>
              Live Orders ({orders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "MENU" && styles.tabItemActive]}
            onPress={() => setActiveTab("MENU")}
          >
            <Text style={[styles.tabText, activeTab === "MENU" && styles.tabTextActive]}>
              Catalog & Menu ({products.length})
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#dc2626" />
            <Text style={styles.loadingText}>Syncing merchant orders...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {activeTab === "ORDERS" ? (
              orders.length === 0 ? (
                <View style={styles.emptyBox}>
                  <ShoppingBag size={48} color="#cbd5e1" />
                  <Text style={styles.emptyTitle}>No Orders Yet</Text>
                  <Text style={styles.emptySubtitle}>
                    New orders placed by nearby customers will appear here instantly with live sound.
                  </Text>
                </View>
              ) : (
                orders.map((ord) => (
                  <View key={ord.orderId} style={styles.orderCard}>
                    <View style={styles.orderCardHeader}>
                      <div>
                        <Text style={styles.orderNumberText}>
                          {ord.orderNumber || ord.orderId}
                        </Text>
                        <Text style={styles.orderCustomerText}>
                          {ord.customerName} ({ord.customerPhone})
                        </Text>
                      </div>
                      <View style={styles.orderStatusBadge}>
                        <Text style={styles.orderStatusBadgeText}>{ord.status}</Text>
                      </View>
                    </View>

                    {/* Security Pickup OTP Box */}
                    {ord.deliveryInfo?.pickupOtp ? (
                      <View style={styles.pickupOtpBox}>
                        <Key size={14} color="#ea580c" />
                        <Text style={styles.pickupOtpLabel}>Rider Pickup OTP: </Text>
                        <Text style={styles.pickupOtpValue}>{ord.deliveryInfo.pickupOtp}</Text>
                      </View>
                    ) : null}

                    {/* Items List */}
                    <View style={styles.orderItemsBox}>
                      {ord.items?.map((item: any, idx: number) => (
                        <View key={idx} style={styles.orderItemRow}>
                          <Text style={styles.orderItemText}>
                            {item.quantity}x {item.name}
                          </Text>
                          <Text style={styles.orderItemPrice}>₹{item.price * item.quantity}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.orderTotalRow}>
                      <Text style={styles.orderTotalLabel}>Total Settlement</Text>
                      <Text style={styles.orderTotalValue}>₹{ord.pricing?.total || 0}</Text>
                    </View>

                    {/* Action Transitions */}
                    <View style={styles.orderActionsRow}>
                      {ord.status === "PENDING" && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: "#2563eb" }]}
                          onPress={() => handleUpdateOrderStatus(ord.orderId, "ACCEPTED")}
                        >
                          <Text style={styles.actionBtnText}>Accept Order</Text>
                        </TouchableOpacity>
                      )}

                      {(ord.status === "ACCEPTED" || ord.status === "PENDING") && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: "#7c3aed" }]}
                          onPress={() => handleUpdateOrderStatus(ord.orderId, "PREPARING")}
                        >
                          <Text style={styles.actionBtnText}>Mark Preparing</Text>
                        </TouchableOpacity>
                      )}

                      {ord.status === "PREPARING" && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: "#16a34a" }]}
                          onPress={() => handleUpdateOrderStatus(ord.orderId, "READY_FOR_PICKUP")}
                        >
                          <Text style={styles.actionBtnText}>Ready For Rider</Text>
                        </TouchableOpacity>
                      )}

                      {ord.status === "READY_FOR_PICKUP" && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: "#0891b2" }]}
                          onPress={() => handleUpdateOrderStatus(ord.orderId, "OUT_FOR_DELIVERY")}
                        >
                          <Text style={styles.actionBtnText}>Handed to Rider</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))
              )
            ) : (
              // Menu Tab
              <View style={styles.menuTabContainer}>
                <TouchableOpacity
                  style={styles.addNewItemBtn}
                  onPress={() => setAddItemVisible(true)}
                  activeOpacity={0.85}
                >
                  <Plus size={18} color="#ffffff" />
                  <Text style={styles.addNewItemText}>Add Dish or Product</Text>
                </TouchableOpacity>

                {products.map((prod) => (
                  <View key={prod.id} style={styles.menuItemCard}>
                    <SafeImage uri={prod.imageUrl} style={styles.menuItemThumb} />
                    <View style={styles.menuItemContent}>
                      <Text style={styles.menuItemName}>{prod.name}</Text>
                      <Text style={styles.menuItemCat}>{prod.categoryName || prod.category}</Text>
                      <Text style={styles.menuItemPrice}>₹{prod.price}</Text>
                    </View>
                    <View style={styles.inStockBadge}>
                      <Text style={styles.inStockText}>In Stock</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {/* Modal: Add New Product / Dish */}
        <Modal visible={addItemVisible} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.addItemCard}>
              <View style={styles.addItemHeader}>
                <Text style={styles.addItemTitle}>Add Dish or Store Item</Text>
                <TouchableOpacity onPress={() => setAddItemVisible(false)}>
                  <X size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.inputLabel}>Item Name *</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. Special Chicken Dum Biryani"
                  placeholderTextColor="#94a3b8"
                  value={newItemName}
                  onChangeText={setNewItemName}
                />

                <Text style={styles.inputLabel}>Price (₹) *</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="180"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={newItemPrice}
                  onChangeText={setNewItemPrice}
                />

                <Text style={styles.inputLabel}>Category / Subcategory</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="Biryani / Starters / Sweets"
                  placeholderTextColor="#94a3b8"
                  value={newItemCategory}
                  onChangeText={setNewItemCategory}
                />

                <Text style={styles.inputLabel}>Portion / Pack Unit</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="1 Plate / 500g / 1 Unit"
                  placeholderTextColor="#94a3b8"
                  value={newItemUnit}
                  onChangeText={setNewItemUnit}
                />

                <Text style={styles.inputLabel}>Image URL (Optional)</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="https://..."
                  placeholderTextColor="#94a3b8"
                  value={newItemImage}
                  onChangeText={setNewItemImage}
                />

                <View style={styles.vegToggleRow}>
                  <Text style={styles.inputLabel}>Vegetarian (Green mark)</Text>
                  <Switch
                    value={newItemIsVeg}
                    onValueChange={setNewItemIsVeg}
                    trackColor={{ false: "#cbd5e1", true: "#bbf7d0" }}
                    thumbColor={newItemIsVeg ? "#16a34a" : "#94a3b8"}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setAddItemVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleCreateProduct}
                  disabled={savingItem}
                >
                  <Text style={styles.modalSubmitText}>
                    {savingItem ? "Adding..." : "Add to Menu"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  storeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
  },
  storeNameText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  storeIdText: {
    fontSize: 11,
    color: "#64748b",
  },
  closeBtn: {
    padding: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
  },
  storeStatusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  statusIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusBannerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  kpiRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 4,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingHorizontal: 16,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: "#dc2626",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  tabTextActive: {
    color: "#dc2626",
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748b",
  },
  emptyBox: {
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 17,
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  orderNumberText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  orderCustomerText: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  orderStatusBadge: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  orderStatusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#dc2626",
  },
  pickupOtpBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#ffedd5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
    gap: 4,
  },
  pickupOtpLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#c2410c",
  },
  pickupOtpValue: {
    fontSize: 13,
    fontWeight: "900",
    color: "#c2410c",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  orderItemsBox: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    gap: 4,
  },
  orderItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderItemText: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "600",
  },
  orderItemPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  orderTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    marginBottom: 10,
  },
  orderTotalLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  orderTotalValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
  },
  orderActionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  actionBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },
  menuTabContainer: {
    gap: 10,
  },
  addNewItemBtn: {
    backgroundColor: "#dc2626",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
    marginBottom: 6,
  },
  addNewItemText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 13,
  },
  menuItemCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    gap: 10,
  },
  menuItemThumb: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  menuItemCat: {
    fontSize: 10,
    color: "#64748b",
  },
  menuItemPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: "#16a34a",
    marginTop: 2,
  },
  inStockBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inStockText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#16a34a",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  addItemCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 380,
  },
  addItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addItemTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    marginTop: 8,
    marginBottom: 4,
  },
  inputField: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: "#0f172a",
  },
  vegToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  modalActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  modalSubmitBtn: {
    flex: 1,
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
