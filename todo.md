# Project TODO - Djen Mobile App

## Branding & Setup
- [x] Gerar logo do aplicativo (ícone quadrado, 512x512px)
- [x] Atualizar app.config.ts com nome e logo
- [x] Configurar cores no theme.config.js
- [x] Atualizar splash screen

## Navegação & Estrutura Base
- [x] Implementar tab bar com 4 abas (Home, Meus Processos, Filtros, Perfil)
- [x] Criar componentes base (ScreenContainer, SearchBar, ProcessCard)
- [x] Configurar stack navigation para detalhes
- [x] Implementar header com logo e ícone de perfil

## Tela Home (Busca Principal)
- [x] Criar barra de busca com placeholder
- [x] Implementar abas de filtro rápido (Todos, Meus Processos, Recentes)
- [x] Criar lista de resultados recentes
- [x] Integrar busca com API DJEN (mock inicialmente)
- [ ] Implementar autocomplete de sugestões
- [x] Adicionar ícone de filtro avançado

## Tela de Detalhes da Publicação
- [ ] Criar layout de detalhes com header
- [ ] Implementar destaque automático de:
  - [ ] Datas (amarelo)
  - [ ] Prazos (vermelho)
  - [ ] Partes (azul)
  - [ ] Expressões jurídicas (negrito)
- [ ] Criar botões de ação (Favoritar, Compartilhar, Copiar)
- [ ] Implementar navegação entre publicações do mesmo processo
- [ ] Adicionar histórico de publicações relacionadas

## Tela Meus Processos (Monitoramento)
- [x] Criar lista de processos favoritados
- [x] Implementar ProcessCard com informações resumidas
- [x] Adicionar funcionalidade de remover processo
- [ ] Implementar ordenação (Data, Relevância, Alfabético)
- [ ] Adicionar busca dentro dos processos monitorados
- [x] Mostrar badge de notificações não lidas

## Tela Filtros Avançados
- [x] Criar seletores para Tribunal, Período, Tipo de Ato
- [x] Implementar campos de texto para Palavra-chave, Partes, Advogado
- [x] Adicionar presets de período (Últimos 7 dias, 30 dias, etc.)
- [x] Implementar botões "Aplicar Filtros" e "Limpar Tudo"
- [ ] Adicionar funcionalidade de salvar filtros personalizados
- [x] Mostrar filtros salvos

## Tela Configurações de Notificações
- [x] Criar toggle global de notificações (na tela de Perfil)
- [ ] Implementar lista de processos com toggle individual
- [ ] Adicionar configuração de horários de silêncio
- [ ] Implementar controles de som e vibração
- [ ] Mostrar histórico de notificações recentes
- [ ] Gerenciar permissões do sistema

## Tela Perfil & Configurações
- [x] Criar formulário de edição de perfil
- [x] Implementar seletor de tema (Light/Dark/Auto)
- [ ] Adicionar controle de tamanho de fonte
- [ ] Implementar seletor de idioma
- [x] Mostrar plano atual (Gratuito/Premium)
- [x] Criar botão de upgrade
- [x] Adicionar links para Privacidade, Termos, Sobre
- [x] Implementar logout

## Funcionalidades de Dados
- [x] Implementar AsyncStorage para dados locais
- [x] Criar sistema de favoritos (persistência)
- [x] Implementar cache de buscas recentes
- [x] Criar estrutura de dados para processos monitorados
- [ ] Implementar sincronização de preferências do usuário

## Integração com API DJEN
- [x] Estudar documentação da API DJEN
- [x] Criar cliente HTTP para requisições (mock)
- [x] Implementar busca por número de processo
- [x] Implementar busca por nome das partes
- [x] Implementar busca por advogado
- [x] Implementar busca por palavra-chave
- [x] Implementar filtros por tribunal
- [x] Implementar filtros por período
- [x] Implementar filtros por tipo de ato
- [ ] Adicionar tratamento de erros e retry

