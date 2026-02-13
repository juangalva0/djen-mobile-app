import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  fontSize: "small" | "normal" | "large";
  notificationsEnabled: boolean;
  notificationSound: boolean;
  notificationVibration: boolean;
  silentHoursStart?: string; // HH:mm format
  silentHoursEnd?: string; // HH:mm format
  notificationTypes: {
    newPublications: boolean;
    processUpdates: boolean;
    deadlineAlerts: boolean;
    systemNotifications: boolean;
  };
  biometricEnabled: boolean;
  autoSyncEnabled: boolean;
  language: "pt-BR" | "en-US";
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "auto",
  fontSize: "normal",
  notificationsEnabled: true,
  notificationSound: true,
  notificationVibration: true,
  notificationTypes: {
    newPublications: true,
    processUpdates: true,
    deadlineAlerts: true,
    systemNotifications: true,
  },
  biometricEnabled: false,
  autoSyncEnabled: true,
  language: "pt-BR",
};

const PREFERENCES_KEY = "djen_user_preferences";

/**
 * Serviço para gerenciar preferências do usuário
 */
class UserPreferencesService {
  /**
   * Obter preferências do usuário
   */
  async getPreferences(): Promise<UserPreferences> {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return DEFAULT_PREFERENCES;
    } catch (error) {
      console.error("Erro ao obter preferências:", error);
      return DEFAULT_PREFERENCES;
    }
  }

  /**
   * Atualizar preferências do usuário
   */
  async updatePreferences(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const current = await this.getPreferences();
      const updated = { ...current, ...updates };
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error("Erro ao atualizar preferências:", error);
      throw error;
    }
  }

  /**
   * Atualizar tema
   */
  async setTheme(theme: "light" | "dark" | "auto"): Promise<void> {
    await this.updatePreferences({ theme });
  }

  /**
   * Atualizar tamanho de fonte
   */
  async setFontSize(fontSize: "small" | "normal" | "large"): Promise<void> {
    await this.updatePreferences({ fontSize });
  }

  /**
   * Atualizar configurações de notificação
   */
  async updateNotificationSettings(settings: Partial<UserPreferences>): Promise<void> {
    const current = await this.getPreferences();
    const updated = {
      ...current,
      notificationsEnabled: settings.notificationsEnabled ?? current.notificationsEnabled,
      notificationSound: settings.notificationSound ?? current.notificationSound,
      notificationVibration: settings.notificationVibration ?? current.notificationVibration,
      silentHoursStart: settings.silentHoursStart ?? current.silentHoursStart,
      silentHoursEnd: settings.silentHoursEnd ?? current.silentHoursEnd,
      notificationTypes: {
        ...current.notificationTypes,
        ...settings.notificationTypes,
      },
    };
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  }

  /**
   * Habilitar/desabilitar autenticação biométrica
   */
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    await this.updatePreferences({ biometricEnabled: enabled });
  }

  /**
   * Verificar se está em horário de silêncio
   */
  async isInSilentHours(): Promise<boolean> {
    const prefs = await this.getPreferences();
    if (!prefs.silentHoursStart || !prefs.silentHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    return currentTime >= prefs.silentHoursStart && currentTime <= prefs.silentHoursEnd;
  }

  /**
   * Resetar para preferências padrão
   */
  async resetToDefaults(): Promise<void> {
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(DEFAULT_PREFERENCES));
  }

  /**
   * Exportar preferências (para backup)
   */
  async exportPreferences(): Promise<string> {
    const prefs = await this.getPreferences();
    return JSON.stringify(prefs, null, 2);
  }

  /**
   * Importar preferências (de backup)
   */
  async importPreferences(data: string): Promise<void> {
    try {
      const parsed = JSON.parse(data);
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(parsed));
    } catch (error) {
      console.error("Erro ao importar preferências:", error);
      throw new Error("Formato de arquivo inválido");
    }
  }
}

export const userPreferencesService = new UserPreferencesService();
