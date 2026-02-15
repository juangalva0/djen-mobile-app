import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert, Modal, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FilterState {
  teor?: string;
  instituicoes?: string;
  orgaos?: string;
  meios?: string;
  startDate?: string;
  endDate?: string;
  numeroProcesso?: string;
  nomeParte?: string;
  nomeAdvogado?: string;
  numeroOAB?: string;
  ufOAB?: string;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: FilterState;
  color: string;
  createdAt: string;
}

const SAVED_FILTERS_KEY = "djen_saved_filters";
const FILTER_COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"];

const OPTIONS = {
  instituicoes: ["Todas as instituições", "Poder Judiciário", "Ministério Público", "Defensoria Pública"],
  orgaos: ["Todos os órgãos", "Tribunal de Justiça", "Juizado Especial", "Vara Cível", "Vara Criminal"],
  meios: ["Todos os meios", "Eletrônico", "Físico", "Híbrido"],
  ufOAB: ["SP", "RJ", "MG", "BA", "SC", "RS", "PR", "PE", "CE", "GO", "DF", "Outros"],
};

export default function FiltersScreen() {
  const colors = useColors();
  const [filters, setFilters] = useState<FilterState>({
    teor: "",
    instituicoes: "Todas as instituições",
    orgaos: "Todos os órgãos",
    meios: "Todos os meios",
    startDate: "",
    endDate: "",
    numeroProcesso: "",
    nomeParte: "",
    nomeAdvogado: "",
    numeroOAB: "",
    ufOAB: "",
  });

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    loadSavedFilters();
  }, []);

  const loadSavedFilters = async () => {
    try {
      const stored = await AsyncStorage.getItem(SAVED_FILTERS_KEY);
      if (stored) {
        setSavedFilters(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Erro ao carregar filtros salvos:", error);
    }
  };

  const saveFilter = async () => {
    if (!filterName.trim()) {
      Alert.alert("Erro", "Digite um nome para o filtro");
      return;
    }

    try {
      const newFilter: SavedFilter = {
        id: Date.now().toString(),
        name: filterName,
        filters,
        color: FILTER_COLORS[savedFilters.length % FILTER_COLORS.length],
        createdAt: new Date().toISOString(),
      };

      const updated = [...savedFilters, newFilter];
      await AsyncStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
      setSavedFilters(updated);
      setFilterName("");
      setShowSaveDialog(false);
      Alert.alert("Sucesso", "Filtro salvo com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o filtro");
    }
  };

  const deleteFilter = async (id: string) => {
    try {
      const updated = savedFilters.filter((f) => f.id !== id);
      await AsyncStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
      setSavedFilters(updated);
      Alert.alert("Sucesso", "Filtro removido");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível remover o filtro");
    }
  };

  const loadFilter = (filter: SavedFilter) => {
    setFilters(filter.filters);
    Alert.alert("Filtro Carregado", `Filtro "${filter.name}" carregado com sucesso`);
  };

  const handleClearFilters = () => {
    setFilters({
      teor: "",
      instituicoes: "Todas as instituições",
      orgaos: "Todos os órgãos",
      meios: "Todos os meios",
      startDate: "",
      endDate: "",
      numeroProcesso: "",
      nomeParte: "",
      nomeAdvogado: "",
      numeroOAB: "",
      ufOAB: "",
    });
  };

  const handleApplyFilters = () => {
    console.log("Filtros aplicados:", filters);
    Alert.alert("Busca", "Buscando com os filtros aplicados...");
  };

  const FilterInput = ({
    label,
    value,
    onChangeText,
    placeholder,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
  }) => (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-foreground mb-2">{label}</Text>
      <TextInput
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          color: colors.foreground,
        }}
        className="border rounded-lg px-4 py-3 text-base"
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );

  const FilterDropdown = ({
    label,
    options,
    value,
    onSelect,
    dropdownId,
  }: {
    label: string;
    options: string[];
    value: string;
    onSelect: (value: string) => void;
    dropdownId: string;
  }) => (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-foreground mb-2">{label}</Text>
      <TouchableOpacity
        onPress={() => setOpenDropdown(openDropdown === dropdownId ? null : dropdownId)}
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 12,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.foreground, fontSize: 16 }}>{value || label}</Text>
        <IconSymbol
          name={openDropdown === dropdownId ? "chevron.up" : "chevron.down"}
          size={20}
          color={colors.muted}
        />
      </TouchableOpacity>

      {openDropdown === dropdownId && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderTopWidth: 0,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            marginTop: -1,
            zIndex: 1000,
          }}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={option}
              onPress={() => {
                onSelect(option);
                setOpenDropdown(null);
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderBottomColor: colors.border,
                borderBottomWidth: index < options.length - 1 ? 1 : 0,
              }}
            >
              <Text
                style={{
                  color: value === option ? colors.primary : colors.foreground,
                  fontSize: 16,
                  fontWeight: value === option ? "600" : "400",
                }}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const SavedFilterCard = ({ filter }: { filter: SavedFilter }) => (
    <TouchableOpacity
      onPress={() => loadFilter(filter)}
      style={{
        backgroundColor: colors.surface,
        borderLeftColor: filter.color,
        borderLeftWidth: 4,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View className="flex-1">
        <Text className="font-semibold text-foreground">{filter.name}</Text>
        <Text className="text-xs text-muted mt-1">
          {new Date(filter.createdAt).toLocaleDateString("pt-BR")}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          Alert.alert("Remover Filtro", `Deseja remover "${filter.name}"?`, [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Remover",
              style: "destructive",
              onPress: () => deleteFilter(filter.id),
            },
          ]);
        }}
        className="p-2"
      >
        <IconSymbol name="chevron.right" size={20} color={colors.muted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Título */}
        <Text className="text-2xl font-bold text-foreground mb-6">Filtros Avançados</Text>

        {/* Filtros Salvos */}
        {savedFilters.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">Meus Filtros</Text>
            {savedFilters.map((filter) => (
              <SavedFilterCard key={filter.id} filter={filter} />
            ))}
          </View>
        )}

        {/* Campos de Filtro */}
        <Text className="text-lg font-semibold text-foreground mb-4">Criar Novo Filtro</Text>

        {/* Teor da Comunicação */}
        <FilterInput
          label="Teor da comunicação"
          value={filters.teor || ""}
          onChangeText={(text) => setFilters({ ...filters, teor: text })}
          placeholder="Digite o teor..."
        />

        {/* Instituições */}
        <FilterDropdown
          label="Todas as instituições"
          options={OPTIONS.instituicoes}
          value={filters.instituicoes || ""}
          onSelect={(value) => setFilters({ ...filters, instituicoes: value })}
          dropdownId="instituicoes"
        />

        {/* Órgãos */}
        <FilterDropdown
          label="Todos os órgãos"
          options={OPTIONS.orgaos}
          value={filters.orgaos || ""}
          onSelect={(value) => setFilters({ ...filters, orgaos: value })}
          dropdownId="orgaos"
        />

        {/* Meios */}
        <FilterDropdown
          label="Todos os meios"
          options={OPTIONS.meios}
          value={filters.meios || ""}
          onSelect={(value) => setFilters({ ...filters, meios: value })}
          dropdownId="meios"
        />

        {/* Datas */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground mb-2">Data inicial</Text>
            <TextInput
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.foreground,
              }}
              className="border rounded-lg px-4 py-3 text-base"
              placeholder="DD/MM/YYYY"
              placeholderTextColor={colors.muted}
              value={filters.startDate || ""}
              onChangeText={(text) => setFilters({ ...filters, startDate: text })}
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground mb-2">Data final</Text>
            <TextInput
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.foreground,
              }}
              className="border rounded-lg px-4 py-3 text-base"
              placeholder="DD/MM/YYYY"
              placeholderTextColor={colors.muted}
              value={filters.endDate || ""}
              onChangeText={(text) => setFilters({ ...filters, endDate: text })}
            />
          </View>
        </View>

        {/* Nº de Processo */}
        <FilterInput
          label="Nº de processo"
          value={filters.numeroProcesso || ""}
          onChangeText={(text) => setFilters({ ...filters, numeroProcesso: text })}
          placeholder="Digite o número do processo..."
        />

        {/* Nome da Parte */}
        <FilterInput
          label="Nome da parte"
          value={filters.nomeParte || ""}
          onChangeText={(text) => setFilters({ ...filters, nomeParte: text })}
          placeholder="Digite o nome da parte..."
        />

        {/* Nome do Advogado */}
        <FilterInput
          label="Nome do advogado"
          value={filters.nomeAdvogado || ""}
          onChangeText={(text) => setFilters({ ...filters, nomeAdvogado: text })}
          placeholder="Digite o nome do advogado..."
        />

        {/* Nº da OAB */}
        <FilterInput
          label="Nº da OAB"
          value={filters.numeroOAB || ""}
          onChangeText={(text) => setFilters({ ...filters, numeroOAB: text })}
          placeholder="Digite o número da OAB..."
        />

        {/* UF da OAB */}
        <FilterDropdown
          label="UF da OAB"
          options={OPTIONS.ufOAB}
          value={filters.ufOAB || ""}
          onSelect={(value) => setFilters({ ...filters, ufOAB: value })}
          dropdownId="ufOAB"
        />

        {/* Botões de Ação */}
        <View className="flex-row gap-3 mt-6 mb-4">
          <TouchableOpacity
            onPress={handleClearFilters}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              flex: 1,
            }}
          >
            <Text className="text-center font-semibold text-foreground">Limpar Filtros</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowSaveDialog(true)}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              flex: 1,
            }}
          >
            <Text className="text-center font-semibold text-white">Salvar Filtro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleApplyFilters}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              flex: 1,
            }}
          >
            <Text className="text-center font-semibold text-white">Pesquisar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Salvar Filtro */}
      {showSaveDialog && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 20,
              width: "80%",
              maxWidth: 300,
            }}
          >
            <Text className="text-lg font-bold text-foreground mb-4">Salvar Filtro</Text>
            <TextInput
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.foreground,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 16,
              }}
              placeholder="Nome do filtro"
              placeholderTextColor={colors.muted}
              value={filterName}
              onChangeText={setFilterName}
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowSaveDialog(false);
                  setFilterName("");
                }}
                style={{
                  backgroundColor: colors.border,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  flex: 1,
                }}
              >
                <Text className="text-center font-semibold text-foreground">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveFilter}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  flex: 1,
                }}
              >
                <Text className="text-center font-semibold text-white">Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}
