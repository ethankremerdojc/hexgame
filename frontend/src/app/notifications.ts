export type NotificationSetupResult = {
  permission: NotificationPermission;
  registration: ServiceWorkerRegistration;
};

export async function isNotificationsSupported(): Promise<boolean> {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

export async function getNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    throw new Error("Notifications are not supported in this browser.");
  }

  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    throw new Error("Notifications are not supported in this browser.");
  }

  return Notification.requestPermission();
}

export async function registerNotificationServiceWorker(
  swUrl: string = "/sw.js",
): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers are not supported in this browser.");
  }

  return navigator.serviceWorker.register(swUrl);
}

export async function setupNotifications(
  swUrl: string = "/sw.js",
): Promise<NotificationSetupResult> {
  const supported = await isNotificationsSupported();
  if (!supported) {
    throw new Error("Notifications are not supported in this browser.");
  }

  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    throw new Error(`Notification permission is '${permission}'.`);
  }

  const registration = await registerNotificationServiceWorker(swUrl);

  return { permission, registration };
}

export async function showTestNotification(
  title: string,
  options?: NotificationOptions,
): Promise<void> {
  const { registration } = await setupNotifications();

  await registration.showNotification(title, {
    body: "Notifications are working.",
    ...options,
  });
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function subscribeForPush(
  vapidPublicKey: string,
): Promise<PushSubscription> {
  const { registration } = await setupNotifications();

  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    return existing;
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
}

export async function signupForNotifications(params: {
  vapidPublicKey?: string;
  swUrl?: string;
  saveSubscription?: (subscription: PushSubscription) => Promise<void>;
} = {}): Promise<PushSubscription | null> {
  const { vapidPublicKey, swUrl = "/sw.js", saveSubscription } = params;

  await setupNotifications(swUrl);

  if (!vapidPublicKey) {
    return null;
  }

  const subscription = await subscribeForPush(vapidPublicKey);

  if (saveSubscription) {
    await saveSubscription(subscription);
  }

  return subscription;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);

  const buffer = new ArrayBuffer(rawData.length);
  const bytes = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; ++i) {
    bytes[i] = rawData.charCodeAt(i);
  }

  return bytes;
}

// function urlBase64ToUint8Array(base64String: string): Uint8Array {
//   const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
//   const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
//   const rawData = window.atob(base64);
//
//   return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
// }
