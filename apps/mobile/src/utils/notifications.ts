import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Configure standard notification handler behaviors
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request user permission and return the Expo Push Notification Token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token = null;

  if (Platform.OS === "web") {
    return null;
  }

  const res = await Notifications.getPermissionsAsync() as any;
  const existingStatus = res.status;
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const requestRes = await Notifications.requestPermissionsAsync() as any;
    finalStatus = requestRes.status;
  }

  if (finalStatus !== "granted") {
    console.warn("Permission to receive push notifications was denied!");
    return null;
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
      
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    console.log("Expo Push Token obtained successfully:", token);
  } catch (error) {
    console.error("Failed to fetch Expo push token:", error);
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#8b5cf6",
    });
  }

  return token;
}

/**
 * Schedule a local notification to simulate live push notifications
 */
export async function triggerLocalNotification(
  title: string,
  body: string,
  data: Record<string, any> = {}
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // trigger immediately
  });
}

/**
 * Notification template triggers for booking event lifecycles
 */
export async function sendProviderAssignedNotification(
  bookingId: string,
  providerName: string
) {
  await triggerLocalNotification(
    "Service Professional Assigned 🛠️",
    `Professional ${providerName} has accepted your booking #${bookingId} and will arrive shortly.`,
    { bookingId, event: "PROVIDER_ASSIGNED" }
  );
}

export async function sendProviderArrivedNotification(bookingId: string) {
  await triggerLocalNotification(
    "Professional Arrived at Doorstep 🚗",
    `Your service professional has arrived at your address for booking #${bookingId}. Please share your verification OTP key.`,
    { bookingId, event: "PROVIDER_ARRIVED" }
  );
}

export async function sendServiceCompletedNotification(
  bookingId: string,
  amount: number
) {
  await triggerLocalNotification(
    "Service Job Completed 🎉",
    `Your repair/salon job #${bookingId} is completed. Payout of ₹${amount} has been processed.`,
    { bookingId, event: "SERVICE_COMPLETED" }
  );
}

export async function sendReceiptNotification(bookingId: string, amount: number) {
  await triggerLocalNotification(
    "Invoiced Receipt Generated 🧾",
    `Tax invoice copy for booking #${bookingId} is available. Amount Paid: ₹${amount}. Thank you for using Multi-Service Hub!`,
    { bookingId, event: "RECEIPT_GENERATED" }
  );
}
