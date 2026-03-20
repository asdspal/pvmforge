'use client';

import { useState } from 'react';
import { Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface WeightResult {
  functionName: string;
  functionSignature: string;
  pvm: {
    refTime: number;
    proofSize: number;
    storageDeposit: number;
  };
  evmGasEstimate: number;
}

interface WeightResultsTableProps {
  results: WeightResult[];
}

type SortField = 'functionName' | 'refTime' | 'proofSize' | 'storageDeposit' | 'evmGasEstimate';
type SortDirection = 'asc' | 'desc';

export function WeightResultsTable({ results }: WeightResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>('functionName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Format large numbers for display
  const formatLargeNumber = (value: number): string => {
    if (value === 0) return '0';
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(2)}B`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(2)}K`;
    }
    return value.toString();
  };

  // Sort results
  const sortedResults = [...results].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortField) {
      case 'functionName':
        aValue = a.functionName.toLowerCase();
        bValue = b.functionName.toLowerCase();
        break;
      case 'refTime':
        aValue = a.pvm.refTime;
        bValue = b.pvm.refTime;
        break;
      case 'proofSize':
        aValue = a.pvm.proofSize;
        bValue = b.pvm.proofSize;
        break;
      case 'storageDeposit':
        aValue = a.pvm.storageDeposit;
        bValue = b.pvm.storageDeposit;
        break;
      case 'evmGasEstimate':
        aValue = a.evmGasEstimate;
        bValue = b.evmGasEstimate;
        break;
      default:
        aValue = a.functionName;
        bValue = b.functionName;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-gray-900 dark:text-white" />
    ) : (
      <ArrowDown className="h-4 w-4 text-gray-900 dark:text-white" />
    );
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Function Name',
      'Function Signature',
      'Ref Time (ps)',
      'Proof Size (bytes)',
      'Storage Deposit (planck)',
      'EVM Gas Estimate',
    ];

    const rows = sortedResults.map((result) => [
      result.functionName,
      result.functionSignature,
      result.pvm.refTime.toString(),
      result.pvm.proofSize.toString(),
      result.pvm.storageDeposit.toString(),
      result.evmGasEstimate.toString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `profiler-results-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Weight Results
        </h3>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-900">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('functionName')}
              >
                <div className="flex items-center gap-2">
                  Function
                  {getSortIcon('functionName')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('refTime')}
              >
                <div className="flex items-center gap-2">
                  Ref Time (ps)
                  {getSortIcon('refTime')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('proofSize')}
              >
                <div className="flex items-center gap-2">
                  Proof Size (bytes)
                  {getSortIcon('proofSize')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('storageDeposit')}
              >
                <div className="flex items-center gap-2">
                  Storage Deposit
                  {getSortIcon('storageDeposit')}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('evmGasEstimate')}
              >
                <div className="flex items-center gap-2">
                  EVM Gas
                  {getSortIcon('evmGasEstimate')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((result, index) => (
              <tr
                key={index}
                className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  <div>
                    <div className="font-medium">{result.functionName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate max-w-xs">
                      {result.functionSignature}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {formatLargeNumber(result.pvm.refTime)}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {formatLargeNumber(result.pvm.proofSize)}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {formatLargeNumber(result.pvm.storageDeposit)}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {formatLargeNumber(result.evmGasEstimate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedResults.length === 0 && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No results available
        </div>
      )}
    </div>
  );
}
