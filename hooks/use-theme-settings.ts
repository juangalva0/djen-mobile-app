import { useThemeContext } from "@/lib/theme-provider";

/**
 * Hook para acessar e modificar as configurações de tema e fonte
 */
export function useThemeSettings() {
  const { colorScheme, setColorScheme, fontSize, setFontSize } = useThemeContext();

  return {
    theme: colorScheme,
    setTheme: setColorScheme,
    fontSize,
    setFontSize,
  };
}
