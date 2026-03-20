// EVM RPC Client Service for Sepolia
// Based on RESEARCH.md - Step 2.2

import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

// EVM Viem Public Client for Sepolia
// Using public RPC endpoint as fallback (no auth required)
// QuickNode public endpoint for Sepolia
export const evmClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.SEPOLIA_RPC_URL || 'https://sepolia.gateway.tenderly.co'),
});

/**
 * Get the Sepolia chain ID
 * Useful for testing connectivity
 */
export async function getSepoliaChainId(): Promise<number> {
  return evmClient.getChainId();
}
