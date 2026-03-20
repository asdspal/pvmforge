// Test script for RPC clients
// Tests PVM and EVM client connectivity

import { getPvmChainId } from './src/lib/rpc/pvm-client';
import { getSepoliaChainId } from './src/lib/rpc/evm-client';

async function testPvmClient() {
  console.log('Testing PVM Client...');
  try {
    const chainId = await getPvmChainId();
    console.log('✅ PVM Chain ID:', chainId);
    console.log('   Expected: 420420417 (0x190f1b41)');
    return chainId;
  } catch (error) {
    console.error('❌ PVM Client Error:', error);
    throw error;
  }
}

async function testEvmClient() {
  console.log('\nTesting EVM Client (Sepolia)...');
  try {
    const chainId = await getSepoliaChainId();
    console.log('✅ Sepolia Chain ID:', chainId);
    console.log('   Expected: 11155111');
    return chainId;
  } catch (error) {
    console.error('❌ EVM Client Error:', error);
    throw error;
  }
}

async function main() {
  console.log('=== RPC Client Integration Tests ===\n');

  const pvmChainId = await testPvmClient();
  const evmChainId = await testEvmClient();

  console.log('\n=== Test Summary ===');
  console.log(`PVM Client: ${pvmChainId === 420420417 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`EVM Client: ${evmChainId === 11155111 ? '✅ PASS' : '❌ FAIL'}`);
}

main().catch(console.error);
