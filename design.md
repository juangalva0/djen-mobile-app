# Design do Aplicativo Djen - Consulta ao DJEN

## Visão Geral

O aplicativo Djen é uma interface mobile otimizada para consulta e monitoramento do Diário de Justiça Eletrônico Nacional. O design segue os padrões iOS (Apple Human Interface Guidelines) com foco em clareza, rapidez e uso com uma mão.

**Orientação:** Portrait (9:16)  
**Plataforma Principal:** iOS, com suporte a Android  
**Tema:** Light/Dark mode automático

---

## Paleta de Cores

| Elemento | Cor | Uso |
|----------|-----|-----|
| **Primary** | `#0066CC` (Azul Profissional) | Botões, links, destaques |
| **Background** | `#FFFFFF` (Light) / `#151718` (Dark) | Fundo das telas |
| **Surface** | `#F5F5F5` (Light) / `#1E2022` (Dark) | Cards, superfícies elevadas |
| **Foreground** | `#11181C` (Light) / `#ECEDEE` (Dark) | Texto principal |
| **Muted** | `#687076` (Light) / `#9BA1A6` (Dark) | Texto secundário |
| **Border** | `#E5E7EB` (Light) / `#334155` (Dark) | Divisores |
| **Success** | `#22C55E` | Ações bem-sucedidas |
| **Warning** | `#F59E0B` | Avisos e prazos próximos |
| **Error** | `#EF4444` | Erros e alertas críticos |

---

## Estrutura de Telas

### 1. **Home (Busca Principal)**
**Objetivo:** Ponto de entrada para buscar publicações no DJEN

**Conteúdo:**
- Header com logo Djen e ícone de perfil
- Barra de busca destacada (com foco em UX)
- Abas de filtro rápido: "Todos", "Meus Processos", "Recentes"
- Lista de resultados recentes ou processos monitorados
- Bottom tab bar com navegação

**Funcionalidade:**
- Busca responsiva por número de processo, nome das partes, advogado
- Sugestões de autocomplete
- Filtros rápidos por tribunal e tipo de ato

---

### 2. **Detalhes da Publicação**
**Objetivo:** Exibir uma publicação do DJEN de forma clara e otimizada

**Conteúdo:**
- Header com número do processo e tribunal
- Informações principais (datas, partes, advogados)
- Texto da publicação com destaque automático:
  - Datas em **amarelo**
  - Prazos em **vermelho**
  - Partes em **azul**
  - Expressões jurídicas relevantes em **negrito**
- Botões de ação: Favoritar, Compartilhar, Copiar
- Histórico de publicações relacionadas

**Funcionalidade:**
- Leitura otimizada com fonte clara
- Destaque automático de informações críticas
- Navegação entre publicações do mesmo processo

---

### 3. **Meus Processos (Monitoramento)**
**Objetivo:** Gerenciar processos favoritados e monitorados

**Conteúdo:**
- Lista de processos favoritados
- Card para cada processo com:
  - Número do processo
  - Partes principais
  - Data da última publicação
  - Ícone de notificação (se há alertas não lidos)
  - Botão de remover/desativar monitoramento
- Opção de ordenar por: Data, Relevância, Alfabético

**Funcionalidade:**
- Favoritar/desfavoritar processos
- Ativar/desativar notificações por processo
- Busca rápida dentro dos processos monitorados
- Remover processos da lista

---

### 4. **Filtros Avançados**
**Objetivo:** Permitir buscas personalizadas com múltiplos critérios

**Conteúdo:**
- Seletores para:
  - **Tribunal:** Dropdown com tribunais brasileiros
  - **Período:** Data inicial e final (com presets: "Últimos 7 dias", "Últimos 30 dias", etc.)
  - **Tipo de Ato:** Dropdown com tipos (sentença, despacho, etc.)
  - **Palavra-chave:** Campo de texto
  - **Partes:** Campo de texto
  - **Advogado:** Campo de texto
- Botões: "Aplicar Filtros" e "Limpar Tudo"
- Opção de salvar filtros como favoritos

**Funcionalidade:**
- Filtros persistem durante a sessão
- Salvar filtros personalizados
- Aplicar múltiplos filtros simultaneamente

---

### 5. **Configurações de Notificações**
**Objetivo:** Gerenciar alertas e notificações push

**Conteúdo:**
- Toggle global: "Ativar Notificações"
- Opções por tipo:
  - Notificações por processo (lista de processos com toggle individual)
  - Notificações por filtro salvo
  - Horário de notificações (quiet hours)
  - Som e vibração
- Histórico de notificações recentes

**Funcionalidade:**
- Ativar/desativar notificações globalmente ou por processo
- Configurar horários de silêncio
- Gerenciar permissões do sistema

---

### 6. **Perfil e Configurações**
**Objetivo:** Gerenciar conta, preferências e informações do usuário

**Conteúdo:**
- Informações do usuário (nome, email)
- Preferências:
  - Tema (Light/Dark/Auto)
  - Tamanho de fonte
  - Idioma (Português/Inglês)
- Plano atual (Gratuito/Premium)
- Opção de upgrade
- Sobre o app, Privacidade, Termos
- Logout

**Funcionalidade:**
- Editar perfil
- Gerenciar assinatura
- Acessar documentos legais

---

## Fluxos de Usuário Principais

### Fluxo 1: Buscar e Monitorar um Processo
1. Usuário abre o app → Home
2. Digita número do processo na barra de busca
3. Seleciona resultado da busca
4. Visualiza publicações do processo
5. Clica em "Favoritar" para monitorar
6. Ativa notificações para o processo

### Fluxo 2: Consultar Publicação Recente
1. Usuário abre o app → Home
2. Visualiza lista de processos monitorados
3. Clica em um processo
4. Vê publicações recentes com destaques automáticos
5. Lê informação crítica (prazo, data)

### Fluxo 3: Usar Filtros Avançados
1. Usuário abre o app → Home
2. Clica em "Filtros"
3. Seleciona tribunal, período, tipo de ato
4. Aplica filtros
5. Visualiza resultados filtrados
6. Opcionalmente, salva filtro para reutilização

---

## Componentes Principais

### Componentes Reutilizáveis
- **ProcessCard:** Card exibindo processo com informações resumidas
- **PublicationCard:** Card exibindo publicação com destaque
- **FilterButton:** Botão de filtro rápido
- **SearchBar:** Barra de busca com autocomplete
- **NotificationBadge:** Badge indicando notificações não lidas
- **HighlightedText:** Texto com destaque automático de informações jurídicas

### Navegação
- **Bottom Tab Bar:** Home, Meus Processos, Filtros, Configurações
- **Stack Navigation:** Detalhes de publicação, Filtros avançados

---

## Considerações de UX

1. **Responsividade:** Otimizado para telas de 5" a 6.5"
2. **Uso com Uma Mão:** Elementos interativos concentrados na parte inferior
3. **Clareza Visual:** Hierarquia clara de informações
4. **Acessibilidade:** Contraste suficiente, texto legível
5. **Performance:** Carregamento rápido de resultados (< 2s)
6. **Feedback Visual:** Indicadores de carregamento, estados de sucesso/erro

---

## Próximas Etapas

1. Gerar logo do aplicativo
2. Implementar navegação base com tab bar
3. Desenvolver tela de busca e resultados
4. Criar tela de detalhes de publicação com destaques
5. Implementar sistema de favoritos e monitoramento
6. Integrar notificações push
7. Testar em dispositivos reais
