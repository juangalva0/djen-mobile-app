import { View, Text, TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "./ui/icon-symbol";

interface PublicationCardProps {
  number: string;
  court: string;
  date: string;
  type: string;
  summary: string;
  onPress?: () => void;
}

export function PublicationCard({
  number,
  court,
  date,
  type,
  summary,
  onPress,
}: PublicationCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
      }}
      className="rounded-lg p-4 mb-3"
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-primary">{number}</Text>
          <View className="flex-row gap-2 mt-1">
            <Text className="text-xs text-muted">{court}</Text>
            <Text className="text-xs text-muted">•</Text>
            <Text className="text-xs text-muted">{date}</Text>
          </View>
        </View>
        <View
          style={{ backgroundColor: colors.primary }}
          className="px-3 py-1 rounded-full"
        >
          <Text className="text-white text-xs font-semibold">{type}</Text>
        </View>
      </View>

      {/* Summary with highlights */}
      <Text
        numberOfLines={3}
        className="text-sm text-foreground leading-relaxed mb-3"
      >
        {summary}
      </Text>

      {/* Footer with action buttons */}
      <View className="flex-row gap-2 pt-3 border-t" style={{ borderColor: colors.border }}>
        <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-1 py-2">
          <IconSymbol name="bookmark.fill" size={16} color={colors.primary} />
          <Text className="text-xs text-primary font-medium">Favoritar</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-1 py-2">
          <IconSymbol name="paperplane.fill" size={16} color={colors.primary} />
          <Text className="text-xs text-primary font-medium">Compartilhar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
