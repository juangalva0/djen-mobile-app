import axios, { AxiosInstance } from "axios";

/**
 * Tipos de dados da API DJEN
 */
export interface DJENPublication {
  id: string;
  number: string;
  court: string;
  date: string;
  type?: string;
  summary?: string;
  fullText?: string;
  parties: string[];
  judges?: string[];
  lawyers?: string[];
  magistrates?: string[];
  content?: string;
  movements?: string[];
  subject?: string;
}

export interface SearchParams {
  query?: string;
  processNumber?: string;
  parties?: string;
  lawyer?: string;
  tribunal?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  page?: number;
  limit?: number;
}

/**
 * Cliente para integração com API DJEN do PJe
 * Documentação: https://comunicaapi.pje.jus.br/swagger/index.html
 */
class DJENApiService {
  private client: AxiosInstance;
  private baseUrl = "https://comunicaapi.pje.jus.br/api/v1";
  private maxRetries = 3;
  private retryDelay = 1000; // ms

  // Dados mock para fallback quando API não está disponível
  private mockData: DJENPublication[] = [
    {
      id: "pub-1",
      number: "0000001-23.2024.8.26.0100",
      court: "TJ-SP",
      date: "2024-02-05",
      type: "Sentença",
      summary: "Sentença condenatória em ação de indenização por dano moral. Intime-se as partes. Prazo de 15 dias para recurso.",
      fullText:
        "SENTENÇA\n\nVistos, etc.\n\nTrata-se de ação de indenização por dano moral ajuizada por João Silva contra Maria Santos.\n\nA prova dos autos demonstra que o réu agiu com culpa, causando dano moral ao autor.\n\nPor todo o exposto, CONDENO o réu ao pagamento de R$ 10.000,00 (dez mil reais) a título de indenização por dano moral.\n\nIntime-se. Prazo de 15 dias para interposição de recurso.",
      parties: ["João Silva", "Maria Santos"],
      judges: ["Juiz de Direito: Dr. Carlos Alberto Silva"],
      lawyers: ["OAB/SP 123456", "OAB/SP 654321"],
    },
    {
      id: "pub-2",
      number: "0000002-45.2024.8.26.0100",
      court: "TJ-SP",
      date: "2024-02-03",
      type: "Despacho",
      summary: "Despacho ordenando a citação do réu. Prazo de 20 dias para resposta.",
      fullText: "DESPACHO\n\nDefiro o pedido de citação do réu via postal. Prazo de 20 dias para apresentação de resposta.",
      parties: ["Empresa XYZ LTDA", "Banco ABC"],
      judges: ["Juiz de Direito: Dra. Ana Paula Costa"],
      lawyers: ["OAB/SP 111111", "OAB/SP 222222"],
    },
    {
      id: "pub-3",
      number: "0000003-67.2024.8.26.0100",
      court: "TJ-SP",
      date: "2024-02-01",
      type: "Acórdão",
      summary: "Acórdão que mantém a sentença de primeira instância. Unânime.",
      fullText: "ACÓRDÃO\n\nVoto do Relator: Mantém-se a sentença de primeira instância pelos seus próprios fundamentos.",
      parties: ["Condomínio Residencial", "Proprietário"],
      judges: ["Desembargador: Dr. Roberto Silva", "Desembargador: Dra. Fernanda Costa"],
      lawyers: ["OAB/SP 333333", "OAB/SP 444444"],
    },
  ];

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Interceptor para retry automático em caso de erro 5xx
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        if (!config || !config.__retryCount) {
          config.__retryCount = 0;
        }

