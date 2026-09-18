'use client';

import { useState } from 'react';
import { ExportSidebar, type ExportSettings, type ExportStage } from '@/components/export/ExportSidebar';
import { ExportPreview } from '@/components/export/ExportPreview';
import { useDraftStore } from '@/stores/useDraftStore';
import { useCanonStore } from '@/stores/useCanonStore';
import { runMockExportProgress } from '@/lib/exportMock';
import { buildExportedPdf } from '@/lib/exportPdf';

const SAMPLE_PDF_URL = '/samples/Lore_Friendly_Sample.pdf';

export default function ExportPage() {
  const project = useDraftStore((s) => s.project);
  const confirmedSettings = useCanonStore((s) => s.confirmedSettings);

  const [settings, setSettings] = useState<ExportSettings>({
    scope: 'PROJECT',
    includeCover: true,
    title: project.title,
    author: project.author,
    includeToc: true,
    paperSize: 'A5',
    fontFamily: 'nanum-myeongjo',
    fontSize: 11,
    lineHeight: 1.8,
    newPagePerChapter: true,
  });

  const [stage, setStage] = useState<ExportStage>('idle');
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileSizeLabel, setFileSizeLabel] = useState<string | null>(null);
  const [generatedWithCount, setGeneratedWithCount] = useState(-1);

  const triggerDownload = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Lore_Friendly_Sample.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const generate = async () => {
    setStage('generating');
    setProgressPercent(0);
    await runMockExportProgress((percent, page) => {
      setProgressPercent(percent);
      setCurrentPage(page);
    });

    const blob = await buildExportedPdf(SAMPLE_PDF_URL, confirmedSettings);
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    setFileSizeLabel(`${(blob.size / (1024 * 1024)).toFixed(1)}MB`);
    setGeneratedWithCount(confirmedSettings.length);
    setStage('complete');
    triggerDownload(url);
  };

  const handleRedownload = async () => {
    if (confirmedSettings.length !== generatedWithCount) {
      await generate();
      return;
    }
    if (blobUrl) triggerDownload(blobUrl);
  };

  return (
    <div className="flex h-full flex-col lg:flex-row">
      <ExportSidebar
        projectTitle={project.title}
        settings={settings}
        onChange={(patch) => setSettings((s) => ({ ...s, ...patch }))}
        stage={stage}
        progressPercent={progressPercent}
        currentPage={currentPage}
        fileSizeLabel={fileSizeLabel}
        onDownload={generate}
        onRedownload={handleRedownload}
      />
      <div className="min-h-0 flex-1">
        <ExportPreview settings={settings} />
      </div>
    </div>
  );
}
