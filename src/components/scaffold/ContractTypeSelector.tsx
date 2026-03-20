import type { ScaffoldConfig } from '@/lib/scaffold/types';

interface ContractTypeSelectorProps {
  value: ScaffoldConfig['contractType'];
  onChange: (value: ScaffoldConfig['contractType']) => void;
}

const CONTRACT_TYPES: { value: ScaffoldConfig['contractType']; label: string; description: string }[] = [
  { value: 'ERC20', label: 'ERC20', description: 'Fungible token standard' },
  { value: 'ERC721', label: 'ERC721', description: 'Non-fungible token (NFT) standard' },
  { value: 'ERC1155', label: 'ERC1155', description: 'Multi-token standard' },
  { value: 'Governor', label: 'Governor', description: 'DAO governance contract' },
  { value: 'Custom', label: 'Custom', description: 'Custom contract template' },
];

export function ContractTypeSelector({ value, onChange }: ContractTypeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Contract Type
      </label>
      <div className="grid grid-cols-1 gap-2">
        {CONTRACT_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={`
              flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all
              ${value === type.value
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-offset-2'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              value === type.value ? 'border-blue-500' : 'border-gray-300'
            }`}>
              {value === type.value && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{type.label}</div>
              <div className="text-sm text-gray-500">{type.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
