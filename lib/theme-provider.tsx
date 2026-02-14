import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  Easing 
} from "react-native-reanimated";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  fontSize: "small" | "normal" | "large";
  setFontSize: (size: "small" | "normal" | "large") => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = "djen_theme";
const FONT_SIZE_STORAGE_KEY = "djen_font_size";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(systemScheme);
  const [fontSize, setFontSizeState] = useState<"small" | "normal" | "large">("normal");
  const [isLoading, setIsLoading] = useState(true);
  
  // Animação de opacidade para transição suave
  const opacity = useSharedValue(1);

  // Carregar preferências salvas ao iniciar
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        const savedFontSize = await AsyncStorage.getItem(FONT_SIZE_STORAGE_KEY);

        if (savedTheme) {
          setColorSchemeState(savedTheme as ColorScheme);
        }
        if (savedFontSize) {
          setFontSizeState(savedFontSize as "small" | "normal" | "large");
        }
      } catch (error) {
        console.error("Erro ao carregar preferências de tema:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const applyScheme = useCallback((scheme: ColorScheme) => {
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(scheme);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      const palette = SchemeColors[scheme];
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
    }
  }, []);

  const setColorScheme = useCallback(
    async (scheme: ColorScheme) => {
      // Animar transição: fade out, mudar tema, fade in
      opacity.value = withTiming(0, { 
        duration: 150, 
        easing: Easing.inOut(Easing.ease) 
      }, () => {
        setColorSchemeState(scheme);
        applyScheme(scheme);
        opacity.value = withTiming(1, { 
          duration: 150, 
          easing: Easing.inOut(Easing.ease) 
        });
      });

      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
      } catch (error) {
        console.error("Erro ao salvar tema:", error);
      }
    },
    [applyScheme, opacity]
  );

  const setFontSize = useCallback(async (size: "small" | "normal" | "large") => {
    setFontSizeState(size);
    try {
      await AsyncStorage.setItem(FONT_SIZE_STORAGE_KEY, size);
    } catch (error) {
      console.error("Erro ao salvar tamanho de fonte:", error);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      applyScheme(colorScheme);
    }
  }, [applyScheme, colorScheme, isLoading]);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": SchemeColors[colorScheme].primary,
        "color-background": SchemeColors[colorScheme].background,
        "color-surface": SchemeColors[colorScheme].surface,
        "color-foreground": SchemeColors[colorScheme].foreground,
        "color-muted": SchemeColors[colorScheme].muted,
        "color-border": SchemeColors[colorScheme].border,
        "color-success": SchemeColors[colorScheme].success,
        "color-warning": SchemeColors[colorScheme].warning,
        "color-error": SchemeColors[colorScheme].error,
      }),
    [colorScheme]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const value = useMemo(
    () => ({
      colorScheme,
      setColorScheme,
      fontSize,
      setFontSize,
    }),
    [colorScheme, setColorScheme, fontSize, setFontSize]
  );

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: SchemeColors[colorScheme].background }} />;
  }

  return (
    <ThemeContext.Provider value={value}>
      <Animated.View style={[{ flex: 1 }, themeVariables, animatedStyle]}>
        {children}
      </Animated.View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
