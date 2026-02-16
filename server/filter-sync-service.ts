/**
 * Servico de sincronizacao de filtros salvos
 * 
 * Verifica periodicamente se ha novos resultados para cada filtro salvo
 * e envia notificacoes via WhatsApp quando encontra mudancas.
 */

import * as db from "./db";
import {
  searchDJEN,
  detectarNovosResultados,
  calcularDataInicio,
  type DJENFilterParams,
  type DJENResultado,
} from "./djen-api-service";
import { sendFilterNotification } from "./whatsapp-service";

export interface SyncResult {
  filterId: number;
  userId: number;
  newResultsCount: number;
  notificationSent: boolean;
  status: "success" | "error" | "no_changes";
  errorMessage?: string;
}

/**
 * Sincroniza um filtro especifico
 * 
 * @param filterId - ID do filtro
 * @returns Resultado da sincronizacao
 */
export async function syncFilter(filterId: number): Promise<SyncResult> {
  try {
    // Buscar filtro no banco de dados
    const filter = await db.getSavedFilter(filterId);

    if (!filter) {
      return {
        filterId,
        userId: 0,
        newResultsCount: 0,
        notificationSent: false,
        status: "error",
        errorMessage: "Filtro nao encontrado",
      };
    }

    // Se notificacoes estao desativadas, pular
    if (!filter.notificationsEnabled) {
      return {
        filterId,
        userId: filter.userId,
        newResultsCount: 0,
        notificationSent: false,
        status: "no_changes",
      };
    }

    // Buscar resultados antigos (salvos na ultima sincronizacao)
    const resultadosAntigos = await db.getFilterResults(filterId);

    // Construir parametros de busca a partir dos dados do filtro
    const filterParams = buildSearchParams(filter.filterData, filter.lastSyncedAt || undefined);

    // Buscar novos resultados na API DJEN
    const response = await searchDJEN(filterParams);
    const resultadosNovos = response.resultados;

    // Detectar novos resultados
    const novosResultados = detectarNovosResultados(resultadosAntigos, resultadosNovos);

    // Se houver novos resultados, enviar notificacao
    let notificationSent = false;
    if (novosResultados.length > 0 && filter.whatsappNumber) {
      try {
        await sendFilterNotification(
          filter.whatsappNumber,
          filter.name,
          novosResultados.length
        );
        notificationSent = true;
      } catch (error) {
        console.error(`Erro ao enviar notificacao para filtro ${filterId}:`, error);
      }
    }

    // Atualizar filtro com ultima sincronizacao e ultimo resultado
    const ultimoResultado = resultadosNovos[0];
    await db.updateSavedFilter(filterId, {
      lastSyncedAt: new Date(),
      lastResultId: ultimoResultado?.id,
    });

    // Salvar resultados no banco de dados
    if (resultadosNovos.length > 0) {
      await db.saveFilterResults(filterId, resultadosNovos);
    }

    // Registrar sincronizacao no historico
    await db.recordSyncHistory({
      filterId,
      userId: filter.userId,
      newResultsCount: novosResultados.length,
      notificationSent: notificationSent ? 1 : 0,
      status: novosResultados.length > 0 ? "success" : "no_changes",
    })

    return {
      filterId,
      userId: filter.userId,
      newResultsCount: novosResultados.length,
      notificationSent,
      status: novosResultados.length > 0 ? "success" : "no_changes",
    };
  } catch (error) {
    console.error(`Erro ao sincronizar filtro ${filterId}:`, error);

    // Registrar erro no historico
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

    return {
      filterId,
      userId: 0,
      newResultsCount: 0,
      notificationSent: false,
      status: "error",
      errorMessage,
    };
  }
}

/**
 * Sincroniza todos os filtros salvos
 * 
 * @returns Lista de resultados de sincronizacao
 */
export async function syncAllFilters(): Promise<SyncResult[]> {
  try {
    // Buscar todos os filtros com notificacoes ativadas
    const filters = await db.getAllSavedFilters();

    const results: SyncResult[] = [];

    // Sincronizar cada filtro
    for (const filter of filters) {
      const result = await syncFilter(filter.id);
      results.push(result);

      // Pequeno delay para nao sobrecarregar a API
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return results;
  } catch (error) {
    console.error("Erro ao sincronizar todos os filtros:", error);
    return [];
  }
}

/**
 * Constroi parametros de busca a partir dos dados do filtro
 * 
 * @param filterData - Dados do filtro salvos
 * @param lastSyncedAt - Data da ultima sincronizacao
 * @returns Parametros para busca na API DJEN
 */
function buildSearchParams(filterData: any, lastSyncedAt?: Date): DJENFilterParams {
  const params: DJENFilterParams = {
    pagina: 1,
    itensPerPage: 50,
  };

  // Adicionar criterios do filtro
  if (filterData.numeroProcesso) {
    params.numeroProcesso = filterData.numeroProcesso;
  }

  if (filterData.nomeParte) {
    params.nomeParte = filterData.nomeParte;
  }

  if (filterData.tipoAto) {
    params.tipoAto = filterData.tipoAto;
  }

  // Definir data inicial para busca
  if (lastSyncedAt) {
    params.dataInicio = calcularDataInicio(lastSyncedAt);
  } else if (filterData.dataInicio) {
    params.dataInicio = filterData.dataInicio;
  } else {
    params.dataInicio = calcularDataInicio();
  }

  // Definir data final
  if (filterData.dataFim) {
    params.dataFim = filterData.dataFim;
  } else {
    params.dataFim = new Date().toISOString().split("T")[0];
  }

  return params;
}
