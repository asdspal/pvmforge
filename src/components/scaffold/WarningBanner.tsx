import type { AnalysisIssue } from '@/lib/scaffold/types';

interface WarningBannerProps {
  issues: AnalysisIssue[];
}

export function WarningBanner({ issues }: WarningBannerProps) {
  const getSeverityConfig = (severity: AnalysisIssue['severity']) => {
    switch (severity) {
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-500',
          title: 'text-red-800',
          message: 'text-red-700',
          iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-500',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-500',
          title: 'text-blue-800',
          message: 'text-blue-700',
          iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        };
    }
  };

  // Group issues by severity
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');

  if (issues.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-4">
      {errors.length > 0 && (
        <div className="rounded-lg border p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h4 className="font-medium text-red-800">
                {errors.length} Error{errors.length > 1 ? 's' : ''} Found
              </h4>
              <ul className="mt-2 space-y-1">
                {errors.map((issue, idx) => (
                  <li key={idx} className="text-sm text-red-700">
                    <span className="font-mono text-xs bg-red-100 px-1.5 py-0.5 rounded mr-2">
                      {issue.code}
                    </span>
                    {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="rounded-lg border p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h4 className="font-medium text-yellow-800">
                {warnings.length} Warning{warnings.length > 1 ? 's' : ''}
              </h4>
              <ul className="mt-2 space-y-1">
                {warnings.map((issue, idx) => (
                  <li key={idx} className="text-sm text-yellow-700">
                    <span className="font-mono text-xs bg-yellow-100 px-1.5 py-0.5 rounded mr-2">
                      {issue.code}
                    </span>
                    {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {infos.length > 0 && (
        <div className="rounded-lg border p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h4 className="font-medium text-blue-800">
                {infos.length} Info{infos.length > 1 ? 's' : ''}
              </h4>
              <ul className="mt-2 space-y-1">
                {infos.map((issue, idx) => (
                  <li key={idx} className="text-sm text-blue-700">
                    <span className="font-mono text-xs bg-blue-100 px-1.5 py-0.5 rounded mr-2">
                      {issue.code}
                    </span>
                    {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
