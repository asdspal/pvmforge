'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { ScaffoldResult } from '@/lib/scaffold/types';
import { ActionBar } from './ActionBar';

// Dynamic import of Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface OutputPanelProps {
  result: ScaffoldResult;
  activeTab: 'contract' | 'hardhatConfig' | 'deployScript' | 'readme';
  onTabChange: (tab: 'contract' | 'hardhatConfig' | 'deployScript' | 'readme') => void;
  onCopy: () => void;
  onDownload: () => void;
  onDownloadZip?: () => void;
}

const TABS = [
  { id: 'contract' as const, label: 'Solidity', language: 'solidity' },
  { id: 'hardhatConfig' as const, label: 'hardhat.config', language: 'typescript' },
  { id: 'deployScript' as const, label: 'deploy.ts', language: 'typescript' },
  { id: 'readme' as const, label: 'README', language: 'markdown' },
];

export function OutputPanel({ result, activeTab, onTabChange, onCopy, onDownload, onDownloadZip }: OutputPanelProps) {
  const [editorHeight, setEditorHeight] = useState(500);

  const currentTab = TABS.find(t => t.id === activeTab);
  const content = result.files[activeTab];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 bg-gray-50">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-4 py-2 text-sm font-medium border-b-2 transition-colors
              ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600 bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="relative">
        <ActionBar onCopy={onCopy} onDownload={onDownload} onDownloadZip={onDownloadZip} />
        <div style={{ height: `${editorHeight}px` }}>
          {currentTab && (
            <Editor
              height="100%"
              language={currentTab.language}
              value={content}
              theme="vs-light"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
              }}
              loading={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              }
            />
          )}
        </div>
      </div>

      {/* Resize handle */}
      <div
        className="h-1 bg-gray-200 hover:bg-blue-400 cursor-row-resize transition-colors"
        onDoubleClick={() => setEditorHeight(editorHeight === 500 ? 700 : 500)}
      />
    </div>
  );
}
