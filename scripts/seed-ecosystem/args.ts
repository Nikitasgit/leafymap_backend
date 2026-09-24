import {
  DEFAULT_EVENT_COUNT,
  DEFAULT_USER_COUNT,
} from "./config";
import type { SeedCliOptions, SeedTarget } from "./types";

const USAGE = `Usage:
  npm run seed:ecosystem -- --target local|staging|production [options]

Options:
  --target local|staging|production   Required. local = localhost/docker Mongo, staging = Atlas staging, production = Atlas prod
  --confirm staging                   Required with --target staging
  --confirm production                Required with --target production
  --reset                             Delete previous @leafymap.seed data (and S3 images/seed/) first
  --skip-images                       Skip S3 uploads (no profile/event photos)
  --users <n>                         User count (default ${DEFAULT_USER_COUNT})
  --events <n>                        Event count (default ${DEFAULT_EVENT_COUNT})

Examples:
  npm run seed:ecosystem -- --target local --reset
  npm run seed:ecosystem -- --target staging --confirm staging --reset
  npm run seed:ecosystem -- --target production --confirm production --reset
  npm run seed:ecosystem -- --target local --skip-images --users 50 --events 200
`;

function readFlagValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }
  return args[index + 1];
}

function parsePositiveInt(value: string | undefined, fallback: number, name: string): number {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer (got "${value}")`);
  }
  return parsed;
}

export function parseArgs(argv: string[]): SeedCliOptions {
  const args = argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(USAGE);
    process.exit(0);
  }

  const targetRaw = readFlagValue(args, "--target");
  if (
    targetRaw !== "local" &&
    targetRaw !== "staging" &&
    targetRaw !== "production"
  ) {
    throw new Error(`--target is required.\n\n${USAGE}`);
  }
  const target: SeedTarget = targetRaw;

  const confirmValue = readFlagValue(args, "--confirm");
  const confirmStaging =
    args.includes("--confirm") && confirmValue === "staging";
  const confirmProduction =
    args.includes("--confirm") && confirmValue === "production";

  if (target === "staging" && !confirmStaging) {
    throw new Error(
      "Staging seed requires `--confirm staging` so it cannot run by accident.\n\n" +
        USAGE
    );
  }

  if (target === "production" && !confirmProduction) {
    throw new Error(
      "Production seed requires `--confirm production` so it cannot run by accident.\n\n" +
        USAGE
    );
  }

  return {
    target,
    confirmStaging,
    confirmProduction,
    reset: args.includes("--reset"),
    skipImages: args.includes("--skip-images"),
    userCount: parsePositiveInt(
      readFlagValue(args, "--users"),
      DEFAULT_USER_COUNT,
      "--users"
    ),
    eventCount: parsePositiveInt(
      readFlagValue(args, "--events"),
      DEFAULT_EVENT_COUNT,
      "--events"
    ),
  };
}

export { USAGE };
