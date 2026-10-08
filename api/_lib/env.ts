/**
 * Horizon Serverless Environment Validator
 * Zod-validated server-side environment for Vercel Functions.
 * Fails fast with clear descriptive error if any required server secret is missing.
 */
import { z } from 'zod';

const serverEnvSchema = z.object({
  // Firebase Admin / Service
  FIREBASE_DATABASE_URL: z.string().url().default('https://horizon-1ba53-default-rtdb.firebaseio.com'),
  FIREBASE_PROJECT_ID: z.string().default('horizon-1ba53'),

  // Sarvam AI
  SARVAM_API_KEY: z.string().min(1, 'SARVAM_API_KEY is required on server'),
  SARVAM_BASE_URL: z.string().url().default('https://api.sarvam.ai'),
  SARVAM_MODEL: z.string().default('sarvam-105b'),

  // MST Blockchain Testnet
  MST_TESTNET_RPC: z.string().url().default('https://testnetrpc.mstblockchain.com'),
  CHAIN_ID: z.coerce.number().int().default(91562037),
  AUTHORIZED_WALLETS: z.string().min(1, 'AUTHORIZED_WALLETS is required'),
  OPERATOR_PRIVATE_KEY: z.string().optional(),
  MIN_BALANCE: z.coerce.number().positive().default(0.1),

  // Engine & Security
  TICK_SECRET: z.string().default('horizon-resilience-sec-2026'),
  DEMO_MODE: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  ENVIRONMENT: z.string().default('production'),
});

const parseServerEnv = () => {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => ` - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`[Horizon Server Fatal] Missing or invalid server environment variables:\n${issues}`);
  }

  const authorizedList = result.data.AUTHORIZED_WALLETS
    .split(',')
    .map((addr) => addr.trim())
    .filter(Boolean);

  return {
    ...result.data,
    AUTHORIZED_WALLETS_LIST: authorizedList,
  };
};

export const serverEnv = parseServerEnv();
