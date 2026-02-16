import { ScrollView, Text, View, TouchableOpacity, FlatList, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";

interface SavedFilter {
  id: number;
  name: string;
  description?: string;
  notificationsEnabled: boolean;
  lastSyncedAt?: string;
  newResultsCount?: number;
}

export default function SavedFiltersScreen() {
  const colors = useColors();
  const router = useRouter();

  const [filters, setFilters] = useState<SavedFilter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carregar filtros salvos
  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: Carregar filtros da API
      // Por enquanto, usar dados mockados
      setFilters([
        {
          id: 1,
          name: "Processo 0000001-00.0000.0.00.0000",
          description: "Monitorando processo de João Silva",
          notificationsEnabled: true,
          lastSyncedAt: new Date(Date.now() - 5 * 60000).toISOString(),
          newResultsCount: 2,
        },
        {
          id: 2,
          name: "Partes: Silva & Associados",
          description: "Monitorando publicações da empresa",
          notificationsEnabled: true,
          lastSyncedAt: new Date(Date.now() - 15 * 60000).toISOString(),
          newResultsCount: 0,
        },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os filtros");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadFilters();
    } finally {
      setRefreshing(false);
    }
  }, [loadFilters]);

  const handleDeleteFilter = useCallback((filterId: number) => {
    Alert.alert("Remover Filtro", "Tem certeza que deseja remover este filtro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            // TODO: Deletar filtro via API
            setFilters((prev) => prev.filter((f) => f.id !== filterId));
            Alert.alert("Sucesso", "Filtro removido!");
          } catch (error) {
            Alert.alert("Erro", "Não foi possível remover o filtro");
          }
        },
      },
    ]);
  }, []);

  const handleToggleNotifications = useCallback(async (filterId: number, enabled: boolean) => {
    try {
      // TODO: Atualizar notificações via API
      setFilters((prev) =>
        prev.map((f) => (f.id === filterId ? { ...f, notificationsEnabled: !enabled } : f))
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar as configurações");
    }
  }, []);

  const formatarData = (dataString?: string) => {
    if (!dataString) return "Nunca";
    const data = new Date(dataString);
    const agora = new Date();
    const diff = Math.floor((agora.getTime() - data.getTime()) / 1000);

    if (diff < 60) return "Agora";
    if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return `${Math.floor(diff / 86400)}d atrás`;
  };

  const FilterItem = ({ filter }: { filter: SavedFilter }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
            {filter.name}
          </Text>
          {filter.description && (
            <Text style={{ color: colors.muted, fontSize: 12 }}>{filter.description}</Text>
          )}
        </View>

        {/* Menu */}
        <TouchableOpacity
          onPress={() => handleDeleteFilter(filter.id)}
          style={{ padding: 8 }}
        >
          <IconSymbol name="ellipsis" size={20} color={colors.muted} />
        </TouchableOpacity>
      </View>

      {/* Status */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 12,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          marginBottom: 12,
        }}
      >
        <View>
          <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>
            Última sincronização
          </Text>
          <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "500" }}>
            {formatarData(filter.lastSyncedAt)}
          </Text>
        </View>

        {filter.newResultsCount! > 0 && (
          <View
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>
              {filter.newResultsCount} novo(s)
            </Text>
          </View>
        )}
      </View>

      {/* Toggle Notificações */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "500" }}>
            Notificações
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => handleToggleNotifications(filter.id, filter.notificationsEnabled)}
          style={{
            width: 50,
            height: 28,
            borderRadius: 14,
            backgroundColor: filter.notificationsEnabled ? colors.primary : colors.border,
            justifyContent: "center",
            paddingHorizontal: 2,
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: "#FFFFFF",
              marginLeft: filter.notificationsEnabled ? 24 : 2,
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        onScroll={({ nativeEvent }) => {
          if (nativeEvent.contentOffset.y <= 0) {
            handleRefresh();
          }
        }}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: colors.surface,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "700", flex: 1 }}>
            Filtros Salvos
          </Text>
        </View>

        {/* Info Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <IconSymbol name="slider.horizontal.3" size={24} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginBottom: 4 }}>
                Monitore seus processos
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
                Salve filtros para monitorar automaticamente novos atos e publicações. Receba notificações via WhatsApp quando encontrarem resultados.
              </Text>
            </View>
          </View>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        )}

        {/* Empty State */}
        {!isLoading && filters.length === 0 && (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 60 }}>
            <IconSymbol name="slider.horizontal.3" size={48} color={colors.muted} />
            <Text style={{ color: colors.muted, fontSize: 14, marginTop: 12, textAlign: "center" }}>
              Nenhum filtro salvo ainda
            </Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4, textAlign: "center" }}>
              Crie um filtro na tela de busca para começar a monitorar
            </Text>
          </View>
        )}

        {/* Filters List */}
        {!isLoading && filters.length > 0 && (
          <View>
            {filters.map((filter) => (
              <FilterItem key={filter.id} filter={filter} />
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
