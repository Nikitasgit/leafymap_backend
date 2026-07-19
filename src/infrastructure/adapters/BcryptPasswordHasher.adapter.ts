import { IPasswordHasher } from "@src/domain/interfaces/IPasswordHasher";
import bcrypt from "bcrypt";

const BCRYPT_ROUNDS = 10;

class BcryptPasswordHasherAdapter implements IPasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
  }

  async compare(plainPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, passwordHash);
  }
}

export default BcryptPasswordHasherAdapter;