## Notificações Push
- [ ] Configurar expo-notifications
- [ ] Implementar registro de dispositivo para notificações
- [ ] Criar sistema de alertas por processo
- [ ] Implementar alertas por filtro salvo
- [ ] Adicionar configuração de horários de notificação
- [ ] Testar notificações em iOS e Android

## Autenticação & Usuário
- [ ] Implementar autenticação básica (email/senha ou OAuth)
- [ ] Criar tela de login/signup
- [ ] Implementar persistência de sessão
- [ ] Criar fluxo de recuperação de senha
- [ ] Adicionar autenticação biométrica (opcional)

## Testes & QA
- [ ] Testar fluxo de busca end-to-end
- [ ] Testar monitoramento de processos
- [ ] Testar notificações push
- [ ] Testar tema light/dark
- [ ] Testar responsividade em diferentes tamanhos
- [ ] Testar em iOS (Expo Go)
- [ ] Testar em Android (Expo Go)
- [ ] Testar performance de busca
- [ ] Testar offline mode (se aplicável)

## Compliance & Documentação
- [ ] Adicionar disclaimer sobre dados públicos
- [ ] Criar página de Privacidade
- [ ] Criar página de Termos de Uso
- [ ] Documentar uso da API DJEN
- [ ] Adicionar informações sobre não substituição da consulta oficial
- [ ] Criar README do projeto

## Otimização & Polish
- [ ] Otimizar performance de listas (FlatList)
- [ ] Adicionar animações sutis
- [ ] Implementar feedback háptico
- [ ] Otimizar tamanho do bundle
- [ ] Adicionar loading states
- [ ] Implementar error boundaries
- [ ] Melhorar acessibilidade

## Deployment & Release
- [ ] Preparar build para iOS
- [ ] Preparar build para Android
- [ ] Configurar versionamento
- [ ] Criar changelog
- [ ] Preparar assets para App Store/Play Store
- [ ] Submeter para review

## Implementações Solicitadas (Fase 2)

### Integração com API Real do DJEN
- [x] Pesquisar e documentar API DJEN do PJe
- [x] Criar cliente HTTP para requisições à API real
- [x] Implementar busca por número de processo
- [x] Implementar busca por partes/advogado
- [x] Implementar busca por palavra-chave
- [x] Implementar filtros por tribunal
- [x] Adicionar tratamento de erros e retry
- [ ] Testar integração com dados reais
- [x] Manter fallback com dados mock para desenvolvimento

## Implementações Solicitadas (Fase 2 - Anterior)

### Notificações Push
- [x] Configurar expo-notifications com permissões
- [x] Criar serviço de gerenciamento de notificações
- [x] Implementar alertas para novas publicações em processos monitorados
- [x] Adicionar configuração de horários de notificação
- [ ] Testar notificações em iOS e Android

### Tela de Detalhes da Publicação
- [x] Criar stack navigation para detalhes
- [x] Implementar layout de detalhes com header
- [x] Adicionar destaque automático de datas (amarelo)
- [ ] Adicionar destaque automático de prazos (vermelho)
- [ ] Adicionar destaque automático de partes (azul)
- [x] Adicionar destaque automático de expressões jurídicas (negrito)
- [x] Implementar botões de ação (Favoritar, Compartilhar, Copiar)
- [ ] Adicionar histórico de publicações do processo

### Autenticação e Plano Premium
- [x] Criar tela de login/signup
- [x] Implementar autenticação com email/senha
- [x] Criar contexto de usuário autenticado
- [x] Implementar persistência de sessão
- [x] Criar sistema de plano (Gratuito/Premium)
- [ ] Implementar restrições de funcionalidades por plano
- [x] Adicionar fluxo de upgrade para Premium
- [ ] Criar tela de recuperação de senha

## Melhorias na Tela de Perfil (Fase 3)

### Edição de Perfil
- [x] Criar tela de edição de perfil (nome, email, foto)
- [ ] Implementar upload de foto de perfil
- [x] Validar campos de entrada
- [x] Salvar alterações no AsyncStorage e backend

