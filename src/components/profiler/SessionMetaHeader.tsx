'use client';

import { Clock, Network, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface SessionMetaHeaderProps {
  sessionId: string;
  contractAddress: string;
  network: string;
  status: 'pending' | 'complete' | 'failed';
  createdAt?: Date;
}

export function SessionMetaHeader({
  sessionId,
  contractAddress,
  network,
  status,
  createdAt,
}: SessionMetaHeaderProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Processing';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Weight Profiling Results
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700">
              {getStatusIcon()}
              <span className="capitalize">{getStatusText()}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Network className="h-4 w-4" />
              <span className="font-medium">Network:</span>
              <span className="text-gray-900 dark:text-white">{network}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Session ID:</span>
              <span className="text-gray-900 dark:text-white font-mono text-xs">
                {truncateAddress(sessionId)}
              </span>
            </div>

            {createdAt && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Created:</span>
                <span className="text-gray-900 dark:text-white">
                  {formatDate(createdAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Contract:</span>
          </div>
          <a
            href={`https://sepolia.etherscan.io/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:underline"
          >
            {truncateAddress(contractAddress)}
          </a>
        </div>
      </div>
    </div>
  );
}
