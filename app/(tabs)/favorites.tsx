import { ScrollView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

interface MonitoredProcess {
  id: string;
  number: string;
  parts: string;
  lastUpdate: string;
  court: string;
  notificationCount: number;
  isNotificationEnabled: boolean;
}

export default function FavoritesScreen() {
  const colors = useColors();
  const [processes, setProcesses] = useState<MonitoredProcess[]>([
    {
      id: "1",
      number: "0000001-23.2024.8.26.0100",
      parts: "João Silva vs. Maria Santos",
      lastUpdate: "Há 2 dias",
      court: "TJ-SP",
      notificationCount: 2,
      isNotificationEnabled: true,
    },
    {
      id: "2",
      number: "0000002-45.2024.8.26.0100",
      parts: "Empresa XYZ LTDA vs. Banco ABC",
      lastUpdate: "Há 5 dias",
      court: "TJ-SP",
      notificationCount: 0,
      isNotificationEnabled: true,
    },
  ]);

  const toggleNotification = (id: string) => {
    setProcesses(
      processes.map((p) => (p.id === id ? { ...p, isNotificationEnabled: !p.isNotificationEnabled } : p))
    );
  };

  const removeProcess = (id: string) => {
    setProcesses(processes.filter((p) => p.id !== id));
  };

  const ProcessCard = ({ item }: { item: MonitoredProcess }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
      }}
      className="rounded-lg p-4 mb-3"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-primary">{item.number}</Text>
          <Text className="text-xs text-muted mt-1">{item.court}</Text>
        </View>
        {item.notificationCount > 0 && (
          <View
            style={{ backgroundColor: colors.error }}
            className="rounded-full px-2 py-1 items-center justify-center"
          >
            <Text className="text-white text-xs font-semibold">{item.notificationCount}</Text>
          </View>
        )}
      </View>

      <Text className="text-sm text-foreground font-medium mb-3">{item.parts}</Text>

      <View className="flex-row justify-between items-center">
        <Text className="text-xs text-muted">Atualizado {item.lastUpdate}</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => toggleNotification(item.id)}
            style={{
              backgroundColor: item.isNotificationEnabled ? colors.primary : colors.border,
            }}
            className="rounded-full p-2"
          >
            <IconSymbol
              name="bell.fill"
              size={16}
              color={item.isNotificationEnabled ? "#FFFFFF" : colors.muted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => removeProcess(item.id)}
            style={{ backgroundColor: colors.error }}
            className="rounded-full p-2"
          >
            <Text className="text-white text-sm font-bold">×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground">Meus Processos</Text>
          <Text className="text-sm text-muted mt-1">Processos que você está monitorando</Text>
        </View>

        {/* Processes List */}
        {processes.length > 0 ? (
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-sm font-semibold text-foreground">
                {processes.length} processo{processes.length !== 1 ? "s" : ""} monitorado{processes.length !== 1 ? "s" : ""}
              </Text>
              <TouchableOpacity className="flex-row items-center gap-1">
                <Text className="text-xs text-primary font-medium">Ordenar</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={processes}
              renderItem={ProcessCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-12">
            <IconSymbol name="bookmark.fill" size={48} color={colors.muted} />
            <Text className="text-foreground font-semibold mt-4 text-center">Nenhum processo monitorado</Text>
            <Text className="text-muted text-center text-sm mt-2">
              Favoritize processos na busca para acompanhá-los aqui
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
