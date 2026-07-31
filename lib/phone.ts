/**
 * Numero in formato internazionale per link wa.me (solo cifre, prefisso paese incluso).
 * Il sito è italiano: se il numero non ha già un prefisso paese assume +39. Approssimazione
 * accettabile per un comitato di quartiere locale — non pensata per numeri esteri.
 */
export function toWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, "").replace(/^0039/, "39");
  if (digits.startsWith("39") && digits.length > 10) return digits;
  return `39${digits}`;
}
