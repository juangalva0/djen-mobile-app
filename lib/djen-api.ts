import axios, { AxiosInstance } from "axios";

/**
 * Tipos de dados da API DJEN do PJe
 * Documentação: https://comunicaapi.pje.jus.br/swagger/index.html
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
 * API Oficial: https://comunicaapi.pje.jus.br/swagger/index.html
 * Base URL: https://comunicaapi.pje.jus.br/api/v1
 * 
 * Endpoints principais:
 * - POST /publicacoes/buscar - Buscar publicações/atos
 * - GET /publicacoes/{id} - Detalhes de uma publicação
 * - GET /processos/{numeroProcesso} - Detalhes de um processo
 * - GET /processos/{numeroProcesso}/movimentos - Movimentações de um processo
 */
class DJENApiService {
  private client: AxiosInstance;
  private baseUrl = "https://comunicaapi.pje.jus.br/api/v1";
  private maxRetries = 3;
  private retryDelay = 1000; // ms

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
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
   * Buscar publicações/atos com base em critérios
   * Endpoint: POST /publicacoes/buscar
   * 
   * Parâmetros suportados:
   * - numeroProcesso: Número único do processo (formato: NNNNNNN-DD.AAAA.J.TT.OOOO.CCCCCC)
   * - partes: Nome das partes envolvidas
   * - advogado: Nome do advogado
   * - tribunal: Tribunal específico
   * - dataInicio: Data inicial (YYYY-MM-DD)
   * - dataFim: Data final (YYYY-MM-DD)
   * - palavraChave: Palavra-chave para busca
   * - pagina: Número da página (0-indexed)
   * - tamanho: Quantidade de resultados por página
   */
  async search(params: SearchParams): Promise<DJENPublication[]> {
    try {
      console.log("Buscando publicações na API DJEN com parâmetros:", params);

      const response = await this.client.post("/publicacoes/buscar", {
        numeroProcesso: params.processNumber || undefined,
        partes: params.parties || undefined,
        advogado: params.lawyer || undefined,
        tribunal: params.tribunal || undefined,
        dataInicio: params.startDate || undefined,
        dataFim: params.endDate || undefined,
        palavraChave: params.query || undefined,
        pagina: (params.page || 1) - 1,
        tamanho: params.limit || 20,
      });

      console.log("Resposta da API DJEN:", response.data);

      // Valida resposta conforme padrão PJe
      if (response.data?.status === "ok" && response.data?.result) {
        const items = Array.isArray(response.data.result) ? response.data.result : response.data.result.items || [];
        return this.formatPublications(items);
      }

      if (response.data?.code === 200 && response.data?.result) {
        const items = Array.isArray(response.data.result) ? response.data.result : response.data.result.items || [];
        return this.formatPublications(items);
      }

      console.warn("API retornou resposta inesperada:", response.data);
      return [];
    } catch (error: any) {
      console.error("Erro ao buscar da API DJEN:", error.message);
      
      // Se for erro de acesso geográfico (403), informar ao usuário
      if (error.response?.status === 403) {
        console.error("Acesso bloqueado pela API DJEN. Possível restrição geográfica ou de IP.");
      }
      
      return [];
    }
  }

  /**
   * Obter detalhes de uma publicação específica
   * Endpoint: GET /publicacoes/{id}
   */
  async getPublicationDetails(id: string): Promise<DJENPublication | null> {
    try {
      console.log("Buscando detalhes da publicação:", id);

      const response = await this.client.get(`/publicacoes/${id}`);

      if (response.data?.status === "ok" && response.data?.result) {
        const items = Array.isArray(response.data.result) ? response.data.result : [response.data.result];
        const publications = this.formatPublications(items);
        return publications[0] || null;
      }

      if (response.data?.code === 200 && response.data?.result) {
        const items = Array.isArray(response.data.result) ? response.data.result : [response.data.result];
        const publications = this.formatPublications(items);
        return publications[0] || null;
      }

      return null;
    } catch (error: any) {
      console.error("Erro ao buscar detalhes da publicação:", error.message);
      return null;
    }
  }

