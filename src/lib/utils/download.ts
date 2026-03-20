import JSZip from 'jszip';

export interface ScaffoldFiles {
  contract: string;
  hardhatConfig: string;
  deployScript: string;
  readme: string;
}

export async function downloadScaffoldZip(contractName: string, files: ScaffoldFiles): Promise<void> {
  const zip = new JSZip();
  
  // Add files to the ZIP with proper directory structure
  zip.file(`contracts/${contractName}.sol`, files.contract);
  zip.file('hardhat.config.ts', files.hardhatConfig);
  zip.file('scripts/deploy.ts', files.deployScript);
  zip.file('README.md', files.readme);
  
  // Generate the ZIP blob
  const blob = await zip.generateAsync({ type: 'blob' });
  
  // Create a download link and trigger the download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${contractName}-pvm-scaffold.zip`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
