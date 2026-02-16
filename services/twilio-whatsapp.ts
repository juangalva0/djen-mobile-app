/**
 * Serviço de integração com Twilio WhatsApp
 * 
 * Este serviço gerencia o envio de notificações via WhatsApp usando a API Twilio.
 * As credenciais do Twilio devem ser configuradas como variáveis de ambiente no servidor.
 */

export interface WhatsAppMessage {
  to: string; // Numero do destinatario (com codigo do pais, ex: +55 11 98765-4321)
  body: string; // Corpo da mensagem
  templateName?: string; // Nome do template (se usar templates aprovados)
  templateParams?: Record<string, string>; // Parametros para o template
}

export interface WhatsAppNotificationPayload {
  userId: string;
  whatsappNumber: string;
  filterName: string;
  resultCount: number;
  filterId: string;
}

/**
 * Envia uma mensagem de notificacao via WhatsApp
 * 
 * @param message - Dados da mensagem
 * @returns Promise com resultado do envio
 */
export async function sendWhatsAppMessage(message: WhatsAppMessage): Promise<any> {
  try {
    const response = await fetch("/api/whatsapp/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Erro ao enviar mensagem: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao enviar mensagem WhatsApp:", error);
    throw error;
  }
}

/**
 * Envia notificacao de novo resultado de filtro
 * 
 * @param payload - Dados da notificacao
 * @returns Promise com resultado do envio
 */
export async function sendFilterNotification(payload: WhatsAppNotificationPayload): Promise<any> {
  const message = `
Ola! Seu filtro "${payload.filterName}" encontrou ${payload.resultCount} novo(s) resultado(s) no DJEN.

Acesse o app para conferir os detalhes!
  `.trim();

  return sendWhatsAppMessage({
    to: payload.whatsappNumber,
    body: message,
  });
}

/**
 * Valida um numero de WhatsApp
 * 
 * @param number - Numero a validar
 * @returns true se valido, false caso contrario
 */
export function validateWhatsAppNumber(number: string): boolean {
  // Remove espacos, hifens e parenteses
  const cleaned = number.replace(/[\s\-()]/g, "");
  // Deve comecar com + e ter entre 10 e 15 digitos
  const phoneRegex = /^\+\d{10,15}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Formata um numero de WhatsApp
 * 
 * @param number - Numero a formatar
 * @returns Numero formatado
 */
export function formatWhatsAppNumber(number: string): string {
  // Remove espacos e caracteres especiais, mantendo apenas + e digitos
  return number.replace(/[^\d+]/g, "");
}
