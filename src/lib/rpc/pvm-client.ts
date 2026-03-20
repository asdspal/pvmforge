// PVM RPC Client Service
// Based on RESEARCH.md - Step 2.2

import { createPublicClient, http } from 'viem';
import { polkadotHubTestnet, polkadotLocal } from '@/lib/chains';

// Environment-based configuration
const isLocal = process.env.NODE_ENV === 'development' && process.env.USE_LOCAL_NODE === 'true';

// PVM Viem Public Client
export const pvmClient = createPublicClient({
  chain: isLocal ? polkadotLocal : polkadotHubTestnet,
  transport: http(isLocal ? 'http://localhost:8545' : process.env.POLKADOT_HUB_TESTNET_RPC || 'https://services.polkadothub-rpc.com/testnet'),
});

/**
 * Weight result from ReviveApi_eth_transact_with_config
 * Based on RESEARCH.md response structure
 */
export interface ReviveWeightResult {
  ref_time: bigint;
  proof_size: bigint;
  storage_deposit: bigint;
}

/**
 * Raw ReviveApi response structure
 * Based on RESEARCH.md: EthTransactInfo { weight_required: Weight { ref_time, proof_size }, storage_deposit, ... }
 */
interface ReviveApiEthTransactInfo {
  weight_required: {
    ref_time: string;
    proof_size: string;
  };
  storage_deposit: string;
  max_storage_deposit?: string;
  eth_gas?: string;
  data?: string;
}

/**
 * DryRunConfig for ReviveApi_eth_transact_with_config
 * Based on RESEARCH.md params: (tx: GenericTransaction, config: DryRunConfig<Moment>)
 */
interface DryRunConfig {
  // Dry run configuration options
  check_who?: boolean;
  storage_limit?: string;
}

/**
 * GenericTransaction structure for SCALE encoding
 */
interface GenericTransaction {
  from: string;
  to: string;
  value?: string;
  data: string;
  gas?: string;
  gasPrice?: string;
}

/**
 * Get weight estimate from ReviveApi
 * Uses the exact method from RESEARCH.md: state_call("ReviveApi_eth_transact_with_config", <SCALE-encoded params>)
 *
 * @param transaction - The transaction to estimate weight for
 * @param config - Optional dry run configuration
 * @returns Weight result with ref_time, proof_size, and storage_deposit
 *
 * @throws Error if RPC call fails or response is malformed
 */
/**
 * Get weight estimate from ReviveApi using contract address and calldata
 * Simplified wrapper for profiler engine - builds transaction internally
 *
 * @param contractAddress - The contract address to call
 * @param calldata - The encoded function call data
 * @returns Weight result with ref_time, proof_size, and storage_deposit
 *
 * @throws Error if RPC call fails or response is malformed
 */
export async function getReviveWeight(
  contractAddress: `0x${string}`,
  calldata: `0x${string}`
): Promise<ReviveWeightResult> {
  // Build a GenericTransaction for the call
  const transaction: GenericTransaction = {
    from: '0x0000000000000000000000000000000000000000', // Zero address for estimation
    to: contractAddress,
    value: '0x0',
    data: calldata,
  };

  // Build SCALE-encoded params for ReviveApi_eth_transact_with_config
  const params = encodeReviveTransactParams(transaction);

  // Call the ReviveApi using the exact method from RESEARCH.md
  const result = await pvmClient.request({
    method: 'state_call' as never,
    params: ['ReviveApi_eth_transact_with_config', params] as never,
  }) as unknown as ReviveApiEthTransactInfo;

  // Parse and return the weight result
  // This MUST return real ref_time, proof_size, storage_deposit
  // DO NOT substitute with multipliers
  return {
    ref_time: BigInt(result.weight_required.ref_time),
    proof_size: BigInt(result.weight_required.proof_size),
    storage_deposit: BigInt(result.storage_deposit),
  };
}

/**
 * Get weight estimate from ReviveApi with full transaction object
 * Advanced usage - allows custom from address and config
 *
 * @param transaction - The transaction to estimate weight for
 * @param config - Optional dry run configuration
 * @returns Weight result with ref_time, proof_size, and storage_deposit
 *
 * @throws Error if RPC call fails or response is malformed
 */
export async function getReviveWeightWithConfig(
  transaction: GenericTransaction,
  config?: DryRunConfig
): Promise<ReviveWeightResult> {
  // Build SCALE-encoded params for ReviveApi_eth_transact_with_config
  // Format: SCALE-encoded tuple of (tx: GenericTransaction, config: DryRunConfig<Moment>)
  const params = encodeReviveTransactParams(transaction, config);

  // Call the ReviveApi using the exact method from RESEARCH.md
  const result = await pvmClient.request({
    method: 'state_call' as never,
    params: ['ReviveApi_eth_transact_with_config', params] as never,
  }) as unknown as ReviveApiEthTransactInfo;

  // Parse and return the weight result
  // This MUST return real ref_time, proof_size, storage_deposit
  // DO NOT substitute with multipliers
  return {
    ref_time: BigInt(result.weight_required.ref_time),
    proof_size: BigInt(result.weight_required.proof_size),
    storage_deposit: BigInt(result.storage_deposit),
  };
}

/**
 * Encode transaction and config into SCALE format for ReviveApi
 * This is a simplified SCALE encoder - in production, use a proper SCALE codec library
 */
function encodeReviveTransactParams(
  transaction: GenericTransaction,
  config?: DryRunConfig
): string {
  // SCALE encode the tuple (tx, config)
  // This is a placeholder - proper SCALE encoding requires a codec library
  // For now, we'll use a JSON representation that the testnet might accept
  // TODO: Implement proper SCALE encoding using @polkadot/util-crypto or similar
  
  const txObj = {
    from: transaction.from,
    to: transaction.to,
    value: transaction.value || '0x0',
    data: transaction.data,
    gas: transaction.gas || '0x0',
    gasPrice: transaction.gasPrice || '0x0',
  };

  const configObj = config || {};

  // Return as hex string (simplified - proper SCALE encoding needed)
  return `0x${Buffer.from(JSON.stringify({ tx: txObj, config: configObj })).toString('hex')}`;
}

/**
 * Get the PVM chain ID
 * Useful for testing connectivity
 */
export async function getPvmChainId(): Promise<number> {
  return pvmClient.getChainId();
}
