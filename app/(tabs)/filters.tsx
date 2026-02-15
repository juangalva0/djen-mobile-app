import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert, Modal, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect, useCallback, memo } from "react";
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

// Memoizar o componente FilterInput
const FilterInput = memo(({
  label,
  value,
  onChangeText,
  placeholder,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  colors: any;
}) => (
  <View className="mb-4">
    <Text className="text-sm font-semibold text-foreground mb-2">{label}</Text>
    <TextInput
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 8,
        color: colors.foreground,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
      }}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      value={value}
      onChangeText={onChangeText}
    />
  </View>
));

FilterInput.displayName = "FilterInput";

// Memoizar o componente FilterDropdown
const FilterDropdown = memo(({
  label,
  options,
  value,
  onSelect,
  dropdownId,
  openDropdown,
  setOpenDropdown,
  colors,
}: {
  label: string;
  options: string[];
  value: string;
  onSelect: (value: string) => void;
  dropdownId: string;
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
  colors: any;
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
));

FilterDropdown.displayName = "FilterDropdown";

// Memoizar o componente SavedFilterCard
const SavedFilterCard = memo(({
  filter,
  colors,
  onLoad,
  onEdit,
  onDelete,
}: {
  filter: SavedFilter;
  colors: any;
  onLoad: (filter: SavedFilter) => void;
  onEdit: (filter: SavedFilter) => void;
  onDelete: (id: string) => void;
}) => (
  <View
    style={{
      backgroundColor: colors.surface,
      borderLeftColor: filter.color,
      borderLeftWidth: 4,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    }}
  >
    <TouchableOpacity
      onPress={() => onLoad(filter)}
      style={{
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
      <IconSymbol name="chevron.right" size={20} color={colors.muted} />
    </TouchableOpacity>

    {/* Action Buttons */}
    <View
      style={{
        flexDirection: "row",
        gap: 8,
        marginTop: 12,
        paddingTop: 12,
        borderTopColor: colors.border,
        borderTopWidth: 1,
      }}
    >
      <TouchableOpacity
        onPress={() => onEdit(filter)}
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.primary,
          borderRadius: 6,
          paddingVertical: 8,
          gap: 6,
        }}
      >
        <IconSymbol name="pencil" size={16} color="#FFFFFF" />
        <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>Editar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          Alert.alert("Remover Filtro", `Deseja remover "${filter.name}"?`, [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Remover",
              style: "destructive",
              onPress: () => onDelete(filter.id),
            },
          ]);
        }}
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.error,
          borderRadius: 6,
          paddingVertical: 8,
          gap: 6,
        }}
      >
        <IconSymbol name="trash" size={16} color="#FFFFFF" />
        <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>Deletar</Text>
      </TouchableOpacity>
    </View>
  </View>
));

