'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SessionMetaHeader } from '@/components/profiler/SessionMetaHeader';
import { WeightStackedBarChart, WeightChartData } from '@/components/profiler/WeightStackedBarChart';
import { EVMComparisonChart, EVMComparisonChartData } from '@/components/profiler/EVMComparisonChart';
import { WeightResultsTable, WeightResult } from '@/components/profiler/WeightResultsTable';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProfileResponse {
  sessionId: string;
  contractAddress: string;
  network: string;
  status: 'pending' | 'complete' | 'failed';
  results?: WeightResult[];
  errors?: Array<{ message: string }>;
}

export default function ProfilerResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [data, setData] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/v1/profile/${sessionId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.errors?.[0]?.message || 'Failed to fetch results');
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [sessionId]);

  // Transform data for WeightStackedBarChart
  const getWeightChartData = (): WeightChartData[] => {
    if (!data?.results) return [];
    return data.results.map((result) => ({
      functionName: result.functionName,
      refTime: result.pvm.refTime,
      proofSize: result.pvm.proofSize,
      storageDeposit: result.pvm.storageDeposit,
    }));
  };

  // Transform data for EVMComparisonChart (normalize to percentages)
  const getEVMComparisonChartData = (): EVMComparisonChartData[] => {
    if (!data?.results) return [];

    // Find max values for normalization
    const maxRefTime = Math.max(...data.results.map((r) => r.pvm.refTime), 1);
    const maxEvmGas = Math.max(...data.results.map((r) => r.evmGasEstimate), 1);

    return data.results.map((result) => ({
      functionName: result.functionName,
      pvmPercentage: (result.pvm.refTime / maxRefTime) * 100,
      evmPercentage: (result.evmGasEstimate / maxEvmGas) * 100,
      refTime: result.pvm.refTime,
      evmGas: result.evmGasEstimate,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700 dark:text-gray-300">Loading profiler results...</p>
        </div>
      </div>
    );
  }

  if (error || data?.status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Profiling Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            {error || data?.errors?.[0]?.message || 'An unknown error occurred'}
          </p>
          <div className="space-y-3">
            <Link
              href="/profiler"
              className="block w-full text-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Try Another Contract
            </Link>
            <button
              onClick={() => router.back()}
              className="block w-full text-center px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.results || data.results.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
            No Results Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            No profiling results are available for this session.
          </p>
          <Link
            href="/profiler"
            className="block w-full text-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Profile Another Contract
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/profiler"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profiler
          </Link>
        </div>

        {/* Session Header */}
        <div className="mb-8">
          <SessionMetaHeader
            sessionId={data.sessionId}
            contractAddress={data.contractAddress}
            network={data.network}
            status={data.status}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weight Stacked Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              PVM Weight Breakdown
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Stacked view of ref time, proof size, and storage deposit for each function
            </p>
            <WeightStackedBarChart data={getWeightChartData()} />
          </div>

          {/* EVM Comparison Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              PVM vs EVM Comparison
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Normalized percentage comparison between PVM ref time and EVM gas estimates
            </p>
            <EVMComparisonChart data={getEVMComparisonChartData()} />
          </div>
        </div>

        {/* Results Table */}
        <div className="mb-8">
          <WeightResultsTable results={data.results} />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Session ID: {data.sessionId}</p>
        </div>
      </div>
    </div>
  );
}
