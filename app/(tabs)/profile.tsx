import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, logout, upgradeToPremium } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleLogout = () => {
    Alert.alert("Sair da Conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await upgradeToPremium();
      Alert.alert("Sucesso", "Você foi atualizado para o plano Premium!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível fazer o upgrade. Tente novamente.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const MenuSection = ({
    title,
    items,
  }: {
    title: string;
    items: { label: string; icon: string; onPress?: () => void; rightElement?: React.ReactNode }[];
  }) => (
    <View className="mb-6">
      <Text className="text-sm font-semibold text-muted uppercase mb-3">{title}</Text>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={item.onPress}
          style={{
            backgroundColor: colors.surface,
            borderBottomColor: index < items.length - 1 ? colors.border : "transparent",
            borderBottomWidth: index < items.length - 1 ? 1 : 0,
          }}
          className={`flex-row items-center justify-between px-4 py-4 ${index === 0 ? "rounded-t-lg" : ""} ${
            index === items.length - 1 ? "rounded-b-lg" : ""
          }`}
        >
          <View className="flex-row items-center gap-3 flex-1">
            <IconSymbol name={item.icon as any} size={20} color={colors.foreground} />
            <Text className="text-base text-foreground font-medium">{item.label}</Text>
          </View>
          {item.rightElement || <IconSymbol name="chevron.right" size={16} color={colors.muted} />}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          className="rounded-lg p-4 mb-6 items-center"
        >
          <View
            style={{ backgroundColor: colors.primary }}
            className="w-16 h-16 rounded-full items-center justify-center mb-3"
          >
            <IconSymbol name="person.fill" size={32} color="#FFFFFF" />
          </View>
          <Text className="text-lg font-semibold text-foreground">{user?.name || "Usuário"}</Text>
          <Text className="text-sm text-muted mt-1">{user?.email || "email@example.com"}</Text>

          <View className="flex-row gap-2 mt-4">
            <View
              style={{
                backgroundColor: user?.plan === "premium" ? colors.warning : colors.primary,
              }}
              className="px-4 py-2 rounded-full"
            >
              <Text className="text-white text-xs font-semibold">
                Plano {user?.plan === "premium" ? "Premium" : "Gratuito"}
              </Text>
            </View>
          </View>
        </View>

        {/* Upgrade Card */}
        {user?.plan !== "premium" && (
          <TouchableOpacity
            onPress={handleUpgrade}
            disabled={isUpgrading}
            style={{
              backgroundColor: colors.primary,
              opacity: isUpgrading ? 0.6 : 1,
            }}
            className="rounded-lg p-4 mb-6 flex-row items-center justify-between"
          >
            <View>
              <Text className="text-white font-semibold">Upgrade para Premium</Text>
              <Text className="text-white text-xs mt-1 opacity-90">Acesso ilimitado a filtros avançados</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Notifications Settings */}
        <MenuSection
          title="Notificacoes"
          items={[
            {
              label: "Filtros Salvos",
              icon: "slider.horizontal.3",
              onPress: () => router.push("/saved-filters"),
            },
            {
              label: "Configurar Notificacoes",
              icon: "bell.fill",
              onPress: () => router.push("/notification-settings"),
            },
            {
              label: "WhatsApp",
              icon: "message.fill",
              onPress: () => router.push("/whatsapp-settings"),
            },
          ]}
        />

        {/* Display Settings */}
        <MenuSection
          title="Aparência"
          items={[
            {
              label: "Tema e Fonte",
              icon: "slider.horizontal.3",
              onPress: () => router.push("/appearance-settings"),
            },
          ]}
        />

        {/* Account Settings */}
        <MenuSection
          title="Conta"
          items={[
            {
              label: "Editar Perfil",
              icon: "person.fill",
              onPress: () => router.push("/edit-profile"),
            },
            {
              label: "Segurança",
              icon: "slider.horizontal.3",
              onPress: () => router.push("/security-settings"),
            },
          ]}
        />

        {/* Legal & Support */}
        <MenuSection
          title="Suporte"
          items={[
            {
              label: "Privacidade",
              icon: "slider.horizontal.3",
              onPress: () => router.push({ pathname: "/legal-info", params: { type: "privacy" } }),
            },
            {
              label: "Termos de Uso",
              icon: "slider.horizontal.3",
              onPress: () => router.push({ pathname: "/legal-info", params: { type: "terms" } }),
            },
            {
              label: "Sobre o App",
              icon: "slider.horizontal.3",
              onPress: () => router.push({ pathname: "/legal-info", params: { type: "about" } }),
            },
          ]}
        />

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: colors.error,
          }}
          className="rounded-lg py-4 items-center justify-center mb-6"
        >
          <Text className="text-white font-semibold">Sair da Conta</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <View className="items-center mb-4">
          <Text className="text-xs text-muted">Versão 1.0.0</Text>
          <Text className="text-xs text-muted mt-1">© 2024 Djen. Todos os direitos reservados.</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