SavedFilterCard.displayName = "SavedFilterCard";

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  const [editingName, setEditingName] = useState("");

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

  const updateFilter = async () => {
    if (!editingFilter || !editingName.trim()) {
      Alert.alert("Erro", "Digite um nome para o filtro");
      return;
    }

    try {
      const updated = savedFilters.map((f) =>
        f.id === editingFilter.id
          ? { ...f, name: editingName, filters }
          : f
      );
      await AsyncStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
      setSavedFilters(updated);
      setEditingFilter(null);
      setEditingName("");
      setShowEditModal(false);
      Alert.alert("Sucesso", "Filtro atualizado com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o filtro");
    }
  };

  const deleteFilter = useCallback(async (id: string) => {
    try {
      const updated = savedFilters.filter((f) => f.id !== id);
      await AsyncStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
      setSavedFilters(updated);
      Alert.alert("Sucesso", "Filtro removido");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível remover o filtro");
    }
  }, [savedFilters]);

  const loadFilter = useCallback((filter: SavedFilter) => {
    setFilters(filter.filters);
    Alert.alert("Filtro Carregado", `Filtro "${filter.name}" carregado com sucesso`);
  }, []);

  const editFilter = (filter: SavedFilter) => {
    setEditingFilter(filter);
    setEditingName(filter.name);
    setFilters(filter.filters);
    setShowEditModal(true);
  };

  const handleClearFilters = useCallback(() => {
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
  }, []);

  const handleApplyFilters = useCallback(() => {
    console.log("Filtros aplicados:", filters);
    Alert.alert("Busca", "Buscando com os filtros aplicados...");
  }, [filters]);

  const handleUpdateFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

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
              <SavedFilterCard
                key={filter.id}
                filter={filter}
                colors={colors}
                onLoad={loadFilter}
                onEdit={editFilter}
                onDelete={deleteFilter}
              />
            ))}
          </View>
        )}

        {/* Campos de Filtro */}
        <Text className="text-lg font-semibold text-foreground mb-4">Criar Novo Filtro</Text>

        {/* Teor da Comunicação */}
        <FilterInput
          label="Teor da comunicação"
          value={filters.teor || ""}
          onChangeText={(text) => handleUpdateFilter("teor", text)}
          placeholder="Digite o teor..."
          colors={colors}
        />

        {/* Instituições */}
        <FilterDropdown
          label="Todas as instituições"
          options={OPTIONS.instituicoes}
          value={filters.instituicoes || ""}
          onSelect={(value) => handleUpdateFilter("instituicoes", value)}
          dropdownId="instituicoes"
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          colors={colors}
        />

        {/* Órgãos */}
        <FilterDropdown
          label="Todos os órgãos"
          options={OPTIONS.orgaos}
          value={filters.orgaos || ""}
          onSelect={(value) => handleUpdateFilter("orgaos", value)}
          dropdownId="orgaos"
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          colors={colors}
        />

        {/* Meios */}
        <FilterDropdown
          label="Todos os meios"
          options={OPTIONS.meios}
          value={filters.meios || ""}
          onSelect={(value) => handleUpdateFilter("meios", value)}
          dropdownId="meios"
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          colors={colors}
        />

        {/* Datas */}
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground mb-2">Data inicial</Text>
            <TouchableOpacity
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
              <Text style={{ color: filters.startDate ? colors.foreground : colors.muted }}>
                {filters.startDate || "14/02/2026"}
              </Text>
              <IconSymbol name="calendar" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground mb-2">Data final</Text>
            <TouchableOpacity
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
              <Text style={{ color: filters.endDate ? colors.foreground : colors.muted }}>
                {filters.endDate || "14/02/2026"}
              </Text>
              <IconSymbol name="calendar" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Número do Processo */}
        <FilterInput
          label="Nº de processo"
          value={filters.numeroProcesso || ""}
          onChangeText={(text) => handleUpdateFilter("numeroProcesso", text)}
          placeholder="Digite o número..."
          colors={colors}
        />

        {/* Nome da Parte */}
        <FilterInput
          label="Nome da parte"
          value={filters.nomeParte || ""}
          onChangeText={(text) => handleUpdateFilter("nomeParte", text)}
          placeholder="Digite o nome..."
          colors={colors}
        />

        {/* Nome do Advogado */}
        <FilterInput
          label="Nome do advogado"
          value={filters.nomeAdvogado || ""}
          onChangeText={(text) => handleUpdateFilter("nomeAdvogado", text)}
          placeholder="Digite o nome..."
          colors={colors}
        />

        {/* Nº da OAB */}
        <FilterInput
          label="Nº da OAB"
          value={filters.numeroOAB || ""}
          onChangeText={(text) => handleUpdateFilter("numeroOAB", text)}
          placeholder="Digite o número..."
          colors={colors}
        />

        {/* UF da OAB */}
        <FilterDropdown
          label="UF da OAB"
          options={OPTIONS.ufOAB}
          value={filters.ufOAB || ""}
          onSelect={(value) => handleUpdateFilter("ufOAB", value)}
          dropdownId="ufOAB"
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          colors={colors}
        />

        {/* Botões de Ação */}
        <View className="flex-row gap-3 mt-6">
          <TouchableOpacity
            onPress={handleClearFilters}
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
              Limpar Filtros
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowSaveDialog(true)}
            style={{
              flex: 1,
              backgroundColor: colors.primary,
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
              Salvar Filtro
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleApplyFilters}
            style={{
              flex: 1,
              backgroundColor: colors.primary,
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
              Pesquisar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Salvar Filtro */}
      <Modal
        visible={showSaveDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSaveDialog(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 20,
              width: "100%",
              maxWidth: 400,
            }}
          >
            <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "700", marginBottom: 16 }}>
              Salvar Filtro
            </Text>

            <TextInput
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 8,
                color: colors.foreground,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
                marginBottom: 20,
              }}
              placeholder="Nome do filtro"
              placeholderTextColor={colors.muted}
              value={filterName}
              onChangeText={setFilterName}
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowSaveDialog(false);
                  setFilterName("");
                }}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={saveFilter}
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
                  Salvar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Editar Filtro */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 20,
              width: "100%",
              maxWidth: 400,
            }}
          >
            <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "700", marginBottom: 16 }}>
              Editar Filtro
            </Text>

            <TextInput
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 8,
                color: colors.foreground,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
                marginBottom: 20,
              }}
              placeholder="Nome do filtro"
              placeholderTextColor={colors.muted}
              value={editingName}
              onChangeText={setEditingName}
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowEditModal(false);
                  setEditingFilter(null);
                  setEditingName("");
                }}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={updateFilter}
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
                  Atualizar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
