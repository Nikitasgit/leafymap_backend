export interface IAuthEmailSender {
  sendEmailVerification(email: string, token: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
}
