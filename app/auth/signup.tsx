import { ScrollView, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function SignupScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signup, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      setError("");
      await signup(email, password, name, whatsappNumber || undefined);
      router.replace("/(tabs)");
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.");
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center justify-center py-8">
          <Text className="text-3xl font-bold text-primary mb-2">Criar Conta</Text>
          <Text className="text-sm text-muted">Junte-se ao Djen</Text>
        </View>

        {/* Signup Form */}
        <View className="gap-4">
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Nome Completo</Text>
            <TextInput
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.foreground,
              }}
              className="border rounded-lg px-4 py-3 text-base"
              placeholder="Seu nome"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
              editable={!isLoading}
            />
          </View>

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Email</Text>
            <TextInput
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.foreground,
              }}
              className="border rounded-lg px-4 py-3 text-base"
              placeholder="seu@email.com"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Senha</Text>
            <TextInput
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.foreground,
              }}
              className="border rounded-lg px-4 py-3 text-base"
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
              secureTextEntry
            />
          </View>

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Confirmar Senha</Text>
            <TextInput
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.foreground,
              }}
              className="border rounded-lg px-4 py-3 text-base"
              placeholder="Confirme sua senha"
              placeholderTextColor={colors.muted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!isLoading}
              secureTextEntry
            />
          </View>

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">WhatsApp (Opcional)</Text>
            <Text className="text-xs text-muted mb-2">Numero com codigo do pais (ex: +55 11 98765-4321)</Text>
            <TextInput
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.foreground,
              }}
              className="border rounded-lg px-4 py-3 text-base"
              placeholder="+55 11 98765-4321"
              placeholderTextColor={colors.muted}
              value={whatsappNumber}
              onChangeText={setWhatsappNumber}
              editable={!isLoading}
              keyboardType="phone-pad"
            />
          </View>

          {error && <Text className="text-sm text-error">{error}</Text>}

          <TouchableOpacity
            onPress={handleSignup}
            disabled={isLoading}
            style={{
              backgroundColor: colors.primary,
              opacity: isLoading ? 0.6 : 1,
            }}
            className="rounded-lg py-4 items-center justify-center flex-row gap-2"
          >
            {isLoading && <ActivityIndicator color="#FFFFFF" />}
            <Text className="text-white font-semibold">
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
            <Text className="text-center text-muted">
              Já tem uma conta?{" "}
              <Text className="text-primary font-semibold">Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-1 justify-end items-center py-6">
          <Text className="text-xs text-muted text-center">
            Ao criar uma conta, você concorda com nossos{" "}
            <Text className="text-primary font-semibold">Termos de Uso</Text>
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
