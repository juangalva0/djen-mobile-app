import { describe, it, expect } from "vitest";
import {
  detectarNovosResultados,
  formatarDataDJEN,
  calcularDataInicio,
  type DJENResultado,
} from "../server/djen-api-service";

describe("DJEN API Service", () => {
  describe("detectarNovosResultados", () => {
    it("deve detectar novos resultados", () => {
      const antigos: DJENResultado[] = [
        { id: "1", numeroProcesso: "0000001", dataPublicacao: "2026-02-16", descricao: "Ato 1" },
        { id: "2", numeroProcesso: "0000002", dataPublicacao: "2026-02-16", descricao: "Ato 2" },
      ];

      const novos: DJENResultado[] = [
        { id: "3", numeroProcesso: "0000003", dataPublicacao: "2026-02-16", descricao: "Ato 3" },
        { id: "2", numeroProcesso: "0000002", dataPublicacao: "2026-02-16", descricao: "Ato 2" },
        { id: "1", numeroProcesso: "0000001", dataPublicacao: "2026-02-16", descricao: "Ato 1" },
      ];

      const resultado = detectarNovosResultados(antigos, novos);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe("3");
    });

    it("deve retornar array vazio se nao houver novos resultados", () => {
      const antigos: DJENResultado[] = [
        { id: "1", numeroProcesso: "0000001", dataPublicacao: "2026-02-16", descricao: "Ato 1" },
      ];

      const novos: DJENResultado[] = [
        { id: "1", numeroProcesso: "0000001", dataPublicacao: "2026-02-16", descricao: "Ato 1" },
      ];

      const resultado = detectarNovosResultados(antigos, novos);

      expect(resultado).toHaveLength(0);
    });

    it("deve detectar todos como novos se lista anterior estiver vazia", () => {
      const antigos: DJENResultado[] = [];

      const novos: DJENResultado[] = [
        { id: "1", numeroProcesso: "0000001", dataPublicacao: "2026-02-16", descricao: "Ato 1" },
        { id: "2", numeroProcesso: "0000002", dataPublicacao: "2026-02-16", descricao: "Ato 2" },
      ];

      const resultado = detectarNovosResultados(antigos, novos);

      expect(resultado).toHaveLength(2);
    });
  });

  describe("formatarDataDJEN", () => {
    it("deve formatar data como YYYY-MM-DD", () => {
      const data = new Date("2026-02-16T10:30:00Z");
      const resultado = formatarDataDJEN(data);

      expect(resultado).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(resultado).toBe("2026-02-16");
    });

    it("deve formatar string de data", () => {
      const resultado = formatarDataDJEN("2026-02-16T10:30:00Z");

      expect(resultado).toBe("2026-02-16");
    });

    it("deve adicionar zeros a esquerda para mes e dia", () => {
      const data = new Date("2026-01-05T10:30:00Z");
      const resultado = formatarDataDJEN(data);

      expect(resultado).toBe("2026-01-05");
    });
  });

  describe("calcularDataInicio", () => {
    it("deve retornar data da ultima sincronizacao se fornecida", () => {
      const ultimaSincronizacao = new Date("2026-02-10T10:30:00Z");
      const resultado = calcularDataInicio(ultimaSincronizacao);

      expect(resultado).toBe("2026-02-10");
    });

    it("deve retornar data de 30 dias atras se nao fornecida", () => {
      const resultado = calcularDataInicio();
      const agora = new Date();
      const esperado = new Date(agora);
      esperado.setDate(esperado.getDate() - 30);

      const resultadoFormatado = resultado;
      const esperadoFormatado = formatarDataDJEN(esperado);

      expect(resultadoFormatado).toBe(esperadoFormatado);
    });
  });
});
