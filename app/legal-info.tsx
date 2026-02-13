import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function LegalInfoScreen() {
  const colors = useColors();
  const router = useRouter();
  const { type } = useLocalSearchParams();

  const getContent = () => {
    switch (type) {
      case "privacy":
        return {
          title: "Política de Privacidade",
          content: `Última atualização: Fevereiro de 2024

1. INTRODUÇÃO
A Djen ("nós", "nos" ou "nosso") opera o aplicativo Djen (o "Serviço"). Esta página informa você sobre nossas políticas sobre a coleta, uso e divulgação de dados pessoais quando você usa nosso Serviço e as escolhas que você tem associadas a esses dados.

2. COLETA E USO DE DADOS
Coletamos vários tipos de informações para diversos fins, a fim de fornecer e melhorar nosso Serviço:

2.1 Dados Pessoais
- Nome completo
- Endereço de email
- Número de telefone
- Número de OAB (para advogados)
- Dados de profissão

2.2 Dados de Uso
- Informações sobre como você acessa e usa o Serviço
- Histórico de buscas e processos consultados
- Processos monitorados
- Preferências de notificação

3. SEGURANÇA DOS DADOS
A segurança de seus dados é importante para nós. Implementamos medidas de segurança apropriadas para proteger suas informações pessoais.

4. SEUS DIREITOS
Você tem o direito de acessar, atualizar ou solicitar a exclusão de suas informações pessoais.

5. CONTATO
Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco em privacy@djen.app`,
        };
      case "terms":
        return {
          title: "Termos de Uso",
          content: `Última atualização: Fevereiro de 2024

1. ACEITAÇÃO DOS TERMOS
Ao acessar e usar o aplicativo Djen, você aceita estar vinculado por estes Termos de Uso.

2. USO DO SERVIÇO
Você concorda em usar este Serviço apenas para fins legais e de uma maneira que não infrinja os direitos de terceiros ou restrinja seu uso e prazer.

3. CONTAS DE USUÁRIO
Quando você cria uma conta no Djen, você é responsável por manter a confidencialidade de sua senha e é responsável por todas as atividades que ocorrem em sua conta.

4. PROPRIEDADE INTELECTUAL
O Serviço e seu conteúdo original, recursos e funcionalidade são propriedade do Djen e estão protegidos por leis internacionais de direitos autorais.

5. LIMITAÇÃO DE RESPONSABILIDADE
Em nenhum caso o Djen ou seus fornecedores serão responsáveis por danos de qualquer tipo decorrentes do uso ou incapacidade de usar o Serviço.

6. MODIFICAÇÕES DO SERVIÇO
Nos reservamos o direito de modificar ou descontinuar o Serviço a qualquer momento.

7. LEI APLICÁVEL
Estes Termos e Condições são regidos pelas leis do Brasil.

8. CONTATO
Se você tiver dúvidas sobre estes Termos, entre em contato conosco em legal@djen.app`,
        };
      case "about":
        return {
          title: "Sobre o App",
          content: `Djen - Consulta ao DJEN
Versão 1.0.0

SOBRE O DJEN
O Djen é um aplicativo móvel desenvolvido para facilitar a consulta e monitoramento de publicações judiciais do DJEN (Diário de Justiça Eletrônico Nacional).

FUNCIONALIDADES PRINCIPAIS
- Busca avançada de processos por número, partes, advogado ou palavra-chave
- Monitoramento de processos com notificações em tempo real
- Filtros por tribunal, período e tipo de ato
- Leitura otimizada com destaque automático de datas, prazos e expressões jurídicas
- Sincronização entre dispositivos (Premium)

DESENVOLVIDO POR
Djen Team

TECNOLOGIAS
- React Native
- Expo
- TypeScript
- NativeWind (Tailwind CSS)

VERSÃO ATUAL
1.0.0

CHANGELOG
v1.0.0 - Lançamento inicial
- Busca de publicações
- Monitoramento de processos
- Notificações push
- Autenticação de usuário
- Plano Premium

SUPORTE
Para suporte, visite: support@djen.app

WEBSITE
www.djen.app

© 2024 Djen. Todos os direitos reservados.`,
        };
      default:
        return { title: "Informação", content: "" };
    }
  };

  const { title, content } = getContent();

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-foreground">{title}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          className="rounded-lg p-4 mb-6"
        >
          <Text
            className="text-sm leading-relaxed text-foreground"
            style={{ color: colors.foreground }}
          >
            {content}
          </Text>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          className="rounded-lg py-4 items-center justify-center"
        >
          <Text className="text-foreground font-semibold">Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
