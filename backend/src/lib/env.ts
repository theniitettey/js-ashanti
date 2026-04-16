import { prisma } from "./prisma";

const REQUIRED_ENV_KEYS = [
  "DATABASE_URL",
  "BETTER_AUTH_URL",
  "ADMIN_ID",
] as const;

type RequiredEnvKey = (typeof REQUIRED_ENV_KEYS)[number];

function getMissingEnvKeys(): RequiredEnvKey[] {
  return REQUIRED_ENV_KEYS.filter((key) => !process.env[key]?.trim());
}

export async function validateRuntimeEnv(): Promise<void> {
  const missing = getMissingEnvKeys();

  if (missing.length > 0) {
    const details = [
      "[Config] Missing required environment variables:",
      ...missing.map((key) => `  - ${key}`),
      '[Config] Copy "backend/.env.example" to "backend/.env" and fill required values.',
    ].join("\n");

    throw new Error(details);
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database connection error";
    throw new Error(
      `[Config] Could not connect to database using DATABASE_URL.\n` +
        `[Config] Confirm your Docker database is running and the connection string is correct.\n` +
        `[Config] Original error: ${message}`
    );
  }
}
