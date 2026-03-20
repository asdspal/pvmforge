'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface EVMComparisonChartData {
  functionName: string;
  pvmPercentage: number;
  evmPercentage: number;
  refTime: number;
  evmGas: number;
}

interface EVMComparisonChartProps {
  data: EVMComparisonChartData[];
}

export function EVMComparisonChart({ data }: EVMComparisonChartProps) {
  // Custom tooltip showing both percentage and raw values
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pvmData = payload.find((p: any) => p.name === 'PVM');
      const evmData = payload.find((p: any) => p.name === 'EVM');

      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-3">{label}</p>
          <div className="space-y-2">
            {pvmData && (
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  PVM (Ref Time)
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {pvmData.value.toFixed(1)}% ({formatLargeNumber(pvmData.payload.refTime)} ps)
                </p>
              </div>
            )}
            {evmData && (
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  EVM (Gas)
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {evmData.value.toFixed(1)}% ({formatLargeNumber(evmData.payload.evmGas)} units)
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Format large numbers for display
  const formatLargeNumber = (value: number): string => {
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

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="functionName"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <YAxis
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ paddingBottom: '10px' }}
          />
          <Bar dataKey="pvmPercentage" name="PVM" fill="#3b82f6" />
          <Bar dataKey="evmPercentage" name="EVM" fill="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