### Gerenciamento de Notificações
- [x] Criar tela detalhada de notificações
- [x] Implementar toggle por tipo de notificação
- [x] Adicionar horários de silêncio (início e fim)
- [x] Configurar som e vibração
- [ ] Histórico de notificações recentes

### Preferências de Tema
- [x] Implementar seletor de tema (Light, Dark, Auto)
- [x] Adicionar controle de tamanho de fonte (pequeno, normal, grande)
- [x] Salvar preferências no AsyncStorage
- [ ] Aplicar tema globalmente

### Segurança e Autenticação
- [x] Criar tela de alteração de senha
- [x] Implementar validação de força de senha
- [x] Adicionar autenticação biométrica (Face ID/Touch ID)
- [ ] Criar tela de recuperação de senha

### Informações Legais
- [x] Criar tela de Política de Privacidade
- [x] Criar tela de Termos de Uso
- [x] Criar tela "Sobre o App" com versão e changelog
- [x] Adicionar links para contato/suporte

### Gerenciamento de Assinatura
- [ ] Mostrar data de renovação do Premium
- [ ] Implementar cancelamento de assinatura
- [ ] Histórico de pagamentos
- [ ] Opção de mudar método de pagamento

### Dados e Sincronização
- [ ] Implementar sincronização de dados com backend
- [ ] Adicionar opção de exportar dados
- [ ] Criar opção de deletar conta
- [ ] Backup automático de dados


## Bugs Reportados
- [x] Tema e fonte não estão funcionando nas configurações de aparência
- [x] Corrigir contraste de letras no modo escuro (letras não visíveis)

## Implementações Solicitadas (Fase 4)

### Animação de Transição de Tema
- [x] Implementar transição suave ao alternar entre modo claro e escuro
- [x] Usar react-native-reanimated para animação
- [x] Adicionar fade-in/fade-out na mudança de cores
- [ ] Testar animação em iOS, Android e Web


## Implementações Solicitadas (Fase 5)

### Migração de API DataJUD para DJEN
- [x] Remover todas as referências à API DataJUD
- [x] Estudar endpoints da API DJEN do PJe
- [x] Atualizar cliente HTTP para usar API DJEN
- [x] Implementar busca com novos endpoints
- [ ] Testar integração com dados reais


## Implementações Solicitadas (Fase 6)

### Melhoria de Filtros Avançados
- [x] Adicionar campos: Teor da comunicação, Instituições, Órgãos, Meios, Nº OAB, UF da OAB
- [x] Implementar salvamento de múltiplos filtros personalizados
- [x] Diferenciar resultados de buscas por cores/badges
- [x] Redesenhar layout da página de filtros conforme exemplo
- [x] Adicionar funcionalidade de carregar filtros salvos
- [x] Implementar exclusão de filtros salvos
- [x] Implementar menus suspensos (dropdowns) para campos de seleção
- [x] Remover seleção horizontal e usar dropdown para Instituições, Órgãos, Meios, UF OAB


## Implementações Solicitadas (Fase 7)

### Mudança de Nome e Logo
- [x] Gerar nova logo para "Meu Djen"
- [x] Atualizar app.config.ts com novo nome
- [x] Atualizar splash screen
- [x] Atualizar favicon e ícones
- [x] Refazer logo para ficar parecida com a primeira versão


## Bugs Reportados (Fase 8)
- [x] Corrigir entrada de texto nos campos de filtros (TextInput perde foco após cada letra)


## Implementações Solicitadas (Fase 9)

### Pastas de Filtros na Tela Inicial
- [x] Criar componente de pasta para cada filtro salvo
- [x] Exibir pastas na tela inicial (Home)
- [x] Mostrar resultados de busca dentro de cada pasta
- [x] Integrar com API DJEN para buscar resultados por filtro
- [x] Adicionar indicador de quantidade de resultados por pasta
- [x] Implementar navegação para abrir pasta e ver resultados
