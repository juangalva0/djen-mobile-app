import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  processList: string[]; // IDs de processos que devem notificar
}

const NOTIFICATIONS_SETTINGS_KEY = "@djen_notifications_settings";

/**
 * Configurar o comportamento das notificações
 */
export async function setupNotifications() {
  // Definir como as notificações devem ser exibidas quando o app está em foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Solicitar permissões
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/**
 * Enviar notificação local (para desenvolvimento/testes)
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: true,
      badge: 1,
    },
    trigger: {
      seconds: 2, // Enviar em 2 segundos
    } as any,
  });
}

/**
 * Enviar notificação de nova publicação
 */
export async function notifyNewPublication(
  processNumber: string,
  publicationType: string,
  summary: string
) {
  const settings = await getNotificationSettings();

  if (!settings.enabled) return;

  // Verificar se o processo está na lista de monitoramento
  if (!settings.processList.includes(processNumber)) return;

  // Verificar quiet hours
  if (isInQuietHours(settings)) return;

  await sendLocalNotification(
    `Nova ${publicationType}`,
    `Processo ${processNumber}: ${summary}`,
    {
      processNumber,
      type: publicationType,
    }
  );
}

/**
 * Obter configurações de notificações
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATIONS_SETTINGS_KEY);
    return data
      ? JSON.parse(data)
      : {
          enabled: true,
          sound: true,
          vibration: true,
          processList: [],
        };
  } catch (error) {
    console.error("Erro ao obter configurações de notificações:", error);
    return {
      enabled: true,
      sound: true,
      vibration: true,
      processList: [],
    };
  }
}

/**
 * Salvar configurações de notificações
 */
export async function saveNotificationSettings(
  settings: NotificationSettings
): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Erro ao salvar configurações de notificações:", error);
  }
}

/**
 * Adicionar processo à lista de monitoramento de notificações
 */
export async function addProcessToNotifications(processNumber: string): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.processList.includes(processNumber)) {
    settings.processList.push(processNumber);
    await saveNotificationSettings(settings);
  }
}

/**
 * Remover processo da lista de monitoramento de notificações
 */
export async function removeProcessFromNotifications(processNumber: string): Promise<void> {
  const settings = await getNotificationSettings();
  settings.processList = settings.processList.filter((p) => p !== processNumber);
  await saveNotificationSettings(settings);
}

/**
 * Verificar se está dentro do horário de silêncio
 */
function isInQuietHours(settings: NotificationSettings): boolean {
  if (!settings.quietHoursStart || !settings.quietHoursEnd) return false;

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  return currentTime >= settings.quietHoursStart && currentTime <= settings.quietHoursEnd;
}

/**
 * Listener para notificações recebidas
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
) {
  // Quando a notificação é recebida enquanto o app está em foreground
  const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
    onNotificationReceived?.(notification);
  });

  // Quando o usuário toca na notificação
  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    onNotificationTapped?.(response);
  });

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}
