import { IUser } from "../models/User";
import { File } from "multer";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      file?: {
        location: string;
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        bucket: string;
        key: string;
        acl: string;
        contentType: string;
        contentDisposition: string;
        storageClass: string;
        serverSideEncryption: string;
        metadata: any;
        [key: string]: any;
      };
    }
  }
}

declare module "multer" {
  interface File {
    location: string;
  }
}