        if (config.__retryCount < this.maxRetries && error.response?.status >= 500) {
          config.__retryCount++;
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay * config.__retryCount));
          return this.client(config);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Buscar publicações com base em critérios
   */
  async search(params: SearchParams): Promise<DJENPublication[]> {
    try {
      // Tenta buscar da API real
      const response = await this.client.post("/publicacoes/buscar", {
        numeroProcesso: params.processNumber,
        partes: params.parties,
        advogado: params.lawyer,
        tribunal: params.tribunal,
        dataInicio: params.startDate,
        dataFim: params.endDate,
        palavraChave: params.query,
        pagina: (params.page || 1) - 1,
        tamanho: params.limit || 20,
      });

      // Valida resposta
      if (response.data?.status === "ok" && response.data?.result?.items) {
        return this.formatPublications(response.data.result.items);
      }

      // Se API retorna erro, usa mock
      console.warn("API retornou status diferente de ok, usando dados mock");
      return this.searchMock(params);
    } catch (error) {
      console.warn("Erro ao buscar da API real, usando dados mock:", error);
      // Fallback para dados mock
      return this.searchMock(params);
    }
  }

  /**
   * Busca em dados mock (fallback)
   */
  private searchMock(params: SearchParams): DJENPublication[] {
    let results = [...this.mockData];

    if (params.processNumber) {
      results = results.filter((p) => p.number.includes(params.processNumber!));
    }

    if (params.query) {
      const query = params.query.toLowerCase();
      results = results.filter(
        (p) =>
          (p.summary?.toLowerCase().includes(query) || false) ||
          (p.fullText?.toLowerCase().includes(query) || false) ||
          p.parties.some((party) => party.toLowerCase().includes(query))
      );
    }

    if (params.tribunal) {
      results = results.filter((p) => p.court === params.tribunal);
    }

    if (params.type) {
      results = results.filter((p) => p.type === params.type);
    }

    if (params.parties) {
      results = results.filter((p) =>
        p.parties.some((party) => party.toLowerCase().includes(params.parties!.toLowerCase()))
      );
    }

    if (params.lawyer) {
      results = results.filter((p) =>
        (p.lawyers || []).some((lawyer) => lawyer.toLowerCase().includes(params.lawyer!.toLowerCase()))
      );
    }

    // Paginação
    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;

    return results.slice(start, end);
  }

  /**
   * Obter detalhes de uma publicação específica
   */
  async getPublicationDetails(id: string): Promise<DJENPublication | null> {
    try {
      const response = await this.client.get(`/publicacoes/${id}`);

      if (response.data?.status === "ok" && response.data?.result) {
        const items = Array.isArray(response.data.result) ? response.data.result : [response.data.result];
        const publications = this.formatPublications(items);
        return publications[0] || null;
      }

      return this.mockData.find((p) => p.id === id) || null;
    } catch (error) {
      console.warn("Erro ao buscar detalhes, usando mock:", error);
      return this.mockData.find((p) => p.id === id) || null;
    }
  }

  /**
   * Buscar publicações de um processo específico
   */
  async getProcessPublications(processNumber: string): Promise<DJENPublication[]> {
    return this.search({ processNumber });
  }

  /**
   * Buscar publicações recentes
   */
  async getRecentPublications(limit: number = 10): Promise<DJENPublication[]> {
    try {
      // Calcula data de 30 dias atrás
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const startDate = thirtyDaysAgo.toISOString().split("T")[0];
      const endDate = today.toISOString().split("T")[0];

      const response = await this.client.post("/publicacoes/buscar", {
        dataInicio: startDate,
        dataFim: endDate,
        pagina: 0,
        tamanho: limit,
      });

      if (response.data?.status === "ok" && response.data?.result?.items) {
        return this.formatPublications(response.data.result.items);
      }

      return this.mockData.slice(0, limit);
    } catch (error) {
      console.warn("Erro ao buscar publicações recentes, usando mock:", error);
      return this.mockData.slice(0, limit);
    }
  }

  /**
   * Formata publicações retornadas pela API para o padrão da aplicação
   */
  private formatPublications(items: any[]): DJENPublication[] {
    return items.map((item) => ({
      id: item.id || item.numeroProcesso || "",
      number: item.numeroProcesso || item.number || "",
      court: item.tribunal || item.court || "",
      date: item.dataPublicacao || item.date || new Date().toISOString().split("T")[0],
      type: item.tipo || item.type || "Publicação",
      summary: item.resumo || item.summary || "",
      fullText: item.conteudo || item.fullText || "",
      parties: Array.isArray(item.partes) ? item.partes : item.parties || [],
      judges: Array.isArray(item.juizes) ? item.juizes : item.judges || [],
      lawyers: Array.isArray(item.advogados) ? item.advogados : item.lawyers || [],
      magistrates: Array.isArray(item.magistrados) ? item.magistrados : item.magistrates || [],
      content: item.conteudo || item.content || "",
      movements: item.movimentos || item.movements || [],
      subject: item.assunto || item.subject || "",
    }));
  }

  /**
   * Adicionar dados mock (para desenvolvimento/testes)
   */
  addMockData(publication: DJENPublication): void {
    this.mockData.push(publication);
  }

  /**
   * Limpar dados mock
   */
  clearMockData(): void {
    this.mockData = [];
  }
}

export const djenApi = new DJENApiService();
