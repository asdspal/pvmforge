'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, Loader2 } from 'lucide-react';
import type { ScaffoldConfig } from '@/lib/scaffold/types';
import { ContractTypeSelector } from './ContractTypeSelector';
import { FeatureCheckboxGroup } from './FeatureCheckboxGroup';
import { PVMOptionsPanel } from './PVMOptionsPanel';

const scaffoldConfigSchema = z.object({
  contractType: z.enum(['ERC20', 'ERC721', 'ERC1155', 'Governor', 'Custom']),
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  symbol: z.string().min(1, 'Symbol is required').max(11, 'Symbol must be 11 characters or less'),
  features: z.object({
    mintable: z.boolean(),
    burnable: z.boolean(),
    pausable: z.boolean(),
    permit: z.boolean(),
    votes: z.boolean(),
  }),
  accessControl: z.enum(['ownable', 'roles', 'managed']),
  pvmOptions: z.object({
    resolcCompatible: z.boolean(),
    twoStepDeploy: z.boolean(),
    xcmHooks: z.boolean(),
  }),
});

type ScaffoldConfigFormData = z.infer<typeof scaffoldConfigSchema>;

interface ConfigFormProps {
  onSubmit: (config: ScaffoldConfig) => void;
  isLoading: boolean;
}

const ACCESS_CONTROL_OPTIONS = [
  { value: 'ownable' as const, label: 'Ownable', description: 'Single owner controls the contract' },
  { value: 'roles' as const, label: 'Roles', description: 'Role-based access control' },
  { value: 'managed' as const, label: 'Managed', description: 'Managed by a trusted party' },
];

export function ConfigForm({ onSubmit, isLoading }: ConfigFormProps) {
  const [contractType, setContractType] = useState<ScaffoldConfig['contractType']>('ERC20');
  const [features, setFeatures] = useState<ScaffoldConfig['features']>({
    mintable: true,
    burnable: false,
    pausable: false,
    permit: false,
    votes: false,
  });
  const [pvmOptions, setPvmOptions] = useState<ScaffoldConfig['pvmOptions']>({
    resolcCompatible: true,
    twoStepDeploy: true,
    xcmHooks: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScaffoldConfigFormData>({
    resolver: zodResolver(scaffoldConfigSchema),
    defaultValues: {
      contractType: 'ERC20',
      name: '',
      symbol: '',
      features,
      accessControl: 'ownable',
      pvmOptions,
    },
  });

  const handleFormSubmit = (data: ScaffoldConfigFormData) => {
    onSubmit({
      ...data,
      contractType,
      features,
      pvmOptions,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Contract Configuration</h2>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <ContractTypeSelector value={contractType} onChange={setContractType} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Token Name
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              placeholder="My Token"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
              Symbol
            </label>
            <input
              id="symbol"
              type="text"
              {...register('symbol')}
              placeholder="MTK"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase"
            />
            {errors.symbol && (
              <p className="mt-1 text-sm text-red-600">{errors.symbol.message}</p>
            )}
          </div>
        </div>

        <FeatureCheckboxGroup value={features} onChange={setFeatures} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Access Control
          </label>
          <div className="grid grid-cols-1 gap-2">
            {ACCESS_CONTROL_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  {...register('accessControl')}
                  value={option.value}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.accessControl && (
            <p className="mt-1 text-sm text-red-600">{errors.accessControl.message}</p>
          )}
        </div>

        <PVMOptionsPanel value={pvmOptions} onChange={setPvmOptions} />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Contract
            </>
          )}
        </button>
      </form>
    </div>
  );
}
