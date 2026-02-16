/**
 * Configuracao do Twilio para envio de mensagens WhatsApp
 * 
 * As credenciais devem ser configuradas como variaveis de ambiente:
 * - TWILIO_ACCOUNT_SID: Account SID do Twilio
 * - TWILIO_AUTH_TOKEN: Auth Token do Twilio
 * - TWILIO_WHATSAPP_NUMBER: Numero de WhatsApp do Twilio (ex: +1234567890)
 */

export const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || "",
  authToken: process.env.TWILIO_AUTH_TOKEN || "",
  whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || "",
};

/**
 * Valida se as credenciais do Twilio estao configuradas
 */
export function validateTwilioConfig(): boolean {
  return !!(
    twilioConfig.accountSid &&
    twilioConfig.authToken &&
    twilioConfig.whatsappNumber
  );
}

/**
 * Retorna mensagem de erro se as credenciais nao estao configuradas
 */
export function getTwilioConfigError(): string | null {
  if (!twilioConfig.accountSid) {
    return "TWILIO_ACCOUNT_SID nao configurado";
  }
  if (!twilioConfig.authToken) {
    return "TWILIO_AUTH_TOKEN nao configurado";
  }
  if (!twilioConfig.whatsappNumber) {
    return "TWILIO_WHATSAPP_NUMBER nao configurado";
  }
  return null;
}
