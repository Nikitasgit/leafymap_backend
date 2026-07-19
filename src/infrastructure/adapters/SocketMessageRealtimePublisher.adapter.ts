import {
  IMessageRealtimePublisher,
  NewMessageRealtimePayload,
} from "@src/domain/interfaces/IMessageRealtimePublisher";
import { ConversationId } from "@src/domain/value-objects/ObjectId.vo";
import { getSocketService } from "@src/infrastructure/realtime/socketInstance";

class SocketMessageRealtimePublisher implements IMessageRealtimePublisher {
  publishNewMessage(
    conversationId: ConversationId,
    message: NewMessageRealtimePayload
  ): void {
    const socketService = getSocketService();
    if (!socketService) {
      return;
    }
    socketService.emitNewMessage(conversationId, message);
  }
}

export default SocketMessageRealtimePublisher;
