/**
 * Servico de integracao com a API DJEN (Comunicacao API do PJe)
 * 
 * Documentacao: https://comunicaapi.pje.jus.br/swagger/index.html
 */

export interface DJENFilterParams {
  // Numero do processo (ex: "0000001-00.0000.0.00.0000")
  numeroProcesso?: string;
  // Nome da parte (autor ou reu)
  nomeParte?: string;
  // Data inicial para busca
  dataInicio?: string; // formato: YYYY-MM-DD
  // Data final para busca
  dataFim?: string; // formato: YYYY-MM-DD
  // Tipo de ato (ex: "Publicacao")
  tipoAto?: string;
  // Pagina (para paginacao)
  pagina?: number;
  // Itens por pagina
  itensPerPage?: number;
}

export interface DJENResultado {
  id: string;
  numeroProcesso: string;
  dataPublicacao: string;
  descricao: string;
  conteudo?: string;
  [key: string]: any;
}

export interface DJENResponse {
  resultados: DJENResultado[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

const DJEN_API_BASE = "https://comunicaapi.pje.jus.br";

/**
 * Busca atos na API DJEN baseado em filtros
 * 
 * @param params - Parametros de filtro
 * @returns Lista de resultados
 */
export async function searchDJEN(params: DJENFilterParams): Promise<DJENResponse> {
  try {
    // Construir query string
    const queryParams = new URLSearchParams();

    if (params.numeroProcesso) {
      queryParams.append("numeroProcesso", params.numeroProcesso);
    }
    if (params.nomeParte) {
      queryParams.append("nomeParte", params.nomeParte);
    }
    if (params.dataInicio) {
      queryParams.append("dataInicio", params.dataInicio);
    }
    if (params.dataFim) {
      queryParams.append("dataFim", params.dataFim);
    }
    if (params.tipoAto) {
      queryParams.append("tipoAto", params.tipoAto);
    }
    if (params.pagina) {
      queryParams.append("pagina", params.pagina.toString());
    }
    if (params.itensPerPage) {
      queryParams.append("itensPerPage", params.itensPerPage.toString());
    }

    // Fazer requisicao para DJEN
    const url = `${DJEN_API_BASE}/api/v1/publicacoes?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na API DJEN: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      resultados: data.resultados || [],
      total: data.total || 0,
      pagina: data.pagina || 1,
      totalPaginas: data.totalPaginas || 1,
    };
  } catch (error) {
    console.error("Erro ao buscar dados da API DJEN:", error);
    throw error;
  }
}

/**
 * Busca publicacoes recentes para um numero de processo
 * 
 * @param numeroProcesso - Numero do processo
 * @param dataInicio - Data inicial (opcional)
 * @returns Lista de publicacoes
 */
export async function getPublicacoesPorProcesso(
  numeroProcesso: string,
  dataInicio?: string
): Promise<DJENResultado[]> {
  const response = await searchDJEN({
    numeroProcesso,
    dataInicio,
    pagina: 1,
    itensPerPage: 50,
  });

  return response.resultados;
}

/**
 * Busca publicacoes por nome de parte
 * 
 * @param nomeParte - Nome da parte
 * @param dataInicio - Data inicial (opcional)
 * @returns Lista de publicacoes
 */
export async function getPublicacoesPorParte(
  nomeParte: string,
  dataInicio?: string
): Promise<DJENResultado[]> {
  const response = await searchDJEN({
    nomeParte,
    dataInicio,
    pagina: 1,
    itensPerPage: 50,
  });

  return response.resultados;
}

/**
 * Compara resultados antigos com novos para detectar mudancas
 * 
 * @param resultadosAntigos - Resultados anteriores
 * @param resultadosNovos - Resultados atuais
 * @returns Novos resultados encontrados
 */
export function detectarNovosResultados(
  resultadosAntigos: DJENResultado[],
  resultadosNovos: DJENResultado[]
): DJENResultado[] {
  const idsAntigos = new Set(resultadosAntigos.map((r) => r.id));
  return resultadosNovos.filter((r) => !idsAntigos.has(r.id));
}

/**
 * Formata uma data para o formato esperado pela API DJEN
 * 
 * @param data - Data em qualquer formato
 * @returns Data formatada como YYYY-MM-DD
 */
export function formatarDataDJEN(data: Date | string): string {
  const date = typeof data === "string" ? new Date(data) : data;
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/**
 * Calcula a data de inicio para buscar resultados desde a ultima sincronizacao
 * 
 * @param ultimaSincronizacao - Data da ultima sincronizacao
 * @returns Data formatada para DJEN
 */
export function calcularDataInicio(ultimaSincronizacao?: Date): string {
  if (ultimaSincronizacao) {
    return formatarDataDJEN(ultimaSincronizacao);
  }
  // Se nao houver sincronizacao anterior, buscar dos ultimos 30 dias
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - 30);
  return formatarDataDJEN(dataInicio);
}
