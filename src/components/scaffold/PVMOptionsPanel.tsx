import type { ScaffoldConfig } from '@/lib/scaffold/types';

interface PVMOptionsPanelProps {
  value: ScaffoldConfig['pvmOptions'];
  onChange: (options: ScaffoldConfig['pvmOptions']) => void;
}

const PVM_OPTIONS: { key: keyof ScaffoldConfig['pvmOptions']; label: string; description: string }[] = [
  { 
    key: 'resolcCompatible', 
    label: 'Resolc Compatible', 
    description: 'Generate code compatible with Polkadot resolc compiler' 
  },
  { 
    key: 'twoStepDeploy', 
    label: 'Two-Step Deploy', 
    description: 'Use two-step deployment pattern for PVM' 
  },
  { 
    key: 'xcmHooks', 
    label: 'XCM Hooks', 
    description: 'Add XCM cross-chain message hooks' 
  },
];

export function PVMOptionsPanel({ value, onChange }: PVMOptionsPanelProps) {
  const handleToggle = (key: keyof ScaffoldConfig['pvmOptions']) => {
    onChange({
      ...value,
      [key]: !value[key],
    });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        PVM Options
      </h3>
      <div className="space-y-2">
        {PVM_OPTIONS.map((option) => (
          <label
            key={option.key}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={value[option.key]}
              onChange={() => handleToggle(option.key)}
              className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{option.label}</div>
              <div className="text-sm text-gray-500">{option.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
