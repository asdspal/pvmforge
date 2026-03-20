export interface ScaffoldConfig {
  contractType: 'ERC20' | 'ERC721' | 'ERC1155' | 'Governor' | 'Custom';
  name: string;
  symbol: string;
  features: {
    mintable: boolean;
    burnable: boolean;
    pausable: boolean;
    permit: boolean;
    votes: boolean;
  };
  accessControl: 'ownable' | 'roles' | 'managed';
  pvmOptions: {
    resolcCompatible: boolean;
    twoStepDeploy: boolean;
    xcmHooks: boolean;
  };
}

export interface AnalysisIssue {
  severity: 'error' | 'warning' | 'info';
  code: string; // PVM_E001, PVM_W001, etc.
  message: string;
  docs: string;
}

export interface ScaffoldResult {
  source: string;
  issues: AnalysisIssue[];
  compiledBlob: string;
  abi: unknown[];
  files: {
    contract: string;
    hardhatConfig: string;
    deployScript: string;
    readme: string;
  };
}
