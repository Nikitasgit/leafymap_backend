import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { APP_NAME, FRONTEND_URL } from "../utils/constants/common";
import logger from "@/utils/logger";

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
  async sendEmailVerification(email: string, token: string): Promise<void> {
    const mailFrom = process.env.MAIL_FROM;
    if (!mailFrom) {
      throw new Error(
        "Configuration email manquante (SMTP_*, MAIL_FROM)"
      );
    }

    const verificationLink = `${getFrontendUrl()}/auth/verify-email?token=${token}`;
    const subject = `Vérifiez votre adresse email - ${APP_NAME}`; 
    const html = this.getEmailVerificationTemplate(verificationLink);
    const text = `Bonjour,\n\nVeuillez cliquer sur le lien suivant pour vérifier votre adresse email et activer votre compte :\n\n${verificationLink}\n\nCe lien est valide pendant 15 minutes.\n\nSi vous n'avez pas créé de compte, ignorez cet email.\n\nCordialement,\nL'équipe ${APP_NAME}`;

    try {
      const transporter = getTransport();
      await transporter.sendMail({
        from: mailFrom,
        to: email,
        subject,
        html,
        text,
      });
    } catch (error) {
      logger.error("Error sending email verification:", error);
      throw new Error("Erreur lors de l'envoi de l'email de vérification");
    }
  }

  private getEmailVerificationTemplate(verificationLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Vérification de votre email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
            <h1 style="color: #2c3e50; margin-top: 0;">Vérifiez votre adresse email</h1>
            
            <p>Bonjour,</p>
            
            <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email et activer votre compte ${APP_NAME}.</p>
            
            <p style="margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Vérifier mon email
              </a>
            </p>
            
            <p style="color: #7f8c8d; font-size: 14px;">
              Ou copiez ce lien dans votre navigateur :<br>
              <a href="${verificationLink}" style="color: #3498db; word-break: break-all;">${verificationLink}</a>
            </p>
            
            <p style="color: #e74c3c; font-size: 14px; margin-top: 30px;">
              <strong>Important :</strong> Ce lien est valide pendant 15 minutes.
            </p>
            
            <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
              Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">
            
            <p style="color: #95a5a6; font-size: 12px; margin-bottom: 0;">
              Cordialement,<br>
              L'équipe ${APP_NAME}
            </p>
          </div>
        </body>
      </html>
    `;
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const mailFrom = process.env.MAIL_FROM;
    if (!mailFrom) {
      throw new Error(
        "Configuration email manquante (SMTP_*, MAIL_FROM)"
      );
    }

    const resetUrl = `${getFrontendUrl()}/auth/reset-password?token=${token}`;
    const subject = `Réinitialisation de votre mot de passe - ${APP_NAME}`;
    const html = this.getPasswordResetEmailTemplate(resetUrl);
    const text = `Bonjour,\n\nVous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien suivant pour procéder :\n\n${resetUrl}\n\nCe lien est valide pendant 1 heure.\n\nSi vous n'avez pas demandé cette réinitialisation, ignorez cet email.\n\nCordialement,\nL'équipe ${APP_NAME}`;

    try {
      const transporter = getTransport();
      await transporter.sendMail({
        from: mailFrom,
        to: email,
        subject,
        html,
        text,
      });
    } catch (error) {
      logger.error("Error sending password reset email:", error);
      throw new Error(
        "Erreur lors de l'envoi de l'email de réinitialisation"
      );
    }
  }

  private getPasswordResetEmailTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Réinitialisation de votre mot de passe</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
            <h1 style="color: #2c3e50; margin-top: 0;">Réinitialisation de votre mot de passe</h1>
            
            <p>Bonjour,</p>
            
            <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte ${APP_NAME}.</p>
            
            <p style="margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Réinitialiser mon mot de passe
              </a>
            </p>
            
            <p style="color: #7f8c8d; font-size: 14px;">
              Ou copiez ce lien dans votre navigateur :<br>
              <a href="${resetUrl}" style="color: #3498db; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <p style="color: #e74c3c; font-size: 14px; margin-top: 30px;">
              <strong>Important :</strong> Ce lien est valide pendant 1 heure uniquement.
            </p>
            
            <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
              Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe ne sera pas modifié.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">
            
            <p style="color: #95a5a6; font-size: 12px; margin-bottom: 0;">
              Cordialement,<br>
              L'équipe ${APP_NAME}
            </p>
          </div>
        </body>
      </html>
    `;
  }
}

export default EmailService;
