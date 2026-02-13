import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useThemeSettings } from "@/hooks/use-theme-settings";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { userPreferencesService } from "@/lib/user-preferences";

export default function AppearanceSettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { theme: currentTheme, setTheme: setGlobalTheme, fontSize: currentFontSize, setFontSize: setGlobalFontSize } = useThemeSettings();

  const [theme, setTheme] = useState<"light" | "dark" | "auto">(currentTheme as "light" | "dark" | "auto");
  const [fontSize, setFontSize] = useState<"small" | "normal" | "large">(currentFontSize);

  useEffect(() => {
    setTheme(currentTheme as "light" | "dark" | "auto");
    setFontSize(currentFontSize);
  }, [currentTheme, currentFontSize]);



  const savePreferences = async () => {
    try {
      await userPreferencesService.updatePreferences({
        theme,
        fontSize,
      });
      // Aplicar tema globalmente
      await setGlobalTheme(theme as any);
      await setGlobalFontSize(fontSize);
      Alert.alert("Sucesso", "Configurações de aparência salvas!");
      router.back();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as configurações.");
    }
  };

  const ThemeOption = ({
    label,
    value,
    icon,
    description,
  }: {
    label: string;
    value: "light" | "dark" | "auto";
    icon: string;
    description: string;
  }) => (
    <TouchableOpacity
      onPress={() => setTheme(value)}
      style={{
        backgroundColor: theme === value ? colors.primary : colors.surface,
        borderColor: theme === value ? colors.primary : colors.border,
        borderWidth: 2,
      }}
      className="rounded-lg p-4 mb-3"
    >
      <View className="flex-row items-center gap-3 mb-2">
        <IconSymbol
          name={icon as any}
          size={24}
          color={theme === value ? "#FFFFFF" : colors.foreground}
        />
        <Text
          className="text-base font-semibold"
          style={{ color: theme === value ? "#FFFFFF" : colors.foreground }}
        >
          {label}
        </Text>
      </View>
      <Text
        className="text-sm"
        style={{ color: theme === value ? "rgba(255,255,255,0.8)" : colors.muted }}
      >
        {description}
      </Text>
    </TouchableOpacity>
  );

  const FontSizeOption = ({
    label,
    value,
    sizeClass,
  }: {
    label: string;
    value: "small" | "normal" | "large";
    sizeClass: string;
  }) => (
    <TouchableOpacity
      onPress={() => setFontSize(value)}
      style={{
        backgroundColor: fontSize === value ? colors.primary : colors.surface,
        borderColor: fontSize === value ? colors.primary : colors.border,
        borderWidth: 2,
      }}
      className="rounded-lg p-4 mb-3 items-center justify-center"
    >
      <Text
        className={sizeClass}
        style={{ color: fontSize === value ? "#FFFFFF" : colors.foreground }}
      >
        {label}
      </Text>
      <Text
        className="text-xs mt-2"
        style={{ color: fontSize === value ? "rgba(255,255,255,0.8)" : colors.muted }}
      >
        Exemplo de texto
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-foreground">Aparência</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Theme Selection */}
        <View className="mb-8">
          <Text className="text-sm font-semibold text-muted uppercase mb-4">Tema</Text>
          <ThemeOption
            label="Claro"
            value="light"
            icon="sun.max.fill"
            description="Interface clara com fundo branco"
          />
          <ThemeOption
            label="Escuro"
            value="dark"
            icon="moon.stars.fill"
            description="Interface escura para melhor conforto visual"
          />
          <ThemeOption
            label="Automático"
            value="auto"
            icon="slider.horizontal.3"
            description="Segue as configurações do sistema"
          />
        </View>

        {/* Font Size Selection */}
        <View className="mb-8">
          <Text className="text-sm font-semibold text-muted uppercase mb-4">Tamanho de Fonte</Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <FontSizeOption label="Pequeno" value="small" sizeClass="text-sm" />
            </View>
            <View className="flex-1">
              <FontSizeOption label="Normal" value="normal" sizeClass="text-base" />
            </View>
            <View className="flex-1">
              <FontSizeOption label="Grande" value="large" sizeClass="text-lg" />
            </View>
          </View>
        </View>

        {/* Preview Section */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          className="rounded-lg p-4 mb-6"
        >
          <Text className="text-sm font-semibold text-foreground mb-3">Visualização</Text>
          <Text
            className={`${fontSize === "small" ? "text-sm" : fontSize === "large" ? "text-lg" : "text-base"} text-foreground leading-relaxed`}
          >
            Este é um exemplo de como o texto aparecerá no aplicativo com as configurações selecionadas.
          </Text>
        </View>

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
