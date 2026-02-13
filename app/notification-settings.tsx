import { ScrollView, Text, View, TouchableOpacity, Switch, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { userPreferencesService } from "@/lib/user-preferences";

export default function NotificationSettingsScreen() {
  const colors = useColors();
  const router = useRouter();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationSound, setNotificationSound] = useState(true);
  const [notificationVibration, setNotificationVibration] = useState(true);
  const [silentHoursStart, setSilentHoursStart] = useState("22:00");
  const [silentHoursEnd, setSilentHoursEnd] = useState("08:00");
  const [newPublications, setNewPublications] = useState(true);
  const [processUpdates, setProcessUpdates] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await userPreferencesService.getPreferences();
      setNotificationsEnabled(prefs.notificationsEnabled);
      setNotificationSound(prefs.notificationSound);
      setNotificationVibration(prefs.notificationVibration);
      setSilentHoursStart(prefs.silentHoursStart || "22:00");
      setSilentHoursEnd(prefs.silentHoursEnd || "08:00");
      setNewPublications(prefs.notificationTypes.newPublications);
      setProcessUpdates(prefs.notificationTypes.processUpdates);
      setDeadlineAlerts(prefs.notificationTypes.deadlineAlerts);
      setSystemNotifications(prefs.notificationTypes.systemNotifications);
    } catch (error) {
      console.error("Erro ao carregar preferências:", error);
    }
  };

  const savePreferences = async () => {
    try {
      await userPreferencesService.updateNotificationSettings({
        notificationsEnabled,
        notificationSound,
        notificationVibration,
        silentHoursStart,
        silentHoursEnd,
        notificationTypes: {
          newPublications,
          processUpdates,
          deadlineAlerts,
          systemNotifications,
        },
      });
      Alert.alert("Sucesso", "Configurações de notificação salvas!");
      router.back();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as configurações.");
    }
  };

  const NotificationToggle = ({
    label,
    description,
    value,
    onValueChange,
  }: {
    label: string;
    description?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderBottomColor: colors.border,
        borderBottomWidth: 1,
      }}
      className="flex-row items-center justify-between px-4 py-4"
    >
      <View className="flex-1">
        <Text className="text-base font-medium text-foreground">{label}</Text>
        {description && <Text className="text-xs text-muted mt-1">{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        disabled={!notificationsEnabled}
      />
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-foreground">Notificações</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Main Toggle */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted uppercase mb-3">Geral</Text>
          <NotificationToggle
            label="Ativar Notificações"
            description="Receba alertas sobre seus processos monitorados"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>

        {/* Notification Types */}
        {notificationsEnabled && (
          <>
            <View className="mb-6">
              <Text className="text-sm font-semibold text-muted uppercase mb-3">Tipos de Notificação</Text>
              <View style={{ backgroundColor: colors.surface, borderRadius: 8, overflow: "hidden" }}>
                <NotificationToggle
                  label="Novas Publicações"
                  description="Alertas quando novos atos são publicados"
                  value={newPublications}
                  onValueChange={setNewPublications}
                />
                <NotificationToggle
                  label="Atualizações de Processo"
                  description="Mudanças no status dos processos"
                  value={processUpdates}
                  onValueChange={setProcessUpdates}
                />
                <NotificationToggle
                  label="Alertas de Prazo"
                  description="Lembretes de prazos importantes"
                  value={deadlineAlerts}
                  onValueChange={setDeadlineAlerts}
                />
                <NotificationToggle
                  label="Notificações do Sistema"
                  description="Atualizações e manutenção do app"
                  value={systemNotifications}
                  onValueChange={setSystemNotifications}
                />
              </View>
            </View>

            {/* Sound & Vibration */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-muted uppercase mb-3">Som e Vibração</Text>
              <View style={{ backgroundColor: colors.surface, borderRadius: 8, overflow: "hidden" }}>
                <NotificationToggle
                  label="Som"
                  description="Reproduzir som ao receber notificação"
                  value={notificationSound}
                  onValueChange={setNotificationSound}
                />
                <NotificationToggle
                  label="Vibração"
                  description="Vibrar ao receber notificação"
                  value={notificationVibration}
                  onValueChange={setNotificationVibration}
                />
              </View>
            </View>

            {/* Silent Hours */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-muted uppercase mb-3">Horário de Silêncio</Text>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                }}
                className="rounded-lg p-4"
              >
                <Text className="text-sm text-foreground mb-3">
                  Notificações serão silenciosas entre {silentHoursStart} e {silentHoursEnd}
                </Text>
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-xs text-muted mb-2">Início</Text>
                    <TouchableOpacity
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        borderWidth: 1,
                      }}
                      className="rounded-lg p-3 items-center"
                    >
                      <Text className="text-base font-semibold text-foreground">{silentHoursStart}</Text>
                    </TouchableOpacity>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-muted mb-2">Fim</Text>
                    <TouchableOpacity
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        borderWidth: 1,
                      }}
                      className="rounded-lg p-3 items-center"
                    >
                      <Text className="text-base font-semibold text-foreground">{silentHoursEnd}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Save Button */}
        <TouchableOpacity
          onPress={savePreferences}
          style={{ backgroundColor: colors.primary }}
          className="rounded-lg py-4 items-center justify-center mb-4"
        >
          <Text className="text-white font-semibold">Salvar Configurações</Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          className="rounded-lg py-4 items-center justify-center"
        >
          <Text className="text-foreground font-semibold">Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
