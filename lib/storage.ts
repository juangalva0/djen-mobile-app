import AsyncStorage from "@react-native-async-storage/async-storage";

export interface StoredProcess {
  id: string;
  number: string;
  parts: string;
  court: string;
  lastUpdate: string;
  isFavorite: boolean;
  notificationsEnabled: boolean;
}

export interface StoredPublication {
  id: string;
  processNumber: string;
  date: string;
  type: string;
  summary: string;
  fullText: string;
  court: string;
}

const PROCESSES_KEY = "@djen_processes";
const PUBLICATIONS_KEY = "@djen_publications";
const FAVORITES_KEY = "@djen_favorites";
const SEARCH_HISTORY_KEY = "@djen_search_history";

/**
 * Gerenciar processos armazenados localmente
 */
export const processStorage = {
  async getAll(): Promise<StoredProcess[]> {
    try {
      const data = await AsyncStorage.getItem(PROCESSES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Erro ao buscar processos:", error);
      return [];
    }
  },

  async save(process: StoredProcess): Promise<void> {
    try {
      const processes = await this.getAll();
      const index = processes.findIndex((p) => p.id === process.id);
      if (index >= 0) {
        processes[index] = process;
      } else {
        processes.push(process);
      }
      await AsyncStorage.setItem(PROCESSES_KEY, JSON.stringify(processes));
    } catch (error) {
      console.error("Erro ao salvar processo:", error);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const processes = await this.getAll();
      const filtered = processes.filter((p) => p.id !== id);
      await AsyncStorage.setItem(PROCESSES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Erro ao deletar processo:", error);
    }
  },

  async toggleFavorite(id: string): Promise<void> {
    try {
      const processes = await this.getAll();
      const process = processes.find((p) => p.id === id);
      if (process) {
        process.isFavorite = !process.isFavorite;
        await this.save(process);
      }
    } catch (error) {
      console.error("Erro ao alternar favorito:", error);
    }
  },

  async toggleNotifications(id: string): Promise<void> {
    try {
      const processes = await this.getAll();
      const process = processes.find((p) => p.id === id);
      if (process) {
        process.notificationsEnabled = !process.notificationsEnabled;
        await this.save(process);
      }
    } catch (error) {
      console.error("Erro ao alternar notificações:", error);
    }
  },

  async getFavorites(): Promise<StoredProcess[]> {
    try {
      const processes = await this.getAll();
      return processes.filter((p) => p.isFavorite);
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
      return [];
    }
  },
};

/**
 * Gerenciar publicações armazenadas localmente
 */
export const publicationStorage = {
  async getAll(): Promise<StoredPublication[]> {
    try {
      const data = await AsyncStorage.getItem(PUBLICATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Erro ao buscar publicações:", error);
      return [];
    }
  },

  async save(publication: StoredPublication): Promise<void> {
    try {
      const publications = await this.getAll();
      const index = publications.findIndex((p) => p.id === publication.id);
      if (index >= 0) {
        publications[index] = publication;
      } else {
        publications.push(publication);
      }
      await AsyncStorage.setItem(PUBLICATIONS_KEY, JSON.stringify(publications));
    } catch (error) {
      console.error("Erro ao salvar publicação:", error);
    }
  },

  async getByProcessNumber(processNumber: string): Promise<StoredPublication[]> {
    try {
      const publications = await this.getAll();
      return publications.filter((p) => p.processNumber === processNumber);
    } catch (error) {
      console.error("Erro ao buscar publicações do processo:", error);
      return [];
    }
  },
};

/**
 * Gerenciar histórico de buscas
 */
export const searchHistoryStorage = {
  async getAll(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      return [];
    }
  },

  async add(query: string): Promise<void> {
    try {
      const history = await this.getAll();
      // Remove duplicatas e adiciona no início
      const filtered = history.filter((h) => h !== query);
      const updated = [query, ...filtered].slice(0, 10); // Manter últimas 10 buscas
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Erro ao adicionar ao histórico:", error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error("Erro ao limpar histórico:", error);
    }
  },
};
