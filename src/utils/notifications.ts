import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Configure standard notification handler behaviors
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Setup High Priority Dispatch Notification Channel for Android
 */
export async function setupNotificationChannels() {
  if (Platform.OS === "android") {
    // 1. High Priority Job Dispatch Alert Channel (with sound & loud vibration)
    await Notifications.setNotificationChannelAsync("job_dispatches", {
      name: "New Job Dispatch Alerts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 200, 500, 200, 500],
      lightColor: "#ef4444",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });

    // 2. Default Service Status Channel
    await Notifications.setNotificationChannelAsync("default", {
      name: "Service & Booking Updates",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#ef4444",
      sound: "default",
    });
  }
}

/**
 * Request user permission and return the Expo Push Notification Token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token = null;

  if (Platform.OS === "web") {
    return null;
  }

  await setupNotificationChannels();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
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
    console.warn("Notice fetching Expo push token (requires EAS build in production):", error);
  }

  return token;
}

/**
 * Schedule a local notification to simulate live push notifications
 */
export async function triggerLocalNotification(
  title: string,
  body: string,
  data: Record<string, any> = {},
  channelId: string = "default"
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      ...(Platform.OS === "android" ? { channelId } : {}),
    },
    trigger: null, // trigger immediately
  });
}

/**
 * Partner New Job Dispatch Alert (High-priority audio ringtone alert)
 */
export async function sendNewJobDispatchNotification(
  bookingId: string,
  serviceTitle: string,
  amount: number
) {
  await triggerLocalNotification(
    "🚨 NEW JOB DISPATCHED - TAP TO ACCEPT!",
    `Order #${bookingId?.slice(-6) || "NEW"}: ${serviceTitle} • Payout: ₹${amount}. Customer waiting for doorstep confirmation!`,
    { bookingId, event: "NEW_JOB_DISPATCH" },
    "job_dispatches"
  );
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
    `Tax invoice copy for booking #${bookingId} is available. Amount Paid: ₹${amount}. Thank you for using Inisha City Service!`,
    { bookingId, event: "RECEIPT_GENERATED" }
  );
}
