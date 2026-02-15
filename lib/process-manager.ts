import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ProcessUpdate {
  id: string;
  date: string;
  content: string;
  type: "publication" | "movement";
  court: string;
  judge?: string;
}

export interface LegalProcess {
  id: string;
  processNumber: string;
  parties: string[];
  court: string;
  status: "active" | "concluded" | "suspended";
  createdAt: string;
  updatedAt: string;
  lastPublicationDate: string;
  publications: ProcessUpdate[];
}

const PROCESSES_KEY = "djen_processes";
const PROCESS_UPDATES_KEY = "djen_process_updates";

class ProcessManager {
  /**
   * Obter todos os processos armazenados
   */
  async getAllProcesses(): Promise<LegalProcess[]> {
    try {
      const stored = await AsyncStorage.getItem(PROCESSES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Erro ao obter processos:", error);
      return [];
    }
  }

  /**
   * Obter um processo específico pelo número
   */
  async getProcessByNumber(processNumber: string): Promise<LegalProcess | null> {
    try {
      const processes = await this.getAllProcesses();
      return processes.find((p) => p.processNumber === processNumber) || null;
    } catch (error) {
      console.error("Erro ao obter processo:", error);
      return null;
    }
  }

  /**
   * Criar novo processo
   */
  async createProcess(
    processNumber: string,
    parties: string[],
    court: string,
    firstPublication: ProcessUpdate
  ): Promise<LegalProcess> {
    try {
      const processes = await this.getAllProcesses();

      // Verificar se processo já existe
      const existingProcess = processes.find((p) => p.processNumber === processNumber);
      if (existingProcess) {
        console.warn(`Processo ${processNumber} já existe`);
        return existingProcess;
      }

      const newProcess: LegalProcess = {
        id: `process_${Date.now()}`,
        processNumber,
        parties,
        court,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastPublicationDate: firstPublication.date,
        publications: [firstPublication],
      };

      processes.push(newProcess);
      await AsyncStorage.setItem(PROCESSES_KEY, JSON.stringify(processes));

      // Registrar criação do processo
      await this.logUpdate(processNumber, "created");

      return newProcess;
    } catch (error) {
      console.error("Erro ao criar processo:", error);
      throw error;
    }
  }

  /**
   * Atualizar andamento do processo com nova publicação
   */
  async updateProcessWithPublication(
    processNumber: string,
    publication: ProcessUpdate
  ): Promise<LegalProcess | null> {
    try {
      const processes = await this.getAllProcesses();
      const processIndex = processes.findIndex((p) => p.processNumber === processNumber);

      if (processIndex === -1) {
        console.warn(`Processo ${processNumber} não encontrado`);
        return null;
      }

      const process = processes[processIndex];

      // Verificar se publicação já existe
      const publicationExists = process.publications.some((pub) => pub.id === publication.id);
      if (publicationExists) {
        console.warn(`Publicação ${publication.id} já existe no processo`);
        return process;
      }

      // Adicionar nova publicação
      process.publications.push(publication);
      process.updatedAt = new Date().toISOString();
      process.lastPublicationDate = publication.date;

      // Atualizar status baseado no tipo de publicação
      if (publication.type === "movement") {
        if (publication.content.toLowerCase().includes("conclusão")) {
          process.status = "concluded";
        } else if (publication.content.toLowerCase().includes("suspensão")) {
          process.status = "suspended";
        }
      }

      processes[processIndex] = process;
      await AsyncStorage.setItem(PROCESSES_KEY, JSON.stringify(processes));

      // Registrar atualização
      await this.logUpdate(processNumber, "updated", publication.id);

      return process;
    } catch (error) {
      console.error("Erro ao atualizar processo:", error);
      throw error;
    }
  }

  /**
   * Processar múltiplas publicações (criar ou atualizar processos)
   */
  async processPublications(publications: any[]): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    try {
      for (const pub of publications) {
        const processNumber = pub.number || pub.processNumber;
        const processUpdate: ProcessUpdate = {
          id: pub.id,
          date: pub.date,
          content: pub.content || pub.summary || "",
          type: pub.type || "publication",
          court: pub.court || "",
          judge: pub.judge,
        };

        const existingProcess = await this.getProcessByNumber(processNumber);

        if (!existingProcess) {
          // Criar novo processo
          await this.createProcess(
            processNumber,
            pub.parties || [],
            pub.court || "",
            processUpdate
          );
          created++;
        } else {
          // Atualizar processo existente
          await this.updateProcessWithPublication(processNumber, processUpdate);
          updated++;
        }
      }

      return { created, updated };
    } catch (error) {
      console.error("Erro ao processar publicações:", error);
      return { created, updated };
    }
  }

