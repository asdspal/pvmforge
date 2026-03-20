/**
 * Profiler utility functions
 */

/**
 * Calculate PVM efficiency compared to EVM
 * Returns a descriptive string
 */
export function calculateEfficiency(refTime: bigint | null, evmGas: bigint | null): string {
  if (!refTime || !evmGas || evmGas === BigInt(0)) {
    return 'Unable to compare';
  }

  const refTimeNum = Number(refTime);
  const evmGasNum = Number(evmGas);

  // Simple comparison: lower ref_time is better
  // This is a rough approximation for the MVP
  const ratio = refTimeNum / evmGasNum;

  if (ratio < 0.5) {
    return `${Math.round((1 - ratio) * 100)}% more efficient than EVM`;
  } else if (ratio < 1) {
    return `${Math.round((1 - ratio) * 100)}% more efficient than EVM`;
  } else if (ratio < 1.5) {
    return `${Math.round((ratio - 1) * 100)}% less efficient than EVM`;
  } else {
    return `${Math.round((ratio - 1) * 100)}% less efficient than EVM`;
  }
}
