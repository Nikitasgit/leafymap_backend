import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer | null = null;

export const connectMongo = async (): Promise<void> => {
  // --nounixsocket: avoids binding a unix socket in /tmp, which is
  // forbidden in some sandboxed environments (CI, macOS seatbelt).
  mongoServer = await MongoMemoryServer.create({
    instance: { args: ["--nounixsocket"] },
  });
  await mongoose.connect(mongoServer.getUri());
};

export const disconnectMongo = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
};

type ClearableModel = {
  deleteMany: (filter?: object) => Promise<unknown>;
};

export const clearCollection = async (model: ClearableModel): Promise<void> => {
  await model.deleteMany({});
};
