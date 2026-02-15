import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useCallback, memo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";

// Memoizar o componente InputField
const InputField = memo(({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  editable = true,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  editable?: boolean;
  colors: any;
}) => (
  <View className="mb-4">
    <Text className="text-sm font-semibold text-foreground mb-2">{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      editable={editable}
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
));

InputField.displayName = "InputField";

export default function EditProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profession, setProfession] = useState(user?.profession || "");
  const [oabNumber, setOabNumber] = useState(user?.oabNumber || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = useCallback((text: string) => {
    setName(text);
  }, []);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
  }, []);

  const handlePhoneChange = useCallback((text: string) => {
    setPhone(text);
  }, []);

  const handleProfessionChange = useCallback((text: string) => {
    setProfession(text);
  }, []);

  const handleOabNumberChange = useCallback((text: string) => {
    setOabNumber(text);
  }, []);

  const handleSave = useCallback(async () => {
    // Validar campos
    if (!name.trim()) {
      Alert.alert("Erro", "Nome é obrigatório");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Erro", "Email inválido");
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        profession: profession.trim(),
        oabNumber: oabNumber.trim(),
      });

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      router.back();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o perfil. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [name, email, phone, profession, oabNumber, updateProfile, router]);

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-foreground">Editar Perfil</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Profile Avatar */}
        <View className="items-center mb-6">
          <View
            style={{ backgroundColor: colors.primary }}
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
          >
            <IconSymbol name="person.fill" size={40} color="#FFFFFF" />
          </View>
          <Text className="text-sm text-muted">Foto de perfil</Text>
        </View>

        {/* Form Fields */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Informações Pessoais</Text>

          <InputField
            label="Nome Completo"
            value={name}
            onChangeText={handleNameChange}
            placeholder="Digite seu nome"
            colors={colors}
          />

          <InputField
            label="Email"
            value={email}
            onChangeText={handleEmailChange}
            placeholder="Digite seu email"
            keyboardType="email-address"
            colors={colors}
          />

          <InputField
            label="Telefone"
            value={phone}
            onChangeText={handlePhoneChange}
            placeholder="Digite seu telefone"
            keyboardType="phone-pad"
            colors={colors}
          />
        </View>

        {/* Professional Info */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Informações Profissionais</Text>

          <InputField
            label="Profissão"
            value={profession}
            onChangeText={handleProfessionChange}
            placeholder="Ex: Advogado, Juiz, etc"
            colors={colors}
          />

          <InputField
            label="Número da OAB"
            value={oabNumber}
            onChangeText={handleOabNumberChange}
            placeholder="Digite seu número da OAB"
            colors={colors}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          style={{
            backgroundColor: colors.primary,
            opacity: isLoading ? 0.6 : 1,
          }}
          className="rounded-lg py-4 items-center justify-center mb-4"
        >
          <Text className="text-white font-semibold">
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={isLoading}
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
