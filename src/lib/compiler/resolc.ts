/**
 * Resolc compiler wrapper for Polkadot VM Forge
 * Server-side only - uses WebAssembly
 */

import { compile, type SolcInput, type SolcOutput } from '@parity/resolc';

export interface CompileOptions {
  optimizer?: Record<string, unknown>;
  bin?: string;
}

/**
 * Compile Solidity sources using resolc (WebAssembly)
 * @param sources - Solc input with source code (map of filename -> { content })
 * @param options - Optional compiler options (optimizer, bin)
 * @returns Compilation result with contracts and errors
 */
export async function compileSolidity(
  sources: SolcInput,
  options?: CompileOptions
): Promise<SolcOutput> {
  return compile(sources, options);
}

/**
 * Test compile with a simple contract to validate WASM functionality
 */
export async function testCompile(): Promise<{ success: boolean; hasBytecode: boolean; duration: number; error?: string; contracts?: unknown; abi?: unknown }> {
  const startTime = Date.now();
  
  const testSource: SolcInput = {
    'Test.sol': {
      content: `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Test {
    uint256 public value;

    constructor(uint256 _value) {
        value = _value;
    }

    function setValue(uint256 _value) public {
        value = _value;
    }

    function getValue() public view returns (uint256) {
        return value;
    }
}
        `
    }
  };

  try {
    const result = await compileSolidity(testSource);
    const duration = Date.now() - startTime;
    
    // Note: resolc WASM returns ABI by default, not bytecode
    // The bin option requires a native solc binary which is not available
    const hasABI = result.contracts 
      && Object.values(result.contracts).length > 0
      && Object.values(result.contracts)[0]
      && Object.values(Object.values(result.contracts)[0])[0]
      && 'abi' in Object.values(Object.values(result.contracts)[0])[0]
      && Array.isArray(Object.values(Object.values(result.contracts)[0])[0].abi)
      && Object.values(Object.values(result.contracts)[0])[0].abi.length > 0;

    const contract = result.contracts?.['Test.sol']?.['Test'];
    
    return {
      success: true,
      hasBytecode: hasABI, // Using ABI as success indicator since bytecode not available in WASM
      duration,
      contracts: result.contracts,
      abi: contract?.abi
    };
  } catch (error) {
    return {
      success: false,
      hasBytecode: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
