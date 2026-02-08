import { ScrollView, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { djenApi, type DJENPublication } from "@/lib/djen-api";
import { searchHistoryStorage } from "@/lib/storage";

type ProcessResult = DJENPublication & {
  lastUpdate: string;
  parts: string;
};

export default function SearchScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("todos");
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Carregar publicações recentes ao abrir a tela
  useEffect(() => {
    loadRecentPublications();
  }, []);

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

  const filterOptions = [
    { id: "todos", label: "Todos" },
    { id: "meus", label: "Meus Processos" },
    { id: "recentes", label: "Recentes" },
  ];

  const ProcessCard = ({ item }: { item: ProcessResult }) => (
    <TouchableOpacity
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

        {/* Results Section */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-foreground">
              {hasSearched ? "Resultados da Busca" : "Publicações Recentes"}
            </Text>
            <TouchableOpacity className="flex-row items-center gap-1">
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
