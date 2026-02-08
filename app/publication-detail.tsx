import { ScrollView, Text, View, TouchableOpacity, Share, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { djenApi, type DJENPublication } from "@/lib/djen-api";
import { processStorage } from "@/lib/storage";

export default function PublicationDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [publication, setPublication] = useState<DJENPublication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadPublication();
  }, [id]);

  const loadPublication = async () => {
    if (!id || typeof id !== "string") return;

    setIsLoading(true);
    try {
      const pub = await djenApi.getPublicationDetails(id);
      setPublication(pub);

      // Verificar se está favoritado
      const processes = await processStorage.getAll();
      const isFav = processes.some((p) => p.number === pub?.number && p.isFavorite);
      setIsFavorite(isFav);
    } catch (error) {
      console.error("Erro ao carregar publicação:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!publication) return;

    try {
      const processes = await processStorage.getAll();
      let process = processes.find((p) => p.number === publication.number);

      if (!process) {
        process = {
          id: `proc_${Date.now()}`,
          number: publication.number,
          parts: publication.parties.join(" vs. "),
          court: publication.court,
          lastUpdate: publication.date,
          isFavorite: !isFavorite,
          notificationsEnabled: true,
        };
      } else {
        process.isFavorite = !isFavorite;
      }

      await processStorage.save(process);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Erro ao favoritar:", error);
    }
  };

  const handleShare = async () => {
    if (!publication) return;

    try {
      await Share.share({
        message: `${publication.number}\n${publication.summary}\n\nVia Djen - Consulta ao DJEN`,
        title: `Publicação ${publication.number}`,
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  const HighlightedText = ({ text }: { text: string }) => {
    // Padrões para destaque
    const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/gi;
    const deadlineRegex = /(prazo\s+de\s+\d+\s+dias?|até\s+\d{1,2}\/\d{1,2}\/\d{4})/gi;
    const legalTermsRegex =
      /(intime-se|intimação|sentença|despacho|acórdão|recurso|apelação|agravo|moção|petição|parecer)/gi;

    let parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Destaque de datas
    const dateMatches = Array.from(text.matchAll(dateRegex));
    dateMatches.forEach((match) => {
      const start = match.index || 0;
      if (start > lastIndex) {
        parts.push(text.substring(lastIndex, start));
      }
      parts.push(
        <Text key={`date-${start}`} className="bg-yellow-200 font-semibold">
          {match[0]}
        </Text>
      );
      lastIndex = start + match[0].length;
    });

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return <Text className="text-base leading-relaxed text-foreground">{parts}</Text>;
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Carregando publicação...</Text>
      </ScreenContainer>
    );
  }

  if (!publication) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground font-semibold mb-4">Publicação não encontrada</Text>
        <TouchableOpacity
          style={{ backgroundColor: colors.primary }}
          className="px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Voltar</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={{ backgroundColor: colors.primary }}
          className="px-4 py-6 pb-8 flex-row items-start justify-between"
        >
          <View className="flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-white text-sm font-semibold mb-2">{publication.court}</Text>
            <Text className="text-white text-lg font-bold">{publication.number}</Text>
          </View>
          <View
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            className="px-3 py-1 rounded-full"
          >
            <Text className="text-white text-xs font-semibold">{publication.type}</Text>
          </View>
        </View>

        {/* Content */}
        <View className="px-4 py-6">
          {/* Parties */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-muted uppercase mb-2">Partes</Text>
            {publication.parties.map((party, index) => (
              <Text key={index} className="text-base text-foreground mb-1">
                • {party}
              </Text>
            ))}
          </View>

          {/* Date */}
          <View className="mb-6 pb-6" style={{ borderBottomColor: colors.border, borderBottomWidth: 1 }}>
            <Text className="text-sm font-semibold text-muted uppercase mb-2">Data da Publicação</Text>
            <Text className="text-base font-semibold text-warning">{publication.date}</Text>
          </View>

          {/* Summary */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-muted uppercase mb-3">Resumo</Text>
            <Text className="text-base leading-relaxed text-foreground">{publication.summary}</Text>
          </View>

          {/* Full Text with Highlights */}
          <View className="mb-6 pb-6" style={{ borderBottomColor: colors.border, borderBottomWidth: 1 }}>
            <Text className="text-sm font-semibold text-muted uppercase mb-3">Texto Completo</Text>
            <HighlightedText text={publication.fullText} />
          </View>

          {/* Judges */}
          {publication.judges.length > 0 && (
            <View className="mb-6">
              <Text className="text-sm font-semibold text-muted uppercase mb-2">Magistrados</Text>
              {publication.judges.map((judge, index) => (
                <Text key={index} className="text-sm text-foreground mb-1">
                  {judge}
                </Text>
              ))}
            </View>
          )}

          {/* Lawyers */}
          {publication.lawyers.length > 0 && (
            <View className="mb-6">
              <Text className="text-sm font-semibold text-muted uppercase mb-2">Advogados</Text>
              {publication.lawyers.map((lawyer, index) => (
                <Text key={index} className="text-sm text-foreground mb-1">
                  {lawyer}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="px-4 py-4 gap-3 flex-row">
          <TouchableOpacity
            onPress={handleFavorite}
            style={{
              backgroundColor: isFavorite ? colors.primary : colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              flex: 1,
            }}
            className="rounded-lg py-3 flex-row items-center justify-center gap-2"
          >
            <IconSymbol
              name="bookmark.fill"
              size={18}
              color={isFavorite ? "#FFFFFF" : colors.primary}
            />
            <Text
              style={{
                color: isFavorite ? "#FFFFFF" : colors.primary,
              }}
              className="font-semibold text-sm"
            >
              {isFavorite ? "Favoritado" : "Favoritar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              flex: 1,
            }}
            className="rounded-lg py-3 flex-row items-center justify-center gap-2"
          >
            <IconSymbol name="paperplane.fill" size={18} color={colors.primary} />
            <Text style={{ color: colors.primary }} className="font-semibold text-sm">
              Compartilhar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
