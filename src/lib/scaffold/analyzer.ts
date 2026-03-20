import type { AnalysisIssue } from './types';

const DOCS_BASE = 'https://docs.polkadot.com';

export function analyzePVMCompatibility(source: string): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];

  // CHECK 1: EIP-1167 Minimal Proxy
  if (/ERC1967Proxy|Clones\.|MinimalProxy|delegatecall\s*\(/.test(source)) {
    issues.push({
      severity: 'error',
      code: 'PVM_E001',
      message: 'EIP-1167 minimal proxy pattern is not supported on PolkaVM. Avoid Clones library and delegatecall-based proxies.',
      docs: `${DOCS_BASE}/develop/smart-contracts/faqs/`,
    });
  }

  // CHECK 2: create/create2 in inline assembly
  if (/assembly\s*\{[\s\S]*?\b(create|create2)\b[\s\S]*?\}/.test(source)) {
    issues.push({
      severity: 'error',
      code: 'PVM_E002',
      message: 'create/create2 opcodes in YUL assembly blocks fail on PolkaVM. Use the Solidity new keyword or on-chain constructor pattern instead.',
      docs: `${DOCS_BASE}/smart-contracts/for-eth-devs/contract-deployment/`,
    });
  }

  // CHECK 3: EXTCODECOPY
  if (/extcodecopy/i.test(source)) {
    issues.push({
      severity: 'warning',
      code: 'PVM_W001',
      message: 'EXTCODECOPY has limitations on PolkaVM. Runtime code modification patterns are not supported.',
      docs: `${DOCS_BASE}/smart-contracts/for-eth-devs/evm-vs-pvm/`,
    });
  }

  // CHECK 4: 64KB memory heuristic (contracts with many large mappings/arrays)
  const mappingCount = (source.match(/mapping\s*\(/g) || []).length;
  const arrayCount = (source.match(/\[\s*\]/g) || []).length;
  if (mappingCount + arrayCount > 8) {
    issues.push({
      severity: 'warning',
      code: 'PVM_W002',
      message: `Complex contract detected (${mappingCount} mappings, ${arrayCount} arrays). PolkaVM limits heap memory to 64KB per contract. Test on Kitchensink before deployment.`,
      docs: `${DOCS_BASE}/smart-contracts/for-eth-devs/evm-vs-pvm/`,
    });
  }

  // Always add two-step deployment info
  issues.push({
    severity: 'info',
    code: 'PVM_I001',
    message: 'Two-step deployment required on PolkaVM: upload code hash first (eth_sendRawTransaction with deploy), then instantiate.',
    docs: `${DOCS_BASE}/smart-contracts/for-eth-devs/contract-deployment/`,
  });

  return issues;
}
