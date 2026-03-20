// Chain configuration for PVM Forge
// Based on RESEARCH.md

export const CHAIN_CONFIG = {
  // Polkadot Hub Testnet
  polkadotHub: {
    name: 'Polkadot Hub Testnet',
    chainId: 420420417,
    chainIdHex: '0x190f1b41',
    rpcUrl: 'https://services.polkadothub-rpc.com/testnet',
  },
  
  // Local Development Node
  localDev: {
    name: 'Local Development',
    chainId: 0, // Dev chain uses chain ID 0
    chainIdHex: '0x0',
    rpcUrl: 'http://localhost:9944',
  },
} as const;

export type ChainKey = keyof typeof CHAIN_CONFIG;
export type ChainConfig = typeof CHAIN_CONFIG[ChainKey];

export function getChainConfig(key: ChainKey): ChainConfig {
  return CHAIN_CONFIG[key];
}
