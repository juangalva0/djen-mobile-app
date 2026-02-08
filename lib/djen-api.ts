/**
 * Serviço de integração com a API do DJEN
 * Atualmente com dados mock para desenvolvimento
 * Será integrado com a API real do DJEN quando disponível
 */

export interface DJENPublication {
  id: string;
  number: string;
  court: string;
  date: string;
  type: string;
  summary: string;
  fullText: string;
  parties: string[];
  judges: string[];
  lawyers: string[];
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

class DJENApiService {
  private baseUrl = "https://dje.cnj.jus.br/api"; // URL da API real quando disponível
  private mockData: DJENPublication[] = [
    {
      id: "pub-1",
      number: "0000001-23.2024.8.26.0100",
      court: "TJ-SP",
      date: "2024-02-05",
      type: "Sentença",
      summary:
        "Sentença condenatória em ação de indenização por dano moral. Intime-se as partes. Prazo de 15 dias para recurso.",
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
      fullText:
        "DESPACHO\n\nDefiro o pedido de citação do réu via postal. Prazo de 20 dias para apresentação de resposta.",
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
      fullText:
        "ACÓRDÃO\n\nVoto do Relator: Mantém-se a sentença de primeira instância pelos seus próprios fundamentos.",
      parties: ["Condomínio Residencial", "Proprietário"],
      judges: ["Desembargador: Dr. Roberto Silva", "Desembargador: Dra. Fernanda Costa"],
      lawyers: ["OAB/SP 333333", "OAB/SP 444444"],
    },
  ];

  /**
   * Buscar publicações com base em critérios
   */
  async search(params: SearchParams): Promise<DJENPublication[]> {
    // Simulando delay de rede
    await new Promise((resolve) => setTimeout(resolve, 800));

    let results = [...this.mockData];

    if (params.processNumber) {
      results = results.filter((p) => p.number.includes(params.processNumber!));
    }

    if (params.query) {
      const query = params.query.toLowerCase();
      results = results.filter(
        (p) =>
          p.summary.toLowerCase().includes(query) ||
          p.fullText.toLowerCase().includes(query) ||
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
        p.lawyers.some((lawyer) => lawyer.toLowerCase().includes(params.lawyer!.toLowerCase()))
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
    await new Promise((resolve) => setTimeout(resolve, 500));
    return this.mockData.find((p) => p.id === id) || null;
  }

  /**
   * Buscar publicações de um processo específico
   */
  async getProcessPublications(processNumber: string): Promise<DJENPublication[]> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return this.mockData.filter((p) => p.number === processNumber);
  }

  /**
   * Buscar publicações recentes
   */
  async getRecentPublications(limit: number = 10): Promise<DJENPublication[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return this.mockData.slice(0, limit);
  }

  /**
   * Adicionar dados mock (para desenvolvimento)
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
