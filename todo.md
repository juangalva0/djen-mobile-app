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
