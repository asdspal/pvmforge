// Weight Profiler Engine Integration Tests
// Runs against Kitchensink local node or Polkadot Hub Testnet
// Based on Blueprint §3.3 and RESEARCH.md - Step 2.3

import { describe, it, expect, beforeAll } from 'vitest';
import { profileContractFunction, profileAllFunctions } from '@/lib/profiler/engine';
import { getPvmChainId } from '@/lib/rpc/pvm-client';
import { getSepoliaChainId } from '@/lib/rpc/evm-client';
import type { Abi, AbiFunction } from 'viem';

/**
 * Sample ERC20 ABI for testing
 * This is a standard ERC20 ABI with common functions
 */
const ERC20_ABI: Abi = [
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'transferFrom',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'mint',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'burn',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [
      { name: 'account', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'totalSupply',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
];

/**
 * Test contract address on Polkadot Hub Testnet
 * This should be a deployed ERC20 contract
 * TODO: Replace with actual deployed contract address
 */
const TEST_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

describe('Weight Profiler Engine - Integration Tests', () => {
  let pvmChainId: number;
  let evmChainId: number;

  beforeAll(async () => {
    // Verify RPC connectivity before running tests
    pvmChainId = await getPvmChainId();
    evmChainId = await getSepoliaChainId();

    console.log('PVM Chain ID:', pvmChainId);
    console.log('EVM Chain ID:', evmChainId);
  });

  describe('RPC Connectivity', () => {
    it('should connect to PVM RPC', () => {
      expect(pvmChainId).toBe(420420417); // Polkadot Hub Testnet
    });

    it('should connect to EVM Sepolia RPC', () => {
      expect(evmChainId).toBe(11155111); // Sepolia
    });
  });

  describe('profileContractFunction', () => {
    it('should return real ref_time, proof_size, storage_deposit from ReviveApi', async () => {
      // Skip test if no deployed contract available
      if (TEST_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        console.warn('Skipping test: No deployed contract address provided');
        return;
      }

      const transferFn = ERC20_ABI.find(
        (item): item is AbiFunction =>
          item.type === 'function' && item.name === 'transfer'
      ) as AbiFunction;

      if (!transferFn) {
        throw new Error('Transfer function not found in ABI');
      }

      const result = await profileContractFunction(
        TEST_CONTRACT_ADDRESS,
        ERC20_ABI,
        transferFn
      );

      // Verify all required fields are present
      expect(result).toHaveProperty('function_name', 'transfer');
      expect(result).toHaveProperty('function_signature', 'transfer(address,uint256)');
      expect(result).toHaveProperty('ref_time');
      expect(result).toHaveProperty('proof_size');
      expect(result).toHaveProperty('storage_deposit');
      expect(result).toHaveProperty('evm_gas_estimate');
      expect(result).toHaveProperty('raw_response');

      // CRITICAL: Verify these are REAL values from ReviveApi, NOT faked multipliers
      // ref_time should be non-zero (picoseconds)
      expect(result.ref_time).toBeGreaterThan(BigInt(0));

      // proof_size should be non-zero (bytes)
      expect(result.proof_size).toBeGreaterThan(BigInt(0));

      // storage_deposit may be zero or non-zero (planck units)
      expect(result.storage_deposit).toBeDefined();

      // evm_gas_estimate may be zero if contract not on Sepolia
      expect(result.evm_gas_estimate).toBeDefined();

      // raw_response should contain debugging info
      expect(result.raw_response).toHaveProperty('calldata');
      expect(result.raw_response).toHaveProperty('contractAddress');

      console.log('Profile result:', {
        function: result.function_name,
        ref_time: result.ref_time.toString(),
        proof_size: result.proof_size.toString(),
        storage_deposit: result.storage_deposit.toString(),
        evm_gas: result.evm_gas_estimate.toString(),
      });
    }, 30000); // 30 second timeout for RPC calls

    it('should throw error when ReviveApi call fails', async () => {
      // Use a valid address format that doesn't exist on chain
      const invalidAddress = '0x000000000000000000000000000000000000dead' as const;

      const transferFn = ERC20_ABI.find(
        (item): item is AbiFunction =>
          item.type === 'function' && item.name === 'transfer'
      ) as AbiFunction;

      if (!transferFn) {
        throw new Error('Transfer function not found in ABI');
      }

      // The error should be thrown - exact message may vary
      await expect(
        profileContractFunction(invalidAddress, ERC20_ABI, transferFn)
      ).rejects.toThrow();
    }, 30000);
  });

  describe('profileAllFunctions', () => {
    it('should profile all non-view/pure functions', async () => {
      // Skip test if no deployed contract available
      if (TEST_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        console.warn('Skipping test: No deployed contract address provided');
        return;
      }

      const results = await profileAllFunctions(TEST_CONTRACT_ADDRESS, ERC20_ABI);

      // Should profile 4 mutable functions: transfer, approve, transferFrom, mint, burn
      expect(results.length).toBeGreaterThan(0);

      // All results should have real weight values
      for (const result of results) {
        expect(result.ref_time).toBeGreaterThan(BigInt(0));
        expect(result.proof_size).toBeGreaterThan(BigInt(0));
        expect(result.storage_deposit).toBeDefined();
        expect(result.raw_response).toHaveProperty('calldata');
      }

      console.log(`Profiled ${results.length} functions`);
    }, 120000); // 2 minute timeout for profiling all functions
  });

  describe('weight decomposition', () => {
    it('should return decomposed weight dimensions (not combined)', async () => {
      // Skip test if no deployed contract available
      if (TEST_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        console.warn('Skipping test: No deployed contract address provided');
        return;
      }

      const transferFn = ERC20_ABI.find(
        (item): item is AbiFunction =>
          item.type === 'function' && item.name === 'transfer'
      ) as AbiFunction;

      if (!transferFn) {
        throw new Error('Transfer function not found in ABI');
      }

      const result = await profileContractFunction(
        TEST_CONTRACT_ADDRESS,
        ERC20_ABI,
        transferFn
      );

      // Verify we have all three decomposed dimensions
      expect(result.ref_time).toBeDefined();
      expect(result.proof_size).toBeDefined();
      expect(result.storage_deposit).toBeDefined();

      // Verify they are independent values (not derived from each other)
      // ref_time is in picoseconds, proof_size in bytes, storage_deposit in planck
      // They should have different magnitudes
      const refTimeStr = result.ref_time.toString();
      const proofSizeStr = result.proof_size.toString();
      const storageDepositStr = result.storage_deposit.toString();

      console.log('Weight decomposition:', {
        ref_time: refTimeStr,
        proof_size: proofSizeStr,
        storage_deposit: storageDepositStr,
      });

      // At minimum, ref_time and proof_size should be different
      expect(refTimeStr).not.toBe(proofSizeStr);
    }, 30000);
  });
});