  /**
   * Obter histórico de publicações de um processo
   */
  async getProcessPublications(processNumber: string): Promise<ProcessUpdate[]> {
    try {
      const process = await this.getProcessByNumber(processNumber);
      return process?.publications || [];
    } catch (error) {
      console.error("Erro ao obter publicações do processo:", error);
      return [];
    }
  }

  /**
   * Deletar processo
   */
  async deleteProcess(processNumber: string): Promise<boolean> {
    try {
      const processes = await this.getAllProcesses();
      const filtered = processes.filter((p) => p.processNumber !== processNumber);

      if (filtered.length === processes.length) {
        console.warn(`Processo ${processNumber} não encontrado`);
        return false;
      }

      await AsyncStorage.setItem(PROCESSES_KEY, JSON.stringify(filtered));
      await this.logUpdate(processNumber, "deleted");

      return true;
    } catch (error) {
      console.error("Erro ao deletar processo:", error);
      return false;
    }
  }

  /**
   * Registrar atualização para auditoria
   */
  private async logUpdate(
    processNumber: string,
    action: "created" | "updated" | "deleted",
    publicationId?: string
  ): Promise<void> {
    try {
      const updates = await AsyncStorage.getItem(PROCESS_UPDATES_KEY);
      const updateLog = updates ? JSON.parse(updates) : [];

      updateLog.push({
        processNumber,
        action,
        publicationId,
        timestamp: new Date().toISOString(),
      });

      // Manter apenas últimas 1000 atualizações
      if (updateLog.length > 1000) {
        updateLog.shift();
      }

      await AsyncStorage.setItem(PROCESS_UPDATES_KEY, JSON.stringify(updateLog));
    } catch (error) {
      console.error("Erro ao registrar atualização:", error);
    }
  }

  /**
   * Obter estatísticas de processos
   */
  async getProcessStatistics(): Promise<{
    total: number;
    active: number;
    concluded: number;
    suspended: number;
    totalPublications: number;
  }> {
    try {
      const processes = await this.getAllProcesses();

      return {
        total: processes.length,
        active: processes.filter((p) => p.status === "active").length,
        concluded: processes.filter((p) => p.status === "concluded").length,
        suspended: processes.filter((p) => p.status === "suspended").length,
        totalPublications: processes.reduce((sum, p) => sum + p.publications.length, 0),
      };
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      return {
        total: 0,
        active: 0,
        concluded: 0,
        suspended: 0,
        totalPublications: 0,
      };
    }
  }

  /**
   * Limpar dados antigos (processos sem atualizações há mais de 90 dias)
   */
  async cleanupOldProcesses(daysThreshold: number = 90): Promise<number> {
    try {
      const processes = await this.getAllProcesses();
      const now = new Date();
      const threshold = new Date(now.getTime() - daysThreshold * 24 * 60 * 60 * 1000);

      const filtered = processes.filter((p) => {
        const lastUpdate = new Date(p.updatedAt);
        return lastUpdate > threshold;
      });

      const deletedCount = processes.length - filtered.length;

      if (deletedCount > 0) {
        await AsyncStorage.setItem(PROCESSES_KEY, JSON.stringify(filtered));
        console.log(`Removidos ${deletedCount} processos antigos`);
      }

      return deletedCount;
    } catch (error) {
      console.error("Erro ao limpar processos antigos:", error);
      return 0;
    }
  }
}

export const processManager = new ProcessManager();
