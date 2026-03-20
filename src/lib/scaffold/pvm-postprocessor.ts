/**
 * PVM Post-Processor
 * 
 * Transforms OpenZeppelin-generated Solidity code to be PVM-compatible.
 * This includes:
 * - Normalizing pragma to ^0.8.24 (resolc requirement)
 * - Adding PVM deployment notice comments
 * - Preparing for two-step deployment pattern
 */

export function applyPVMPostProcess(source: string): string {
  let result = source;

  // 1. Ensure pragma solidity ^0.8.24 (resolc requires >= 0.8.x)
  // Matches pragma solidity ^0.8.X where X is any digit
  result = result.replace(
    /pragma solidity \^0\.8\.\d+;/,
    'pragma solidity ^0.8.24;'
  );

  // 2. Add PVM deployment notice comment after SPDX line
  // Matches SPDX license identifier line and adds PVM notice after it
  result = result.replace(
    /(\/\/ SPDX-License-Identifier: .+\n)/,
    '$1// PVM DEPLOYMENT: Use resolc compiler. Two-step: upload code hash first, then instantiate.\n'
  );

  return result;
}
