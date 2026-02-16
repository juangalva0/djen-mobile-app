import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState, useEffect, useCallback, memo } from "react";

const WhatsAppInput = memo(({
  label,
  value,
  onChangeText,
  placeholder,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  colors: any;
}) => (
  <View className="mb-4">
    <Text className="text-sm font-semibold text-foreground mb-2">{label}</Text>
    <TextInput
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 8,
        color: colors.foreground,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
      }}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      value={value}
      onChangeText={onChangeText}
      keyboardType="phone-pad"
    />
  </View>
));

WhatsAppInput.displayName = "WhatsAppInput";

export default function WhatsAppSettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, updateProfile, isLoading } = useAuth();

  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || "");
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.whatsappNotificationsEnabled ?? false);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateWhatsApp = useCallback(async () => {
    if (whatsappNumber && !whatsappNumber.startsWith("+")) {
      Alert.alert("Erro", "O número deve começar com +");
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        whatsappNumber: whatsappNumber || undefined,
        whatsappNotificationsEnabled: notificationsEnabled && !!whatsappNumber,
      });
      Alert.alert("Sucesso", "Configurações de WhatsApp atualizadas!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar as configurações.");
    } finally {
      setIsSaving(false);
    }
  }, [whatsappNumber, notificationsEnabled, updateProfile]);

  const handleRemoveWhatsApp = useCallback(() => {
    Alert.alert(
      "Remover WhatsApp",
      "Tem certeza que deseja remover seu número de WhatsApp?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            setIsSaving(true);
            try {
              await updateProfile({
                whatsappNumber: undefined,
                whatsappNotificationsEnabled: false,
              });
              setWhatsappNumber("");
              setNotificationsEnabled(false);
              Alert.alert("Sucesso", "Número de WhatsApp removido!");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível remover o número.");
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  }, [updateProfile]);

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header com botão de voltar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: colors.surface,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "700", flex: 1 }}>
            WhatsApp
          </Text>
        </View>

        {/* Info Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <IconSymbol name="message.fill" size={24} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginBottom: 4 }}>
                Receba notificações por WhatsApp
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
                Quando seus filtros salvos encontrarem novos resultados no DJEN, você receberá uma mensagem no WhatsApp.
              </Text>
            </View>
          </View>
        </View>

        {/* WhatsApp Number Input */}
        <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: 12 }}>
          NUMERO DE WHATSAPP
        </Text>

        <WhatsAppInput
          label="Numero com codigo do pais"
          value={whatsappNumber}
          onChangeText={setWhatsappNumber}
          placeholder="+55 11 98765-4321"
          colors={colors}
        />

        {/* Enable/Disable Toggle */}
        {whatsappNumber && (
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
              marginBottom: 24,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginBottom: 4 }}>
                Notificacoes ativadas
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>
                Receber alertas quando filtros retornarem resultados
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setNotificationsEnabled(!notificationsEnabled)}
              style={{
                width: 50,
                height: 28,
                borderRadius: 14,
                backgroundColor: notificationsEnabled ? colors.primary : colors.border,
                justifyContent: "center",
                paddingHorizontal: 2,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: "#FFFFFF",
                  marginLeft: notificationsEnabled ? 24 : 2,
                }}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={handleUpdateWhatsApp}
            disabled={isSaving}
            style={{
              backgroundColor: colors.primary,
              opacity: isSaving ? 0.6 : 1,
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {isSaving && <ActivityIndicator color="#FFFFFF" />}
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
              {isSaving ? "Salvando..." : "Salvar Configuracoes"}
            </Text>
          </TouchableOpacity>

          {whatsappNumber && (
            <TouchableOpacity
              onPress={handleRemoveWhatsApp}
              disabled={isSaving}
              style={{
                backgroundColor: colors.error,
                opacity: isSaving ? 0.6 : 1,
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
                Remover Numero
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Info Text */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
            - Seu numero de WhatsApp e armazenado com seguranca{"\n"}
            - Voce pode desativar notificacoes a qualquer momento{"\n"}
            - Notificacoes sao enviadas apenas quando seus filtros encontram resultados{"\n"}
            - Voce pode alterar ou remover seu numero quando desejar
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
