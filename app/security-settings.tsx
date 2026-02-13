import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { useRouter } from "expo-router";
import { userPreferencesService } from "@/lib/user-preferences";

export default function SecuritySettingsScreen() {
  const colors = useColors();
  const router = useRouter();

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert("Erro", "Digite sua senha atual");
      return;
    }

    if (!newPassword.trim() || newPassword.length < 8) {
      Alert.alert("Erro", "Nova senha deve ter pelo menos 8 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }

    setIsLoading(true);
    try {
      // Simular chamada à API para alterar senha
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert("Sucesso", "Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível alterar a senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    try {
      await userPreferencesService.setBiometricEnabled(enabled);
      setBiometricEnabled(enabled);
      Alert.alert(
        "Sucesso",
        enabled
          ? "Autenticação biométrica ativada"
          : "Autenticação biométrica desativada"
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar a configuração");
    }
  };

  const PasswordInput = ({
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
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry
        placeholderTextColor={colors.muted}
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          color: colors.foreground,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 8,
          fontSize: 14,
        }}
      />
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-foreground">Segurança</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Biometric Authentication */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted uppercase mb-3">Autenticação</Text>
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
            }}
            className="rounded-lg p-4"
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">Autenticação Biométrica</Text>
                <Text className="text-xs text-muted mt-1">Face ID ou Touch ID para login rápido</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleBiometricToggle(!biometricEnabled)}
                style={{
                  backgroundColor: biometricEnabled ? colors.primary : colors.border,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                }}
              >
                <Text className="text-xs font-semibold" style={{ color: biometricEnabled ? "#FFFFFF" : colors.muted }}>
                  {biometricEnabled ? "Ativado" : "Desativado"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Change Password */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted uppercase mb-3">Senha</Text>
          {!showChangePassword ? (
            <TouchableOpacity
              onPress={() => setShowChangePassword(true)}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
              }}
              className="rounded-lg p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="slider.horizontal.3" size={20} color={colors.foreground} />
                <View>
                  <Text className="text-base font-semibold text-foreground">Alterar Senha</Text>
                  <Text className="text-xs text-muted mt-1">Última alteração há 90 dias</Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>
          ) : (
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
              }}
              className="rounded-lg p-4"
            >
              <PasswordInput
                label="Senha Atual"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Digite sua senha atual"
              />
              <PasswordInput
                label="Nova Senha"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Mínimo 8 caracteres"
              />
              <PasswordInput
                label="Confirmar Senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirme a nova senha"
              />

              {/* Password Requirements */}
              <View className="bg-yellow-50 rounded-lg p-3 mb-4" style={{ backgroundColor: `${colors.warning}20` }}>
                <Text className="text-xs font-semibold text-foreground mb-2">Requisitos de Senha:</Text>
                <Text className="text-xs text-muted">• Mínimo 8 caracteres</Text>
                <Text className="text-xs text-muted">• Pelo menos uma letra maiúscula</Text>
                <Text className="text-xs text-muted">• Pelo menos um número</Text>
                <Text className="text-xs text-muted">• Pelo menos um caractere especial (!@#$%)</Text>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowChangePassword(false)}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                  }}
                  className="flex-1 rounded-lg py-3 items-center justify-center"
                >
                  <Text className="text-foreground font-semibold">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleChangePassword}
                  disabled={isLoading}
                  style={{
                    backgroundColor: colors.primary,
                    opacity: isLoading ? 0.6 : 1,
                  }}
                  className="flex-1 rounded-lg py-3 items-center justify-center"
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-semibold">Atualizar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Security Info */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          className="rounded-lg p-4"
        >
          <View className="flex-row gap-3 mb-3">
            <IconSymbol name="slider.horizontal.3" size={20} color={colors.primary} />
            <Text className="text-sm font-semibold text-foreground flex-1">Dicas de Segurança</Text>
          </View>
          <Text className="text-xs text-muted leading-relaxed">
            • Use uma senha forte e única{"\n"}
            • Não compartilhe sua senha com ninguém{"\n"}
            • Altere sua senha regularmente{"\n"}
            • Ative a autenticação biométrica para maior segurança
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
