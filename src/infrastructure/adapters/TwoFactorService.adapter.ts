import { randomBytes } from "crypto";
import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";
import {
  ITwoFactorService,
  RecoveryCodes,
} from "@src/domain/interfaces/ITwoFactorService";
import { hashToken } from "@src/infrastructure/auth/tokenHash";

const ISSUER = "LeafyMap";
const DEFAULT_RECOVERY_CODE_COUNT = 3;
const TOTP_EPOCH_TOLERANCE_SECONDS = 30;

const normalizeRecoveryCode = (code: string): string =>
  code.toUpperCase().replace(/[^A-Z0-9]/g, "");

class TwoFactorServiceAdapter implements ITwoFactorService {
  generateSecret(): string {
    return generateSecret();
  }

  generateOtpauthUri(account: string, secret: string): string {
    return generateURI({
      issuer: ISSUER,
      label: account,
      secret,
    });
  }

  generateQrDataUrl(otpauthUri: string): Promise<string> {
    return QRCode.toDataURL(otpauthUri);
  }

  verifyTotp(code: string, secret: string): boolean {
    const token = code.replace(/\s/g, "");
    if (!/^\d{6}$/.test(token)) {
      return false;
    }

    try {
      return verifySync({
        secret,
        token,
        epochTolerance: TOTP_EPOCH_TOLERANCE_SECONDS,
      }).valid;
    } catch {
      return false;
    }
  }

  generateRecoveryCodes(
    count: number = DEFAULT_RECOVERY_CODE_COUNT
  ): RecoveryCodes {
    const codes = Array.from({ length: count }, () => {
      const raw = randomBytes(5).toString("hex").toUpperCase();
      return `${raw.slice(0, 5)}-${raw.slice(5)}`;
    });
    return {
      codes,
      hashes: codes.map((code) => this.hashRecoveryCode(code)),
    };
  }

  hashRecoveryCode(code: string): string {
    return hashToken(normalizeRecoveryCode(code));
  }
}

export default TwoFactorServiceAdapter;
