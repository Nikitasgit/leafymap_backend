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
  override: target === "production",
});

if (target === "production" && result.error) {
  throw new Error(
    `Production seed requires ${envPath} (${result.error.message}).`
  );
}

if (target === "production") {
  const parsed = result.parsed ?? {};
  if (!parsed.MONGODB_URI && parsed.MONGO_URI) {
    process.env.MONGODB_URI = parsed.MONGO_URI;
  }
}

if (target === "production") {
  console.log(`Loaded ${envFile}`);
}
