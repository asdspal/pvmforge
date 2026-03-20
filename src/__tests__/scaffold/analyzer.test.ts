import { describe, it, expect } from 'vitest';
import { analyzePVMCompatibility } from '../../lib/scaffold/analyzer';

describe('analyzePVMCompatibility', () => {
  describe('PVM_E001: EIP-1167 Minimal Proxy', () => {
    it('should detect ERC1967Proxy pattern', () => {
      const source = `
        import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
        contract MyProxy is ERC1967Proxy {}
      `;
      const issues = analyzePVMCompatibility(source);
      const eip1167Issue = issues.find(i => i.code === 'PVM_E001');
      expect(eip1167Issue).toBeDefined();
      expect(eip1167Issue?.severity).toBe('error');
    });

    it('should not flag clean code without proxy patterns', () => {
      const source = `
        contract SimpleContract {
          uint256 public value;
          function setValue(uint256 _value) public {
            value = _value;
          }
        }
      `;
      const issues = analyzePVMCompatibility(source);
      const eip1167Issue = issues.find(i => i.code === 'PVM_E001');
      expect(eip1167Issue).toBeUndefined();
    });
  });

  describe('PVM_E002: create/create2 in YUL assembly', () => {
    it('should detect create opcode in assembly block', () => {
      const source = `
        contract Factory {
          function deploy() public returns (address) {
            bytes memory bytecode = hex"6060604052";
            address addr;
            assembly {
              addr := create(0, add(bytecode, 0x20), mload(bytecode))
            }
            return addr;
          }
        }
      `;
      const issues = analyzePVMCompatibility(source);
      const createIssue = issues.find(i => i.code === 'PVM_E002');
      expect(createIssue).toBeDefined();
      expect(createIssue?.severity).toBe('error');
    });

    it('should not flag clean code without assembly create', () => {
      const source = `
        contract Factory {
          function deploy() public returns (address) {
            return address(new SimpleContract());
          }
        }
        contract SimpleContract {}
      `;
      const issues = analyzePVMCompatibility(source);
      const createIssue = issues.find(i => i.code === 'PVM_E002');
      expect(createIssue).toBeUndefined();
    });
  });

  describe('PVM_W001: EXTCODECOPY', () => {
    it('should detect EXTCODECOPY opcode', () => {
      const source = `
        contract CodeReader {
          function readCode(address target) public view returns (bytes memory) {
            bytes memory code;
            assembly {
              extcodecopy(target, add(code, 0x20), 0, 32)
            }
            return code;
          }
        }
      `;
      const issues = analyzePVMCompatibility(source);
      const extcodecopyIssue = issues.find(i => i.code === 'PVM_W001');
      expect(extcodecopyIssue).toBeDefined();
      expect(extcodecopyIssue?.severity).toBe('warning');
    });

    it('should not flag clean code without EXTCODECOPY', () => {
      const source = `
        contract SimpleContract {
          function readAddress(address target) public view returns (address) {
            return target;
          }
        }
      `;
      const issues = analyzePVMCompatibility(source);
      const extcodecopyIssue = issues.find(i => i.code === 'PVM_W001');
      expect(extcodecopyIssue).toBeUndefined();
    });
  });

  describe('PVM_W002: 64KB memory heuristic', () => {
    it('should warn about complex contracts with many mappings and arrays', () => {
      const source = `
        contract ComplexContract {
          mapping(address => uint256) map1;
          mapping(address => uint256) map2;
          mapping(address => uint256) map3;
          mapping(address => uint256) map4;
          mapping(address => uint256) map5;
          mapping(address => uint256) map6;
          mapping(address => uint256) map7;
          mapping(address => uint256) map8;
          uint256[] array1;
          uint256[] array2;
        }
      `;
      const issues = analyzePVMCompatibility(source);
      const memoryIssue = issues.find(i => i.code === 'PVM_W002');
      expect(memoryIssue).toBeDefined();
      expect(memoryIssue?.severity).toBe('warning');
      expect(memoryIssue?.message).toContain('8 mappings');
      expect(memoryIssue?.message).toContain('2 arrays');
    });

    it('should not warn about simple contracts with few mappings/arrays', () => {
      const source = `
        contract SimpleContract {
          mapping(address => uint256) balances;
          mapping(address => uint256) allowances;
          uint256[] public amounts;
        }
      `;
      const issues = analyzePVMCompatibility(source);
      const memoryIssue = issues.find(i => i.code === 'PVM_W002');
      expect(memoryIssue).toBeUndefined();
    });
  });

  describe('PVM_I001: Two-step deployment info', () => {
    it('should always include two-step deployment info', () => {
      const source = 'contract Empty {}';
      const issues = analyzePVMCompatibility(source);
      const infoIssue = issues.find(i => i.code === 'PVM_I001');
      expect(infoIssue).toBeDefined();
      expect(infoIssue?.severity).toBe('info');
      expect(infoIssue?.message).toContain('Two-step deployment');
    });
  });
});
