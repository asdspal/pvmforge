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

export interface WeightChartData {
  functionName: string;
  refTime: number;
  proofSize: number;
  storageDeposit: number;
}

interface WeightStackedBarChartProps {
  data: WeightChartData[];
}

export function WeightStackedBarChart({ data }: WeightStackedBarChartProps) {
  // Format numbers for display
  const formatNumber = (value: number): string => {
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

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                <span className="font-medium">{entry.name}:</span>{' '}
                {formatNumber(entry.value)}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Find max value for Y axis scaling
  const maxValue = Math.max(
    ...data.map((d) => d.refTime + d.proofSize + d.storageDeposit)
  );

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
            tickFormatter={formatNumber}
            className="text-xs text-gray-600 dark:text-gray-400"
            domain={[0, maxValue * 1.1]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ paddingBottom: '10px' }}
          />
          <Bar
            dataKey="refTime"
            name="Ref Time (ps)"
            stackId="weight"
            fill="#3b82f6"
          />
          <Bar
            dataKey="proofSize"
            name="Proof Size (bytes)"
            stackId="weight"
            fill="#10b981"
          />
          <Bar
            dataKey="storageDeposit"
            name="Storage Deposit (planck)"
            stackId="weight"
            fill="#f59e0b"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
