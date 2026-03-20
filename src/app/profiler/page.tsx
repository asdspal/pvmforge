'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProfilerPage() {
  const router = useRouter();
  const [contractAddress, setContractAddress] = useState('');
  const [network, setNetwork] = useState('polkadot-hub-testnet');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!contractAddress.trim()) {
      setError('Contract address is required');
      return;
    }

    if (!validateAddress(contractAddress)) {
      setError('Invalid Ethereum address format');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/v1/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractAddress: contractAddress.trim(),
          network,
          abiSource: 'chain',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || 'Failed to profile contract');
      }

      // Redirect to results page
      router.push(`/profiler/${data.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              PVM Weight Profiler
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Analyze smart contract weight metrics across PVM and EVM environments
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contract Address Input */}
                <div>
                  <label
                    htmlFor="contractAddress"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Contract Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="contractAddress"
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                      placeholder="0x..."
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Enter a deployed contract address on the testnet
                  </p>
                </div>

                {/* Network Selection */}
                <div>
                  <label
                    htmlFor="network"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Network
                  </label>
                  <select
                    id="network"
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                    disabled={isSubmitting}
                  >
                    <option value="polkadot-hub-testnet">Polkadot Hub Testnet</option>
                  </select>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Profiling...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      Profile Contract
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Info Section */}
            <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                What the profiler analyzes:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span><strong>Ref Time:</strong> Execution time in picoseconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span><strong>Proof Size:</strong> Memory usage in bytes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  <span><strong>Storage Deposit:</strong> Storage cost in planck</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span><strong>EVM Gas:</strong> Estimated gas units for EVM</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-8 text-center">
            <Link
              href="/scaffold"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Back to Scaffold
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
