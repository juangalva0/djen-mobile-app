import { ScrollView, Text, View, TextInput, TouchableOpacity, Switch } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

interface FilterState {
  tribunal: string;
  startDate: string;
  endDate: string;
  tipoAto: string;
  palavraChave: string;
  partes: string;
  advogado: string;
}

export default function FiltersScreen() {
  const colors = useColors();
  const [filters, setFilters] = useState<FilterState>({
    tribunal: "",
    startDate: "",
    endDate: "",
    tipoAto: "",
    palavraChave: "",
    partes: "",
    advogado: "",
  });

  const [savedFilters, setSavedFilters] = useState<{ name: string; id: string }[]>([
    { name: "Meus Processos Ativos", id: "1" },
    { name: "Últimos 30 dias", id: "2" },
  ]);

  const tribunals = ["TJ-SP", "TJ-RJ", "TJ-MG", "TJ-BA", "STJ", "STF"];
  const tiposAto = ["Sentença", "Despacho", "Acórdão", "Decisão Monocrática", "Parecer"];
  const periodPresets = [
    { label: "Últimos 7 dias", days: 7 },
    { label: "Últimos 30 dias", days: 30 },
    { label: "Últimos 90 dias", days: 90 },
  ];

  const handleApplyFilters = () => {
    // Aqui seria feita a busca com os filtros aplicados
    console.log("Filtros aplicados:", filters);
  };

  const handleClearFilters = () => {
    setFilters({
      tribunal: "",
      startDate: "",
      endDate: "",
      tipoAto: "",
      palavraChave: "",
      partes: "",
      advogado: "",
    });
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

  const FilterSelect = ({
    label,
    options,
    value,
    onSelect,
  }: {
    label: string;
    options: string[];
    value: string;
    onSelect: (value: string) => void;
  }) => (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-foreground mb-2">{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => onSelect(option)}
              style={{
                backgroundColor: value === option ? colors.primary : colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
              }}
              className="px-4 py-2 rounded-full"
            >
              <Text
                style={{
                  color: value === option ? "#FFFFFF" : colors.foreground,
                }}
                className="text-sm font-medium"
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground">Filtros Avançados</Text>
          <Text className="text-sm text-muted mt-1">Personalize sua busca</Text>
        </View>

        {/* Tribunal Filter */}
        <FilterSelect
          label="Tribunal"
          options={tribunals}
          value={filters.tribunal}
          onSelect={(value) => setFilters({ ...filters, tribunal: value })}
        />

        {/* Tipo de Ato Filter */}
        <FilterSelect
          label="Tipo de Ato"
          options={tiposAto}
          value={filters.tipoAto}
          onSelect={(value) => setFilters({ ...filters, tipoAto: value })}
        />

        {/* Period Presets */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-2">Período</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {periodPresets.map((preset) => (
                <TouchableOpacity
                  key={preset.days}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                  }}
                  className="px-4 py-2 rounded-full"
                >
                  <Text className="text-sm font-medium text-foreground">{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Text Filters */}
        <FilterInput
          label="Palavra-chave"
          value={filters.palavraChave}
          onChangeText={(text) => setFilters({ ...filters, palavraChave: text })}
          placeholder="Ex: indenização, dano moral..."
        />

        <FilterInput
          label="Partes"
          value={filters.partes}
          onChangeText={(text) => setFilters({ ...filters, partes: text })}
          placeholder="Nome das partes envolvidas"
        />

        <FilterInput
          label="Advogado"
          value={filters.advogado}
          onChangeText={(text) => setFilters({ ...filters, advogado: text })}
          placeholder="Nome do advogado"
        />

        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <View className="mb-6 pt-4 border-t" style={{ borderColor: colors.border }}>
            <Text className="text-sm font-semibold text-foreground mb-3">Filtros Salvos</Text>
            {savedFilters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                }}
                className="rounded-lg p-3 mb-2 flex-row justify-between items-center"
              >
                <Text className="text-sm text-foreground font-medium">{filter.name}</Text>
                <IconSymbol name="chevron.right" size={16} color={colors.muted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row gap-3 mt-6">
          <TouchableOpacity
            onPress={handleClearFilters}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
            }}
            className="flex-1 rounded-lg py-3 items-center justify-center"
          >
            <Text className="text-foreground font-semibold">Limpar Tudo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleApplyFilters}
            style={{ backgroundColor: colors.primary }}
            className="flex-1 rounded-lg py-3 items-center justify-center"
          >
            <Text className="text-white font-semibold">Aplicar Filtros</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
