/**
 * Servico de envio de mensagens WhatsApp via Twilio
 * 
 * Este servico gerencia o envio de notificacoes via WhatsApp.
 * Requer que as credenciais do Twilio estejam configuradas como variaveis de ambiente.
 */

import { twilioConfig, validateTwilioConfig } from "./twilio-config";

export interface SendWhatsAppMessageParams {
  to: string; // Numero do destinatario (com codigo do pais, ex: +55 11 98765-4321)
  body: string; // Corpo da mensagem
}

export interface SendWhatsAppMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envia uma mensagem de notificacao via WhatsApp usando Twilio
 * 
 * @param params - Parametros da mensagem
 * @returns Resultado do envio
 */
export async function sendWhatsAppMessage(
  params: SendWhatsAppMessageParams
): Promise<SendWhatsAppMessageResponse> {
  // Validar configuracao do Twilio
  if (!validateTwilioConfig()) {
    return {
      success: false,
      error: "Credenciais do Twilio nao configuradas",
    };
  }

  try {
    // Construir URL da API Twilio
    const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioConfig.accountSid}/Messages.json`;

    // Preparar dados da requisicao
    const formData = new URLSearchParams();
    formData.append("From", `whatsapp:${twilioConfig.whatsappNumber}`);
    formData.append("To", `whatsapp:${params.to}`);
    formData.append("Body", params.body);

    // Fazer requisicao para Twilio
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(
          `${twilioConfig.accountSid}:${twilioConfig.authToken}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro ao enviar mensagem WhatsApp:", errorData);
      return {
        success: false,
        error: errorData.message || "Erro ao enviar mensagem",
      };
    }

    const data = await response.json();

    return {
      success: true,
      messageId: data.sid,
    };
  } catch (error) {
    console.error("Erro ao enviar mensagem WhatsApp:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Envia notificacao de novo resultado de filtro
 * 
 * @param whatsappNumber - Numero de WhatsApp do usuario
 * @param filterName - Nome do filtro
 * @param resultCount - Quantidade de novos resultados
 * @returns Resultado do envio
 */
export async function sendFilterNotification(
  whatsappNumber: string,
  filterName: string,
  resultCount: number
): Promise<SendWhatsAppMessageResponse> {
  const message = `
Ola! Seu filtro "${filterName}" encontrou ${resultCount} novo(s) resultado(s) no DJEN.

Acesse o app para conferir os detalhes!
  `.trim();

  return sendWhatsAppMessage({
    to: whatsappNumber,
    body: message,
  });
}

/**
 * Envia notificacao de boas-vindas
 * 
 * @param whatsappNumber - Numero de WhatsApp do usuario
 * @param userName - Nome do usuario
 * @returns Resultado do envio
 */
export async function sendWelcomeNotification(
  whatsappNumber: string,
  userName: string
): Promise<SendWhatsAppMessageResponse> {
  const message = `
Ola ${userName}! 

Bem-vindo ao Djen! Voce esta recebendo notificacoes via WhatsApp sobre seus filtros salvos.

Quando seus filtros encontrarem novos resultados no DJEN, voce sera notificado aqui.

Acesse o app para gerenciar suas configuracoes de notificacao.
  `.trim();

  return sendWhatsAppMessage({
    to: whatsappNumber,
    body: message,
  });
}
