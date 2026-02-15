import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, FlatList, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { processManager, type LegalProcess } from "@/lib/process-manager";
import { HighlightedText } from "@/components/highlighted-text";

interface ProcessPublication {
  id: string;
  date: string;
  content: string;
  type: string;
  court?: string;
}

export default function ProcessDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { processNumber } = useLocalSearchParams<{ processNumber: string }>();
  
  const [process, setProcess] = useState<LegalProcess | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedPublications, setExpandedPublications] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProcessDetails();
  }, [processNumber]);

  const loadProcessDetails = async () => {
    setIsLoading(true);
    try {
      if (!processNumber) {
        Alert.alert("Erro", "Número do processo não fornecido");
        router.back();
        return;
      }

      const processData = await processManager.getProcessByNumber(processNumber);
      if (processData) {
        setProcess(processData);
        
        // Verificar se é favorito
        const favorites = await AsyncStorage.getItem("djen_favorites");
        const favList = favorites ? JSON.parse(favorites) : [];
        setIsFavorite(favList.some((fav: any) => fav.number === processNumber));
      } else {
        Alert.alert("Erro", "Processo não encontrado");
        router.back();
      }
    } catch (error) {
      console.error("Erro ao carregar processo:", error);
      Alert.alert("Erro", "Não foi possível carregar o processo");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem("djen_favorites");
      let favList = favorites ? JSON.parse(favorites) : [];

      if (isFavorite) {
        favList = favList.filter((fav: any) => fav.processNumber !== processNumber);
      } else {
        if (process) {
          favList.push({
            processNumber: process.processNumber,
            parts: process.parties.join(" vs. "),
            court: process.court,
            date: new Date().toISOString(),
          });
        }
      }

      await AsyncStorage.setItem("djen_favorites", JSON.stringify(favList));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Erro ao atualizar favorito:", error);
      Alert.alert("Erro", "Não foi possível atualizar favorito");
    }
  };

  const togglePublicationExpanded = (pubId: string) => {
    setExpandedPublications((prev) => {
      const updated = new Set(prev);
      if (updated.has(pubId)) {
        updated.delete(pubId);
      } else {
        updated.add(pubId);
      }
      return updated;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return colors.success;
      case "completed":
        return colors.warning;
      case "suspended":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "completed":
        return "Concluído";
      case "suspended":
        return "Suspenso";
      default:
        return "Desconhecido";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const PublicationItem = ({ publication, index }: { publication: ProcessPublication; index: number }) => {
    const isExpanded = expandedPublications.has(publication.id);

    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 12,
          marginBottom: 12,
          overflow: "hidden",
        }}
      >
        {/* Publication Header */}
        <TouchableOpacity
          onPress={() => togglePublicationExpanded(publication.id)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderLeftColor: colors.primary,
            borderLeftWidth: 4,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
              {index + 1}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
              {publication.type === "publication" ? "Publicação" : "Movimentação"}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
              {formatDate(publication.date)}
            </Text>
          </View>

          <IconSymbol
            name={isExpanded ? "chevron.up" : "chevron.down"}
            size={20}
            color={colors.muted}
          />
        </TouchableOpacity>

        {/* Publication Content */}
        {isExpanded && (
          <View
            style={{
              borderTopColor: colors.border,
              borderTopWidth: 1,
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: colors.background,
            }}
          >
            <HighlightedText
              text={publication.content}
            />
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.muted, marginTop: 16 }}>Carregando processo...</Text>
      </ScreenContainer>
    );
  }

  if (!process) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
          Processo não encontrado
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "600" }}>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleFavorite}
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: isFavorite ? colors.primary : colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
            }}
          >
            <IconSymbol
              name={isFavorite ? "heart.fill" : "heart"}
              size={20}
              color={isFavorite ? "#FFFFFF" : colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Process Information Card */}
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
          {/* Process Number */}
          <View className="mb-4">
            <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>
              NÚMERO DO PROCESSO
            </Text>
            <Text
              style={{
                color: colors.foreground,
                fontSize: 16,
                fontWeight: "700",
                marginTop: 4,
              }}
            >
              {process.processNumber}
            </Text>
          </View>

          {/* Status */}
          <View className="mb-4">
            <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>STATUS</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: getStatusColor(process.status),
                }}
              />
              <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
                {getStatusLabel(process.status)}
              </Text>
            </View>
          </View>

          {/* Court */}
          <View className="mb-4">
            <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>TRIBUNAL</Text>
            <Text style={{ color: colors.foreground, fontSize: 14, marginTop: 4 }}>
              {process.court}
            </Text>
          </View>

          {/* Parties */}
          <View className="mb-4">
            <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>PARTES</Text>
            <Text style={{ color: colors.foreground, fontSize: 14, marginTop: 4 }}>
              {process.parties.join(" vs. ")}
            </Text>
          </View>

          {/* Judge */}
          {process.publications && process.publications[0]?.judge && (
            <View>
              <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>JUIZ</Text>
              <Text style={{ color: colors.foreground, fontSize: 14, marginTop: 4 }}>
                {process.publications[0].judge}
              </Text>
            </View>
          )}
        </View>

        {/* Publications Timeline */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "700" }}>
              Histórico de Publicações
            </Text>
            <View
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>
                {process.publications.length}
              </Text>
            </View>
          </View>

          {process.publications.length > 0 ? (
            <FlatList
              data={[...process.publications].sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
              ) as any}
              renderItem={({ item, index }) => (
                <PublicationItem 
                  publication={item} 
                  index={process.publications.length - index - 1}
                />
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 32,
                backgroundColor: colors.surface,
                borderRadius: 12,
                borderColor: colors.border,
                borderWidth: 1,
              }}
            >
              <IconSymbol name="doc.text" size={32} color={colors.muted} />
              <Text style={{ color: colors.muted, marginTop: 12, fontSize: 14 }}>
                Nenhuma publicação registrada
              </Text>
            </View>
          )}
        </View>

        {/* Last Update Info */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            marginTop: 16,
          }}
        >
          <Text style={{ color: colors.muted, fontSize: 12 }}>
            Última atualização: {formatDate(process.updatedAt)}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
