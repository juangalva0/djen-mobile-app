import { ScrollView, Text, View, TextInput, TouchableOpacity, ActivityIndicator, FlatList, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect, useCallback } from "react";
import { djenApi, type DJENPublication } from "@/lib/djen-api";
import { searchHistoryStorage } from "@/lib/storage";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { processManager } from "@/lib/process-manager";

type ProcessResult = DJENPublication & {
  lastUpdate: string;
  parts: string;
};

interface SavedFilter {
  id: string;
  name: string;
  filters: any;
  color: string;
  createdAt: string;
}

interface FilterFolder {
  filter: SavedFilter;
  results: ProcessResult[];
  isLoading: boolean;
}

const SAVED_FILTERS_KEY = "djen_saved_filters";

export default function SearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("todos");
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filterFolders, setFilterFolders] = useState<FilterFolder[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Carregar filtros salvos e seus resultados ao abrir a tela
  useFocusEffect(
    useCallback(() => {
      loadFilterFolders();
      loadRecentPublications();
    }, [])
  );

  const loadFilterFolders = async () => {
    try {
      const stored = await AsyncStorage.getItem(SAVED_FILTERS_KEY);
      if (stored) {
        const savedFilters: SavedFilter[] = JSON.parse(stored);
        const folders: FilterFolder[] = savedFilters.map((filter) => ({
          filter,
          results: [],
          isLoading: true,
        }));
        setFilterFolders(folders);

        // Carregar resultados para cada filtro
        folders.forEach(async (folder, index) => {
          try {
            const filterResults = await searchWithFilter(folder.filter.filters);
            setFilterFolders((prev) => {
              const updated = [...prev];
              updated[index] = {
                ...updated[index],
                results: filterResults,
                isLoading: false,
              };
              return updated;
            });
          } catch (error) {
            console.error(`Erro ao carregar resultados do filtro ${folder.filter.name}:`, error);
            setFilterFolders((prev) => {
              const updated = [...prev];
              updated[index] = {
                ...updated[index],
                isLoading: false,
              };
              return updated;
            });
          }
        });
      }
    } catch (error) {
      console.error("Erro ao carregar filtros salvos:", error);
    }
  };

  const searchWithFilter = async (filterConfig: any): Promise<ProcessResult[]> => {
    try {
      const query = filterConfig.nomeParte || filterConfig.nomeAdvogado || filterConfig.teor || "";
      if (!query.trim()) {
        return [];
      }

      const publications = await djenApi.search({ query });
      const formattedResults = publications.map((pub) => ({
        ...pub,
        parts: pub.parties.join(" vs. "),
        lastUpdate: `${pub.date}`,
      }));

      // Processar publicações para criar/atualizar processos
      await processManager.processPublications(
        publications.map((pub) => ({
          id: pub.id,
          number: pub.number,
          processNumber: pub.number,
          date: pub.date,
          content: pub.summary || "",
          type: "publication",
          court: pub.court,
          parties: pub.parties,
          judge: pub.judges?.[0],
        }))
      );

      return formattedResults;
    } catch (error) {
      console.error("Erro ao buscar com filtro:", error);
      return [];
    }
  };

  const loadRecentPublications = async () => {
    setIsLoading(true);
    try {
      const publications = await djenApi.getRecentPublications(5);
      const formattedResults = publications.map((pub) => ({
        ...pub,
        parts: pub.parties.join(" vs. "),
        lastUpdate: `${pub.date}`,
      }));
      setResults(formattedResults);

      // Processar publicações para criar/atualizar processos
      const { created, updated } = await processManager.processPublications(
        publications.map((pub) => ({
          id: pub.id,
          number: pub.number,
          processNumber: pub.number,
          date: pub.date,
          content: pub.summary || "",
          type: "publication",
          court: pub.court,
          parties: pub.parties,
          judge: pub.judges?.[0],
        }))
      );

      if (created > 0 || updated > 0) {
        console.log(`Processadas publicações: ${created} novos processos, ${updated} atualizações`);
      }
    } catch (error) {
      console.error("Erro ao carregar publicações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim()) {
      setIsLoading(true);
      setHasSearched(true);
      try {
        await searchHistoryStorage.add(text);
        const publications = await djenApi.search({ query: text });
        const formattedResults = publications.map((pub) => ({
          ...pub,
          parts: pub.parties.join(" vs. "),
          lastUpdate: `${pub.date}`,
        }));
        setResults(formattedResults);

        // Processar publicações para criar/atualizar processos
        const { created, updated } = await processManager.processPublications(
          publications.map((pub) => ({
            id: pub.id,
            number: pub.number,
            processNumber: pub.number,
            date: pub.date,
            content: pub.summary || "",
            type: "publication",
            court: pub.court,
            parties: pub.parties,
            judge: pub.judges?.[0],
          }))
        );

        if (created > 0 || updated > 0) {
          console.log(`Processadas publicações: ${created} novos processos, ${updated} atualizações`);
        }
      } catch (error) {
        console.error("Erro na busca:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setHasSearched(false);
      loadRecentPublications();
    }
  };

  const toggleFolderExpanded = (filterId: string) => {
    setExpandedFolders((prev) => {
      const updated = new Set(prev);
      if (updated.has(filterId)) {
        updated.delete(filterId);
      } else {
        updated.add(filterId);
      }
      return updated;
    });
  };

  const filterOptions = [
    { id: "todos", label: "Todos" },
    { id: "meus", label: "Meus Processos" },
    { id: "recentes", label: "Recentes" },
  ];

  const ProcessCard = ({ item }: { item: ProcessResult }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: "/publication-detail", params: { id: item.id } })}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
      }}
      className="rounded-lg p-4 mb-3"
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-sm font-semibold text-primary flex-1">{item.number}</Text>
        <Text className="text-xs text-muted">{item.court}</Text>
      </View>
      <Text className="text-sm text-foreground font-medium mb-2">{item.parts}</Text>
      <Text className="text-xs text-muted">Atualizado {item.lastUpdate}</Text>
    </TouchableOpacity>
  );

  const FolderCard = ({ folder }: { folder: FilterFolder }) => {
    const isExpanded = expandedFolders.has(folder.filter.id);

    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 12,
          marginBottom: 16,
          overflow: "hidden",
        }}
      >
        {/* Folder Header */}
        <TouchableOpacity
          onPress={() => toggleFolderExpanded(folder.filter.id)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderLeftColor: folder.filter.color,
            borderLeftWidth: 4,
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              backgroundColor: folder.filter.color,
              marginRight: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconSymbol name="folder.fill" size={16} color="white" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
              {folder.filter.name}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
              {folder.results.length} resultado{folder.results.length !== 1 ? "s" : ""}
            </Text>
          </View>

          <IconSymbol
            name={isExpanded ? "chevron.up" : "chevron.down"}
            size={20}
            color={colors.muted}
          />
        </TouchableOpacity>

        {/* Folder Content */}
        {isExpanded && (
          <View style={{ borderTopColor: colors.border, borderTopWidth: 1, paddingHorizontal: 16, paddingVertical: 12 }}>
            {folder.isLoading ? (
              <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 16 }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={{ color: colors.muted, marginTop: 8, fontSize: 12 }}>
                  Carregando resultados...
                </Text>
              </View>
            ) : folder.results.length > 0 ? (
              <FlatList
                data={folder.results}
                renderItem={ProcessCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 16 }}>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  Nenhum resultado encontrado
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Djen</Text>
          <Text className="text-sm text-muted">Consulta ao DJEN</Text>
        </View>

        {/* Search Bar */}
        <View
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="flex-row items-center rounded-lg border px-4 py-3 mb-6"
        >
          <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
          <TextInput
            style={{ color: colors.foreground }}
            className="flex-1 ml-3 text-base"
            placeholder="Número do processo, partes..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* Quick Filters */}
        <View className="flex-row gap-2 mb-6">
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => setActiveFilter(filter.id)}
              style={{
                backgroundColor: activeFilter === filter.id ? colors.primary : colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
              }}
              className="px-4 py-2 rounded-full"
            >
              <Text
                style={{
                  color: activeFilter === filter.id ? "#FFFFFF" : colors.foreground,
                }}
                className="text-sm font-medium"
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filter Folders Section */}
        {filterFolders.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">Meus Filtros</Text>
            {filterFolders.map((folder) => (
              <FolderCard key={folder.filter.id} folder={folder} />
            ))}
          </View>
        )}

        {/* Results Section */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-foreground">
              {hasSearched ? "Resultados da Busca" : "Publicações Recentes"}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/filters")}
              className="flex-row items-center gap-1"
            >
              <IconSymbol name="slider.horizontal.3" size={18} color={colors.primary} />
              <Text className="text-sm text-primary font-medium">Filtros</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-muted mt-4">Buscando publicações...</Text>
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              renderItem={ProcessCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View className="items-center justify-center py-8">
              <Text className="text-muted text-center">
                {hasSearched ? "Nenhum resultado encontrado" : "Publicações recentes"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
