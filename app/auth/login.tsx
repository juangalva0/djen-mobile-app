import { ScrollView, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    try {
      setError("");
      await login(email, password);
      router.replace("/(tabs)");
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Logo Section */}
        <View className="items-center justify-center py-12">
          <Text className="text-4xl font-bold text-primary mb-2">Djen</Text>
          <Text className="text-sm text-muted">Consulta ao DJEN</Text>
        </View>

        {/* Login Form */}
        <View className="gap-4">
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
              placeholder="Sua senha"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
              secureTextEntry
            />
          </View>

          {error && <Text className="text-sm text-error">{error}</Text>}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={{
              backgroundColor: colors.primary,
              opacity: isLoading ? 0.6 : 1,
            }}
            className="rounded-lg py-4 items-center justify-center flex-row gap-2"
          >
            {isLoading && <ActivityIndicator color="#FFFFFF" />}
            <Text className="text-white font-semibold">
              {isLoading ? "Entrando..." : "Entrar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("./signup")}
            disabled={isLoading}
          >
            <Text className="text-center text-muted">
              Não tem uma conta?{" "}
              <Text className="text-primary font-semibold">Criar uma</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-1 justify-end items-center py-6">
          <Text className="text-xs text-muted text-center">
            Ao entrar, você concorda com nossos{" "}
            <Text className="text-primary font-semibold">Termos de Uso</Text> e{" "}
            <Text className="text-primary font-semibold">Política de Privacidade</Text>
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