  /**
   * Buscar publicações de um processo específico
   * Endpoint: GET /processos/{numeroProcesso}/publicacoes
   */
  async getProcessPublications(processNumber: string): Promise<DJENPublication[]> {
    try {
      console.log("Buscando publicações do processo:", processNumber);

      const response = await this.client.get(`/processos/${processNumber}/publicacoes`);

      if (response.data?.status === "ok" && response.data?.result) {
        const items = Array.isArray(response.data.result) ? response.data.result : response.data.result.items || [];
        return this.formatPublications(items);
      }

      if (response.data?.code === 200 && response.data?.result) {
        const items = Array.isArray(response.data.result) ? response.data.result : response.data.result.items || [];
        return this.formatPublications(items);
      }

      // Fallback: buscar por número de processo
      return this.search({ processNumber });
    } catch (error: any) {
      console.error("Erro ao buscar publicações do processo:", error.message);
      // Fallback: buscar por número de processo
      return this.search({ processNumber });
    }
  }

  /**
   * Buscar movimentações de um processo específico
   * Endpoint: GET /processos/{numeroProcesso}/movimentos
   */
  async getProcessMovements(processNumber: string): Promise<any[]> {
    try {
      console.log("Buscando movimentações do processo:", processNumber);

      const response = await this.client.get(`/processos/${processNumber}/movimentos`);

      if (response.data?.status === "ok" && response.data?.result) {
        return Array.isArray(response.data.result) ? response.data.result : response.data.result.items || [];
      }

      if (response.data?.code === 200 && response.data?.result) {
        return Array.isArray(response.data.result) ? response.data.result : response.data.result.items || [];
      }

      return [];
    } catch (error: any) {
      console.error("Erro ao buscar movimentações:", error.message);
      return [];
    }
  }

  /**
   * Obter detalhes de um processo específico
   * Endpoint: GET /processos/{numeroProcesso}
   */
  async getProcessDetails(processNumber: string): Promise<any | null> {
    try {
      console.log("Buscando detalhes do processo:", processNumber);

      const response = await this.client.get(`/processos/${processNumber}`);

      if (response.data?.status === "ok" && response.data?.result) {
        return response.data.result;
      }

      if (response.data?.code === 200 && response.data?.result) {
        return response.data.result;
      }

      return null;
    } catch (error: any) {
      console.error("Erro ao buscar detalhes do processo:", error.message);
      return null;
    }
  }

  /**
   * Buscar publicações recentes
   * Busca publicações dos últimos 30 dias
   */
  async getRecentPublications(limit: number = 10): Promise<DJENPublication[]> {
    try {
      console.log("Buscando publicações recentes");

      // Calcula data de 30 dias atrás
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const startDate = thirtyDaysAgo.toISOString().split("T")[0];
      const endDate = today.toISOString().split("T")[0];

      return this.search({
        startDate,
        endDate,
        page: 1,
        limit,
      });
    } catch (error: any) {
      console.error("Erro ao buscar publicações recentes:", error.message);
      return [];
    }
  }

  /**
   * Buscar por partes (nomes de pessoas/empresas)
   */
  async searchByParties(partyName: string, limit: number = 20): Promise<DJENPublication[]> {
    try {
      console.log("Buscando publicações por partes:", partyName);

      return this.search({
        parties: partyName,
        page: 1,
        limit,
      });
    } catch (error: any) {
      console.error("Erro ao buscar por partes:", error.message);
      return [];
    }
  }

  /**
   * Buscar por advogado
   */
  async searchByLawyer(lawyerName: string, limit: number = 20): Promise<DJENPublication[]> {
    try {
      console.log("Buscando publicações por advogado:", lawyerName);

      return this.search({
        lawyer: lawyerName,
        page: 1,
        limit,
      });
    } catch (error: any) {
      console.error("Erro ao buscar por advogado:", error.message);
      return [];
    }
  }

  /**
   * Formata publicações retornadas pela API para o padrão da aplicação
   */
  private formatPublications(items: any[]): DJENPublication[] {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item) => ({
      id: item.id || item.numeroProcesso || item.idPublicacao || "",
      number: item.numeroProcesso || item.number || "",
      court: item.tribunal || item.court || item.nomeSegundoGrau || "",
      date: item.dataPublicacao || item.date || new Date().toISOString().split("T")[0],
      type: item.tipo || item.type || "Publicação",
      summary: item.resumo || item.summary || "",
      fullText: item.conteudo || item.fullText || item.texto || "",
      parties: Array.isArray(item.partes) ? item.partes : (item.parties || []),
      judges: Array.isArray(item.juizes) ? item.juizes : (item.judges || []),
      lawyers: Array.isArray(item.advogados) ? item.advogados : (item.lawyers || []),
      magistrates: Array.isArray(item.magistrados) ? item.magistrados : (item.magistrates || []),
      content: item.conteudo || item.content || item.texto || "",
      movements: item.movimentos || item.movements || [],
      subject: item.assunto || item.subject || "",
    }));
  }
}

export const djenApi = new DJENApiService();
