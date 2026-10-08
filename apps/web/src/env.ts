/**
 * Horizon Environment Schema & Runtime Validator
 * Strictly validates all client-facing VITE_* variables using Zod at application startup.
 * Throws an explicit error naming missing variables to prevent silent runtime failures.
 */
import { z } from 'zod';

const clientEnvSchema = z.object({
  // Firebase Web Config
  VITE_FIREBASE_API_KEY: z.string().min(1, 'VITE_FIREBASE_API_KEY is required'),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'VITE_FIREBASE_AUTH_DOMAIN is required'),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1, 'VITE_FIREBASE_PROJECT_ID is required'),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'VITE_FIREBASE_STORAGE_BUCKET is required'),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'VITE_FIREBASE_MESSAGING_SENDER_ID is required'),
  VITE_FIREBASE_APP_ID: z.string().min(1, 'VITE_FIREBASE_APP_ID is required'),
  VITE_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  VITE_FIREBASE_DATABASE_URL: z.string().url('VITE_FIREBASE_DATABASE_URL must be a valid URL'),

  // MST Blockchain Testnet
  VITE_MST_TESTNET_RPC: z.string().url('VITE_MST_TESTNET_RPC must be a valid RPC URL'),
  VITE_MST_CHAIN_ID: z.coerce.number().int().positive('VITE_MST_CHAIN_ID must be a positive integer'),
  VITE_AUTHORIZED_WALLETS: z.string().min(1, 'VITE_AUTHORIZED_WALLETS is required'),
  VITE_OPERATOR_PRIVATE_KEY: z.string().optional(),
  VITE_MIN_BALANCE: z.coerce.number().positive().default(0.1),

  // Sarvam AI Intelligent Copilot
  VITE_SARVAM_API_KEY: z.string().min(1, 'VITE_SARVAM_API_KEY is required'),
  VITE_SARVAM_BASE_URL: z.string().url().default('https://api.sarvam.ai'),
  VITE_SARVAM_MODEL: z.string().default('sarvam-105b'),

  // Application Settings
  VITE_API_BASE: z.string().default('/api/v1'),
  VITE_DEMO_MODE: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  VITE_ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('production'),

  // Smart Contracts & Explorer on MST Testnet (Chain ID 91562037)
  VITE_MST_EXPLORER_URL: z.string().default('https://testnet.mstscan.com'),
  VITE_NFT_SUBSCRIPTION_CONTRACT: z.string().default('0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7'),
  VITE_AUDIT_VAULT_CONTRACT: z.string().default('0x8192305827361a29384756281938472619284756'),
});

const parseEnv = () => {
  const result = clientEnvSchema.safeParse(import.meta.env);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => ` - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    console.error(`[Horizon Environment Configuration Error]\nMissing or invalid environment variables:\n${issues}`);
    throw new Error(
      `Fatal: Horizon configuration validation failed.\n${issues}\nPlease verify your .env file or Vercel environment settings.`
    );
  }

  const authorizedWallets = result.data.VITE_AUTHORIZED_WALLETS
    .split(',')
    .map((addr) => addr.trim())
    .filter(Boolean);

  return {
    ...result.data,
    AUTHORIZED_WALLETS_LIST: authorizedWallets,
  };
};

export const env = parseEnv();
export type ClientEnv = typeof env;
