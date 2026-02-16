import { describe, it, expect } from "vitest";
import { validateWhatsAppNumber, formatWhatsAppNumber } from "../services/twilio-whatsapp";

describe("WhatsApp Utilities", () => {
  describe("validateWhatsAppNumber", () => {
    it("deve validar numero com formato correto", () => {
      expect(validateWhatsAppNumber("+5511987654321")).toBe(true);
      expect(validateWhatsAppNumber("+55 11 98765-4321")).toBe(true);
      expect(validateWhatsAppNumber("+1234567890")).toBe(true);
    });

    it("deve rejeitar numero sem +", () => {
      expect(validateWhatsAppNumber("5511987654321")).toBe(false);
      expect(validateWhatsAppNumber("11987654321")).toBe(false);
    });

    it("deve rejeitar numero muito curto", () => {
      expect(validateWhatsAppNumber("+551198")).toBe(false);
    });

    it("deve rejeitar numero muito longo", () => {
      expect(validateWhatsAppNumber("+551198765432112345")).toBe(false);
    });

    it("deve rejeitar numero com caracteres invalidos", () => {
      expect(validateWhatsAppNumber("+55 11 9876a-4321")).toBe(false);
      expect(validateWhatsAppNumber("+55 11 9876#-4321")).toBe(false);
    });
  });

  describe("formatWhatsAppNumber", () => {
    it("deve formatar numero removendo espacos e caracteres especiais", () => {
      expect(formatWhatsAppNumber("+55 11 98765-4321")).toBe("+5511987654321");
      expect(formatWhatsAppNumber("+55 (11) 98765-4321")).toBe("+5511987654321");
    });

    it("deve manter + no inicio", () => {
      expect(formatWhatsAppNumber("+5511987654321")).toBe("+5511987654321");
    });

    it("deve remover espacos em branco", () => {
      expect(formatWhatsAppNumber("+55 11 9876 5432 1")).toBe("+5511987654321");
    });

    it("deve lidar com string vazia", () => {
      expect(formatWhatsAppNumber("")).toBe("");
    });
  });
});
