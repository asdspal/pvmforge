// Weight Profiler Engine
// Based on Blueprint §3.3 and RESEARCH.md - Step 2.3

import { encodeFunctionData, type Abi, type AbiFunction } from 'viem';
import { getReviveWeight, type ReviveWeightResult } from '@/lib/rpc/pvm-client';
import { evmClient } from '@/lib/rpc/evm-client';

/**
 * Profile result for a single contract function
 * Contains both PVM weights and EVM gas estimates
 */
export interface ProfileResult {
  function_name: string;
  function_signature: string;
  ref_time: bigint;
  proof_size: bigint;
  storage_deposit: bigint;
  evm_gas_estimate: bigint;
  raw_response: Record<string, unknown>;
}

/**
 * Profile a single contract function using real ReviveApi data
 *
 * This function:
 * 1. Builds calldata with zero-value args for estimation
 * 2. Gets REAL PVM weights via ReviveApi (state_call: ReviveApi_eth_transact_with_config)
 * 3. Gets EVM gas from Sepolia for comparison
 * 4. Returns complete profile with raw_response for debugging
 *
 * CRITICAL: This MUST use real ReviveApi data. DO NOT fake or substitute with multipliers.
 *
 * @param contractAddress - The deployed contract address on PVM
 * @param abi - The contract ABI
 * @param fn - The function to profile
 * @returns ProfileResult with real weight data
 *
 * @throws Error if ReviveApi call fails - errors are NOT silently handled
 */
export async function profileContractFunction(
  contractAddress: `0x${string}`,
  abi: Abi,
  fn: AbiFunction,
): Promise<ProfileResult> {
  // Build calldata with zero-value args for estimation
  const args = fn.inputs.map(() => BigInt(0)) as unknown[];
  const calldata = encodeFunctionData({ abi, functionName: fn.name, args });

  // 1. Get REAL PVM weights via ReviveApi (RESEARCH.md method)
  let ref_time = BigInt(0);
  let proof_size = BigInt(0);
  let storage_deposit = BigInt(0);
  let raw_response: Record<string, unknown> = {};

  try {
    const weights: ReviveWeightResult = await getReviveWeight(contractAddress, calldata);
    ref_time = weights.ref_time;
    proof_size = weights.proof_size;
    storage_deposit = weights.storage_deposit;
    raw_response = {
      ref_time: ref_time.toString(),
      proof_size: proof_size.toString(),
      storage_deposit: storage_deposit.toString(),
      calldata,
      contractAddress,
    };
  } catch (err) {
    // Store error in raw_response for debugging — DO NOT fake the data
    raw_response = {
      error: String(err),
      note: 'ReviveApi call failed — check RESEARCH.md method',
      calldata,
      contractAddress,
    };
    throw new Error(`ReviveApi weight call failed for ${fn.name}: ${err}`);
  }

  // 2. Get EVM gas from Sepolia for comparison
  let evm_gas_estimate = BigInt(0);
  try {
    evm_gas_estimate = await evmClient.estimateGas({
      to: contractAddress,
      data: calldata,
    });
  } catch {
    // EVM estimation can fail if contract not on Sepolia — that's OK
    evm_gas_estimate = BigInt(0);
    raw_response.evm_note = 'EVM gas estimation failed - contract may not be on Sepolia';
  }

  const signature = `${fn.name}(${fn.inputs.map(i => i.type).join(',')})`;

  return {
    function_name: fn.name,
    function_signature: signature,
    ref_time,
    proof_size,
    storage_deposit,
    evm_gas_estimate,
    raw_response,
  };
}

/**
 * Profile all non-view/pure functions in a contract
 *
 * @param contractAddress - The deployed contract address on PVM
 * @param abi - The contract ABI
 * @returns Array of ProfileResult for all mutable functions
 */
export async function profileAllFunctions(
  contractAddress: `0x${string}`,
  abi: Abi,
): Promise<ProfileResult[]> {
  // Filter for mutable functions only (exclude view and pure)
  const functions = abi.filter(
    (item): item is AbiFunction =>
      item.type === 'function' && item.stateMutability !== 'view' && item.stateMutability !== 'pure'
  );
  
  const results: ProfileResult[] = [];

  for (const fn of functions) {
    const result = await profileContractFunction(contractAddress, abi, fn);
    results.push(result);
  }

  return results;
}
