/**
 * Background jobs para sincronizacao periodica de filtros
 * 
 * Este arquivo gerencia jobs que rodam em intervalos regulares,
 * como verificar novos resultados a cada 10 minutos.
 */

import { syncAllFilters } from "./filter-sync-service";

// Intervalo em milissegundos (10 minutos = 600000 ms)
const SYNC_INTERVAL_MS = 10 * 60 * 1000;

let syncJobInterval: ReturnType<typeof setInterval> | null = null;
let isRunning = false;

/**
 * Inicia o background job de sincronizacao
 */
export function startSyncJob(): void {
  if (syncJobInterval) {
    console.log("[Background Jobs] Sync job ja esta em execucao");
    return;
  }

  console.log("[Background Jobs] Iniciando sync job (intervalo: 10 minutos)");

  // Executar sincronizacao imediatamente
  runSyncJob();

  // Agendar proximas sincronizacoes
  syncJobInterval = setInterval(() => {
    runSyncJob();
  }, SYNC_INTERVAL_MS);
}

/**
 * Para o background job de sincronizacao
 */
export function stopSyncJob(): void {
  if (syncJobInterval) {
    clearInterval(syncJobInterval);
    syncJobInterval = null;
    console.log("[Background Jobs] Sync job parado");
  }
}

/**
 * Executa uma sincronizacao de todos os filtros
 */
async function runSyncJob(): Promise<void> {
  if (isRunning) {
    console.log("[Background Jobs] Sync job ja esta em execucao, pulando...");
    return;
  }

  isRunning = true;
  const startTime = Date.now();

  try {
    console.log("[Background Jobs] Iniciando sincronizacao de filtros...");

    const results = await syncAllFilters();

    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;
    const noChangesCount = results.filter((r) => r.status === "no_changes").length;
    const notificationsSent = results.filter((r) => r.notificationSent).length;

    const duration = Date.now() - startTime;

    console.log(
      `[Background Jobs] Sincronizacao concluida em ${duration}ms:` +
        ` ${successCount} sucesso, ${noChangesCount} sem mudancas, ${errorCount} erros,` +
        ` ${notificationsSent} notificacoes enviadas`
    );

    // Log detalhado para debug
    results.forEach((result) => {
      if (result.status === "error") {
        console.error(
          `[Background Jobs] Erro ao sincronizar filtro ${result.filterId}: ${result.errorMessage}`
        );
      } else if (result.newResultsCount > 0) {
        console.log(
          `[Background Jobs] Filtro ${result.filterId}: ${result.newResultsCount} novos resultados` +
            (result.notificationSent ? ", notificacao enviada" : "")
        );
      }
    });
  } catch (error) {
    console.error("[Background Jobs] Erro ao executar sync job:", error);
  } finally {
    isRunning = false;
  }
}

/**
 * Retorna o status do sync job
 */
export function getSyncJobStatus(): {
  running: boolean;
  isExecuting: boolean;
  intervalMs: number;
} {
  return {
    running: syncJobInterval !== null,
    isExecuting: isRunning,
    intervalMs: SYNC_INTERVAL_MS,
  };
}

/**
 * Executa uma sincronizacao manual (nao agendada)
 */
export async function runManualSync(): Promise<any> {
  if (isRunning) {
    throw new Error("Sincronizacao ja esta em execucao");
  }

  isRunning = true;
  const startTime = Date.now();

  try {
    console.log("[Background Jobs] Iniciando sincronizacao manual...");
    const results = await syncAllFilters();
    const duration = Date.now() - startTime;

    return {
      success: true,
      duration,
      results,
    };
  } catch (error) {
    console.error("[Background Jobs] Erro ao executar sincronizacao manual:", error);
    throw error;
  } finally {
    isRunning = false;
  }
}
