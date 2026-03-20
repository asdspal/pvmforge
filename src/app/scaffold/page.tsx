'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ConfigForm } from '@/components/scaffold/ConfigForm';
import { OutputPanel } from '@/components/scaffold/OutputPanel';
import { WarningBanner } from '@/components/scaffold/WarningBanner';
import type { ScaffoldConfig, ScaffoldResult } from '@/lib/scaffold/types';

export default function ScaffoldPage() {
  const [result, setResult] = useState<ScaffoldResult | null>(null);
  const [activeTab, setActiveTab] = useState<'contract' | 'hardhatConfig' | 'deployScript' | 'readme'>('contract');

  const mutation = useMutation({
    mutationFn: async (config: ScaffoldConfig) => {
      const response = await fetch('/api/v1/scaffold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.message || 'Failed to generate contract');
      }

      return response.json() as Promise<ScaffoldResult>;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleGenerate = (config: ScaffoldConfig) => {
    mutation.mutate(config);
  };

  const handleCopy = () => {
    if (!result) return;
    
    const content = result.files[activeTab];
    navigator.clipboard.writeText(content);
  };

  const handleDownload = () => {
    if (!result) return;
    
    const content = result.files[activeTab];
    const filename = activeTab === 'contract' 
      ? `${result.files.contract.match(/contract\s+(\w+)/)?.[1] || 'contract'}.sol`
      : activeTab === 'hardhatConfig' 
        ? 'hardhat.config.ts'
        : activeTab === 'deployScript'
          ? 'deploy.ts'
          : 'README.md';
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contract Scaffold Generator</h1>
          <p className="text-gray-600 mt-2">
            Generate PVM-compatible smart contracts with OpenZeppelin Wizard
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panel - Config Form (40%) */}
          <div className="lg:col-span-2">
            <ConfigForm 
              onSubmit={handleGenerate}
              isLoading={mutation.isPending}
            />
          </div>

          {/* Right Panel - Output (60%) */}
          <div className="lg:col-span-3">
            {result && (
              <>
                {result.issues.length > 0 && (
                  <WarningBanner issues={result.issues} />
                )}

                <OutputPanel
                  result={result}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                />
              </>
            )}

            {!result && !mutation.isPending && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Contract Generated Yet</h3>
                <p className="text-gray-600">
                  Configure your contract settings and click Generate to create your smart contract.
                </p>
              </div>
            )}

            {mutation.isPending && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Contract...</h3>
                <p className="text-gray-600">
                  This may take a few moments as we compile your contract.
                </p>
              </div>
            )}

            {mutation.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-medium mb-2">Error</h3>
                <p className="text-red-700">{mutation.error.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
