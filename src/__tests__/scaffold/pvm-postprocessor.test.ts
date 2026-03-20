import { applyPVMPostProcess } from '@/lib/scaffold/pvm-postprocessor';

describe('PVM Post-Processor', () => {
  it('normalizes pragma to ^0.8.24', () => {
    const input = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Test {}`;

    const result = applyPVMPostProcess(input);

    expect(result).toContain('pragma solidity ^0.8.24;');
    expect(result).not.toContain('pragma solidity ^0.8.0;');
  });

  it('normalizes pragma from ^0.8.20 to ^0.8.24', () => {
    const input = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Test {}`;

    const result = applyPVMPostProcess(input);

    expect(result).toContain('pragma solidity ^0.8.24;');
    expect(result).not.toContain('pragma solidity ^0.8.20;');
  });

  it('injects PVM deployment notice after SPDX line', () => {
    const input = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Test {}`;

    const result = applyPVMPostProcess(input);

    expect(result).toContain('// PVM DEPLOYMENT: Use resolc compiler. Two-step: upload code hash first, then instantiate.');
    // Verify it comes after the SPDX line
    expect(result).toMatch(/\/\/ SPDX-License-Identifier: MIT\n\/\/ PVM DEPLOYMENT:/);
  });

  it('handles different SPDX license identifiers', () => {
    const input = `// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.15;

contract Test {}`;

    const result = applyPVMPostProcess(input);

    expect(result).toContain('// PVM DEPLOYMENT: Use resolc compiler. Two-step: upload code hash first, then instantiate.');
    expect(result).toContain('pragma solidity ^0.8.24;');
  });

  it('preserves contract content after transformations', () => {
    const input = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "MTK") {}
}`;

    const result = applyPVMPostProcess(input);

    expect(result).toContain('import "@openzeppelin/contracts/token/ERC20/ERC20.sol";');
    expect(result).toContain('contract MyToken is ERC20');
    expect(result).toContain('constructor() ERC20("MyToken", "MTK") {}');
  });

  it('handles pragma with no caret (^)', () => {
    const input = `// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

contract Test {}`;

    const result = applyPVMPostProcess(input);

    // Should not match the regex, so pragma remains unchanged
    expect(result).toContain('pragma solidity 0.8.0;');
  });

  it('handles source without SPDX line', () => {
    const input = `pragma solidity ^0.8.0;

contract Test {}`;

    const result = applyPVMPostProcess(input);

    // Pragma should still be updated
    expect(result).toContain('pragma solidity ^0.8.24;');
    // PVM notice should not be added (no SPDX line to match)
    expect(result).not.toContain('// PVM DEPLOYMENT:');
  });

  it('handles empty string input', () => {
    const result = applyPVMPostProcess('');
    expect(result).toBe('');
  });

  it('applies both transformations in correct order', () => {
    const input = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Test {}`;

    const result = applyPVMPostProcess(input);

    // Check both transformations are present
    expect(result).toContain('pragma solidity ^0.8.24;');
    expect(result).toContain('// PVM DEPLOYMENT: Use resolc compiler. Two-step: upload code hash first, then instantiate.');
    
    // Verify order: SPDX -> PVM notice -> pragma
    const lines = result.split('\n');
    const spdxIndex = lines.findIndex(line => line.includes('SPDX-License-Identifier'));
    const pvmIndex = lines.findIndex(line => line.includes('PVM DEPLOYMENT'));
    const pragmaIndex = lines.findIndex(line => line.includes('pragma solidity'));
    
    expect(spdxIndex).toBeLessThan(pvmIndex);
    expect(pvmIndex).toBeLessThan(pragmaIndex);
  });
});
