import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { FRONTEND_URL } from "../utils/constants/common";
import logger from "@/utils/logger";
import { NotificationActionType } from "@/types/models/notification";
import {
  buildEmailVerificationTemplate,
  buildNotificationEmailTemplate,
  buildPasswordResetEmailTemplate,
} from "@/services/emailTemplates";

interface NotificationEmailParams {
  email: string;
  action: NotificationActionType;
  senderName?: string;
}

function getTransport(): Transporter {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error(
      "Configuration email manquante (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM)"
    );
  }

  const portNum = parseInt(port, 10);
  const isDev = process.env.NODE_ENV === "development";
  return nodemailer.createTransport({
    host,
    port: portNum,
    secure: portNum === 465,
    auth: { user, pass },
    ...(isDev && {
      tls: { rejectUnauthorized: false },
    }),
  });
}

function getFrontendUrl(): string {
  const url = FRONTEND_URL;
  if (!url) {
    throw new Error("FRONTEND_URL is not configured");
  }
  return url.replace(/\/$/, "");
}

class EmailService {
  async sendNotificationEmail({
    email,
    action,
    senderName,
  }: NotificationEmailParams): Promise<void> {
    const mailFrom = process.env.MAIL_FROM;
    if (!mailFrom) {
      throw new Error(
        "Configuration email manquante (SMTP_*, MAIL_FROM)"
      );
    }

    const accountUrl = `${getFrontendUrl()}/account`;
    const template = buildNotificationEmailTemplate({
      action,
      senderName,
      accountUrl,
    });

    try {
      const transporter = getTransport();
      await transporter.sendMail({
        from: mailFrom,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (error) {
      logger.error("Error sending notification email:", error);
      throw new Error("Erreur lors de l'envoi de l'email de notification");
    }
  }

  async sendEmailVerification(email: string, token: string): Promise<void> {
    const mailFrom = process.env.MAIL_FROM;
    if (!mailFrom) {
      throw new Error(
        "Configuration email manquante (SMTP_*, MAIL_FROM)"
      );
    }

    const verificationLink = `${getFrontendUrl()}/auth/verify-email?token=${token}`;
    const template = buildEmailVerificationTemplate(verificationLink);

    try {
      const transporter = getTransport();
      await transporter.sendMail({
        from: mailFrom,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (error) {
      logger.error("Error sending email verification:", error);
      throw new Error("Erreur lors de l'envoi de l'email de vérification");
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const mailFrom = process.env.MAIL_FROM;
    if (!mailFrom) {
      throw new Error(
        "Configuration email manquante (SMTP_*, MAIL_FROM)"
      );
    }

    const resetUrl = `${getFrontendUrl()}/auth/reset-password?token=${token}`;
    const template = buildPasswordResetEmailTemplate(resetUrl);

    try {
      const transporter = getTransport();
      await transporter.sendMail({
        from: mailFrom,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (error) {
      logger.error("Error sending password reset email:", error);
      throw new Error(
        "Erreur lors de l'envoi de l'email de réinitialisation"
      );
    }
  }
}

export default EmailService;
