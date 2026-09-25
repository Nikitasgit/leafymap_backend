import dotenv from "dotenv";
import path from "path";

function readTarget(argv: string[]): string | undefined {
  const index = argv.indexOf("--target");
  if (index === -1) {
    return undefined;
  }
  return argv[index + 1];
}

const target = readTarget(process.argv);
const envFile = target === "production" ? ".env.prod" : ".env";
const envPath = path.resolve(__dirname, "../..", envFile);

const result = dotenv.config({
  path: envPath,
  override: true,
});

if (result.error) {
  throw new Error(`Seed requires ${envFile} (${result.error.message}).`);
}

const mongoUri = result.parsed?.MONGO_URI;
if (!mongoUri) {
  throw new Error(`${envFile} must define MONGO_URI.`);
}

process.env.MONGO_URI = mongoUri;
console.log(`Loaded ${envFile}`);
