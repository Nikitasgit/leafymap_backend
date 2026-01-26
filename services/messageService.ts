interface SendPartnershipMessageParams {
  initiatorUsername: string;
  eventName?: string;
  placeLabel: string;
  type: "place" | "event";
}

class MessageService {
  /**
   * Génère le contenu d'un message de partnership
   * @param params - Les paramètres nécessaires pour construire le message
   * @returns Le contenu du message formaté
   */
  sendPartnershipMessage(params: SendPartnershipMessageParams): string {
    const { initiatorUsername, eventName, placeLabel, type } = params;
    if (type === "event" && eventName) {
      return `${initiatorUsername} vous propose de participer à l'événement "${eventName}" au lieu "${placeLabel}".`;
    }
    return `${initiatorUsername} vous propose d'apparaitre comme partenaire actif de son lieu à l'adresse: "${placeLabel}".`;
  }
}

export default MessageService;
