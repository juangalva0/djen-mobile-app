import { Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface HighlightedTextProps {
  text: string;
  className?: string;
}

/**
 * Componente que destaca automaticamente informações jurídicas relevantes no texto.
 * - Datas em amarelo
 * - Prazos em vermelho
 * - Partes em azul
 * - Expressões jurídicas em negrito
 */
export function HighlightedText({ text, className = "" }: HighlightedTextProps) {
  const colors = useColors();

  // Padrões para detecção
  const patterns = [
    // Datas (DD/MM/YYYY ou DD de mês de YYYY)
    {
      regex: /(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/gi,
      color: colors.warning,
      style: "font-semibold",
    },
    // Prazos (prazo de X dias)
    {
      regex: /(prazo\s+de\s+\d+\s+dias?|até\s+\d{1,2}\/\d{1,2}\/\d{4})/gi,
      color: colors.error,
      style: "font-semibold",
    },
    // Expressões jurídicas comuns
    {
      regex: /(intime-se|intimação|sentença|despacho|acórdão|recurso|apelação|agravo|moção|petição|parecer)/gi,
      color: colors.primary,
      style: "font-bold",
    },
  ];

  // Função para dividir o texto e aplicar destaques
  const renderHighlightedText = () => {
    let parts: any[] = [{ text, color: colors.foreground, style: "" }];

    patterns.forEach((pattern) => {
      const newParts: any[] = [];

      parts.forEach((part) => {
        if (typeof part.text !== "string") {
          newParts.push(part);
          return;
        }

        const matches = Array.from(part.text.matchAll(pattern.regex));

        if (matches.length === 0) {
          newParts.push(part);
          return;
        }

        let lastIndex = 0;

        (matches as RegExpExecArray[]).forEach((match) => {
          const startIndex = match.index || 0;
          const endIndex = startIndex + match[0].length;

          // Texto antes do match
          if (startIndex > lastIndex) {
            newParts.push({
              text: part.text.substring(lastIndex, startIndex),
              color: part.color,
              style: part.style,
            });
          }

          // Texto do match
          newParts.push({
            text: match[0],
            color: pattern.color,
            style: pattern.style,
          });

          lastIndex = endIndex;
        });

        // Texto restante
        if (lastIndex < part.text.length) {
          newParts.push({
            text: part.text.substring(lastIndex),
            color: part.color,
            style: part.style,
          });
        }
      });

      parts = newParts;
    });

    return parts.map((part, index) => (
      <Text
        key={index}
        style={{ color: part.color }}
        className={`${part.style} ${className}`}
      >
        {part.text}
      </Text>
    ));
  };

  return <Text className={className}>{renderHighlightedText()}</Text>;
}
