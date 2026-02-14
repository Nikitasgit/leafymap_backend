import { OAuth2Client } from "google-auth-library";

const GOOGLE_PICTURE_HIGH_RES_SIZE = 400;

function toHighResGooglePictureUrl(url: string | undefined): string | undefined {
  if (!url || !url.includes("googleusercontent.com")) return url;
  const highResParam = `=s${GOOGLE_PICTURE_HIGH_RES_SIZE}-c`;
  if (url.includes("=s")) {
    return url.replace(/=s\d+-c?=?.*$/, highResParam);
  }
  return `${url.replace(/=.*$/, "")}${highResParam}`;
}

export interface GoogleTokenPayload {
  email: string;
  sub: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export async function verifyGoogleIdToken(
  idToken: string
): Promise<GoogleTokenPayload> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }
  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error("Invalid Google token: missing email");
  }

  return {
    email: payload.email,
    sub: payload.sub,
    email_verified: payload.email_verified,
    name: payload.name,
    picture: toHighResGooglePictureUrl(payload.picture),
    given_name: payload.given_name,
    family_name: payload.family_name,
  };
}
