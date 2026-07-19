import { APP_NAME } from "@src/shared/constants/common";
import { NotificationAction } from "@src/domain/value-objects/NotificationAction.vo";

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface NotificationEmailTemplateParams {
  action: NotificationAction;
  senderName?: string;
  accountUrl: string;
}

interface NotificationEmailContent {
  subject: string;
  title: string;
  body: string;
}

function getProductTagline(): string {
  return `${APP_NAME} — découvrez les événements locaux autour de vous`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getNotificationEmailContent(
  action: NotificationAction,
  senderName: string
): NotificationEmailContent {
  const actor = escapeHtml(senderName);
  const contents: Record<NotificationAction, NotificationEmailContent> = {
    message: {
      subject: `Nouveau message - ${APP_NAME}`,
      title: "Vous avez reçu un nouveau message",
      body: `${actor} vous a envoyé un message.`,
    },
    partnership_invitation: {
      subject: `Nouvelle demande de collaboration - ${APP_NAME}`,
      title: "Vous avez reçu une demande de collaboration",
      body: `${actor} souhaite collaborer avec vous.`,
    },
    partnership_accepted: {
      subject: `Collaboration acceptée - ${APP_NAME}`,
      title: "Votre collaboration a été acceptée",
      body: `${actor} a accepté votre demande de collaboration.`,
    },
    event_invitation: {
      subject: `Invitation à un événement - ${APP_NAME}`,
      title: "Vous avez reçu une invitation à un événement",
      body: `${actor} vous invite à participer à un événement.`,
    },
    event_accepted: {
      subject: `Invitation acceptée - ${APP_NAME}`,
      title: "Votre invitation a été acceptée",
      body: `${actor} a accepté votre invitation à un événement.`,
    },
    event_refused: {
      subject: `Invitation refusée - ${APP_NAME}`,
      title: "Votre invitation a été refusée",
      body: `${actor} a refusé votre invitation à un événement.`,
    },
    event_booking_cancelled: {
      subject: `Réservation annulée - ${APP_NAME}`,
      title: "Votre réservation a été annulée",
      body: `${actor} a annulé ou modifié votre réservation à un événement.`,
    },
    review: {
      subject: `Nouvel avis - ${APP_NAME}`,
      title: "Vous avez reçu un nouvel avis",
      body: `${actor} a publié un avis.`,
    },
    new_follower: {
      subject: `Nouvel abonné - ${APP_NAME}`,
      title: "Vous avez un nouvel abonné",
      body: `${actor} suit désormais votre activité.`,
    },
    other: {
      subject: `Nouvelle notification - ${APP_NAME}`,
      title: "Vous avez une nouvelle notification",
      body: `${actor} a interagi avec vous sur ${APP_NAME}.`,
    },
  };
  return contents[action] ?? contents.other;
}

function buildNotificationEmailHtml(
  content: NotificationEmailContent,
  accountUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${content.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
          <h1 style="color: #2c3e50; margin-top: 0;">${content.title}</h1>

          <p>Bonjour,</p>
          <p>${content.body}</p>

          <p style="margin: 30px 0;">
            <a href="${accountUrl}"
               style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Voir mes notifications
            </a>
          </p>

          <p style="color: #7f8c8d; font-size: 14px;">
            Ou copiez ce lien dans votre navigateur :<br>
            <a href="${accountUrl}" style="color: #3498db; word-break: break-all;">${accountUrl}</a>
          </p>

          <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">

          <p style="color: #95a5a6; font-size: 12px; margin-bottom: 0;">
            Cordialement,<br>
            L'équipe ${APP_NAME}<br>
            <span style="color: #bdc3c7;">${getProductTagline()}</span>
          </p>
        </div>
      </body>
    </html>
  `;
}

export function buildNotificationEmailTemplate({
  action,
  senderName,
  accountUrl,
}: NotificationEmailTemplateParams): EmailTemplate {
  const safeSenderName = senderName?.trim() || APP_NAME;
  const content = getNotificationEmailContent(action, safeSenderName);
  return {
    subject: content.subject,
    html: buildNotificationEmailHtml(content, accountUrl),
    text: `Bonjour,\n\n${content.body}\n\nConsultez vos notifications : ${accountUrl}\n\nCordialement,\nL'équipe ${APP_NAME}\n${getProductTagline()}`,
  };
}

export function buildEmailVerificationTemplate(
  verificationLink: string
): EmailTemplate {
  return {
    subject: `Vérifiez votre adresse email - ${APP_NAME}`,
    text: `Bonjour,\n\nVeuillez cliquer sur le lien suivant pour vérifier votre adresse email et activer votre compte :\n\n${verificationLink}\n\nCe lien est valide pendant 15 minutes.\n\nSi vous n'avez pas créé de compte, ignorez cet email.\n\nCordialement,\nL'équipe ${APP_NAME}\n${getProductTagline()}`,
    html: `
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
              L'équipe ${APP_NAME}<br>
              <span style="color: #bdc3c7;">${getProductTagline()}</span>
            </p>
          </div>
        </body>
      </html>
    `,
  };
}

export function buildPasswordResetEmailTemplate(
  resetUrl: string
): EmailTemplate {
  return {
    subject: `Réinitialisation de votre mot de passe - ${APP_NAME}`,
    text: `Bonjour,\n\nVous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien suivant pour procéder :\n\n${resetUrl}\n\nCe lien est valide pendant 1 heure.\n\nSi vous n'avez pas demandé cette réinitialisation, ignorez cet email.\n\nCordialement,\nL'équipe ${APP_NAME}\n${getProductTagline()}`,
    html: `
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
              L'équipe ${APP_NAME}<br>
              <span style="color: #bdc3c7;">${getProductTagline()}</span>
            </p>
          </div>
        </body>
      </html>
    `,
  };
}
