import { generateSolidity } from '@/lib/scaffold/oz-wrapper';

describe('OZ Wizard Wrapper', () => {
  it('generates ERC20 with mintable feature', () => {
    const source = generateSolidity({
      contractType: 'ERC20',
      name: 'MyToken',
      symbol: 'MTK',
      features: { mintable: true, burnable: false, pausable: false, permit: false, votes: false },
      accessControl: 'ownable',
      pvmOptions: { resolcCompatible: true, twoStepDeploy: true, xcmHooks: false },
    });
    expect(source).toContain('function mint');
    expect(source).toContain('ERC20');
  });

  it('generates ERC721', () => {
    const source = generateSolidity({
      contractType: 'ERC721',
      name: 'MyNFT',
      symbol: 'NFT',
      features: { mintable: true, burnable: false, pausable: false, permit: false, votes: false },
      accessControl: 'ownable',
      pvmOptions: { resolcCompatible: true, twoStepDeploy: true, xcmHooks: false },
    });
    expect(source).toContain('ERC721');
  });

  it('generates ERC1155', () => {
    const source = generateSolidity({
      contractType: 'ERC1155',
      name: 'MyMultiToken',
      symbol: 'MTT',
      features: { mintable: true, burnable: false, pausable: false, permit: false, votes: false },
      accessControl: 'ownable',
      pvmOptions: { resolcCompatible: true, twoStepDeploy: true, xcmHooks: false },
    });
    expect(source).toContain('ERC1155');
  });

  it('throws error for unsupported contract type', () => {
    expect(() => {
      generateSolidity({
        contractType: 'Governor',
        name: 'MyGovernor',
        symbol: 'GOV',
        features: { mintable: false, burnable: false, pausable: false, permit: false, votes: false },
        accessControl: 'ownable',
        pvmOptions: { resolcCompatible: true, twoStepDeploy: true, xcmHooks: false },
      });
    }).toThrow('Contract type Governor not yet supported');
  });

  it('generates ERC20 with burnable and pausable features', () => {
    const source = generateSolidity({
      contractType: 'ERC20',
      name: 'BurnableToken',
      symbol: 'BURN',
      features: { mintable: false, burnable: true, pausable: true, permit: false, votes: false },
      accessControl: 'roles',
      pvmOptions: { resolcCompatible: true, twoStepDeploy: true, xcmHooks: false },
    });
    expect(source).toContain('ERC20');
    expect(source).toContain('ERC20Burnable');
    expect(source).toContain('pause');
  });

  it('generates ERC20 with permit and votes features', () => {
    const source = generateSolidity({
      contractType: 'ERC20',
      name: 'VotingToken',
      symbol: 'VOTE',
      features: { mintable: false, burnable: false, pausable: false, permit: true, votes: true },
      accessControl: 'managed',
      pvmOptions: { resolcCompatible: true, twoStepDeploy: true, xcmHooks: false },
    });
    expect(source).toContain('ERC20');
    expect(source).toContain('ERC20Permit');
    expect(source).toContain('ERC20Votes');
  });
});
