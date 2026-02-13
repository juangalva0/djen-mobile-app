import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";

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

  const handleSave = async () => {
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
  };

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    editable = true,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
    editable?: boolean;
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
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-foreground">Editar Perfil</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.foreground} />
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
          <TouchableOpacity
            style={{ borderColor: colors.primary, borderWidth: 1 }}
            className="px-4 py-2 rounded-full"
          >
            <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
              Alterar Foto
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="mb-6">
          <InputField label="Nome Completo" value={name} onChangeText={setName} placeholder="João Silva" />

          <InputField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="joao@example.com"
            keyboardType="email-address"
          />

          <InputField
            label="Telefone"
            value={phone}
            onChangeText={setPhone}
            placeholder="(11) 99999-9999"
            keyboardType="phone-pad"
          />

          <InputField label="Profissão" value={profession} onChangeText={setProfession} placeholder="Advogado" />

          <InputField label="Número OAB" value={oabNumber} onChangeText={setOabNumber} placeholder="OAB/SP 123456" />
        </View>

        {/* Info Section */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          className="rounded-lg p-4 mb-6"
        >
          <Text className="text-sm font-semibold text-foreground mb-2">Informações Adicionais</Text>
          <Text className="text-xs text-muted leading-relaxed">
            Mantenha seus dados atualizados para receber notificações e comunicações importantes relacionadas aos seus
            processos monitorados.
          </Text>
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
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold">Salvar Alterações</Text>
          )}
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
