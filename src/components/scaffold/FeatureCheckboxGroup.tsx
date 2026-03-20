import type { ScaffoldConfig } from '@/lib/scaffold/types';

interface FeatureCheckboxGroupProps {
  value: ScaffoldConfig['features'];
  onChange: (features: ScaffoldConfig['features']) => void;
}

const FEATURES: { key: keyof ScaffoldConfig['features']; label: string; description: string }[] = [
  { key: 'mintable', label: 'Mintable', description: 'Allow minting new tokens' },
  { key: 'burnable', label: 'Burnable', description: 'Allow burning tokens' },
  { key: 'pausable', label: 'Pausable', description: 'Allow pausing transfers' },
  { key: 'permit', label: 'Permit', description: 'EIP-2612 gasless approvals' },
  { key: 'votes', label: 'Votes', description: 'ERC-20/721 voting extensions' },
];

export function FeatureCheckboxGroup({ value, onChange }: FeatureCheckboxGroupProps) {
  const handleToggle = (key: keyof ScaffoldConfig['features']) => {
    onChange({
      ...value,
      [key]: !value[key],
    });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Features
      </label>
      <div className="space-y-2">
        {FEATURES.map((feature) => (
          <label
            key={feature.key}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={value[feature.key]}
              onChange={() => handleToggle(feature.key)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{feature.label}</div>
              <div className="text-sm text-gray-500">{feature.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
