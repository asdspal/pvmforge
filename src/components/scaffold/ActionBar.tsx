import { Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ActionBarProps {
  onCopy: () => void;
  onDownload: () => void;
  disabled?: boolean;
}

export function ActionBar({ onCopy, onDownload, disabled = false }: ActionBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2">
      <button
        onClick={handleCopy}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy
          </>
        )}
      </button>
      <button
        onClick={onDownload}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Download className="w-4 h-4" />
        Download
      </button>
      <div className="flex-1" />
      <span className="text-xs text-gray-500">
        {disabled ? 'No content' : 'Ready'}
      </span>
    </div>
  );
}
