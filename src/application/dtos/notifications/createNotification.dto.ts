export interface CreateNotificationInput {
  senderId: string;
  receiverId: string;
  action: string;
  referenceId: string;
  referenceType: string;
}
